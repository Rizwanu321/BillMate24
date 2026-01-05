'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, Trash2, CreditCard } from 'lucide-react';
import { Header } from '@/components/app/header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Customer, PaginatedResponse } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default function CustomersPage() {
    const queryClient = useQueryClient();
    const { hasFeature } = useAuth();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [customerType, setCustomerType] = useState<'due' | 'normal'>('due');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['customers', customerType, page],
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Customer>>(
                `/customers?type=${customerType}&page=${page}&limit=10`
            );
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/customers', { ...data, type: 'due' });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setIsCreateOpen(false);
            toast.success('Customer created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create customer');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/customers/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            toast.success('Customer deleted');
        },
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            name: formData.get('name'),
            phone: formData.get('phone'),
            whatsappNumber: formData.get('whatsappNumber'),
            address: formData.get('address'),
        });
    };

    const filteredCustomers = data?.data?.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Customers" />

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
                        <p className="text-gray-600">Manage due and normal customers</p>
                    </div>

                    {hasFeature('dueCustomers') && customerType === 'due' && (
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Due Customer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Due Customer</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input id="name" name="name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" name="phone" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                                        <Input id="whatsappNumber" name="whatsappNumber" placeholder="+91 XXXXX XXXXX" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input id="address" name="address" />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Creating...' : 'Add Customer'}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <Tabs value={customerType} onValueChange={(v) => setCustomerType(v as 'due' | 'normal')}>
                    <TabsList className="mb-4">
                        {hasFeature('dueCustomers') && (
                            <TabsTrigger value="due">Due Customers</TabsTrigger>
                        )}
                        {hasFeature('normalCustomers') && (
                            <TabsTrigger value="normal">Normal Customers</TabsTrigger>
                        )}
                    </TabsList>

                    <Card className="border-0 shadow-lg">
                        <CardHeader className="border-b bg-gray-50/50">
                            <div className="relative max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search customers..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Total Sales</TableHead>
                                            <TableHead>Total Paid</TableHead>
                                            {customerType === 'due' && <TableHead>Outstanding</TableHead>}
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCustomers?.map((c) => (
                                            <TableRow key={c._id}>
                                                <TableCell className="font-medium">{c.name}</TableCell>
                                                <TableCell>{c.phone || '-'}</TableCell>
                                                <TableCell>{formatCurrency(c.totalSales)}</TableCell>
                                                <TableCell>{formatCurrency(c.totalPaid)}</TableCell>
                                                {customerType === 'due' && (
                                                    <TableCell>
                                                        <Badge variant={c.outstandingDue > 0 ? 'destructive' : 'secondary'}>
                                                            {formatCurrency(c.outstandingDue)}
                                                        </Badge>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {customerType === 'due' && (
                                                                <DropdownMenuItem>
                                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                                    Record Payment
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => deleteMutation.mutate(c._id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </div>
    );
}
