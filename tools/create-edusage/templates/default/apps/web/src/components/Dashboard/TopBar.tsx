import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { AIPillToggle } from './AIPillToggle';

interface TopBarProps {
    onToggleLeftDrawer: () => void;
    onToggleRightDrawer: (view?: 'chat' | 'quiz' | 'plan') => void;
    onToggleAI: () => void;
    aiActive: boolean;
    user: any;
}

export const TopBar: React.FC<TopBarProps> = ({
    onToggleLeftDrawer,
    onToggleRightDrawer,
    onToggleAI,
    aiActive,
    user
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const errorHandler = RuntimeErrorHandler.getInstance();

    const handleToggleAI = () => {
        try {
            onToggleAI();
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'TopBar',
                action: 'toggleAI'
            });
        }
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex items-center justify-between px-4 py-2 bg-gray-800 shadow-lg"
        >
            {/* Cyan edge glow */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-cyan-400 opacity-30" />

            {/* Left section */}
            <div className="flex items-center">
                <button
                    onClick={onToggleLeftDrawer}
                    className="p-2 mr-4 text-white rounded-full hover:bg-gray-700"
                    aria-label="Toggle left drawer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <h1 className="text-xl font-bold text-white">EduΣage</h1>
            </div>

            {/* Center section */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => onToggleRightDrawer('chat')}
                    className="px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700"
                >
                    Chat
                </button>
                <button
                    onClick={() => onToggleRightDrawer('quiz')}
                    className="px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700"
                >
                    Quiz
                </button>
                <button
                    onClick={() => onToggleRightDrawer('plan')}
                    className="px-4 py-2 text-gray-300 rounded-lg hover:bg-gray-700"
                >
                    Plan
                </button>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
                {/* AI toggle pill */}
                <AIPillToggle active={aiActive} onClick={handleToggleAI} />

                {/* User profile */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2"
                    >
                        <div className="w-8 h-8 overflow-hidden bg-gray-600 rounded-full">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="object-cover w-full h-full" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-white">
                                    {user?.display_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Dropdown menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 w-48 mt-2 overflow-hidden bg-gray-800 rounded-lg shadow-lg">
                            <div className="p-3 border-b border-gray-700">
                                <p className="font-medium text-white">{user?.display_name || 'User'}</p>
                                <p className="text-sm text-gray-400">{user?.email}</p>
                            </div>
                            <div className="py-1">
                                <button className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700">
                                    Profile
                                </button>
                                <button className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700">
                                    Settings
                                </button>
                                <button className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700">
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.header>
    );
};