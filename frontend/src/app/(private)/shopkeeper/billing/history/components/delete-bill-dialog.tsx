'use client';

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import api from '@/config/axios';
import { toast } from 'sonner';

interface DeleteBillDialogProps {
    bill: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteBillDialog({ bill, open, onOpenChange, onSuccess }: DeleteBillDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!bill) return;
        setIsLoading(true);
        try {
            await api.delete(`/bills/${bill._id}`);
            toast.success('Bill deleted successfully');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete bill');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[400px]">
                <AlertDialogHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <AlertDialogTitle className="text-center text-xl font-bold">Delete Bill?</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        This will soft delete bill <span className="font-mono font-bold text-slate-900">{bill?.billNumber}</span>.
                        The {bill?.billType === 'purchase' ? "wholesaler's" : "customer's"} ledger balance will be reversed.
                        <br /><br />
                        <span className="text-xs text-red-500 font-medium">This action can be undone by an admin.</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:flex-col gap-2 mt-2">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="w-full h-11 font-bold shadow-lg shadow-red-500/20"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Confirm Delete
                            </>
                        )}
                    </Button>
                    <AlertDialogCancel asChild>
                        <Button variant="ghost" className="w-full h-11 font-semibold border-0">
                            Keep Bill
                        </Button>
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
