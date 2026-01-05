import mongoose from 'mongoose';
import { connectDatabase } from '../config';
import { User } from '../modules/users/user.model';
import { hashPassword } from './auth';

const seedDatabase = async () => {
    try {
        await connectDatabase();
        console.log('🌱 Starting database seed...');

        // Check if admin exists
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('⚠️ Admin user already exists. Skipping seed.');
        } else {
            // Create admin user
            const adminPassword = await hashPassword('Admin@123');

            const admin = new User({
                email: 'admin@rms.com',
                password: adminPassword,
                name: 'System Admin',
                role: 'admin',
                isActive: true,
                features: {
                    wholesalers: true,
                    dueCustomers: true,
                    normalCustomers: true,
                    billing: true,
                    reports: true,
                },
            });

            await admin.save();
            console.log('✅ Admin user created:');
            console.log('   Email: admin@rms.com');
            console.log('   Password: Admin@123');
        }

        // Create demo shopkeeper
        const existingShopkeeper = await User.findOne({ email: 'shop@rms.com' });

        if (!existingShopkeeper) {
            const shopkeeperPassword = await hashPassword('Shop@123');

            const shopkeeper = new User({
                email: 'shop@rms.com',
                password: shopkeeperPassword,
                name: 'Demo Shopkeeper',
                role: 'shopkeeper',
                businessName: 'Demo Store',
                phone: '9876543210',
                address: 'Demo Address, City',
                isActive: true,
                features: {
                    wholesalers: true,
                    dueCustomers: true,
                    normalCustomers: true,
                    billing: true,
                    reports: true,
                },
            });

            await shopkeeper.save();
            console.log('✅ Demo shopkeeper created:');
            console.log('   Email: shop@rms.com');
            console.log('   Password: Shop@123');
        }

        console.log('🎉 Database seed completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
};

seedDatabase();
