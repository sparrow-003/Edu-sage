import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface LeftDrawerProps {
    onClose: () => void;
    onTabChange: (tab: 'chat' | 'quiz' | 'plan') => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: JSX.Element;
    action?: () => void;
    link?: string;
}

export const LeftDrawer: React.FC<LeftDrawerProps> = ({ onClose, onTabChange }) => {
    const errorHandler = RuntimeErrorHandler.getInstance();

    const handleTabChange = (tab: 'chat' | 'quiz' | 'plan') => {
        try {
            onTabChange(tab);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'LeftDrawer',
                action: 'tabChange'
            });
        }
    };

    const menuItems: MenuItem[] = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
            link: '/dashboard'
        },
        {
            id: 'chat',
            label: 'Chat',
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                </svg>
            ),
            action: () => handleTabChange('chat')
        },
        {
            id: 'quiz',
            label: 'Quiz',
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            ),
            action: () => handleTabChange('quiz')
        },
        {
            id: 'plan',
            label: 'Learning Plan',
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                </svg>
            ),
            action: () => handleTabChange('plan')
        },
        {
            id: 'discovery',
            label: 'Discovery',
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                </svg>
            ),
            link: '/dashboard/discovery'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            ),
            link: '/dashboard/settings'
        }
    ];

    const renderMenuItem = (item: MenuItem) => {
        const content = (
            <div className="flex items-center p-3 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white cursor-pointer">
                <div className="mr-3">{item.icon}</div>
                <span>{item.label}</span>
            </div>
        );

        if (item.link) {
            return (
                <Link to={item.link} key={item.id}>
                    {content}
                </Link>
            );
        }

        return (
            <div key={item.id} onClick={item.action}>
                {content}
            </div>
        );
    };

    return (
        <motion.div
            className="fixed top-16 left-0 bottom-0 w-64 bg-gray-800 z-20 shadow-lg"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-white">Quick Actions</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="space-y-1">
                    {menuItems.map(renderMenuItem)}
                </div>
            </div>

            {/* Progress Summary */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Learning Progress</h3>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>45% Complete</span>
                    <span>3/7 Topics</span>
                </div>
            </div>
        </motion.div>
    );
};