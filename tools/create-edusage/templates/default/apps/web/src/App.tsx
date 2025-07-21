import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { useAuthStore } from './stores/authStore';
import { initializeFingerprint } from './utils/fingerprint';
import { initializeSQLite } from './utils/sqlite';
import LandingPage from './pages/LandingPage';
import OnboardingWizard from './pages/OnboardingWizard';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, checkAuth } = useAuthStore();
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        const initialize = async () => {
            try {
                // Initialize fingerprint
                await initializeFingerprint();

                // Initialize SQLite
                await initializeSQLite();

                // Check authentication
                await checkAuth();

                setIsLoading(false);
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'App',
                    action: 'initialization'
                });
                setIsLoading(false);
            }
        };

        initialize();
    }, [checkAuth]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-cyan-400 text-2xl">Loading EduΣage...</div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/onboarding" element={<OnboardingWizard />} />
                <Route
                    path="/dashboard/*"
                    element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />}
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AnimatePresence>
    );
};

export default App;