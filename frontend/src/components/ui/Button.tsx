import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const sizeMap: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-4 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...rest }, ref) => {
    const base =
      variant === 'primary' ? 'btn-primary'
      : variant === 'secondary' ? 'btn-secondary'
      : variant === 'danger' ? 'btn-danger'
      : 'btn-ghost';
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, sizeMap[size], className)}
        {...rest}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
