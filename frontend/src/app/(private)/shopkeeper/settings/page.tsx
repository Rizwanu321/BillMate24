'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Lock, Store, Settings, Calendar, Shield, Smartphone, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from '@/config/axios';
import { Header } from '@/components/app/header';
import { format } from 'date-fns';

// --- Validation Schemas ---

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    businessName: z.string().optional(),
    address: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmNewPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
    const { user } = useAuth();
    const { updateUser } = useAuthStore();
    const [isProfileUpdating, setIsProfileUpdating] = useState(false);
    const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile Form
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
            businessName: user?.businessName || '',
            address: user?.address || '',
        },
    });

    // Password Form
    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
    });

    const onProfileSubmit = async (data: ProfileFormValues) => {
        setIsProfileUpdating(true);
        try {
            const response = await axios.patch('/auth/profile', data);
            updateUser(response.data.data);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsProfileUpdating(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        setIsPasswordUpdating(true);
        try {
            await axios.post('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success('Password changed successfully');
            passwordForm.reset();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsPasswordUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50">
            <Header title="Settings" />

            <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                                Account Settings
                            </h2>
                            <Settings className="h-5 w-5 md:h-8 md:w-8 text-purple-900" />
                        </div>
                        <p className="text-gray-600 mt-0.5 md:mt-1 flex items-center gap-1.5 md:gap-2 text-xs md:text-base">
                            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span className="hidden md:inline">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                            <span className="md:hidden">{format(new Date(), 'EEE, MMM d')}</span>
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="w-full space-y-6">
                    <div className="sticky top-[73px] z-10 bg-gradient-to-b from-gray-50/95 to-transparent pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                        <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-white/50 backdrop-blur border shadow-sm">
                            <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 data-[state=active]:shadow-sm">
                                <User className="h-4 w-4 mr-2" />
                                Profile
                            </TabsTrigger>
                            <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-purple-900 data-[state=active]:shadow-sm">
                                <Shield className="h-4 w-4 mr-2" />
                                Security
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <Card className="border-0 shadow-lg overflow-hidden rounded-xl md:rounded-2xl bg-white/80 backdrop-blur-sm">
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-purple-100">
                                        <User className="h-5 w-5 text-purple-700" />
                                    </div>
                                    Personal Information
                                </CardTitle>
                                <CardDescription>
                                    Update your personal details and business information visible to others.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="name"
                                                    placeholder="John Doe"
                                                    {...profileForm.register('name')}
                                                    className="pl-10 h-11 bg-white/50 focus:bg-white transition-colors"
                                                />
                                            </div>
                                            {profileForm.formState.errors.name && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {profileForm.formState.errors.name.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                                            <div className="relative">
                                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="phone"
                                                    placeholder="+1234567890"
                                                    {...profileForm.register('phone')}
                                                    className="pl-10 h-11 bg-white/50 focus:bg-white transition-colors"
                                                />
                                            </div>
                                            {profileForm.formState.errors.phone && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {profileForm.formState.errors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="pl-10 h-11 bg-gray-100/50"
                                            />
                                        </div>
                                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                                            <Lock className="h-3 w-3" />
                                            Email address cannot be changed. Contact support for assistance.
                                        </p>
                                    </div>

                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-purple-100" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white px-2 text-gray-500 font-medium tracking-wider">Business Details</span>
                                        </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="businessName" className="text-gray-700">Business Name</Label>
                                            <div className="relative">
                                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="businessName"
                                                    placeholder="My Awesome Shop"
                                                    {...profileForm.register('businessName')}
                                                    className="pl-10 h-11 bg-white/50 focus:bg-white transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-gray-700">Address</Label>
                                            <Input
                                                id="address"
                                                placeholder="123 Main St, City"
                                                {...profileForm.register('address')}
                                                className="h-11 bg-white/50 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-100">
                                        <Button
                                            type="submit"
                                            disabled={isProfileUpdating}
                                            className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 shadow-md transition-all active:scale-95"
                                        >
                                            {isProfileUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <Card className="border-0 shadow-lg overflow-hidden rounded-xl md:rounded-2xl bg-white/80 backdrop-blur-sm">
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-orange-100">
                                        <Lock className="h-5 w-5 text-orange-600" />
                                    </div>
                                    Password Security
                                </CardTitle>
                                <CardDescription>
                                    Ensure your account is using a long, random password to stay secure.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="currentPassword"
                                                type={showCurrentPassword ? "text" : "password"}
                                                {...passwordForm.register('currentPassword')}
                                                className="h-11 pr-10 bg-white/50 focus:bg-white transition-colors"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                                tabIndex={-1}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.currentPassword && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {passwordForm.formState.errors.currentPassword.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    {...passwordForm.register('newPassword')}
                                                    className="h-11 pr-10 bg-white/50 focus:bg-white transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                                    tabIndex={-1}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordForm.formState.errors.newPassword && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {passwordForm.formState.errors.newPassword.message}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="confirmNewPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    {...passwordForm.register('confirmNewPassword')}
                                                    className="h-11 pr-10 bg-white/50 focus:bg-white transition-colors"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                                    tabIndex={-1}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordForm.formState.errors.confirmNewPassword && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {passwordForm.formState.errors.confirmNewPassword.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-700">
                                        <Shield className="h-5 w-5 flex-shrink-0" />
                                        <p>
                                            Password requirements: Minimum 6 characters. Make sure it's something unrelated to your personal information.
                                        </p>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            disabled={isPasswordUpdating}
                                            className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 shadow-md transition-all active:scale-95"
                                        >
                                            {isPasswordUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Update Password
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
