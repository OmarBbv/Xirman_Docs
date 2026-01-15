import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DocumentType } from '../enums/document-enums';

export class CreateDocumentDto {
  @IsString()
  companyName: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @IsDateString()
  documentDate: string;
}
