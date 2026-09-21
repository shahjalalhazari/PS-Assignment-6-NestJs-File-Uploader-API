import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { Upload } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadQueueService } from 'src/spaces/queue/upload-queue.service';
import { QueryUploadsDto } from './dto/query-uploads.dto';

@Injectable()
export class UploadService {
    private readonly DAILY_UPLOAD_LIMIT = 1 * 1024 * 1024 * 1024; // 1GB

    constructor(
        private readonly prisma: PrismaService,
        private readonly uploadQueueSevice: UploadQueueService,
    ) {}

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
        return result._sum.size ?? 0;
    }

    // CHECK CURRENT UPLOAD EXCEED DAILY LIMIT
    private async checkDailyUploadLimit(uploadedBy: string, fileSize: number): Promise<void> {
        const currentUsage = await this.getDailyUploadUsage(uploadedBy);
        const newUsage = currentUsage + fileSize;
        if (newUsage > this.DAILY_UPLOAD_LIMIT) {
            throw new BadRequestException(`Daily upload limit of 1GB exceeded. Current usage: ${currentUsage} bytes.`);
        }
    };

    // DELETE REJECTED LOCAL FILES
    private async deleteLocalFile(filePath: string): Promise<void> {
        try {
            await unlink(filePath);
        } catch (error) {
            console.error(`Failed to delete rejected file: ${filePath}`, error);
        }
    }

    // UPLOAD SINGLE FILE
    async uploadSingle(
        file: Express.Multer.File,
        uploadedBy: string,
    ) {
        try {
            // CHECK DAILY LIMIT SIZE
            await this.checkDailyUploadLimit(uploadedBy, file.size);

            // SAVE FILE INTO DB.
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

            // SEND FILE TO THE QUEUE
            await this.uploadQueueSevice.addUploadJob({
                filePath: file.path,
                fileName: file.filename,
                mimeType: file.mimetype,
                uploadId: upload.id,
            })

            return {
                message: "File uploaded successfully!",
                data: upload,
            };
        } catch (error) {
            await this.deleteLocalFile(file.path);
            throw error;
        }
    }

    // UPLOAD MULTIPLE FILES
    async uploadMultiple(
        files: Express.Multer.File[], 
        uploadedBy
    ) {
        // IF NOT FILE
        if (!files || files.length === 0) throw new BadRequestException('At least one file is required');

        try {
            // TOTAL PAYLOAD SIZE
            const totalSize = files.reduce(
                (total, file) => total + file.size,
                0,
            );

            // CHECK DAILY UPLOAD LIMIT
            await this.checkDailyUploadLimit(uploadedBy, totalSize);

            // SAVE EACH FILES IN DB
            const uploads: Upload[] = [];
            for (const file of files) {
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

                uploads.push(upload);

                // SEND EACH FILES TO THE QUEUE
                await this.uploadQueueSevice.addUploadJob({
                    fileName: file.filename,
                    filePath: file.path,
                    mimeType: file.mimetype,
                    uploadId: upload.id,
                });
            }

            return {
                message: `${files.length} file(s) uploaded successfully`,
                data: uploads,
            }
        } catch (error) {
            for (const file of files) {
                await this.deleteLocalFile(file.path);
            }

            throw error;
        }
    }

    // GET ALL UPLOADS
    async findAll(query: QueryUploadsDto) {
        const {
            page = 1,
            limit = 10,
            status,
            mimeType,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query;

        const skip = (page - 1) * limit;

        const where = {
            ...(status && {
                status
            }),
            ...(mimeType && {
                mimeType
            }),
            ...(search && {
                originalName: {
                    contains: search,
                    mode: 'insensitive' as const
                }
            }),
        };

        const [uploads, total] = await Promise.all([
            this.prisma.upload.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
            }),

            this.prisma.upload.count({
                where,
            }),
        ]);

        return {
            data: uploads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        }
    }

    // GET A SINGLE UPLOAD
    async findOne(id: string) {
        const upload = await this.prisma.upload.findUnique({
            where: {
                id,
            }
        });
        if (!upload) throw new NotFoundException('Upload not found');

        return {data: upload}
    }
}
