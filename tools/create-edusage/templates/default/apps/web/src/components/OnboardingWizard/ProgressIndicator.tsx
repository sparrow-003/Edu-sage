import React from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface ProgressIndicatorProps {
    steps: { id: string; label: string }[];
    currentStep: number;
    onStepClick: (index: number) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    steps,
    currentStep,
    onStepClick
}) => {
    const errorHandler = RuntimeErrorHandler.getInstance();

    const handleStepClick = (index: number) => {
        try {
            // Only allow clicking on completed steps
            if (index < currentStep) {
                onStepClick(index);
            }
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'ProgressIndicator',
                action: 'stepClick'
            });
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        {/* Step circle */}
                        <motion.div
                            className={`relative flex items-center justify-center w-10 h-10 rounded-full cursor-pointer ${index <= currentStep
                                    ? 'bg-cyan-600'
                                    : 'bg-gray-700'
                                }`}
                            onClick={() => handleStepClick(index)}
                            whileHover={index < currentStep ? { scale: 1.1 } : {}}
                            whileTap={index < currentStep ? { scale: 0.95 } : {}}
                            animate={{
                                scale: index === currentStep ? [1, 1.1, 1] : 1,
                                transition: {
                                    duration: 0.5,
                                    repeat: index === currentStep ? Infinity : 0,
                                    repeatType: 'reverse'
                                }
                            }}
                        >
                            {index < currentStep ? (
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            ) : (
                                <span className={`text-sm font-medium ${index === currentStep ? 'text-white' : 'text-gray-400'
                                    }`}>
                                    {index + 1}
                                </span>
                            )}

                            {/* Step label */}
                            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                <span className={`text-xs font-medium ${index <= currentStep ? 'text-cyan-400' : 'text-gray-500'
                                    }`}>
                                    {step.label}
                                </span>
                            </div>

                            {/* Pulse effect for current step */}
                            {index === currentStep && (
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-cyan-400"
                                    animate={{
                                        opacity: [0.2, 0],
                                        scale: [1, 1.5]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        repeatType: 'loop'
                                    }}
                                />
                            )}
                        </motion.div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-2 h-0.5 relative">
                                <div className="absolute inset-0 bg-gray-700"></div>
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-cyan-600"
                                    initial={{ width: '0%' }}
                                    animate={{
                                        width: index < currentStep ? '100%' : index === currentStep ? '50%' : '0%'
                                    }}
                                    transition={{ duration: 0.3 }}
                                ></motion.div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};