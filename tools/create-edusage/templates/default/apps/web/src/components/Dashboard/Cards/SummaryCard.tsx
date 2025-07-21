import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface SummaryCardProps {
    title: string;
    points: string[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, points }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const errorHandler = RuntimeErrorHandler.getInstance();

    const toggleExpand = () => {
        try {
            setIsExpanded(!isExpanded);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'SummaryCard',
                action: 'toggleExpand'
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden bg-gray-800 rounded-lg shadow-lg"
        >
            <div
                className="flex items-center justify-between p-3 cursor-pointer border-b border-gray-700"
                onClick={toggleExpand}
            >
                <h3 className="text-sm font-medium text-white">{title}</h3>

                <motion.button
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </motion.button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4">
                            <ul className="space-y-2">
                                {points.map((point, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex items-start"
                                    >
                                        <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="ml-2 text-sm text-gray-300">{point}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-end p-2 border-t border-gray-700">
                <button className="px-3 py-1 text-xs text-white bg-cyan-600 rounded-md hover:bg-cyan-500">
                    Save
                </button>
            </div>
        </motion.div>
    );
};