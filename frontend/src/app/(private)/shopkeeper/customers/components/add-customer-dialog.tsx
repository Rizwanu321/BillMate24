'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
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
import api from '@/config/axios';
import { toast } from 'sonner';

interface AddCustomerDialogProps {
    customerType: 'due' | 'normal';
}

export function AddCustomerDialog({ customerType }: AddCustomerDialogProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/customers', { ...data, type: customerType });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate the correct query key based on customer type
            if (customerType === 'due') {
                queryClient.invalidateQueries({ queryKey: ['due-customers'] });
                queryClient.invalidateQueries({ queryKey: ['due-customers-stats'] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['normal-customers'] });
                queryClient.invalidateQueries({ queryKey: ['normal-customers-stats'] });
            }
            // Also invalidate general customers queries
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            setIsOpen(false);
            toast.success('Customer created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create customer');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            name: formData.get('name'),
            phone: formData.get('phone'),
            whatsappNumber: formData.get('whatsappNumber'),
            address: formData.get('address'),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add {customerType === 'due' ? 'Due' : 'Normal'} Customer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add {customerType === 'due' ? 'Due' : 'Normal'} Customer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
    );
}
