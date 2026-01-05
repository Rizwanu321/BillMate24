'use client';

import { Badge } from '@/components/ui/badge';
import { Receipt, ExternalLink } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';

interface Bill {
    _id: string;
    billNumber: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentMethod: string;
    createdAt: string;
}

interface TransactionsTableProps {
    bills: Bill[];
    isLoading?: boolean;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

const paymentMethodColors: Record<string, string> = {
    cash: 'bg-green-100 text-green-700',
    card: 'bg-blue-100 text-blue-700',
    online: 'bg-purple-100 text-purple-700',
    upi: 'bg-indigo-100 text-indigo-700',
};

export function TransactionsTable({ bills, isLoading }: TransactionsTableProps) {
    if (isLoading) {
        return (
            <div className="p-8 md:p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-purple-500 mx-auto" />
                <p className="text-gray-500 mt-3 md:mt-4 text-sm md:text-base">Loading...</p>
            </div>
        );
    }

    if (!bills || bills.length === 0) {
        return (
            <div className="p-8 md:p-12 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Receipt className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">No transactions</h3>
                <p className="text-gray-500 mb-3 md:mb-4 text-sm md:text-base">Create a purchase bill to see transactions.</p>
                <Link href="/shopkeeper/billing">
                    <Button className="bg-purple-600 hover:bg-purple-700 h-9 text-sm">
                        Create Bill
                    </Button>
                </Link>
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
                            <TableHead className="font-semibold">Date</TableHead>
                            <TableHead className="font-semibold">Bill Number</TableHead>
                            <TableHead className="font-semibold text-right">Amount</TableHead>
                            <TableHead className="font-semibold text-right">Paid</TableHead>
                            <TableHead className="font-semibold text-right">Due</TableHead>
                            <TableHead className="font-semibold">Method</TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bills.map((bill) => {
                            const due = bill.dueAmount ?? (bill.totalAmount - bill.paidAmount);
                            return (
                                <TableRow key={bill._id} className="hover:bg-purple-50/30 transition-colors">
                                    <TableCell className="text-gray-600">
                                        {format(new Date(bill.createdAt), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {bill.billNumber}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-gray-900">
                                        {formatCurrency(bill.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-green-600">
                                        {formatCurrency(bill.paidAmount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={due > 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>
                                            {due > 0 ? formatCurrency(due) : '-'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`capitalize border-0 ${paymentMethodColors[bill.paymentMethod] || 'bg-gray-100 text-gray-700'}`}>
                                            {bill.paymentMethod}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            if (due <= 0) {
                                                return <Badge className="bg-green-100 text-green-700 border-0">✓ Paid</Badge>;
                                            } else if (bill.paidAmount > 0) {
                                                return <Badge className="bg-yellow-100 text-yellow-700 border-0">Partial</Badge>;
                                            } else {
                                                return <Badge className="bg-red-100 text-red-700 border-0">Pending</Badge>;
                                            }
                                        })()}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards - App-like with colored borders */}
            <div className="md:hidden p-2 space-y-2 bg-gray-50/50">
                {bills.map((bill) => {
                    const due = bill.dueAmount ?? (bill.totalAmount - bill.paidAmount);
                    return (
                        <div
                            key={bill._id}
                            className={`p-3 bg-white rounded-xl shadow-sm border-l-4 active:scale-[0.99] transition-all ${due > 0 ? 'border-l-orange-500' : 'border-l-green-500'
                                }`}
                        >
                            {/* Header Row */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                        {bill.billNumber}
                                    </span>
                                    <Badge className={`capitalize border-0 text-[10px] px-1.5 ${paymentMethodColors[bill.paymentMethod] || 'bg-gray-100'}`}>
                                        {bill.paymentMethod}
                                    </Badge>
                                </div>
                                {(() => {
                                    if (due <= 0) {
                                        return <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5">✓ Paid</Badge>;
                                    } else if (bill.paidAmount > 0) {
                                        return <Badge className="bg-yellow-100 text-yellow-700 border-0 text-[10px] px-1.5">Partial</Badge>;
                                    } else {
                                        return <Badge className="bg-red-100 text-red-700 border-0 text-[10px] px-1.5">Pending</Badge>;
                                    }
                                })()}
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="text-[10px] text-gray-400">Amount</p>
                                        <p className="text-xs font-bold text-gray-900">{formatCurrency(bill.totalAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400">Paid</p>
                                        <p className="text-xs font-bold text-green-600">{formatCurrency(bill.paidAmount)}</p>
                                    </div>
                                    {due > 0 && (
                                        <div>
                                            <p className="text-[10px] text-gray-400">Due</p>
                                            <p className="text-xs font-bold text-red-600">{formatCurrency(due)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date */}
                            <p className="text-[10px] text-gray-400 mt-2">
                                {format(new Date(bill.createdAt), 'dd MMM yyyy, hh:mm a')}
                            </p>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
