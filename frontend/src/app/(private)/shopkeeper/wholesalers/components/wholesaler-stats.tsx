'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, CheckCircle, XCircle, AlertCircle, IndianRupee, Users } from 'lucide-react';

interface WholesalerStatsProps {
    stats: {
        total: number;
        active: number;
        inactive: number;
        deleted: number;
        withDues: number;
        totalOutstanding: number;
    };
    isLoading?: boolean;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function WholesalerStats({ stats, isLoading }: WholesalerStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-0 shadow-lg md:shadow-xl animate-pulse rounded-xl md:rounded-2xl">
                        <CardContent className="p-3 md:p-6">
                            <div className="h-16 md:h-24 bg-gray-200 rounded-xl" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const activePercentage = stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0;

    // Format compact currency for mobile
    const formatCompact = (amount: number): string => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) {
            return `₹${(amount / 1000).toFixed(1)}K`;
        }
        return formatCurrency(amount);
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-6">
            {/* Total Wholesalers */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl md:rounded-2xl">
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            <Package className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">
                            All
                        </Badge>
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold">{stats.total}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">Total</p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">Active Rate</span>
                        <span className="font-semibold">{activePercentage}%</span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>

            {/* Active Wholesalers */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl md:rounded-2xl">
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">
                            Active
                        </Badge>
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold">{stats.active}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">Active</p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">Inactive</span>
                        <span className="font-semibold">{stats.inactive} partners</span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>

            {/* With Dues */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl md:rounded-2xl">
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">
                            Pending
                        </Badge>
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold">{stats.withDues}</h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">With Dues</p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">Follow-up</span>
                        <span className="font-semibold">{stats.withDues > 0 ? '⚠️' : '✓'}</span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>

            {/* Total Outstanding */}
            <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl md:rounded-2xl">
                <CardContent className="p-3 md:p-6">
                    <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                            <IndianRupee className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">
                            Due
                        </Badge>
                    </div>
                    <h3 className="text-lg md:text-3xl font-bold">
                        <span className="md:hidden">{formatCompact(stats.totalOutstanding)}</span>
                        <span className="hidden md:inline">{formatCurrency(stats.totalOutstanding)}</span>
                    </h3>
                    <p className="text-white/80 text-xs md:text-sm mt-0.5 md:mt-1">Outstanding</p>
                    <div className="flex mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 items-center justify-between text-[10px] md:text-sm">
                        <span className="text-white/70">Partners</span>
                        <span className="font-semibold">{stats.withDues} with dues</span>
                    </div>
                </CardContent>
                <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
            </Card>
        </div>
    );
}
