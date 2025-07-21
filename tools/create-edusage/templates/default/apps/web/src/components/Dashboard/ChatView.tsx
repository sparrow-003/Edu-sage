import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { ChatBubble } from './ChatBubble';
import { WhiteboardCard } from './Cards/WhiteboardCard';
import { SummaryCard } from './Cards/SummaryCard';
import { QuizCard } from './Cards/QuizCard';

interface ChatViewProps {
    aiActive: boolean;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    cards?: {
        type: 'whiteboard' | 'summary' | 'quiz';
        data: any;
    }[];
}

export const ChatView: React.FC<ChatViewProps> = ({ aiActive }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your EduΣage AI tutor. How can I help you with your learning today?',
            timestamp: new Date(),
            cards: []
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputValue.trim()) return;

        try {
            // Add user message
            const userMessage: Message = {
                id: crypto.randomUUID(),
                role: 'user',
                content: inputValue,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsTyping(true);

            // Simulate AI response
            setTimeout(() => {
                try {
                    let aiResponse: Message;

                    // Generate different responses based on input
                    if (inputValue.toLowerCase().includes('python')) {
                        aiResponse = {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: '## Python Basics\n\nPython is a high-level, interpreted programming language known for its readability and simplicity. Here\'s a quick overview of some fundamental concepts:',
                            timestamp: new Date(),
                            cards: [
                                {
                                    type: 'summary',
                                    data: {
                                        title: 'Python Key Concepts',
                                        points: [
                                            'Dynamic typing - no need to declare variable types',
                                            'Indentation-based syntax - no curly braces',
                                            'Rich standard library - "batteries included"',
                                            'Object-oriented with support for functional programming'
                                        ]
                                    }
                                },
                                {
                                    type: 'whiteboard',
                                    data: {
                                        title: 'Basic Python Syntax',
                                        code: 'def greet(name):\n    """Simple greeting function"""\n    return f"Hello, {name}!"\n\n# Call the function\nresult = greet("World")\nprint(result)  # Output: Hello, World!'
                                    }
                                }
                            ]
                        };
                    } else if (inputValue.toLowerCase().includes('quiz') || inputValue.toLowerCase().includes('test')) {
                        aiResponse = {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: 'I\'ve created a quick quiz to test your knowledge. Give it a try!',
                            timestamp: new Date(),
                            cards: [
                                {
                                    type: 'quiz',
                                    data: {
                                        question: 'Which of the following is NOT a Python data type?',
                                        options: ['Integer', 'String', 'Boolean', 'Character'],
                                        correctAnswer: 'Character',
                                        explanation: 'Python does not have a dedicated Character data type. Single characters in Python are represented as strings of length 1.'
                                    }
                                }
                            ]
                        };
                    } else {
                        aiResponse = {
                            id: crypto.randomUUID(),
                            role: 'assistant',
                            content: 'I\'d be happy to help you with that! What specific aspects would you like to learn more about?',
                            timestamp: new Date()
                        };
                    }

                    setMessages(prev => [...prev, aiResponse]);
                    setIsTyping(false);
                } catch (error) {
                    errorHandler.captureException(error as Error, {
                        component: 'ChatView',
                        action: 'generateAIResponse'
                    });
                    setIsTyping(false);
                }
            }, 1500);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'ChatView',
                action: 'handleSubmit'
            });
            setIsTyping(false);
        }
    };

    const renderCard = (card: { type: string; data: any }, index: number) => {
        switch (card.type) {
            case 'whiteboard':
                return <WhiteboardCard key={index} title={card.data.title} code={card.data.code} />;
            case 'summary':
                return <SummaryCard key={index} title={card.data.title} points={card.data.points} />;
            case 'quiz':
                return <QuizCard key={index} question={card.data.question} options={card.data.options} correctAnswer={card.data.correctAnswer} explanation={card.data.explanation} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-4"
                        >
                            <ChatBubble
                                role={message.role}
                                content={message.content}
                                timestamp={message.timestamp}
                            />

                            {/* Render cards if any */}
                            {message.cards && message.cards.length > 0 && (
                                <div className="ml-10 mt-2 space-y-3">
                                    {message.cards.map((card, index) => renderCard(card, index))}
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center ml-10 text-gray-400"
                        >
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="ml-2 text-sm">AI is typing...</span>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <textarea
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder={aiActive ? "Ask me anything..." : "Enable AI to start chatting..."}
                        disabled={!aiActive}
                        className="w-full p-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                    />

                    <div className="flex justify-between mt-2">
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                className="p-2 rounded-full bg-gray-700 text-gray-400 hover:text-white disabled:opacity-50"
                                disabled={!aiActive}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                </svg>
                            </button>
                            <button
                                type="button"
                                className="p-2 rounded-full bg-gray-700 text-gray-400 hover:text-white disabled:opacity-50"
                                disabled={!aiActive}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                    />
                                </svg>
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={!aiActive || !inputValue.trim()}
                            className={`px-4 py-2 rounded-lg font-medium ${aiActive && inputValue.trim()
                                    ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};