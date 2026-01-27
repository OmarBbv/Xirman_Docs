export const DocumentType = {
  CONTRACT: 'contract',
  CONTRACT_ADDENDUM: 'contract_addendum',
  INVOICE: 'invoice',
  ACT: 'act',
  REPORT: 'report',
  LETTER: 'letter',
  ORDER: 'order',
  RECONCILIATION_ACT: 'reconciliation_act',
  HANDOVER_ACT: 'handover_act',
  CASH_RECEIPT_ORDER: 'cash_receipt_order',
  CASH_EXPENDITURE_ORDER: 'cash_expenditure_order',
  CASH_Z_REPORT: 'cash_z_report',
  LEGAL_DOCUMENTS: 'legal_documents',
  PRODUCTION_FORM: 'production_form',
  DEFECT_INSTALLATION_ACT: 'defect_installation_act',
  WRITE_OFF_ACT: 'write_off_act',
  WAREHOUSE_TRANSFER: 'warehouse_transfer',
  SALES_INVOICE: 'sales_invoice',
  EMPLOYMENT_ORDER: 'employment_order',
  TERMINATION_ORDER: 'termination_order',
  VACATION_ORDER: 'vacation_order',
  BUSINESS_TRIP_ORDER: 'business_trip_order',
  SICK_LEAVE: 'sick_leave',
  PROTOCOL: 'protocol',
  TIMESHEET: 'timesheet',
  WAYBILL_REQUISITION: 'waybill_requisition',
  FINANCIAL_REPORTS: 'financial_reports',
  INCOMING_LETTER: 'incoming_letter',
  OUTGOING_LETTER: 'outgoing_letter',
  OTHER: 'other',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const Department = {
  MILL: 'mill',
  DAIRY: 'dairy',
  SAUSAGE: 'sausage',
  OTHER_SERVICE: 'other_service',
} as const;

export type Department = (typeof Department)[keyof typeof Department];

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

export interface DocumentAttachment {
  id: number;
  documentId: number;
  fileName: string;
  filePath: string;
  fileFormat: FileFormat;
  fileExtension: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Document {
  id: number;
  companyName: string;
  documentNumber: string | null;
  amount: number | null;
  documentType: DocumentType;
  department: Department | null;
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
  attachments?: DocumentAttachment[];
  allowedPositions?: string[];
}

export interface CreateDocumentDto {
  companyName: string;
  documentNumber?: string;
  amount?: number;
  documentType?: DocumentType;
  department?: Department | string;
  documentDate: string;
  allowedPositions?: string[];
}

export interface UpdateDocumentDto {
  companyName?: string;
  documentNumber?: string;
  amount?: number;
  documentType?: DocumentType;
  department?: Department | string;
  documentDate?: string;
}

export interface FilterDocumentDto {
  companyName?: string;
  fileName?: string;
  minAmount?: number;
  maxAmount?: number;
  documentType?: DocumentType;
  department?: Department;
  fileFormat?: FileFormat;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  excludeRead?: boolean;
  exactCompanyMatch?: boolean;
}

export interface PaginatedDocuments {
  data: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
