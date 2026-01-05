'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    gradient: 'purple' | 'green' | 'blue' | 'orange' | 'red' | 'pink';
    subtitle?: string;
}

const gradients = {
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    pink: 'from-pink-500 to-pink-600',
};

const lightColors = {
    purple: 'text-purple-100',
    green: 'text-green-100',
    blue: 'text-blue-100',
    orange: 'text-orange-100',
    red: 'text-red-100',
    pink: 'text-pink-100',
};

const iconColors = {
    purple: 'text-purple-200',
    green: 'text-green-200',
    blue: 'text-blue-200',
    orange: 'text-orange-200',
    red: 'text-red-200',
    pink: 'text-pink-200',
};

export function StatsCard({ title, value, icon: Icon, gradient, subtitle }: StatsCardProps) {
    return (
        <Card className={`border-0 shadow-lg bg-gradient-to-br ${gradients[gradient]} text-white`}>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`${lightColors[gradient]} text-sm`}>{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        {subtitle && <p className={`${lightColors[gradient]} text-xs mt-1`}>{subtitle}</p>}
                    </div>
                    <Icon className={`h-10 w-10 ${iconColors[gradient]}`} />
                </div>
            </CardContent>
        </Card>
    );
}
