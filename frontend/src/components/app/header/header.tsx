import { Bell, Search, Menu, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUIStore } from '@/store/ui.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title?: string;
    onMenuClick?: () => void;
    className?: string;
}

export function Header({ title, onMenuClick, className }: HeaderProps) {
    const { user, logout } = useAuth();
    const { toggleMobileMenu } = useUIStore();

    const handleLogout = () => {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        logout();
        window.location.href = '/login';
    };

    return (
        <header
            className={cn(
                // Base styles - lowered z-index to be below sidebar but above content
                "sticky top-0 z-30",
                // Fixed height for consistent vertical centering
                "h-14 md:h-16",
                // Horizontal padding only
                "px-4 md:px-6",
                // Flexbox for vertical centering
                "flex items-center",
                // Background & effects - solid white for better visibility
                "bg-white backdrop-blur-xl",
                // Border - more visible border
                "border-b border-gray-200",
                // Shadow for depth - enhanced shadow
                "shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
                // Safe area for notched devices
                "safe-area-top",
                className
            )}
        >
            <div className="flex items-center justify-between w-full">
                {/* Left Section - Menu Button & Title */}
                <div className="flex items-center gap-3">
                    {/* Mobile & Tablet Menu Toggle */}
                    <button
                        onClick={onMenuClick || toggleMobileMenu}
                        className="lg:hidden flex items-center justify-center w-10 h-10 -ml-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-all duration-200"
                        aria-label="Toggle menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Page Title */}
                    {title && (
                        <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate max-w-[180px] sm:max-w-none leading-none">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Right Section - Search, Notifications, User */}
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    {/* Search - Hidden on mobile, visible on tablet+ */}
                    <div className="hidden lg:flex items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="pl-10 w-56 xl:w-64 h-10 bg-gray-50/80 border-gray-200 focus:bg-white focus:border-purple-300 focus:ring-purple-100 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    {/* Mobile Search Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden h-10 w-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <Search className="h-[18px] w-[18px]" />
                    </Button>

                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-10 w-10 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                        <Bell className="h-[18px] w-[18px]" />
                        {/* Notification Badge */}
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                    </Button>

                    {/* Divider - Hidden on small screens */}
                    <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-10 w-10 rounded-xl p-0 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                            >
                                <Avatar className="h-9 w-9 ring-2 ring-purple-100">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56 rounded-xl shadow-xl border-gray-200/80 bg-white/95 backdrop-blur-lg"
                            align="end"
                            sideOffset={8}
                        >
                            <DropdownMenuLabel className="pb-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem className="cursor-pointer rounded-lg mx-1 text-gray-700 hover:text-gray-900 focus:bg-gray-100">
                                <Settings className="h-4 w-4 mr-2 text-gray-500" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-100" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer rounded-lg mx-1 text-red-600 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
