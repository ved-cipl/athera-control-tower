import { ShoppingCart, CreditCard, Users, Truck, Calculator } from 'lucide-react';
import { useStore } from '../state/store';

const iconFor: Record<string, typeof ShoppingCart> = {
  'E-commerce': ShoppingCart,
  Payments: CreditCard,
  CRM: Users,
  '3PL / Fulfillment': Truck,
  Accounting: Calculator,
};

export function TopBar({ title, description }: { title: string; description?: string }) {
  const { state } = useStore();
  return (
    <header className="flex items-center justify-between border-b border-navy-100 bg-white px-8 py-4">
      <div>
        <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
        {description && <p className="text-sm text-navy-400">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full border border-navy-100 bg-navy-50 px-3 py-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-navy-400">Connected systems</span>
          <div className="flex items-center gap-2.5">
            {state.systemHealth.map((s) => {
              const Icon = iconFor[s.category] ?? ShoppingCart;
              return (
                <div key={s.id} className="group relative flex items-center">
                  <span className={`relative flex h-6 w-6 items-center justify-center rounded-md ${
                    s.status === 'green' ? 'bg-emerald-100 text-emerald-700' :
                    s.status === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    <Icon size={13} />
                    <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-white ${
                      s.status === 'green' ? 'bg-emerald-500' : s.status === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                  </span>
                  <div className="pointer-events-none absolute right-0 top-8 z-10 whitespace-nowrap rounded-md bg-navy-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {s.name} &middot; {s.category}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-navy-900 px-3 py-1.5 text-sm text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500 text-xs font-semibold">AB</span>
          A. Bennett
        </div>
      </div>
    </header>
  );
}
