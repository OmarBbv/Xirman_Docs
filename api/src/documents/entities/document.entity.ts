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
import { DocumentType, FileFormat } from '../enums/document-enums';

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

  @Column({ type: 'enum', enum: DocumentType, default: DocumentType.OTHER })
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

  // Yeniləyən istifadəçi
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'updated_by_id' })
  updatedBy: User;

  @Column({ name: 'updated_by_id', nullable: true })
  updatedById: number;

  // Versiya tarixçəsi
  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions: DocumentVersion[];

  // Baxış tarixçəsi
  @OneToMany(() => DocumentView, (view) => view.document)
  views: DocumentView[];

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
