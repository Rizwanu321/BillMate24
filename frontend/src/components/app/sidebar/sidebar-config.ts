import { Role, Features } from '@/types';
import {
    LayoutDashboard,
    Receipt,
    Package,
    Users,
    FileText,
    Settings,
    Store,
    UserCog,
    CreditCard,
} from 'lucide-react';

export interface SidebarItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    feature?: keyof Features;
    children?: SidebarItem[];
}

export interface SidebarConfig {
    role: Role;
    items: SidebarItem[];
}

export const adminSidebarConfig: SidebarItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Shopkeepers',
        href: '/admin/shopkeepers',
        icon: Store,
    },
    {
        title: 'Subscriptions',
        href: '/admin/subscriptions',
        icon: CreditCard,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

export const shopkeeperSidebarConfig: SidebarItem[] = [
    {
        title: 'Dashboard',
        href: '/shopkeeper/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Billing',
        href: '/shopkeeper/billing',
        icon: Receipt,
        feature: 'billing',
        children: [
            {
                title: 'Add Bill',
                href: '/shopkeeper/billing',
                icon: Receipt,
                feature: 'billing',
            },
            {
                title: 'Bill History',
                href: '/shopkeeper/billing/history',
                icon: FileText,
                feature: 'billing',
            },
        ],
    },
    {
        title: 'Wholesalers',
        href: '/shopkeeper/wholesalers',
        icon: Package,
        feature: 'wholesalers',
        children: [
            {
                title: 'Dashboard',
                href: '/shopkeeper/wholesalers/dashboard',
                icon: LayoutDashboard,
                feature: 'wholesalers',
            },
            {
                title: 'List',
                href: '/shopkeeper/wholesalers',
                icon: Package,
                feature: 'wholesalers',
            },
            {
                title: 'Payments',
                href: '/shopkeeper/wholesalers/payments',
                icon: CreditCard,
                feature: 'wholesalers',
            },
        ],
    },
    {
        title: 'Customers',
        href: '/shopkeeper/customers',
        icon: Users,
        children: [
            {
                title: 'Dashboard',
                href: '/shopkeeper/customers/dashboard',
                icon: LayoutDashboard,
            },
            {
                title: 'Due Customers',
                href: '/shopkeeper/customers/due',
                icon: UserCog,
                feature: 'dueCustomers',
            },
            {
                title: 'Normal Customers',
                href: '/shopkeeper/customers/normal',
                icon: Users,
                feature: 'normalCustomers',
            },
        ],
    },
    {
        title: 'Reports',
        href: '/shopkeeper/reports',
        icon: FileText,
        feature: 'reports',
        children: [
            {
                title: 'Revenue Report',
                href: '/shopkeeper/reports/daily',
                icon: FileText,
                feature: 'reports',
            },
            {
                title: 'Outstanding Dues',
                href: '/shopkeeper/reports/dues',
                icon: FileText,
                feature: 'reports',
            },
        ],
    },
    {
        title: 'Settings',
        href: '/shopkeeper/settings',
        icon: Settings,
    },
];

export const getSidebarConfig = (role: Role): SidebarItem[] => {
    return role === 'admin' ? adminSidebarConfig : shopkeeperSidebarConfig;
};
