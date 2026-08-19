import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesService } from '../roles/roles.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {}

  /** Cari istifadəçi və onun aktual icazələri (rol dəyişdikdə yenilənir). */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req) {
    const user = await this.usersService.findOne(req.user.userId);
    const role = user ? await this.rolesService.findByName(user.role) : null;

    return {
      id: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      position: user?.position,
      role: user?.role,
      roleDisplayName: role?.displayName ?? user?.role,
      permissions: role?.permissions ?? [],
      allowedDepartments: role?.allowedDepartments ?? [],
      allowedDocumentTypes: role?.allowedDocumentTypes ?? [],
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'OTP kodu email ünvanınıza göndərildi',
      email: user.email,
    };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyDto: { email: string; code: string }) {
    const user = await this.usersService.verifyOtp(
      verifyDto.email,
      verifyDto.code,
    );
    return this.authService.login(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    await this.usersService.generateForgotPasswordOtp(body.email);
    return { message: 'OTP kodu email ünvanınıza göndərildi' };
  }

  @Post('verify-reset-otp')
  async verifyResetOtp(@Body() body: { email: string; code: string }) {
    await this.usersService.verifyOtpForReset(body.email, body.code);
    return { success: true };
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { email: string; code: string; newPass: string },
  ) {
    await this.usersService.resetPassword(body.email, body.code, body.newPass);
    return { message: 'Şifrəniz uğurla yeniləndi' };
  }
}
