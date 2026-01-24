'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, User, Phone, MessageCircle, MapPin, Save, CheckCircle, XCircle } from 'lucide-react';

interface WholesalerData {
    _id: string;
    name: string;
    phone?: string;
    whatsappNumber?: string;
    address?: string;
    isActive?: boolean;
}

interface EditWholesalerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<WholesalerData>) => void;
    wholesaler: WholesalerData | null;
    isSaving?: boolean;
}

export function EditWholesalerDialog({
    isOpen,
    onClose,
    onSave,
    wholesaler,
    isSaving = false
}: EditWholesalerDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        whatsappNumber: '',
        address: '',
        isActive: true,
    });

    useEffect(() => {
        if (wholesaler) {
            setFormData({
                name: wholesaler.name || '',
                phone: wholesaler.phone || '',
                whatsappNumber: wholesaler.whatsappNumber || '',
                address: wholesaler.address || '',
                isActive: wholesaler.isActive ?? true,
            });
        }
    }, [wholesaler]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Edit Wholesaler</DialogTitle>
                            <p className="text-sm text-gray-500 mt-0.5">Update wholesaler information</p>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="flex items-center gap-2 text-sm font-medium">
                                <User className="h-4 w-4 text-gray-400" />
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Wholesaler name"
                                required
                                className="h-11"
                            />
                        </div>

                        {/* Phone Numbers - Side by Side */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone" className="flex items-center gap-2 text-sm font-medium">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    Phone <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                    required
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-whatsapp" className="flex items-center gap-2 text-sm font-medium">
                                    <MessageCircle className="h-4 w-4 text-green-500" />
                                    WhatsApp
                                </Label>
                                <Input
                                    id="edit-whatsapp"
                                    value={formData.whatsappNumber}
                                    onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="h-11"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-address" className="flex items-center gap-2 text-sm font-medium">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                Address
                            </Label>
                            <Input
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                placeholder="Enter full address"
                                className="h-11"
                            />
                        </div>

                        {/* Active Status - Toggle Buttons */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Status</Label>
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant={formData.isActive ? 'default' : 'outline'}
                                    className={formData.isActive
                                        ? 'flex-1 bg-green-600 hover:bg-green-700'
                                        : 'flex-1'
                                    }
                                    onClick={() => handleChange('isActive', true)}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Active
                                </Button>
                                <Button
                                    type="button"
                                    variant={!formData.isActive ? 'default' : 'outline'}
                                    className={!formData.isActive
                                        ? 'flex-1 bg-gray-600 hover:bg-gray-700'
                                        : 'flex-1'
                                    }
                                    onClick={() => handleChange('isActive', false)}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Inactive
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                {formData.isActive
                                    ? 'Wholesaler will be visible in all lists'
                                    : 'Wholesaler will be hidden from active lists'
                                }
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="mt-6 gap-3 sm:gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving || !formData.name.trim() || !formData.phone.trim()}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
