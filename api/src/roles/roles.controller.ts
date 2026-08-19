import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from './permissions';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
// Layihədə qlobal ValidationPipe yoxdur — rol DTO-ları burada yoxlanılır.
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** İcazə/şöbə/sənəd növü kataloqu — rol formasını doldurmaq üçün. */
  @Get('catalog')
  @Permissions(PERMISSIONS.ROLES_VIEW, PERMISSIONS.ROLES_MANAGE)
  getCatalog() {
    return this.rolesService.getCatalog();
  }

  @Get()
  @Permissions(PERMISSIONS.ROLES_VIEW, PERMISSIONS.ROLES_MANAGE)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions(PERMISSIONS.ROLES_VIEW, PERMISSIONS.ROLES_MANAGE)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Permissions(PERMISSIONS.ROLES_MANAGE)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.ROLES_MANAGE)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any,
  ) {
    return this.rolesService.update(id, updateRoleDto, req.user);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.ROLES_MANAGE)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
