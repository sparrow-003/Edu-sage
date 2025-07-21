'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes, FaExpand, FaCompress, FaPaperPlane, FaMicrophone } from 'react-icons/fa';
import { GlassMorphPanel } from './GlassMorphPanel';
import { TypewriterText } from './TypewriterText';
import { useMotion } from '@/components/providers/MotionProvider';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  streaming?: boolean;
}

interface FloatingChatPanelProps {
  onSendMessage?: (message: string) => void;
  onVoiceInput?: () => void;
  messages?: Message[];
  isLoading?: boolean;
}

export function FloatingChatPanel({
  onSendMessage,
  onVoiceInput,
  messages = [],
  isLoading = false
}: FloatingChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [dockedEdge, setDockedEdge] = useState<'top' | 'right' | 'bottom' | 'left' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { enableAnimations } = useMotion();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (onVoiceInput) {
      onVoiceInput();
    }
  };

  const handleDock = (edge: 'top' | 'right' | 'bottom' | 'left') => {
    setDockedEdge(edge);
    setIsExpanded(true);
  };

  const getDockStyles = () => {
    if (!dockedEdge) return {};
    
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 1000,
    };

    switch (dockedEdge) {
      case 'right':
        return { ...baseStyles, right: 0, top: 0, height: '100vh', width: '400px' };
      case 'left':
        return { ...baseStyles, left: 0, top: 0, height: '100vh', width: '400px' };
      case 'top':
        return { ...baseStyles, top: 0, left: 0, right: 0, height: '300px' };
      case 'bottom':
        return { ...baseStyles, bottom: 0, left: 0, right: 0, height: '300px' };
      default:
        return {};
    }
  };

  // Floating toggle button
  if (!isOpen) {
    return (
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg flex items-center justify-center text-white z-50"
        onClick={() => setIsOpen(true)}
        whileHover={enableAnimations ? { scale: 1.1, rotate: 5 } : {}}
        whileTap={enableAnimations ? { scale: 0.9 } : {}}
        animate={enableAnimations ? {
          boxShadow: [
            '0 4px 20px rgba(59, 130, 246, 0.3)',
            '0 8px 30px rgba(59, 130, 246, 0.5)',
            '0 4px 20px rgba(59, 130, 246, 0.3)'
          ]
        } : {}}
        transition={enableAnimations ? {
          boxShadow: { duration: 2, repeat: Infinity },
          default: { type: "spring", stiffness: 400, damping: 17 }
        } : {}}
      >
        <FaComments className="text-xl" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <GlassMorphPanel
        className={dockedEdge ? '' : 'fixed bottom-20 right-6 z-50'}
        style={getDockStyles()}
        draggable={!dockedEdge}
        dockable={!dockedEdge}
        onDock={handleDock}
        minWidth={350}
        minHeight={400}
        maxWidth={600}
        maxHeight={800}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-neon flex items-center justify-center">
              <FaComments className="text-sm text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">EDUΣAGE AI</h3>
              <p className="text-xs text-neutral-400">Always here to help</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-8 h-8 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              {isExpanded ? <FaCompress /> : <FaExpand />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.length === 0 ? (
            <div className="text-center text-neutral-400 py-8">
              <FaComments className="text-4xl mx-auto mb-4 opacity-50" />
              <p>Start a conversation with your AI tutor!</p>
            </div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={enableAnimations ? { opacity: 0, y: 20, scale: 0.9 } : {}}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-tr-sm'
                      : 'bg-neutral-800/80 text-neutral-100 rounded-tl-sm'
                  }`}
                >
                  {message.streaming ? (
                    <TypewriterText text={message.content} speed={30} />
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-neutral-800/80 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-primary-400 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-neutral-700/50">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                className="w-full bg-neutral-800/50 border border-neutral-700/50 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              
              <button
                onClick={handleVoiceToggle}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-error-500 text-white animate-pulse'
                    : 'bg-neutral-700/50 text-neutral-400 hover:bg-neutral-600/50 hover:text-white'
                }`}
              >
                <FaMicrophone className="text-sm" />
              </button>
            </div>
            
            <motion.button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                inputValue.trim()
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'bg-neutral-700/50 text-neutral-500 cursor-not-allowed'
              }`}
              whileHover={enableAnimations && inputValue.trim() ? { scale: 1.05 } : {}}
              whileTap={enableAnimations && inputValue.trim() ? { scale: 0.95 } : {}}
            >
              <FaPaperPlane className="text-sm" />
            </motion.button>
          </div>
        </div>

        {/* Ripple effect on message send */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute bottom-4 right-16 w-4 h-4 bg-primary-500/30 rounded-full"
                animate={{
                  scale: [1, 3, 1],
                  opacity: [0.6, 0, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassMorphPanel>
    </AnimatePresence>
  );
}