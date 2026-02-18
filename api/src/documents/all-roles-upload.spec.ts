import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { DocumentView } from './entities/document-view.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentRead } from './entities/document-read.entity';
import { DocumentAttachment } from './entities/document-attachment.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { User, UserPosition } from '../users/entities/user.entity';

describe('DocumentsService Role Upload Tests', () => {
  let service: DocumentsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DocumentView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DocumentVersion),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DocumentRead),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(DocumentAttachment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  const positions = Object.values(UserPosition);
  const roles = ['admin', 'user'];

  positions.forEach((position) => {
    it(`should successfully create a document for position: ${position}`, async () => {
      const mockUser = {
        id: 1,
        role: 'user',
        position: position,
      } as User;

      const mockFile = {
        originalname: 'test.pdf',
        path: '/tmp/test.pdf',
        size: 1024,
      } as Express.Multer.File;

      const createDto: CreateDocumentDto = {
        documentNumber: 'DOC-001',
        documentDate: new Date(),
        companyName: 'Test Company',
        amount: 100,
      } as any;

      mockRepository.create.mockImplementation((dto) => dto);
      mockRepository.save.mockImplementation((doc) =>
        Promise.resolve({ id: 1, ...doc }),
      );

      const result = await service.create(createDto, [mockFile], mockUser);

      expect(result).toBeDefined();
      expect(result.uploadedById).toBe(mockUser.id);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  roles.forEach((role) => {
    it(`should successfully create a document for role: ${role}`, async () => {
      const mockUser = {
        id: 1,
        role: role,
        position: UserPosition.MANAGER, // Default position
      } as User;

      const mockFile = {
        originalname: 'test.pdf',
        path: '/tmp/test.pdf',
        size: 1024,
      } as Express.Multer.File;

      const createDto: CreateDocumentDto = {
        documentNumber: 'DOC-001',
        documentDate: new Date(),
        companyName: 'Test Company',
        amount: 100,
      } as any;

      mockRepository.create.mockImplementation((dto) => dto);
      mockRepository.save.mockImplementation((doc) =>
        Promise.resolve({ id: 1, ...doc }),
      );

      const result = await service.create(createDto, [mockFile], mockUser);

      expect(result).toBeDefined();
      expect(result.uploadedById).toBe(mockUser.id);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
