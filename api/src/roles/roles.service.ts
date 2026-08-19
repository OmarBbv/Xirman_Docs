import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ALL_PERMISSIONS,
  PERMISSIONS,
  PERMISSION_GROUPS,
  SYSTEM_ROLES,
} from './permissions';
import { Department, DocumentType } from '../documents/enums/document-enums';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /** İcazə seçim ekranı üçün bütün mümkün dəyərlər. */
  getCatalog() {
    return {
      permissions: ALL_PERMISSIONS,
      groups: PERMISSION_GROUPS,
      departments: Object.values(Department),
      documentTypes: Object.values(DocumentType),
    };
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.rolesRepository.find({ order: { id: 'ASC' } });
    const counts = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany<{ role: string; count: string }>();

    const byName = new Map(counts.map((c) => [c.role, Number(c.count)]));
    return roles.map((role) => ({
      ...role,
      userCount: byName.get(role.name) ?? 0,
    })) as Role[];
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Rol tapılmadı');
    }
    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { name } });
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.findByName(createRoleDto.name);
    if (existing) {
      throw new ConflictException('Bu açar ilə rol artıq mövcuddur');
    }

    const role = this.rolesRepository.create({
      ...createRoleDto,
      permissions: createRoleDto.permissions ?? [],
      allowedDepartments: createRoleDto.allowedDepartments ?? [],
      allowedDocumentTypes: createRoleDto.allowedDocumentTypes ?? [],
      isSystem: false,
    });

    return this.rolesRepository.save(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (role.name === SYSTEM_ROLES.ADMIN) {
      throw new BadRequestException(
        'Admin rolunun icazələri dəyişdirilə bilməz',
      );
    }

    Object.assign(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('Sistem rolu silinə bilməz');
    }

    const userCount = await this.usersRepository.count({
      where: { role: role.name },
    });
    if (userCount > 0) {
      throw new BadRequestException(
        `Bu rola bağlı ${userCount} istifadəçi var. Əvvəlcə onların rolunu dəyişin.`,
      );
    }

    await this.rolesRepository.delete(id);
    return { deleted: true };
  }

  /** Tətbiq başlayarkən sistem rollarını yaradır. */
  async seedRoles(): Promise<void> {
    const defaults: CreateRoleDto[] = [
      {
        name: SYSTEM_ROLES.ADMIN,
        displayName: 'Admin',
        description: 'Bütün səlahiyyətlərə malik sistem administratoru',
        permissions: ALL_PERMISSIONS,
      },
      {
        name: SYSTEM_ROLES.USER,
        displayName: 'İstifadəçi',
        description: 'Standart istifadəçi',
        permissions: [
          PERMISSIONS.DOCUMENTS_VIEW,
          PERMISSIONS.DOCUMENTS_CREATE,
          PERMISSIONS.DOCUMENTS_DOWNLOAD,
          PERMISSIONS.NOTIFICATIONS_VIEW,
          PERMISSIONS.SETTINGS_VIEW,
        ],
      },
    ];

    for (const def of defaults) {
      const existing = await this.findByName(def.name);
      if (!existing) {
        await this.rolesRepository.save(
          this.rolesRepository.create({
            ...def,
            allowedDepartments: [],
            allowedDocumentTypes: [],
            isSystem: true,
          }),
        );
        console.log(`Rol yaradıldı: ${def.name}`);
      } else if (def.name === SYSTEM_ROLES.ADMIN) {
        // Yeni icazələr əlavə olunanda admin həmişə hamısına sahib olsun.
        existing.permissions = ALL_PERMISSIONS;
        existing.isSystem = true;
        await this.rolesRepository.save(existing);
      }
    }

    await this.seedLegacyRoles();
  }

  /**
   * Rol cədvəlindən əvvəl mövcud olan (məs. "editor") rol adları üçün
   * yazı yaradır ki, həmin istifadəçilər icazəsiz qalmasın.
   */
  private async seedLegacyRoles(): Promise<void> {
    const used = await this.usersRepository
      .createQueryBuilder('user')
      .select('DISTINCT user.role', 'role')
      .getRawMany<{ role: string }>();

    for (const { role } of used) {
      if (!role || (await this.findByName(role))) {
        continue;
      }

      await this.rolesRepository.save(
        this.rolesRepository.create({
          name: role,
          displayName: role,
          description: 'Köhnə sistemdən köçürülmüş rol',
          permissions: [
            PERMISSIONS.DOCUMENTS_VIEW,
            PERMISSIONS.DOCUMENTS_CREATE,
            PERMISSIONS.DOCUMENTS_UPDATE,
            PERMISSIONS.DOCUMENTS_DOWNLOAD,
            PERMISSIONS.NOTIFICATIONS_VIEW,
            PERMISSIONS.SETTINGS_VIEW,
          ],
          allowedDepartments: [],
          allowedDocumentTypes: [],
          isSystem: false,
        }),
      );
      console.log(`Köhnə rol köçürüldü: ${role}`);
    }
  }
}
