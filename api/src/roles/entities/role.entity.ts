import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  /** Sistem daxilində istifadə olunan açar (məs. "admin", "muhasib"). */
  @Column({ unique: true })
  name: string;

  /** İnterfeysdə göstərilən ad (məs. "Baş mühasib"). */
  @Column()
  displayName: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  /** Rolun icazələri — permissions.ts-dəki açarlar. */
  @Column({ type: 'simple-array', nullable: true })
  permissions: string[];

  /** Boşdursa — bütün şöbələr. */
  @Column({ type: 'simple-array', nullable: true })
  allowedDepartments: string[];

  /** Boşdursa — bütün sənəd növləri. */
  @Column({ type: 'simple-array', nullable: true })
  allowedDocumentTypes: string[];

  /** Sistem rolları silinə bilməz və adı dəyişdirilə bilməz. */
  @Column({ default: false })
  isSystem: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
