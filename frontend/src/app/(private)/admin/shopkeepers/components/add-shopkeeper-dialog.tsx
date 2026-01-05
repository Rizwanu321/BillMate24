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

export function AddShopkeeperDialog() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/users', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shopkeepers'] });
            setIsOpen(false);
            toast.success('Shopkeeper created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create shopkeeper');
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            email: formData.get('email'),
            password: formData.get('password'),
            name: formData.get('name'),
            phone: formData.get('phone'),
            businessName: formData.get('businessName'),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Shopkeeper
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Shopkeeper</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input id="password" name="password" type="password" required minLength={6} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input id="businessName" name="businessName" />
                    </div>
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creating...' : 'Create Shopkeeper'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
