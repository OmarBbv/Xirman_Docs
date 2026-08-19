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
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Req,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, FilterDocumentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../roles/permissions';
import { documentUploadOptions } from './config/file-upload.config';

@Controller('documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(PERMISSIONS.DOCUMENTS_VIEW)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Permissions(PERMISSIONS.DOCUMENTS_CREATE)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10, documentUploadOptions))
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() req: any,
  ) {
    return this.documentsService.create(createDocumentDto, files, req.user);
  }

  @Get()
  async findAll(@Query() filterDto: FilterDocumentDto, @Req() req: any) {
    return this.documentsService.findAll(filterDto, req.user);
  }

  @Get('my')
  async findMyDocuments(
    @Query() filterDto: FilterDocumentDto,
    @Req() req: any,
  ) {
    return this.documentsService.findByUser(req.user.id, filterDto);
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.documentsService.getStats(req.user);
  }

  @Get('activities')
  async getRecentActivities(@Req() req: any) {
    return this.documentsService.getRecentActivities(5, req.user);
  }

  @Get('years')
  async getYears(@Req() req: any) {
    return this.documentsService.getDocumentYears(req.user);
  }

  @Get('years/:year/companies')
  async getCompaniesByYear(
    @Param('year', ParseIntPipe) year: number,
    @Req() req: any,
  ) {
    return this.documentsService.getCompaniesByYear(year, req.user);
  }

  @Get('years/:year/departments')
  async getDepartmentsByYear(
    @Param('year', ParseIntPipe) year: number,
    @Req() req: any,
  ) {
    return this.documentsService.getDepartmentsByYear(year, req.user);
  }

  @Get('years/:year/departments/:department/types')
  async getDocumentTypesInDepartment(
    @Param('year', ParseIntPipe) year: number,
    @Param('department') department: string,
    @Req() req: any,
  ) {
    return this.documentsService.getDocumentTypesInDepartment(
      year,
      department,
      req.user,
    );
  }

  @Permissions(PERMISSIONS.DOCUMENTS_DOWNLOAD)
  @Get('attachments/:id/download')
  async downloadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const { filePath, fileName } =
      await this.documentsService.getAttachmentFile(id, req.user);
    res.download(filePath, fileName);
  }

  @Permissions(PERMISSIONS.DOCUMENTS_UPDATE)
  @Patch('attachments/:id')
  @UseInterceptors(FileInterceptor('file', documentUploadOptions))
  async updateAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.documentsService.updateAttachment(id, file, req.user);
  }

  @Permissions(PERMISSIONS.DOCUMENTS_UPDATE)
  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file', documentUploadOptions))
  async addAttachment(
    @Param('id', ParseIntPipe) documentId: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.documentsService.addAttachment(documentId, file, req.user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const document = await this.documentsService.findOne(id);
    this.documentsService.assertRoleScope(document, req.user);
    this.documentsService
      .recordView(id, req.user)
      .catch((err) => console.error('View record error:', err));

    return document;
  }

  @Permissions(PERMISSIONS.DOCUMENTS_DOWNLOAD)
  @Get(':id/download')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const document = await this.documentsService.findOne(id);
    this.documentsService.assertRoleScope(document, req.user);

    await this.documentsService
      .recordView(id, req.user)
      .catch((err) => console.error('View record error:', err));

    const filePath = path.resolve(document.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fayl tapılmadı' });
    }

    res.download(filePath, document.fileName);
  }

  @Permissions(PERMISSIONS.DOCUMENTS_DOWNLOAD)
  @Get(':id/download-zip')
  async downloadZip(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    this.documentsService.assertRoleScope(
      await this.documentsService.findOne(id),
      req.user,
    );

    const { zipPath, zipFileName } =
      await this.documentsService.createSingleDocumentZip(id);

    res.download(zipPath, zipFileName, (err) => {
      if (!err) {
        setTimeout(() => {
          try {
            fs.unlinkSync(zipPath);
          } catch (e) {
            console.error('Error deleting temp zip:', e);
          }
        }, 5000);
      }
    });
  }

  @Get(':id/views')
  async getViewHistory(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Query('search') search?: string,
  ) {
    return this.documentsService.getViewHistory(id, search, req.user);
  }

  @Permissions(PERMISSIONS.DOCUMENTS_UPDATE)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', documentUploadOptions))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.documentsService.update(id, updateDocumentDto, req.user, file);
  }

  @Get(':id/versions')
  async getVersions(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.documentsService.getVersions(id, req.user);
  }

  @Permissions(PERMISSIONS.DOCUMENTS_DOWNLOAD)
  @Get('versions/:id/download')
  async downloadVersion(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const { filePath, fileName } =
      await this.documentsService.getVersionFile(id, req.user);

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('File download error:', err);
        if (!res.headersSent) {
          res.status(500).send('Fayl yüklənərkən xəta baş verdi');
        }
      }
    });
  }

  @Permissions(PERMISSIONS.DOCUMENTS_DELETE)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const document = await this.documentsService.findOne(id);
    this.documentsService.assertRoleScope(document, req.user);
    return this.documentsService.remove(id);
  }

  @Post(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.documentsService.markAsRead(id, req.user);
  }

  @Permissions(PERMISSIONS.DOCUMENTS_DOWNLOAD)
  @Post(':id/share')
  async getShareLink(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.documentsService.getPublicShareLink(id, req.user);
  }

  @Permissions(PERMISSIONS.DOCUMENTS_DOWNLOAD)
  @Post('bulk-download')
  async bulkDownload(
    @Body('ids') ids: number[],
    @Res() res: Response,
    @Req() req: any,
  ) {
    const { zipPath, zipFileName } =
      await this.documentsService.createBulkDownloadZip(ids, req.user);

    res.download(zipPath, zipFileName, (err) => {
      if (err) {
        console.error('Bulk download error:', err);
        if (!res.headersSent) {
          res.status(500).send('Fayllar yüklənərkən xəta baş verdi');
        }
      }
      fs.unlink(zipPath, (unlinkErr) => {
        if (unlinkErr) console.error('Failed to delete temp zip:', unlinkErr);
      });
    });
  }
}
