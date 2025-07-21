import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { FiMic, FiMicOff, FiMessageCircle } from 'react-icons/fi';
import { useAIAgent } from '../hooks/useAIAgent';

export const FloatingToggle: React.FC = () => {
    const { state, toggleAgent, startListening, stopListening } = useAIAgent();
    const toggleRef = useRef<HTMLButtonElement>(null);
    const magnetRef = useRef<HTMLDivElement>(null);

    // GSAP magnet hover effect
    useEffect(() => {
        const toggle = toggleRef.current;
        const magnet = magnetRef.current;

        if (!toggle || !magnet) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = toggle.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) * 0.3;
            const deltaY = (e.clientY - centerY) * 0.3;

            gsap.to(toggle, {
                x: deltaX,
                y: deltaY,
                duration: 0.3,
                ease: "power2.out"
            });
        };

        const handleMouseLeave = () => {
            gsap.to(toggle, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        };

        magnet.addEventListener('mousemove', handleMouseMove);
        magnet.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            magnet.removeEventListener('mousemove', handleMouseMove);
            magnet.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleToggleClick = () => {
        toggleAgent();

        // Haptic feedback if available
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    };

    const handleMicClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (state.isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    return (
        <div
            ref={magnetRef}
            className="fixed top-6 right-6 z-50"
            style={{ width: '80px', height: '80px' }}
        >
            <motion.button
                ref={toggleRef}
                onClick={handleToggleClick}
                className={`edu-floating-toggle ${state.isActive ? 'active' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                }}
            >
                <AnimatePresence mode="wait">
                    {!state.isActive ? (
                        <motion.div
                            key="inactive"
                            initial={{ opacity: 0, rotate: -180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FiMessageCircle size={24} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.3 }}
                            onClick={handleMicClick}
                            className="relative"
                        >
                            {state.isListening ? (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <FiMic size={24} />
                                </motion.div>
                            ) : (
                                <FiMicOff size={24} />
                            )}

                            {/* Pulse animation when listening */}
                            {state.isListening && (
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-white"
                                    initial={{ scale: 1, opacity: 1 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "easeOut"
                                    }}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Processing indicator */}
            <AnimatePresence>
                {state.isProcessing && (
                    <motion.div
                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                    >
                        <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-white rounded-full"
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 0.6,
                                        delay: i * 0.1,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};