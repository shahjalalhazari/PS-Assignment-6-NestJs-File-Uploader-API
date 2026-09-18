import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly pool: Pool;

    constructor(private readonly configService: ConfigService) {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not configured');
        }

        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
        const adapter = new PrismaPg(pool);
        super({ adapter, })

        this.pool = pool;   
    }

    async onModuleInit() {
        await this.$connect();
        console.log('Database connected successfully');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
    }
}
