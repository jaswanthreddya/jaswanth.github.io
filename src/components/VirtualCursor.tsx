import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';
import { GestureState } from '@/types/mood';

interface VirtualCursorProps {
  gestureState: GestureState;
  isActive: boolean;
}

export function VirtualCursor({ gestureState, isActive }: VirtualCursorProps) {
  const { isHandDetected, smoothCursorPosition, isPinching, isRightClicking, hoveredElement } = gestureState;

  if (!isActive || !isHandDetected) return null;

  const isClickable = hoveredElement?.tagName === 'BUTTON' || 
                      hoveredElement?.tagName === 'A' ||
                      hoveredElement?.getAttribute('role') === 'button' ||
                      hoveredElement?.classList.contains('cursor-pointer');

  return (
    <AnimatePresence>
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        style={{
          left: smoothCursorPosition.x,
          top: smoothCursorPosition.y,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isPinching ? 0.7 : isRightClicking ? 1.2 : 1, 
          opacity: 1 
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {/* Main cursor */}
        <motion.div
          className="relative"
          animate={{
            rotate: isRightClicking ? 15 : 0,
          }}
        >
          <MousePointer2 
            className={`w-6 h-6 drop-shadow-lg transition-colors duration-150 ${
              isPinching 
                ? 'text-green-400' 
                : isRightClicking 
                  ? 'text-orange-400' 
                  : isClickable 
                    ? 'text-primary' 
                    : 'text-white'
            }`}
            style={{
              transform: 'translate(-2px, -2px)',
              filter: `drop-shadow(0 0 ${isPinching || isRightClicking ? '12px' : '6px'} ${
                isPinching ? 'hsl(120, 70%, 50%)' : 
                isRightClicking ? 'hsl(30, 80%, 55%)' : 
                'hsl(270, 60%, 60%)'
              })`,
            }}
          />
          
          {/* Click ripple effect */}
          {(isPinching || isRightClicking) && (
            <motion.div
              className={`absolute top-0 left-0 w-8 h-8 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                isPinching ? 'bg-green-400/30' : 'bg-orange-400/30'
              }`}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              key={Date.now()}
            />
          )}
        </motion.div>

        {/* Hover indicator */}
        {isClickable && !isPinching && !isRightClicking && (
          <motion.div
            className="absolute top-6 left-4 bg-background/90 px-2 py-0.5 rounded text-xs text-primary border border-primary/30"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Pinch to click
          </motion.div>
        )}

        {/* Gesture indicator */}
        <motion.div
          className="absolute -top-6 left-0 text-xs font-medium text-center whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {isPinching && (
            <span className="text-primary">🖱️ Left Click</span>
          )}
          {isRightClicking && (
            <span className="text-accent">🖱️ Right Click</span>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
