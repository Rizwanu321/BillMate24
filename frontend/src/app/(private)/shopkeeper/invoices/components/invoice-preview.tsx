'use client';

import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface InvoicePreviewProps {
    invoice: Partial<Invoice>;
    templateId: string;
    colorScheme: string;
    colorSchemes: Array<{ id: string; name: string; primary: string; secondary: string; accent: string }>;
}

function formatCurrency(amount: number | undefined): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount ?? 0);
}

export function InvoicePreview({ invoice, templateId, colorScheme, colorSchemes }: InvoicePreviewProps) {
    const { t } = useTranslation();
    const selectedColor = colorSchemes.find(c => c.id === colorScheme) || colorSchemes[0];

    // Modern Template - Clean and Bold
    const renderModernTemplate = () => (
        <div className="bg-white p-4 md:p-8 rounded-lg shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header with Gradient Accent */}
            <div className="relative mb-8 pb-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
                    style={{ background: `radial-gradient(circle, ${selectedColor.primary} 0%, transparent 70%)` }}>
                </div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            {t('invoices.title').toUpperCase().split(' ')[0]}
                        </h1>
                        <div className="h-1 w-20 rounded-full" style={{ backgroundColor: selectedColor.primary }}></div>
                        <p className="text-gray-600 text-sm mt-3">{invoice.invoiceNumber || 'INV-2026-02-0001'}</p>
                    </div>
                    <div className="text-right px-5 py-3 rounded-xl border-2" style={{ borderColor: selectedColor.accent, backgroundColor: selectedColor.accent + '10' }}>
                        <p className="text-xs uppercase tracking-wide text-gray-500">{t('invoices.invoice_date')}</p>
                        <p className="font-bold text-lg mt-1" style={{ color: selectedColor.primary }}>
                            {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy')}
                        </p>
                        {invoice.dueDate && (
                            <>
                                <p className="text-xs uppercase tracking-wide text-gray-500 mt-3">{t('invoices.due_date')}</p>
                                <p className="font-semibold mt-1">{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Shop/Business Details */}
            {(invoice.shopName || invoice.shopAddress || invoice.shopPlace || invoice.shopPhone) && (
                <div className="mb-6 p-6 rounded-xl border-2" style={{ borderColor: selectedColor.primary, backgroundColor: 'white' }}>
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: selectedColor.accent + '30' }}>
                            <svg className="w-8 h-8" style={{ color: selectedColor.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            {invoice.shopName && (
                                <h3 className="text-2xl font-black mb-2 bg-gradient-to-r bg-clip-text text-transparent"
                                    style={{ backgroundImage: `linear-gradient(to right, ${selectedColor.primary}, ${selectedColor.secondary})` }}>
                                    {invoice.shopName}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {invoice.shopAddress && (
                                    <p className="text-gray-700 text-sm font-medium">{invoice.shopAddress}</p>
                                )}
                                {invoice.shopPlace && (
                                    <p className="text-gray-600 text-sm">{invoice.shopPlace}</p>
                                )}
                                {invoice.shopPhone && (
                                    <p className="text-gray-600 text-sm flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {invoice.shopPhone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Details */}
            <div className="mb-8 p-5 rounded-xl" style={{ backgroundColor: selectedColor.accent + '15' }}>
                <p className="text-xs uppercase tracking-wide font-bold mb-3" style={{ color: selectedColor.secondary }}>
                    {t('invoices.customer_details')}
                </p>
                <p className="font-bold text-xl text-gray-900 mb-1">{invoice.customerName || t('invoices.customer_name')}</p>
                {invoice.customerEmail && <p className="text-gray-600 text-sm">{invoice.customerEmail}</p>}
                {invoice.customerPhone && <p className="text-gray-600 text-sm">{invoice.customerPhone}</p>}
                {invoice.customerAddress && <p className="text-gray-600 text-sm mt-1">{invoice.customerAddress}</p>}
            </div>

            {/* Line Items */}
            <div className="mb-8 overflow-x-auto">
                <div className="rounded-xl overflow-hidden border-2 min-w-[600px]" style={{ borderColor: selectedColor.accent }}>
                    <div className="grid grid-cols-12 gap-4 p-4 font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                        <div className="col-span-6">{t('invoices.description')}</div>
                        <div className="col-span-2 text-center">{t('invoices.quantity')}</div>
                        <div className="col-span-2 text-right">{t('invoices.rate')}</div>
                        <div className="col-span-2 text-right">{t('invoices.amount')}</div>
                    </div>
                    {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: t('invoices.sample_item'), quantity: 1, rate: 1000, amount: 1000 }]).map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 p-4 border-t-2 hover:bg-gray-50 transition-colors" style={{ borderColor: selectedColor.accent }}>
                            <div className="col-span-6 font-medium text-gray-900">{item.description}</div>
                            <div className="col-span-2 text-center text-gray-600">{item.quantity}</div>
                            <div className="col-span-2 text-right text-gray-600">{formatCurrency(item.rate)}</div>
                            <div className="col-span-2 text-right font-bold text-gray-900">{formatCurrency(item.amount)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
                <div className="w-full md:w-96">
                    <div className="space-y-3 mb-4 px-4">
                        <div className="flex flex-row justify-between items-center text-base">
                            <span className="text-gray-600 font-medium">{t('invoices.subtotal')}</span>
                            <span className="font-semibold whitespace-nowrap">{formatCurrency(invoice.subtotal ?? 0)}</span>
                        </div>
                        {(invoice.taxAmount ?? 0) > 0 && (
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600">{t('invoices.tax')} ({invoice.taxRate}%)</span>
                                <span className="font-semibold whitespace-nowrap">{formatCurrency(invoice.taxAmount)}</span>
                            </div>
                        )}
                        {(invoice.discount ?? 0) > 0 && (
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600">
                                    {t('invoices.discount')}
                                    {invoice.discountType === 'percentage' && ` (${invoice.discount}%)`}
                                </span>
                                <span className="font-semibold text-emerald-600">
                                    -{formatCurrency(
                                        invoice.discountType === 'percentage'
                                            ? ((invoice.subtotal || 0) * (invoice.discount || 0)) / 100
                                            : (invoice.discount || 0)
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center p-5 rounded-xl border-2"
                        style={{ borderColor: selectedColor.primary, background: `linear-gradient(135deg, ${selectedColor.accent} 0%, ${selectedColor.accent}50 100%)` }}>
                        <span className="font-bold text-lg uppercase tracking-wide" style={{ color: selectedColor.secondary }}>
                            {t('invoices.total')}
                        </span>
                        <span className="font-bold text-3xl whitespace-nowrap" style={{ color: selectedColor.primary }}>
                            {formatCurrency(invoice.total ?? 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="p-4 rounded-lg bg-gray-50 border-l-4" style={{ borderColor: selectedColor.secondary }}>
                    <h4 className="font-bold mb-2 text-sm uppercase tracking-wide" style={{ color: selectedColor.secondary }}>
                        {t('invoices.notes')}
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                </div>
            )}
        </div>
    );

    // Classic Template - Traditional and Elegant
    const renderClassicTemplate = () => (
        <div className="bg-white p-4 md:p-10 rounded-lg shadow-2xl border" style={{ borderColor: selectedColor.primary, fontFamily: 'Georgia, serif' }}>
            {/* Elegant Header */}
            <div className="text-center mb-10 pb-8 border-b-4" style={{ borderColor: selectedColor.primary, borderStyle: 'double' }}>
                <div className="inline-block">
                    <div className="mb-3 p-4 rounded-full inline-block" style={{ backgroundColor: selectedColor.accent }}>
                        <div className="w-16 h-16 flex items-center justify-center">
                            <svg className="w-12 h-12" style={{ color: selectedColor.primary }} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif mb-3" style={{ color: selectedColor.primary }}>INVOICE</h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-12" style={{ backgroundColor: selectedColor.secondary }}></div>
                        <p className="text-gray-600 font-semibold">{invoice.invoiceNumber || 'INV-2026-02-0001'}</p>
                        <div className="h-px w-12" style={{ backgroundColor: selectedColor.secondary }}></div>
                    </div>
                </div>
            </div>

            {/* Shop/Business Details */}
            {(invoice.shopName || invoice.shopAddress || invoice.shopPlace || invoice.shopPhone) && (
                <div className="mb-8 p-6 rounded-lg border-2 text-center" style={{ borderColor: selectedColor.primary, backgroundColor: selectedColor.accent + '05' }}>
                    {invoice.shopName && (
                        <h2 className="text-3xl font-serif font-bold mb-3" style={{ color: selectedColor.primary }}>
                            {invoice.shopName}
                        </h2>
                    )}
                    <div className="space-y-1 text-gray-700">
                        {invoice.shopAddress && <p className="text-sm font-medium">{invoice.shopAddress}</p>}
                        {invoice.shopPlace && <p className="text-sm">{invoice.shopPlace}</p>}
                        {invoice.shopPhone && (
                            <p className="text-sm flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {invoice.shopPhone}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Info Section with Decorative Frame */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="p-6 rounded-lg border-2" style={{ borderColor: selectedColor.accent, backgroundColor: selectedColor.accent + '10' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor.primary }}></div>
                        <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: selectedColor.secondary }}>
                            {t('invoices.customer_details')}
                        </h3>
                    </div>
                    <p className="font-bold text-xl mb-2">{invoice.customerName || t('invoices.customer_name')}</p>
                    {invoice.customerEmail && <p className="text-sm text-gray-600 mb-1">{invoice.customerEmail}</p>}
                    {invoice.customerPhone && <p className="text-sm text-gray-600 mb-1">{invoice.customerPhone}</p>}
                    {invoice.customerAddress && <p className="text-sm text-gray-600">{invoice.customerAddress}</p>}
                </div>
                <div className="text-right flex flex-col justify-between">
                    <div className="p-4 rounded-lg border-2" style={{ borderColor: selectedColor.accent, backgroundColor: selectedColor.accent + '10' }}>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t('invoices.invoice_date')}</p>
                        <p className="font-bold text-lg" style={{ color: selectedColor.primary }}>
                            {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMMM d, yyyy') : format(new Date(), 'MMMM d, yyyy')}
                        </p>
                    </div>
                    {invoice.dueDate && (
                        <div className="p-4 rounded-lg border-2 mt-3" style={{ borderColor: selectedColor.accent, backgroundColor: selectedColor.accent + '10' }}>
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t('invoices.due_date')}</p>
                            <p className="font-bold text-lg" style={{ color: selectedColor.secondary }}>
                                {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Items Table with Classic Styling */}
            <div className="overflow-x-auto mb-10">
                <table className="w-full min-w-[600px]">
                    <thead>
                        <tr style={{ backgroundColor: selectedColor.accent }}>
                            <th className="text-left py-4 px-4 font-bold" style={{ color: selectedColor.secondary }}>{t('invoices.description')}</th>
                            <th className="text-center py-4 px-4 font-bold" style={{ color: selectedColor.secondary }}>{t('invoices.quantity')}</th>
                            <th className="text-right py-4 px-4 font-bold" style={{ color: selectedColor.secondary }}>{t('invoices.rate')}</th>
                            <th className="text-right py-4 px-4 font-bold" style={{ color: selectedColor.secondary }}>{t('invoices.amount')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: t('invoices.sample_item'), quantity: 1, rate: 1000, amount: 1000 }]).map((item, index) => (
                            <tr key={index} className="border-b" style={{ borderColor: selectedColor.accent }}>
                                <td className="py-4 px-4 font-medium">{item.description}</td>
                                <td className="text-center py-4 px-4 text-gray-600">{item.quantity}</td>
                                <td className="text-right py-4 px-4 text-gray-600">{formatCurrency(item.rate)}</td>
                                <td className="text-right py-4 px-4 font-bold">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total with Decorative Frame */}
            <div className="flex justify-end">
                <div className="w-full md:w-80">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('invoices.subtotal')}</span>
                            <span className="font-medium whitespace-nowrap">{formatCurrency(invoice.subtotal ?? 0)}</span>
                        </div>
                        {(invoice.taxAmount ?? 0) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{t('invoices.tax')} ({invoice.taxRate}%)</span>
                                <span className="font-medium whitespace-nowrap">{formatCurrency(invoice.taxAmount)}</span>
                            </div>
                        )}
                        {(invoice.discount ?? 0) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {t('invoices.discount')}
                                    {invoice.discountType === 'percentage' && ` (${invoice.discount}%)`}
                                </span>
                                <span className="font-medium text-emerald-600">
                                    -{formatCurrency(
                                        invoice.discountType === 'percentage'
                                            ? ((invoice.subtotal || 0) * (invoice.discount || 0)) / 100
                                            : (invoice.discount || 0)
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="border-4 rounded-lg p-6 text-center" style={{ borderColor: selectedColor.primary, borderStyle: 'double', backgroundColor: selectedColor.accent + '20' }}>
                        <p className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: selectedColor.secondary }}>
                            {t('invoices.total')}
                        </p>
                        <p className="font-bold text-4xl whitespace-nowrap" style={{ color: selectedColor.primary }}>
                            {formatCurrency(invoice.total ?? 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-8 p-5 rounded-lg border-2" style={{ borderColor: selectedColor.accent, backgroundColor: selectedColor.accent + '05' }}>
                    <h4 className="font-bold mb-3 text-sm uppercase" style={{ color: selectedColor.secondary }}>
                        {t('invoices.notes')}
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap italic">{invoice.notes}</p>
                </div>
            )}
        </div>
    );

    // Minimal Template - Ultra Clean
    const renderMinimalTemplate = () => (
        <div className="bg-white p-4 md:p-12 rounded-lg shadow-lg" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            {/* Minimalist Header */}
            <div className="mb-8 md:mb-16">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6 mb-8">
                    <h1 className="text-5xl md:text-7xl font-extralight tracking-tight" style={{ color: selectedColor.primary }}>
                        Invoice
                    </h1>
                    <div className="mb-3">
                        <div className="h-1 w-32 mb-2" style={{ backgroundColor: selectedColor.primary }}></div>
                        <p className="text-xs uppercase tracking-widest text-gray-400">{invoice.invoiceNumber || 'INV-2026-02-0001'}</p>
                    </div>
                </div>
            </div>

            {/* Shop/Business Details */}
            {(invoice.shopName || invoice.shopAddress || invoice.shopPlace || invoice.shopPhone) && (
                <div className="mb-12 pb-8 border-b" style={{ borderColor: selectedColor.accent }}>
                    {invoice.shopName && (
                        <h2 className="text-3xl font-light mb-4" style={{ color: selectedColor.primary }}>
                            {invoice.shopName}
                        </h2>
                    )}
                    <div className="space-y-1 text-gray-600">
                        {invoice.shopAddress && <p className="text-sm">{invoice.shopAddress}</p>}
                        {invoice.shopPlace && <p className="text-sm">{invoice.shopPlace}</p>}
                        {invoice.shopPhone && <p className="text-sm">{invoice.shopPhone}</p>}
                    </div>
                </div>
            )}

            {/* Clean Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 pb-8 border-b" style={{ borderColor: selectedColor.accent }}>
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
                        {t('invoices.customer_details')}
                    </p>
                    <p className="font-semibold text-xl mb-2 text-gray-900">{invoice.customerName || t('invoices.customer_name')}</p>
                    {invoice.customerEmail && <p className="text-sm text-gray-500">{invoice.customerEmail}</p>}
                    {invoice.customerPhone && <p className="text-sm text-gray-500">{invoice.customerPhone}</p>}
                    {invoice.customerAddress && <p className="text-sm text-gray-500">{invoice.customerAddress}</p>}
                </div>
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
                        {t('invoices.invoice_date')}
                    </p>
                    <p className="font-semibold text-lg" style={{ color: selectedColor.primary }}>
                        {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMM d, yyyy') : format(new Date(), 'MMM d, yyyy')}
                    </p>
                </div>
                {invoice.dueDate && (
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
                            {t('invoices.due_date')}
                        </p>
                        <p className="font-semibold text-lg" style={{ color: selectedColor.secondary }}>
                            {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                        </p>
                    </div>
                )}
            </div>

            {/* Minimal Items List */}
            <div className="mb-16 overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="mb-6">
                        <div className="grid grid-cols-12 gap-4 pb-3 border-b-2" style={{ borderColor: selectedColor.primary }}>
                            <div className="col-span-6 text-xs uppercase tracking-widest font-bold text-gray-400">
                                {t('invoices.description')}
                            </div>
                            <div className="col-span-2 text-center text-xs uppercase tracking-widest font-bold text-gray-400">
                                {t('invoices.quantity')}
                            </div>
                            <div className="col-span-2 text-right text-xs uppercase tracking-widest font-bold text-gray-400">
                                {t('invoices.rate')}
                            </div>
                            <div className="col-span-2 text-right text-xs uppercase tracking-widest font-bold text-gray-400">
                                {t('invoices.amount')}
                            </div>
                        </div>
                    </div>
                    {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: t('invoices.sample_item'), quantity: 1, rate: 1000, amount: 1000 }]).map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 py-5 border-b border-gray-100">
                            <div className="col-span-6">
                                <p className="font-medium text-gray-900">{item.description}</p>
                            </div>
                            <div className="col-span-2 text-center text-gray-500 font-light text-lg">{item.quantity}</div>
                            <div className="col-span-2 text-right text-gray-500">{formatCurrency(item.rate)}</div>
                            <div className="col-span-2 text-right font-semibold text-gray-900 text-lg">{formatCurrency(item.amount)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Minimal Total */}
            <div className="flex justify-end">
                <div className="w-full md:w-96">
                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 uppercase tracking-wide">{t('invoices.subtotal')}</span>
                            <span className="font-medium text-gray-700 whitespace-nowrap">{formatCurrency(invoice.subtotal ?? 0)}</span>
                        </div>
                        {(invoice.taxAmount ?? 0) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 uppercase tracking-wide">{t('invoices.tax')} ({invoice.taxRate}%)</span>
                                <span className="font-medium text-gray-700 whitespace-nowrap">{formatCurrency(invoice.taxAmount)}</span>
                            </div>
                        )}
                        {(invoice.discount ?? 0) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400 uppercase tracking-wide">
                                    {t('invoices.discount')}
                                    {invoice.discountType === 'percentage' && ` (${invoice.discount}%)`}
                                </span>
                                <span className="font-medium text-emerald-500">
                                    -{formatCurrency(
                                        invoice.discountType === 'percentage'
                                            ? ((invoice.subtotal || 0) * (invoice.discount || 0)) / 100
                                            : (invoice.discount || 0)
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="pt-6 border-t-2" style={{ borderColor: selectedColor.primary }}>
                        <div className="flex justify-between items-baseline">
                            <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                                {t('invoices.total')}
                            </p>
                            <p className="text-4xl md:text-5xl font-extralight whitespace-nowrap" style={{ color: selectedColor.primary }}>
                                {formatCurrency(invoice.total ?? 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-12 pt-8 border-t">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-4 font-semibold">
                        {t('invoices.notes')}
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                </div>
            )}
        </div>
    );

    // Professional Template - Corporate and Structured
    const renderProfessionalTemplate = () => (
        <div className="bg-white p-4 md:p-8 rounded-none shadow-2xl" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Corporate Header with Sidebar */}
            <div className="flex gap-0 mb-8">
                {/* Left Sidebar */}
                <div className="w-2 rounded-l" style={{ backgroundColor: selectedColor.primary }}></div>
                <div className="flex-1 pl-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedColor.primary }}>
                                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.5.866L10 14.732l-4.5 2.134A1 1 0 014 16V4z" clipRule="evenodd"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: selectedColor.primary }}>
                                        INVOICE
                                    </h1>
                                    <div className="h-1 w-16 mt-2 rounded" style={{ backgroundColor: selectedColor.secondary }}></div>
                                </div>
                            </div>
                            <p className="text-gray-600 font-mono text-sm font-semibold">{invoice.invoiceNumber || 'INV-2026-02-0001'}</p>
                        </div>
                        <div className="text-right">
                            <div className="inline-block p-4 rounded-lg border-l-4" style={{ borderColor: selectedColor.primary, backgroundColor: selectedColor.accent + '15' }}>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                                    {t('invoices.invoice_date')}
                                </p>
                                <p className="font-bold text-base" style={{ color: selectedColor.primary }}>
                                    {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy')}
                                </p>
                                {invoice.dueDate && (
                                    <>
                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mt-3 mb-2">
                                            {t('invoices.due_date')}
                                        </p>
                                        <p className="font-bold text-base" style={{ color: selectedColor.secondary }}>
                                            {format(new Date(invoice.dueDate), 'dd MMM yyyy')}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Shop/Business Details */}
                    {(invoice.shopName || invoice.shopAddress || invoice.shopPlace || invoice.shopPhone) && (
                        <div className="p-5 rounded-lg border-2 mb-6" style={{ borderColor: selectedColor.primary, backgroundColor: selectedColor.primary + '08' }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-1 h-6 rounded" style={{ backgroundColor: selectedColor.primary }}></div>
                                <h3 className="font-bold uppercase text-xs tracking-wide" style={{ color: selectedColor.primary }}>
                                    {t('invoices.business_details')}
                                </h3>
                            </div>
                            {invoice.shopName && (
                                <p className="font-bold text-xl mb-2 text-gray-900">{invoice.shopName}</p>
                            )}
                            <div className="space-y-1 text-gray-600">
                                {invoice.shopAddress && <p className="text-sm">{invoice.shopAddress}</p>}
                                {invoice.shopPlace && <p className="text-sm">{invoice.shopPlace}</p>}
                                {invoice.shopPhone && <p className="text-sm font-mono">{invoice.shopPhone}</p>}
                            </div>
                        </div>
                    )}

                    {/* Customer Info Box */}
                    <div className="p-5 rounded-lg border-2 mb-8" style={{ borderColor: selectedColor.accent, backgroundColor: selectedColor.accent + '08' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-6 rounded" style={{ backgroundColor: selectedColor.primary }}></div>
                            <p className="font-bold uppercase text-xs tracking-wide" style={{ color: selectedColor.primary }}>
                                {t('invoices.customer_details')}
                            </p>
                        </div>
                        <p className="font-bold text-xl mb-2 text-gray-900">{invoice.customerName || t('invoices.customer_name')}</p>
                        <div className="space-y-1 text-sm text-gray-600">
                            {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                            {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
                            {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
                        </div>
                    </div>

                    {/* Professional Table */}
                    <div className="mb-8 overflow-x-auto">
                        <div className="border-2 rounded-lg overflow-hidden min-w-[600px]" style={{ borderColor: selectedColor.accent }}>
                            <div className="grid grid-cols-12 gap-4 p-4 font-bold text-white uppercase text-xs tracking-wide"
                                style={{ backgroundColor: selectedColor.primary }}>
                                <div className="col-span-5">{t('invoices.description')}</div>
                                <div className="col-span-2 text-center">{t('invoices.quantity')}</div>
                                <div className="col-span-2 text-right">{t('invoices.rate')}</div>
                                <div className="col-span-3 text-right">{t('invoices.amount')}</div>
                            </div>
                            {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: t('invoices.sample_item'), quantity: 1, rate: 1000, amount: 1000 }]).map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-4 p-4 border-t-2" style={{ borderColor: selectedColor.accent + '40' }}>
                                    <div className="col-span-5 font-semibold text-gray-900">{item.description}</div>
                                    <div className="col-span-2 text-center text-gray-600 font-mono">{item.quantity}</div>
                                    <div className="col-span-2 text-right text-gray-600 font-mono">{formatCurrency(item.rate)}</div>
                                    <div className="col-span-3 text-right font-bold text-gray-900 font-mono">{formatCurrency(item.amount)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Professional Total Section */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-96">
                            <div className="space-y-3 p-4 rounded-lg mb-4" style={{ backgroundColor: selectedColor.accent + '10' }}>
                                <div className="flex justify-between text-sm font-semibold">
                                    <span className="text-gray-600 uppercase tracking-wide">{t('invoices.subtotal')}</span>
                                    <span className="text-gray-900 font-mono whitespace-nowrap">{formatCurrency(invoice.subtotal ?? 0)}</span>
                                </div>
                                {(invoice.taxAmount ?? 0) > 0 && (
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span className="text-gray-600 uppercase tracking-wide">{t('invoices.tax')} ({invoice.taxRate}%)</span>
                                        <span className="text-gray-900 font-mono whitespace-nowrap">{formatCurrency(invoice.taxAmount)}</span>
                                    </div>
                                )}
                                {(invoice.discount ?? 0) > 0 && (
                                    <div className="flex justify-between text-sm font-semibold">
                                        <span className="text-gray-600 uppercase tracking-wide">
                                            {t('invoices.discount')}
                                            {invoice.discountType === 'percentage' && ` (${invoice.discount}%)`}
                                        </span>
                                        <span className="text-emerald-600 font-mono">
                                            -{formatCurrency(
                                                invoice.discountType === 'percentage'
                                                    ? ((invoice.subtotal || 0) * (invoice.discount || 0)) / 100
                                                    : (invoice.discount || 0)
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 rounded-lg border-2" style={{ borderColor: selectedColor.primary, backgroundColor: selectedColor.primary }}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg uppercase tracking-wider text-white">
                                        {t('invoices.total')}
                                    </span>
                                    <span className="font-bold text-4xl text-white font-mono whitespace-nowrap">
                                        {formatCurrency(invoice.total ?? 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="mt-8 p-5 rounded-lg border-l-4" style={{ borderColor: selectedColor.secondary, backgroundColor: selectedColor.accent + '10' }}>
                            <h4 className="font-bold mb-3 uppercase text-xs tracking-wide" style={{ color: selectedColor.secondary }}>
                                {t('invoices.notes')}
                            </h4>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Colorful Template - Vibrant and Modern
    const renderColorfulTemplate = () => (
        <div className="bg-gradient-to-br from-white to-gray-50 p-4 md:p-8 rounded-2xl shadow-2xl overflow-hidden relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
                style={{ background: `radial-gradient(circle, ${selectedColor.primary} 0%, transparent 70%)` }}></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-5"
                style={{ background: `radial-gradient(circle, ${selectedColor.secondary} 0%, transparent 70%)` }}></div>

            {/* Vibrant Header */}
            <div className="relative z-10 mb-10">
                <div className="flex justify-between items-start p-6 rounded-2xl"
                    style={{ background: `linear-gradient(135deg, ${selectedColor.primary}20 0%, ${selectedColor.secondary}20 100%)` }}>
                    <div>
                        <div className="inline-block px-4 py-2 rounded-full mb-3"
                            style={{ background: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                            <span className="text-white font-bold text-lg tracking-wide">INVOICE</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            {invoice.invoiceNumber || 'INV-2026-02-0001'}
                        </h1>
                        <div className="flex gap-2">
                            <div className="h-1 w-12 rounded-full" style={{ backgroundColor: selectedColor.primary }}></div>
                            <div className="h-1 w-8 rounded-full" style={{ backgroundColor: selectedColor.secondary }}></div>
                            <div className="h-1 w-4 rounded-full" style={{ backgroundColor: selectedColor.accent }}></div>
                        </div>
                    </div>
                    <div className="text-right p-5 rounded-xl border-2 bg-white shadow-lg" style={{ borderColor: selectedColor.accent }}>
                        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full" style={{ backgroundColor: selectedColor.accent }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor.primary }}></div>
                            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: selectedColor.secondary }}>
                                {t('invoices.invoice_date')}
                            </p>
                        </div>
                        <p className="font-black text-xl mb-4 bg-gradient-to-r bg-clip-text text-transparent"
                            style={{ backgroundImage: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                            {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMM dd, yyyy') : format(new Date(), 'MMM dd, yyyy')}
                        </p>
                        {invoice.dueDate && (
                            <>
                                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full" style={{ backgroundColor: selectedColor.accent }}>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor.secondary }}></div>
                                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: selectedColor.secondary }}>
                                        {t('invoices.due_date')}
                                    </p>
                                </div>
                                <p className="font-bold text-lg" style={{ color: selectedColor.secondary }}>
                                    {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Shop/Business Details Card with Gradient */}
            {(invoice.shopName || invoice.shopAddress || invoice.shopPlace || invoice.shopPhone) && (
                <div className="relative z-10 mb-8 p-6 rounded-2xl shadow-xl border-2"
                    style={{ borderColor: selectedColor.primary, background: `linear-gradient(135deg, ${selectedColor.primary}10 0%, ${selectedColor.secondary}10 100%)` }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="font-black uppercase text-sm tracking-wider bg-gradient-to-r bg-clip-text text-transparent"
                            style={{ backgroundImage: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                            Business Details
                        </p>
                    </div>
                    {invoice.shopName && (
                        <p className="font-black text-2xl mb-3 bg-gradient-to-r bg-clip-text text-transparent"
                            style={{ backgroundImage: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                            {invoice.shopName}
                        </p>
                    )}
                    <div className="space-y-1 text-gray-700">
                        {invoice.shopAddress && <p className="text-sm font-medium">{invoice.shopAddress}</p>}
                        {invoice.shopPlace && <p className="text-sm">{invoice.shopPlace}</p>}
                        {invoice.shopPhone && <p className="text-sm font-semibold">{invoice.shopPhone}</p>}
                    </div>
                </div>
            )}

            {/* Customer Card with Gradient */}
            <div className="relative z-10 mb-10 p-6 rounded-2xl shadow-xl"
                style={{ background: `linear-gradient(135deg, ${selectedColor.primary}15 0%, ${selectedColor.secondary}15 100%)` }}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    <p className="font-black uppercase text-sm tracking-wider bg-gradient-to-r bg-clip-text text-transparent"
                        style={{ backgroundImage: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                        {t('invoices.customer_details')}
                    </p>
                </div>
                <p className="font-black text-2xl mb-2 text-gray-900">{invoice.customerName || t('invoices.customer_name')}</p>
                <div className="space-y-1 text-sm text-gray-700 font-medium">
                    {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                    {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
                    {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
                </div>
            </div>

            {/* Items with Modern Card Design */}
            <div className="relative z-10 mb-10 overflow-x-auto">
                <div className="rounded-2xl overflow-hidden shadow-xl border-2 min-w-[600px]" style={{ borderColor: selectedColor.accent }}>
                    <div className="grid grid-cols-12 gap-4 p-5 font-black text-white uppercase text-xs tracking-widest"
                        style={{ background: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                        <div className="col-span-6">{t('invoices.description')}</div>
                        <div className="col-span-2 text-center">{t('invoices.quantity')}</div>
                        <div className="col-span-2 text-right">{t('invoices.rate')}</div>
                        <div className="col-span-2 text-right">{t('invoices.amount')}</div>
                    </div>
                    {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: t('invoices.sample_item'), quantity: 1, rate: 1000, amount: 1000 }]).map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 p-5 border-b-2 bg-white hover:bg-gradient-to-r hover:from-white hover:to-gray-50 transition-all"
                            style={{ borderColor: selectedColor.accent + '30' }}>
                            <div className="col-span-6 font-bold text-gray-900">{item.description}</div>
                            <div className="col-span-2 text-center font-semibold text-gray-700">{item.quantity}</div>
                            <div className="col-span-2 text-right text-gray-700">{formatCurrency(item.rate)}</div>
                            <div className="col-span-2 text-right font-black text-gray-900">{formatCurrency(item.amount)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total with Gradient Cards */}
            <div className="relative z-10 flex justify-end">
                <div className="w-full max-w-md">
                    <div className="space-y-3 mb-5">
                        <div className="flex justify-between p-4 rounded-xl bg-white border-2 shadow-sm" style={{ borderColor: selectedColor.accent }}>
                            <span className="font-bold text-gray-600 uppercase tracking-wide text-sm">{t('invoices.subtotal')}</span>
                            <span className="font-black text-gray-900 whitespace-nowrap">{formatCurrency(invoice.subtotal ?? 0)}</span>
                        </div>
                        {(invoice.taxAmount ?? 0) > 0 && (
                            <div className="flex justify-between p-4 rounded-xl bg-white border-2 shadow-sm" style={{ borderColor: selectedColor.accent }}>
                                <span className="font-bold text-gray-600 uppercase tracking-wide text-sm">
                                    {t('invoices.tax')} ({invoice.taxRate}%)
                                </span>
                                <span className="font-black text-gray-900 whitespace-nowrap">{formatCurrency(invoice.taxAmount)}</span>
                            </div>
                        )}
                        {(invoice.discount ?? 0) > 0 && (
                            <div className="flex justify-between p-4 rounded-xl bg-white border-2 shadow-sm" style={{ borderColor: selectedColor.accent }}>
                                <span className="font-bold text-gray-600 uppercase tracking-wide text-sm">
                                    {t('invoices.discount')}
                                    {invoice.discountType === 'percentage' && ` (${invoice.discount}%)`}
                                </span>
                                <span className="font-black text-emerald-600">
                                    -{formatCurrency(
                                        invoice.discountType === 'percentage'
                                            ? ((invoice.subtotal || 0) * (invoice.discount || 0)) / 100
                                            : (invoice.discount || 0)
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="p-8 rounded-2xl shadow-2xl text-white"
                        style={{ background: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm uppercase tracking-widest font-bold opacity-90 mb-1">
                                    {t('invoices.total')}
                                </p>
                                <div className="flex gap-1">
                                    <div className="w-8 h-1 bg-white rounded opacity-75"></div>
                                    <div className="w-4 h-1 bg-white rounded opacity-60"></div>
                                </div>
                            </div>
                            <p className="text-5xl font-black whitespace-nowrap">
                                {formatCurrency(invoice.total ?? 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes with Gradient Background */}
            {invoice.notes && (
                <div className="relative z-10 mt-10 p-6 rounded-2xl border-2 shadow-lg"
                    style={{ borderColor: selectedColor.accent, background: `linear-gradient(135deg, ${selectedColor.accent}20 0%, white 100%)` }}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-8 rounded-full" style={{ background: `linear-gradient(180deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}></div>
                        <h4 className="font-black uppercase text-sm tracking-wider bg-gradient-to-r bg-clip-text text-transparent"
                            style={{ backgroundImage: `linear-gradient(135deg, ${selectedColor.primary} 0%, ${selectedColor.secondary} 100%)` }}>
                            {t('invoices.notes')}
                        </h4>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">{invoice.notes}</p>
                </div>
            )}
        </div>
    );

    // Tax Invoice Template - Simple and Clean with Payment Details
    const renderTaxTemplate = () => (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div className="text-center mb-6 pb-4 border-b-4 border-black">
                <h1 className="text-3xl font-bold uppercase tracking-wide">TAX INVOICE</h1>
            </div>

            {/* Shop/Business Details */}
            {(invoice.shopName || invoice.shopAddress || invoice.shopPlace || invoice.shopPhone) && (
                <div className="text-center mb-6 pb-4 border-b border-gray-300">
                    {invoice.shopName && (
                        <h2 className="text-xl font-bold mb-1">{invoice.shopName}</h2>
                    )}
                    <div className="text-sm text-gray-700">
                        {invoice.shopAddress && <p>{invoice.shopAddress}</p>}
                        {invoice.shopPhone && <p>Phone: {invoice.shopPhone}</p>}
                    </div>
                </div>
            )}

            {/* Invoice Details */}
            <div className="mb-6 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="font-bold">{t('invoices.invoice_no')}:</span>
                    <span>{invoice.invoiceNumber || 'INV-2026-02-0001'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">{t('invoices.date')}:</span>
                    <span>{invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd MMM, yyyy') : format(new Date(), 'dd MMM, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-bold">{t('invoices.customer')}:</span>
                    <span>{invoice.customerName || t('invoices.customer_name')}</span>
                </div>
            </div>

            {/* Items Section */}
            <div className="mb-4">
                <div className="border-t-2 border-b-2 border-gray-900 py-2 font-bold text-sm uppercase">
                    {t('invoices.items')}
                </div>
                {(invoice.items && invoice.items.length > 0 ? invoice.items : [{ description: t('invoices.sample_item'), quantity: 1, rate: 1000, amount: 1000 }]).map((item, index) => (
                    <div key={index} className="py-3 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{index + 1}. {item.description}</p>
                                <p className="text-sm text-gray-600">{item.quantity} x {formatCurrency(item.rate)}</p>
                            </div>
                            <div className="text-right font-semibold whitespace-nowrap">
                                {formatCurrency(item.amount)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="mb-6 space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>{t('invoices.subtotal')}:</span>
                    <span className="whitespace-nowrap">{formatCurrency(invoice.subtotal ?? 0)}</span>
                </div>
                {(invoice.taxAmount ?? 0) > 0 && (
                    <div className="flex justify-between">
                        <span>Tax:</span>
                        <span className="whitespace-nowrap">Rs {(invoice.taxAmount || 0).toFixed(2)}</span>
                    </div>
                )}
                {(invoice.discount ?? 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount {invoice.discountType === 'percentage' && `(${invoice.discount}%)`}:</span>
                        <span className="whitespace-nowrap">-Rs {(invoice.discountType === 'percentage'
                            ? ((invoice.subtotal || 0) * (invoice.discount || 0)) / 100
                            : (invoice.discount || 0)).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold border-t border-gray-300 pt-1 mt-1">
                    <span>Total:</span>
                    <span className="whitespace-nowrap">Rs {(invoice.total ?? 0).toFixed(2)}</span>
                </div>
            </div>

            {/* Thank You */}
            <div className="text-center mb-4">
                <p className="text-lg font-bold">Thank You!</p>
                <p className="text-sm text-gray-600">Visit Again Soon</p>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 border-t pt-3">
                <p>Powered by {invoice.shopName || 'Shop Management System'}</p>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded border-l-4 border-gray-400">
                    <h4 className="font-bold mb-2 text-sm uppercase text-gray-700">Notes</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
            )}
        </div>
    );

    const templates: Record<string, () => React.JSX.Element> = {
        modern: renderModernTemplate,
        classic: renderClassicTemplate,
        minimal: renderMinimalTemplate,
        professional: renderProfessionalTemplate,
        colorful: renderColorfulTemplate,
        tax: renderTaxTemplate,
    };

    const renderTemplate = templates[templateId] || renderModernTemplate;

    return (
        <div className="w-full">
            {renderTemplate()}
        </div>
    );
}
