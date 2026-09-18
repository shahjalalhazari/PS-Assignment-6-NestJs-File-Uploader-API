import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UploadService {
    constructor(private readonly prisma: PrismaService) {}

    async uploadSingle(file: Express.Multer.File) {
        const upload = await this.prisma.upload.create({
            data: {
                originalName: file.originalname,
                fileName: file.filename,
                mimeType: file.mimetype,
                size: file.size,
                url: `/uploads/${file.filename}`,
                storageType: 'local',
                status: 'pending',
                uploadedBy: undefined,
            },
        });

        return {
            message: "File uploaded successfully!",
            upload,
        };
    }
}
