import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
    uploadSingle(file: Express.Multer.File) {
        return {
            message: "File uploaded successfully!",
            file: {
                originalName: file.originalname,
                fileName: file.filename,
                mimeType: file.mimetype,
                size: file.size,
                path: file.path,
            },
        };
    }
}
