'use client';

import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Banknote, Smartphone } from 'lucide-react';
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

const paymentMethodConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    cash: {
        color: 'bg-green-100 text-green-700',
        icon: <Banknote className="h-4 w-4" />,
        label: 'Cash'
    },
    card: {
        color: 'bg-blue-100 text-blue-700',
        icon: <CreditCard className="h-4 w-4" />,
        label: 'Card'
    },
    online: {
        color: 'bg-purple-100 text-purple-700',
        icon: <Smartphone className="h-4 w-4" />,
        label: 'Online'
    },
    upi: {
        color: 'bg-indigo-100 text-indigo-700',
        icon: <Smartphone className="h-4 w-4" />,
        label: 'UPI'
    },
};

export function PaymentsTable({ payments, isLoading }: PaymentsTableProps) {
    if (isLoading) {
        return (
            <div className="p-8 md:p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-green-500 mx-auto" />
                <p className="text-gray-500 mt-3 md:mt-4 text-sm md:text-base">Loading...</p>
            </div>
        );
    }

    if (!payments || payments.length === 0) {
        return (
            <div className="p-8 md:p-12 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">No payments</h3>
                <p className="text-gray-500 text-sm md:text-base">Record a payment to see history.</p>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="font-semibold">Date & Time</TableHead>
                            <TableHead className="font-semibold">Amount</TableHead>
                            <TableHead className="font-semibold">Payment Method</TableHead>
                            <TableHead className="font-semibold">Notes</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => {
                            const config = paymentMethodConfig[payment.paymentMethod] || {
                                color: 'bg-gray-100 text-gray-700',
                                icon: <Wallet className="h-4 w-4" />,
                                label: payment.paymentMethod
                            };

                            return (
                                <TableRow key={payment._id} className="hover:bg-green-50/30 transition-colors">
                                    <TableCell className="text-gray-600">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {format(new Date(payment.createdAt), 'dd MMM yyyy')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {format(new Date(payment.createdAt), 'hh:mm a')}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xl font-bold text-green-600">
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`border-0 flex items-center gap-1.5 w-fit ${config.color}`}>
                                            {config.icon}
                                            {config.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 max-w-[200px]">
                                        {payment.notes ? (
                                            <span className="line-clamp-2">{payment.notes}</span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards - App-like with colored borders */}
            <div className="md:hidden p-2 space-y-2 bg-gray-50/50">
                {payments.map((payment) => {
                    const config = paymentMethodConfig[payment.paymentMethod] || {
                        color: 'bg-gray-100 text-gray-700',
                        icon: <Wallet className="h-3.5 w-3.5" />,
                        label: payment.paymentMethod
                    };

                    return (
                        <div
                            key={payment._id}
                            className="p-3 bg-white rounded-xl shadow-sm border-l-4 border-l-green-500 active:scale-[0.99] transition-all"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-base font-bold text-green-600">
                                    {formatCurrency(payment.amount)}
                                </span>
                                <Badge className={`border-0 flex items-center gap-1 text-[10px] px-1.5 ${config.color}`}>
                                    {config.icon}
                                    {config.label}
                                </Badge>
                            </div>
                            {payment.notes && (
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{payment.notes}</p>
                            )}
                            <p className="text-[10px] text-gray-400">
                                {format(new Date(payment.createdAt), 'dd MMM yyyy, hh:mm a')}
                            </p>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
