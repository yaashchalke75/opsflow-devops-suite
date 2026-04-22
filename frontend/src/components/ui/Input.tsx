import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  ({ label, hint, error, required, className, ...rest }, ref) => (
    <label className="block">
      {label && (
        <span className="label">
          {label} {required && <span className="text-brand-500">*</span>}
        </span>
      )}
      <input
        ref={ref}
        className={cn('input', error && 'border-state-danger/60 focus:ring-state-danger/20', className)}
        {...rest}
      />
      {(hint || error) && (
        <span className={cn('block text-xs mt-1', error ? 'text-state-danger' : 'text-fg-subtle')}>
          {error || hint}
        </span>
      )}
    </label>
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(
  ({ label, hint, error, required, className, ...rest }, ref) => (
    <label className="block">
      {label && (
        <span className="label">
          {label} {required && <span className="text-brand-500">*</span>}
        </span>
      )}
      <textarea
        ref={ref}
        className={cn('input min-h-[96px] resize-y', error && 'border-state-danger/60', className)}
        {...rest}
      />
      {(hint || error) && (
        <span className={cn('block text-xs mt-1', error ? 'text-state-danger' : 'text-fg-subtle')}>
          {error || hint}
        </span>
      )}
    </label>
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(
  ({ label, hint, required, className, children, ...rest }, ref) => (
    <label className="block">
      {label && (
        <span className="label">
          {label} {required && <span className="text-brand-500">*</span>}
        </span>
      )}
      <select ref={ref} className={cn('input pr-8 appearance-none', className)} {...rest}>
        {children}
      </select>
      {hint && <span className="block text-xs mt-1 text-fg-subtle">{hint}</span>}
    </label>
  ),
);
Select.displayName = 'Select';
