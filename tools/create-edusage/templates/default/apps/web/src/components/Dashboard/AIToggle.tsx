import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

interface AIToggleProps {
    active: boolean;
    onToggle: () => void;
}

export const AIToggle: React.FC<AIToggleProps> = ({ active, onToggle }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        if (!canvasRef.current || !active) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        let animationFrameId: number;

        try {
            // Set canvas dimensions
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;

            // Waveform animation variables
            let phase = 0;
            const waveAmplitude = canvas.height / 4;
            const waveFrequency = 0.05;
            const waveSpeed = 0.1;

            // Animation function
            const animate = () => {
                try {
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw waveform
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height / 2);

                    for (let x = 0; x < canvas.width; x++) {
                        // Create dynamic amplitude based on position
                        const dynamicAmplitude = waveAmplitude * (0.5 + 0.5 * Math.sin(x * 0.01 + phase * 0.5));

                        // Calculate y position with multiple sine waves for complexity
                        const y = canvas.height / 2 +
                            dynamicAmplitude * Math.sin(x * waveFrequency + phase) +
                            dynamicAmplitude * 0.5 * Math.sin(x * waveFrequency * 2 + phase * 1.5);

                        ctx.lineTo(x, y);
                    }

                    ctx.lineTo(canvas.width, canvas.height / 2);
                    ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Update phase
                    phase += waveSpeed;

                    // Request next frame
                    animationFrameId = requestAnimationFrame(animate);
                } catch (error) {
                    errorHandler.captureException(error as Error, {
                        component: 'AIToggle',
                        action: 'waveformAnimation'
                    });
                }
            };

            // Start animation
            animate();

            return () => {
                cancelAnimationFrame(animationFrameId);
            };
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'AIToggle',
                action: 'initializeCanvas'
            });
        }
    }, [active]);

    const handleToggle = () => {
        try {
            onToggle();
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'AIToggle',
                action: 'toggle'
            });
        }
    };

    return (
        <motion.button
            onClick={handleToggle}
            className={`relative h-10 px-4 rounded-full flex items-center justify-center transition-colors ${active ? 'bg-cyan-600' : 'bg-gray-700'
                }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Pulse effect when active */}
            {active && (
                <motion.div
                    className="absolute inset-0 rounded-full bg-cyan-400"
                    animate={{
                        opacity: [0.2, 0],
                        scale: [1, 1.2]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: 'loop'
                    }}
                />
            )}

            {/* AI Icon */}
            <div className={`flex items-center ${active ? 'text-white' : 'text-gray-300'}`}>
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                </svg>
                <span className="font-medium">AI</span>
            </div>

            {/* Waveform visualization when active */}
            {active && (
                <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full opacity-50"
                    />
                </div>
            )}
        </motion.button>
    );
};