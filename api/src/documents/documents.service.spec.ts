import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { DocumentsService } from './documents.service';
import { Document, DocumentType, FileFormat } from './entities/document.entity';
import { DocumentView } from './entities/document-view.entity';
import { User } from '../users/entities/user.entity';

// Mock fs module
jest.mock('fs');

describe('DocumentsService', () => {
  let service: DocumentsService;
  let documentRepository: any;
  let documentViewRepository: any;

  const mockUser: User = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
  } as User;

  const mockFile = {
    originalname: 'test.pdf',
    path: 'uploads/test.pdf',
    size: 1024,
  } as Express.Multer.File;

  const mockDocument = {
    id: 1,
    companyName: 'Test Company',
    amount: 100,
    documentType: DocumentType.CONTRACT,
    documentDate: new Date('2023-01-01'),
    fileName: 'test.pdf',
    filePath: 'uploads/test.pdf',
    fileFormat: FileFormat.PDF,
    fileExtension: 'pdf',
    fileSize: 1024,
    uploadedBy: mockUser,
    uploadedById: mockUser.id,
    uploadedAt: new Date(),
    updatedAt: new Date(),
    views: [],
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockDocumentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockDocumentViewRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        {
          provide: getRepositoryToken(DocumentView),
          useValue: mockDocumentViewRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    documentRepository = module.get(getRepositoryToken(Document));
    documentViewRepository = module.get(getRepositoryToken(DocumentView));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 1️⃣ create() – Bisnes məntiq və fayl yükləmə testləri
  describe('create', () => {
    it('should create document successfully with valid file and dto', async () => {
      const dto = {
        companyName: 'Test Co',
        amount: 500,
        documentType: DocumentType.INVOICE,
        documentDate: '2023-05-20',
      };

      documentRepository.create.mockReturnValue(mockDocument);
      documentRepository.save.mockResolvedValue(mockDocument);

      const result = await service.create(dto, mockFile, mockUser);

      expect(documentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: dto.companyName,
          amount: dto.amount,
          fileName: mockFile.originalname,
          uploadedBy: mockUser,
        }),
      );
      expect(documentRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockDocument);
    });

    it('should assign correct fileFormat when pdf file is uploaded', async () => {
      const pdfFile = { ...mockFile, originalname: 'doc.pdf' } as any;
      const dto = { companyName: 'A', documentDate: '2023-01-01' };

      await service.create(dto, pdfFile, mockUser);

      expect(documentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileFormat: FileFormat.PDF,
          fileExtension: 'pdf',
        }),
      );
    });

    it('should assign WORD format for doc/docx files', async () => {
      const docFile = { ...mockFile, originalname: 'contract.docx' } as any;
      const dto = { companyName: 'B', documentDate: '2023-01-01' };

      await service.create(dto, docFile, mockUser);

      expect(documentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileFormat: FileFormat.WORD,
        }),
      );
    });

    it('should assign EXCEL format for xls/xlsx files', async () => {
      const xlsFile = { ...mockFile, originalname: 'report.xlsx' } as any;
      const dto = { companyName: 'C', documentDate: '2023-01-01' };

      await service.create(dto, xlsFile, mockUser);

      expect(documentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileFormat: FileFormat.EXCEL,
        }),
      );
    });

    it('should throw BadRequestException when file is missing', async () => {
      await expect(
        service.create(
          { companyName: 'Fail', documentDate: '2023-01-01' },
          null as any,
          mockUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // 2️⃣ findAll() – Filtrləmə və pagination testləri
  describe('findAll', () => {
    const mockDocuments = [mockDocument];
    const mockCount = 1;

    beforeEach(() => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockDocuments, mockCount]);
    });

    it('should return paginated documents without filters', async () => {
      const result = await service.findAll({});

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: mockDocuments,
        total: mockCount,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter documents by companyName', async () => {
      await service.findAll({ companyName: 'Test' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.companyName ILIKE :companyName',
        { companyName: '%Test%' },
      );
    });

    it('should filter documents by amount range', async () => {
      await service.findAll({ minAmount: 100, maxAmount: 500 });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.amount >= :minAmount',
        { minAmount: 100 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.amount <= :maxAmount',
        { maxAmount: 500 },
      );
    });

    it('should filter documents by documentType', async () => {
      await service.findAll({ documentType: DocumentType.ACT });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.documentType = :documentType',
        { documentType: DocumentType.ACT },
      );
    });

    it('should filter documents by date range', async () => {
      await service.findAll({ startDate: '2023-01-01', endDate: '2023-12-31' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.documentDate >= :startDate',
        expect.anything(),
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'document.documentDate <= :endDate',
        expect.anything(),
      );
    });
  });

  // 3️⃣ findOne()
  describe('findOne', () => {
    it('should return document with relations when id exists', async () => {
      documentRepository.findOne.mockResolvedValue(mockDocument);
      const result = await service.findOne(1);
      expect(result).toEqual(mockDocument);
      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['uploadedBy', 'views', 'views.viewedBy'],
      });
    });

    it('should throw NotFoundException when document does not exist', async () => {
      documentRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // 4️⃣ recordView()
  describe('recordView', () => {
    it('should record a document view successfully', async () => {
      documentRepository.findOne.mockResolvedValue(mockDocument);
      const mockView = { id: 1, document: mockDocument, viewedBy: mockUser };
      documentViewRepository.create.mockReturnValue(mockView);
      documentViewRepository.save.mockResolvedValue(mockView);

      const result = await service.recordView(1, mockUser);

      expect(documentViewRepository.create).toHaveBeenCalledWith({
        document: mockDocument,
        documentId: mockDocument.id,
        viewedBy: mockUser,
        viewedById: mockUser.id,
      });
      expect(result).toEqual(mockView);
    });
  });

  // 6️⃣ update()
  describe('update', () => {
    it('should update document metadata successfully', async () => {
      documentRepository.findOne.mockResolvedValue({ ...mockDocument }); // Clone object
      documentRepository.save.mockImplementation((doc) => Promise.resolve(doc));

      const updateDto = { companyName: 'Updated Name', amount: 999 };
      const result = await service.update(1, updateDto);

      expect(result.companyName).toBe('Updated Name');
      expect(result.amount).toBe(999);
      expect(documentRepository.save).toHaveBeenCalled();
    });

    it('should update documentDate when provided', async () => {
      documentRepository.findOne.mockResolvedValue({ ...mockDocument });
      documentRepository.save.mockImplementation((doc) => Promise.resolve(doc));

      const updateDto = { documentDate: '2025-01-01' };
      const result = await service.update(1, updateDto);

      expect(result.documentDate).toEqual(new Date('2025-01-01'));
    });
  });

  // 7️⃣ remove() – Fayl sistemi ilə işləyən testlər
  describe('remove', () => {
    it('should remove document successfully and delete file from disk', async () => {
      documentRepository.findOne.mockResolvedValue(mockDocument);
      documentRepository.remove.mockResolvedValue(mockDocument);

      // Mock fs functions
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => { });

      const result = await service.remove(1);

      expect(fs.existsSync).toHaveBeenCalledWith(mockDocument.filePath);
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockDocument.filePath);
      expect(documentRepository.remove).toHaveBeenCalledWith(mockDocument);
      expect(result).toEqual({ message: 'Sənəd uğurla silindi' });
    });

    it('should not throw error if file does not exist on disk', async () => {
      documentRepository.findOne.mockResolvedValue(mockDocument);
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await service.remove(1);

      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(documentRepository.remove).toHaveBeenCalledWith(mockDocument);
    });

    it('should throw NotFoundException when document does not exist', async () => {
      documentRepository.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // 8️⃣ findByUser()
  describe('findByUser', () => {
    it('should return paginated documents uploaded by specific user', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockDocument], 1]);

      const result = await service.findByUser(1, {});

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'document.uploadedById = :userId',
        { userId: 1 },
      );
      expect(result.data).toEqual([mockDocument]);
    });
  });
});
