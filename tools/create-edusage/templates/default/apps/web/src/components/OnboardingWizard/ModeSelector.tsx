import React from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface ModeSelectorProps {
    selectedMode: 'visual' | 'auditory' | 'kinesthetic';
    selectedGradeLevel: number;
    onSelectMode: (mode: 'visual' | 'auditory' | 'kinesthetic') => void;
    onSelectGradeLevel: (level: number) => void;
}

interface LearningMode {
    id: 'visual' | 'auditory' | 'kinesthetic';
    name: string;
    description: string;
    icon: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
    selectedMode,
    selectedGradeLevel,
    onSelectMode,
    onSelectGradeLevel
}) => {
    const errorHandler = RuntimeErrorHandler.getInstance();

    const learningModes: LearningMode[] = [
        {
            id: 'visual',
            name: 'Visual',
            description: 'Learn through images, diagrams, and visual demonstrations',
            icon: '👁️'
        },
        {
            id: 'auditory',
            name: 'Auditory',
            description: 'Learn through listening, discussions, and verbal explanations',
            icon: '👂'
        },
        {
            id: 'kinesthetic',
            name: 'Kinesthetic',
            description: 'Learn through hands-on activities and practical exercises',
            icon: '✋'
        }
    ];

    const handleModeSelect = (mode: 'visual' | 'auditory' | 'kinesthetic') => {
        try {
            onSelectMode(mode);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'ModeSelector',
                action: 'selectMode'
            });
        }
    };

    const handleGradeLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const level = parseInt(e.target.value, 10);
            onSelectGradeLevel(level);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'ModeSelector',
                action: 'selectGradeLevel'
            });
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-6">How do you prefer to learn?</h2>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {learningModes.map((mode) => (
                    <motion.div
                        key={mode.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleModeSelect(mode.id)}
                        className={`p-6 rounded-lg cursor-pointer transition-colors ${selectedMode === mode.id
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            }`}
                    >
                        <div className="text-4xl mb-3">{mode.icon}</div>
                        <h3 className="text-xl font-medium mb-2">{mode.name}</h3>
                        <p className="text-sm opacity-80">{mode.description}</p>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                variants={itemVariants}
                className="w-full max-w-md mb-8"
            >
                <h3 className="text-lg font-medium text-white mb-3">Select your grade level:</h3>

                <div className="flex flex-col">
                    <div className="flex justify-between text-gray-400 text-sm mb-1">
                        <span>SCHOOL</span>
                        <span>JR COLLEGE(+1,+2) </span>
                        <span>COLLEGE</span>
                        <span>COMPATETIVE EXAM</span>
                    </div>

                    <input
                        type="range"
                        min="1"
                        max="16"
                        value={selectedGradeLevel}
                        onChange={handleGradeLevelChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(selectedGradeLevel / 16) * 100}%, #4b5563 ${(selectedGradeLevel / 16) * 100}%, #4b5563 100%)`
                        }}
                    />

                    <div className="mt-2 text-center">
                        <span className="text-white font-medium">
                            {selectedGradeLevel <= 5
                                ? `Grade ${selectedGradeLevel} (Elementary)`
                                : selectedGradeLevel <= 8
                                    ? `Grade ${selectedGradeLevel} (Middle School)`
                                    : selectedGradeLevel <= 12
                                        ? `Grade ${selectedGradeLevel} (High School)`
                                        : `Year ${selectedGradeLevel - 12} (College)`}
                        </span>
                    </div>
                </div>
            </motion.div>

            <p className="text-gray-300 text-center max-w-md">
                Everyone learns differently. We'll tailor your experience based on your preferred learning style and education level.
            </p>
        </div>
    );
};