import React from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface ChatBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, timestamp }) => {
    const errorHandler = RuntimeErrorHandler.getInstance();

    // Format timestamp
    const formatTime = (date: Date) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric'
            }).format(date);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'ChatBubble',
                action: 'formatTime'
            });
            return '';
        }
    };

    // Parse markdown-like formatting in content
    const parseContent = (text: string) => {
        try {
            // Replace headers
            text = text.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold mb-2">$1</h2>');
            text = text.replace(/^### (.*?)$/gm, '<h3 class="text-md font-bold mb-1">$1</h3>');

            // Replace paragraphs
            text = text.replace(/^(?!<h[23]>)(.*?)$/gm, '<p class="mb-2">$1</p>');

            // Replace code blocks
            text = text.replace(/```([\s\S]*?)```/g, '<pre class="p-2 bg-gray-900 rounded-md overflow-x-auto mb-2"><code>$1</code></pre>');

            // Replace inline code
            text = text.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-900 rounded">$1</code>');

            // Replace bold
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            // Replace italic
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

            return text;
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'ChatBubble',
                action: 'parseContent'
            });
            return text;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
            }}
            className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[80%] rounded-lg p-3 ${role === 'user'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
            >
                <div
                    className="prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: parseContent(content) }}
                />

                <div className={`text-xs mt-1 ${role === 'user' ? 'text-cyan-200' : 'text-gray-400'
                    }`}>
                    {formatTime(timestamp)}
                </div>
            </div>
        </motion.div>
    );
};