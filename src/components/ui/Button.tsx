import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
};

export function Button({ className, variant = 'primary', loading = false, disabled, children, ...props }: Props) {
  const styles: Record<NonNullable<Props['variant']>, string> = {
    primary:
      'bg-sky-400 text-slate-950 shadow-[0_0_0_1px_rgba(125,211,252,0.2),0_10px_35px_rgba(56,189,248,0.18)] hover:bg-sky-300',
    secondary: 'bg-white/10 text-slate-100 ring-1 ring-white/10 hover:bg-white/20',
    ghost: 'bg-transparent text-slate-200 hover:bg-white/5',
    danger: 'bg-rose-500/90 text-white hover:bg-rose-400',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
