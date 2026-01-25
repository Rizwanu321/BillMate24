'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, MessageCircle, MapPin, Save, CheckCircle, XCircle } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface CustomerData {
    _id: string;
    name: string;
    phone?: string;
    whatsappNumber?: string;
    email?: string;
    address?: string;
    place?: string;
    isActive?: boolean;
}

interface EditCustomerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<CustomerData>) => void;
    customer: CustomerData | null;
    isSaving?: boolean;
}

function EditCustomerForm({
    customer,
    onSave,
    onClose,
    isSaving
}: {
    customer: CustomerData | null;
    onSave: (data: Partial<CustomerData>) => void;
    onClose: () => void;
    isSaving: boolean;
}) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        whatsappNumber: '',
        email: '',
        address: '',
        place: '',
        isActive: true,
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                phone: customer.phone || '',
                whatsappNumber: customer.whatsappNumber || '',
                email: customer.email || '',
                address: customer.address || '',
                place: customer.place || '',
                isActive: customer.isActive ?? true,
            });
        }
    }, [customer]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 mt-4 pb-4 md:pb-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-sm md:text-base">
                        Customer Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Enter customer name"
                            required
                            className="pl-10 h-10 md:h-11 text-base md:text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-email" className="text-sm md:text-base">
                        Email Address
                    </Label>
                    <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="edit-email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            type="email"
                            placeholder="customer@example.com"
                            className="pl-10 h-10 md:h-11 text-base md:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-sm md:text-base">
                        Phone Number
                    </Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="edit-phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            type="tel"
                            placeholder="+91"
                            className="pl-10 h-10 md:h-11 text-base md:text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-whatsapp" className="text-sm md:text-base">WhatsApp</Label>
                    <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="edit-whatsapp"
                            value={formData.whatsappNumber}
                            onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                            type="tel"
                            placeholder="+91"
                            className="pl-10 h-10 md:h-11 text-base md:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-sm md:text-base">
                    Address
                </Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="edit-address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Enter complete address"
                        className="pl-10 h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-place" className="text-sm md:text-base">Place / City</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="edit-place"
                        value={formData.place}
                        onChange={(e) => handleChange('place', e.target.value)}
                        placeholder="Enter place or city"
                        className="pl-10 h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            {/* Active Status */}
            <div className="space-y-2 pt-2">
                <Label className="text-sm md:text-base">Status</Label>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant={formData.isActive ? 'default' : 'outline'}
                        className={`flex-1 h-10 md:h-11 ${formData.isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        onClick={() => handleChange('isActive', true)}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Active
                    </Button>
                    <Button
                        type="button"
                        variant={!formData.isActive ? 'default' : 'outline'}
                        className={`flex-1 h-10 md:h-11 ${!formData.isActive ? 'bg-slate-600 hover:bg-slate-700' : ''}`}
                        onClick={() => handleChange('isActive', false)}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Inactive
                    </Button>
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSaving}
                    className="flex-1 h-10 md:h-11 text-base md:text-sm"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSaving || !formData.name.trim()}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 h-10 md:h-11 text-base md:text-sm font-medium"
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            Saving...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                        </span>
                    )}
                </Button>
            </div>
        </form>
    );
}

export function EditCustomerDialog({
    isOpen,
    onClose,
    onSave,
    customer,
    isSaving = false
}: EditCustomerDialogProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Edit Customer</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                                    Update customer information
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <EditCustomerForm
                        customer={customer}
                        onSave={onSave}
                        onClose={onClose}
                        isSaving={isSaving}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="rounded-t-[20px] max-h-[90vh] overflow-y-auto px-4 md:px-6 pb-6">
                <SheetHeader className="text-left md:text-center mt-2">
                    <SheetTitle>Edit Customer</SheetTitle>
                    <SheetDescription>
                        Update account details and status.
                    </SheetDescription>
                </SheetHeader>
                <EditCustomerForm
                    customer={customer}
                    onSave={onSave}
                    onClose={onClose}
                    isSaving={isSaving}
                />
            </SheetContent>
        </Sheet>
    );
}
