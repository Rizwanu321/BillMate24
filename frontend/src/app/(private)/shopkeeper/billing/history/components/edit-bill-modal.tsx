'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Receipt, IndianRupee, Banknote, CreditCard, Smartphone } from 'lucide-react';
import api from '@/config/axios';
import { toast } from 'sonner';

const updateBillSchema = z.object({
    totalAmount: z.number().min(0.01, 'Total amount must be greater than 0'),
    paidAmount: z.number().min(0, 'Paid amount must be positive'),
    paymentMethod: z.enum(['cash', 'card', 'online']).optional(),
    notes: z.string().optional(),
}).refine((data) => {
    if (data.paidAmount > 0 && !data.paymentMethod) {
        return false;
    }
    return true;
}, {
    message: 'Payment method is required',
    path: ['paymentMethod'],
});

type UpdateBillInput = z.infer<typeof updateBillSchema>;

interface EditBillModalProps {
    bill: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditBillModal({ bill, open, onOpenChange, onSuccess }: EditBillModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<UpdateBillInput>({
        resolver: zodResolver(updateBillSchema),
    });

    useEffect(() => {
        if (bill) {
            reset({
                totalAmount: bill.totalAmount,
                paidAmount: bill.paidAmount,
                paymentMethod: bill.paymentMethod,
                notes: bill.notes || '',
            });
        }
    }, [bill, reset]);

    const onSubmit = async (data: UpdateBillInput) => {
        if (!bill) return;
        setIsLoading(true);
        const payload: any = { ...data };
        if (data.paidAmount === 0) {
            delete payload.paymentMethod;
        }

        try {
            await api.patch(`/bills/${bill._id}`, payload);
            toast.success('Bill updated successfully');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update bill');
        } finally {
            setIsLoading(false);
        }
    };

    const totalAmount = watch('totalAmount') || 0;
    const paidAmount = watch('paidAmount') || 0;
    const dueAmount = Math.max(0, totalAmount - paidAmount);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Receipt className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Edit Transaction</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold">Update Bill Details</DialogTitle>
                    <DialogDescription>
                        Correcting bill details will automatically update the {bill?.billType === 'purchase' ? "wholesaler's" : "customer's"} ledger balance.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="totalAmount" className="text-slate-700 font-semibold">Total Bill Amount</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                <Input
                                    id="totalAmount"
                                    type="number"
                                    step="0.01"
                                    className="pl-8 h-11 border-slate-200 focus:border-blue-500 font-bold text-lg"
                                    {...register('totalAmount', { valueAsNumber: true })}
                                />
                            </div>
                            {errors.totalAmount && <p className="text-xs text-red-500">{errors.totalAmount.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paidAmount" className="text-slate-700 font-semibold">Amount Paid</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-green-500">₹</span>
                                <Input
                                    id="paidAmount"
                                    type="number"
                                    step="0.01"
                                    className="pl-8 h-11 border-slate-200 focus:border-green-500 font-bold text-lg text-green-700"
                                    {...register('paidAmount', { valueAsNumber: true })}
                                />
                            </div>
                            {errors.paidAmount && <p className="text-xs text-red-500">{errors.paidAmount.message}</p>}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <span className="text-sm font-medium text-slate-600">Balance Due:</span>
                            <span className={`font-bold ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ₹{dueAmount.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {paidAmount > 0 && (
                        <div className="space-y-3">
                            <Label className="text-slate-700 font-semibold">Payment Method</Label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                                    { value: 'card', label: 'Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                                    { value: 'online', label: 'UPI', icon: Smartphone, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                                ].map((method) => {
                                    const isSelected = watch('paymentMethod') === method.value;
                                    return (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => setValue('paymentMethod', method.value as any)}
                                            className={`flex-1 py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${isSelected
                                                ? `${method.border} ${method.bg} shadow-sm ring-1 ring-${method.color.split('-')[1]}-500/20`
                                                : 'border-slate-100 hover:border-slate-200 bg-white'
                                                }`}
                                        >
                                            <method.icon className={`h-5 w-5 ${isSelected ? method.color : 'text-slate-400'}`} />
                                            <span className={`text-[11px] font-bold ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{method.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.paymentMethod && (
                                <p className="text-xs text-red-500 mt-1 font-medium">{errors.paymentMethod.message}</p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-slate-700 font-semibold">Notes</Label>
                        <Input
                            id="notes"
                            placeholder="Add reason for edit or other notes..."
                            className="h-11 border-slate-200"
                            {...register('notes')}
                        />
                    </div>

                    <DialogFooter className="pt-2 gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-11 font-semibold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] h-11 font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
