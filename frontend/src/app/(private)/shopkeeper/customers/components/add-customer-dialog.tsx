'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, IndianRupee, User, Phone, MapPin, MessageCircle } from 'lucide-react';
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetDescription,
} from '@/components/ui/sheet';
import api from '@/config/axios';
import { toast } from 'sonner';
import { customerSchema } from '@/schemas/customer.schema';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useTranslation } from 'react-i18next';

interface AddCustomerDialogProps {
    customerType: 'due' | 'normal';
}

interface CustomerFormProps {
    customerType: 'due' | 'normal';
    onSuccess: () => void;
    onCancel: () => void;
}

function CustomerForm({
    customerType,
    onSuccess,
    onCancel,
}: CustomerFormProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('/customers', {
                ...data,
                type: customerType,
            });
            return response.data;
        },
        onSuccess: () => {
            if (customerType === 'due') {
                queryClient.invalidateQueries({ queryKey: ['due-customers'] });
                queryClient.invalidateQueries({
                    queryKey: ['due-customers-stats'],
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ['normal-customers'] });
                queryClient.invalidateQueries({
                    queryKey: ['normal-customers-stats'],
                });
            }
            queryClient.invalidateQueries({ queryKey: ['customers'] });
            onSuccess();
            toast.success(t('customer_dialog.success_add'));
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || t('billing.bill_error'),
            );
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
            place: formData.get('place'),
            type: customerType,
        };

        // Handle number conversion
        if (
            customerType === 'due' &&
            initialSalesValue &&
            !isNaN(parseFloat(initialSalesValue))
        ) {
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
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 mt-4 pb-4 md:pb-0">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-sm md:text-base">
                    {t('customer_dialog.name')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="name"
                        name="name"
                        placeholder={t('wholesalers_list.dialogs.name_placeholder')}
                        required
                        autoComplete="name"
                        className="pl-10 h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm md:text-base">
                        {t('wholesalers_list.dialogs.phone')} {customerType === 'due' && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+91"
                            required={customerType === 'due'}
                            className="pl-10 h-10 md:h-11 text-base md:text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="whatsappNumber" className="text-sm md:text-base">{t('wholesalers_list.dialogs.whatsapp')}</Label>
                    <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="whatsappNumber"
                            name="whatsappNumber"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+91"
                            className="pl-10 h-10 md:h-11 text-base md:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address" className="text-sm md:text-base">
                    {t('wholesalers_list.dialogs.address')} {customerType === 'due' && <span className="text-red-500">*</span>}
                </Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="address"
                        name="address"
                        placeholder={t('wholesalers_list.dialogs.address_placeholder')}
                        autoComplete="street-address"
                        required={customerType === 'due'}
                        className="pl-10 h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="place" className="text-sm md:text-base">
                    {t('wholesalers_list.dialogs.place')}
                </Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="place"
                        name="place"
                        placeholder={t('wholesalers_list.dialogs.place_placeholder')}
                        autoComplete="address-level2"
                        className="pl-10 h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            {/* Opening Balance - Only for Due Customers */}
            {customerType === 'due' && (
                <div className="border-t pt-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="initialSales"
                            className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-sm md:text-base"
                        >
                            {t('wholesalers_list.dialogs.opening_balance')}
                            <span className="text-xs text-slate-500 font-normal">
                                {t('customer_dialog.opening_balance_desc')}
                            </span>
                        </Label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="initialSales"
                                name="initialSales"
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-10 h-10 md:h-11 text-base md:text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 h-10 md:h-11 text-base md:text-sm"
                >
                    {t('wholesalers_list.dialogs.cancel')}
                </Button>
                <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 h-10 md:h-11 text-base md:text-sm font-medium"
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? t('wholesalers_list.dialogs.creating') : t('wholesalers_list.dialogs.add_button').replace('മൊത്തക്കച്ചവടക്കാരനെ', customerType === 'due' ? t('sidebar.due_customers') : t('sidebar.normal_customers'))}
                </Button>
            </div>
        </form>
    );
}

export function AddCustomerDialog({ customerType }: AddCustomerDialogProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:shadow-lg transition-all">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('sidebar.add_bill').replace('ബില്ല്', customerType === 'due' ? t('sidebar.due_customers') : t('sidebar.normal_customers'))}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {t('customer_dialog.add_title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('customer_dialog.add_desc')}
                        </DialogDescription>
                    </DialogHeader>
                    <CustomerForm
                        customerType={customerType}
                        onSuccess={() => setIsOpen(false)}
                        onCancel={() => setIsOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-md hover:shadow-lg transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('sidebar.add_bill').replace('ബില്ല്', customerType === 'due' ? t('sidebar.due_customers') : t('sidebar.normal_customers'))}
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[20px] max-h-[90vh] overflow-y-auto px-4 md:px-6">
                <SheetHeader className="text-left md:text-center mt-2">
                    <SheetTitle>
                        {t('customer_dialog.add_title')}
                    </SheetTitle>
                    <SheetDescription>
                        {t('customer_dialog.add_desc')}
                    </SheetDescription>
                </SheetHeader>
                <CustomerForm
                    customerType={customerType}
                    onSuccess={() => setIsOpen(false)}
                    onCancel={() => setIsOpen(false)}
                />
            </SheetContent>
        </Sheet>
    );
}
