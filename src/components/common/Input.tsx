import React, { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixSymbol?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, prefixSymbol, className, id, type, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === 'password';
    const actualType = isPasswordType ? (showPassword ? 'text' : 'password') : type;
    const hasRightIcon = rightIcon || isPasswordType;

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
                  if (type === 'date' && 'showPicker' in inputEl) {
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
            type={actualType}
            onClick={(e) => {
              if (type === 'date' && 'showPicker' in e.currentTarget) {
                try {
                  (e.currentTarget as any).showPicker();
                } catch (err) {}
              }
              if (props.onClick) props.onClick(e);
            }}
            className={clsx(
              'w-full bg-slate-950/70 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-base min-h-[48px] px-4 py-3 transition-all focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 cursor-pointer',
              prefixSymbol ? 'pl-10' : leftIcon ? 'pl-11' : 'pl-4',
              hasRightIcon ? 'pr-11' : 'pr-4',
              error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500',
              className
            )}
            {...props}
          />

          {rightIcon && <span className="absolute right-4 text-slate-400">{rightIcon}</span>}

          {!rightIcon && isPasswordType && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors p-1"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
