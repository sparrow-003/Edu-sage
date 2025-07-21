import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { useAuthStore } from '../stores/authStore';
import { TopBar } from '../components/Dashboard/TopBar';
import { LeftDrawer } from '../components/Dashboard/LeftDrawer';
import { RightDrawer } from '../components/Dashboard/RightDrawer';
import { ParallaxCanvas } from '../components/Dashboard/ParallaxCanvas';
import { ChatView } from '../components/Dashboard/ChatView';
import { QuizView } from '../components/Dashboard/QuizView';
import { PlanView } from '../components/Dashboard/PlanView';
import { HomeView } from '../components/Dashboard/HomeView';

const Dashboard: React.FC = () => {
    const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
    const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
    const [rightDrawerView, setRightDrawerView] = useState<'chat' | 'quiz' | 'plan'>('chat');
    const [aiActive, setAiActive] = useState(false);
    const { user } = useAuthStore();
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        try {
            // Initialize dashboard data
            const loadDashboardData = async () => {
                // In a real implementation, we would load user data, progress, etc.
            };

            loadDashboardData();
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'Dashboard',
                action: 'initialization'
            });
        }
    }, []);

    const toggleLeftDrawer = () => {
        setLeftDrawerOpen(!leftDrawerOpen);
    };

    const toggleRightDrawer = (view?: 'chat' | 'quiz' | 'plan') => {
        if (view) {
            setRightDrawerView(view);
            setRightDrawerOpen(true);
        } else {
            setRightDrawerOpen(!rightDrawerOpen);
        }
    };

    const toggleAI = () => {
        setAiActive(!aiActive);
    };

    return (
        <div className="relative flex flex-col h-screen overflow-hidden bg-gray-900">
            {/* Parallax background */}
            <ParallaxCanvas />

            {/* Top bar */}
            <TopBar
                onToggleLeftDrawer={toggleLeftDrawer}
                onToggleRightDrawer={toggleRightDrawer}
                onToggleAI={toggleAI}
                aiActive={aiActive}
                user={user}
            />

            {/* Main content */}
            <div className="relative flex flex-1 overflow-hidden">
                {/* Left drawer */}
                <AnimatePresence>
                    {leftDrawerOpen && (
                        <LeftDrawer onClose={() => setLeftDrawerOpen(false)} />
                    )}
                </AnimatePresence>

                {/* Main canvas */}
                <main className="flex-1 overflow-auto">
                    <Routes>
                        <Route path="/" element={<HomeView />} />
                        <Route path="/chat" element={<ChatView />} />
                        <Route path="/quiz" element={<QuizView />} />
                        <Route path="/plan" element={<PlanView />} />
                    </Routes>
                </main>

                {/* Right drawer */}
                <AnimatePresence>
                    {rightDrawerOpen && (
                        <RightDrawer
                            view={rightDrawerView}
                            onClose={() => setRightDrawerOpen(false)}
                            onChangeView={setRightDrawerView}
                            aiActive={aiActive}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;