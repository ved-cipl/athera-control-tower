import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-navy-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-navy-700">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-navy-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
