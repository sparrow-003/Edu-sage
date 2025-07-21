import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { useAuthStore } from '../stores/authStore';
import { MagnetButton } from '../components/MagnetButton';
import { ParallaxText } from '../components/ParallaxText';
import { HeroVideo } from '../components/HeroVideo';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const isAuth = await checkAuth();

                if (isAuth) {
                    // If authenticated, redirect to dashboard
                    navigate('/dashboard');
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'LandingPage',
                    action: 'checkAuthentication'
                });
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, [checkAuth, navigate]);

    useEffect(() => {
        if (!isLoading && containerRef.current) {
            // Create edge light animation
            const edgeLights = gsap.timeline({
                repeat: -1,
                yoyo: true
            });

            edgeLights.to('.edge-light', {
                opacity: 0.8,
                duration: 2,
                stagger: 0.5,
                ease: 'power2.inOut'
            });

            edgeLights.to('.edge-light', {
                opacity: 0.2,
                duration: 2,
                stagger: 0.5,
                ease: 'power2.inOut'
            });

            return () => {
                edgeLights.kill();
            };
        }
    }, [isLoading]);

    const handleGetStarted = () => {
        navigate('/onboarding');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-cyan-400 text-2xl">Loading...</div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative min-h-screen bg-gray-900 overflow-hidden">
            {/* Edge lights */}
            <div className="edge-light absolute top-0 left-0 w-1 h-full bg-cyan-400 opacity-30" />
            <div className="edge-light absolute top-0 right-0 w-1 h-full bg-cyan-400 opacity-30" />
            <div className="edge-light absolute bottom-0 left-0 w-full h-1 bg-cyan-400 opacity-30" />
            <div className="edge-light absolute top-0 left-0 w-full h-1 bg-cyan-400 opacity-30" />

            {/* Hero video */}
            <HeroVideo
                src="/videos/hero-background.mp4"
                poster="/images/hero-poster.jpg"
                autoplay
                muted
                loop
            />

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-center"
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                        <ParallaxText baseVelocity={-1}>EduΣage</ParallaxText>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-12"
                    >
                        The AI-powered learning platform designed for the way your brain works.
                    </motion.p>

                    <MagnetButton onClick={handleGetStarted}>
                        Get Started
                    </MagnetButton>
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;