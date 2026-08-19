import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
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
// Layihədə qlobal ValidationPipe yoxdur — DTO-lar burada yoxlanılır.
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Permissions(PERMISSIONS.USERS_MANAGE)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('admin')
  @Permissions(PERMISSIONS.USERS_MANAGE)
  createByAdmin(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    return this.usersService.createByAdmin(createUserDto, req.user);
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
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.usersService.update(+id, updateUserDto, req.user);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.USERS_MANAGE)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.usersService.remove(+id, req.user);
  }
}
