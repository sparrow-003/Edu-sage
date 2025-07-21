'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMotion } from '@/components/providers/MotionProvider';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterText({
  text,
  speed = 50,
  delay = 0,
  cursor = true,
  onComplete,
  className = ''
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { enableAnimations } = useMotion();

  useEffect(() => {
    if (!enableAnimations) {
      setDisplayText(text);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (!isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
    }, currentIndex === 0 ? delay : speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, delay, isComplete, onComplete, enableAnimations]);

  // Reset when text changes
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <span className={className}>
      {displayText}
      {cursor && enableAnimations && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-current ml-0.5"
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: isComplete ? 0 : Infinity,
            repeatType: "reverse"
          }}
        />
      )}
    </span>
  );
}