import { Customer } from './customer.model';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.validation';

type CustomerType = 'due' | 'normal';

export class CustomerService {
    async create(shopkeeperId: string, input: CreateCustomerInput): Promise<any> {
        const customer = new Customer({
            ...input,
            shopkeeperId,
        });
        await customer.save();
        return customer.toObject();
    }

    async getAll(
        shopkeeperId: string,
        customerType: CustomerType | undefined,
        page: number,
        limit: number,
        search?: string,
        status?: string,
        duesFilter?: string,
        sortBy?: string
    ): Promise<{ customers: any[]; total: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const query: any = { shopkeeperId };

        // Filter by customer type
        if (customerType) {
            query.type = customerType;
        }

        // Search filter - include name, phone, and address
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
            ];
        }

        // Status filter
        if (status === 'active') {
            query.isActive = { $ne: false };
        } else if (status === 'inactive') {
            query.isActive = false;
        }

        // Dues filter
        if (duesFilter === 'with_dues') {
            query.outstandingDue = { $gt: 0 };
        } else if (duesFilter === 'clear') {
            query.outstandingDue = { $lte: 0 };
        }

        // Sorting
        let sort: any = { createdAt: -1 }; // default
        switch (sortBy) {
            case 'name':
                sort = { name: 1 };
                break;
            case 'totalSales':
                sort = { totalSales: -1 };
                break;
            case 'outstandingDue':
                sort = { outstandingDue: -1 };
                break;
            case 'createdAt':
            default:
                sort = { createdAt: -1 };
                break;
        }

        const [customers, total] = await Promise.all([
            Customer.find(query).sort(sort).skip(skip).limit(limit),
            Customer.countDocuments(query),
        ]);

        return {
            customers: customers.map(c => c.toObject()),
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getById(shopkeeperId: string, id: string): Promise<any> {
        const customer = await Customer.findOne({ _id: id, shopkeeperId });
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer.toObject();
    }

    async update(shopkeeperId: string, id: string, input: UpdateCustomerInput): Promise<any> {
        const customer = await Customer.findOneAndUpdate(
            { _id: id, shopkeeperId },
            { $set: input },
            { new: true }
        );
        if (!customer) {
            throw new Error('Customer not found');
        }
        return customer.toObject();
    }

    async delete(shopkeeperId: string, id: string): Promise<void> {
        const result = await Customer.deleteOne({ _id: id, shopkeeperId });
        if (result.deletedCount === 0) {
            throw new Error('Customer not found');
        }
    }

    async getDashboardStats(shopkeeperId: string, type: CustomerType): Promise<{
        totalCustomers: number;
        totalSales: number;
        totalPaid: number;
        totalOutstanding: number;
    }> {
        const result = await Customer.aggregate([
            { $match: { shopkeeperId: shopkeeperId, type } },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    totalSales: { $sum: '$totalSales' },
                    totalPaid: { $sum: '$totalPaid' },
                    totalOutstanding: { $sum: '$outstandingDue' },
                },
            },
        ]);

        return result[0] || {
            totalCustomers: 0,
            totalSales: 0,
            totalPaid: 0,
            totalOutstanding: 0,
        };
    }

    async updateBalance(
        shopkeeperId: string,
        id: string,
        saleAmount: number,
        paidAmount: number
    ): Promise<void> {
        await Customer.findOneAndUpdate(
            { _id: id, shopkeeperId },
            {
                $inc: {
                    totalSales: saleAmount,
                    totalPaid: paidAmount,
                    outstandingDue: saleAmount - paidAmount,
                },
                $set: {
                    lastPaymentDate: paidAmount > 0 ? new Date() : undefined,
                },
            }
        );
    }

    async recordPayment(shopkeeperId: string, id: string, amount: number): Promise<void> {
        const customer = await Customer.findOne({ _id: id, shopkeeperId });
        if (!customer) {
            throw new Error('Customer not found');
        }

        await Customer.findOneAndUpdate(
            { _id: id, shopkeeperId },
            {
                $inc: {
                    totalPaid: amount,
                    outstandingDue: -amount,
                },
                $set: {
                    lastPaymentDate: new Date(),
                },
            }
        );
    }

    async getStats(
        shopkeeperId: string,
        customerType?: CustomerType
    ): Promise<{
        total: number;
        active: number;
        inactive: number;
        withDues: number;
        totalOutstanding: number;
        totalSales: number;
        totalPaid: number;
    }> {
        const baseQuery: any = { shopkeeperId };
        if (customerType) {
            baseQuery.type = customerType;
        }

        const [totalResult, activeResult, inactiveResult, duesResult, financialResult] = await Promise.all([
            // Total count
            Customer.countDocuments(baseQuery),
            // Active count
            Customer.countDocuments({ ...baseQuery, isActive: { $ne: false } }),
            // Inactive count
            Customer.countDocuments({ ...baseQuery, isActive: false }),
            // With dues count
            Customer.countDocuments({ ...baseQuery, outstandingDue: { $gt: 0 } }),
            // Financial aggregation
            Customer.aggregate([
                { $match: baseQuery },
                {
                    $group: {
                        _id: null,
                        totalOutstanding: { $sum: '$outstandingDue' },
                        totalSales: { $sum: '$totalSales' },
                        totalPaid: { $sum: '$totalPaid' },
                    },
                },
            ]),
        ]);

        const financial = financialResult[0] || { totalOutstanding: 0, totalSales: 0, totalPaid: 0 };

        return {
            total: totalResult,
            active: activeResult,
            inactive: inactiveResult,
            withDues: duesResult,
            totalOutstanding: financial.totalOutstanding,
            totalSales: financial.totalSales,
            totalPaid: financial.totalPaid,
        };
    }
}

export const customerService = new CustomerService();
