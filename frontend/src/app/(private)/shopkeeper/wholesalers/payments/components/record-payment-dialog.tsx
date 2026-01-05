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

interface Wholesaler {
    _id: string;
    name: string;
    outstandingDue: number;
}

interface RecordPaymentDialogProps {
    wholesalers: Wholesaler[];
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function RecordPaymentDialog({ wholesalers }: RecordPaymentDialogProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedWholesaler, setSelectedWholesaler] = useState<string>('');

    const paymentMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/payments', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wholesaler-payments'] });
            queryClient.invalidateQueries({ queryKey: ['wholesalers-with-dues'] });
            queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
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
        const wholesaler = wholesalers.find(w => w._id === selectedWholesaler);

        if (!wholesaler) {
            toast.error('Please select a wholesaler');
            return;
        }

        paymentMutation.mutate({
            entityType: 'wholesaler',
            entityId: selectedWholesaler,
            entityName: wholesaler.name,
            amount: parseFloat(formData.get('amount') as string),
            paymentMethod: formData.get('paymentMethod'),
            notes: formData.get('notes'),
        });
    };

    const wholesalersWithDues = wholesalers.filter(w => w.outstandingDue > 0);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <IndianRupee className="mr-2 h-4 w-4" />
                    Record Payment
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Payment to Wholesaler</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label>Select Wholesaler *</Label>
                        <Select onValueChange={setSelectedWholesaler} value={selectedWholesaler}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose wholesaler" />
                            </SelectTrigger>
                            <SelectContent>
                                {wholesalersWithDues.map((w) => (
                                    <SelectItem key={w._id} value={w._id}>
                                        {w.name} (Due: {formatCurrency(w.outstandingDue)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Payment Method *</Label>
                        <Select name="paymentMethod" defaultValue="cash">
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
                    <Button type="submit" className="w-full" disabled={paymentMutation.isPending}>
                        {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
