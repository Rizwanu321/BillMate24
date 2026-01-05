'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/app/sidebar';
import { BottomNav } from '@/components/app/bottom-nav';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, user, isHydrated } = useAuthStore();
    const { isSidebarCollapsed } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Only check auth after hydration is complete
        if (mounted && isHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isHydrated, mounted, router]);

    // Show loading while hydrating
    if (!mounted || !isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main
                className={cn(
                    "min-h-screen transition-all duration-300",
                    // Large Desktop (lg+) margin for sidebar
                    isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
                    // Mobile & Tablet: bottom padding for bottom nav
                    "pb-20 lg:pb-0"
                )}
            >
                {children}
            </main>
            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
