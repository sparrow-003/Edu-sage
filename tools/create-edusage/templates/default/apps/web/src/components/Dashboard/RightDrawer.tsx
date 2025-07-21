import React from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { ChatPanel } from './ChatPanel';
import { QuizPanel } from './QuizPanel';
import { PlanPanel } from './PlanPanel';

interface RightDrawerProps {
    view: 'chat' | 'quiz' | 'plan';
    onClose: () => void;
    onChangeView: (view: 'chat' | 'quiz' | 'plan') => void;
    aiActive: boolean;
}

export const RightDrawer: React.FC<RightDrawerProps> = ({
    view,
    onClose,
    onChangeView,
    aiActive
}) => {
    const errorHandler = RuntimeErrorHandler.getInstance();

    const handleChangeView = (newView: 'chat' | 'quiz' | 'plan') => {
        try {
            onChangeView(newView);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'RightDrawer',
                action: 'changeView'
            });
        }
    };

    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 z-20 flex flex-col w-80 h-full bg-gray-800 shadow-lg"
        >
            {/* Cyan edge glow */}
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400 opacity-30" />

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleChangeView('chat')}
                        className={`px-3 py-1 rounded-lg ${view === 'chat' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => handleChangeView('quiz')}
                        className={`px-3 py-1 rounded-lg ${view === 'quiz' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        Quiz
                    </button>
                    <button
                        onClick={() => handleChangeView('plan')}
                        className={`px-3 py-1 rounded-lg ${view === 'plan' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        Plan
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white"
                    aria-label="Close drawer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <AnimatedView isActive={view === 'chat'}>
                    <ChatPanel aiActive={aiActive} />
                </AnimatedView>

                <AnimatedView isActive={view === 'quiz'}>
                    <QuizPanel />
                </AnimatedView>

                <AnimatedView isActive={view === 'plan'}>
                    <PlanPanel />
                </AnimatedView>
            </div>
        </motion.div>
    );
};

interface AnimatedViewProps {
    isActive: boolean;
    children: React.ReactNode;
}

const AnimatedView: React.FC<AnimatedViewProps> = ({ isActive, children }) => {
    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
        >
            {children}
        </motion.div>
    );
};