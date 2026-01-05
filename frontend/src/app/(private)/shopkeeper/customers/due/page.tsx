'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Search, MoreHorizontal, Trash2, Edit, Eye, Users, Calendar,
    LayoutDashboard, Phone, MapPin, CreditCard, Filter, X, ChevronLeft,
    ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle, UserCheck, IndianRupee,
    Receipt, Banknote, Smartphone, ChevronDown
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/config/axios';
import { Customer, PaginatedResponse } from '@/types';
import { toast } from 'sonner';
import { CustomerStats, AddCustomerDialog } from '../components';

interface CustomerStatsData {
    total: number;
    active: number;
    inactive: number;
    withDues: number;
    totalOutstanding: number;
    totalSales: number;
    totalPaid: number;
}

interface Bill {
    _id: string;
    billNumber: string;
    entityId: string;
    entityName: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentMethod: string;
    createdAt: string;
}

interface Payment {
    _id: string;
    entityId: string;
    entityName: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    createdAt: string;
}

type TimeFilterOption = 'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

const timeFilterLabels: Record<TimeFilterOption, string> = {
    all: 'All Time',
    today: 'Today',
    this_week: 'This Week',
    this_month: 'This Month',
    this_year: 'This Year',
    custom: 'Custom Range',
};

function getDateRange(filter: TimeFilterOption): { startDate?: string; endDate?: string } {
    const now = new Date();
    switch (filter) {
        case 'all': return {};
        case 'today': return { startDate: format(startOfDay(now), 'yyyy-MM-dd'), endDate: format(endOfDay(now), 'yyyy-MM-dd') };
        case 'this_week': return { startDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'), endDate: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd') };
        case 'this_month': return { startDate: format(startOfMonth(now), 'yyyy-MM-dd'), endDate: format(endOfMonth(now), 'yyyy-MM-dd') };
        case 'this_year': return { startDate: format(startOfYear(now), 'yyyy-MM-dd'), endDate: format(endOfYear(now), 'yyyy-MM-dd') };
        default: return {};
    }
}

const paymentMethodConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; label: string }> = {
    cash: { color: 'text-green-700', bgColor: 'bg-green-100', icon: <Banknote className="h-4 w-4" />, label: 'Cash' },
    card: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: <CreditCard className="h-4 w-4" />, label: 'Card' },
    online: { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: <Smartphone className="h-4 w-4" />, label: 'Online/UPI' },
};

