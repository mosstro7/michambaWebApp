import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:bg-blue-300',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100 disabled:bg-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm disabled:bg-red-300',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-11 px-6 text-sm font-semibold',
    lg: 'h-14 px-8 text-base font-semibold',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
