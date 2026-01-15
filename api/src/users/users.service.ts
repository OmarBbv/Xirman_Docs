import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserPosition } from './entities/user.entity';

import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...rest } = createUserDto;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      const user = this.usersRepository.create({
        ...rest,
        password: hashedPassword,
        otpCode: otpCode,
        isVerified: false,
      });

      const savedUser = await this.usersRepository.save(user);
      await this.mailService.sendOtpEmail(savedUser.email, otpCode);

      return savedUser;
    } catch (error) {
      console.error('Registration Error Details:', error);
      if (error.code === '23505') {
        throw new ConflictException('Bu email adresi ilə artıq qeydiyyatdan keçilib');
      }
      throw new BadRequestException('İstifadəçi yaradılanda xəta baş verdi');
    }
  }

  async createByAdmin(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...rest } = createUserDto;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = this.usersRepository.create({
        ...rest,
        password: hashedPassword,
        isVerified: true,
        otpCode: null,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Bu email adresi ilə artıq qeydiyyatdan keçilib');
      }
      throw new BadRequestException('İstifadəçi yaradılanda xəta baş verdi');
    }
  }

  async verifyOtp(email: string, code: string): Promise<User> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new BadRequestException('İstifadəçi tapılmadı');
    }

    if (user.otpCode !== code) {
      throw new BadRequestException('Yanlış OTP kodu');
    }

    user.isVerified = true;
    user.otpCode = null;

    return this.usersRepository.save(user);
  }

  async generateForgotPasswordOtp(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Bu email adresi ilə istifadəçi tapılmadı');
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[ForgotPassword] New OTP generated for ${email}: ${otpCode}`);

    // Update only the OTP code directly
    await this.usersRepository.update(user.id, { otpCode });

    // Send email (after DB update)
    await this.mailService.sendOtpEmail(user.email, otpCode);
  }

  async verifyOtpForReset(email: string, code: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('İstifadəçi tapılmadı');
    }

    console.log(`[VerifyReset] Checking OTP for ${email}. Expected: ${user.otpCode}, Received: ${code}`);

    if (user.otpCode !== code) {
      throw new BadRequestException('Yanlış OTP kodu');
    }
    return true;
  }

  async resetPassword(email: string, code: string, newPass: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('İstifadəçi tapılmadı');
    }
    if (user.otpCode !== code) {
      throw new BadRequestException('Yanlış OTP kodu');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPass, salt);

    await this.usersRepository.update(user.id, {
      password: hashedPassword,
      otpCode: null
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findAll(search?: string, role?: string) {
    if (search) {
      if (role) {
        return this.usersRepository.find({
          where: [
            { role, firstName: Like(`%${search}%`) },
            { role, lastName: Like(`%${search}%`) },
            { role, email: Like(`%${search}%`) },
          ]
        });
      } else {
        return this.usersRepository.find({
          where: [
            { firstName: Like(`%${search}%`) },
            { lastName: Like(`%${search}%`) },
            { email: Like(`%${search}%`) },
          ]
        });
      }
    }

    return this.usersRepository.find({ where: role ? { role } : {} });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }

  async seedAdmin() {
    const adminEmail = 'admin@xirman.az';
    const adminExists = await this.findByEmail(adminEmail);

    if (!adminExists) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const admin = this.usersRepository.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: hashedPassword,
        position: UserPosition.DIRECTOR,
        role: 'admin',
        isVerified: true,
      });

      await this.usersRepository.save(admin);
      console.log('Admin hesabı yaradıldı: admin@xirman.az / admin123');
    } else {
      console.log('Admin hesabı mövcuddur.');
    }
  }
}
