import { IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceQueryDto {
    @IsOptional()
    @IsString()
    search?: string; // Search by invoice number or customer name

    @IsOptional()
    @IsEnum(['draft', 'sent', 'paid', 'cancelled'])
    status?: 'draft' | 'sent' | 'paid' | 'cancelled';

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsEnum(['createdAt', 'invoiceDate', 'total', 'invoiceNumber'])
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}
