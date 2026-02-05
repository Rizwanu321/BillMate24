import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray, ValidateNested, IsNumber, Min, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsNumber()
    @Min(0)
    rate: number;

    @IsNumber()
    @Min(0)
    amount: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    taxRate?: number;
}

export class CreateInvoiceDto {
    @IsOptional()
    @IsString()
    invoiceNumber?: string; // Auto-generated if not provided

    @IsOptional()
    @IsDateString()
    invoiceDate?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    // Customer Details
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsOptional()
    @IsEmail()
    customerEmail?: string;

    @IsOptional()
    @IsString()
    customerPhone?: string;

    @IsOptional()
    @IsString()
    customerAddress?: string;

    @IsOptional()
    @IsString()
    customerGSTIN?: string;

    // Line Items
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];

    // Amounts
    @IsNumber()
    @Min(0)
    subtotal: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    taxRate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    taxAmount?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number;

    @IsOptional()
    @IsEnum(['percentage', 'fixed'])
    discountType?: 'percentage' | 'fixed';

    @IsNumber()
    @Min(0)
    total: number;

    // Customization
    @IsOptional()
    @IsString()
    templateId?: string;

    @IsOptional()
    @IsString()
    colorScheme?: string;

    @IsOptional()
    @IsString()
    logo?: string;

    // Notes
    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsString()
    terms?: string;

    // Status
    @IsOptional()
    @IsEnum(['draft', 'sent', 'paid', 'cancelled'])
    status?: 'draft' | 'sent' | 'paid' | 'cancelled';
}
