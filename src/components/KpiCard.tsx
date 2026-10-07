import { Sparkline } from './Sparkline';
import { cn } from '../lib/utils';

export function KpiCard({ label, value, delta, deltaTone = 'neutral', sub }: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'up' | 'down' | 'neutral';
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-navy-900">{value}</span>
        {delta && (
          <span className={cn(
            'text-xs font-medium',
            deltaTone === 'up' ? 'text-emerald-600' : deltaTone === 'down' ? 'text-rose-600' : 'text-navy-400',
          )}>{delta}</span>
        )}
      </div>
      {sub && <div className="mt-1 text-xs text-navy-400">{sub}</div>}
    </div>
  );
}

export function TrendCard({ label, value, data, color }: { label: string; value: string; data: number[]; color: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-navy-400">{label}</div>
        <div className="text-base font-semibold text-navy-900">{value}</div>
      </div>
      <div className="mt-2">
        <Sparkline data={data} color={color} />
      </div>
    </div>
  );
}
