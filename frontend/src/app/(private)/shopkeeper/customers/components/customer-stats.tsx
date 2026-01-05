'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, IndianRupee, CreditCard, AlertCircle } from 'lucide-react';

interface CustomerStatsProps {
    totalCustomers: number;
    totalSales: number;
    totalPaid: number;
    totalOutstanding: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function CustomerStats({
    totalCustomers,
    totalSales,
    totalPaid,
    totalOutstanding
}: CustomerStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Total Customers</p>
                            <p className="text-3xl font-bold">{totalCustomers}</p>
                        </div>
                        <Users className="h-10 w-10 text-purple-200" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Sales</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
                        </div>
                        <IndianRupee className="h-10 w-10 text-blue-200" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Total Received</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                        </div>
                        <CreditCard className="h-10 w-10 text-green-200" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm">Outstanding</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
                        </div>
                        <AlertCircle className="h-10 w-10 text-red-200" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
