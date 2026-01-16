import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { Document } from './entities/document.entity';
import { DocumentType, FileFormat } from './enums/document-enums';
import { DocumentView } from './entities/document-view.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentRead } from './entities/document-read.entity';
import { CreateDocumentDto, UpdateDocumentDto, FilterDocumentDto } from './dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentView)
    private documentViewRepository: Repository<DocumentView>,
    @InjectRepository(DocumentVersion)
    private documentVersionRepository: Repository<DocumentVersion>,
    @InjectRepository(DocumentRead)
    private documentReadRepository: Repository<DocumentRead>,
  ) { }

  private getFileFormat(extension: string): FileFormat {
    const ext = extension.toLowerCase();
    if (ext === 'pdf') return FileFormat.PDF;
    if (['doc', 'docx'].includes(ext)) return FileFormat.WORD;
    if (['xls', 'xlsx'].includes(ext)) return FileFormat.EXCEL;
    return FileFormat.OTHER;
  }

  async create(
    createDocumentDto: CreateDocumentDto,
    file: Express.Multer.File,
    user: User,
  ): Promise<Document> {
    if (!file) {
      throw new BadRequestException('Fayl yüklənməlidir');
    }

    const fileExtension = file.originalname.split('.').pop() || '';
    const fileFormat = this.getFileFormat(fileExtension);
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const userId = user['userId'] || user.id;

    const document = this.documentRepository.create({
      ...createDocumentDto,
      fileName,
      filePath: file.path,
      fileExtension: fileExtension.toLowerCase(),
      fileFormat,
      fileSize: file.size,
      uploadedBy: { id: userId } as User,
      uploadedById: userId,
      documentDate: new Date(createDocumentDto.documentDate),
      documentType: createDocumentDto.documentType || DocumentType.OTHER,
    });

    const savedDocument = await this.documentRepository.save(document);

    const version = this.documentVersionRepository.create({
      document: savedDocument,
      documentId: savedDocument.id,
      fileName: savedDocument.fileName,
      filePath: savedDocument.filePath,
      fileSize: savedDocument.fileSize,
      fileExtension: savedDocument.fileExtension,
      fileFormat: savedDocument.fileFormat,
      version: 1,
      createdBy: { id: userId } as User,
    });

    await this.documentVersionRepository.save(version);

    return savedDocument;
  }

  async findAll(filterDto: FilterDocumentDto, user?: User): Promise<{
    data: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      companyName,
      minAmount,
      maxAmount,
      documentType,
      fileFormat,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      excludeRead,
    } = filterDto;

    const userId = user ? (user['userId'] || user.id) : null;

    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.updatedBy', 'updatedBy')
      .orderBy('document.uploadedAt', 'DESC');

    if (companyName) {
      queryBuilder.andWhere('document.companyName ILIKE :companyName', {
        companyName: `%${companyName}%`,
      });
    }

    if (minAmount !== undefined) {
      queryBuilder.andWhere('document.amount >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('document.amount <= :maxAmount', { maxAmount });
    }

    if (documentType) {
      queryBuilder.andWhere('document.documentType = :documentType', { documentType });
    }

    if (fileFormat) {
      queryBuilder.andWhere('document.fileFormat = :fileFormat', { fileFormat });
    }

    if (startDate) {
      queryBuilder.andWhere('document.documentDate >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      queryBuilder.andWhere('document.documentDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (excludeRead && userId) {
      queryBuilder.andWhere(qb => {
        const subQuery = qb.subQuery()
          .select('1')
          .from(DocumentRead, 'read')
          .where('read.documentId = document.id')
          .andWhere('read.userId = :userId')
          .getQuery();
        return 'NOT EXISTS ' + subQuery;
      }, { userId });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats() {
    const total = await this.documentRepository.count();

    const { sum } = await this.documentRepository
      .createQueryBuilder('document')
      .select('SUM(document.amount)', 'sum')
      .getRawOne();

    const pdfCount = await this.documentRepository.count({ where: { fileFormat: FileFormat.PDF } });
    const wordCount = await this.documentRepository.count({ where: { fileFormat: FileFormat.WORD } });
    const excelCount = await this.documentRepository.count({ where: { fileFormat: FileFormat.EXCEL } });
    const otherCount = total - (pdfCount + wordCount + excelCount);

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const activeUsersCount = await this.documentViewRepository
      .createQueryBuilder('view')
      .select('COUNT(DISTINCT view.viewedById)', 'count')
      .where('view.viewedAt >= :yesterday', { yesterday })
      .getRawOne();

    return {
      total,
      totalAmount: parseFloat(sum || '0'),
      pdfCount,
      wordCount,
      excelCount,
      otherCount,
      activeUsers: parseInt(activeUsersCount?.count || '0'),
    };
  }

  async getRecentActivities(limit: number = 5) {
    return this.documentViewRepository.find({
      order: { viewedAt: 'DESC' },
      take: limit,
      relations: ['viewedBy', 'document'],
    });
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['uploadedBy', 'updatedBy'],
    });

    if (!document) {
      throw new NotFoundException(`Sənəd tapılmadı: ${id}`);
    }

    return document;
  }

  async recordView(documentId: number, user: User): Promise<DocumentView> {
    const document = await this.findOne(documentId);
    const userId = user['userId'] || user.id;

    // Bildiriş kimi oxunmuş işarələ
    await this.markAsRead(documentId, user);

    const view = this.documentViewRepository.create({
      document,
      documentId: document.id,
      viewedBy: { id: userId } as User,
      viewedById: userId,
    });

    return this.documentViewRepository.save(view);
  }

  async getViewHistory(documentId: number, search?: string): Promise<DocumentView[]> {
    await this.findOne(documentId);

    const query = this.documentViewRepository
      .createQueryBuilder('view')
      .leftJoinAndSelect('view.viewedBy', 'viewedBy')
      .where('view.documentId = :documentId', { documentId })
      .orderBy('view.viewedAt', 'DESC');

    if (search) {
      query.andWhere(
        '(viewedBy.firstName ILIKE :search OR viewedBy.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return query.getMany();
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<Document> {
    const document = await this.findOne(id);
    const userId = user['userId'] || user.id;

    if (file) {
      const count = await this.documentVersionRepository.count({ where: { documentId: id } });

      if (count === 0) {
        await this.documentVersionRepository.save({
          document: document,
          documentId: document.id,
          fileName: document.fileName,
          filePath: document.filePath,
          fileSize: document.fileSize,
          fileExtension: document.fileExtension,
          fileFormat: document.fileFormat,
          version: 1,
          createdBy: document.uploadedBy,
          createdAt: document.uploadedAt,
        });
      }

      const nextVer = count === 0 ? 2 : count + 1;

      const newFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const newExtension = path.extname(file.originalname).toLowerCase().replace('.', '');

      await this.documentVersionRepository.save({
        document: document,
        documentId: document.id,
        fileName: newFileName,
        filePath: file.path,
        fileSize: file.size,
        fileExtension: newExtension,
        fileFormat: this.getFileFormat(newExtension),
        version: nextVer,
        createdBy: { id: userId } as User,
      });

      document.fileName = newFileName;
      document.filePath = file.path;
      document.fileSize = file.size;
      document.fileExtension = newExtension;
      document.fileFormat = this.getFileFormat(newExtension);
    }

    if (updateDocumentDto.companyName) document.companyName = updateDocumentDto.companyName;
    if (updateDocumentDto.documentNumber) document.documentNumber = updateDocumentDto.documentNumber;
    if (updateDocumentDto.amount) document.amount = updateDocumentDto.amount;
    if (updateDocumentDto.documentType) document.documentType = updateDocumentDto.documentType;
    if (updateDocumentDto.documentDate) document.documentDate = new Date(updateDocumentDto.documentDate);

    document.updatedBy = { id: userId } as User;
    document.updatedById = userId;

    return this.documentRepository.save(document);
  }

  async getVersions(id: number): Promise<DocumentVersion[]> {
    return this.documentVersionRepository.find({
      where: { documentId: id },
      order: { version: 'DESC' },
      relations: ['createdBy'],
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const document = await this.findOne(id);

    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (e) {
        console.error(`Əsas faylı silərkən xəta: ${e.message}`);
      }
    }

    const versions = await this.documentVersionRepository.find({ where: { documentId: id } });

    for (const version of versions) {
      if (version.filePath && fs.existsSync(version.filePath)) {
        try {
          fs.unlinkSync(version.filePath);
        } catch (e) {
          console.error(`Versiya faylını silərkən xəta (${version.version}): ${e.message}`);
        }
      }
    }

    await this.documentRepository.remove(document);

    return { message: 'Sənəd və bütün faylları uğurla silindi' };
  }

  async findByUser(userId: number, filterDto: FilterDocumentDto): Promise<{
    data: Document[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .where('document.uploadedById = :userId', { userId })
      .orderBy('document.uploadedAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVersionFile(id: number): Promise<{ filePath: string; fileName: string }> {
    const version = await this.documentVersionRepository.findOne({ where: { id } });

    if (!version) {
      throw new NotFoundException(`Versiya tapılmadı: ${id}`);
    }

    if (!fs.existsSync(version.filePath)) {
      throw new NotFoundException('Fayl sistemdə tapılmadı');
    }

    return { filePath: version.filePath, fileName: version.fileName };
  }

  async markAsRead(id: number, user: User) {
    const userId = user['userId'] || user.id;
    const exists = await this.documentReadRepository.findOne({
      where: { documentId: id, userId }
    });

    if (!exists) {
      await this.documentReadRepository.save({
        documentId: id,
        userId
      });
    }
    return { success: true };
  }

  async getPublicShareLink(id: number) {
    const document = await this.findOne(id);

    if (!document) {
      throw new NotFoundException('Sənəd tapılmadı');
    }

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/documents/${id}/download`;

    return {
      success: true,
      downloadUrl,
      document: {
        fileName: document.fileName,
        companyName: document.companyName,
        amount: document.amount,
        documentType: document.documentType,
      }
    };
  }
}
