'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Header } from '@/components/app/header';
import { Button } from '@/components/ui/button';
import { Package, CreditCard, Calendar, LayoutDashboard } from 'lucide-react';
import api from '@/config/axios';
import { format } from 'date-fns';
import {
    WholesalerDashboardStats,
    TopWholesalers,
    RecentPurchases,
    PaymentMethodsBreakdown,
    TimeFilter,
    getDateRange,
    TimeFilterOption,
    DateRange
} from './components';

interface Wholesaler {
    _id: string;
    name: string;
    totalPurchased: number;
    totalPaid: number;
    outstandingDue: number;
}

interface Bill {
    _id: string;
    billNumber: string;
    entityId: string;
    entityName: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    createdAt: string;
    updatedAt: string;
}

interface Payment {
    _id: string;
    entityId: string;
    entityName: string;
    entityType: 'wholesaler' | 'customer';
    amount: number;
    paymentMethod: string;
    createdAt: string;
    billId?: string;
}

interface WholesalerPeriodData {
    _id: string;
    name: string;
    totalPurchased: number;
    totalPaid: number;
    outstandingDue: number;
}

export default function WholesalerDashboardPage() {
    const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('today');
    const [dateRange, setDateRange] = useState<DateRange>(getDateRange('today'));

    const handleTimeFilterChange = (option: TimeFilterOption, range: DateRange) => {
        setTimeFilter(option);
        setDateRange(range);
    };

    // Format dates for API
    const startDate = format(dateRange.startDate, 'yyyy-MM-dd');
    const endDate = format(dateRange.endDate, 'yyyy-MM-dd');

    // Fetch all wholesalers (for count only)
    const { data: wholesalersData } = useQuery({
        queryKey: ['wholesalers-all'],
        queryFn: async () => {
            const response = await api.get('/wholesalers?limit=100');
            return response.data;
        },
    });

    // Fetch purchases for selected period
    const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
        queryKey: ['purchases-filtered', startDate, endDate],
        queryFn: async () => {
            const response = await api.get(`/bills?billType=purchase&startDate=${startDate}&endDate=${endDate}&limit=100`);
            return response.data;
        },
    });

    // Fetch wholesaler payments for selected period
    const { data: paymentsData } = useQuery({
        queryKey: ['wholesaler-payments', startDate, endDate],
        queryFn: async () => {
            const response = await api.get(`/payments?entityType=wholesaler&startDate=${startDate}&endDate=${endDate}&limit=1000`);
            return response.data;
        },
    });

    // Fetch previous period data for comparison
    // Fetch previous period data for comparison
    const timeDiff = dateRange.endDate.getTime() - dateRange.startDate.getTime();
    // For single days (today/yesterday), timeDiff is < 24h, so we just subtract 1 day
    const subtractAmount = timeDiff < 86400000 ? 86400000 : (timeDiff + 86400000);

    const previousStartDate = format(
        new Date(dateRange.startDate.getTime() - subtractAmount),
        'yyyy-MM-dd'
    );
    const previousEndDate = format(
        new Date(dateRange.endDate.getTime() - subtractAmount),
        'yyyy-MM-dd'
    );

    const { data: previousPurchasesData } = useQuery({
        queryKey: ['previous-purchases', previousStartDate, previousEndDate],
        queryFn: async () => {
            const response = await api.get(`/bills?billType=purchase&startDate=${previousStartDate}&endDate=${previousEndDate}&limit=1000`);
            return response.data;
        },
        enabled: timeFilter !== 'all_time',
    });

    // Fetch total dues data (includes opening balance) - needed for "All Time" view
    const { data: duesData } = useQuery({
        queryKey: ['wholesaler-dues'],
        queryFn: async () => {
            const response = await api.get('/wholesalers?limit=1000');
            const data = response.data.data || [];

            const totalWholesalerDue = data.reduce(
                (sum: number, w: any) => sum + (w.outstandingDue || 0),
                0
            );

            const totalWholesalerPurchased = data.reduce(
                (sum: number, w: any) => sum + (w.totalPurchased || 0),
                0
            );

            return {
                totalWholesalerDue,
                totalWholesalerPurchased
            };
        },
        refetchOnMount: 'always',
        staleTime: 0,
    });

    const allWholesalers = (wholesalersData?.data || []) as Wholesaler[];
    const purchases = (purchasesData?.data || []) as Bill[];
    const payments = (paymentsData?.data || []) as Payment[];
    const previousPurchases = (previousPurchasesData?.data || []) as Bill[];

    // Calculate period-based wholesaler data from bills AND payments
    const periodWholesalers = useMemo(() => {
        // For All Time, use the comprehensive wholesaler data which includes opening balances
        if (timeFilter === 'all_time') {
            return allWholesalers
                .map(w => ({
                    _id: w._id,
                    name: w.name,
                    totalPurchased: w.totalPurchased,
                    totalPaid: w.totalPaid,
                    outstandingDue: w.outstandingDue
                }))
                .sort((a, b) => b.totalPurchased - a.totalPurchased);
        }

        const wholesalerMap: Record<string, WholesalerPeriodData> = {};

        // First add bill data
        purchases.forEach(bill => {
            if (!wholesalerMap[bill.entityId]) {
                wholesalerMap[bill.entityId] = {
                    _id: bill.entityId,
                    name: bill.entityName,
                    totalPurchased: 0,
                    totalPaid: 0,
                    outstandingDue: 0,
                };
            }
            wholesalerMap[bill.entityId].totalPurchased += bill.totalAmount;
            // Initial payment made at bill creation (if any)
            wholesalerMap[bill.entityId].totalPaid += bill.paidAmount;
        });

        // Then add additional payments made in the period
        payments.forEach(payment => {
            if (wholesalerMap[payment.entityId]) {
                // Only add if not already counted as bill.paidAmount
                // Payments without billId are separate payments
                // Payments with billId might already be reflected in bill.paidAmount
                // BUT based on user's data, the paidAmount on bill is only the initial payment
                // Subsequent payments are separate - so we should only count payments 
                // made AFTER the bill creation or payments without billId

                // For accuracy, we add all payments but need to check if they're already in paidAmount
                // The safest approach: if payment has no billId, it's definitely separate
                // If payment has billId, it could be the initial payment or a subsequent payment
                // We should NOT double count, but the data shows paidAmount is only initial

                // Since bills only show initial paidAmount and payments are subsequent,
                // we can safely add all payments from the payment records
                // But we need to avoid double counting - the bill.paidAmount is the initial
                // and payment records are created for ALL payments including initial

                // For now, let's just use the total payments from the Payment collection
                // as the source of truth for totalPaid
            }
        });

        // Recalculate totalPaid using only Payment records for accuracy
        // This avoids the issue of bill.paidAmount being only initial payment
        const paymentsByWholesaler: Record<string, number> = {};
        payments.forEach(payment => {
            if (!paymentsByWholesaler[payment.entityId]) {
                paymentsByWholesaler[payment.entityId] = 0;
            }
            paymentsByWholesaler[payment.entityId] += payment.amount;
        });

        // Update wholesaler totals with payment data
        Object.keys(wholesalerMap).forEach(wholesalerId => {
            // Use payment records as source of truth for paid amount
            wholesalerMap[wholesalerId].totalPaid = paymentsByWholesaler[wholesalerId] || wholesalerMap[wholesalerId].totalPaid;
            // Recalculate outstanding
            wholesalerMap[wholesalerId].outstandingDue =
                wholesalerMap[wholesalerId].totalPurchased - wholesalerMap[wholesalerId].totalPaid;
        });

        return Object.values(wholesalerMap).sort((a, b) => b.totalPurchased - a.totalPurchased);
    }, [purchases, payments, timeFilter, allWholesalers]);

    // Process purchases using pro-rata allocation based on wholesaler-level totals
    // This fixes the issue where payments aren't linked to specific bills
    const processedPurchases = useMemo(() => {
        // First, calculate totals per wholesaler from bills
        const billsByWholesaler: Record<string, Bill[]> = {};
        purchases.forEach(bill => {
            if (!billsByWholesaler[bill.entityId]) {
                billsByWholesaler[bill.entityId] = [];
            }
            billsByWholesaler[bill.entityId].push(bill);
        });

        // Calculate total payments per wholesaler
        const paymentsByWholesaler: Record<string, number> = {};
        payments.forEach(p => {
            paymentsByWholesaler[p.entityId] = (paymentsByWholesaler[p.entityId] || 0) + p.amount;
        });

        return purchases.map(bill => {
            const wholesalerBills = billsByWholesaler[bill.entityId] || [];
            const totalBilled = wholesalerBills.reduce((s, b) => s + b.totalAmount, 0);
            const totalPaid = paymentsByWholesaler[bill.entityId] || 0;
            const totalDue = Math.max(0, totalBilled - totalPaid);

            // Pro-rata allocation: this bill's share of outstanding
            const billPortion = totalBilled > 0 ? bill.totalAmount / totalBilled : 0;
            const billDue = billPortion * totalDue;
            const billPaid = bill.totalAmount - billDue;

            return {
                ...bill,
                paidAmount: Math.max(0, billPaid),
                dueAmount: Math.max(0, billDue)
            };
        });
    }, [purchases, payments]);

    // Calculate stats for the selected period
    const periodPurchases = purchases.reduce((sum, b) => sum + b.totalAmount, 0);
    // Use payment records as the source of truth for total paid
    const periodPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const periodOutstanding = periodPurchases - periodPaid;
    const previousPeriodPurchases = previousPurchases.reduce((sum, b) => sum + b.totalAmount, 0);

    // Calculate payment methods breakdown
    const paymentBreakdown = useMemo(() => {
        const breakdown = { cash: 0, card: 0, online: 0 };

        // Use payment records for breakdown (more accurate)
        payments.forEach(payment => {
            const method = payment.paymentMethod as keyof typeof breakdown;
            if (breakdown[method] !== undefined) {
                breakdown[method] += payment.amount;
            }
        });

        return breakdown;
    }, [payments]);

    // Total wholesalers count
    const totalWholesalers = allWholesalers.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/20">
            <Header title="Wholesaler Dashboard" />

            {/* Mobile-optimized content */}
            <div className="p-3 md:p-6">
                {/* Welcome Section - Compact on mobile */}
                <div className="mb-4 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                                Wholesaler Dashboard
                            </h2>
                            <LayoutDashboard className="h-5 w-5 md:h-8 md:w-8 text-indigo-600" />
                        </div>
                        <p className="text-gray-600 text-xs md:text-base mt-0.5 md:mt-1 flex items-center gap-1.5 md:gap-2">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                            {format(new Date(), 'EEE, MMM d, yyyy')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
                        {/* Desktop action buttons */}
                        <Link href="/shopkeeper/wholesalers" className="hidden md:block">
                            <Button variant="outline" className="shadow-sm">
                                <Package className="h-4 w-4 mr-2" />
                                All Wholesalers
                            </Button>
                        </Link>
                        <Link href="/shopkeeper/wholesalers/payments" className="hidden md:block">
                            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/25">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Make Payment
                            </Button>
                        </Link>
                    </div>
                </div>

                <WholesalerDashboardStats
                    totalWholesalers={periodWholesalers.length}
                    totalPurchases={periodPurchases}
                    totalPaid={periodPaid}
                    totalOutstanding={periodOutstanding}
                    thisMonthPurchases={periodPurchases}
                    lastMonthPurchases={previousPeriodPurchases}
                    billCount={purchases.length}
                    timeFilter={timeFilter}
                    duesData={duesData}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                    <TopWholesalers
                        wholesalers={periodWholesalers}
                        isLoading={purchasesLoading}
                    />
                    <PaymentMethodsBreakdown
                        breakdown={paymentBreakdown}
                        totalPaid={periodPaid}
                        isLoading={purchasesLoading}
                    />
                </div>

                {/* Recent Purchases - Full Width */}
                <div className="mt-3 md:mt-6">
                    <RecentPurchases
                        purchases={processedPurchases}
                        isLoading={purchasesLoading}
                    />
                </div>
            </div>
        </div>
    );
}
