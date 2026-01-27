'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Header } from '@/components/app/header';
import { Button } from '@/components/ui/button';
import { Calendar, Users, CreditCard, LayoutDashboard } from 'lucide-react';
import api from '@/config/axios';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
    CustomerDashboardStats,
    TopCustomers,
    RecentSales,
    PendingDues,
    PaymentMethodsBreakdown,
    TimeFilter,
    getDateRange,
    TimeFilterOption,
    DateRange
} from './components';

interface Customer {
    _id: string;
    name: string;
    phone?: string;
    customerType: 'due' | 'normal';
    totalPurchased: number;
    totalPaid: number;
    outstandingDue: number;
    lastTransactionDate?: string;
}

interface Bill {
    _id: string;
    billNumber: string;
    entityId: string;
    entityName: string;
    entityType: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentMethod: 'cash' | 'card' | 'online';
    createdAt: string;
}

interface Payment {
    _id: string;
    entityId: string;
    entityName: string;
    entityType: 'wholesaler' | 'customer';
    amount: number;
    paymentMethod: string;
    createdAt: string;
}

interface CustomerPeriodData {
    _id: string;
    name: string;
    phone?: string;
    customerType: 'due' | 'normal';
    totalPurchased: number;
    totalPaid: number;
    outstandingDue: number;
    lastTransactionDate?: string;
}

