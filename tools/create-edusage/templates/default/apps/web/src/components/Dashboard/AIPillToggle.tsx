import React, { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface AIPillToggleProps {
    active: boolean;
    onClick: () => void;
}

export const AIPillToggle: React.FC<AIPillToggleProps> = ({ active, onClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationControls = useAnimation();
    const errorHandler = RuntimeErrorHandler.getInstance();

    // Heartbeat animation when active
    useEffect(() => {
        if (active) {
            animationControls.start({
                scale: [1, 1.05, 1],
                boxShadow: [
                    '0 0 0 rgba(6, 182, 212, 0.4)',
                    '0 0 20px rgba(6, 182, 212, 0.6)',
                    '0 0 0 rgba(6, 182, 212, 0.4)'
                ],
                transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut'
                }
            });
        } else {
            animationControls.stop();
            animationControls.set({
                scale: 1,
                boxShadow: '0 0 0 rgba(6, 182, 212, 0.4)'
            });
        }
    }, [active, animationControls]);

    // Waveform animation when active
    useEffect(() => {
        if (!active || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let waveOffset = 0;

        const renderWaveform = () => {
            try {
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Set wave style
                ctx.strokeStyle = '#06B6D4';
                ctx.lineWidth = 2;

                // Draw waveform
                ctx.beginPath();

                for (let x = 0; x < canvas.width; x++) {
                    // Calculate y position with multiple sine waves for more natural look
                    const y =
                        Math.sin((x + waveOffset) * 0.05) * 5 +
                        Math.sin((x + waveOffset) * 0.1) * 3;

                    // Center the wave vertically
                    const yPos = (canvas.height / 2) + y;

                    if (x === 0) {
                        ctx.moveTo(x, yPos);
                    } else {
                        ctx.lineTo(x, yPos);
                    }
                }

                ctx.stroke();

                // Update offset for animation
                waveOffset += 0.5;

                // Request next frame
                animationFrameId = requestAnimationFrame(renderWaveform);
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'AIPillToggle',
                    action: 'renderWaveform'
                });
            }
        };

        renderWaveform();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [active]);

    return (
        <motion.button
            animate={animationControls}
            onClick={onClick}
            className={`relative flex items-center px-4 py-2 rounded-full ${active ? 'bg-cyan-600' : 'bg-gray-700'
                } transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* AI icon */}
            <div className={`flex items-center justify-center w-6 h-6 mr-2 rounded-full ${active ? 'bg-cyan-400 text-gray-900' : 'bg-gray-600 text-gray-300'
                }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" clipRule="evenodd" />
                </svg>
            </div>

            {/* Label */}
            <span className={`font-medium ${active ? 'text-white' : 'text-gray-300'}`}>
                {active ? 'AI Active' : 'AI Assistant'}
            </span>

            {/* Waveform visualization (only shown when active) */}
            {active && (
                <div className="absolute inset-0 overflow-hidden rounded-full">
                    <canvas
                        ref={canvasRef}
                        width="100"
                        height="36"
                        className="absolute inset-0 w-full h-full opacity-50"
                    />
                </div>
            )}
        </motion.button>
    );
};