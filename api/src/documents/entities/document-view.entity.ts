import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Document } from './document.entity';

@Entity('document_views')
export class DocumentView {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Document, (document) => document.views, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id' })
  documentId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'viewed_by_id' })
  viewedBy: User;

  @Column({ name: 'viewed_by_id' })
  viewedById: number;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt: Date;
}
