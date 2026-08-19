import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserPosition } from './entities/user.entity';

import { MailService } from '../mail/mail.service';
import { RolesService } from '../roles/roles.service';
import { SYSTEM_ROLES } from '../roles/permissions';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService,
    private rolesService: RolesService,
  ) {}

  /**
   * Rol açarının mövcudluğunu yoxlayır və eskalasiyanın qarşısını alır:
   * yalnız admin `admin` rolunu təyin edə bilər.
   */
  private async resolveRole(role?: string, actor?: any): Promise<string> {
    if (!role) {
      return SYSTEM_ROLES.USER;
    }
    const found = await this.rolesService.findByName(role);
    if (!found) {
      throw new BadRequestException(`"${role}" adlı rol tapılmadı`);
    }

    const isAdmin = !actor || actor.role === SYSTEM_ROLES.ADMIN;
    if (!isAdmin && found.name === SYSTEM_ROLES.ADMIN) {
      throw new ForbiddenException('Admin rolunu yalnız admin təyin edə bilər');
    }

    return found.name;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, role, ...rest } = createUserDto;
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Açıq qeydiyyatda rol seçilə bilməz — həmişə standart istifadəçi.
      const user = this.usersRepository.create({
        ...rest,
        role: SYSTEM_ROLES.USER,
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
        throw new ConflictException(
          'Bu email adresi ilə artıq qeydiyyatdan keçilib',
        );
      }
      throw new BadRequestException('İstifadəçi yaradılanda xəta baş verdi');
    }
  }

  async createByAdmin(createUserDto: CreateUserDto, actor?: any): Promise<User> {
    const { password, role, ...rest } = createUserDto;
    // Rol yoxlaması try-dan kənardadır ki, konkret xəta mesajı itməsin.
    const resolvedRole = await this.resolveRole(role, actor);

    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = this.usersRepository.create({
        ...rest,
        role: resolvedRole,
        password: hashedPassword,
        isVerified: true,
        otpCode: null,
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Bu email adresi ilə artıq qeydiyyatdan keçilib',
        );
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

    await this.usersRepository.update(user.id, { otpCode });

    await this.mailService.sendOtpEmail(user.email, otpCode);
  }

  async verifyOtpForReset(email: string, code: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException('İstifadəçi tapılmadı');
    }

    if (user.otpCode !== code) {
      throw new BadRequestException('Yanlış OTP kodu');
    }
    return true;
  }

  async resetPassword(
    email: string,
    code: string,
    newPass: string,
  ): Promise<void> {
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
      otpCode: null,
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
          ],
        });
      } else {
        return this.usersRepository.find({
          where: [
            { firstName: Like(`%${search}%`) },
            { lastName: Like(`%${search}%`) },
            { email: Like(`%${search}%`) },
          ],
        });
      }
    }

    return this.usersRepository.find({ where: role ? { role } : {} });
  }

  async update(id: number, updateUserDto: UpdateUserDto, actor?: any) {
    const isAdmin = !actor || actor.role === SYSTEM_ROLES.ADMIN;

    if (updateUserDto.role) {
      // Eskalasiya qarşısı: admin olmayan öz rolunu dəyişə bilməz və
      // mövcud admin istifadəçisinə toxuna bilməz.
      if (!isAdmin) {
        if (actor.userId === id) {
          throw new ForbiddenException('Öz rolunuzu dəyişə bilməzsiniz');
        }
        const target = await this.findOne(id);
        if (target?.role === SYSTEM_ROLES.ADMIN) {
          throw new ForbiddenException('Admin istifadəçisini dəyişə bilməzsiniz');
        }
      }
      updateUserDto.role = await this.resolveRole(updateUserDto.role, actor);
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: number, actor?: any) {
    const isAdmin = !actor || actor.role === SYSTEM_ROLES.ADMIN;

    if (!isAdmin) {
      const target = await this.findOne(id);
      if (target?.role === SYSTEM_ROLES.ADMIN) {
        throw new ForbiddenException('Admin istifadəçisi silinə bilməz');
      }
    }

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
        role: SYSTEM_ROLES.ADMIN,
        isVerified: true,
      });

      await this.usersRepository.save(admin);
      console.log('Admin hesabı yaradıldı: admin@xirman.az / admin123');
    } else {
      console.log('Admin hesabı mövcuddur.');
    }
  }
}
