import React, { useRef } from 'react';
import { useMotionValue, useSpring, useScroll, useTransform, motion } from 'framer-motion';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { ParallaxTextProps } from './ParallaxText.types';
import styles from './ParallaxText.module.css';

export const ParallaxText: React.FC<ParallaxTextProps> = ({
    children,
    baseVelocity = 5,
    className,
    ...props
}) => {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
        clamp: false
    });
    const errorHandler = RuntimeErrorHandler.getInstance();

    const x = useTransform(baseX, (v) => `${v}px`);

    const directionFactor = useRef<number>(1);

    useAnimateParallax(baseX, baseVelocity, velocityFactor, directionFactor, errorHandler);

    return (
        <div className={`${styles.parallax} ${className || ''}`} {...props}>
            <motion.div className={styles.scroller} style={{ x }}>
                <span className={styles.text}>{children}</span>
            </motion.div>
        </div>
    );
};

function useVelocity(value: any) {
    const velocityValue = useMotionValue(0);
    const prevValue = useRef(value.get());

    React.useEffect(() => {
        const updateVelocity = () => {
            const currentValue = value.get();
            const delta = currentValue - prevValue.current;
            prevValue.current = currentValue;
            velocityValue.set(delta);
        };

        const unsubscribe = value.onChange(updateVelocity);
        return () => unsubscribe();
    }, [value, velocityValue]);

    return velocityValue;
}

function useAnimateParallax(
    baseX: any,
    baseVelocity: number,
    velocityFactor: any,
    directionFactor: React.RefObject<number>,
    errorHandler: any
) {
    React.useEffect(() => {
        let animationFrameId: number;
        let lastTimestamp: number;

        const animate = (timestamp: number) => {
            try {
                if (!lastTimestamp) lastTimestamp = timestamp;
                const elapsed = timestamp - lastTimestamp;
                lastTimestamp = timestamp;

                const velocity = velocityFactor.get() * directionFactor.current * baseVelocity;
                let moveBy = velocity * (elapsed / 1000);

                if (velocity !== 0) {
                    moveBy = Math.min(Math.abs(moveBy), 5) * Math.sign(moveBy);
                }

                baseX.set(baseX.get() + moveBy);

                animationFrameId = requestAnimationFrame(animate);
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'ParallaxText',
                    action: 'animation_frame'
                });
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [baseVelocity, baseX, velocityFactor, directionFactor, errorHandler]);
}