import { z } from 'zod';

export const wholesalerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(1, 'Phone number is required'),
    whatsappNumber: z.string().optional(),
    address: z.string().min(1, 'Address is required'),
    initialPurchased: z.number().min(0, 'Amount must be positive').optional(),
});

export type WholesalerSchema = z.infer<typeof wholesalerSchema>;
