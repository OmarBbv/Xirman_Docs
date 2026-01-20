import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/document.entity';
import { DocumentView } from './entities/document-view.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentRead } from './entities/document-read.entity';
import { DocumentAttachment } from './entities/document-attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentView, DocumentVersion, DocumentRead, DocumentAttachment]),
    MulterModule.register({
      dest: './uploads/documents',
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule { }
