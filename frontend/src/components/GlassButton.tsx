import React from 'react';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3.5 text-base rounded-xl gap-2.5 font-medium',
  };

  const variantClasses = {
    primary: 'glass-button-primary text-white font-semibold',
    secondary: 'glass-button text-slate-100 hover:text-white',
    outline: 'border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400/60',
    danger: 'bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 hover:border-rose-400',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border-transparent',
  };

  return (
    <button
      className={`inline-flex items-center justify-center select-none cursor-pointer transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
