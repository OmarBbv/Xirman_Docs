import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ALL_PERMISSIONS } from '../permissions';
import { Department, DocumentType } from '../../documents/enums/document-enums';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'Rol açarı yalnız kiçik hərf, rəqəm və alt xətdən ibarət ola bilər',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  displayName: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsArray()
  @IsIn(ALL_PERMISSIONS, { each: true })
  permissions?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(Object.values(Department), { each: true })
  allowedDepartments?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(Object.values(DocumentType), { each: true })
  allowedDocumentTypes?: string[];

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}
