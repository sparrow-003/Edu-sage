import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface LanguageSelectorProps {
    selectedLanguage: string;
    onSelectLanguage: (language: string) => void;
}

interface Language {
    code: string;
    name: string;
    flag: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    selectedLanguage,
    onSelectLanguage
}) => {
    const [languages, setLanguages] = useState<Language[]>([]);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        // In a real app, this would be loaded from a data file or API
        setLanguages([
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'es', name: 'Spanish', flag: '🇪🇸' },
            { code: 'fr', name: 'French', flag: '🇫🇷' },
            { code: 'de', name: 'German', flag: '🇩🇪' },
            { code: 'it', name: 'Italian', flag: '🇮🇹' },
            { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
            { code: 'ru', name: 'Russian', flag: '🇷🇺' },
            { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
            { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
            { code: 'ko', name: 'Korean', flag: '🇰🇷' },
            { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
            { code: 'hi', name: 'Hindi', flag: '🇮🇳' }
        ]);
    }, []);

    const handleLanguageClick = (languageCode: string) => {
        try {
            onSelectLanguage(languageCode);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'LanguageSelector',
                action: 'selectLanguage'
            });
        }
    };

    // Animation variants for container
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    // Animation variants for items
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-6">Select Your Language</h2>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {languages.map((language) => (
                    <motion.div
                        key={language.code}
                        variants={itemVariants}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLanguageClick(language.code)}
                        className={`flex items-center p-4 rounded-lg cursor-pointer ${selectedLanguage === language.code
                                ? 'bg-cyan-600 text-white'
                                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            }`}
                    >
                        <span className="text-2xl mr-3">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                    </motion.div>
                ))}
            </motion.div>

            <p className="text-gray-300 text-center max-w-md">
                Choose your preferred language for the EduΣage interface and learning content. You can change this later in settings.
            </p>
        </div>
    );
};