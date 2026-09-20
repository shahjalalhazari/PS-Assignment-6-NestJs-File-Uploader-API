import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { SpacesModule } from './spaces/spaces.module';

import spacesConfig from './config/spaces.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        spacesConfig,
      ]
    }),
    PrismaModule,
    UploadModule,
    SpacesModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
