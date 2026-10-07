import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Drawer({ open, onClose, title, subtitle, children, widthClass = 'max-w-xl' }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  widthClass?: string;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <div className="absolute inset-0 bg-navy-950/40" onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full ${widthClass} transform bg-white shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-start justify-between border-b border-navy-100 px-6 py-5">
          <div>
            <h2 className="text-base font-semibold text-navy-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-navy-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-navy-400 hover:bg-navy-50 hover:text-navy-700">
            <X size={18} />
          </button>
        </div>
        <div className="h-[calc(100%-77px)] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
