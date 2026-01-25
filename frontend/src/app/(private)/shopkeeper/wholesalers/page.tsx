'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Search, MoreHorizontal, Trash2, Edit, Eye, Package, Calendar,
    LayoutDashboard, Phone, MapPin, CreditCard, Filter, X, ChevronLeft,
    ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle, CheckCircle, Users, IndianRupee, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { Header, DeleteConfirmDialog } from '@/components/app';
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
import api from '@/config/axios';
import { Wholesaler, PaginatedResponse } from '@/types';
import { toast } from 'sonner';
import { wholesalerSchema } from '@/schemas/wholesaler.schema';
import { WholesalerStats, EditWholesalerDialog, AddWholesalerDialog } from './components';

interface WholesalerStatsData {
    total: number;
    active: number;
    inactive: number;
    deleted: number;
    withDues: number;
    totalOutstanding: number;
}

interface WholesalerPaginatedResponse extends PaginatedResponse<Wholesaler> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const ITEMS_PER_PAGE = 10;

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useState(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    });

    // Update debounced value after delay
    if (debouncedValue !== value) {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        // Clean up on next render
        setTimeout(() => clearTimeout(handler), 0);
    }

    return debouncedValue;
}

export default function WholesalersPage() {
    const queryClient = useQueryClient();
    const router = useRouter();

    // Search and filter state
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');
    const [duesFilter, setDuesFilter] = useState<'all' | 'with_dues' | 'clear'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'purchases' | 'outstanding' | 'createdAt'>('createdAt');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingWholesaler, setEditingWholesaler] = useState<Wholesaler | null>(null);

    // Build query params for API
    const buildQueryParams = () => {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', ITEMS_PER_PAGE.toString());
        if (search) params.set('search', search);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (statusFilter === 'deleted') params.set('includeDeleted', 'true');
        if (duesFilter !== 'all') params.set('duesFilter', duesFilter);
        if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
        return params.toString();
    };

    // Fetch stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['wholesaler-stats'],
        queryFn: async () => {
            const response = await api.get<{ data: WholesalerStatsData }>('/wholesalers/stats');
            return response.data.data;
        },
    });

    // Fetch wholesalers with server-side filtering and pagination
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['wholesalers', currentPage, search, statusFilter, duesFilter, sortBy],
        queryFn: async () => {
            const response = await api.get<WholesalerPaginatedResponse>(`/wholesalers?${buildQueryParams()}`);
            return response.data;
        },
    });

    const wholesalers = data?.data || [];
    const pagination = data?.pagination || { page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 };

    const hasActiveFilters = search || statusFilter !== 'all' || duesFilter !== 'all' || sortBy !== 'createdAt';

    const clearFilters = () => {
        setSearch('');
        setSearchInput('');
        setStatusFilter('all');
        setDuesFilter('all');
        setSortBy('createdAt');
        setCurrentPage(1);
    };

    // Handle search with debounce
    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        // Debounce the actual search
        setTimeout(() => {
            setSearch(value);
            setCurrentPage(1);
        }, 500);
    };

    // Handle filter changes - reset to page 1
    const handleFilterChange = (setter: (value: any) => void, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await api.patch(`/wholesalers/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
            queryClient.invalidateQueries({ queryKey: ['wholesaler-stats'] });
            setEditDialogOpen(false);
            setEditingWholesaler(null);
            toast.success('Wholesaler updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update wholesaler');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/wholesalers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
            queryClient.invalidateQueries({ queryKey: ['wholesaler-stats'] });
            setDeleteDialogOpen(false);
            setSelectedWholesaler(null);
            toast.success('Wholesaler deleted (soft delete)');
        },
        onError: () => {
            toast.error('Failed to delete wholesaler');
        },
    });

    const restoreMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/wholesalers/${id}/restore`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
            queryClient.invalidateQueries({ queryKey: ['wholesaler-stats'] });
            toast.success('Wholesaler restored successfully');
        },
        onError: () => {
            toast.error('Failed to restore wholesaler');
        },
    });

    const handleEditClick = (wholesaler: Wholesaler) => {
        setEditingWholesaler(wholesaler);
        setEditDialogOpen(true);
    };

    const handleEditSave = (data: any) => {
        if (editingWholesaler) {
            updateMutation.mutate({ id: editingWholesaler._id, data });
        }
    };

    const handleDeleteClick = (wholesaler: Wholesaler) => {
        setSelectedWholesaler(wholesaler);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedWholesaler) {
            deleteMutation.mutate(selectedWholesaler._id);
        }
    };

    const defaultStats: WholesalerStatsData = {
        total: 0,
        active: 0,
        inactive: 0,
        deleted: 0,
        withDues: 0,
        totalOutstanding: 0,
    };

    // Pagination controls
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/20">
            <Header title="Wholesalers" />

            <div className="p-3 md:p-6">
                {/* Page Header */}
                <div className="mb-4 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                                <span className="hidden sm:inline">Wholesalers / Distributors</span>
                                <span className="sm:hidden">Wholesalers</span>
                            </h2>
                            <Users className="h-5 w-5 md:h-8 md:w-8 text-indigo-600" />
                        </div>
                        <p className="text-gray-600 mt-0.5 md:mt-1 flex items-center gap-1.5 md:gap-2 text-xs md:text-base">
                            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden md:inline">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                            <span className="md:hidden">{format(new Date(), 'EEE, MMM d')}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <Link href="/shopkeeper/wholesalers/dashboard" className="hidden md:block">
                            <Button variant="outline" className="shadow-sm">
                                <LayoutDashboard className="h-4 w-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <Link href="/shopkeeper/wholesalers/payments" className="hidden md:block">
                            <Button variant="outline" className="shadow-sm">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Payments
                            </Button>
                        </Link>
                        <AddWholesalerDialog />
                    </div>
                </div>

                {/* Stats Cards */}
                <WholesalerStats stats={statsData || defaultStats} isLoading={statsLoading} />

                {/* Main Content Card */}
                <Card className="border-0 shadow-lg overflow-hidden rounded-xl md:rounded-2xl">
                    {/* Filter Bar */}
                    <CardHeader className="border-b bg-gray-50/80 p-3 md:py-4 md:px-6">
                        <div className="space-y-3 md:space-y-4">
                            {/* First Row - Title and Search */}
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-between items-start sm:items-center">
                                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                    <div className="p-1.5 md:p-2 rounded-lg bg-purple-100">
                                        <Package className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                                    </div>
                                    <span className="hidden sm:inline">All Wholesalers</span>
                                    <span className="sm:hidden">Wholesalers</span>
                                    <Badge variant="secondary" className="ml-1 md:ml-2 bg-purple-50 text-purple-700 text-[10px] md:text-xs px-1.5 md:px-2">
                                        {pagination.total}
                                    </Badge>
                                    {isFetching && !isLoading && (
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 md:h-4 md:w-4 border-2 border-purple-500 border-t-transparent ml-1 md:ml-2" />
                                    )}
                                </CardTitle>
                                <div className="relative w-full sm:w-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search..."
                                        value={searchInput}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pl-10 w-full sm:w-60 md:w-72 bg-white h-9 md:h-10 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Second Row - Filters (Horizontal scroll on mobile) */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                                <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600 flex-shrink-0">
                                    <Filter className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span className="font-medium hidden sm:inline">Filters:</span>
                                </div>

                                {/* Status Filter */}
                                <Select
                                    value={statusFilter}
                                    onValueChange={(value: 'all' | 'active' | 'inactive' | 'deleted') => handleFilterChange(setStatusFilter, value)}
                                >
                                    <SelectTrigger className="w-[100px] md:w-[130px] h-8 md:h-9 bg-white text-xs md:text-sm flex-shrink-0">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">
                                            <span className="flex items-center gap-2">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                Active
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            <span className="flex items-center gap-2">
                                                <X className="h-3 w-3 text-gray-500" />
                                                Inactive
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="deleted">
                                            <span className="flex items-center gap-2">
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                                Recycle Bin
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Dues Filter */}
                                <Select
                                    value={duesFilter}
                                    onValueChange={(value: 'all' | 'with_dues' | 'clear') => handleFilterChange(setDuesFilter, value)}
                                >
                                    <SelectTrigger className="w-[90px] md:w-[140px] h-8 md:h-9 bg-white text-xs md:text-sm flex-shrink-0">
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
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                Clear
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Sort By */}
                                <Select
                                    value={sortBy}
                                    onValueChange={(value: 'name' | 'purchases' | 'outstanding' | 'createdAt') => handleFilterChange(setSortBy, value)}
                                >
                                    <SelectTrigger className="w-[100px] md:w-[160px] h-8 md:h-9 bg-white text-xs md:text-sm flex-shrink-0">
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt">Latest</SelectItem>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="purchases">Purchases</SelectItem>
                                        <SelectItem value="outstanding">Outstanding</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="h-8 md:h-9 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 md:px-3 text-xs md:text-sm flex-shrink-0"
                                    >
                                        <X className="h-3.5 w-3.5 md:h-4 md:w-4 mr-0.5 md:mr-1" />
                                        <span className="hidden sm:inline">Clear All</span>
                                        <span className="sm:hidden">Clear</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 md:p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-purple-500 mx-auto" />
                                <p className="text-gray-500 mt-3 md:mt-4 text-sm md:text-base">Loading...</p>
                            </div>
                        ) : wholesalers.length > 0 ? (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                                <TableHead className="font-semibold">Wholesaler</TableHead>
                                                <TableHead className="font-semibold">Contact</TableHead>
                                                <TableHead className="font-semibold text-right">Total Purchased</TableHead>
                                                <TableHead className="font-semibold text-right">Total Paid</TableHead>
                                                <TableHead className="font-semibold text-right">Outstanding</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold text-center w-[100px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {wholesalers.map((w) => (
                                                <TableRow key={w._id} className="hover:bg-purple-50/30 transition-colors">
                                                    <TableCell>
                                                        <div
                                                            className="flex items-center gap-3 cursor-pointer group"
                                                            onClick={() => router.push(`/shopkeeper/wholesalers/${w._id}`)}
                                                        >
                                                            <div className="p-2 rounded-lg bg-purple-100 group-hover:bg-purple-200 transition-colors">
                                                                <Package className="h-4 w-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                                    {w.name}
                                                                </p>
                                                                {w.address && (
                                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                        <MapPin className="h-3 w-3" />
                                                                        {w.address.substring(0, 30)}{w.address.length > 30 ? '...' : ''}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {w.phone ? (
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Phone className="h-4 w-4 text-gray-400" />
                                                                {w.phone}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-gray-900">
                                                        {formatCurrency(w.totalPurchased)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold text-green-600">
                                                        {formatCurrency(w.totalPaid)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Badge
                                                            variant={w.outstandingDue > 0 ? 'destructive' : 'secondary'}
                                                            className={w.outstandingDue > 0
                                                                ? 'bg-red-100 text-red-700 border-0 font-mono'
                                                                : 'bg-green-100 text-green-700 border-0'
                                                            }
                                                        >
                                                            {w.outstandingDue > 0 ? formatCurrency(w.outstandingDue) : '✓ Clear'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={w.isActive
                                                            ? 'bg-green-100 text-green-700 border-0'
                                                            : 'bg-gray-100 text-gray-600 border-0'
                                                        }>
                                                            {w.isActive ? '● Active' : '○ Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuItem
                                                                        onClick={() => router.push(`/shopkeeper/wholesalers/${w._id}`)}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    {!w.isDeleted ? (
                                                                        <>
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleEditClick(w)}
                                                                                className="cursor-pointer"
                                                                            >
                                                                                <Edit className="mr-2 h-4 w-4 text-purple-600" />
                                                                                Edit Wholesaler
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                                                onClick={() => handleDeleteClick(w)}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    ) : (
                                                                        <DropdownMenuItem
                                                                            className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 cursor-pointer"
                                                                            onClick={() => restoreMutation.mutate(w._id)}
                                                                        >
                                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                                            Restore Wholesaler
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Cards - Professional design with clear data separation */}
                                <div className="md:hidden">
                                    {wholesalers.map((w, index) => (
                                        <div
                                            key={w._id}
                                            className={`p-3 bg-white active:scale-[0.99] transition-all ${index !== wholesalers.length - 1 ? 'border-b-2 border-gray-200' : ''}`}
                                            onClick={() => router.push(`/shopkeeper/wholesalers/${w._id}`)}
                                        >
                                            {/* Header Row - Icon, Name, Status, Actions */}
                                            <div className="flex items-center gap-3 mb-2">
                                                {/* Icon */}
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-400 to-indigo-500">
                                                    <Package className="h-5 w-5 text-white" />
                                                </div>

                                                {/* Name and Phone */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm truncate">{w.name}</p>
                                                    {w.phone && (
                                                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                                            <Phone className="h-2.5 w-2.5" />
                                                            {w.phone}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Status and Actions */}
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <Badge className={`text-[10px] px-1.5 py-0.5 border-0 ${w.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {w.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/shopkeeper/wholesalers/${w._id}`); }}>
                                                                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            {!w.isDeleted ? (
                                                                <>
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditClick(w); }}>
                                                                        <Edit className="mr-2 h-4 w-4 text-purple-600" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(w); }}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <DropdownMenuItem
                                                                    className="text-emerald-600"
                                                                    onClick={(e) => { e.stopPropagation(); restoreMutation.mutate(w._id); }}
                                                                >
                                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                                    Restore
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            {/* Amount Row - Purchased, Paid, Due */}
                                            <div className="bg-gray-50 rounded-lg p-2">
                                                <div className="grid grid-cols-3 gap-2 text-center">
                                                    {/* Purchased */}
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 font-medium">Purchased</p>
                                                        <p className="font-bold text-gray-900 text-sm">{formatCurrency(w.totalPurchased)}</p>
                                                    </div>

                                                    {/* Paid */}
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 font-medium">Paid</p>
                                                        <p className="font-bold text-green-600 text-sm">{formatCurrency(w.totalPaid)}</p>
                                                    </div>

                                                    {/* Due */}
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 font-medium">Due</p>
                                                        {w.outstandingDue > 0 ? (
                                                            <p className="font-bold text-red-600 text-sm">{formatCurrency(w.outstandingDue)}</p>
                                                        ) : (
                                                            <p className="font-bold text-green-600 text-sm">✓ Nil</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex flex-col items-center gap-3 px-3 md:px-6 py-3 md:py-4 border-t bg-gray-50/50">
                                        {/* Mobile: Compact pagination */}
                                        <div className="flex items-center justify-center gap-2 md:hidden w-full">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="h-9 px-3"
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Prev
                                            </Button>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                                                <span>{currentPage}</span>
                                                <span className="text-purple-400">/</span>
                                                <span>{pagination.totalPages}</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToPage(currentPage + 1)}
                                                disabled={currentPage === pagination.totalPages}
                                                className="h-9 px-3"
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>

                                        {/* Desktop: Full pagination */}
                                        <div className="hidden md:flex md:flex-row items-center justify-between w-full">
                                            <p className="text-sm text-gray-600">
                                                Showing <span className="font-semibold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                                <span className="font-semibold">{Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)}</span> of{' '}
                                                <span className="font-semibold">{pagination.total}</span> wholesalers
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => goToPage(1)}
                                                    disabled={currentPage === 1}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronsLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => goToPage(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>

                                                {getPageNumbers().map((page, index) => (
                                                    typeof page === 'number' ? (
                                                        <Button
                                                            key={index}
                                                            variant={currentPage === page ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => goToPage(page)}
                                                            className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                                                        >
                                                            {page}
                                                        </Button>
                                                    ) : (
                                                        <span key={index} className="px-2 text-gray-400">...</span>
                                                    )
                                                ))}

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => goToPage(currentPage + 1)}
                                                    disabled={currentPage === pagination.totalPages}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => goToPage(pagination.totalPages)}
                                                    disabled={currentPage === pagination.totalPages}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <ChevronsRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-8 md:p-12 text-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                    <Package className="h-6 w-6 md:h-8 md:w-8 text-purple-400" />
                                </div>
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">No wholesalers found</h3>
                                <p className="text-gray-500 mb-3 md:mb-4 text-sm md:text-base">
                                    {hasActiveFilters ? 'Try adjusting filters' : 'Add your first wholesaler'}
                                </p>
                                {hasActiveFilters ? (
                                    <Button
                                        onClick={clearFilters}
                                        variant="outline"
                                        size="sm"
                                        className="h-9"
                                    >
                                        <X className="mr-1.5 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                ) : (
                                    <AddWholesalerDialog
                                        trigger={
                                            <Button
                                                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-9"
                                                size="sm"
                                            >
                                                <Plus className="mr-1.5 h-4 w-4" />
                                                Add Wholesaler
                                            </Button>
                                        }
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit Wholesaler Dialog */}
            <EditWholesalerDialog
                isOpen={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setEditingWholesaler(null);
                }}
                onSave={handleEditSave}
                wholesaler={editingWholesaler}
                isSaving={updateMutation.isPending}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setSelectedWholesaler(null);
                }}
                onConfirm={handleDeleteConfirm}
                itemName={selectedWholesaler?.name}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
