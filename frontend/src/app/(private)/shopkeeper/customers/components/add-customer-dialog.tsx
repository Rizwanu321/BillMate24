'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from '@/components/ui/dialog';
import api from '@/config/axios';
import { toast } from 'sonner';
import { customerSchema } from '@/schemas/customer.schema';

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
            if (customerType === 'due') {
                queryClient.invalidateQueries({ queryKey: ['due-customers'] });
                queryClient.invalidateQueries({ queryKey: ['due-customers-stats'] });
            } else {
                queryClient.invalidateQueries({ queryKey: ['normal-customers'] });
                queryClient.invalidateQueries({ queryKey: ['normal-customers-stats'] });
            }
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

        const initialSalesValue = formData.get('initialSales') as string;

        const rawData: any = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            whatsappNumber: formData.get('whatsappNumber'),
            address: formData.get('address'),
            type: customerType
        };

        // Handle number conversion
        if (customerType === 'due' && initialSalesValue && !isNaN(parseFloat(initialSalesValue))) {
            rawData.initialSales = parseFloat(initialSalesValue);
        }

        const validation = customerSchema.safeParse(rawData);

        if (!validation.success) {
            toast.error(validation.error.issues[0].message);
            return;
        }

        createMutation.mutate(validation.data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Add {customerType === 'due' ? 'Due' : 'Normal'} Customer
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add {customerType === 'due' ? 'Due' : 'Normal'} Customer</DialogTitle>
                    <DialogDescription>
                        Create a new {customerType} customer account.
                        {customerType === 'due' && ' You can record past sales if migrating from another system.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Customer Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Enter customer name"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number {customerType === 'due' && <span className="text-red-500">*</span>}</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+91"
                                required={customerType === 'due'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">WhatsApp</Label>
                            <Input
                                id="whatsappNumber"
                                name="whatsappNumber"
                                type="tel"
                                placeholder="+91"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address {customerType === 'due' && <span className="text-red-500">*</span>}</Label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Enter complete address"
                            required={customerType === 'due'}
                        />
                    </div>

                    {/* Opening Balance - Only for Due Customers */}
                    {customerType === 'due' && (
                        <div className="border-t pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="initialSales" className="flex items-center gap-2">
                                    Opening Balance (Optional)
                                    <span className="text-xs text-gray-500 font-normal">
                                        - Total sales before using app
                                    </span>
                                </Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        id="initialSales"
                                        name="initialSales"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        className="pl-10"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Enter the total amount sold to this customer before using this app.
                                    This will be recorded as outstanding debt to be collected.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
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
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Creating...' : 'Add Customer'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
