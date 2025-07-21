import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { ChatBubble } from './ChatBubble';
import { WhiteboardCard } from './Cards/WhiteboardCard';
import { SummaryCard } from './Cards/SummaryCard';
import { QuizCard } from './Cards/QuizCard';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    cards?: Card[];
}

interface Card {
    type: 'whiteboard' | 'summary' | 'quiz';
    content: any;
}

interface ChatPanelProps {
    aiActive: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ aiActive }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
            timestamp: new Date(),
            cards: []
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        try {
            // Add user message
            const userMessage: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: inputValue,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);
            setInputValue('');
            setIsTyping(true);

            // Simulate AI response (in a real app, this would call the LangGraph API)
            setTimeout(() => {
                try {
                    let aiResponse: Message;

                    // Generate different responses based on user input
                    if (inputValue.toLowerCase().includes('python')) {
                        aiResponse = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: 'Python is a great language to learn! Here\'s a quick overview of some key concepts:',
                            timestamp: new Date(),
                            cards: [
                                {
                                    type: 'summary',
                                    content: {
                                        title: 'Python Basics',
                                        points: [
                                            'Python is a high-level, interpreted language',
                                            'Indentation is used for code blocks',
                                            'Dynamic typing means variables can change types',
                                            'Rich standard library and ecosystem'
                                        ]
                                    }
                                },
                                {
                                    type: 'whiteboard',
                                    content: {
                                        sketch: 'python-flow-control',
                                        title: 'Python Flow Control'
                                    }
                                }
                            ]
                        };
                    } else if (inputValue.toLowerCase().includes('quiz') || inputValue.toLowerCase().includes('test')) {
                        aiResponse = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: 'I\'ve created a quick quiz to test your knowledge:',
                            timestamp: new Date(),
                            cards: [
                                {
                                    type: 'quiz',
                                    content: {
                                        title: 'Quick Knowledge Check',
                                        questions: [
                                            {
                                                question: 'What does AI stand for?',
                                                options: [
                                                    'Automated Intelligence',
                                                    'Artificial Intelligence',
                                                    'Advanced Integration',
                                                    'Algorithmic Iteration'
                                                ],
                                                correctIndex: 1,
                                                explanation: 'AI stands for Artificial Intelligence, which refers to the simulation of human intelligence in machines.'
                                            }
                                        ]
                                    }
                                }
                            ]
                        };
                    } else {
                        aiResponse = {
                            id: (Date.now() + 1).toString(),
                            role: 'assistant',
                            content: 'I\'m here to help with your learning journey. You can ask me about specific topics, request quizzes, or get help with concepts you\'re struggling with.',
                            timestamp: new Date()
                        };
                    }

                    setMessages(prev => [...prev, aiResponse]);
                    setIsTyping(false);
                } catch (error) {
                    errorHandler.captureException(error as Error, {
                        component: 'ChatPanel',
                        action: 'processAIResponse'
                    });
                    setIsTyping(false);
                }
            }, 1500);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'ChatPanel',
                action: 'sendMessage'
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                <AnimatePresence>
                    {messages.map(message => (
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
                                <div className="mt-2 ml-10 space-y-3">
                                    {message.cards.map((card, index) => (
                                        <div key={`${message.id}-card-${index}`}>
                                            {card.type === 'whiteboard' && (
                                                <WhiteboardCard
                                                    sketch={card.content.sketch}
                                                    title={card.content.title}
                                                />
                                            )}
                                            {card.type === 'summary' && (
                                                <SummaryCard
                                                    title={card.content.title}
                                                    points={card.content.points}
                                                />
                                            )}
                                            {card.type === 'quiz' && (
                                                <QuizCard
                                                    title={card.content.title}
                                                    questions={card.content.questions}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center ml-10 space-x-1"
                        >
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-end space-x-2">
                    <div className="flex-1">
                        <textarea
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={aiActive ? "Ask me anything..." : "Enable AI to start chatting"}
                            disabled={!aiActive}
                            className="w-full p-3 bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-400 disabled:bg-gray-800 disabled:text-gray-500"
                            rows={2}
                        />
                    </div>

                    <button
                        onClick={handleSendMessage}
                        disabled={!aiActive || !inputValue.trim()}
                        className="p-3 text-white bg-cyan-600 rounded-lg disabled:bg-gray-700 disabled:text-gray-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                </div>

                {!aiActive && (
                    <p className="mt-2 text-xs text-center text-gray-500">
                        Enable AI Assistant in the top bar to start chatting
                    </p>
                )}
            </div>
        </div>
    );
};