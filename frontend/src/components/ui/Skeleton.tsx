import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-bg-elev',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        'before:animate-[shimmer_1.4s_infinite]',
        className,
      )}
      style={{ animation: undefined }}
    />
  );
}

/* fallback shimmer keyframes injected once */
const style = document.createElement('style');
style.textContent = `@keyframes shimmer { 100% { transform: translateX(100%); } }`;
if (typeof document !== 'undefined' && !document.getElementById('opsflow-shimmer')) {
  style.id = 'opsflow-shimmer';
  document.head.appendChild(style);
}
