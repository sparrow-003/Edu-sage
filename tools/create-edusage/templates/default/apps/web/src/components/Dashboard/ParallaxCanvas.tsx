import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

export const ParallaxCanvas: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const starsRef = useRef<HTMLDivElement>(null);
    const ringsRef = useRef<HTMLDivElement>(null);
    const islandsRef = useRef<HTMLDivElement>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    const { scrollY } = useScroll();

    // Parallax effect on scroll
    const starsY = useTransform(scrollY, [0, 500], [0, 100]);
    const ringsY = useTransform(scrollY, [0, 500], [0, 50]);
    const islandsY = useTransform(scrollY, [0, 500], [0, 20]);

    // Initialize animations
    useEffect(() => {
        try {
            if (!starsRef.current || !ringsRef.current || !islandsRef.current) return;

            // Stars drift animation
            gsap.to('.star', {
                x: 'random(-20, 20)',
                y: 'random(-20, 20)',
                opacity: 'random(0.3, 0.7)',
                duration: 'random(10, 20)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 0.1
            });

            // Rings rotation animation
            gsap.to('.mastery-ring', {
                rotation: 360,
                transformOrigin: 'center center',
                duration: 'random(60, 120)',
                repeat: -1,
                ease: 'none',
                stagger: 10
            });

            // Islands subtle float animation
            gsap.to('.island', {
                y: 'random(-5, 5)',
                rotation: 'random(-2, 2)',
                duration: 'random(5, 10)',
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 2
            });
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'ParallaxCanvas',
                action: 'initializeAnimations'
            });
        }
    }, []);

    // Generate stars
    const generateStars = (count: number) => {
        return Array.from({ length: count }).map((_, i) => (
            <div
                key={`star-${i}`}
                className="star absolute rounded-full bg-white"
                style={{
                    width: Math.random() * 2 + 1 + 'px',
                    height: Math.random() * 2 + 1 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    opacity: Math.random() * 0.5 + 0.2
                }}
            />
        ));
    };

    // Generate mastery rings
    const generateRings = (count: number) => {
        return Array.from({ length: count }).map((_, i) => (
            <div
                key={`ring-${i}`}
                className="mastery-ring absolute rounded-full border-2 border-cyan-400 opacity-20"
                style={{
                    width: 100 + i * 50 + 'px',
                    height: 100 + i * 50 + 'px',
                    left: `calc(${30 + Math.random() * 40}% - ${(100 + i * 50) / 2}px)`,
                    top: `calc(${30 + Math.random() * 40}% - ${(100 + i * 50) / 2}px)`
                }}
            />
        ));
    };

    // Generate learning islands
    const generateIslands = (count: number) => {
        const colors = ['bg-cyan-800', 'bg-blue-800', 'bg-indigo-800', 'bg-purple-800'];

        return Array.from({ length: count }).map((_, i) => (
            <div
                key={`island-${i}`}
                className={`island absolute rounded-lg shadow-lg cursor-pointer ${colors[i % colors.length]}`}
                style={{
                    width: 80 + Math.random() * 40 + 'px',
                    height: 80 + Math.random() * 40 + 'px',
                    left: 20 + Math.random() * 60 + '%',
                    top: 20 + Math.random() * 60 + '%'
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                    {['Python', 'Math', 'History', 'Physics', 'Art'][i % 5]}
                </div>
            </div>
        ));
    };

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Background layer - Stars */}
            <motion.div
                ref={starsRef}
                className="absolute inset-0 bg-gray-900"
                style={{ y: starsY }}
            >
                {generateStars(100)}
            </motion.div>

            {/* Middle layer - Mastery rings */}
            <motion.div
                ref={ringsRef}
                className="absolute inset-0"
                style={{ y: ringsY }}
            >
                {generateRings(5)}
            </motion.div>

            {/* Foreground layer - Learning islands */}
            <motion.div
                ref={islandsRef}
                className="absolute inset-0 pointer-events-auto"
                style={{ y: islandsY }}
            >
                {generateIslands(5)}
            </motion.div>
        </div>
    );
};