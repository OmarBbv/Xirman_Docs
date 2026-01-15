import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    // LocalStrategy validates the user and puts it in req.user
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'OTP kodu email ünvanınıza göndərildi',
      email: user.email,
      otpCode: user.otpCode, // Müvəqqəti olaraq test üçün kodu bura əlavə edirik
    };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyDto: { email: string; code: string }) {
    const user = await this.usersService.verifyOtp(verifyDto.email, verifyDto.code);
    return this.authService.login(user); // Təsdiqləndikdən sonra avtomatik login edirik
  }
}
