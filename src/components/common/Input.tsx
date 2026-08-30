import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixSymbol?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, prefixSymbol, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {prefixSymbol && (
            <span className="absolute left-4 text-slate-400 text-lg font-semibold select-none">
              {prefixSymbol}
            </span>
          )}
          {leftIcon && !prefixSymbol && (
            <span
              onClick={(e) => {
                const container = e.currentTarget.parentElement;
                const inputEl = container?.querySelector('input');
                if (inputEl) {
                  inputEl.focus();
                  if (props.type === 'date' && 'showPicker' in inputEl) {
                    try {
                      (inputEl as any).showPicker();
                    } catch (err) {}
                  }
                }
              }}
              className="absolute left-4 text-slate-400 cursor-pointer"
            >
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            ref={ref}
            onClick={(e) => {
              if (props.type === 'date' && 'showPicker' in e.currentTarget) {
                try {
                  (e.currentTarget as any).showPicker();
                } catch (err) {}
              }
              if (props.onClick) props.onClick(e);
            }}
            className={clsx(
              'w-full bg-slate-950/70 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-base min-h-[48px] px-4 py-3 transition-all focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer',
              prefixSymbol ? 'pl-10' : leftIcon ? 'pl-11' : 'pl-4',
              rightIcon ? 'pr-11' : 'pr-4',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500',
              className
            )}
            {...props}
          />

          {rightIcon && <span className="absolute right-4 text-slate-400">{rightIcon}</span>}
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
