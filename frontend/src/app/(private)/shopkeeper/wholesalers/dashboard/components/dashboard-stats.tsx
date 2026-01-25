'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, IndianRupee, CreditCard, AlertCircle, TrendingUp, TrendingDown, FileText, Wallet, Users } from 'lucide-react';

// ... existing interfaces and helpers ...

interface WholesalerDashboardStatsProps {
    totalWholesalers: number;
    totalPurchases: number;
    totalPaid: number;
    totalOutstanding: number;
    thisMonthPurchases: number;
    lastMonthPurchases: number;
    billCount?: number;
    timeFilter?: string;
    duesData?: {
        totalWholesalerDue: number;
        totalCustomerDue?: number;
        totalWholesalerPurchased?: number;
    };
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}



export function WholesalerDashboardStats({
    totalWholesalers,
    totalPurchases,
    totalPaid,
    totalOutstanding,
    thisMonthPurchases,
    lastMonthPurchases,
    billCount = 0,
    timeFilter = 'today',
    duesData
}: WholesalerDashboardStatsProps) {
    const growth = lastMonthPurchases > 0
        ? ((thisMonthPurchases - lastMonthPurchases) / lastMonthPurchases * 100).toFixed(1)
        : thisMonthPurchases > 0 ? 100 : 0;

    const isPositiveGrowth = Number(growth) >= 0;
    const isAllTime = timeFilter === 'all_time';

    // For "All Time", use duesData which includes opening balance
    const displayOutstanding = isAllTime && duesData ? duesData.totalWholesalerDue : totalOutstanding;

    // Calculate total purchases derived from outstanding + paid to ensure consistency
    const displayPurchases = isAllTime && duesData
        ? displayOutstanding + totalPaid
        : totalPurchases;

    const paymentPercentage = displayPurchases > 0 ? (totalPaid / displayPurchases * 100).toFixed(0) : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            {/* Total Purchases / Total Payables */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            <IndianRupee className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">
                            {billCount} bills
                        </Badge>
                    </div>
                    <h3 className="text-lg md:text-3xl font-bold">{formatCurrency(displayPurchases)}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">
                        Total Purchases{isAllTime ? '' : ''}
                    </p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">
                            {isAllTime ? 'All Time' : 'Previous'}
                        </span>
                        <span className="font-semibold">
                            {isAllTime ? '(incl. opening)' : formatCurrency(lastMonthPurchases)}
                        </span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>

            {/* Amount Paid */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            <Wallet className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">
                            {paymentPercentage}%
                        </Badge>
                    </div>
                    <h3 className="text-lg md:text-3xl font-bold">{formatCurrency(totalPaid)}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">
                        Amount Paid{isAllTime ? ' (bills)' : ''}
                    </p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">Payment Rate</span>
                        <span className="font-semibold">{paymentPercentage}%</span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>

            {/* Outstanding Due */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-red-500 to-rose-600 text-white">
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">
                            Due
                        </Badge>
                    </div>
                    <h3 className="text-lg md:text-3xl font-bold">{formatCurrency(Math.max(0, displayOutstanding))}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">
                        Outstanding{isAllTime ? ' (All Time)' : ''}
                    </p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">
                            {isAllTime ? 'Total Due' : 'Pending'}
                        </span>
                        <span className="font-semibold">
                            {isAllTime ? '(incl. opening)' : `${totalWholesalers} wholesalers`}
                        </span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>

            {/* Growth / Wholesaler Count (All Time) */}
            <Card className={`relative overflow-hidden border-0 shadow-lg md:shadow-xl text-white ${isAllTime
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                : isPositiveGrowth
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    : 'bg-gradient-to-br from-gray-500 to-slate-600'
                }`}>
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            {isAllTime ? (
                                <Users className="h-4 w-4 md:h-5 md:w-5" />
                            ) : (
                                isPositiveGrowth ? <TrendingUp className="h-4 w-4 md:h-5 md:w-5" /> : <TrendingDown className="h-4 w-4 md:h-5 md:w-5" />
                            )}
                        </div>
                        <Badge className={`border-0 text-[10px] md:text-xs px-1.5 md:px-2 ${isAllTime ? 'bg-white/20 text-white' : (isPositiveGrowth ? 'bg-white/20 text-white' : 'bg-white text-gray-600')}`}>
                            {isAllTime ? 'Network' : (isPositiveGrowth ? '↑' : '↓')}
                        </Badge>
                    </div>
                    <h3 className="text-lg md:text-3xl font-bold">
                        {isAllTime ? totalWholesalers : `${isPositiveGrowth ? '+' : ''}${growth}%`}
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">
                        {isAllTime ? 'Total Wholesalers' : 'vs Previous'}
                    </p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">
                            {isAllTime ? 'Active Vendors' : 'Wholesalers'}
                        </span>
                        <span className="font-semibold">
                            {isAllTime ? '(Lifetime)' : `${totalWholesalers} active`}
                        </span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>
        </div>
    );
}
