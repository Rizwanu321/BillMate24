import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setAuth: (user: User, tokens: AuthTokens) => void;
    updateUser: (user: User) => void;
    logout: () => void;
    setHydrated: () => void;
}

// Cookie expiry in days
const ACCESS_TOKEN_EXPIRY = 7; // 7 days (cookie will persist, but token might expire sooner - refresh handles this)
const REFRESH_TOKEN_EXPIRY = 30; // 30 days

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isHydrated: false,

            setAuth: (user, tokens) => {
                // Set cookies with explicit expiry dates
                // This ensures cookies persist even after browser restart
                Cookies.set('accessToken', tokens.accessToken, {
                    path: '/',
                    sameSite: 'lax',
                    expires: ACCESS_TOKEN_EXPIRY,
                    secure: window.location.protocol === 'https:',
                });
                Cookies.set('refreshToken', tokens.refreshToken, {
                    path: '/',
                    sameSite: 'lax',
                    expires: REFRESH_TOKEN_EXPIRY,
                    secure: window.location.protocol === 'https:',
                });
                Cookies.set('userRole', user.role, {
                    path: '/',
                    sameSite: 'lax',
                    expires: REFRESH_TOKEN_EXPIRY,
                    secure: window.location.protocol === 'https:',
                });

                console.log('Auth set - user:', user.email, 'cookies set with expiry');

                set({
                    user,
                    isAuthenticated: true,
                });
            },

            updateUser: (user) => {
                Cookies.set('userRole', user.role, {
                    path: '/',
                    sameSite: 'lax',
                    expires: REFRESH_TOKEN_EXPIRY,
                });
                set({ user });
            },

            logout: () => {
                console.log('Logging out - clearing all auth data');

                // Clear cookies
                Cookies.remove('accessToken', { path: '/' });
                Cookies.remove('refreshToken', { path: '/' });
                Cookies.remove('userRole', { path: '/' });

                set({
                    user: null,
                    isAuthenticated: false,
                });
            },

            setHydrated: () => {
                set({ isHydrated: true });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                if (typeof window === 'undefined') return;

                // Check if cookies exist on rehydration
                const accessToken = Cookies.get('accessToken');
                const refreshToken = Cookies.get('refreshToken');

                console.log('Rehydrating auth state - accessToken:', !!accessToken, 'refreshToken:', !!refreshToken, 'isAuthenticated:', state?.isAuthenticated);

                // If no refresh token at all, clear auth state
                if (!refreshToken && state?.isAuthenticated) {
                    console.log('Refresh token missing - clearing auth state');
                    state.user = null;
                    state.isAuthenticated = false;
                }
                // If we have refresh token but no access token, the axios interceptor will handle refresh
                // So we keep the authenticated state

                state?.setHydrated();
            },
        }
    )
);
