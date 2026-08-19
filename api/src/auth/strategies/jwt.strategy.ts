import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private rolesService: RolesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  /**
   * İcazələr token-dən deyil, bazadan oxunur — admin rolu dəyişdirdikdə
   * istifadəçinin yenidən login etməsinə ehtiyac qalmır.
   */
  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('İstifadəçi tapılmadı');
    }

    const role = await this.rolesService.findByName(user.role);

    return {
      userId: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      position: user.position,
      permissions: role?.permissions ?? [],
      allowedDepartments: role?.allowedDepartments ?? [],
      allowedDocumentTypes: role?.allowedDocumentTypes ?? [],
    };
  }
}
