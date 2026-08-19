import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserPosition } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(UserPosition)
  @IsNotEmpty()
  position: UserPosition;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  /** Rol açarı (roles cədvəlindəki "name"). Boş qalarsa "user" təyin olunur. */
  @IsOptional()
  @IsString()
  role?: string;
}
