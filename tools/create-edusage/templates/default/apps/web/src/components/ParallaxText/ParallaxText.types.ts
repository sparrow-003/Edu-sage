import { ReactNode } from 'react';

export interface ParallaxTextProps {
    children: ReactNode;
    baseVelocity?: number;
    className?: string;
    [key: string]: any;
}