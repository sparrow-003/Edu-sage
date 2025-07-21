import React from 'react';

export interface ButtonProps {
    /**
     * Button contents
     */
    children: React.ReactNode;
    /**
     * Optional click handler
     */
    onClick?: () => void;
    /**
     * Button variant
     */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    /**
     * Button size
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Is button disabled
     */
    disabled?: boolean;
    /**
     * Full width button
     */
    fullWidth?: boolean;
    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    fullWidth = false,
    className = '',
    onClick,
    ...props
}: ButtonProps) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';

    const variantStyles = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        ghost: 'bg-transparent hover:bg-gray-100',
    };

    const sizeStyles = {
        sm: 'text-sm px-3 py-1',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
    };

    const widthStyles = fullWidth ? 'w-full' : '';
    const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${disabledStyles} ${className}`;

    return (
        <button
            className={buttonClasses}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;