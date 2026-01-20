import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { FileFormat } from '../enums/document-enums';

@Entity('document_attachments')
export class DocumentAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Document, (document) => document.attachments, {
    onDelete: 'CASCADE',
  })
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

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
