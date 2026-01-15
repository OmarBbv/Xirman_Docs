import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

// Yükləmə qovluğu
export const UPLOAD_PATH = './uploads/documents';

// İcazə verilən MIME tipləri
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Max fayl ölçüsü (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Disk storage konfiqurasiyası
export const documentStorage = diskStorage({
  destination: (req, file, cb) => {
    // Qovluq yoxdursa yarat
    if (!fs.existsSync(UPLOAD_PATH)) {
      fs.mkdirSync(UPLOAD_PATH, { recursive: true });
    }
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// Fayl filtrəsi (yalnız PDF, Word, Excel)
export const documentFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException('Yalnız PDF, Word və Excel faylları yükləmək mümkündür'),
      false,
    );
  }
};

// Multer seçimləri
export const documentUploadOptions = {
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
};
