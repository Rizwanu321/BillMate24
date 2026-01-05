import { User } from './user.model';
import { hashPassword } from '../../utils/auth';
import { CreateShopkeeperInput, UpdateShopkeeperInput, UpdateFeaturesInput } from './user.validation';
import { IUser, Features } from '../../types';

export class UserService {
    async createShopkeeper(input: CreateShopkeeperInput): Promise<Omit<IUser, 'password' | 'refreshToken'>> {
        const existingUser = await User.findOne({ email: input.email.toLowerCase() });

        if (existingUser) {
            throw new Error('Email already registered');
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
}

export const userService = new UserService();
