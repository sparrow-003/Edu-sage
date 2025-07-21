import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface Question {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

interface QuizCardProps {
    title: string;
    questions: Question[];
}

export const QuizCard: React.FC<QuizCardProps> = ({ title, questions }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const errorHandler = RuntimeErrorHandler.getInstance();

    const currentQuestion = questions[currentQuestionIndex];

    const handleSelectOption = (index: number) => {
        try {
            if (isSubmitted) return;
            setSelectedOption(index);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'QuizCard',
                action: 'selectOption'
            });
        }
    };

    const handleSubmit = () => {
        try {
            if (selectedOption === null) return;

            const correct = selectedOption === currentQuestion.correctIndex;
            setIsCorrect(correct);
            setIsSubmitted(true);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'QuizCard',
                action: 'submitAnswer'
            });
        }
    };

    const handleNextQuestion = () => {
        try {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedOption(null);
                setIsSubmitted(false);
            }
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'QuizCard',
                action: 'nextQuestion'
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
            <div className="p-3 border-b border-gray-700">
                <h3 className="text-sm font-medium text-white">{title}</h3>
                <div className="mt-1 text-xs text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>
            </div>

            <div className="p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h4 className="mb-4 text-sm font-medium text-white">{currentQuestion.question}</h4>

                        <div className="space-y-2">
                            {currentQuestion.options.map((option, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => handleSelectOption(index)}
                                    className={`w-full p-3 text-left text-sm rounded-md transition-colors ${selectedOption === index
                                            ? isSubmitted
                                                ? index === currentQuestion.correctIndex
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-red-600 text-white'
                                                : 'bg-cyan-600 text-white'
                                            : isSubmitted && index === currentQuestion.correctIndex
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    disabled={isSubmitted}
                                    whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                                    whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                                    animate={
                                        isSubmitted && selectedOption === index && selectedOption !== currentQuestion.correctIndex
                                            ? { x: [0, -10, 10, -10, 10, 0] }
                                            : {}
                                    }
                                    transition={
                                        isSubmitted && selectedOption === index && selectedOption !== currentQuestion.correctIndex
                                            ? { duration: 0.5 }
                                            : { duration: 0.2 }
                                    }
                                >
                                    <div className="flex items-center">
                                        <span className="flex items-center justify-center w-6 h-6 mr-3 text-xs font-medium border rounded-full border-gray-500">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        {option}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {isSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="mt-4 p-3 rounded-md bg-gray-700"
                                >
                                    <div className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                        {isCorrect ? 'Correct!' : 'Incorrect'}
                                    </div>
                                    <p className="mt-1 text-sm text-gray-300">{currentQuestion.explanation}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex justify-between p-2 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                    {isSubmitted ? (
                        isCorrect ? 'Great job!' : 'Keep learning!'
                    ) : (
                        'Select an answer'
                    )}
                </div>

                <div className="flex space-x-2">
                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={selectedOption === null}
                            className="px-3 py-1 text-xs text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500"
                        >
                            Submit
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            disabled={currentQuestionIndex >= questions.length - 1}
                            className="px-3 py-1 text-xs text-white bg-cyan-600 rounded-md hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500"
                        >
                            {currentQuestionIndex >= questions.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};