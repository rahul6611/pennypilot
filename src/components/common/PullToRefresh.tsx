import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);
  const THRESHOLD = 70;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 2) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || isRefreshing || window.scrollY > 2) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Apply dampening resistance
      const distance = Math.min(diff * 0.45, 95);
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await Promise.resolve(onRefresh());
      } catch (err) {
        console.error('Pull to refresh error:', err);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progressPct = Math.min(100, Math.round((pullDistance / THRESHOLD) * 100));

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen"
    >
      {/* Pull Indicator Banner */}
      <AnimatePresence>
        {(pullDistance > 5 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-center py-2 text-center pointer-events-none sticky top-14 z-20"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-brand-500/30 backdrop-blur-xl shadow-lg shadow-brand-500/20 text-xs font-semibold text-brand-300">
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`}
                style={{
                  transform: isRefreshing ? undefined : `rotate(${progressPct * 3.6}deg)`
                }}
              />
              <span>
                {isRefreshing
                  ? 'Refreshing Firebase Data...'
                  : pullDistance >= THRESHOLD
                  ? 'Release to Refresh'
                  : 'Pull down to refresh'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content View Container */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.4}px)` : undefined,
          transition: isPullingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
};
