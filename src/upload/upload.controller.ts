import { BadRequestException, Controller, Delete, Get, Param, Post, Query, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import 'multer';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import type { Request } from 'express';

import { UploadService } from './upload.service';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { QueryUploadsDto } from './dto/query-uploads.dto';
import { UploadLoggingInterceptor } from './interceptors/upload-logging.interceptor';

// REUSABLE MULTER STORAGE CONFIG
function getStorage() {
  return diskStorage({
    destination: './public/uploads',

    filename: (req, file, cb) => {
      const extension = extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}-${randomUUID()}${extension}`;

      cb(null, fileName);
    }
  })
}

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService
  ) {}

  // UPLOAD SINGLE FILE
  @Post('single')
  @UseGuards(RateLimitGuard)
  @UseInterceptors(
    UploadLoggingInterceptor,
    FileInterceptor('file', {
      storage: getStorage(),

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

  // UPLOAD MULTIPLE FILES
  @Post('multiple')
  @UseGuards(RateLimitGuard)
  @UseInterceptors(
    UploadLoggingInterceptor,
    FilesInterceptor('files', 5, {
      storage: getStorage(),

      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
      },
    }),
  )
  uploadMultiple(
    @UploadedFiles()
    files: Express.Multer.File[],
    @Req()
    req: Request,
  ) {
    if (!req.ip) throw new BadRequestException('Unable to determine client IP address.');

    return this.uploadService.uploadMultiple(files, req.ip);
  }

  // GET ALL UPLOADS
  @Get()
  @UseInterceptors(UploadLoggingInterceptor)
  findAll(@Query() query: QueryUploadsDto) {
    return this.uploadService.findAll(query);
  }

  // GET UPLOAD STATS
  @Get('stats')
  @UseInterceptors(UploadLoggingInterceptor)
  getStats() {
    return this.uploadService.getStats();
  }

  // GET A SIGNLE UPLOAD
  @Get(':id')
  @UseInterceptors(UploadLoggingInterceptor)
  findOne(@Param('id') id: string) {
    return this.uploadService.findOne(id);
  }

  // DELETE UPLOAD
  @Delete(':id')
  @UseInterceptors(UploadLoggingInterceptor)
  remove(@Param('id') id: string) {
    return this.uploadService.remove(id);
  }
}
