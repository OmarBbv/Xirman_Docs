import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rolesService: RolesService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Zəhmət olmasa email ünvanınızı təsdiqləyin',
        );
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      position: user.position,
    };

    const role = await this.rolesService.findByName(user.role);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        position: user.position,
        role: user.role,
        roleDisplayName: role?.displayName ?? user.role,
        permissions: role?.permissions ?? [],
        allowedDepartments: role?.allowedDepartments ?? [],
        allowedDocumentTypes: role?.allowedDocumentTypes ?? [],
      },
    };
  }
}
