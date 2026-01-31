'use client';


import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wholesaler } from '@/types';
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
import { Package, User, Phone, MessageCircle, MapPin, Save, CheckCircle, XCircle, IndianRupee } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';



interface EditWholesalerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Wholesaler>) => void;
    wholesaler: Wholesaler | null;
    isSaving?: boolean;
}

function EditWholesalerForm({
    wholesaler,
    onSave,
    onClose,
    isSaving
}: {
    wholesaler: Wholesaler | null;
    onSave: (data: Partial<Wholesaler>) => void;
    onClose: () => void;
    isSaving: boolean;
}) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        whatsappNumber: '',
        address: '',
        place: '',
        initialPurchased: 0,
        isActive: true,
    });

    useEffect(() => {
        if (wholesaler) {
            setFormData({
                name: wholesaler.name || '',
                phone: wholesaler.phone || '',
                whatsappNumber: wholesaler.whatsappNumber || '',
                address: wholesaler.address || '',
                place: wholesaler.place || '',
                initialPurchased: wholesaler.initialPurchased || 0,
                isActive: wholesaler.isActive ?? true,
            });
        }
    }, [wholesaler]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 mt-4 pb-4 md:pb-0">
            <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm md:text-base">
                    {t('wholesalers_list.dialogs.name')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder={t('wholesalers_list.dialogs.name_placeholder')}
                        required
                        className="pl-10 h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-phone" className="text-sm md:text-base">
                        {t('wholesalers_list.dialogs.phone')} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="edit-phone"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            type="tel"
                            placeholder="+91"
                            required
                            className="pl-10 h-10 md:h-11 text-base md:text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-whatsapp" className="text-sm md:text-base">{t('wholesalers_list.dialogs.whatsapp')}</Label>
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
                    {t('wholesalers_list.dialogs.address')} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="edit-address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder={t('wholesalers_list.dialogs.address_placeholder')}
                        required
                        className="pl-10 h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="edit-place" className="text-sm md:text-base">{t('wholesalers_list.dialogs.place')}</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        id="edit-place"
                        value={formData.place}
                        onChange={(e) => handleChange('place', e.target.value)}
                        placeholder={t('wholesalers_list.dialogs.place_placeholder')}
                        className="pl-10 h-10 md:h-11 text-base md:text-sm"
                    />
                </div>
            </div>

            <div className="border-t pt-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-initialPurchased" className="text-sm md:text-base">
                        {t("wholesalers_list.dialogs.opening_balance")}
                    </Label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="edit-initialPurchased"
                            value={formData.initialPurchased}
                            onChange={(e) => handleChange('initialPurchased', parseFloat(e.target.value) || 0)}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-10 h-10 md:h-11 text-base md:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Active Status */}
            <div className="space-y-2 pt-2">
                <Label className="text-sm md:text-base">{t('wholesalers_list.filters.status')}</Label>
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant={formData.isActive ? 'default' : 'outline'}
                        className={`flex-1 h-10 md:h-11 ${formData.isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        onClick={() => handleChange('isActive', true)}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('wholesalers_list.stats.active')}
                    </Button>
                    <Button
                        type="button"
                        variant={!formData.isActive ? 'default' : 'outline'}
                        className={`flex-1 h-10 md:h-11 ${!formData.isActive ? 'bg-slate-600 hover:bg-slate-700' : ''}`}
                        onClick={() => handleChange('isActive', false)}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('wholesalers_list.stats.inactive')}
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
                    {t('wholesalers_list.dialogs.cancel')}
                </Button>
                <Button
                    type="submit"
                    disabled={isSaving || !formData.name.trim() || !formData.phone.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 h-10 md:h-11 text-base md:text-sm font-medium"
                >
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            {t('wholesalers_list.dialogs.saving')}
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {t('wholesalers_list.dialogs.save_button')}
                        </span>
                    )}
                </Button>
            </div>
        </form>
    );
}

export function EditWholesalerDialog({
    isOpen,
    onClose,
    onSave,
    wholesaler,
    isSaving = false
}: EditWholesalerDialogProps) {
    const { t } = useTranslation();
    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{t('wholesalers_list.dialogs.edit_title')}</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                                    {t('wholesalers_list.dialogs.edit_desc')}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <EditWholesalerForm
                        wholesaler={wholesaler}
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
                    <SheetTitle>{t('wholesalers_list.dialogs.edit_title')}</SheetTitle>
                    <SheetDescription>
                        {t('wholesalers_list.dialogs.edit_desc')}
                    </SheetDescription>
                </SheetHeader>
                <EditWholesalerForm
                    wholesaler={wholesaler}
                    onSave={onSave}
                    onClose={onClose}
                    isSaving={isSaving}
                />
            </SheetContent>
        </Sheet>
    );
}

