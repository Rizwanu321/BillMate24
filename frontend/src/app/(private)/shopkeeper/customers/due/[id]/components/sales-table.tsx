'use client';

import { Badge } from '@/components/ui/badge';
import { Receipt, Banknote, CreditCard as CreditCardIcon, Smartphone } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface Customer {
    totalSales: number;
    outstandingDue: number;
}

interface Bill {
    _id: string;
    billNumber: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentMethod: string;
    createdAt: string;
}

interface SalesTableProps {
    bills: Bill[];
    customer?: Customer;
    isLoading?: boolean;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    }).format(amount);
}

function formatCompact(amount: number): string {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toFixed(0)}`;
}

const paymentMethodConfig: Record<string, { label: string; icon: React.ReactNode; bgColor: string; color: string }> = {
    cash: { label: 'Cash', icon: <Banknote className="h-3 w-3" />, bgColor: 'bg-green-100', color: 'text-green-700' },
    card: { label: 'Card', icon: <CreditCardIcon className="h-3 w-3" />, bgColor: 'bg-blue-100', color: 'text-blue-700' },
    upi: { label: 'UPI', icon: <Smartphone className="h-3 w-3" />, bgColor: 'bg-purple-100', color: 'text-purple-700' },
    online: { label: 'Online', icon: <Smartphone className="h-3 w-3" />, bgColor: 'bg-purple-100', color: 'text-purple-700' },
    none: { label: '---', icon: null, bgColor: 'bg-gray-100', color: 'text-gray-600' },
};

export function SalesTable({ bills, customer, isLoading }: SalesTableProps) {
    // Calculate opening balance (total sales that came from before using the app)
    const billsTotal = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const openingBalance = customer ? Math.max(0, customer.totalSales - billsTotal) : 0;

    if (isLoading) {
        return (
            <div className="p-8 md:p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-emerald-500 mx-auto" />
                <p className="text-gray-500 mt-3 md:mt-4 text-sm">Loading sales...</p>
            </div>
        );
    }

    if ((!bills || bills.length === 0) && openingBalance <= 0) {
        return (
            <div className="p-8 md:p-12 text-center">
                <Receipt className="h-8 w-8 md:h-12 md:w-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">No sales yet</h3>
                <p className="text-gray-500 text-sm">Create a sale to this customer to see transactions here.</p>
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
                            <TableHead>Bill Number</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Paid</TableHead>
                            <TableHead className="text-right">Due</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Opening Balance Row */}
                        {openingBalance > 0 && (
                            <TableRow className="bg-blue-50/50 border-b-2 border-blue-200">
                                <TableCell className="text-gray-600 font-medium">
                                    Before App
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-blue-100 text-blue-700 border-0 font-mono text-sm">
                                        Opening Balance
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold text-gray-900">
                                    {formatCurrency(openingBalance)}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-gray-400">
                                    ₹0
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-semibold text-orange-600">
                                        {formatCurrency(openingBalance)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">
                                        N/A
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-orange-100 text-orange-700 border-0">
                                        Pending
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        )}

                        {bills.map((bill) => {
                            const methodConfig = bill.paymentMethod ? (paymentMethodConfig[bill.paymentMethod] || paymentMethodConfig.cash) : paymentMethodConfig.none;
                            const due = bill.dueAmount || (bill.totalAmount - bill.paidAmount);
                            return (
                                <TableRow key={bill._id} className="hover:bg-emerald-50/30">
                                    <TableCell>
                                        {format(new Date(bill.createdAt), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {bill.billNumber}
                                    </TableCell>
                                    <TableCell className="font-medium text-right">
                                        {formatCurrency(bill.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-green-600 text-right">
                                        {formatCurrency(bill.paidAmount)}
                                    </TableCell>
                                    <TableCell className="text-red-600 text-right">
                                        {formatCurrency(due)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${methodConfig.bgColor} ${methodConfig.color} border-0`}>
                                            {methodConfig.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {due <= 0 ? (
                                            <Badge className="bg-green-100 text-green-700 border-0">Paid</Badge>
                                        ) : bill.paidAmount > 0 ? (
                                            <Badge className="bg-yellow-100 text-yellow-700 border-0">Partial</Badge>
                                        ) : (
                                            <Badge variant="destructive">Pending</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
                {/* Opening Balance Card */}
                {openingBalance > 0 && (
                    <div className="p-3 bg-blue-50 rounded-xl shadow-sm border-l-4 border-l-blue-500 border-2 border-blue-200 mb-2">
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px] px-1.5 font-mono">
                                    Opening Balance
                                </Badge>
                                <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px] px-1.5">
                                    N/A
                                </Badge>
                            </div>
                            <Badge className="bg-orange-100 text-orange-700 border-0 text-[10px] px-1.5">
                                Pending
                            </Badge>
                        </div>

                        {/* Amount Row */}
                        <div className="bg-white rounded-lg p-2">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-medium">Total</p>
                                    <p className="font-bold text-gray-900 text-sm">{formatCompact(openingBalance)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-medium">Paid</p>
                                    <p className="font-bold text-gray-400 text-sm">₹0</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-medium">Due</p>
                                    <p className="font-bold text-orange-600 text-sm">{formatCompact(openingBalance)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Date */}
                        <p className="text-[10px] text-gray-500 mt-2 font-medium">
                            Before using app
                        </p>
                    </div>
                )}

                {bills.map((bill, index) => {
                    const methodConfig = bill.paymentMethod ? (paymentMethodConfig[bill.paymentMethod] || paymentMethodConfig.cash) : paymentMethodConfig.none;
                    const due = bill.dueAmount || (bill.totalAmount - bill.paidAmount);

                    return (
                        <div key={bill._id} className={`p-3 bg-white ${index !== bills.length - 1 ? 'border-b-2 border-gray-200' : ''}`}>
                            {/* Header Row - Bill Number, Method, Date */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white flex-shrink-0">
                                        <Receipt className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-mono text-xs text-gray-900 font-semibold">#{bill.billNumber}</p>
                                        <p className="text-[10px] text-gray-500">{format(new Date(bill.createdAt), 'dd MMM, hh:mm a')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <Badge className={`${methodConfig.bgColor} ${methodConfig.color} border-0 text-[10px] px-1.5`}>
                                        {methodConfig.label}
                                    </Badge>
                                    {due <= 0 ? (
                                        <Badge className="bg-green-100 text-green-700 border-0 text-[10px] px-1.5">Paid</Badge>
                                    ) : bill.paidAmount > 0 ? (
                                        <Badge className="bg-yellow-100 text-yellow-700 border-0 text-[10px] px-1.5">Partial</Badge>
                                    ) : (
                                        <Badge variant="destructive" className="text-[10px] px-1.5">Pending</Badge>
                                    )}
                                </div>
                            </div>

                            {/* Amount Row - Total, Paid, Due */}
                            <div className="bg-gray-50 rounded-lg p-2">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {/* Total */}
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-medium">Total</p>
                                        <p className="font-bold text-gray-900 text-sm">{formatCompact(bill.totalAmount)}</p>
                                    </div>

                                    {/* Paid */}
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-medium">Paid</p>
                                        <p className="font-bold text-green-600 text-sm">{formatCompact(bill.paidAmount)}</p>
                                    </div>

                                    {/* Due */}
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-medium">Due</p>
                                        {due > 0 ? (
                                            <p className="font-bold text-red-600 text-sm">{formatCompact(due)}</p>
                                        ) : (
                                            <p className="font-bold text-green-600 text-sm">✓ Nil</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
