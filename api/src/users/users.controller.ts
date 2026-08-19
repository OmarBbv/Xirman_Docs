import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../roles/permissions';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions(PERMISSIONS.USERS_MANAGE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('admin')
  @Permissions(PERMISSIONS.USERS_MANAGE)
  createByAdmin(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createByAdmin(createUserDto);
  }

  @Get()
  @Permissions(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE)
  findAll(@Query('search') search?: string, @Query('role') role?: string) {
    return this.usersService.findAll(search, role);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.USERS_MANAGE)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.USERS_MANAGE)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
