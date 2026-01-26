import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

import { Document } from './entities/document.entity';
import { DocumentType, FileFormat } from './enums/document-enums';
import { DocumentView } from './entities/document-view.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentRead } from './entities/document-read.entity';
import { DocumentAttachment } from './entities/document-attachment.entity';
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
    @InjectRepository(DocumentAttachment)
    private documentAttachmentRepository: Repository<DocumentAttachment>,
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
    files: Array<Express.Multer.File>,
    user: User,
  ): Promise<Document> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Ən azı bir fayl yüklənməlidir');
    }

    const mainFile = files[0];
    const attachmentFiles = files.slice(1);

    const fileExtension = mainFile.originalname.split('.').pop() || '';

    if (createDocumentDto.allowedPositions && typeof createDocumentDto.allowedPositions === 'string') {
      createDocumentDto.allowedPositions = (createDocumentDto.allowedPositions as string).split(',');
    }
    const fileFormat = this.getFileFormat(fileExtension);
    const fileName = Buffer.from(mainFile.originalname, 'latin1').toString('utf8');
    const userId = user['userId'] || user.id;

    const document = this.documentRepository.create({
      ...createDocumentDto,
      companyName: createDocumentDto.companyName?.toUpperCase(),
      fileName,
      filePath: mainFile.path,
      fileExtension: fileExtension.toLowerCase(),
      fileFormat,
      fileSize: mainFile.size,
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

    if (attachmentFiles.length > 0) {
      for (const file of attachmentFiles) {
        const ext = file.originalname.split('.').pop() || '';
        const attachment = this.documentAttachmentRepository.create({
          document: savedDocument,
          documentId: savedDocument.id,
          fileName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
          filePath: file.path,
          fileExtension: ext.toLowerCase(),
          fileFormat: this.getFileFormat(ext),
          fileSize: file.size,
        });
        await this.documentAttachmentRepository.save(attachment);
      }
    }

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
      fileName,
      minAmount,
      maxAmount,
      documentType,
      fileFormat,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      excludeRead,
      exactCompanyMatch,
    } = filterDto;

    const userId = user ? (user['userId'] || user.id) : null;

    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.updatedBy', 'updatedBy')
      .orderBy('document.uploadedAt', 'DESC');

    if (user && user.role !== 'admin') {
      const userPosition = user.position || user['position'];
      if (userPosition) {
        queryBuilder.andWhere(new Brackets(qb => {
          qb.where("document.allowedPositions IS NULL")
            .orWhere("document.allowedPositions = ''")
            .orWhere("document.allowedPositions = :emptyArray", { emptyArray: '' })
            .orWhere("document.allowedPositions LIKE :positionPattern", {
              positionPattern: `%${userPosition}%`
            })
            .orWhere("document.uploadedById = :uploaderId", { uploaderId: userId });
        }));
      }
    }

    if (companyName) {
      if (exactCompanyMatch) {
        queryBuilder.andWhere('document.companyName = :companyName', {
          companyName,
        });
      } else {
        queryBuilder.andWhere('document.companyName ILIKE :companyName', {
          companyName: `%${companyName}%`,
        });
      }
    }

    if (fileName) {
      queryBuilder.andWhere('document.fileName ILIKE :fileName', {
        fileName: `%${fileName}%`,
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

  async getStats(user?: User) {
    const userId = user ? (user['userId'] || user.id) : null;

    const baseQueryBuilder = () => {
      const qb = this.documentRepository.createQueryBuilder('document');

      if (user && user.role !== 'admin') {
        const userPosition = user.position || user['position'];
        if (userPosition) {
          qb.andWhere(
            "(document.allowedPositions IS NULL OR document.allowedPositions = '' OR document.allowedPositions LIKE :positionPattern OR document.uploadedById = :uploaderId)",
            { positionPattern: `%${userPosition}%`, uploaderId: userId }
          );
        }
      }

      return qb;
    };

    const total = await baseQueryBuilder().getCount();

    const { sum } = await baseQueryBuilder()
      .select('SUM(document.amount)', 'sum')
      .getRawOne();

    const pdfCount = await baseQueryBuilder()
      .andWhere('document.fileFormat = :format', { format: FileFormat.PDF })
      .getCount();

    const wordCount = await baseQueryBuilder()
      .andWhere('document.fileFormat = :format', { format: FileFormat.WORD })
      .getCount();

    const excelCount = await baseQueryBuilder()
      .andWhere('document.fileFormat = :format', { format: FileFormat.EXCEL })
      .getCount();

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

  async getDocumentYears(user?: User): Promise<{ year: number; count: number }[]> {
    const userId = user ? (user['userId'] || user.id) : null;

    const qb = this.documentRepository
      .createQueryBuilder('document')
      .select('EXTRACT(YEAR FROM document.documentDate)', 'year')
      .addSelect('COUNT(*)', 'count');

    if (user && user.role !== 'admin') {
      const userPosition = user.position || user['position'];
      if (userPosition) {
        qb.where(
          "(document.allowedPositions IS NULL OR document.allowedPositions = '' OR document.allowedPositions LIKE :positionPattern OR document.uploadedById = :uploaderId)",
          { positionPattern: `%${userPosition}%`, uploaderId: userId }
        );
      }
    }

    const results = await qb
      .groupBy('year')
      .orderBy('year', 'DESC')
      .getRawMany();

    return results.map(r => ({
      year: parseInt(r.year),
      count: parseInt(r.count),
    }));
  }

  async getCompaniesByYear(year: number, user?: User): Promise<{ companyName: string; count: number }[]> {
    const userId = user ? (user['userId'] || user.id) : null;

    const qb = this.documentRepository
      .createQueryBuilder('document')
      .select('document.companyName', 'companyName')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM document.documentDate) = :year', { year });

    if (user && user.role !== 'admin') {
      const userPosition = user.position || user['position'];
      if (userPosition) {
        qb.andWhere(
          "(document.allowedPositions IS NULL OR document.allowedPositions = '' OR document.allowedPositions LIKE :positionPattern OR document.uploadedById = :uploaderId)",
          { positionPattern: `%${userPosition}%`, uploaderId: userId }
        );
      }
    }

    const results = await qb
      .groupBy('document.companyName')
      .orderBy('document.companyName', 'ASC')
      .getRawMany();

    return results.map(r => ({
      companyName: r.companyName || 'Digər',
      count: parseInt(r.count),
    }));
  }

  async getDepartmentsByYear(year: number, user?: User): Promise<{ department: string; count: number }[]> {
    const userId = user ? (user['userId'] || user.id) : null;

    const qb = this.documentRepository
      .createQueryBuilder('document')
      .select('document.department', 'department')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM document.documentDate) = :year', { year });

    if (user && user.role !== 'admin') {
      const userPosition = user.position || user['position'];
      if (userPosition) {
        qb.andWhere(
          "(document.allowedPositions IS NULL OR document.allowedPositions = '' OR document.allowedPositions LIKE :positionPattern OR document.uploadedById = :uploaderId)",
          { positionPattern: `%${userPosition}%`, uploaderId: userId }
        );
      }
    }

    const results = await qb
      .groupBy('document.department')
      .orderBy('document.department', 'ASC')
      .getRawMany();

    return results.map(r => ({
      department: r.department || 'other_service',
      count: parseInt(r.count),
    }));
  }

  async getDocumentTypesInDepartment(year: number, department: string, user?: User): Promise<{ documentType: string; count: number }[]> {
    const userId = user ? (user['userId'] || user.id) : null;

    const qb = this.documentRepository
      .createQueryBuilder('document')
      .select('document.documentType', 'documentType')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM document.documentDate) = :year', { year })
      .andWhere('document.department = :department', { department });

    if (user && user.role !== 'admin') {
      const userPosition = user.position || user['position'];
      if (userPosition) {
        qb.andWhere(
          "(document.allowedPositions IS NULL OR document.allowedPositions = '' OR document.allowedPositions LIKE :positionPattern OR document.uploadedById = :uploaderId)",
          { positionPattern: `%${userPosition}%`, uploaderId: userId }
        );
      }
    }

    const results = await qb
      .groupBy('document.documentType')
      .orderBy('document.documentType', 'ASC')
      .getRawMany();

    return results.map(r => ({
      documentType: r.documentType,
      count: parseInt(r.count),
    }));
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.updatedBy', 'updatedBy')
      .leftJoinAndSelect('document.attachments', 'attachments')
      .where('document.id = :id', { id })
      .orderBy('attachments.id', 'ASC')
      .getOne();

    if (!document) {
      throw new NotFoundException(`Sənəd tapılmadı: ${id}`);
    }

    return document;
  }

  async recordView(documentId: number, user: User): Promise<DocumentView> {
    const document = await this.findOne(documentId);
    const userId = user['userId'] || user.id;

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

    if (updateDocumentDto.companyName) document.companyName = updateDocumentDto.companyName.toUpperCase();
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

    if (document.attachments && document.attachments.length > 0) {
      for (const attachment of document.attachments) {
        if (attachment.filePath && fs.existsSync(attachment.filePath)) {
          try {
            fs.unlinkSync(attachment.filePath);
          } catch (e) {
            console.error(`Əlavə faylı silərkən xəta (${attachment.fileName}): ${e.message}`);
          }
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
    const hasAttachments = document.attachments && document.attachments.length > 0;
    const downloadUrl = hasAttachments
      ? `${baseUrl}/documents/${id}/download-zip`
      : `${baseUrl}/documents/${id}/download`;

    return {
      success: true,
      downloadUrl,
      document: {
        fileName: hasAttachments ? `${document.companyName}_sənədlər.zip` : document.fileName,
        companyName: document.companyName,
        amount: document.amount,
        documentType: document.documentType,
        attachmentCount: document.attachments?.length || 0,
      }
    };
  }

  async getAttachmentFile(id: number): Promise<{ filePath: string; fileName: string }> {
    const attachment = await this.documentAttachmentRepository.findOne({ where: { id } });

    if (!attachment) {
      throw new NotFoundException(`Əlavə fayl tapılmadı: ${id}`);
    }

    if (!fs.existsSync(attachment.filePath)) {
      throw new NotFoundException('Fayl sistemdə tapılmadı');
    }

    return { filePath: attachment.filePath, fileName: attachment.fileName };
  }

  async updateAttachment(
    id: number,
    file: Express.Multer.File,
    user: User,
  ): Promise<DocumentAttachment> {
    if (!file) {
      throw new BadRequestException('Fayl yüklənməlidir');
    }

    const attachment = await this.documentAttachmentRepository.findOne({
      where: { id },
      relations: ['document'],
    });

    if (!attachment) {
      throw new NotFoundException(`Əlavə fayl tapılmadı: ${id}`);
    }

    const ext = file.originalname.split('.').pop() || '';

    attachment.fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    attachment.filePath = file.path;
    attachment.fileExtension = ext.toLowerCase();
    attachment.fileFormat = this.getFileFormat(ext);
    attachment.fileSize = file.size;

    const userId = user['userId'] || user.id;
    await this.documentRepository.update(attachment.documentId, {
      updatedBy: { id: userId } as User,
      updatedById: userId,
    });

    return await this.documentAttachmentRepository.save(attachment);
  }

  async addAttachment(
    documentId: number,
    file: Express.Multer.File,
    user: User,
  ): Promise<DocumentAttachment> {
    if (!file) {
      throw new BadRequestException('Fayl yüklənməlidir');
    }

    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException(`Sənəd tapılmadı: ${documentId}`);
    }

    const ext = file.originalname.split('.').pop() || '';
    const userId = user['userId'] || user.id;

    const attachment = this.documentAttachmentRepository.create({
      document,
      documentId,
      fileName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      filePath: file.path,
      fileExtension: ext.toLowerCase(),
      fileFormat: this.getFileFormat(ext),
      fileSize: file.size,
    });

    await this.documentRepository.update(documentId, {
      updatedBy: { id: userId } as User,
      updatedById: userId,
    });

    return await this.documentAttachmentRepository.save(attachment);
  }

  async createSingleDocumentZip(id: number): Promise<{ zipPath: string; zipFileName: string }> {
    const document = await this.findOne(id);
    const versions = await this.getVersions(id);
    const latestVersion = versions[0];

    const mainFilePath = latestVersion ? latestVersion.filePath : document.filePath;
    const mainFileName = latestVersion ? latestVersion.fileName : document.fileName;

    if (!fs.existsSync(mainFilePath)) {
      throw new NotFoundException('Ana fayl tapılmadı');
    }

    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const zipFileName = `${document.companyName}_${document.id}_sənədlər.zip`;
    const zipPath = path.join(tempDir, `${timestamp}_${zipFileName}`);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver.default('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        resolve({ zipPath, zipFileName });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      archive.file(mainFilePath, { name: mainFileName });

      if (document.attachments && document.attachments.length > 0) {
        for (const attachment of document.attachments) {
          if (fs.existsSync(attachment.filePath)) {
            archive.file(attachment.filePath, {
              name: `əlavələr/${attachment.fileName}`
            });
          }
        }
      }

      archive.finalize();
    });
  }

  async createBulkDownloadZip(ids: number[]): Promise<{ zipPath: string; zipFileName: string }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Ən azı bir sənəd seçilməlidir');
    }

    const documents = await Promise.all(
      ids.map(async (id) => {
        try {
          const doc = await this.findOne(id);
          const versions = await this.getVersions(id);
          const latestVersion = versions[0];

          return {
            document: doc,
            filePath: latestVersion ? latestVersion.filePath : doc.filePath,
            fileName: latestVersion ? latestVersion.fileName : doc.fileName,
          };
        } catch {
          return null;
        }
      })
    );

    const validDocs = documents.filter((d): d is NonNullable<typeof d> => d !== null && fs.existsSync(d.filePath));

    if (validDocs.length === 0) {
      throw new NotFoundException('Yüklənəcək fayl tapılmadı');
    }

    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const zipFileName = `bulk_download_${timestamp}.zip`;
    const zipPath = path.join(tempDir, zipFileName);

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver.default('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        resolve({ zipPath, zipFileName });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      const fileNameCounts: Record<string, number> = {};

      for (const doc of validDocs) {
        const folderName = `${doc.document.companyName}_${doc.document.id}`;

        let mainFileName = doc.fileName;
        if (fileNameCounts[mainFileName]) {
          const ext = path.extname(mainFileName);
          const baseName = path.basename(mainFileName, ext);
          mainFileName = `${baseName}_${fileNameCounts[mainFileName]}${ext}`;
          fileNameCounts[doc.fileName]++;
        } else {
          fileNameCounts[mainFileName] = 1;
        }
        archive.file(doc.filePath, { name: `${folderName}/${mainFileName}` });

        if (doc.document.attachments && doc.document.attachments.length > 0) {
          for (const attachment of doc.document.attachments) {
            if (fs.existsSync(attachment.filePath)) {
              archive.file(attachment.filePath, {
                name: `${folderName}/əlavələr/${attachment.fileName}`
              });
            }
          }
        }
      }

      archive.finalize();
    });
  }
}
