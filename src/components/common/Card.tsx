import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'glow' | 'outline';
  hoverEffect?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverEffect = true,
  children,
  className,
  ...props
}) => {
  const baseClasses = 'relative rounded-3xl p-5 backdrop-blur-xl transition-all duration-200';

  const variantClasses = {
    default: 'bg-slate-900/80 border border-slate-800/80 text-slate-100 shadow-card-dark',
    glass: 'bg-slate-900/60 border border-slate-800/60 backdrop-blur-2xl text-slate-100 shadow-lg',
    glow: 'bg-slate-900/90 border border-indigo-500/30 text-slate-100 shadow-glow-indigo',
    outline: 'bg-transparent border border-slate-800 text-slate-100'
  };

  const hoverClasses = hoverEffect ? 'hover:border-slate-700/80 hover:shadow-xl' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx(baseClasses, variantClasses[variant], hoverClasses, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
