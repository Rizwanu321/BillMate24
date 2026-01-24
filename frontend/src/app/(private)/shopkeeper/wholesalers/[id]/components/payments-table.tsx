'use client';

import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Banknote, Smartphone, Clock } from 'lucide-react';
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

const paymentMethodConfig: Record<string, { color: string; gradient: string; icon: React.ReactNode; label: string }> = {
    cash: {
        color: 'bg-green-100 text-green-700',
        gradient: 'from-green-400 to-emerald-500',
        icon: <Banknote className="h-4 w-4" />,
        label: 'Cash'
    },
    card: {
        color: 'bg-blue-100 text-blue-700',
        gradient: 'from-blue-400 to-indigo-500',
        icon: <CreditCard className="h-4 w-4" />,
        label: 'Card'
    },
    online: {
        color: 'bg-purple-100 text-purple-700',
        gradient: 'from-purple-400 to-fuchsia-500',
        icon: <Smartphone className="h-4 w-4" />,
        label: 'Online'
    },
    upi: {
        color: 'bg-indigo-100 text-indigo-700',
        gradient: 'from-indigo-400 to-violet-500',
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

            {/* Mobile Cards - Professional design inspired by Bill History */}
            <div className="md:hidden space-y-3 p-3 bg-gray-50/50">
                {payments.map((payment) => {
                    const config = paymentMethodConfig[payment.paymentMethod] || {
                        color: 'bg-gray-100 text-gray-700',
                        gradient: 'from-gray-400 to-gray-500',
                        icon: <Wallet className="h-4 w-4" />,
                        label: payment.paymentMethod
                    };

                    const Icon =
                        payment.paymentMethod === 'cash' ? Banknote :
                            payment.paymentMethod === 'card' ? CreditCard :
                                ['online', 'upi'].includes(payment.paymentMethod) ? Smartphone : Wallet;

                    return (
                        <div
                            key={payment._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.99] transition-all"
                        >
                            <div className="p-3">
                                {/* Header Row */}
                                <div className="flex items-center gap-3 mb-3">
                                    {/* Icon Box */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm ${config.gradient}`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>

                                    {/* Title & Date */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm">Payment Received</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(payment.createdAt), 'dd MMM yyyy')}
                                        </p>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-green-600 tracking-tight">
                                            {formatCurrency(payment.amount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Details Box */}
                                <div className="bg-gray-50 rounded-lg p-2.5 grid grid-cols-2 gap-2 border border-gray-100/50">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Method</p>
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="secondary" className={`text-[10px] px-1.5 h-5 font-medium border-0 ${config.color.replace('bg-', 'bg-opacity-50 bg-')}`}>
                                                {config.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Time</p>
                                        <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                            {format(new Date(payment.createdAt), 'hh:mm a')}
                                        </p>
                                    </div>
                                </div>

                                {/* Notes */}
                                {payment.notes && (
                                    <div className="mt-2.5 pt-2.5 border-t border-dashed border-gray-200">
                                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Note</p>
                                        <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 text-amber-900">
                                            {payment.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
