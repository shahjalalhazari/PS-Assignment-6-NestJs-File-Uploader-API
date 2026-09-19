import { BadRequestException, Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';

import { UploadService } from './upload.service';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // UPLOAD SINGLE FILE
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/uploads',

        filename: (req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          const fileName = `${Date.now()}-${randomUUID()}${extension}`;

          callback(null, fileName);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadSingle(
    @UploadedFile(FileValidationPipe)
    file: Express.Multer.File,
    @Req()
    req: Request,
  ) {
    if (!req.ip) {
      throw new BadRequestException('Unable to determine client IP address');
    }
    return this.uploadService.uploadSingle(file, req.ip);
  }
}
