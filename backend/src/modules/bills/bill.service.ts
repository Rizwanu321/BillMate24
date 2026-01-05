import mongoose from 'mongoose';
import { Bill } from './bill.model';
import { Transaction } from '../dashboard/transaction.model';
import { Payment } from '../payments/payment.model';
import { wholesalerService } from '../wholesalers/wholesaler.service';
import { customerService } from '../customers/customer.service';
import { CreateBillInput, BillFilterInput } from './bill.validation';
import { generateBillNumber } from '../../utils/helpers';

export class BillService {
    async create(shopkeeperId: string, input: CreateBillInput): Promise<any> {
        const billNumber = generateBillNumber('BILL');
        const dueAmount = input.totalAmount - input.paidAmount;

        const bill = new Bill({
            ...input,
            shopkeeperId,
            billNumber,
            dueAmount,
        });

        await bill.save();

        // Update entity balances
        if (input.billType === 'purchase' && input.entityId) {
            await wholesalerService.updateBalance(
                shopkeeperId,
                input.entityId,
                input.totalAmount,
                input.paidAmount
            );
        } else if (input.billType === 'sale' && input.entityType !== 'normal_customer' && input.entityId) {
            await customerService.updateBalance(
                shopkeeperId,
                input.entityId,
                input.totalAmount,
                input.paidAmount
            );
        }

        // Create transaction record only if paidAmount > 0
        if (input.paidAmount > 0) {
            const transactionType = input.billType === 'sale' ? 'income' : 'expense';
            const transaction = new Transaction({
                shopkeeperId,
                type: transactionType,
                category: input.billType === 'purchase' ? 'Purchase' : 'Sale',
                amount: input.paidAmount,
                paymentMethod: input.paymentMethod,
                reference: billNumber,
                description: `${input.billType === 'purchase' ? 'Purchase from' : 'Sale to'} ${input.entityName}`,
            });
            await transaction.save();
        }

        // Create payment record if paidAmount > 0 (for tracking in payments history)
        if (input.paidAmount > 0 && input.entityId) {
            const payment = new Payment({
                shopkeeperId,
                entityType: input.billType === 'purchase' ? 'wholesaler' : 'customer',
                entityId: input.entityId,
                entityName: input.entityName,
                amount: input.paidAmount,
                paymentMethod: input.paymentMethod,
                billId: bill._id as any,
                notes: `Payment for bill ${billNumber}`,
            });
            await payment.save();
        }

        return bill.toObject();
    }

    async getAll(
        shopkeeperId: string,
        page: number,
        limit: number,
        filters?: BillFilterInput
    ): Promise<{ bills: any[]; total: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const query: any = { shopkeeperId };

        if (filters?.billType) {
            query.billType = filters.billType;
        }
        if (filters?.entityType) {
            query.entityType = filters.entityType;
        }
        if (filters?.entityId) {
            query.entityId = new mongoose.Types.ObjectId(filters.entityId);
        }
        if (filters?.paymentMethod) {
            query.paymentMethod = filters.paymentMethod;
        }
        if (filters?.startDate || filters?.endDate) {
            query.createdAt = {};
            if (filters.startDate) {
                query.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                // Set end date to end of day (23:59:59.999)
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = endDate;
            }
        }
        // Search filter - search in billNumber and entityName
        if (filters?.search) {
            query.$or = [
                { billNumber: { $regex: filters.search, $options: 'i' } },
                { entityName: { $regex: filters.search, $options: 'i' } },
            ];
        }

        const [bills, total] = await Promise.all([
            Bill.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Bill.countDocuments(query),
        ]);

        return {
            bills: bills.map(b => b.toObject()),
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getById(shopkeeperId: string, id: string): Promise<any> {
        const bill = await Bill.findOne({ _id: id, shopkeeperId });
        if (!bill) {
            throw new Error('Bill not found');
        }
        return bill.toObject();
    }

    async getByBillNumber(shopkeeperId: string, billNumber: string): Promise<any> {
        const bill = await Bill.findOne({ billNumber, shopkeeperId });
        if (!bill) {
            throw new Error('Bill not found');
        }
        return bill.toObject();
    }

    async getRecentBills(shopkeeperId: string, limit: number = 10): Promise<any[]> {
        const bills = await Bill.find({ shopkeeperId })
            .sort({ createdAt: -1 })
            .limit(limit);
        return bills.map(b => b.toObject());
    }

    async getBillStats(shopkeeperId: string): Promise<{
        totalBills: number;
        totalPurchases: number;
        totalSales: number;
        todayBills: number;
    }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalBills, totalPurchases, totalSales, todayBills] = await Promise.all([
            Bill.countDocuments({ shopkeeperId }),
            Bill.countDocuments({ shopkeeperId, billType: 'purchase' }),
            Bill.countDocuments({ shopkeeperId, billType: 'sale' }),
            Bill.countDocuments({ shopkeeperId, createdAt: { $gte: today } }),
        ]);

        return { totalBills, totalPurchases, totalSales, todayBills };
    }
}

export const billService = new BillService();

