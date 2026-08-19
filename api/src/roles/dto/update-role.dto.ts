import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';

/** Rolun açarı (name) yaradıldıqdan sonra dəyişdirilmir. */
export class UpdateRoleDto extends PartialType(
  OmitType(CreateRoleDto, ['name', 'isSystem'] as const),
) {}
