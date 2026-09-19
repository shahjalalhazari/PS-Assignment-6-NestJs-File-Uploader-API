import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UploadService {
    private readonly DAILY_UPLOAD_LIMIT = 1 * 1024 * 1024 * 1024;

    constructor(private readonly prisma: PrismaService) {}

    // GET ALREADY UPLOADED SIZE OF A DAY
    private async getDailyUploadUsage(uploadedBy: string): Promise<number> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const result = await this.prisma.upload.aggregate({
            _sum: {
                size: true,
            },

            where: {
                uploadedBy,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
        console.log("Already Usage:", result._sum.size ?? 0);
        return result._sum.size ?? 0;
    }

    // CHECK CURRENT UPLOAD EXCEED DAILY LIMIT
    private async checkDailyUploadLimit(uploadedBy: string, fileSize: number): Promise<void> {
        const currentUsage = await this.getDailyUploadUsage(uploadedBy);
        const newUsage = currentUsage + fileSize;
        console.log("Current File Size:", fileSize);
        console.log("New Usage:", newUsage);

        if (newUsage > this.DAILY_UPLOAD_LIMIT) {
            throw new BadRequestException(`Daily upload limit of 1GB exceeded. Current usage: ${currentUsage} bytes.`);
        }
    };

    // UPLOAD SINGLE FILE
    async uploadSingle(
        file: Express.Multer.File,
        uploadedBy: string,
    ) {
        await this.checkDailyUploadLimit(uploadedBy, file.size);

        const upload = await this.prisma.upload.create({
            data: {
                originalName: file.originalname,
                fileName: file.filename,
                mimeType: file.mimetype,
                size: file.size,
                url: `/uploads/${file.filename}`,
                storageType: 'local',
                status: 'pending',
                uploadedBy,
            },
        });

        return {
            message: "File uploaded successfully!",
            upload,
        };
    }
}
