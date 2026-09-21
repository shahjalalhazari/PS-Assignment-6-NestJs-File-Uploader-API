import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryUploadsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    mimeType?: string;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsIn([
        'createdAt',
        'updatedAt',
        'originalName',
        'size',
    ])
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}