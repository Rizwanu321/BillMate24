import mongoose, { Schema, Document } from 'mongoose';

interface WholesalerDocument extends Document {
    shopkeeperId: mongoose.Types.ObjectId;
    name: string;
    phone?: string;
    whatsappNumber?: string;
    address?: string;
    totalPurchased: number;
    totalPaid: number;
    outstandingDue: number;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
}

const wholesalerSchema = new Schema(
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
        gstNumber: {
            type: String,
            trim: true,
        },
        totalPurchased: {
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
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
wholesalerSchema.index({ shopkeeperId: 1, name: 1 });
wholesalerSchema.index({ shopkeeperId: 1, isActive: 1 });
wholesalerSchema.index({ shopkeeperId: 1, outstandingDue: -1 });

export const Wholesaler = mongoose.model<WholesalerDocument>('Wholesaler', wholesalerSchema);

