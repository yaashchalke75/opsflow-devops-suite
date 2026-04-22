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
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
} as const;

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className={`card w-full ${SIZE[size]} p-0 overflow-hidden`}
          >
            <div className="flex items-start justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                {description && <p className="text-xs text-fg-muted mt-1">{description}</p>}
              </div>
              <button onClick={onClose} className="text-fg-subtle hover:text-fg p-1 rounded-md hover:bg-bg-hover">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-5">{children}</div>
            {footer && (
              <div className="px-5 py-3 border-t border-border bg-bg-soft/50 flex justify-end gap-2">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
