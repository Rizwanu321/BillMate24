'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, IndianRupee, CreditCard, AlertCircle, TrendingUp, TrendingDown, FileText, Wallet } from 'lucide-react';

interface WholesalerDashboardStatsProps {
    totalWholesalers: number;
    totalPurchases: number;
    totalPaid: number;
    totalOutstanding: number;
    thisMonthPurchases: number;
    lastMonthPurchases: number;
    billCount?: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatCompactCurrency(amount: number): string {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return formatCurrency(amount);
}

export function WholesalerDashboardStats({
    totalWholesalers,
    totalPurchases,
    totalPaid,
    totalOutstanding,
    thisMonthPurchases,
    lastMonthPurchases,
    billCount = 0
}: WholesalerDashboardStatsProps) {
    const growth = lastMonthPurchases > 0
        ? ((thisMonthPurchases - lastMonthPurchases) / lastMonthPurchases * 100).toFixed(1)
        : thisMonthPurchases > 0 ? 100 : 0;

    const isPositiveGrowth = Number(growth) >= 0;
    const paymentPercentage = totalPurchases > 0 ? (totalPaid / totalPurchases * 100).toFixed(0) : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            {/* Total Purchases */}
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
                    <h3 className="text-lg md:text-3xl font-bold">{formatCompactCurrency(totalPurchases)}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">Total Purchases</p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">Previous</span>
                        <span className="font-semibold">{formatCompactCurrency(lastMonthPurchases)}</span>
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
                    <h3 className="text-lg md:text-3xl font-bold">{formatCompactCurrency(totalPaid)}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">Amount Paid</p>
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
                    <h3 className="text-lg md:text-3xl font-bold">{formatCompactCurrency(Math.max(0, totalOutstanding))}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">Outstanding</p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">Pending</span>
                        <span className="font-semibold">{totalWholesalers} wholesalers</span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>

            {/* Growth */}
            <Card className={`relative overflow-hidden border-0 shadow-lg md:shadow-xl text-white ${isPositiveGrowth
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                : 'bg-gradient-to-br from-gray-500 to-slate-600'
                }`}>
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            {isPositiveGrowth ? <TrendingUp className="h-4 w-4 md:h-5 md:w-5" /> : <TrendingDown className="h-4 w-4 md:h-5 md:w-5" />}
                        </div>
                        <Badge className={`border-0 text-[10px] md:text-xs px-1.5 md:px-2 ${isPositiveGrowth ? 'bg-white/20 text-white' : 'bg-white text-gray-600'}`}>
                            {isPositiveGrowth ? '↑' : '↓'}
                        </Badge>
                    </div>
                    <h3 className="text-lg md:text-3xl font-bold">{isPositiveGrowth ? '+' : ''}{growth}%</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">vs Previous</p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">Wholesalers</span>
                        <span className="font-semibold">{totalWholesalers} active</span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>
        </div>
    );
}
