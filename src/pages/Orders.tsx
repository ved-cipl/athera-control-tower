import { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { OrderStepper } from '../components/Stepper';
import { StatusPill } from '../components/StatusPill';
import { Drawer } from '../components/Drawer';
import { useStore } from '../state/store';
import { formatCurrency, formatDateTime } from '../lib/utils';
import type { Order, OrderStatus } from '../lib/types';
import { AlertTriangle, Search } from 'lucide-react';

const statuses: OrderStatus[] = ['Order Placed', 'Payment Captured', 'Sent to 3PL', 'Shipped', 'Delivered', 'Returned/Refunded'];

function statusTone(status: OrderStatus) {
  switch (status) {
    case 'Delivered': return 'success' as const;
    case 'Returned/Refunded': return 'danger' as const;
    case 'Shipped': return 'info' as const;
    default: return 'neutral' as const;
  }
}

export default function Orders() {
  const { state } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [exceptionOnly, setExceptionOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return state.orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (exceptionOnly && !o.hasException) return false;
      if (query && !(`${o.id} ${o.customer} ${o.sku}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [state.orders, statusFilter, exceptionOnly, query]);

  return (
    <Layout title="Orders & Fulfillment" description="Status pipeline across checkout, payments, 3PL and accounting">
      <div className="mb-4 flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-2.5 text-navy-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, customer, SKU"
            className="w-64 rounded-md border border-navy-200 bg-white py-1.5 pl-8 pr-3 text-sm outline-none focus:border-teal-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-navy-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-teal-400"
        >
          <option value="all">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-navy-600">
          <input type="checkbox" checked={exceptionOnly} onChange={(e) => setExceptionOnly(e.target.checked)} className="rounded border-navy-300 text-teal-600 focus:ring-teal-500" />
          Exceptions only
        </label>
        <span className="ml-auto text-sm text-navy-400">{filtered.length} orders</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-navy-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Pipeline</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium text-right">Total</th>
              <th className="px-3 py-3 font-medium">Placed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} onClick={() => setSelected(o)} className="table-row-hover cursor-pointer border-b border-navy-50 last:border-0">
                <td className="px-5 py-3 font-medium text-navy-800">
                  <div className="flex items-center gap-1.5">
                    {o.hasException && <AlertTriangle size={13} className="text-amber-500" />}
                    {o.id}
                  </div>
                  <div className="text-xs text-navy-400">{o.sku} &middot; qty {o.qty}</div>
                </td>
                <td className="px-3 py-3 text-navy-600">{o.customer}</td>
                <td className="px-3 py-3"><OrderStepper status={o.status} compact /></td>
                <td className="px-3 py-3"><StatusPill tone={statusTone(o.status)}>{o.status}</StatusPill></td>
                <td className="px-3 py-3 text-right text-navy-700">{formatCurrency(o.total)}</td>
                <td className="px-3 py-3 text-navy-400">{formatDateTime(o.placedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.id ?? ''} subtitle={selected ? `${selected.customer} · ${selected.email}` : ''}>
        {selected && (
          <div className="space-y-6">
            <div>
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-navy-400">Fulfillment pipeline</div>
              <OrderStepper status={selected.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-navy-50 p-4 text-sm">
              <div><div className="text-navy-400">SKU</div><div className="font-medium text-navy-800">{selected.sku}</div></div>
              <div><div className="text-navy-400">Quantity</div><div className="font-medium text-navy-800">{selected.qty}</div></div>
              <div><div className="text-navy-400">Order total</div><div className="font-medium text-navy-800">{formatCurrency(selected.total)}</div></div>
              <div><div className="text-navy-400">Placed</div><div className="font-medium text-navy-800">{formatDateTime(selected.placedAt)}</div></div>
            </div>
            <div>
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-navy-400">Cross-system event timeline</div>
              <ol className="space-y-4 border-l border-navy-100 pl-4">
                {selected.events.map((ev) => (
                  <li key={ev.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-500" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-navy-800">{ev.label}</span>
                      <span className="text-xs text-navy-400">{formatDateTime(ev.timestamp)}</span>
                    </div>
                    <div className="text-xs text-navy-500">{ev.detail}</div>
                    <StatusPill tone="neutral" className="mt-1">{ev.system}</StatusPill>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Drawer>
    </Layout>
  );
}
