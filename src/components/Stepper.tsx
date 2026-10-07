import { Check } from 'lucide-react';
import { cn } from '../lib/utils';
import type { OrderStatus } from '../lib/types';

const steps: OrderStatus[] = ['Order Placed', 'Payment Captured', 'Sent to 3PL', 'Shipped', 'Delivered'];

export function OrderStepper({ status, compact = false }: { status: OrderStatus; compact?: boolean }) {
  if (status === 'Returned/Refunded') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
        <span className="h-2 w-2 rounded-full bg-rose-500" /> Returned / Refunded
      </div>
    );
  }
  const idx = steps.indexOf(status);
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {steps.map((s, i) => (
          <span
            key={s}
            className={cn('h-1.5 w-5 rounded-full', i <= idx ? 'bg-teal-500' : 'bg-navy-100')}
            title={s}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center">
      {steps.map((s, i) => (
        <div key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ring-2',
              i < idx ? 'bg-teal-500 text-white ring-teal-500' :
              i === idx ? 'bg-teal-50 text-teal-700 ring-teal-500' :
              'bg-navy-50 text-navy-300 ring-navy-100',
            )}>
              {i < idx ? <Check size={14} /> : i + 1}
            </div>
            <span className={cn('max-w-[80px] text-center text-[11px] leading-tight', i <= idx ? 'text-navy-700 font-medium' : 'text-navy-300')}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('mx-1 h-0.5 flex-1 rounded', i < idx ? 'bg-teal-500' : 'bg-navy-100')} />
          )}
        </div>
      ))}
    </div>
  );
}
