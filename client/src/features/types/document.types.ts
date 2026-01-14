// Document Types

export const DocumentType = {
  CONTRACT: 'contract',
  INVOICE: 'invoice',
  ACT: 'act',
  REPORT: 'report',
  LETTER: 'letter',
  ORDER: 'order',
  OTHER: 'other',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const FileFormat = {
  PDF: 'pdf',
  WORD: 'word',
  EXCEL: 'excel',
  OTHER: 'other',
} as const;

export type FileFormat = (typeof FileFormat)[keyof typeof FileFormat];

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
}

export interface DocumentView {
  id: number;
  viewedBy: User;
  viewedAt: string;
  document?: Document;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  fileName: string;
  filePath: string;
  fileFormat: FileFormat;
  fileExtension: string;
  fileSize: number;
  version: number;
  createdBy: User;
  createdAt: string;
}

export interface Document {
  id: number;
  companyName: string;
  amount: number | null;
  documentType: DocumentType;
  documentDate: string;
  fileName: string;
  filePath: string;
  fileFormat: FileFormat;
  fileExtension: string;
  fileSize: number;
  uploadedBy: User;
  uploadedById: number;
  uploadedAt: string;
  updatedAt: string;
  updatedBy?: User;
  updatedById?: number;
  views?: DocumentView[];
}

export interface CreateDocumentDto {
  companyName: string;
  amount?: number;
  documentType?: DocumentType;
  documentDate: string;
}

export interface UpdateDocumentDto {
  companyName?: string;
  amount?: number;
  documentType?: DocumentType;
  documentDate?: string;
}

export interface FilterDocumentDto {
  companyName?: string;
  minAmount?: number;
  maxAmount?: number;
  documentType?: DocumentType;
  fileFormat?: FileFormat;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDocuments {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
