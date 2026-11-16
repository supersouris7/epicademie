import type { ButtonHTMLAttributes, ReactNode } from 'react';

const VARIANTS = {
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-white',
  surface: 'bg-surface text-ink',
  danger: 'bg-danger text-white',
  success: 'bg-success text-white',
} as const;

const SIZES = {
  md: 'min-h-14 px-5 text-lg',
  lg: 'min-h-16 px-7 text-2xl',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: keyof typeof VARIANTS;
  readonly size?: keyof typeof SIZES;
  readonly children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`cartoon cartoon-press font-display inline-flex items-center justify-center gap-2 tracking-wide disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
