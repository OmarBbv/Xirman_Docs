import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { User } from '../../users/entities/user.entity';
import { FileFormat } from '../enums/document-enums';

@Entity('document_versions')
export class DocumentVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Document, (document) => document.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id' })
  documentId: number;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ type: 'enum', enum: FileFormat, default: FileFormat.OTHER })
  fileFormat: FileFormat;

  @Column()
  fileExtension: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ default: 1 })
  version: number;

  // Versiyanı yükləyən istifadəçi
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
