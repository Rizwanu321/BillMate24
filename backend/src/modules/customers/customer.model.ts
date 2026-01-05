import mongoose, { Schema, Document } from 'mongoose';

interface CustomerDocument extends Document {
    shopkeeperId: mongoose.Types.ObjectId;
    name: string;
    phone?: string;
    whatsappNumber?: string;
    address?: string;
    type: 'due' | 'normal';
    totalSales: number;
    totalPaid: number;
    outstandingDue: number;
    lastPaymentDate?: Date;
    isActive: boolean;
}

const customerSchema = new Schema(
    {
        shopkeeperId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Shopkeeper ID is required'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        whatsappNumber: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ['due', 'normal'],
            required: [true, 'Customer type is required'],
        },
        totalSales: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        outstandingDue: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastPaymentDate: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
customerSchema.index({ shopkeeperId: 1, type: 1 });
customerSchema.index({ shopkeeperId: 1, name: 1 });
customerSchema.index({ shopkeeperId: 1, isActive: 1 });
customerSchema.index({ shopkeeperId: 1, outstandingDue: -1 });

export const Customer = mongoose.model<CustomerDocument>('Customer', customerSchema);

