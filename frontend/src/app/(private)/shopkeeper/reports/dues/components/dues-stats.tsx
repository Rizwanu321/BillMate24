'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertCircle,
    Users,
    Package,
    IndianRupee,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';

interface DuesStatsProps {
    totalOutstanding: number;
    customerDues: number;
    wholesalerDues: number;
    overdueCount: number;
    customerCount?: number;
    wholesalerCount?: number;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatCompactCurrency(amount: number): string {
    // User requested to see full amounts without K/L suffixes
    return formatCurrency(amount);
}

export function DuesStats({
    totalOutstanding,
    customerDues,
    wholesalerDues,
    overdueCount,
    customerCount = 0,
    wholesalerCount = 0,
}: DuesStatsProps) {
    const netPosition = customerDues - wholesalerDues;
    const isNetPositive = netPosition >= 0;

    return (
        <div className="space-y-6 mb-8">
            {/* Main Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Receivables - From Customers */}
                <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                    <CardContent className="p-3 md:p-6">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                                <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2.5">
                                To Collect
                            </Badge>
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold">{formatCompactCurrency(customerDues)}</h3>
                        <p className="text-white/80 text-[10px] md:text-sm mt-1">From Customers</p>
                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 flex items-center justify-between">
                            <span className="text-[10px] md:text-xs text-white/70">
                                <Users className="h-3 w-3 inline mr-1" />
                                {customerCount} count
                            </span>
                        </div>
                    </CardContent>
                    <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
                </Card>

                {/* Payables - To Wholesalers */}
                <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    <CardContent className="p-3 md:p-6">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                                <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2.5">
                                To Pay
                            </Badge>
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold">{formatCompactCurrency(wholesalerDues)}</h3>
                        <p className="text-white/80 text-[10px] md:text-sm mt-1">To Wholesalers</p>
                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20 flex items-center justify-between">
                            <span className="text-[10px] md:text-xs text-white/70">
                                <Package className="h-3 w-3 inline mr-1" />
                                {wholesalerCount} count
                            </span>
                        </div>
                    </CardContent>
                    <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
                </Card>

                {/* Net Position */}
                <Card className={`relative overflow-hidden border-0 shadow-xl text-white ${isNetPositive
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-br from-red-500 to-rose-600'
                    }`}>
                    <CardContent className="p-3 md:p-6">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                                {isNetPositive ? (
                                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                            </div>
                            <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2.5">
                                {isNetPositive ? 'Net +ve' : 'Net -ve'}
                            </Badge>
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold">{formatCompactCurrency(Math.abs(netPosition))}</h3>
                        <p className="text-white/80 text-[10px] md:text-sm mt-1">
                            {isNetPositive ? 'Receivable' : 'Payable'}
                        </p>
                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">
                            <span className="text-[10px] md:text-xs text-white/70 truncate block">
                                {isNetPositive
                                    ? '↑ More incoming'
                                    : '↓ More outgoing'
                                }
                            </span>
                        </div>
                    </CardContent>
                    <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
                </Card>

                {/* Overdue Alert */}
                <Card className={`relative overflow-hidden border-0 shadow-xl text-white ${overdueCount > 0
                    ? 'bg-gradient-to-br from-red-600 to-pink-600'
                    : 'bg-gradient-to-br from-purple-500 to-violet-600'
                    }`}>
                    <CardContent className="p-3 md:p-6">
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl ${overdueCount > 0 ? 'bg-white/30 animate-pulse' : 'bg-white/20'} backdrop-blur-sm`}>
                                <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <Badge className={`${overdueCount > 0 ? 'bg-white text-red-600' : 'bg-white/20 text-white'} border-0 text-[10px] md:text-xs px-1.5 md:px-2.5`}>
                                {overdueCount > 0 ? 'Urgent' : 'Good'}
                            </Badge>
                        </div>
                        <h3 className="text-xl md:text-3xl font-bold">{overdueCount}</h3>
                        <p className="text-white/80 text-[10px] md:text-sm mt-1">
                            {overdueCount > 0 ? 'Overdue (7+ days)' : 'No Overdue'}
                        </p>
                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/20">
                            <span className="text-[10px] md:text-xs text-white/70 truncate block">
                                {overdueCount > 0
                                    ? '⚠️ Action needed'
                                    : '✓ On track'
                                }
                            </span>
                        </div>
                    </CardContent>
                    <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
                </Card>
            </div>

            {/* Summary Bar */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-slate-800 via-slate-800 to-slate-700">
                <CardContent className="py-3 px-4 md:py-4 md:px-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-2 text-white w-full md:w-auto justify-between md:justify-start">
                            <div className="flex items-center gap-2">
                                <IndianRupee className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                                <span className="text-sm">Total Outstanding:</span>
                            </div>
                            <span className="text-lg md:text-xl font-bold text-yellow-400">{formatCurrency(totalOutstanding)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm w-full md:w-auto">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                <span className="text-gray-300">Receivables: {formatCompactCurrency(customerDues)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                                <span className="text-gray-300">Payables: {formatCompactCurrency(wholesalerDues)}</span>
                            </div>
                            {overdueCount > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></div>
                                    <span className="text-red-300">{overdueCount} Overdue</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
