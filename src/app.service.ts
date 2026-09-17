import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NestJs file uploader Api. Assignment-6 by Shahjalal Hazari';
  }
}
