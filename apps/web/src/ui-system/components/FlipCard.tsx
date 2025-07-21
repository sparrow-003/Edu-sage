'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';
import { useMotion } from '@/components/providers/MotionProvider';

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  autoFlip?: boolean;
  flipTrigger?: 'hover' | 'click';
  direction?: 'horizontal' | 'vertical';
  duration?: number;
}

export function FlipCard({
  front,
  back,
  className = '',
  autoFlip = false,
  flipTrigger = 'click',
  direction = 'horizontal',
  duration = 0.6
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { enableAnimations } = useMotion();

  const handleFlip = () => {
    if (flipTrigger === 'click') {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    if (flipTrigger === 'hover') {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (flipTrigger === 'hover') {
      setIsFlipped(false);
    }
  };

  const rotateAxis = direction === 'horizontal' ? 'rotateY' : 'rotateX';
  const flipAngle = 180;

  const cardVariants = {
    front: {
      [rotateAxis]: 0,
      zIndex: 2,
    },
    back: {
      [rotateAxis]: flipAngle,
      zIndex: 1,
    }
  };

  const flippedVariants = {
    front: {
      [rotateAxis]: -flipAngle,
      zIndex: 1,
    },
    back: {
      [rotateAxis]: 0,
      zIndex: 2,
    }
  };

  if (!enableAnimations) {
    return (
      <div className={`relative ${className}`}>
        {isFlipped ? back : front}
      </div>
    );
  }

  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
      onClick={handleFlip}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial="front"
        animate={isFlipped ? "back" : "front"}
        transition={{ 
          duration,
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          variants={cardVariants}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {front}
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0 w-full h-full backface-hidden"
          variants={flippedVariants}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {back}
        </motion.div>
      </motion.div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-inherit bg-gradient-to-r from-primary-500/10 to-accent-neon/10 opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}