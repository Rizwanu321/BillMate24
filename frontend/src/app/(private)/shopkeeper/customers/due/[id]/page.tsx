'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Receipt, CreditCard } from 'lucide-react';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/config/axios';
import {
    CustomerInfo,
    SalesTable,
    PaymentsTable,
    RecordPaymentDialog,
    SalesFilters,
    Pagination,
    FilterState
} from './components';
import { useTranslation } from 'react-i18next';

interface Customer {
    _id: string;
    name: string;
    phone?: string;
    whatsappNumber?: string;
    address?: string;
    totalSales: number;
    totalPaid: number;
    outstandingDue: number;
    createdAt: string;
}

interface Bill {
    _id: string;
    billNumber: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentMethod: string;
    createdAt: string;
}

interface Payment {
    _id: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    createdAt: string;
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const ITEMS_PER_PAGE = 10;

export default function DueCustomerDetailPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // State
    const [billsPage, setBillsPage] = useState(1);
    const [paymentsPage, setPaymentsPage] = useState(1);
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        timeFilter: 'all',
    });

    // Build query params
    const buildBillsQuery = () => {
        const params = new URLSearchParams();
        params.set('entityId', id);
        params.set('billType', 'sale');
        params.set('page', billsPage.toString());
        params.set('limit', ITEMS_PER_PAGE.toString());
        if (filters.startDate) params.set('startDate', filters.startDate);
        if (filters.endDate) params.set('endDate', filters.endDate);
        return params.toString();
    };

    // Fetch customer details
    const { data: customerData, isLoading: customerLoading } = useQuery({
        queryKey: ['customer', id],
        queryFn: async () => {
            const response = await api.get(`/customers/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    // Fetch bills for this customer with pagination
    const { data: billsData, isLoading: billsLoading } = useQuery({
        queryKey: ['customer-bills', id, billsPage, filters.startDate, filters.endDate],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Bill>>(`/bills?${buildBillsQuery()}`);
            return response.data;
        },
        enabled: !!id,
    });

    // Fetch payments for this customer
    const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
        queryKey: ['customer-payments', id],
        queryFn: async () => {
            const response = await api.get(`/payments/customer/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    const customer = customerData?.data as Customer | undefined;
    const bills = (billsData?.data || []) as Bill[];
    const billsPagination = billsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
    const payments = (paymentsData?.data || []) as Payment[];

    // Filter bills by search (client-side for bill number search)
    const filteredBills = useMemo(() => {
        if (!filters.search) return bills;
        return bills.filter(bill =>
            bill.billNumber.toLowerCase().includes(filters.search.toLowerCase())
        );
    }, [bills, filters.search]);

    // Paginate payments (client-side)
    const paginatedPayments = useMemo(() => {
        const start = (paymentsPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return payments.slice(start, end);
    }, [payments, paymentsPage]);

    const paymentsTotalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);

    // Reset page when filters change
    const handleFiltersChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setBillsPage(1);
    };

    if (customerLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20">
                <Header title={t('wholesalers_list.table.view_details')} />
                <div className="p-3 md:p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20">
                <Header title={t('wholesaler_payments.messages.no_wholesaler_found').replace(t('wholesalers_list.table.wholesaler'), t('common.customer'))} />
                <div className="p-3 md:p-6 text-center">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{t('wholesaler_payments.messages.no_wholesaler_found').replace(t('wholesalers_list.table.wholesaler'), t('common.customer'))}</h2>
                    <Button onClick={() => router.push('/shopkeeper/customers/due')} size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('sidebar.due_customers')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20">
            <Header title={t('wholesalers_list.table.view_details')} />

            <div className="p-3 md:p-6">
                {/* Back Button & Actions - Mobile First */}
                <div className="flex items-center justify-between gap-2 mb-4 md:mb-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/shopkeeper/customers/due')}
                        className="text-xs md:text-sm h-8 md:h-9"
                    >
                        <ArrowLeft className="mr-1 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">{t('sidebar.due_customers')}</span>
                        <span className="sm:hidden">{t('common.cancel')}</span>
                    </Button>

                    {customer.outstandingDue > 0 && (
                        <RecordPaymentDialog customer={customer} />
                    )}
                </div>

                {/* Customer Info */}
                <CustomerInfo customer={customer} />

                {/* Tabs for Sales and Payments - Mobile First */}
                <Tabs defaultValue="sales" className="space-y-3 md:space-y-6">
                    <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
                        <TabsList className="bg-white shadow-sm border p-0.5 md:p-1 h-auto min-w-max">
                            <TabsTrigger
                                value="sales"
                                className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2.5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm"
                            >
                                <Receipt className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                {t('history.sales')}
                                <Badge variant="secondary" className="ml-0.5 md:ml-1 bg-emerald-100 text-emerald-700 data-[state=active]:bg-white/20 data-[state=active]:text-white text-[10px] md:text-xs px-1 md:px-2">
                                    {billsPagination.total}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="payments"
                                className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white px-2.5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm"
                            >
                                <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                {t('sidebar.payments')}
                                <Badge variant="secondary" className="ml-0.5 md:ml-1 bg-green-100 text-green-700 data-[state=active]:bg-white/20 data-[state=active]:text-white text-[10px] md:text-xs px-1 md:px-2">
                                    {payments.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="sales" className="m-0">
                        <Card className="border-0 shadow-lg md:shadow-xl overflow-hidden rounded-xl md:rounded-2xl">
                            <CardHeader className="border-b bg-gray-50/80 p-3 md:py-4 md:px-6">
                                <CardTitle className="text-sm md:text-lg flex items-center gap-1.5 md:gap-2">
                                    <div className="p-1.5 md:p-2 rounded-lg bg-emerald-100">
                                        <Receipt className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                                    </div>
                                    <span className="hidden sm:inline">{t('history.sale_bills')}</span>
                                    <span className="sm:hidden">{t('history.sales')}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 md:p-6">
                                <SalesFilters
                                    filters={filters}
                                    onFiltersChange={handleFiltersChange}
                                />
                                <SalesTable bills={filteredBills} customer={customer} isLoading={billsLoading} />
                                {filteredBills.length > 0 && billsPagination.totalPages > 1 && (
                                    <Pagination
                                        page={billsPage}
                                        totalPages={billsPagination.totalPages}
                                        total={billsPagination.total}
                                        limit={ITEMS_PER_PAGE}
                                        onPageChange={setBillsPage}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments" className="m-0">
                        <Card className="border-0 shadow-lg md:shadow-xl overflow-hidden rounded-xl md:rounded-2xl">
                            <CardHeader className="border-b bg-gray-50/80 p-3 md:py-4 md:px-6">
                                <CardTitle className="text-sm md:text-lg flex items-center gap-1.5 md:gap-2">
                                    <div className="p-1.5 md:p-2 rounded-lg bg-green-100">
                                        <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                    </div>
                                    <span className="hidden sm:inline">{t('wholesaler_payments.table.title')}</span>
                                    <span className="sm:hidden">{t('sidebar.payments')}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <PaymentsTable payments={paginatedPayments} isLoading={paymentsLoading} />
                                {payments.length > ITEMS_PER_PAGE && (
                                    <Pagination
                                        page={paymentsPage}
                                        totalPages={paymentsTotalPages}
                                        total={payments.length}
                                        limit={ITEMS_PER_PAGE}
                                        onPageChange={setPaymentsPage}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
