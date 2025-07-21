import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface GoalSelectorProps {
    selectedGoals: string[];
    onSelectGoals: (goals: string[]) => void;
}

interface Suggestion {
    id: string;
    text: string;
    category: string;
}

export const GoalSelector: React.FC<GoalSelectorProps> = ({
    selectedGoals,
    onSelectGoals
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        // In a real app, these would come from an API or database
        setSuggestions([
            { id: '1', text: 'Learn Python programming', category: 'Programming' },
            { id: '2', text: 'Master calculus', category: 'Mathematics' },
            { id: '3', text: 'Improve writing skills', category: 'Language Arts' },
            { id: '4', text: 'Study world history', category: 'History' },
            { id: '5', text: 'Learn data science', category: 'Data Science' },
            { id: '6', text: 'Understand quantum physics', category: 'Physics' },
            { id: '7', text: 'Practice public speaking', category: 'Communication' },
            { id: '8', text: 'Learn Spanish', category: 'Languages' },
            { id: '9', text: 'Study machine learning', category: 'Artificial Intelligence' },
            { id: '10', text: 'Improve critical thinking', category: 'Cognitive Skills' },
            { id: '11', text: 'Learn web development', category: 'Programming' },
            { id: '12', text: 'Study organic chemistry', category: 'Chemistry' },
            { id: '13', text: 'Master digital marketing', category: 'Marketing' },
            { id: '14', text: 'Learn graphic design', category: 'Design' },
            { id: '15', text: 'Study astronomy', category: 'Astronomy' }
        ]);
    }, []);

    useEffect(() => {
        const filterSuggestions = () => {
            try {
                setIsLoading(true);

                // Simulate API delay
                setTimeout(() => {
                    if (!searchTerm.trim()) {
                        setFilteredSuggestions([]);
                    } else {
                        const filtered = suggestions.filter(suggestion =>
                            suggestion.text.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        setFilteredSuggestions(filtered);
                    }
                    setIsLoading(false);
                }, 300);
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'GoalSelector',
                    action: 'filterSuggestions'
                });
                setIsLoading(false);
            }
        };

        filterSuggestions();
    }, [searchTerm, suggestions]);

    const handleAddGoal = (goal: string) => {
        try {
            if (goal.trim() && !selectedGoals.includes(goal)) {
                onSelectGoals([...selectedGoals, goal]);
                setSearchTerm('');
                setFilteredSuggestions([]);
            }
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'GoalSelector',
                action: 'addGoal'
            });
        }
    };

    const handleRemoveGoal = (goal: string) => {
        try {
            onSelectGoals(selectedGoals.filter(g => g !== goal));
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'GoalSelector',
                action: 'removeGoal'
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        try {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < filteredSuggestions.length) {
                    handleAddGoal(filteredSuggestions[focusedIndex].text);
                } else if (searchTerm.trim()) {
                    handleAddGoal(searchTerm);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setFilteredSuggestions([]);
                setFocusedIndex(-1);
            }
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'GoalSelector',
                action: 'keyDown'
            });
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-6">What do you want to master?</h2>

            <div className="w-full max-w-md mb-6">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search learning goals..."
                        className="w-full p-3 pl-10 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <svg
                        className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>

                    {isLoading && (
                        <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    )}

                    {filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredSuggestions.map((suggestion, index) => (
                                <div
                                    key={suggestion.id}
                                    onClick={() => handleAddGoal(suggestion.text)}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    className={`p-3 cursor-pointer ${index === focusedIndex ? 'bg-gray-700' : 'hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="font-medium text-white">{suggestion.text}</div>
                                    <div className="text-xs text-gray-400">{suggestion.category}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-3">Your selected goals:</h3>

                {selectedGoals.length === 0 ? (
                    <p className="text-gray-400 text-center">No goals selected yet. Search and add your learning goals above.</p>
                ) : (
                    <motion.div
                        className="flex flex-wrap gap-2"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {selectedGoals.map((goal) => (
                            <motion.div
                                key={goal}
                                variants={itemVariants}
                                className="bg-cyan-600 text-white px-3 py-1 rounded-full flex items-center"
                            >
                                <span className="mr-2">{goal}</span>
                                <button
                                    onClick={() => handleRemoveGoal(goal)}
                                    className="h-5 w-5 rounded-full bg-cyan-700 flex items-center justify-center hover:bg-cyan-800"
                                >
                                    <svg
                                        className="h-3 w-3 text-white"
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
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            <p className="text-gray-300 text-center max-w-md">
                Tell us what you want to learn, and we'll personalize your experience. You can add multiple goals and change them anytime.
            </p>
        </div>
    );
};