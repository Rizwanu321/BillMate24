'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Users, IndianRupee, CreditCard, AlertCircle, TrendingUp, TrendingDown, Receipt } from 'lucide-react';

interface CustomerDashboardStatsProps {
    totalCustomers: number;
    totalSales: number;
    totalCollected: number;
    totalOutstanding: number;
    transactionCount: number;
    thisMonthSales: number;
    lastMonthSales: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatCompact(amount: number): string {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
}

export function CustomerDashboardStats({
    totalCustomers,
    totalSales,
    totalCollected,
    totalOutstanding,
    transactionCount,
    thisMonthSales,
    lastMonthSales
}: CustomerDashboardStatsProps) {
    const growth = lastMonthSales > 0
        ? ((thisMonthSales - lastMonthSales) / lastMonthSales * 100).toFixed(1)
        : thisMonthSales > 0 ? 100 : 0;

    const isPositiveGrowth = Number(growth) >= 0;
    const collectionRate = totalSales > 0 ? ((totalCollected / totalSales) * 100).toFixed(1) : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-4 mb-4 md:mb-6">
            {/* Active Customers */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl md:rounded-2xl">
                <div className="absolute -top-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-white/10 rounded-full blur-2xl" />
                <CardContent className="p-3 md:pt-6 md:pb-6 md:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-[10px] md:text-sm font-medium">Customers</p>
                            <p className="text-2xl md:text-4xl font-bold mt-0.5 md:mt-1">{totalCustomers}</p>
                            <p className="text-indigo-200 text-[10px] md:text-xs mt-1 md:mt-2">In selected period</p>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Users className="h-5 w-5 md:h-8 md:w-8" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Total Sales */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl md:rounded-2xl">
                <div className="absolute -top-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-white/10 rounded-full blur-2xl" />
                <CardContent className="p-3 md:pt-6 md:pb-6 md:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-[10px] md:text-sm font-medium">Sales</p>
                            <p className="text-lg md:text-2xl font-bold mt-0.5 md:mt-1">
                                <span className="md:hidden">{formatCompact(totalSales)}</span>
                                <span className="hidden md:inline">{formatCurrency(totalSales)}</span>
                            </p>
                            <p className="text-emerald-200 text-[10px] md:text-xs mt-1 md:mt-2">Total sales amount</p>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm">
                            <IndianRupee className="h-5 w-5 md:h-8 md:w-8" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Amount Collected */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl md:rounded-2xl">
                <div className="absolute -top-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-white/10 rounded-full blur-2xl" />
                <CardContent className="p-3 md:pt-6 md:pb-6 md:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-cyan-100 text-[10px] md:text-sm font-medium">Collected</p>
                            <p className="text-lg md:text-2xl font-bold mt-0.5 md:mt-1">
                                <span className="md:hidden">{formatCompact(totalCollected)}</span>
                                <span className="hidden md:inline">{formatCurrency(totalCollected)}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-1 md:mt-2">
                                <div className="h-1 md:h-1.5 w-12 md:w-16 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full"
                                        style={{ width: `${Math.min(100, Number(collectionRate))}%` }}
                                    />
                                </div>
                                <span className="text-cyan-200 text-[10px] md:text-xs">{collectionRate}%</span>
                            </div>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm">
                            <CreditCard className="h-5 w-5 md:h-8 md:w-8" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Outstanding Dues */}
            <Card className={`relative overflow-hidden border-0 shadow-lg md:shadow-xl text-white rounded-xl md:rounded-2xl ${totalOutstanding > 0
                ? 'bg-gradient-to-br from-rose-500 to-red-600'
                : 'bg-gradient-to-br from-green-500 to-emerald-600'
                }`}>
                <div className="absolute -top-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-white/10 rounded-full blur-2xl" />
                <CardContent className="p-3 md:pt-6 md:pb-6 md:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-[10px] md:text-sm font-medium ${totalOutstanding > 0 ? 'text-rose-100' : 'text-green-100'}`}>
                                Outstanding
                            </p>
                            <p className="text-lg md:text-2xl font-bold mt-0.5 md:mt-1">
                                <span className="md:hidden">{formatCompact(totalOutstanding)}</span>
                                <span className="hidden md:inline">{formatCurrency(totalOutstanding)}</span>
                            </p>
                            <p className={`text-[10px] md:text-xs mt-1 md:mt-2 ${totalOutstanding > 0 ? 'text-rose-200' : 'text-green-200'}`}>
                                {totalOutstanding > 0 ? 'Pending collection' : 'All cleared!'}
                            </p>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm">
                            <AlertCircle className="h-5 w-5 md:h-8 md:w-8" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl md:rounded-2xl">
                <div className="absolute -top-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-white/10 rounded-full blur-2xl" />
                <CardContent className="p-3 md:pt-6 md:pb-6 md:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-[10px] md:text-sm font-medium">Bills</p>
                            <p className="text-2xl md:text-4xl font-bold mt-0.5 md:mt-1">{transactionCount}</p>
                            <p className="text-amber-200 text-[10px] md:text-xs mt-1 md:mt-2">Sales in period</p>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm">
                            <Receipt className="h-5 w-5 md:h-8 md:w-8" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Growth */}
            <Card className={`relative overflow-hidden border-0 shadow-lg md:shadow-xl text-white rounded-xl md:rounded-2xl ${isPositiveGrowth
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
                : 'bg-gradient-to-br from-slate-500 to-gray-600'
                }`}>
                <div className="absolute -top-4 -right-4 w-16 md:w-24 h-16 md:h-24 bg-white/10 rounded-full blur-2xl" />
                <CardContent className="p-3 md:pt-6 md:pb-6 md:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-[10px] md:text-sm font-medium ${isPositiveGrowth ? 'text-teal-100' : 'text-slate-100'}`}>
                                Growth
                            </p>
                            <p className="text-xl md:text-3xl font-bold mt-0.5 md:mt-1">
                                {isPositiveGrowth ? '+' : ''}{growth}%
                            </p>
                            <p className={`text-[10px] md:text-xs mt-1 md:mt-2 ${isPositiveGrowth ? 'text-teal-200' : 'text-slate-200'}`}>
                                vs previous
                            </p>
                        </div>
                        <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm">
                            {isPositiveGrowth ? (
                                <TrendingUp className="h-5 w-5 md:h-8 md:w-8" />
                            ) : (
                                <TrendingDown className="h-5 w-5 md:h-8 md:w-8" />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