const ITEMS_PER_PAGE = 10;

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

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function DueCustomersPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Tab state
    const [activeTab, setActiveTab] = useState('customers');

    // Customer list filter states
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [duesFilter, setDuesFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [currentPage, setCurrentPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Transaction filter states
    const [txnTimeFilter, setTxnTimeFilter] = useState<TimeFilterOption>('this_month');
    const [txnPage, setTxnPage] = useState(1);
    const [paymentPage, setPaymentPage] = useState(1);

    // Debounce search
    const debouncedSearch = useDebounce(searchInput, 500);

    // Get date range for transactions
    const txnDateRange = getDateRange(txnTimeFilter);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter, duesFilter, sortBy]);

    useEffect(() => {
        setTxnPage(1);
        setPaymentPage(1);
    }, [txnTimeFilter]);

    // Build query params
    const buildQueryParams = () => {
        const params = new URLSearchParams();
        params.set('type', 'due');
        params.set('page', currentPage.toString());
        params.set('limit', ITEMS_PER_PAGE.toString());
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (duesFilter !== 'all') params.set('duesFilter', duesFilter);
        if (sortBy) params.set('sortBy', sortBy);
        return params.toString();
    };

    // Fetch customers with filters
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['due-customers', currentPage, debouncedSearch, statusFilter, duesFilter, sortBy],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(
                `/customers?${buildQueryParams()}`
            );
            return response.data;
        },
    });

    // Fetch stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['due-customers-stats'],
        queryFn: async () => {
            const response = await api.get('/customers/stats?type=due');
            return response.data.data as CustomerStatsData;
        },
    });

    // Fetch all sales to due customers with time filter
    const { data: salesData, isLoading: salesLoading } = useQuery({
        queryKey: ['due-customer-sales', txnPage, txnDateRange.startDate, txnDateRange.endDate],
        queryFn: async () => {
            let url = `/bills?entityType=due_customer&billType=sale&page=${txnPage}&limit=${ITEMS_PER_PAGE}`;
            if (txnDateRange.startDate) url += `&startDate=${txnDateRange.startDate}`;
            if (txnDateRange.endDate) url += `&endDate=${txnDateRange.endDate}`;
            const response = await api.get<PaginatedResponse<Bill>>(url);
            return response.data;
        },
        enabled: activeTab === 'sales',
    });

    // Fetch all payments from due customers with time filter
    const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
        queryKey: ['due-customer-payments', paymentPage, txnDateRange.startDate, txnDateRange.endDate],
        queryFn: async () => {
            let url = `/payments?entityType=customer&page=${paymentPage}&limit=${ITEMS_PER_PAGE}`;
            if (txnDateRange.startDate) url += `&startDate=${txnDateRange.startDate}`;
            if (txnDateRange.endDate) url += `&endDate=${txnDateRange.endDate}`;
            const response = await api.get<PaginatedResponse<Payment>>(url);
            return response.data;
        },
        enabled: activeTab === 'payments',
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/customers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['due-customers'] });
            queryClient.invalidateQueries({ queryKey: ['due-customers-stats'] });
            toast.success('Customer deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete customer');
        },
    });

    const customers = data?.data || [];
    const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

    const defaultStats: CustomerStatsData = {
        total: customers.length,
        active: customers.filter(c => c.isActive !== false).length,
        inactive: customers.filter(c => c.isActive === false).length,
        withDues: customers.filter(c => c.outstandingDue > 0).length,
        totalOutstanding: customers.reduce((sum, c) => sum + c.outstandingDue, 0),
        totalSales: customers.reduce((sum, c) => sum + c.totalSales, 0),
        totalPaid: customers.reduce((sum, c) => sum + c.totalPaid, 0),
    };

    const stats = statsData || defaultStats;

    // Sales and payments data
    const sales = (salesData?.data || []) as Bill[];
    const salesPagination = salesData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
    const payments = (paymentsData?.data || []) as Payment[];
    const paymentsPagination = paymentsData?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };

    const hasActiveFilters = searchInput || statusFilter !== 'all' || duesFilter !== 'all' || sortBy !== 'createdAt';

    const clearFilters = () => {
        setSearchInput('');
        setStatusFilter('all');
        setDuesFilter('all');
        setSortBy('createdAt');
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const totalPages = pagination.totalPages;
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/20">
            <Header title="Due Customers" />

            <div className="p-3 md:p-6">
                {/* Page Header - Mobile First */}
                <div className="mb-4 md:mb-8 flex flex-row items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                <span className="hidden sm:inline">Due Customers</span>
                                <span className="sm:hidden">Due</span>
                            </h2>
                            <CreditCard className="h-5 w-5 md:h-8 md:w-8 text-indigo-600" />
                        </div>
                        <p className="text-gray-600 mt-0.5 md:mt-1 flex items-center gap-1.5 md:gap-2 text-xs md:text-base">
                            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden md:inline">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                            <span className="md:hidden">{format(new Date(), 'EEE, MMM d')}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/shopkeeper/customers/dashboard" className="hidden lg:block">
                            <Button variant="outline" className="shadow-sm">
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/shopkeeper/customers/normal" className="hidden lg:block">
                            <Button variant="outline" className="shadow-sm">
                                <Users className="h-4 w-4 mr-2" />
                                Normal
                            </Button>
                        </Link>
                        <AddCustomerDialog customerType="due" />
                    </div>
                </div>

                {/* Stats Cards */}
                {/* Stats Cards - 2x2 on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                    <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl md:rounded-2xl">
                        <CardContent className="p-3 md:p-6">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">Total</Badge>
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold">{stats.total}</h3>
                            <p className="text-white/80 text-[10px] md:text-sm mt-0.5 md:mt-1">Due Customers</p>
                        </CardContent>
                        <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl md:rounded-2xl">
                        <CardContent className="p-3 md:p-6">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                                    <IndianRupee className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">Sales</Badge>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold">
                                <span className="md:hidden">{formatCompact(stats.totalSales)}</span>
                                <span className="hidden md:inline">{formatCurrency(stats.totalSales)}</span>
                            </h3>
                            <p className="text-white/80 text-[10px] md:text-sm mt-0.5 md:mt-1">Total Sales</p>
                        </CardContent>
                        <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg md:shadow-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl md:rounded-2xl">
                        <CardContent className="p-3 md:p-6">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                                    <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <Badge className="bg-white/20 text-white border-0 text-[10px] md:text-xs px-1.5 md:px-2">Paid</Badge>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold">
                                <span className="md:hidden">{formatCompact(stats.totalPaid)}</span>
                                <span className="hidden md:inline">{formatCurrency(stats.totalPaid)}</span>
                            </h3>
                            <p className="text-white/80 text-[10px] md:text-sm mt-0.5 md:mt-1">Amount Collected</p>
                        </CardContent>
                        <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
                    </Card>

                    <Card className={`relative overflow-hidden border-0 shadow-lg md:shadow-xl text-white rounded-xl md:rounded-2xl ${stats.totalOutstanding > 0
                        ? 'bg-gradient-to-br from-rose-500 to-red-600'
                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                        }`}>
                        <CardContent className="p-3 md:p-6">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm">
                                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <Badge className={`border-0 text-[10px] md:text-xs px-1.5 md:px-2 ${stats.totalOutstanding > 0 ? 'bg-white/20 text-white' : 'bg-white text-green-600'
                                    }`}>
                                    {stats.totalOutstanding > 0 ? 'Due' : '✓'}
                                </Badge>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold">
                                <span className="md:hidden">{formatCompact(stats.totalOutstanding)}</span>
                                <span className="hidden md:inline">{formatCurrency(stats.totalOutstanding)}</span>
                            </h3>
                            <p className="text-white/80 text-[10px] md:text-sm mt-0.5 md:mt-1">Outstanding Dues</p>
                        </CardContent>
                        <div className="absolute -bottom-4 -right-4 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full blur-2xl" />
                    </Card>
                </div>

                {/* Tabs for different views */}
                {/* Tabs - Mobile First with horizontal scroll */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 md:space-y-6">
                    <div className="flex flex-row items-center justify-between gap-2 md:gap-4">
                        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
                            <TabsList className="bg-white shadow-sm border p-0.5 md:p-1 h-auto min-w-max">
                                <TabsTrigger
                                    value="customers"
                                    className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white px-2.5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm"
                                >
                                    <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span className="hidden sm:inline">Customers</span>
                                    <span className="sm:hidden">List</span>
                                    <Badge variant="secondary" className="ml-0.5 md:ml-1 bg-indigo-100 text-indigo-700 data-[state=active]:bg-white/20 data-[state=active]:text-white text-[10px] md:text-xs px-1 md:px-2">
                                        {pagination.total}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="sales"
                                    className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-2.5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm"
                                >
                                    <Receipt className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    Sales
                                    {activeTab === 'sales' && salesPagination.total > 0 && (
                                        <Badge variant="secondary" className="ml-0.5 md:ml-1 bg-white/20 text-white text-[10px] md:text-xs px-1 md:px-2">
                                            {salesPagination.total}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="payments"
                                    className="flex items-center gap-1 md:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white px-2.5 md:px-6 py-2 md:py-2.5 text-xs md:text-sm"
                                >
                                    <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span className="hidden sm:inline">Payments</span>
                                    <span className="sm:hidden">Pay</span>
                                    {activeTab === 'payments' && paymentsPagination.total > 0 && (
                                        <Badge variant="secondary" className="ml-0.5 md:ml-1 bg-white/20 text-white text-[10px] md:text-xs px-1 md:px-2">
                                            {paymentsPagination.total}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Time Filter for Sales/Payments tabs */}
                        {(activeTab === 'sales' || activeTab === 'payments') && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-1 md:gap-2 shadow-sm h-8 md:h-9 text-xs md:text-sm px-2 md:px-3">
                                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-indigo-500" />
                                        <span className="hidden sm:inline">{timeFilterLabels[txnTimeFilter]}</span>
                                        <span className="sm:hidden">{txnTimeFilter === 'all' ? 'All' : '...'}</span>
                                        <ChevronDown className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    {(['all', 'today', 'this_week', 'this_month', 'this_year'] as TimeFilterOption[]).map((option) => (
                                        <DropdownMenuItem
                                            key={option}
                                            onClick={() => setTxnTimeFilter(option)}
                                            className={txnTimeFilter === option ? 'bg-indigo-50 text-indigo-700' : ''}
                                        >
                                            {timeFilterLabels[option]}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Customers Tab Content */}
                    <TabsContent value="customers" className="m-0">
                        {/* Main Content Card */}
                        <Card className="border-0 shadow-lg md:shadow-xl overflow-hidden rounded-xl md:rounded-2xl">
                            {/* Filter Bar - Mobile First */}
                            <CardHeader className="border-b bg-gray-50/80 p-3 md:py-4 md:px-6">
                                <div className="space-y-2 md:space-y-4">
                                    {/* First Row - Title and Search */}
                                    <div className="flex flex-row gap-2 md:gap-4 justify-between items-center">
                                        <CardTitle className="text-sm md:text-lg flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                                            <div className="p-1.5 md:p-2 rounded-lg bg-indigo-100">
                                                <Users className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                                            </div>
                                            <span className="hidden sm:inline">Due Customers</span>
                                            <span className="sm:hidden">Customers</span>
                                            <Badge variant="secondary" className="ml-1 md:ml-2 bg-indigo-50 text-indigo-700 text-[10px] md:text-xs px-1.5 md:px-2">
                                                {pagination.total}
                                            </Badge>
                                            {isFetching && !isLoading && (
                                                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-indigo-500 border-t-transparent" />
                                            )}
                                        </CardTitle>
                                        <div className="relative flex-1 max-w-[180px] md:max-w-[256px]">
                                            <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search..."
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                                className="pl-8 md:pl-10 h-8 md:h-9 text-sm bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Second Row - Filters with horizontal scroll */}
                                    <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
                                        <div className="flex gap-2 md:gap-3 items-center min-w-max">
                                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                                                <Filter className="h-4 w-4" />
                                                <span className="font-medium">Filters:</span>
                                            </div>

                                            {/* Status Filter */}
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger className="w-[90px] md:w-[130px] h-8 md:h-9 bg-white text-xs md:text-sm">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        <span className="flex items-center gap-2">All Status</span>
                                                    </SelectItem>
                                                    <SelectItem value="active">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-green-500" />
                                                            Active
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                                                            Inactive
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {/* Dues Filter */}
                                            <Select value={duesFilter} onValueChange={setDuesFilter}>
                                                <SelectTrigger className="w-[90px] md:w-[140px] h-8 md:h-9 bg-white text-xs md:text-sm">
                                                    <SelectValue placeholder="Dues" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Dues</SelectItem>
                                                    <SelectItem value="with_dues">
                                                        <span className="flex items-center gap-2">
                                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                                            With Dues
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="clear">
                                                        <span className="flex items-center gap-2">
                                                            <UserCheck className="h-3 w-3 text-green-500" />
                                                            Clear
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {/* Sort By */}
                                            <Select value={sortBy} onValueChange={setSortBy}>
                                                <SelectTrigger className="w-[90px] md:w-[140px] h-8 md:h-9 bg-white text-xs md:text-sm">
                                                    <SelectValue placeholder="Sort" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="createdAt">Latest</SelectItem>
                                                    <SelectItem value="name">Name A-Z</SelectItem>
                                                    <SelectItem value="totalSales">Top Sales</SelectItem>
                                                    <SelectItem value="outstandingDue">Highest Due</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {/* Clear Filters */}
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearFilters}
                                                    className="h-8 md:h-9 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 md:px-3 text-xs md:text-sm"
                                                >
                                                    <X className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1" />
                                                    <span className="hidden md:inline">Clear All</span>
                                                    <span className="md:hidden">Clear</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {isLoading ? (
                                    <div className="p-12 text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mx-auto" />
                                        <p className="text-gray-500 mt-4">Loading customers...</p>
                                    </div>
                                ) : customers.length > 0 ? (
                                    <>
                                        {/* Desktop Table */}
                                        <div className="hidden md:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                                        <TableHead className="font-semibold">Customer</TableHead>
                                                        <TableHead className="font-semibold">Phone</TableHead>
                                                        <TableHead className="font-semibold text-right">Total Sales</TableHead>
                                                        <TableHead className="font-semibold text-right">Paid</TableHead>
                                                        <TableHead className="font-semibold text-right">Outstanding</TableHead>
                                                        <TableHead className="font-semibold">Status</TableHead>
                                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {customers.map((customer) => (
                                                        <TableRow key={customer._id} className="hover:bg-indigo-50/30 transition-colors">
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                                        {customer.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900">{customer.name}</p>
                                                                        {customer.address && (
                                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                                <MapPin className="h-3 w-3" />
                                                                                {customer.address}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {customer.phone ? (
                                                                    <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-indigo-600">
                                                                        <Phone className="h-3 w-3" />
                                                                        {customer.phone}
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold">
                                                                {formatCurrency(customer.totalSales)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold text-green-600">
                                                                {formatCurrency(customer.totalPaid)}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <span className={`font-bold ${customer.outstandingDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {customer.outstandingDue > 0 ? formatCurrency(customer.outstandingDue) : '✓ Clear'}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={customer.isActive !== false
                                                                    ? 'bg-green-100 text-green-700 border-0'
                                                                    : 'bg-gray-100 text-gray-600 border-0'
                                                                }>
                                                                    {customer.isActive !== false ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => router.push(`/shopkeeper/customers/due/${customer._id}`)}>
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            View Details
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Edit className="h-4 w-4 mr-2" />
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600"
                                                                            onClick={() => {
                                                                                if (confirm('Are you sure you want to delete this customer?')) {
                                                                                    deleteMutation.mutate(customer._id);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Cards - Enhanced */}
                                        <div className="md:hidden">
                                            {customers.map((customer, index) => (
                                                <div
                                                    key={customer._id}
                                                    className={`p-3 hover:bg-indigo-50/30 active:scale-[0.99] transition-all ${index !== customers.length - 1 ? 'border-b-2 border-gray-200' : ''}`}
                                                    onClick={() => router.push(`/shopkeeper/customers/due/${customer._id}`)}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                {customer.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 text-sm truncate max-w-[140px]">{customer.name}</p>
                                                                {customer.phone && (
                                                                    <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                                        <Phone className="h-2.5 w-2.5" />
                                                                        {customer.phone}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Badge className={`text-[10px] px-1.5 ${customer.isActive !== false
                                                            ? 'bg-green-100 text-green-700 border-0'
                                                            : 'bg-gray-100 text-gray-600 border-0'
                                                            }`}>
                                                            {customer.isActive !== false ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        <div>
                                                            <p className="text-gray-500 text-[10px]">Sales</p>
                                                            <p className="font-semibold">{formatCompact(customer.totalSales)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-[10px]">Paid</p>
                                                            <p className="font-semibold text-green-600">{formatCompact(customer.totalPaid)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500 text-[10px]">Due</p>
                                                            <p className={`font-bold ${customer.outstandingDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                {customer.outstandingDue > 0 ? formatCompact(customer.outstandingDue) : '✓'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination - Mobile First */}
                                        {pagination.total > 0 && (
                                            <>
                                                {/* Mobile Pagination */}
                                                <div className="flex md:hidden items-center justify-center gap-2 px-3 py-3 border-t bg-gray-50/50">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                        className="h-9 px-3"
                                                    >
                                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                                        Prev
                                                    </Button>
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
                                                        <span>{currentPage}</span>
                                                        <span className="text-indigo-400">/</span>
                                                        <span>{pagination.totalPages}</span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(currentPage + 1)}
                                                        disabled={currentPage === pagination.totalPages}
                                                        className="h-9 px-3"
                                                    >
                                                        Next
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>

                                                {/* Desktop Pagination */}
                                                <div className="hidden md:flex items-center justify-between gap-4 px-6 py-4 border-t bg-gray-50/50">
                                                    <p className="text-sm text-gray-600">
                                                        Showing <span className="font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                                        <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)}</span> of{' '}
                                                        <span className="font-semibold">{pagination.total}</span> customers
                                                    </p>
                                                    {pagination.totalPages > 1 && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage(1)}
                                                                disabled={currentPage === 1}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <ChevronsLeft className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                                disabled={currentPage === 1}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </Button>

                                                            {getPageNumbers().map((pageNum, index) => (
                                                                typeof pageNum === 'number' ? (
                                                                    <Button
                                                                        key={index}
                                                                        variant={currentPage === pageNum ? 'default' : 'outline'}
                                                                        size="sm"
                                                                        onClick={() => setCurrentPage(pageNum)}
                                                                        className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                                                    >
                                                                        {pageNum}
                                                                    </Button>
                                                                ) : (
                                                                    <span key={index} className="px-2 text-gray-400">...</span>
                                                                )
                                                            ))}

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                                disabled={currentPage === pagination.totalPages}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setCurrentPage(pagination.totalPages)}
                                                                disabled={currentPage === pagination.totalPages}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <ChevronsRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 md:p-12 text-center">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                            <Users className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
                                            {hasActiveFilters ? 'No customers match' : 'No due customers'}
                                        </h3>
                                        <p className="text-gray-500 text-sm md:text-base mb-3 md:mb-4">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters'
                                                : 'Add your first due customer'
                                            }
                                        </p>
                                        {hasActiveFilters ? (
                                            <Button onClick={clearFilters} variant="outline" size="sm">
                                                <X className="mr-2 h-4 w-4" />
                                                Clear Filters
                                            </Button>
                                        ) : (
                                            <AddCustomerDialog customerType="due" />
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sales Tab Content */}
                    <TabsContent value="sales" className="m-0">
                        <Card className="border-0 shadow-lg md:shadow-xl overflow-hidden rounded-xl md:rounded-2xl">
                            <CardHeader className="border-b bg-gray-50/80 p-3 md:py-4 md:px-6">
                                <CardTitle className="text-sm md:text-lg flex items-center gap-1.5 md:gap-2">
                                    <div className="p-1.5 md:p-2 rounded-lg bg-emerald-100">
                                        <Receipt className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                                    </div>
                                    <span className="hidden sm:inline">Sales to Due Customers</span>
                                    <span className="sm:hidden">Sales</span>
                                    <Badge variant="secondary" className="ml-1 md:ml-2 bg-emerald-50 text-emerald-700 text-[10px] md:text-xs px-1.5 md:px-2">
                                        {salesPagination.total}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {salesLoading ? (
                                    <div className="p-8 md:p-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-emerald-500 mx-auto" />
                                        <p className="text-gray-500 mt-3 md:mt-4 text-sm">Loading sales...</p>
                                    </div>
                                ) : sales.length > 0 ? (
                                    <>
                                        {/* Desktop Table */}
                                        <div className="hidden md:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50/50">
                                                        <TableHead>Bill Number</TableHead>
                                                        <TableHead>Customer</TableHead>
                                                        <TableHead className="text-right">Amount</TableHead>
                                                        <TableHead className="text-right">Paid</TableHead>
                                                        <TableHead className="text-right">Due</TableHead>
                                                        <TableHead>Payment</TableHead>
                                                        <TableHead>Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sales.map((sale) => {
                                                        const methodConfig = paymentMethodConfig[sale.paymentMethod] || paymentMethodConfig.cash;
                                                        return (
                                                            <TableRow key={sale._id} className="hover:bg-emerald-50/30">
                                                                <TableCell className="font-mono text-sm">{sale.billNumber}</TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white text-sm font-semibold">
                                                                            {sale.entityName?.charAt(0)?.toUpperCase() || 'C'}
                                                                        </div>
                                                                        <span className="font-medium">{sale.entityName}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right font-semibold">{formatCurrency(sale.totalAmount)}</TableCell>
                                                                <TableCell className="text-right text-green-600">{formatCurrency(sale.paidAmount)}</TableCell>
                                                                <TableCell className="text-right">
                                                                    {sale.dueAmount > 0 ? (
                                                                        <span className="text-red-600 font-semibold">{formatCurrency(sale.dueAmount)}</span>
                                                                    ) : (
                                                                        <Badge className="bg-green-100 text-green-700 border-0">Paid</Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge className={`${methodConfig.bgColor} ${methodConfig.color} border-0`}>
                                                                        {methodConfig.label}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-gray-600">{format(new Date(sale.createdAt), 'dd MMM yyyy')}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Cards */}
                                        <div className="md:hidden">
                                            {sales.map((sale, index) => {
                                                const methodConfig = paymentMethodConfig[sale.paymentMethod] || paymentMethodConfig.cash;
                                                return (
                                                    <div key={sale._id} className={`p-3 hover:bg-emerald-50/30 active:scale-[0.99] transition-all ${index !== sales.length - 1 ? 'border-b-2 border-gray-200' : ''}`}>
                                                        {/* Header Row - Name, Bill Number, Date */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                                    {sale.entityName?.charAt(0)?.toUpperCase() || 'C'}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-semibold text-gray-900 text-sm truncate">{sale.entityName}</p>
                                                                    <p className="text-[10px] text-gray-500 font-mono">#{sale.billNumber}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <Badge className={`${methodConfig.bgColor} ${methodConfig.color} border-0 text-[10px] px-1.5`}>
                                                                    {methodConfig.label}
                                                                </Badge>
                                                                <p className="text-[10px] text-gray-500 mt-0.5">{format(new Date(sale.createdAt), 'dd MMM')}</p>
                                                            </div>
                                                        </div>

                                                        {/* Amount Row - Total, Paid, Due */}
                                                        <div className="bg-gray-50 rounded-lg p-2">
                                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                                {/* Total */}
                                                                <div>
                                                                    <p className="text-[10px] text-gray-500 font-medium">Total</p>
                                                                    <p className="font-bold text-gray-900 text-sm">{formatCompact(sale.totalAmount)}</p>
                                                                </div>

                                                                {/* Paid */}
                                                                <div>
                                                                    <p className="text-[10px] text-gray-500 font-medium">Paid</p>
                                                                    <p className="font-bold text-green-600 text-sm">{formatCompact(sale.paidAmount)}</p>
                                                                </div>

                                                                {/* Due */}
                                                                <div>
                                                                    <p className="text-[10px] text-gray-500 font-medium">Due</p>
                                                                    {sale.dueAmount > 0 ? (
                                                                        <p className="font-bold text-red-600 text-sm">{formatCompact(sale.dueAmount)}</p>
                                                                    ) : (
                                                                        <p className="font-bold text-green-600 text-sm">✓ Nil</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination */}
                                        {salesPagination.total > 0 && (
                                            <>
                                                {/* Mobile Pagination */}
                                                <div className="flex md:hidden items-center justify-center gap-2 px-3 py-3 border-t bg-gray-50/50">
                                                    <Button variant="outline" size="sm" onClick={() => setTxnPage(p => Math.max(1, p - 1))} disabled={txnPage === 1} className="h-9 px-3">
                                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                                        Prev
                                                    </Button>
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                                                        <span>{txnPage}</span>
                                                        <span className="text-emerald-400">/</span>
                                                        <span>{salesPagination.totalPages}</span>
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => setTxnPage(p => Math.min(salesPagination.totalPages, p + 1))} disabled={txnPage === salesPagination.totalPages} className="h-9 px-3">
                                                        Next
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>

                                                {/* Desktop Pagination */}
                                                <div className="hidden md:flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                                                    <p className="text-sm text-gray-600">
                                                        Showing {(txnPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(txnPage * ITEMS_PER_PAGE, salesPagination.total)} of {salesPagination.total}
                                                    </p>
                                                    {salesPagination.totalPages > 1 && (
                                                        <div className="flex gap-1">
                                                            <Button variant="outline" size="sm" onClick={() => setTxnPage(p => Math.max(1, p - 1))} disabled={txnPage === 1} className="h-8 w-8 p-0">
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </Button>
                                                            <span className="px-3 py-1 text-sm">{txnPage} / {salesPagination.totalPages}</span>
                                                            <Button variant="outline" size="sm" onClick={() => setTxnPage(p => Math.min(salesPagination.totalPages, p + 1))} disabled={txnPage === salesPagination.totalPages} className="h-8 w-8 p-0">
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 md:p-12 text-center">
                                        <Receipt className="h-8 w-8 md:h-12 md:w-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">No sales found</h3>
                                        <p className="text-gray-500 text-sm">No sales in the selected period</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payments Tab Content */}
                    <TabsContent value="payments" className="m-0">
                        <Card className="border-0 shadow-lg md:shadow-xl overflow-hidden rounded-xl md:rounded-2xl">
                            <CardHeader className="border-b bg-gray-50/80 p-3 md:py-4 md:px-6">
                                <CardTitle className="text-sm md:text-lg flex items-center gap-1.5 md:gap-2">
                                    <div className="p-1.5 md:p-2 rounded-lg bg-green-100">
                                        <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                    </div>
                                    <span className="hidden sm:inline">Payments from Due Customers</span>
                                    <span className="sm:hidden">Payments</span>
                                    <Badge variant="secondary" className="ml-1 md:ml-2 bg-green-50 text-green-700 text-[10px] md:text-xs px-1.5 md:px-2">
                                        {paymentsPagination.total}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {paymentsLoading ? (
                                    <div className="p-8 md:p-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-green-500 mx-auto" />
                                        <p className="text-gray-500 mt-3 md:mt-4 text-sm">Loading payments...</p>
                                    </div>
                                ) : payments.length > 0 ? (
                                    <>
                                        {/* Desktop Table */}
                                        <div className="hidden md:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50/50">
                                                        <TableHead>Customer</TableHead>
                                                        <TableHead className="text-right">Amount</TableHead>
                                                        <TableHead>Payment Method</TableHead>
                                                        <TableHead>Notes</TableHead>
                                                        <TableHead>Date</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {payments.map((payment) => {
                                                        const methodConfig = paymentMethodConfig[payment.paymentMethod] || paymentMethodConfig.cash;
                                                        return (
                                                            <TableRow key={payment._id} className="hover:bg-green-50/30">
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                                                                            {payment.entityName?.charAt(0)?.toUpperCase() || 'C'}
                                                                        </div>
                                                                        <span className="font-medium">{payment.entityName}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge className={`${methodConfig.bgColor} ${methodConfig.color} border-0 flex items-center gap-1.5 w-fit`}>
                                                                        {methodConfig.icon}
                                                                        {methodConfig.label}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-gray-600 max-w-[200px] truncate">{payment.notes || '-'}</TableCell>
                                                                <TableCell className="text-gray-600">{format(new Date(payment.createdAt), 'dd MMM yyyy, hh:mm a')}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Cards */}
                                        <div className="md:hidden">
                                            {payments.map((payment, index) => {
                                                const methodConfig = paymentMethodConfig[payment.paymentMethod] || paymentMethodConfig.cash;
                                                return (
                                                    <div key={payment._id} className={`p-3 hover:bg-green-50/30 active:scale-[0.99] transition-all ${index !== payments.length - 1 ? 'border-b-2 border-gray-200' : ''}`}>
                                                        {/* Header Row - Name, Date */}
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                                                    {payment.entityName?.charAt(0)?.toUpperCase() || 'C'}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-semibold text-gray-900 text-sm truncate">{payment.entityName}</p>
                                                                    <p className="text-[10px] text-gray-500">{format(new Date(payment.createdAt), 'dd MMM, hh:mm a')}</p>
                                                                </div>
                                                            </div>
                                                            <Badge className={`${methodConfig.bgColor} ${methodConfig.color} border-0 text-[10px] px-1.5 flex items-center gap-1 flex-shrink-0`}>
                                                                {methodConfig.icon}
                                                                {methodConfig.label}
                                                            </Badge>
                                                        </div>

                                                        {/* Amount - Prominent Display */}
                                                        <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-green-600 font-medium">Payment Received</span>
                                                                <span className="font-bold text-green-600 text-base">{formatCompact(payment.amount)}</span>
                                                            </div>
                                                            {payment.notes && (
                                                                <p className="text-[10px] text-gray-500 mt-1 truncate">Note: {payment.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination */}
                                        {paymentsPagination.total > 0 && (
                                            <>
                                                {/* Mobile Pagination */}
                                                <div className="flex md:hidden items-center justify-center gap-2 px-3 py-3 border-t bg-gray-50/50">
                                                    <Button variant="outline" size="sm" onClick={() => setPaymentPage(p => Math.max(1, p - 1))} disabled={paymentPage === 1} className="h-9 px-3">
                                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                                        Prev
                                                    </Button>
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                                        <span>{paymentPage}</span>
                                                        <span className="text-green-400">/</span>
                                                        <span>{paymentsPagination.totalPages}</span>
                                                    </div>
                                                    <Button variant="outline" size="sm" onClick={() => setPaymentPage(p => Math.min(paymentsPagination.totalPages, p + 1))} disabled={paymentPage === paymentsPagination.totalPages} className="h-9 px-3">
                                                        Next
                                                        <ChevronRight className="h-4 w-4 ml-1" />
                                                    </Button>
                                                </div>

                                                {/* Desktop Pagination */}
                                                <div className="hidden md:flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                                                    <p className="text-sm text-gray-600">
                                                        Showing {(paymentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(paymentPage * ITEMS_PER_PAGE, paymentsPagination.total)} of {paymentsPagination.total}
                                                    </p>
                                                    {paymentsPagination.totalPages > 1 && (
                                                        <div className="flex gap-1">
                                                            <Button variant="outline" size="sm" onClick={() => setPaymentPage(p => Math.max(1, p - 1))} disabled={paymentPage === 1} className="h-8 w-8 p-0">
                                                                <ChevronLeft className="h-4 w-4" />
                                                            </Button>
                                                            <span className="px-3 py-1 text-sm">{paymentPage} / {paymentsPagination.totalPages}</span>
                                                            <Button variant="outline" size="sm" onClick={() => setPaymentPage(p => Math.min(paymentsPagination.totalPages, p + 1))} disabled={paymentPage === paymentsPagination.totalPages} className="h-8 w-8 p-0">
                                                                <ChevronRight className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 md:p-12 text-center">
                                        <CreditCard className="h-8 w-8 md:h-12 md:w-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">No payments found</h3>
                                        <p className="text-gray-500 text-sm">No payments in the selected period</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
