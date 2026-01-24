import { User } from './user.model';
import { hashPassword } from '../../utils/auth';
import { CreateShopkeeperInput, UpdateShopkeeperInput, UpdateFeaturesInput } from './user.validation';
import { IUser, Features } from '../../types';
import { Bill } from '../bills/bill.model';
import { Customer } from '../customers/customer.model';
import { Wholesaler } from '../wholesalers/wholesaler.model';
import mongoose from 'mongoose';

export class UserService {
    async createShopkeeper(input: CreateShopkeeperInput): Promise<Omit<IUser, 'password' | 'refreshToken'>> {
        // Check if email already exists
        const existingEmail = await User.findOne({ email: input.email.toLowerCase() });
        if (existingEmail) {
            throw new Error('Email already registered');
        }

        // Check if phone number already exists (if provided)
        if (input.phone) {
            const existingPhone = await User.findOne({ phone: input.phone.trim() });
            if (existingPhone) {
                throw new Error('Phone number already registered');
            }
        }

        const hashedPassword = await hashPassword(input.password);

        const user = new User({
            ...input,
            email: input.email.toLowerCase(),
            password: hashedPassword,
            role: 'shopkeeper',
        });

        await user.save();

        const userResponse = user.toObject();
        delete (userResponse as any).password;
        delete (userResponse as any).refreshToken;

        return userResponse as Omit<IUser, 'password' | 'refreshToken'>;
    }

    async getAllShopkeepers(page: number, limit: number): Promise<{
        users: Omit<IUser, 'password' | 'refreshToken'>[];
        total: number;
        totalPages: number;
    }> {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find({ role: 'shopkeeper' })
                .select('-password -refreshToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments({ role: 'shopkeeper' }),
        ]);

        return {
            users: users.map(u => u.toObject() as Omit<IUser, 'password' | 'refreshToken'>),
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getShopkeeperById(id: string): Promise<Omit<IUser, 'password' | 'refreshToken'>> {
        const user = await User.findOne({ _id: id, role: 'shopkeeper' })
            .select('-password -refreshToken');

        if (!user) {
            throw new Error('Shopkeeper not found');
        }

        return user.toObject() as Omit<IUser, 'password' | 'refreshToken'>;
    }

    async updateShopkeeper(
        id: string,
        input: UpdateShopkeeperInput
    ): Promise<Omit<IUser, 'password' | 'refreshToken'>> {
        // Check if phone number is being updated and if it already exists
        if (input.phone) {
            const existingPhone = await User.findOne({
                phone: input.phone.trim(),
                _id: { $ne: id } // Exclude current user from check
            });
            if (existingPhone) {
                throw new Error('Phone number already registered');
            }
        }

        const user = await User.findOneAndUpdate(
            { _id: id, role: 'shopkeeper' },
            { $set: input },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) {
            throw new Error('Shopkeeper not found');
        }

        return user.toObject() as Omit<IUser, 'password' | 'refreshToken'>;
    }

    async updateShopkeeperFeatures(
        id: string,
        features: Features
    ): Promise<Omit<IUser, 'password' | 'refreshToken'>> {
        const user = await User.findOneAndUpdate(
            { _id: id, role: 'shopkeeper' },
            { $set: { features } },
            { new: true }
        ).select('-password -refreshToken');

        if (!user) {
            throw new Error('Shopkeeper not found');
        }

        return user.toObject() as Omit<IUser, 'password' | 'refreshToken'>;
    }

    async toggleShopkeeperStatus(id: string): Promise<Omit<IUser, 'password' | 'refreshToken'>> {
        const user = await User.findOne({ _id: id, role: 'shopkeeper' });

        if (!user) {
            throw new Error('Shopkeeper not found');
        }

        user.isActive = !user.isActive;
        if (!user.isActive) {
            user.refreshToken = undefined; // Invalidate sessions on deactivation
        }
        await user.save();

        const userResponse = user.toObject();
        delete (userResponse as any).password;
        delete (userResponse as any).refreshToken;

        return userResponse as Omit<IUser, 'password' | 'refreshToken'>;
    }

    async deleteShopkeeper(id: string): Promise<void> {
        const result = await User.deleteOne({ _id: id, role: 'shopkeeper' });

        if (result.deletedCount === 0) {
            throw new Error('Shopkeeper not found');
        }
    }

    async getShopkeeperStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
    }> {
        const [total, active] = await Promise.all([
            User.countDocuments({ role: 'shopkeeper' }),
            User.countDocuments({ role: 'shopkeeper', isActive: true }),
        ]);

        return {
            total,
            active,
            inactive: total - active,
        };
    }

    async getShopkeeperStorageStats(shopkeeperId: string) {
        const shopkeeperObjectId = new mongoose.Types.ObjectId(shopkeeperId);

        const [
            totalCustomers,
            dueCustomers,
            normalCustomers,
            totalWholesalers,
            totalBills,
            purchaseBills,
            saleBills,
            totalRevenue,
            totalExpenses,
        ] = await Promise.all([
            Customer.countDocuments({ shopkeeperId: shopkeeperObjectId }),
            Customer.countDocuments({ shopkeeperId: shopkeeperObjectId, type: 'due' }),
            Customer.countDocuments({ shopkeeperId: shopkeeperObjectId, type: 'normal' }),
            Wholesaler.countDocuments({ shopkeeperId: shopkeeperObjectId, isDeleted: false }),
            Bill.countDocuments({ shopkeeperId: shopkeeperObjectId }),
            Bill.countDocuments({ shopkeeperId: shopkeeperObjectId, billType: 'purchase' }),
            Bill.countDocuments({ shopkeeperId: shopkeeperObjectId, billType: 'sale' }),
            Bill.aggregate([
                { $match: { shopkeeperId: shopkeeperObjectId, billType: 'sale' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Bill.aggregate([
                { $match: { shopkeeperId: shopkeeperObjectId, billType: 'purchase' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
        ]);

        // Estimate storage size (approximate calculation)
        // Average document sizes in MongoDB:
        // - Customer: ~500 bytes
        // - Wholesaler: ~500 bytes
        // - Bill: ~1KB (1024 bytes) due to items array
        const estimatedStorageBytes =
            (totalCustomers * 500) +
            (totalWholesalers * 500) +
            (totalBills * 1024);

        // Convert to human-readable format
        const formatBytes = (bytes: number): string => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        return {
            shopkeeperId,
            storage: {
                totalBytes: estimatedStorageBytes,
                formatted: formatBytes(estimatedStorageBytes),
            },
            customers: {
                total: totalCustomers,
                due: dueCustomers,
                normal: normalCustomers,
            },
            wholesalers: {
                total: totalWholesalers,
            },
            bills: {
                total: totalBills,
                purchase: purchaseBills,
                sale: saleBills,
            },
            revenue: {
                total: totalRevenue[0]?.total || 0,
                expenses: totalExpenses[0]?.total || 0,
                profit: (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0),
            },
        };
    }

    async getAllShopkeepersWithStorage(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find({ role: 'shopkeeper' })
                .select('-password -refreshToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments({ role: 'shopkeeper' }),
        ]);

        // Get storage stats for all shopkeepers in parallel
        const usersWithStorage = await Promise.all(
            users.map(async (user) => {
                const storageStats = await this.getShopkeeperStorageStats(user._id.toString());
                return {
                    ...user.toObject(),
                    storageStats,
                };
            })
        );

        return {
            users: usersWithStorage,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
}

export const userService = new UserService();
