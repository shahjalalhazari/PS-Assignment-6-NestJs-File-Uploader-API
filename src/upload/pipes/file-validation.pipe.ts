import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { unlink } from "fs/promises";
import "multer";

@Injectable()
export class FileValidationPipe implements PipeTransform {
    // ALLOWED MIME TYPES
    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
    ];

    // ALLOWED EXTENSIONS
    private readonly allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
    ];

    // MAX FILE SIZE (5MB)
    private readonly maxFileSize = 5 * 1024 * 1024;

    async transform(file: Express.Multer.File) {
        // CHECK IF FILE IS PRESENT
        if (!file) {
            throw new BadRequestException('File is required');
        }

        // CHECK MIME TYPE
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid Only JPG, JPEG, PNG & WEBP files are allowed.');
        }

        // CHECK FILE EXTESION
        const extension = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
        if (!this.allowedExtensions.includes(extension)) {
            throw new BadRequestException(
                'Only .jgp, .jpeg, .png & .webp files are allowed'
            );
        }

        // CHECK FILE SIZE
        if (file.size > this.maxFileSize) {
            throw new BadRequestException('File too large (max 5MB)');
        }

        // RETURN VALID FILE
        return file;
    };

    // 
    private async deleteFile(file: Express.Multer.File): Promise<void> {
        try {
            await unlink(file.path);
        } catch (error) {
            console.error(`Failed to delete rejected file: ${file.path}`, error);
        }
    }
}