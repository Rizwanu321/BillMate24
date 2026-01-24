'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserWithStorage } from '@/types';
import { Database, Users, ShoppingCart, FileText, TrendingUp, DollarSign, Package, Check, X, Phone, Mail, Building2, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ViewShopkeeperDialogProps {
    shopkeeper: UserWithStorage | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewShopkeeperDialog({ shopkeeper, open, onOpenChange }: ViewShopkeeperDialogProps) {
    if (!shopkeeper) return null;

    const { storageStats, features } = shopkeeper;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const stats = [
        {
            icon: Database,
            label: 'Total Storage',
            value: storageStats.storage.formatted,
            description: `${storageStats.storage.totalBytes.toLocaleString()} bytes`,
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: Users,
            label: 'Customers',
            value: storageStats.customers.total.toString(),
            description: `${storageStats.customers.due} due • ${storageStats.customers.normal} normal`,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: Package,
            label: 'Wholesalers',
            value: storageStats.wholesalers.total.toString(),
            description: 'Active wholesalers',
            color: 'from-amber-500 to-orange-500',
        },
        {
            icon: FileText,
            label: 'Bills',
            value: storageStats.bills.total.toString(),
            description: `${storageStats.bills.purchase} purchase • ${storageStats.bills.sale} sale`,
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: DollarSign,
            label: 'Revenue',
            value: formatCurrency(storageStats.revenue.total),
            description: 'From sales',
            color: 'from-teal-500 to-cyan-500',
        },
        {
            icon: ShoppingCart,
            label: 'Expenses',
            value: formatCurrency(storageStats.revenue.expenses),
            description: 'From purchases',
            color: 'from-red-500 to-rose-500',
        },
        {
            icon: TrendingUp,
            label: 'Net Profit',
            value: formatCurrency(storageStats.revenue.profit),
            description: 'Revenue - Expenses',
            color: storageStats.revenue.profit >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500',
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-2xl font-bold">Shopkeeper Details</DialogTitle>
                        <Badge variant={shopkeeper.isActive ? 'default' : 'secondary'} className="text-sm">
                            {shopkeeper.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-8 mt-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border shadow-sm">
                                <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                <p className="text-base font-semibold text-gray-900">{shopkeeper.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border shadow-sm">
                                <Mail className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email Address</p>
                                <p className="text-base font-semibold text-gray-900">{shopkeeper.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border shadow-sm">
                                <Phone className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-base font-semibold text-gray-900">{shopkeeper.phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border shadow-sm">
                                <Building2 className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Business Name</p>
                                <p className="text-base font-semibold text-gray-900">{shopkeeper.businessName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            Enabled Features
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(features).map(([key, enabled]) => (
                                <Badge
                                    key={key}
                                    variant="outline"
                                    className={`px-3 py-1 capitalize ${enabled
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-50 text-gray-400 border-gray-200 decoration-dashed'
                                        }`}
                                >
                                    {enabled && <Check className="h-3 w-3 mr-1" />}
                                    {!enabled && <X className="h-3 w-3 mr-1" />}
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Stats */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            Usage Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gray-50/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                                                    <Icon className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-gray-500 truncate">{stat.label}</p>
                                                    <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{stat.description}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
