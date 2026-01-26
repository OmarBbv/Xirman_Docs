import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DocumentView } from './document-view.entity';
import { DocumentVersion } from './document-version.entity';
import { DocumentAttachment } from './document-attachment.entity';
import { DocumentType, FileFormat, Department } from '../enums/document-enums';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  documentNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ type: 'date' })
  documentDate: Date;

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

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @Column({ name: 'uploaded_by_id' })
  uploadedById: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @Column({ name: 'updated_by_id', nullable: true })
  updatedById: number;

  @Column({ type: 'enum', enum: Department, nullable: true })
  department: Department;

  @Column({ type: 'simple-array', nullable: true })
  allowedPositions: string[];

  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions: DocumentVersion[];

  @OneToMany(() => DocumentView, (view) => view.document)
  views: DocumentView[];

  @OneToMany(() => DocumentAttachment, (attachment) => attachment.document, { cascade: true })
  attachments: DocumentAttachment[];

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
