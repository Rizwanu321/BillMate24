'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Users,
    Package,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    Phone,
    Calendar,
    ExternalLink,
    CreditCard,
    AlertTriangle,
    CheckCircle2,
    Filter,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-react';
import api from '@/config/axios';
import { DuesStats } from './components';
import { format, differenceInDays } from 'date-fns';
import Link from 'next/link';

interface Customer {
    _id: string;
    name: string;
    phone?: string;
    outstandingDue: number;
    lastTransactionDate?: string;
}

interface Wholesaler {
    _id: string;
    name: string;
    phone?: string;
    outstandingDue: number;
    lastTransactionDate?: string;
}

const ITEMS_PER_PAGE = 10;

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
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

type SortField = 'name' | 'outstandingDue' | 'lastTransactionDate';
type SortOrder = 'asc' | 'desc';

export default function DuesReportPage() {
    const [activeTab, setActiveTab] = useState<'customers' | 'wholesalers'>('customers');

    // Customer filter state
    const [custSearch, setCustSearch] = useState('');
    const [custStatusFilter, setCustStatusFilter] = useState<'all' | 'overdue' | 'on_track'>('all');
    const [custSortField, setCustSortField] = useState<SortField>('outstandingDue');
    const [custSortOrder, setCustSortOrder] = useState<SortOrder>('desc');
    const [custPage, setCustPage] = useState(1);

    // Wholesaler filter state
    const [wholeSearch, setWholeSearch] = useState('');
    const [wholeStatusFilter, setWholeStatusFilter] = useState<'all' | 'overdue' | 'on_track'>('all');
    const [wholeSortField, setWholeSortField] = useState<SortField>('outstandingDue');
    const [wholeSortOrder, setWholeSortOrder] = useState<SortOrder>('desc');
    const [wholePage, setWholePage] = useState(1);

    // Fetch customers with dues
    const { data: customersData, isLoading: customersLoading } = useQuery({
        queryKey: ['customers-with-dues'],
        queryFn: async () => {
            const response = await api.get('/customers?type=due&limit=100');
            return response.data;
        },
    });

    // Fetch wholesalers with dues
    const { data: wholesalersData, isLoading: wholesalersLoading } = useQuery({
        queryKey: ['wholesalers-with-dues'],
        queryFn: async () => {
            const response = await api.get('/wholesalers?limit=100');
            return response.data;
        },
    });

    const customers = ((customersData?.data || []) as Customer[]).filter(c => c.outstandingDue > 0);
    const wholesalers = ((wholesalersData?.data || []) as Wholesaler[]).filter(w => w.outstandingDue > 0);

    // Calculate stats
    const customerDues = customers.reduce((sum, c) => sum + c.outstandingDue, 0);
    const wholesalerDues = wholesalers.reduce((sum, w) => sum + w.outstandingDue, 0);
    const totalOutstanding = customerDues + wholesalerDues;

    const getOverdueDays = (lastTransactionDate?: string) => {
        if (!lastTransactionDate) return 0;
        return differenceInDays(new Date(), new Date(lastTransactionDate));
    };

    const overdueCount = [...customers, ...wholesalers].filter(entity => {
        return getOverdueDays(entity.lastTransactionDate) > 7;
    }).length;

    // Helper function to check if overdue
    const isOverdue = (lastTransactionDate?: string) => {
        return getOverdueDays(lastTransactionDate) > 7;
    };

    // Filtered and sorted customers
    const filteredCustomers = useMemo(() => {
        let filtered = [...customers];

        // Search filter
        if (custSearch) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
                c.phone?.includes(custSearch)
            );
        }

        // Status filter
        if (custStatusFilter !== 'all') {
            filtered = filtered.filter(c => {
                const overdue = isOverdue(c.lastTransactionDate);
                return custStatusFilter === 'overdue' ? overdue : !overdue;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            if (custSortField === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (custSortField === 'outstandingDue') {
                comparison = a.outstandingDue - b.outstandingDue;
            } else if (custSortField === 'lastTransactionDate') {
                const dateA = a.lastTransactionDate ? new Date(a.lastTransactionDate).getTime() : 0;
                const dateB = b.lastTransactionDate ? new Date(b.lastTransactionDate).getTime() : 0;
                comparison = dateA - dateB;
            }
            return custSortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [customers, custSearch, custStatusFilter, custSortField, custSortOrder]);

    // Filtered and sorted wholesalers
    const filteredWholesalers = useMemo(() => {
        let filtered = [...wholesalers];

        // Search filter
        if (wholeSearch) {
            filtered = filtered.filter(w =>
                w.name.toLowerCase().includes(wholeSearch.toLowerCase()) ||
                w.phone?.includes(wholeSearch)
            );
        }

        // Status filter
        if (wholeStatusFilter !== 'all') {
            filtered = filtered.filter(w => {
                const overdue = isOverdue(w.lastTransactionDate);
                return wholeStatusFilter === 'overdue' ? overdue : !overdue;
            });
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;
            if (wholeSortField === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (wholeSortField === 'outstandingDue') {
                comparison = a.outstandingDue - b.outstandingDue;
            } else if (wholeSortField === 'lastTransactionDate') {
                const dateA = a.lastTransactionDate ? new Date(a.lastTransactionDate).getTime() : 0;
                const dateB = b.lastTransactionDate ? new Date(b.lastTransactionDate).getTime() : 0;
                comparison = dateA - dateB;
            }
            return wholeSortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [wholesalers, wholeSearch, wholeStatusFilter, wholeSortField, wholeSortOrder]);

    // Pagination
    const custTotalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (custPage - 1) * ITEMS_PER_PAGE,
        custPage * ITEMS_PER_PAGE
    );

    const wholeTotalPages = Math.ceil(filteredWholesalers.length / ITEMS_PER_PAGE);
    const paginatedWholesalers = filteredWholesalers.slice(
        (wholePage - 1) * ITEMS_PER_PAGE,
        wholePage * ITEMS_PER_PAGE
    );

    // Clear filters
    const clearCustFilters = () => {
        setCustSearch('');
        setCustStatusFilter('all');
        setCustPage(1);
    };

    const clearWholeFilters = () => {
        setWholeSearch('');
        setWholeStatusFilter('all');
        setWholePage(1);
    };

    const hasCustFilters = custSearch || custStatusFilter !== 'all';
    const hasWholeFilters = wholeSearch || wholeStatusFilter !== 'all';

    // Toggle sort
    const toggleCustSort = (field: SortField) => {
        if (custSortField === field) {
            setCustSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setCustSortField(field);
            setCustSortOrder('desc');
        }
    };

    const toggleWholeSort = (field: SortField) => {
        if (wholeSortField === field) {
            setWholeSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setWholeSortField(field);
            setWholeSortOrder('desc');
        }
    };

    // Render sort icon
    const renderSortIcon = (field: SortField, currentField: SortField, order: SortOrder) => {
        if (field !== currentField) return <ArrowUp className="h-3 w-3 text-gray-300" />;
        return order === 'asc'
            ? <ArrowUp className="h-3 w-3 text-purple-600" />
            : <ArrowDown className="h-3 w-3 text-purple-600" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50">
            <Header title="Outstanding Dues" />

            <div className="p-3 md:p-6">
                {/* Page Header */}
                <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                            Outstanding Dues
                        </h2>
                        <p className="text-gray-600 mt-0.5 md:mt-1 text-xs md:text-base">Track payments and collections</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/shopkeeper/wholesalers/payments" className="w-full md:w-auto">
                            <Button className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 h-9 md:h-10 text-sm">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Make Payment
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Section */}
                <DuesStats
                    totalOutstanding={totalOutstanding}
                    customerDues={customerDues}
                    wholesalerDues={wholesalerDues}
                    overdueCount={overdueCount}
                    customerCount={customers.length}
                    wholesalerCount={wholesalers.length}
                />

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'customers' | 'wholesalers')}>
                    <div className="overflow-x-auto pb-2 -mb-2">
                        <TabsList className="mb-4 md:mb-6 p-1 bg-white shadow-md rounded-xl inline-flex w-auto min-w-full md:min-w-0">
                            <TabsTrigger
                                value="customers"
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white text-xs md:text-sm"
                            >
                                <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                <span className="whitespace-nowrap">Customer Dues</span>
                                <Badge variant="secondary" className="ml-1 bg-white/20 text-[10px] md:text-xs">
                                    {customers.length}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger
                                value="wholesalers"
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white text-xs md:text-sm"
                            >
                                <Package className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                <span className="whitespace-nowrap">Wholesaler Dues</span>
                                <Badge variant="secondary" className="ml-1 bg-white/20 text-[10px] md:text-xs">
                                    {wholesalers.length}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Customer Dues Tab */}
                    <TabsContent value="customers">
                        <Card className="border-0 shadow-lg md:shadow-xl overflow-hidden rounded-xl md:rounded-2xl">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-3 md:p-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                                                <Users className="h-4 w-4 md:h-5 md:w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base md:text-lg">Amount to Collect</CardTitle>
                                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                                    {filteredCustomers.length} customers
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filters */}
                                    <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search customers..."
                                                value={custSearch}
                                                onChange={(e) => {
                                                    setCustSearch(e.target.value);
                                                    setCustPage(1);
                                                }}
                                                className="pl-9 bg-white h-9 md:h-10 text-sm"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Select
                                                value={custStatusFilter}
                                                onValueChange={(value: 'all' | 'overdue' | 'on_track') => {
                                                    setCustStatusFilter(value);
                                                    setCustPage(1);
                                                }}
                                            >
                                                <SelectTrigger className="w-1/2 md:w-[150px] bg-white h-9 md:h-10 text-sm">
                                                    <Filter className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="overdue">Overdue</SelectItem>
                                                    <SelectItem value="on_track">On Track</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {hasCustFilters && (
                                                <Button variant="ghost" size="sm" onClick={clearCustFilters} className="text-gray-500 h-9 md:h-10 px-2 md:px-4">
                                                    <RotateCcw className="h-3.5 w-3.5 md:mr-1" />
                                                    <span className="hidden md:inline">Reset</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Filters */}
                                {hasCustFilters && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {custSearch && (
                                            <Badge variant="secondary" className="flex items-center gap-1 bg-white text-[10px] md:text-xs">
                                                Search: "{custSearch}"
                                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => { setCustSearch(''); setCustPage(1); }} />
                                            </Badge>
                                        )}
                                        {custStatusFilter !== 'all' && (
                                            <Badge
                                                className={`flex items-center gap-1 text-[10px] md:text-xs ${custStatusFilter === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {custStatusFilter === 'overdue' ? 'Overdue' : 'On Track'}
                                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => { setCustStatusFilter('all'); setCustPage(1); }} />
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {customersLoading ? (
                                    <div className="p-8 md:p-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-4 border-green-500 border-t-transparent mx-auto" />
                                        <p className="text-gray-500 mt-4 text-sm md:text-base">Loading customers...</p>
                                    </div>
                                ) : paginatedCustomers.length > 0 ? (
                                    <>
                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                        <TableHead
                                                            className="cursor-pointer hover:text-purple-600 transition-colors"
                                                            onClick={() => toggleCustSort('name')}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                Customer Name
                                                                {renderSortIcon('name', custSortField, custSortOrder)}
                                                            </span>
                                                        </TableHead>
                                                        <TableHead>Contact</TableHead>
                                                        <TableHead
                                                            className="cursor-pointer hover:text-purple-600 transition-colors"
                                                            onClick={() => toggleCustSort('outstandingDue')}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                Outstanding Due
                                                                {renderSortIcon('outstandingDue', custSortField, custSortOrder)}
                                                            </span>
                                                        </TableHead>
                                                        <TableHead
                                                            className="cursor-pointer hover:text-purple-600 transition-colors"
                                                            onClick={() => toggleCustSort('lastTransactionDate')}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                Last Activity
                                                                {renderSortIcon('lastTransactionDate', custSortField, custSortOrder)}
                                                            </span>
                                                        </TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedCustomers.map((customer) => {
                                                        const daysSince = getOverdueDays(customer.lastTransactionDate);
                                                        const overdue = daysSince > 7;

                                                        return (
                                                            <TableRow key={customer._id} className="hover:bg-green-50/50">
                                                                <TableCell>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-700 font-semibold">
                                                                            {customer.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <span className="font-medium">{customer.name}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {customer.phone ? (
                                                                        <div className="flex items-center gap-1 text-gray-600">
                                                                            <Phone className="h-3 w-3" />
                                                                            {customer.phone}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="text-lg font-bold text-red-600">
                                                                        {formatCurrency(customer.outstandingDue)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {customer.lastTransactionDate ? (
                                                                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                                                                            <Calendar className="h-3 w-3" />
                                                                            {format(new Date(customer.lastTransactionDate), 'dd MMM yyyy')}
                                                                            <span className="text-gray-400">({daysSince}d ago)</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">No activity</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {overdue ? (
                                                                        <Badge className="bg-red-100 text-red-700 border-red-200">
                                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                                            Overdue
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                            On Track
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Link href={`/shopkeeper/customers/due/${customer._id}`}>
                                                                        <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                                                                            View
                                                                            <ExternalLink className="h-3 w-3 ml-1" />
                                                                        </Button>
                                                                    </Link>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden">
                                            {paginatedCustomers.map((customer, index) => {
                                                const daysSince = getOverdueDays(customer.lastTransactionDate);
                                                const overdue = daysSince > 7;
                                                return (
                                                    <div key={customer._id} className={`p-3 active:scale-[0.99] transition-all ${index !== paginatedCustomers.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-700 font-bold text-sm shadow-sm">
                                                                    {customer.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                        {customer.phone && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Phone className="h-3 w-3" /> {customer.phone}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="block font-bold text-red-600 text-base">{formatCompactCurrency(customer.outstandingDue)}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Due Amount</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-3 pl-13">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`text-[10px] px-1.5 h-5 ${overdue ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                                                    {overdue ? 'Overdue' : 'On Track'}
                                                                </Badge>
                                                                {customer.lastTransactionDate && (
                                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" /> {daysSince}d ago
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Link href={`/shopkeeper/customers/due/${customer._id}`}>
                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3 border-green-200 text-green-700 hover:bg-green-50">
                                                                    View Details
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination */}
                                        {custTotalPages > 1 && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between px-3 md:px-4 py-3 md:py-4 border-t bg-gray-50 gap-3 md:gap-4">
                                                <p className="text-xs md:text-sm text-gray-600 order-2 sm:order-1">
                                                    Showing <span className="font-medium">{((custPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                                                    <span className="font-medium">{Math.min(custPage * ITEMS_PER_PAGE, filteredCustomers.length)}</span>
                                                </p>
                                                <div className="flex items-center gap-1 order-1 sm:order-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setCustPage(p => Math.max(1, p - 1))}
                                                        disabled={custPage === 1}
                                                        className="h-8 w-8 md:h-9 md:w-9"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-lg border text-xs md:text-sm font-medium">
                                                        {custPage} / {custTotalPages}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setCustPage(p => Math.min(custTotalPages, p + 1))}
                                                        disabled={custPage === custTotalPages}
                                                        className="h-8 w-8 md:h-9 md:w-9"
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 md:p-12 text-center">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                            <Users className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
                                            {hasCustFilters ? 'No customers found' : 'No outstanding dues'}
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">
                                            {hasCustFilters
                                                ? 'Try adjusting your filters'
                                                : 'All customers are clear! 🎉'}
                                        </p>
                                        {hasCustFilters && (
                                            <Button variant="outline" size="sm" onClick={clearCustFilters}>
                                                Clear filters
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Wholesaler Dues Tab */}
                    <TabsContent value="wholesalers">
                        <Card className="border-0 shadow-lg md:shadow-xl overflow-hidden rounded-xl md:rounded-2xl">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b p-3 md:p-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                                                <Package className="h-4 w-4 md:h-5 md:w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base md:text-lg">Amount to Pay</CardTitle>
                                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                                    {filteredWholesalers.length} wholesalers
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filters */}
                                    <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search wholesalers..."
                                                value={wholeSearch}
                                                onChange={(e) => {
                                                    setWholeSearch(e.target.value);
                                                    setWholePage(1);
                                                }}
                                                className="pl-9 bg-white h-9 md:h-10 text-sm"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Select
                                                value={wholeStatusFilter}
                                                onValueChange={(value: 'all' | 'overdue' | 'on_track') => {
                                                    setWholeStatusFilter(value);
                                                    setWholePage(1);
                                                }}
                                            >
                                                <SelectTrigger className="w-1/2 md:w-[150px] bg-white h-9 md:h-10 text-sm">
                                                    <Filter className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All</SelectItem>
                                                    <SelectItem value="overdue">Overdue</SelectItem>
                                                    <SelectItem value="on_track">On Track</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            {hasWholeFilters && (
                                                <Button variant="ghost" size="sm" onClick={clearWholeFilters} className="text-gray-500 h-9 md:h-10 px-2 md:px-4">
                                                    <RotateCcw className="h-3.5 w-3.5 md:mr-1" />
                                                    <span className="hidden md:inline">Reset</span>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Filters */}
                                {hasWholeFilters && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {wholeSearch && (
                                            <Badge variant="secondary" className="flex items-center gap-1 bg-white text-[10px] md:text-xs">
                                                Search: "{wholeSearch}"
                                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => { setWholeSearch(''); setWholePage(1); }} />
                                            </Badge>
                                        )}
                                        {wholeStatusFilter !== 'all' && (
                                            <Badge
                                                className={`flex items-center gap-1 text-[10px] md:text-xs ${wholeStatusFilter === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                    }`}
                                            >
                                                {wholeStatusFilter === 'overdue' ? 'Overdue' : 'On Track'}
                                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => { setWholeStatusFilter('all'); setWholePage(1); }} />
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0">
                                {wholesalersLoading ? (
                                    <div className="p-8 md:p-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-4 border-orange-500 border-t-transparent mx-auto" />
                                        <p className="text-gray-500 mt-4 text-sm md:text-base">Loading wholesalers...</p>
                                    </div>
                                ) : paginatedWholesalers.length > 0 ? (
                                    <>
                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                        <TableHead
                                                            className="cursor-pointer hover:text-purple-600 transition-colors"
                                                            onClick={() => toggleWholeSort('name')}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                Wholesaler Name
                                                                {renderSortIcon('name', wholeSortField, wholeSortOrder)}
                                                            </span>
                                                        </TableHead>
                                                        <TableHead>Contact</TableHead>
                                                        <TableHead
                                                            className="cursor-pointer hover:text-purple-600 transition-colors"
                                                            onClick={() => toggleWholeSort('outstandingDue')}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                Outstanding Due
                                                                {renderSortIcon('outstandingDue', wholeSortField, wholeSortOrder)}
                                                            </span>
                                                        </TableHead>
                                                        <TableHead
                                                            className="cursor-pointer hover:text-purple-600 transition-colors"
                                                            onClick={() => toggleWholeSort('lastTransactionDate')}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                Last Activity
                                                                {renderSortIcon('lastTransactionDate', wholeSortField, wholeSortOrder)}
                                                            </span>
                                                        </TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedWholesalers.map((wholesaler) => {
                                                        const daysSince = getOverdueDays(wholesaler.lastTransactionDate);
                                                        const overdue = daysSince > 7;

                                                        return (
                                                            <TableRow key={wholesaler._id} className="hover:bg-orange-50/50">
                                                                <TableCell>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-orange-700 font-semibold">
                                                                            {wholesaler.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <span className="font-medium">{wholesaler.name}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {wholesaler.phone ? (
                                                                        <div className="flex items-center gap-1 text-gray-600">
                                                                            <Phone className="h-3 w-3" />
                                                                            {wholesaler.phone}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">-</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="text-lg font-bold text-orange-600">
                                                                        {formatCurrency(wholesaler.outstandingDue)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {wholesaler.lastTransactionDate ? (
                                                                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                                                                            <Calendar className="h-3 w-3" />
                                                                            {format(new Date(wholesaler.lastTransactionDate), 'dd MMM yyyy')}
                                                                            <span className="text-gray-400">({daysSince}d ago)</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400">No activity</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {overdue ? (
                                                                        <Badge className="bg-red-100 text-red-700 border-red-200">
                                                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                                                            Overdue
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                            On Track
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Link href={`/shopkeeper/wholesalers/${wholesaler._id}`}>
                                                                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
                                                                            View
                                                                            <ExternalLink className="h-3 w-3 ml-1" />
                                                                        </Button>
                                                                    </Link>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden">
                                            {paginatedWholesalers.map((wholesaler, index) => {
                                                const daysSince = getOverdueDays(wholesaler.lastTransactionDate);
                                                const overdue = daysSince > 7;
                                                return (
                                                    <div key={wholesaler._id} className={`p-3 active:scale-[0.99] transition-all ${index !== paginatedWholesalers.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-orange-700 font-bold text-sm shadow-sm">
                                                                    {wholesaler.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900">{wholesaler.name}</h4>
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                        {wholesaler.phone && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Phone className="h-3 w-3" /> {wholesaler.phone}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="block font-bold text-orange-600 text-base">{formatCompactCurrency(wholesaler.outstandingDue)}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Due Amount</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-3 pl-13">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className={`text-[10px] px-1.5 h-5 ${overdue ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                                                    {overdue ? 'Overdue' : 'On Track'}
                                                                </Badge>
                                                                {wholesaler.lastTransactionDate && (
                                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" /> {daysSince}d ago
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <Link href={`/shopkeeper/wholesalers/${wholesaler._id}`}>
                                                                <Button size="sm" variant="outline" className="h-7 text-xs px-3 border-orange-200 text-orange-700 hover:bg-orange-50">
                                                                    View Details
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination */}
                                        {wholeTotalPages > 1 && (
                                            <div className="flex flex-col sm:flex-row items-center justify-between px-3 md:px-4 py-3 md:py-4 border-t bg-gray-50 gap-3 md:gap-4">
                                                <p className="text-xs md:text-sm text-gray-600 order-2 sm:order-1">
                                                    Showing <span className="font-medium">{((wholePage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                                                    <span className="font-medium">{Math.min(wholePage * ITEMS_PER_PAGE, filteredWholesalers.length)}</span>
                                                </p>
                                                <div className="flex items-center gap-1 order-1 sm:order-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setWholePage(p => Math.max(1, p - 1))}
                                                        disabled={wholePage === 1}
                                                        className="h-8 w-8 md:h-9 md:w-9"
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                    <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white rounded-lg border text-xs md:text-sm font-medium">
                                                        {wholePage} / {wholeTotalPages}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setWholePage(p => Math.min(wholeTotalPages, p + 1))}
                                                        disabled={wholePage === wholeTotalPages}
                                                        className="h-8 w-8 md:h-9 md:w-9"
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="p-8 md:p-12 text-center">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                            <Package className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">
                                            {hasWholeFilters ? 'No wholesalers found' : 'No outstanding dues'}
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-500 mb-3 md:mb-4">
                                            {hasWholeFilters
                                                ? 'Try adjusting your filters'
                                                : 'All wholesalers are paid! 🎉'}
                                        </p>
                                        {hasWholeFilters && (
                                            <Button variant="outline" size="sm" onClick={clearWholeFilters}>
                                                Clear filters
                                            </Button>
                                        )}
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
