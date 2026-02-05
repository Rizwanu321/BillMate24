import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema()
export class InvoiceItem {
    @Prop({ required: true })
    description: string;

    @Prop({ required: true, min: 0 })
    quantity: number;

    @Prop({ required: true, min: 0 })
    rate: number;

    @Prop({ required: true, min: 0 })
    amount: number; // quantity * rate

    @Prop({ min: 0, max: 100 })
    taxRate?: number;
}

const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);

@Schema({ timestamps: true })
export class Invoice {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    shopkeeperId: Types.ObjectId;

    @Prop({ required: true, unique: true })
    invoiceNumber: string;

    @Prop({ required: true, default: Date.now })
    invoiceDate: Date;

    @Prop()
    dueDate?: Date;

    // Customer Details
    @Prop({ required: true })
    customerName: string;

    @Prop()
    customerEmail?: string;

    @Prop()
    customerPhone?: string;

    @Prop()
    customerAddress?: string;

    @Prop()
    customerGSTIN?: string;

    // Shop/Business Details
    @Prop()
    shopName?: string;

    @Prop()
    shopAddress?: string;

    @Prop()
    shopPlace?: string;

    @Prop()
    shopPhone?: string;

    // Line Items
    @Prop({ type: [InvoiceItemSchema], required: true })
    items: InvoiceItem[];

    // Amounts
    @Prop({ required: true, min: 0 })
    subtotal: number;

    @Prop({ min: 0, max: 100 })
    taxRate?: number;

    @Prop({ min: 0 })
    taxAmount?: number;

    @Prop({ min: 0 })
    discount?: number;

    @Prop({ enum: ['percentage', 'fixed'] })
    discountType?: 'percentage' | 'fixed';

    @Prop({ required: true, min: 0 })
    total: number;

    // Customization
    @Prop({ required: true, default: 'modern' })
    templateId: string;

    @Prop()
    colorScheme?: string;

    @Prop()
    logo?: string;

    // Notes
    @Prop()
    notes?: string;

    @Prop()
    terms?: string;

    // Metadata
    @Prop({
        enum: ['draft', 'sent', 'paid', 'cancelled'],
        default: 'draft'
    })
    status: 'draft' | 'sent' | 'paid' | 'cancelled';

    @Prop({ default: false })
    isDeleted: boolean;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Add index for faster queries
InvoiceSchema.index({ shopkeeperId: 1, invoiceNumber: 1 });
InvoiceSchema.index({ shopkeeperId: 1, createdAt: -1 });
InvoiceSchema.index({ shopkeeperId: 1, status: 1 });
