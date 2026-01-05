'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import api from '@/config/axios';
import { toast } from 'sonner';

interface Customer {
    _id: string;
    name: string;
    outstandingDue: number;
}

interface RecordPaymentDialogProps {
    customer: Customer;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function RecordPaymentDialog({ customer }: RecordPaymentDialogProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const paymentMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/payments', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customer'] });
            queryClient.invalidateQueries({ queryKey: ['customer-bills'] });
            queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setIsOpen(false);
            toast.success('Payment recorded successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const amount = parseFloat(formData.get('amount') as string);

        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        paymentMutation.mutate({
            entityType: 'customer',
            entityId: customer._id,
            entityName: customer.name,
            amount,
            paymentMethod,
            notes: formData.get('notes') || '',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 h-8 md:h-9 text-xs md:text-sm px-2 md:px-4">
                    <IndianRupee className="mr-1 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Receive Payment</span>
                    <span className="sm:hidden">Pay</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Receive Payment from {customer.name}</DialogTitle>
                </DialogHeader>

                {customer.outstandingDue > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                            Outstanding Due: <span className="font-bold">{formatCurrency(customer.outstandingDue)}</span>
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                max={customer.outstandingDue}
                                className="pl-10"
                                placeholder="Enter amount"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Payment Method *</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="online">Online/UPI</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Input id="notes" name="notes" placeholder="Optional notes..." />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={paymentMutation.isPending}
                        >
                            {paymentMutation.isPending ? 'Recording...' : 'Receive Payment'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
