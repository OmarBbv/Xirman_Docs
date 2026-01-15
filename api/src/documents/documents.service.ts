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
  ) { }

  // Fayl formatını təyin et
  private getFileFormat(extension: string): FileFormat {
    const ext = extension.toLowerCase();
    if (ext === 'pdf') return FileFormat.PDF;
    if (['doc', 'docx'].includes(ext)) return FileFormat.WORD;
    if (['xls', 'xlsx'].includes(ext)) return FileFormat.EXCEL;
    return FileFormat.OTHER;
  }

  // Sənəd yüklə
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

    // İlk versiyanı yarat (v1)
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

  // Bütün sənədləri gətir (filtrləmə ilə)
  async findAll(filterDto: FilterDocumentDto): Promise<{
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
    } = filterDto;

    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.updatedBy', 'updatedBy')
      .orderBy('document.uploadedAt', 'DESC');

    // Şirkət adı üzrə axtarış
    if (companyName) {
      queryBuilder.andWhere('document.companyName ILIKE :companyName', {
        companyName: `%${companyName}%`,
      });
    }

    // Məbləğ filtrləri
    if (minAmount !== undefined) {
      queryBuilder.andWhere('document.amount >= :minAmount', { minAmount });
    }
    if (maxAmount !== undefined) {
      queryBuilder.andWhere('document.amount <= :maxAmount', { maxAmount });
    }

    // Sənəd növü
    if (documentType) {
      queryBuilder.andWhere('document.documentType = :documentType', { documentType });
    }

    // Fayl formatı
    if (fileFormat) {
      queryBuilder.andWhere('document.fileFormat = :fileFormat', { fileFormat });
    }

    // Tarix aralığı
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

    // Pagination
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

  // Statistikaları gətir
  async getStats() {
    const total = await this.documentRepository.count();

    // Toplam məbləğ
    const { sum } = await this.documentRepository
      .createQueryBuilder('document')
      .select('SUM(document.amount)', 'sum')
      .getRawOne();

    // Formatlara görə saylar
    const pdfCount = await this.documentRepository.count({ where: { fileFormat: FileFormat.PDF } });
    const wordCount = await this.documentRepository.count({ where: { fileFormat: FileFormat.WORD } });
    const excelCount = await this.documentRepository.count({ where: { fileFormat: FileFormat.EXCEL } });
    const otherCount = total - (pdfCount + wordCount + excelCount);

    // Son 24 saatda aktiv istifadəçilər (sənəd baxanlar)
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

  // Son aktivlikləri gətir
  async getRecentActivities(limit: number = 5) {
    return this.documentViewRepository.find({
      order: { viewedAt: 'DESC' },
      take: limit,
      relations: ['viewedBy', 'document'],
    });
  }

  // Tək sənəd gətir
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

  // Sənəd baxış qeyd et
  async recordView(documentId: number, user: User): Promise<DocumentView> {
    const document = await this.findOne(documentId);
    const userId = user['userId'] || user.id;

    const view = this.documentViewRepository.create({
      document,
      documentId: document.id,
      viewedBy: { id: userId } as User,
      viewedById: userId,
    });

    return this.documentViewRepository.save(view);
  }

  // Sənəd baxış tarixçəsi
  async getViewHistory(documentId: number, search?: string): Promise<DocumentView[]> {
    await this.findOne(documentId); // Sənədin mövcudluğunu yoxla

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

  // Sənəd yenilə
  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<Document> {
    const document = await this.findOne(id);
    const userId = user['userId'] || user.id;

    // Əgər yeni fayl varsa - VERSİYALAMA
    if (file) {
      // 1. Mövcud versiyaların sayını yoxla
      const count = await this.documentVersionRepository.count({ where: { documentId: id } });

      // Əgər heç versiya yoxdursa (köhnə datalar), cari halı v1 kimi saxla
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

      // Növbəti versiya nömrəsi
      const nextVer = count === 0 ? 2 : count + 1;

      // 2. YENİ faylı növbəti versiya kimi əlavə et
      // Burada prinsipimiz "Document" həmişə ən son versiyanı göstərir.
      // Amma tarixçədə bütün versiyalar olmalıdır (ən son da daxil olmaqla).
      // Yəni yeni faylı həm Document-ə, həm də DocumentVersion-a (v2) yazırıq.

      const newFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const newExtension = path.extname(file.originalname).toLowerCase().replace('.', '');

      // Versiya cədvəlinə əlavə et (V2, V3...)
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

      // Document obyektini yenilə (ən son)
      document.fileName = newFileName;
      document.filePath = file.path;
      document.fileSize = file.size;
      document.fileExtension = newExtension;
      document.fileFormat = this.getFileFormat(newExtension);
    }

    // Metadata yeniləmələri
    if (updateDocumentDto.companyName) document.companyName = updateDocumentDto.companyName;
    if (updateDocumentDto.amount) document.amount = updateDocumentDto.amount;
    if (updateDocumentDto.documentType) document.documentType = updateDocumentDto.documentType;
    if (updateDocumentDto.documentDate) document.documentDate = new Date(updateDocumentDto.documentDate);

    // Yeniləyən istifadəçi
    document.updatedBy = { id: userId } as User;
    document.updatedById = userId;

    return this.documentRepository.save(document);
  }

  // Versiyaları gətir
  async getVersions(id: number): Promise<DocumentVersion[]> {
    return this.documentVersionRepository.find({
      where: { documentId: id },
      order: { version: 'DESC' }, // Ən yeni yuxarıda
      relations: ['createdBy'],
    });
  }

  // Sənəd sil
  async remove(id: number): Promise<{ message: string }> {
    const document = await this.findOne(id);

    // 1. Əsas faylı sil
    if (document.filePath && fs.existsSync(document.filePath)) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (e) {
        console.error(`Əsas faylı silərkən xəta: ${e.message}`);
      }
    }

    // 2. Bütün versiya fayllarını sil
    const versions = await this.documentVersionRepository.find({ where: { documentId: id } });

    for (const version of versions) {
      // Eyni fayl ola bilər (məsələn ən son versiya ilə main document), ona görə yenə yoxlayırıq
      if (version.filePath && fs.existsSync(version.filePath)) {
        try {
          fs.unlinkSync(version.filePath);
        } catch (e) {
          // Fayl artıq silinib (məsələn main document tərəfindən)
          console.error(`Versiya faylını silərkən xəta (${version.version}): ${e.message}`);
        }
      }
    }

    await this.documentRepository.remove(document);

    return { message: 'Sənəd və bütün faylları uğurla silindi' };
  }

  // İstifadəçinin sənədləri
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

    // Pagination
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

  // Versiya faylını tap
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
}
