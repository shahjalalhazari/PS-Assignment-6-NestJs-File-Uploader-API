import { Injectable } from "@nestjs/common";
import type { queueAsPromised } from 'fastq';
import fastq from "fastq";
import { SpacesService } from "../spaces.service";
import { PrismaService } from "src/prisma/prisma.service";
import { unlink } from "fs/promises";

interface UploadJob {
    filePath: string,
    fileName: string,
    mimeType: string,
    uploadId: string,
};

@Injectable()
export class UploadQueueService {
    private readonly queue: queueAsPromised<UploadJob>;

    constructor(
        private readonly spacesService: SpacesService,
        private readonly prisma: PrismaService,
    ) {
        this.queue = fastq.promise(
            async (job: UploadJob) => {
                await this.processUpload(job);
            },
            2,
        );
    }

    async addUploadJob(job: UploadJob): Promise<void> {
        await this.queue.push(job);
    };

    private async processUpload(job: UploadJob): Promise<void> {
        try {
            const url = await this.spacesService.uploadFile(
                job.filePath,
                job.fileName,
                job.mimeType,
            );

            await this.prisma.upload.update({
                where: {
                    id: job.uploadId,
                },
                data: {
                    url,
                    storageType: 'spaces',
                    status: 'done',
                },
            });

            await this.deleteLocalFile(job.filePath);
        } catch (error) {
            await this.prisma.upload.update({
                where: {
                    id: job.uploadId,
                },
                data: {
                    status: "failed",
                },
            });
        }
    }

    private async deleteLocalFile(filePath: string): Promise<void> {
        try {
            await unlink(filePath);
        } catch (error) {
            console.log(`[QUEUE] Failed to delete local: ${filePath}`, error);
        }
    }
}