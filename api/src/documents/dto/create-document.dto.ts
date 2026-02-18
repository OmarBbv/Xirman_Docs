import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DocumentType, Department } from '../enums/document-enums';

export class CreateDocumentDto {
  @IsString()
  companyName: string;

  @IsString()
  @IsOptional()
  documentNumber?: string;

  @IsString()
  @IsOptional()
  amount?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @IsEnum(Department)
  @IsOptional()
  department?: Department;

  @IsDateString()
  documentDate: string;

  @IsOptional()
  allowedPositions?: string[];
}
