import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiHelpCircle, FiCalendar, FiSearch, FiX } from 'react-icons/fi';
import { useAIAgent } from '../hooks/useAIAgent';
import { TeachMeCard } from './cards/TeachMeCard';
import { QuizMeCard } from './cards/QuizMeCard';
import { PlanMeCard } from './cards/PlanMeCard';
import { SearchUniverseCard } from './cards/SearchUniverseCard';

const sidebarVariants = {
    closed: {
        x: '100%',
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30
        }
    },
    open: {
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30
        }
    }
};

const cardStackVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25
        }
    }
};

export const AISidebar: React.FC = () => {
    const { state, toggleAgent, switchMode } = useAIAgent();

    const cards = [
        {
            id: 'teach',
            title: 'Teach Me',
            description: 'Instant, bite-sized micro-lessons',
            icon: FiBook,
            color: 'from-blue-500 to-purple-600',
            component: TeachMeCard
        },
        {
            id: 'quiz',
            title: 'Quiz Me',
            description: 'Adaptive questions on the fly',
            icon: FiHelpCircle,
            color: 'from-green-500 to-teal-600',
            component: QuizMeCard
        },
        {
            id: 'plan',
            title: 'Plan Me',
            description: 'Color-coded weekly roadmap',
            icon: FiCalendar,
            color: 'from-orange-500 to-red-600',
            component: PlanMeCard
        },
        {
            id: 'search',
            title: 'Search Universe',
            description: 'Scrape the open web for knowledge',
            icon: FiSearch,
            color: 'from-purple-500 to-pink-600',
            component: SearchUniverseCard
        }
    ];

    const handleCardClick = (cardId: string) => {
        switchMode(cardId as any);
    };

    return (
        <AnimatePresence>
            {state.isActive && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleAgent}
                    />

                    {/* Sidebar */}
                    <motion.div
                        className="edu-sidebar"
                        variants={sidebarVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <motion.h2
                                className="text-2xl font-bold text-gray-900 dark:text-white"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                EdUsage AI
                            </motion.h2>
                            <motion.button
                                onClick={toggleAgent}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiX size={20} />
                            </motion.button>
                        </div>

                        {/* Status Indicator */}
                        <motion.div
                            className="mb-6 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {state.isListening ? 'Listening...' :
                                        state.isProcessing ? 'Processing...' :
                                            'Ready to help'}
                                </span>
                            </div>
                        </motion.div>

                        {/* Card Stack */}
                        <motion.div
                            className="edu-card-stack"
                            variants={cardStackVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {cards.map((card) => {
                                const CardComponent = card.component;
                                const Icon = card.icon;

                                return (
                                    <motion.div
                                        key={card.id}
                                        variants={cardVariants}
                                        className={`edu-card ${state.currentMode === card.id ? 'ring-2 ring-blue-500' : ''}`}
                                        onClick={() => handleCardClick(card.id)}
                                        whileHover={{
                                            y: -4,
                                            rotateX: 5,
                                            transition: { type: 'spring', stiffness: 400 }
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                                                <Icon className="text-white" size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {card.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {card.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Card Content */}
                                        <CardComponent isActive={state.currentMode === card.id} />
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Footer */}
                        <motion.div
                            className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            <p className="text-xs text-gray-400 text-center">
                                EduΣage AI Powered by SOCIA
                            </p>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};