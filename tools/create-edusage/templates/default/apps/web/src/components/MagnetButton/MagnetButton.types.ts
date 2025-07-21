import { ReactNode } from 'react';

export interface MagnetButtonProps {
    children: ReactNode;
    className?: string;
    magnetRadius?: number;
    snapStrength?: number;
    onClick?: () => void;
    [key: string]: any;
}