import { z } from 'zod';

export const createWholesalerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().min(1, 'Address is required'),
    place: z.string().optional(),
    whatsappNumber: z.string().optional(),
    initialPurchased: z.number().min(0, 'Amount must be positive').optional(),
});

export const updateWholesalerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().min(1, 'Phone number is required').optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
    place: z.string().optional(),
    whatsappNumber: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type CreateWholesalerInput = z.infer<typeof createWholesalerSchema>;
export type UpdateWholesalerInput = z.infer<typeof updateWholesalerSchema>;
