import React from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon, FiZap, FiHeart } from 'react-icons/fi';
import { useTheme } from './ThemeProvider';

const themes = [
    { key: 'light', icon: FiSun, label: 'Light', color: '#0ea5e9' },
    { key: 'dark', icon: FiMoon, label: 'Dark', color: '#1f2937' },
    { key: 'neon', icon: FiZap, label: 'Neon', color: '#00ff88' },
    { key: 'pastel', icon: FiHeart, label: 'Pastel', color: '#a855f7' }
];

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <motion.div
                className="flex items-center space-x-2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {themes.map((themeOption) => {
                    const Icon = themeOption.icon;
                    const isActive = theme === themeOption.key;

                    return (
                        <motion.button
                            key={themeOption.key}
                            onClick={() => setTheme(themeOption.key as any)}
                            className={`p-2 rounded-full transition-all ${isActive
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title={`Switch to ${themeOption.label} theme`}
                        >
                            <Icon size={16} />
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
};