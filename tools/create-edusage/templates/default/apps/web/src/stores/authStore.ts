import { create } from 'zustand';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { getFingerprint } from '../utils/fingerprint';
import { supabase } from '../utils/supabase';

interface User {
    id: string;
    email: string;
    displayName?: string;
    avatar?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    fingerprint: string | null;
    isLoading: boolean;
    error: string | null;
    login: (token: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => {
    const errorHandler = RuntimeErrorHandler.getInstance();

    return {
        isAuthenticated: false,
        user: null,
        token: null,
        fingerprint: null,
        isLoading: false,
        error: null,

        login: async (token: string) => {
            try {
                set({ isLoading: true, error: null });

                // Get user data from token
                const { data: userData, error: userError } = await supabase.auth.getUser(token);

                if (userError) {
                    throw userError;
                }

                if (!userData.user) {
                    throw new Error('User not found');
                }

                // Get fingerprint
                const fingerprint = await getFingerprint();

                // Store token and fingerprint in localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('fingerprint', fingerprint);

                // Set user data
                set({
                    isAuthenticated: true,
                    user: {
                        id: userData.user.id,
                        email: userData.user.email || '',
                        displayName: userData.user.user_metadata?.display_name
                    },
                    token,
                    fingerprint,
                    isLoading: false
                });

                return true;
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'authStore',
                    action: 'login'
                });

                set({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    fingerprint: null,
                    isLoading: false,
                    error: (error as Error).message
                });

                return false;
            }
        },

        logout: async () => {
            try {
                set({ isLoading: true });

                // Sign out from Supabase
                await supabase.auth.signOut();

                // Clear localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('fingerprint');

                // Reset state
                set({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    fingerprint: null,
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'authStore',
                    action: 'logout'
                });

                set({
                    isLoading: false,
                    error: (error as Error).message
                });
            }
        },

        checkAuth: async () => {
            try {
                set({ isLoading: true, error: null });

                // Check if token exists in localStorage
                const token = localStorage.getItem('token');
                const storedFingerprint = localStorage.getItem('fingerprint');

                if (!token || !storedFingerprint) {
                    set({ isLoading: false });
                    return false;
                }

                // Get current fingerprint and compare
                const currentFingerprint = await getFingerprint();

                if (currentFingerprint !== storedFingerprint) {
                    // Fingerprint mismatch, potential security issue
                    errorHandler.captureException(new Error('Fingerprint mismatch'), {
                        component: 'authStore',
                        action: 'checkAuth',
                        severity: 'high'
                    });

                    // Clear localStorage and reset state
                    localStorage.removeItem('token');
                    localStorage.removeItem('fingerprint');

                    set({
                        isAuthenticated: false,
                        user: null,
                        token: null,
                        fingerprint: null,
                        isLoading: false,
                        error: 'Security verification failed'
                    });

                    return false;
                }

                // Verify token with Supabase
                const { data: userData, error: userError } = await supabase.auth.getUser(token);

                if (userError || !userData.user) {
                    // Token invalid or expired
                    localStorage.removeItem('token');
                    localStorage.removeItem('fingerprint');

                    set({
                        isAuthenticated: false,
                        user: null,
                        token: null,
                        fingerprint: null,
                        isLoading: false,
                        error: userError?.message || 'Session expired'
                    });

                    return false;
                }

                // Token valid, set user data
                set({
                    isAuthenticated: true,
                    user: {
                        id: userData.user.id,
                        email: userData.user.email || '',
                        displayName: userData.user.user_metadata?.display_name
                    },
                    token,
                    fingerprint: currentFingerprint,
                    isLoading: false
                });

                return true;
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'authStore',
                    action: 'checkAuth'
                });

                set({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    fingerprint: null,
                    isLoading: false,
                    error: (error as Error).message
                });

                return false;
            }
        }
    };
});