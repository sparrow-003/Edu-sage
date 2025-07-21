import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { verifyFingerprint } from '../utils/fingerprint';

interface User {
    id: string;
    email: string;
    display_name?: string;
    avatar_url?: string;
    plan: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (token: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
}

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

// Initialize error handler
const errorHandler = RuntimeErrorHandler.getInstance();

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (token: string) => {
        try {
            set({ isLoading: true, error: null });

            // Set session in Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                set({ isLoading: false, error: error?.message || 'Authentication failed' });
                return false;
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profile) {
                set({ isLoading: false, error: 'User profile not found' });
                return false;
            }

            // Store token in localStorage
            localStorage.setItem('edusage_auth_token', token);

            // Update state
            set({
                user: {
                    id: user.id,
                    email: user.email!,
                    display_name: profile.display_name,
                    avatar_url: profile.avatar_url,
                    plan: profile.plan
                },
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            return true;
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'AuthStore',
                action: 'login',
                severity: 'high'
            });

            set({ isLoading: false, error: (error as Error).message });
            return false;
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true });

            // Sign out from Supabase
            await supabase.auth.signOut();

            // Remove token from localStorage
            localStorage.removeItem('edusage_auth_token');

            // Update state
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null
            });
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'AuthStore',
                action: 'logout',
                severity: 'medium'
            });

            set({ isLoading: false, error: (error as Error).message });
        }
    },

    checkAuth: async () => {
        try {
            set({ isLoading: true });

            // Check for token in localStorage
            const token = localStorage.getItem('edusage_auth_token');

            if (!token) {
                set({ isLoading: false, isAuthenticated: false });
                return false;
            }

            // Verify fingerprint
            const fingerprintValid = await verifyFingerprint();

            if (!fingerprintValid) {
                // Potential security issue, clear token and return false
                localStorage.removeItem('edusage_auth_token');
                set({ isLoading: false, isAuthenticated: false, error: 'Security verification failed' });
                return false;
            }

            // Validate token with Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                localStorage.removeItem('edusage_auth_token');
                set({ isLoading: false, isAuthenticated: false, error: error?.message });
                return false;
            }

            // Get user profile
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!profile) {
                localStorage.removeItem('edusage_auth_token');
                set({ isLoading: false, isAuthenticated: false, error: 'User profile not found' });
                return false;
            }

            // Update state
            set({
                user: {
                    id: user.id,
                    email: user.email!,
                    display_name: profile.display_name,
                    avatar_url: profile.avatar_url,
                    plan: profile.plan
                },
                isAuthenticated: true,
                isLoading: false,
                error: null
            });

            return true;
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'AuthStore',
                action: 'checkAuth',
                severity: 'high'
            });

            set({ isLoading: false, isAuthenticated: false, error: (error as Error).message });
            return false;
        }
    }
}));