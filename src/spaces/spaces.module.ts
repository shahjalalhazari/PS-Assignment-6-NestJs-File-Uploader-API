import { Module } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { UploadQueueService } from './queue/upload-queue.service';

@Module({
  providers: [
    SpacesService,
    UploadQueueService,
  ],
  exports: [
    SpacesService,
    UploadQueueService,
  ],
})
export class SpacesModule {}