export default function CustomerDashboardPage() {
    const { t } = useTranslation();
    const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('today');
    const [dateRange, setDateRange] = useState<DateRange>(getDateRange('today'));

    const handleTimeFilterChange = (option: TimeFilterOption, range: DateRange) => {
        setTimeFilter(option);
        setDateRange(range);
    };

    // Format dates for API
    const startDate = format(dateRange.startDate, 'yyyy-MM-dd');
    const endDate = format(dateRange.endDate, 'yyyy-MM-dd');

    // Fetch due customers (needed for listing)
    const { data: dueCustomersData } = useQuery({
        queryKey: ['due-customers-all'],
        queryFn: async () => {
            const response = await api.get('/customers?type=due&limit=100');
            return response.data;
        },
    });

    // New Query: Fetch aggregate stats for "All Time" accuracy (including opening balances)
    const { data: summaryStats } = useQuery({
        queryKey: ['customer-dashboard-summary-stats'],
        queryFn: async () => {
            const response = await api.get('/customers/stats?type=due');
            return response.data.data;
        },
        staleTime: 0,
        refetchOnMount: 'always'
    });

    // Normal customers are walk-in customers tracked via bills, not a separate entity
    // So we don't need to fetch a separate list - sales data already includes normal customer transactions

    // Fetch sales for selected period
    const { data: salesData, isLoading: salesLoading } = useQuery({
        queryKey: ['sales-filtered', startDate, endDate],
        queryFn: async () => {
            const response = await api.get(`/bills?billType=sale&startDate=${startDate}&endDate=${endDate}&limit=100`);
            return response.data;
        },
    });

    // Fetch customer payments for selected period
    const { data: paymentsData } = useQuery({
        queryKey: ['customer-payments', startDate, endDate],
        queryFn: async () => {
            const response = await api.get(`/payments?entityType=customer&startDate=${startDate}&endDate=${endDate}&limit=1000`);
            return response.data;
        },
    });

    // Fetch previous period data for comparison
    const previousStartDate = format(
        new Date(dateRange.startDate.getTime() - (dateRange.endDate.getTime() - dateRange.startDate.getTime() + 86400000)),
        'yyyy-MM-dd'
    );
    const previousEndDate = format(
        new Date(dateRange.startDate.getTime() - 86400000),
        'yyyy-MM-dd'
    );

    const { data: previousSalesData } = useQuery({
        queryKey: ['previous-sales', previousStartDate, previousEndDate],
        queryFn: async () => {
            const response = await api.get(`/bills?billType=sale&startDate=${previousStartDate}&endDate=${previousEndDate}&limit=1000`);
            return response.data;
        },
        enabled: timeFilter !== 'all_time',
    });

    // Combine all customers - only due customers have a dedicated list
    // Normal customers are derived from bill data
    const allDueCustomers = (dueCustomersData?.data || []).map((c: Customer) => ({
        ...c,
        customerType: 'due' as const
    }));
    const allCustomers = [...allDueCustomers];

    const sales = (salesData?.data || []) as Bill[];
    const payments = (paymentsData?.data || []) as Payment[];
    const previousSales = (previousSalesData?.data || []) as Bill[];

    // Calculate period-based customer data from bills AND payments
    const periodCustomers = useMemo(() => {
        const customerMap: Record<string, CustomerPeriodData> = {};

        // First add sales data
        sales.forEach(bill => {
            if (!customerMap[bill.entityId]) {
                const existingCustomer = allCustomers.find(c => c._id === bill.entityId);
                customerMap[bill.entityId] = {
                    _id: bill.entityId,
                    name: bill.entityName,
                    phone: existingCustomer?.phone,
                    customerType: bill.entityType === 'due_customer' ? 'due' : 'normal',
                    totalPurchased: 0,
                    totalPaid: 0,
                    outstandingDue: 0,
                    lastTransactionDate: bill.createdAt,
                };
            }
            customerMap[bill.entityId].totalPurchased += bill.totalAmount;
            // Add initial paid amount from bill (immediate cash payments)
            customerMap[bill.entityId].totalPaid += bill.paidAmount;

            // Update last transaction date
            if (new Date(bill.createdAt) > new Date(customerMap[bill.entityId].lastTransactionDate || '1970-01-01')) {
                customerMap[bill.entityId].lastTransactionDate = bill.createdAt;
            }
        });

        // Add additional payments per customer (payments made later, separate from bill creation)
        const paymentsByCustomer: Record<string, number> = {};
        payments.forEach(payment => {
            paymentsByCustomer[payment.entityId] = (paymentsByCustomer[payment.entityId] || 0) + payment.amount;
        });

        // Update customer totals - use MAX of (bill.paidAmount sum) vs (payments sum)
        // This handles both new data (where payments = bill.paidAmount) and old data
        Object.keys(customerMap).forEach(customerId => {
            const billBasedPaid = customerMap[customerId].totalPaid;
            const paymentRecordsPaid = paymentsByCustomer[customerId] || 0;
            // Take the higher value to avoid undercounting
            customerMap[customerId].totalPaid = Math.max(billBasedPaid, paymentRecordsPaid);
            // Recalculate outstanding
            customerMap[customerId].outstandingDue = Math.max(0,
                customerMap[customerId].totalPurchased - customerMap[customerId].totalPaid);
        });

        // For All Time view, supplement with summaryStats data if needed or rely on accurate accumulated queries
        // Currently, we rely on periodCustomers for the LIST below which is fine

        return Object.values(customerMap).sort((a, b) => b.totalPurchased - a.totalPurchased);
    }, [sales, payments, allCustomers]);

    // Calculate stats for the selected period using the accurate periodCustomers data
    const periodSales = sales.reduce((sum, b) => sum + b.totalAmount, 0);
    const billsCollected = sales.reduce((sum, b) => sum + b.paidAmount, 0);
    const paymentsCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    // For Collection, we want the total collected in this period.
    // If we are looking at specific period, simple sum of payments is usually correct.
    // But safely: in "All Time" view (startDate=2020), paymentsCollected will be the total lifetime payments.
    const periodCollected = Math.max(billsCollected, paymentsCollected);

    // Period outstanding for the cards (for non-All-Time views)
    const periodOutstanding = Math.max(0, periodSales - periodCollected);
    const previousPeriodSales = previousSales.reduce((sum, b) => sum + b.totalAmount, 0);

    // Calculate payment methods breakdown
    const paymentBreakdown = useMemo(() => {
        const breakdown = { cash: 0, card: 0, online: 0 };

        // Use bill's paid amount grouped by payment method
        sales.forEach(bill => {
            if (bill.paidAmount > 0 && bill.paymentMethod) {
                const method = bill.paymentMethod as keyof typeof breakdown;
                if (breakdown[method] !== undefined) {
                    breakdown[method] += bill.paidAmount;
                }
            }
        });

        return breakdown;
    }, [sales]);

    // Customers with pending dues
    const customersWithDues = periodCustomers.filter(c => c.outstandingDue > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20">
            <Header title={t('customer_dashboard.customers')} />

            <div className="p-3 md:p-6">
                {/* Header with Filter - Mobile-first responsive */}
                <div className="mb-4 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                <span className="hidden sm:inline">{t('customer_dashboard.title')}</span>
                                <span className="sm:hidden">{t('customer_dashboard.customers')}</span>
                            </h2>
                            <LayoutDashboard className="h-5 w-5 md:h-8 md:w-8 text-indigo-600" />
                        </div>
                        <p className="text-gray-600 mt-0.5 md:mt-1 flex items-center gap-1.5 md:gap-2 text-xs md:text-base">
                            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden md:inline">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                            <span className="md:hidden">{format(new Date(), 'EEE, MMM d')}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <TimeFilter
                            value={timeFilter}
                            onChange={handleTimeFilterChange}
                        />
                        <div className="flex flex-wrap items-center gap-2 ml-auto sm:ml-0">
                            <Link href="/shopkeeper/customers/due">
                                <Button variant="outline" size="sm" className="shadow-sm px-3 md:px-4 h-auto py-2 whitespace-normal leading-tight">
                                    <CreditCard className="h-4 w-4 mr-2 shrink-0" />
                                    <span>{t('customer_dashboard.due_customers')}</span>
                                </Button>
                            </Link>
                            <Link href="/shopkeeper/customers/normal">
                                <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 px-3 md:px-4 h-auto py-2 whitespace-normal leading-tight">
                                    <Users className="h-4 w-4 mr-2 shrink-0" />
                                    <span>{t('customer_dashboard.normal_customers')}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <CustomerDashboardStats
                    totalCustomers={periodCustomers.length}
                    totalSales={periodSales}
                    totalCollected={periodCollected}
                    totalOutstanding={periodOutstanding}
                    transactionCount={sales.length}
                    thisMonthSales={periodSales}
                    lastMonthSales={previousPeriodSales}
                    timeFilter={timeFilter}
                    statsData={summaryStats}
                />

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                    <TopCustomers
                        customers={periodCustomers}
                        isLoading={salesLoading}
                    />
                    <PendingDues
                        customers={customersWithDues}
                        isLoading={salesLoading}
                    />
                </div>

                {/* Payment Methods & Recent Sales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6 mt-3 md:mt-6">
                    <PaymentMethodsBreakdown
                        breakdown={paymentBreakdown}
                        totalCollected={periodCollected}
                        isLoading={salesLoading}
                    />
                    <RecentSales
                        sales={sales}
                        isLoading={salesLoading}
                    />
                </div>
            </div>
        </div>
    );
}
