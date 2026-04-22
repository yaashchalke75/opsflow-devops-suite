import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

export function SearchInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-subtle" />
      <input
        className="input pl-8 h-9"
        placeholder="Search..."
        {...rest}
      />
    </div>
  );
}
