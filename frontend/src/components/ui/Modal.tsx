import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE = {
  sm: 'md:max-w-sm',
  md: 'md:max-w-lg',
  lg: 'md:max-w-2xl',
  xl: 'md:max-w-4xl',
} as const;

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-end md:place-items-center p-0 md:p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className={`card w-full ${SIZE[size]} p-0 overflow-hidden rounded-t-2xl md:rounded-xl max-h-[92vh] md:max-h-[85vh] flex flex-col`}
          >
            <div className="flex items-start justify-between px-4 md:px-5 py-3.5 md:py-4 border-b border-border shrink-0">
              <div className="min-w-0 flex-1 pr-3">
                <h2 className="text-base font-semibold truncate">{title}</h2>
                {description && <p className="text-xs text-fg-muted mt-1 line-clamp-2">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 grid place-items-center text-fg-subtle hover:text-fg active:bg-bg-hover rounded-md shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 md:px-5 py-4 md:py-5 overflow-y-auto flex-1">{children}</div>
            {footer && (
              <div className="px-4 md:px-5 py-3 border-t border-border bg-bg-soft/50 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 shrink-0">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
