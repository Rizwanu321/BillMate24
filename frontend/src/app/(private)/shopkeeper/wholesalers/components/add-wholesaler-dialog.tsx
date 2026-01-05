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

export function AddWholesalerDialog() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/wholesalers', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wholesalers'] });
            setIsOpen(false);
            toast.success('Wholesaler created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create wholesaler');
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
                    Add Wholesaler
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Wholesaler</DialogTitle>
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
                        {createMutation.isPending ? 'Creating...' : 'Add Wholesaler'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
