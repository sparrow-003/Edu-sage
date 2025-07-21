import React from 'react';

export interface CardProps {
    /**
     * Card contents
     */
    children: React.ReactNode;
    /**
     * Card title
     */
    title?: string;
    /**
     * Card padding
     */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /**
     * Card border
     */
    bordered?: boolean;
    /**
     * Card shadow
     */
    shadow?: 'none' | 'sm' | 'md' | 'lg';
    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * Card component for containing content
 */
export const Card = ({
    children,
    title,
    padding = 'md',
    bordered = true,
    shadow = 'sm',
    className = '',
    ...props
}: CardProps) => {
    const baseStyles = 'rounded-lg bg-white';

    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-5',
        lg: 'p-8',
    };

    const borderStyles = bordered ? 'border border-gray-200' : '';

    const shadowStyles = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow',
        lg: 'shadow-lg',
    };

    const cardClasses = `${baseStyles} ${paddingStyles[padding]} ${borderStyles} ${shadowStyles[shadow]} ${className}`;

    return (
        <div className={cardClasses} {...props}>
            {title && (
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;