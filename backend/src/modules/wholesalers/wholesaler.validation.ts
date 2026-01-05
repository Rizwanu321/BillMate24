import { z } from 'zod';

export const createWholesalerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
});

export const updateWholesalerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type CreateWholesalerInput = z.infer<typeof createWholesalerSchema>;
export type UpdateWholesalerInput = z.infer<typeof updateWholesalerSchema>;
