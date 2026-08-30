import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export interface OfflineBannerProps {
  isOffline: boolean;
  wasOffline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline, wasOffline }) => {
  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs px-4 py-2 text-center flex items-center justify-center gap-2 font-medium"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>You are currently offline. Changes will automatically sync when connection returns.</span>
        </motion.div>
      )}

      {!isOffline && wasOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs px-4 py-2 text-center flex items-center justify-center gap-2 font-medium"
        >
          <Wifi className="w-4 h-4 shrink-0" />
          <span>Back online! Synchronized with cloud storage.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
