'use client';

import { motion, PanInfo } from 'framer-motion';
import { ReactNode, useState, useRef } from 'react';
import { useMotion } from '@/components/providers/MotionProvider';

interface GlassMorphPanelProps {
  children: ReactNode;
  className?: string;
  draggable?: boolean;
  resizable?: boolean;
  dockable?: boolean;
  initialPosition?: { x: number; y: number };
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onDock?: (edge: 'top' | 'right' | 'bottom' | 'left') => void;
  blur?: number;
  opacity?: number;
}

export function GlassMorphPanel({
  children,
  className = '',
  draggable = false,
  resizable = false,
  dockable = false,
  initialPosition = { x: 0, y: 0 },
  minWidth = 300,
  minHeight = 200,
  maxWidth = 800,
  maxHeight = 600,
  onDock,
  blur = 20,
  opacity = 0.8
}: GlassMorphPanelProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState({ width: minWidth, height: minHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { enableAnimations } = useMotion();

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (dockable && onDock) {
      const { x, y } = info.point;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const threshold = 50;

      // Check for docking zones
      if (x < threshold) {
        onDock('left');
      } else if (x > windowWidth - threshold) {
        onDock('right');
      } else if (y < threshold) {
        onDock('top');
      } else if (y > windowHeight - threshold) {
        onDock('bottom');
      }
    }
  };

  const glassStyles = {
    background: `rgba(38, 38, 38, ${opacity})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  };

  const motionProps = enableAnimations ? {
    drag: draggable,
    dragMomentum: false,
    dragElastic: 0.1,
    dragConstraints: {
      left: -window.innerWidth / 2,
      right: window.innerWidth / 2,
      top: -window.innerHeight / 2,
      bottom: window.innerHeight / 2,
    },
    onDragStart: () => setIsDragging(true),
    onDragEnd: handleDragEnd,
    whileHover: { 
      scale: 1.02,
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
    },
    whileDrag: { 
      scale: 1.05,
      rotate: 2,
      boxShadow: '0 16px 50px rgba(0, 0, 0, 0.5)'
    },
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -20 },
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 30 
    }
  } : {};

  return (
    <motion.div
      ref={panelRef}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        ...glassStyles,
        width: size.width,
        height: size.height,
        x: position.x,
        y: position.y,
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
      }}
      {...motionProps}
    >
      {/* Drag Handle */}
      {draggable && (
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing">
          <div className="w-8 h-1 bg-neutral-500 rounded-full" />
        </div>
      )}

      {/* Content */}
      <div className={`${draggable ? 'pt-8' : ''} h-full overflow-auto`}>
        {children}
      </div>

      {/* Resize Handles */}
      {resizable && (
        <>
          {/* Corner resize handles */}
          <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
            <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-neutral-400" />
          </div>
          
          {/* Edge resize handles */}
          <div className="absolute top-0 right-0 w-2 h-full cursor-e-resize" />
          <div className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize" />
        </>
      )}

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-inherit bg-gradient-to-r from-primary-500/10 to-accent-neon/10 opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles effect */}
      {enableAnimations && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}