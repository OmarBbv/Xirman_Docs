import { diskStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

export const UPLOAD_PATH = './uploads/documents';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const documentStorage = diskStorage({
  destination: (req, file, cb) => {
    const body = req.body;
    let year = new Date().getFullYear().toString();

    if (body.documentDate) {
      const date = new Date(body.documentDate);
      if (!isNaN(date.getTime())) {
        year = date.getFullYear().toString();
      }
    }

    const department = body.department || 'general';
    const documentType = body.documentType || 'other';

    const uploadPath = path.join(UPLOAD_PATH, year, department, documentType);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

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

export const documentUploadOptions = {
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
};
