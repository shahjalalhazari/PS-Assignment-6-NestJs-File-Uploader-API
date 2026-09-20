import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { SpacesModule } from 'src/spaces/spaces.module';

@Module({
  imports: [SpacesModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
