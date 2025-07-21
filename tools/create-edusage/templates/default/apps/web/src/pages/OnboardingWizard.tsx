import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { useAuthStore } from '../stores/authStore';
import { useSupabaseClient } from '../hooks/useSupabaseClient';
import { useSQLiteClient } from '../hooks/useSQLiteClient';
import { RegionSelector } from '../components/OnboardingWizard/RegionSelector';
import { LanguageSelector } from '../components/OnboardingWizard/LanguageSelector';
import { GoalSelector } from '../components/OnboardingWizard/GoalSelector';
import { ModeSelector } from '../components/OnboardingWizard/ModeSelector';
import { ProgressIndicator } from '../components/OnboardingWizard/ProgressIndicator';

interface OnboardingData {
    region: string;
    language: string;
    goals: string[];
    learningMode: 'visual' | 'auditory' | 'kinesthetic';
    gradeLevel: number;
}

const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const supabase = useSupabaseClient();
    const sqlite = useSQLiteClient();
    const errorHandler = RuntimeErrorHandler.getInstance();

    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        region: '',
        language: '',
        goals: [],
        learningMode: 'visual',
        gradeLevel: 9
    });

    const steps = [
        { id: 'region', label: 'Region' },
        { id: 'language', label: 'Language' },
        { id: 'goals', label: 'Learning Goals' },
        { id: 'mode', label: 'Learning Mode' }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateData = (key: keyof OnboardingData, value: any) => {
        setData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Create user in Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: `user_${Date.now()}@example.com`, // Generate temporary email
                password: crypto.randomUUID(), // Generate random password
            });

            if (authError) throw authError;

            const userId = authData.user?.id;

            if (!userId) throw new Error('Failed to create user');

            // Create user profile in Supabase
            const { error: profileError } = await supabase.from('users').insert({
                id: userId,
                email: authData.user?.email,
                region: data.region,
                language: data.language,
                learning_mode: data.learningMode,
                grade_level: data.gradeLevel
            });

            if (profileError) throw profileError;

            // Insert learning goals
            if (data.goals.length > 0) {
                const goalsData = data.goals.map(goal => ({
                    user_id: userId,
                    goal
                }));

                const { error: goalsError } = await supabase.from('learning_goals').insert(goalsData);

                if (goalsError) throw goalsError;
            }

            // Store in local SQLite
            await sqlite.execute(`
        INSERT INTO edusage_user (
          id, email, region, language, learning_mode, grade_level, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                userId,
                authData.user?.email,
                data.region,
                data.language,
                data.learningMode,
                data.gradeLevel,
                new Date().toISOString(),
                new Date().toISOString()
            ]);

            // Store goals in SQLite
            for (const goal of data.goals) {
                await sqlite.execute(`
          INSERT INTO learning_goals (id, user_id, goal, created_at)
          VALUES (?, ?, ?, ?)
        `, [
                    crypto.randomUUID(),
                    userId,
                    goal,
                    new Date().toISOString()
                ]);
            }

            // Login user
            await login(authData.session?.access_token || '');

            // Show success animation
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'OnboardingWizard',
                action: 'submit'
            });
            setIsSubmitting(false);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0: // Region
                return !!data.region;
            case 1: // Language
                return !!data.language;
            case 2: // Goals
                return data.goals.length > 0;
            case 3: // Mode
                return !!data.learningMode;
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="p-6 flex justify-center">
                <h1 className="text-3xl font-bold text-cyan-400">EduΣage Setup</h1>
            </header>

            {/* Progress indicator */}
            <ProgressIndicator
                steps={steps}
                currentStep={currentStep}
                onStepClick={(index) => setCurrentStep(index)}
            />

            {/* Main content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <AnimatePresence mode="wait">
                        {currentStep === 0 && (
                            <motion.div
                                key="region"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="p-6"
                            >
                                <RegionSelector
                                    selectedRegion={data.region}
                                    onSelectRegion={(region) => updateData('region', region)}
                                />
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div
                                key="language"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="p-6"
                            >
                                <LanguageSelector
                                    selectedLanguage={data.language}
                                    onSelectLanguage={(language) => updateData('language', language)}
                                />
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="goals"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="p-6"
                            >
                                <GoalSelector
                                    selectedGoals={data.goals}
                                    onSelectGoals={(goals) => updateData('goals', goals)}
                                />
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="mode"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="p-6"
                            >
                                <ModeSelector
                                    selectedMode={data.learningMode}
                                    selectedGradeLevel={data.gradeLevel}
                                    onSelectMode={(mode) => updateData('learningMode', mode)}
                                    onSelectGradeLevel={(level) => updateData('gradeLevel', level)}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Footer with navigation buttons */}
            <footer className="p-6 flex justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`px-6 py-2 rounded-full ${currentStep === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                >
                    Back
                </button>

                <button
                    onClick={handleNext}
                    disabled={!isStepValid() || isSubmitting}
                    className={`px-6 py-2 rounded-full ${!isStepValid() || isSubmitting
                            ? 'bg-cyan-800 text-cyan-300 cursor-not-allowed'
                            : 'bg-cyan-600 text-white hover:bg-cyan-500'
                        }`}
                >
                    {currentStep === steps.length - 1 ? (
                        isSubmitting ? 'Setting Up...' : 'Complete Setup'
                    ) : (
                        'Next'
                    )}
                </button>
            </footer>

            {/* Success overlay */}
            {isSubmitting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="text-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl text-cyan-400 mb-4"
                        >
                            Setting up your learning experience...
                        </motion.div>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [1, 0.8, 1]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                            className="w-16 h-16 mx-auto border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"
                        />
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default OnboardingWizard;