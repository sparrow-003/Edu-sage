import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { MagnetButtonProps } from './MagnetButton.types';
import styles from './MagnetButton.module.css';

export const MagnetButton: React.FC<MagnetButtonProps> = ({
    children,
    className,
    magnetRadius = 100,
    snapStrength = 0.5,
    onClick,
    ...props
}) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!buttonRef.current) return;

            try {
                const button = buttonRef.current;
                const rect = button.getBoundingClientRect();

                // Calculate button center
                const buttonCenterX = rect.left + rect.width / 2;
                const buttonCenterY = rect.top + rect.height / 2;

                // Calculate distance from mouse to button center
                const distanceX = e.clientX - buttonCenterX;
                const distanceY = e.clientY - buttonCenterY;
                const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

                // If mouse is within magnetic radius, apply magnetic effect
                if (distance < magnetRadius) {
                    // Calculate magnetic pull (stronger when closer)
                    const pull = (magnetRadius - distance) / magnetRadius * snapStrength;

                    // Apply pull to button position
                    setPosition({
                        x: distanceX * pull,
                        y: distanceY * pull
                    });
                } else {
                    // Reset position when mouse is outside radius
                    setPosition({ x: 0, y: 0 });
                }
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'MagnetButton',
                    action: 'handleMouseMove'
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [magnetRadius, snapStrength]);

    return (
        <motion.button
            ref={buttonRef}
            className={`${styles.magnetButton} ${className || ''}`}
            animate={{
                x: position.x,
                y: position.y
            }}
            transition={{
                type: 'spring',
                stiffness: 150,
                damping: 15,
                mass: 0.1
            }}
            whileHover={{
                scale: 1.1
            }}
            whileTap={{
                scale: 0.95
            }}
            onClick={onClick}
            {...props}
        >
            <span className={styles.buttonContent}>{children}</span>
            <div className={styles.buttonGlow} />
        </motion.button>
    );
};