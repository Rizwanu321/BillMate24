import { usePathname } from 'next/navigation';
import { Store, LogOut, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { getSidebarConfig } from './sidebar-config';
import { SidebarItem } from './sidebar-item';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/ui.store';

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout, hasFeature } = useAuth();
    const {
        isMobileMenuOpen,
        closeMobileMenu,
        isSidebarCollapsed: isCollapsed,
        toggleSidebarCollapsed: toggleCollapsed
    } = useUIStore();

    // Close mobile menu on route change
    useEffect(() => {
        closeMobileMenu();
    }, [pathname, closeMobileMenu]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
        };
    }, [isMobileMenuOpen]);

    if (!user) return null;

    const sidebarItems = getSidebarConfig(user.role);

    const handleLogout = () => {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        logout();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile & Tablet Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[90] lg:hidden backdrop-blur-sm"
                    onClick={closeMobileMenu}
                />
            )}

            <div
                className={cn(
                    'fixed top-0 left-0 w-64 bg-slate-900 border-r border-white/10 transition-all duration-300 z-[200] overflow-hidden',
                    // Mobile & Tablet: slide in/out based on menu state
                    isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    // Large Desktop (lg+): always visible, can be collapsed
                    'lg:translate-x-0',
                    isCollapsed ? 'lg:w-20' : 'lg:w-64'
                )}
                style={{
                    height: '100dvh',
                    touchAction: 'none'
                }}
            >
                {/* Inner container with grid layout for fixed header/footer */}
                <div className="h-full grid grid-rows-[auto_1fr_auto] overflow-hidden">
                    {/* Logo - Fixed at top */}
                    <div className="flex items-center justify-between px-4 py-6 border-b border-white/10 bg-slate-900">
                        {(!isCollapsed || isMobileMenuOpen) && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Store className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-white">RMS</h1>
                                    <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                                </div>
                            </div>
                        )}
                        {(isCollapsed && !isMobileMenuOpen) && (
                            <div className="w-full flex justify-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <Store className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        )}

                        {/* Desktop Collapse Button - Only on lg+ */}
                        <button
                            onClick={toggleCollapsed}
                            className={cn(
                                'hidden lg:block p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors',
                                isCollapsed && 'absolute -right-3 top-8 bg-slate-800 border border-white/10'
                            )}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                        </button>

                        {/* Mobile & Tablet Close Button */}
                        <button
                            onClick={closeMobileMenu}
                            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation - Scrollable middle section */}
                    <nav
                        className="px-3 py-4 space-y-1 overflow-y-auto overscroll-contain"
                        style={{ touchAction: 'pan-y' }}
                    >
                        {sidebarItems.map((item) => (
                            <SidebarItem
                                key={item.href}
                                item={item}
                                hasFeature={hasFeature}
                                isCollapsed={isCollapsed && !isMobileMenuOpen}
                            />
                        ))}
                    </nav>

                    {/* Logout - Fixed at bottom */}
                    <div className="p-4 border-t border-white/10 bg-slate-900">
                        {(!isCollapsed || isMobileMenuOpen) ? (
                            <Button
                                onClick={handleLogout}
                                variant="ghost"
                                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-full flex justify-center p-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
