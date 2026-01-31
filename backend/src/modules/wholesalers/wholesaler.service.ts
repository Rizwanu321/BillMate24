import { Wholesaler } from './wholesaler.model';
import { CreateWholesalerInput, UpdateWholesalerInput } from './wholesaler.validation';

export class WholesalerService {
    async create(shopkeeperId: string, input: CreateWholesalerInput): Promise<any> {
        const { initialPurchased, ...wholesalerData } = input;

        const initialAmount = initialPurchased || 0;
        let totalPurchased = 0;
        let totalPaid = 0;

        if (initialAmount > 0) {
            // Payable (Credit): We owe them, so we treat it as a purchase without payment
            totalPurchased = initialAmount;
            totalPaid = 0;
        } else if (initialAmount < 0) {
            // Receivable (Advance): They owe us, meaning we paid in advance without purchase
            totalPurchased = 0;
            totalPaid = Math.abs(initialAmount);
        }

        const wholesaler = new Wholesaler({
            ...wholesalerData,
            shopkeeperId,
            initialPurchased: initialAmount,
            totalPurchased,
            totalPaid,
            outstandingDue: initialAmount,
        });

        try {
            await wholesaler.save();
            return wholesaler.toObject();
        } catch (error: any) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern || {})[1]; // Second key is phone/whatsappNumber
                if (field === 'phone') {
                    throw new Error('Phone number already exists for another wholesaler');
                } else if (field === 'whatsappNumber') {
                    throw new Error('WhatsApp number already exists for another wholesaler');
                }
            }
            throw error;
        }
    }

    async getAll(
        shopkeeperId: string,
        page: number,
        limit: number,
        search?: string,
        includeDeleted?: boolean,
        status?: 'all' | 'active' | 'inactive',
        duesFilter?: 'all' | 'with_dues' | 'clear',
        sortBy?: 'name' | 'purchases' | 'outstanding' | 'createdAt'
    ): Promise<{ wholesalers: any[]; total: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const query: any = { shopkeeperId };

        // Exclude deleted by default
        if (!includeDeleted) {
            query.isDeleted = { $ne: true };
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
            ];
        }

        // Status filter
        if (status && status !== 'all') {
            query.isActive = status === 'active';
        }

        // Dues filter
        if (duesFilter && duesFilter !== 'all') {
            if (duesFilter === 'with_dues') {
                query.outstandingDue = { $gt: 0 };
            } else if (duesFilter === 'clear') {
                query.outstandingDue = { $lte: 0 };
            }
        }

        // Determine sort option
        let sortOption: any = { createdAt: -1 }; // default
        if (sortBy === 'name') {
            sortOption = { name: 1 };
        } else if (sortBy === 'purchases') {
            sortOption = { totalPurchased: -1 };
        } else if (sortBy === 'outstanding') {
            sortOption = { outstandingDue: -1 };
        }

        const [wholesalers, total] = await Promise.all([
            Wholesaler.find(query).sort(sortOption).skip(skip).limit(limit),
            Wholesaler.countDocuments(query),
        ]);

        return {
            wholesalers: wholesalers.map(w => w.toObject()),
            total,
            totalPages: Math.ceil(total / limit),
        };
    }


    async getById(shopkeeperId: string, id: string): Promise<any> {
        const wholesaler = await Wholesaler.findOne({ _id: id, shopkeeperId });
        if (!wholesaler) {
            throw new Error('Wholesaler not found');
        }
        return wholesaler.toObject();
    }

    async update(shopkeeperId: string, id: string, input: UpdateWholesalerInput): Promise<any> {
        try {
            const wholesaler = await Wholesaler.findOneAndUpdate(
                { _id: id, shopkeeperId },
                { $set: input },
                { new: true, runValidators: true }
            );
            if (!wholesaler) {
                throw new Error('Wholesaler not found');
            }
            return wholesaler.toObject();
        } catch (error: any) {
            // Handle duplicate key errors
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern || {})[1]; // Second key is phone/whatsappNumber
                if (field === 'phone') {
                    throw new Error('Phone number already exists for another wholesaler');
                } else if (field === 'whatsappNumber') {
                    throw new Error('WhatsApp number already exists for another wholesaler');
                }
            }
            throw error;
        }
    }

    async delete(shopkeeperId: string, id: string): Promise<void> {
        const wholesaler = await Wholesaler.findOneAndUpdate(
            { _id: id, shopkeeperId },
            {
                $set: {
                    isDeleted: true,
                    isActive: false,
                    deletedAt: new Date()
                }
            },
            { new: true }
        );
        if (!wholesaler) {
            throw new Error('Wholesaler not found');
        }
    }

    async restore(shopkeeperId: string, id: string): Promise<any> {
        const wholesaler = await Wholesaler.findOneAndUpdate(
            { _id: id, shopkeeperId, isDeleted: true },
            {
                $set: {
                    isDeleted: false,
                    isActive: true
                },
                $unset: { deletedAt: 1 }
            },
            { new: true }
        );
        if (!wholesaler) {
            throw new Error('Wholesaler not found or not deleted');
        }
        return wholesaler.toObject();
    }

    async getStats(shopkeeperId: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        deleted: number;
        withDues: number;
        totalOutstanding: number;
    }> {
        const [total, active, inactive, deleted, withDues, outstandingResult] = await Promise.all([
            Wholesaler.countDocuments({ shopkeeperId, isDeleted: { $ne: true } }),
            Wholesaler.countDocuments({ shopkeeperId, isActive: true, isDeleted: { $ne: true } }),
            Wholesaler.countDocuments({ shopkeeperId, isActive: false, isDeleted: { $ne: true } }),
            Wholesaler.countDocuments({ shopkeeperId, isDeleted: true }),
            Wholesaler.countDocuments({ shopkeeperId, outstandingDue: { $gt: 0 }, isDeleted: { $ne: true } }),
            Wholesaler.aggregate([
                { $match: { shopkeeperId, isDeleted: { $ne: true } } },
                { $group: { _id: null, total: { $sum: '$outstandingDue' } } }
            ])
        ]);

        return {
            total,
            active,
            inactive,
            deleted,
            withDues,
            totalOutstanding: outstandingResult[0]?.total || 0,
        };
    }

    async getDashboardStats(shopkeeperId: string): Promise<{
        totalWholesalers: number;
        totalPurchased: number;
        totalPaid: number;
        totalOutstanding: number;
    }> {
        const result = await Wholesaler.aggregate([
            { $match: { shopkeeperId: shopkeeperId } },
            {
                $group: {
                    _id: null,
                    totalWholesalers: { $sum: 1 },
                    totalPurchased: { $sum: '$totalPurchased' },
                    totalPaid: { $sum: '$totalPaid' },
                    totalOutstanding: { $sum: '$outstandingDue' },
                },
            },
        ]);

        return result[0] || {
            totalWholesalers: 0,
            totalPurchased: 0,
            totalPaid: 0,
            totalOutstanding: 0,
        };
    }

    async updateBalance(
        shopkeeperId: string,
        id: string,
        purchaseAmount: number,
        paidAmount: number
    ): Promise<void> {
        await Wholesaler.findOneAndUpdate(
            { _id: id, shopkeeperId },
            {
                $inc: {
                    totalPurchased: purchaseAmount,
                    totalPaid: paidAmount,
                    outstandingDue: purchaseAmount - paidAmount,
                },
            }
        );
    }

    async recordPayment(shopkeeperId: string, id: string, amount: number): Promise<void> {
        const wholesaler = await Wholesaler.findOne({ _id: id, shopkeeperId });
        if (!wholesaler) {
            throw new Error('Wholesaler not found');
        }

        await Wholesaler.findOneAndUpdate(
            { _id: id, shopkeeperId },
            {
                $inc: {
                    totalPaid: amount,
                    outstandingDue: -amount,
                },
            }
        );
    }
}

export const wholesalerService = new WholesalerService();

