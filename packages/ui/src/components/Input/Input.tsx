import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Input label
     */
    label?: string;
    /**
     * Helper text
     */
    helperText?: string;
    /**
     * Error message
     */
    error?: string;
    /**
     * Full width input
     */
    fullWidth?: boolean;
    /**
     * Additional CSS class names
     */
    className?: string;
}

/**
 * Input component for form controls
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({
        label,
        helperText,
        error,
        fullWidth = false,
        className = '',
        id,
        ...props
    }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

        const baseStyles = 'block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm';
        const errorStyles = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : '';
        const widthStyles = fullWidth ? 'w-full' : '';

        const inputClasses = `${baseStyles} ${errorStyles} ${widthStyles} ${className}`;

        return (
            <div className={fullWidth ? 'w-full' : ''}>
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={inputClasses}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-description` : undefined}
                    {...props}
                />
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500" id={`${inputId}-description`}>
                        {helperText}
                    </p>
                )}
                {error && (
                    <p className="mt-1 text-sm text-red-600" id={`${inputId}-error`}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;