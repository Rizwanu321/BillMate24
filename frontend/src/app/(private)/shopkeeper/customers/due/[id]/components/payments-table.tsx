'use client';

import { Badge } from '@/components/ui/badge';
import { CreditCard, Banknote, CreditCard as CardIcon, Smartphone } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface Payment {
    _id: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    createdAt: string;
}

interface PaymentsTableProps {
    payments: Payment[];
    isLoading?: boolean;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}



const paymentMethodConfig: Record<string, { label: string; icon: React.ReactNode; bgColor: string; color: string }> = {
    cash: { label: 'Cash', icon: <Banknote className="h-3 w-3" />, bgColor: 'bg-green-100', color: 'text-green-700' },
    card: { label: 'Card', icon: <CardIcon className="h-3 w-3" />, bgColor: 'bg-blue-100', color: 'text-blue-700' },
    upi: { label: 'UPI', icon: <Smartphone className="h-3 w-3" />, bgColor: 'bg-purple-100', color: 'text-purple-700' },
    online: { label: 'Online', icon: <Smartphone className="h-3 w-3" />, bgColor: 'bg-purple-100', color: 'text-purple-700' },
};

export function PaymentsTable({ payments, isLoading }: PaymentsTableProps) {
    if (isLoading) {
        return (
            <div className="p-8 md:p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-green-500 mx-auto" />
                <p className="text-gray-500 mt-3 md:mt-4 text-sm">Loading payments...</p>
            </div>
        );
    }

    if (!payments || payments.length === 0) {
        return (
            <div className="p-8 md:p-12 text-center">
                <CreditCard className="h-8 w-8 md:h-12 md:w-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">No payments recorded</h3>
                <p className="text-gray-500 text-sm">Record a payment to see transaction history here.</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => {
                            const methodConfig = paymentMethodConfig[payment.paymentMethod] || paymentMethodConfig.cash;
                            return (
                                <TableRow key={payment._id} className="hover:bg-green-50/30">
                                    <TableCell>
                                        {format(new Date(payment.createdAt), 'dd MMM yyyy, hh:mm a')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${methodConfig.bgColor} ${methodConfig.color} border-0 flex items-center gap-1.5 w-fit`}>
                                            {methodConfig.icon}
                                            {methodConfig.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 max-w-[200px] truncate">
                                        {payment.notes || '-'}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
                {payments.map((payment, index) => {
                    const methodConfig = paymentMethodConfig[payment.paymentMethod] || paymentMethodConfig.cash;

                    return (
                        <div key={payment._id} className={`p-3 bg-white ${index !== payments.length - 1 ? 'border-b-2 border-gray-200' : ''}`}>
                            {/* Header Row - Date, Method */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white flex-shrink-0">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm">Payment Received</p>
                                        <p className="text-[10px] text-gray-500">{format(new Date(payment.createdAt), 'dd MMM, hh:mm a')}</p>
                                    </div>
                                </div>
                                <Badge className={`${methodConfig.bgColor} ${methodConfig.color} border-0 text-[10px] px-1.5 flex items-center gap-1 flex-shrink-0`}>
                                    {methodConfig.icon}
                                    {methodConfig.label}
                                </Badge>
                            </div>

                            {/* Amount - Prominent Display */}
                            <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-green-600 font-medium">Amount</span>
                                    <span className="font-bold text-green-600 text-base">{formatCurrency(payment.amount)}</span>
                                </div>
                                {payment.notes && (
                                    <p className="text-[10px] text-gray-500 mt-1 truncate">Note: {payment.notes}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
