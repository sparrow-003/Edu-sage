'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useMotion } from '@/components/providers/MotionProvider';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  ripple?: boolean;
  tilt?: boolean;
  breathe?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  glow = false,
  ripple = true,
  tilt = true,
  breathe = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [rippleOrigin, setRippleOrigin] = useState({ x: 0, y: 0 });
  const { enableAnimations } = useMotion();

  const baseClasses = 'relative overflow-hidden font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 focus:ring-primary-500',
    secondary: 'bg-neutral-800 text-neutral-100 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600 focus:ring-neutral-500',
    ghost: 'bg-transparent text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 focus:ring-neutral-500',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-400 hover:to-success-500 focus:ring-success-500',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-400 hover:to-warning-500 focus:ring-warning-500',
    error: 'bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-400 hover:to-error-500 focus:ring-error-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl'
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && enableAnimations) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRippleOrigin({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    props.onClick?.(e);
  };

  const motionProps = enableAnimations ? {
    whileHover: tilt ? { 
      scale: 1.02, 
      rotateX: 2, 
      rotateY: 2,
      boxShadow: glow ? '0 0 30px rgba(59, 130, 246, 0.4)' : undefined
    } : { scale: 1.02 },
    whileTap: { scale: 0.98 },
    animate: breathe ? {
      scale: [1, 1.02, 1],
      boxShadow: glow ? [
        '0 0 20px rgba(59, 130, 246, 0.3)',
        '0 0 30px rgba(59, 130, 246, 0.5)',
        '0 0 20px rgba(59, 130, 246, 0.3)'
      ] : undefined
    } : {},
    transition: breathe ? {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    } : { type: "spring", stiffness: 400, damping: 17 }
  } : {};

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      disabled={loading}
      style={{ transformStyle: 'preserve-3d' }}
      {...motionProps}
      {...props}
    >
      {/* Ripple Effect */}
      {ripple && enableAnimations && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6 }}
          key={`${rippleOrigin.x}-${rippleOrigin.y}`}
        >
          <div
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: rippleOrigin.x - 4,
              top: rippleOrigin.y - 4,
            }}
          />
        </motion.div>
      )}

      {/* Glow Effect */}
      {glow && isHovered && enableAnimations && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-primary-600/20 rounded-inherit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <motion.span
                animate={enableAnimations ? { rotate: isHovered ? 5 : 0 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {icon}
              </motion.span>
            )}
            <span>{children}</span>
            {icon && iconPosition === 'right' && (
              <motion.span
                animate={enableAnimations ? { rotate: isHovered ? 5 : 0 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {icon}
              </motion.span>
            )}
          </>
        )}
      </div>
    </motion.button>
  );
}