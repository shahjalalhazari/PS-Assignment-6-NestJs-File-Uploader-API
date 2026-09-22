import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';

@Injectable()
export class SpacesService {
    private readonly s3Client: S3Client;
    private readonly bucket: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const endpoint = this.configService.get<string>('spaces.endpoint');
        const region = this.configService.get<string>('spaces.region');
        const accessKey = this.configService.get<string>('spaces.accessKey');
        const secretKey = this.configService.get<string>('spaces.secretKey');
        const bucket = this.configService.get<string>('spaces.bucket');

        if (!endpoint || !region || !accessKey || !secretKey || !bucket) throw new Error('DigitalOcean spaces config is incomplete.');

        this.bucket = bucket;
        this.s3Client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });
    }

    // UPLOAD FILE(S) TO SPACES
    async uploadFile(filePath: string, fileName: string, mimeType: string): Promise<string> {
        const fileStream = createReadStream(filePath);
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: fileName,
            Body: fileStream,
            ContentType: mimeType,
            ACL: 'public-read',
        });

        await this.s3Client.send(command);
        const endpint = this.configService.get<string>('spaces.endpoint');
        if (!endpint) throw new Error('DigitalOcean spaces endpoint is not configured');
        
        return `${endpint}/${this.bucket}/${fileName}`;
    };

    // DELETE FILE FROM SPACES
    async deleteFile(fileName): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: fileName,
        });

        await this.s3Client.send(command);
    }
}
