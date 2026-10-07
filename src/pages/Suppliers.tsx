import { useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusPill } from '../components/StatusPill';
import { Modal } from '../components/Modal';
import { useStore, CURRENT_USER } from '../state/store';
import { formatCurrency, formatDate } from '../lib/utils';
import type { POStage, PurchaseOrder } from '../lib/types';
import { Plus } from 'lucide-react';

const stages: POStage[] = ['Draft', 'Pending Approval', 'Approved', 'In Transit', 'Received', 'Reconciled'];

function onboardingTone(status: string) {
  switch (status) {
    case 'Active': return 'success' as const;
    case 'Pending review': return 'info' as const;
    case 'Onboarding': return 'neutral' as const;
    default: return 'danger' as const;
  }
}

export default function Suppliers() {
  const { state, dispatch } = useStore();
  const [newPoOpen, setNewPoOpen] = useState(false);
  const [form, setForm] = useState({ supplierId: state.suppliers[0]?.id ?? '', sku: '', qty: 1000, value: 5000 });
  const [submitted, setSubmitted] = useState(false);

  function submitPo() {
    const supplier = state.suppliers.find((s) => s.id === form.supplierId);
    const po: PurchaseOrder = {
      id: `PO-${8900 + Math.floor(Math.random() * 90)}`,
      supplierId: form.supplierId,
      supplierName: supplier?.name ?? 'Unknown supplier',
      sku: form.sku || 'ATH-NEW-SKU',
      qty: form.qty,
      value: form.value,
      stage: 'Pending Approval',
      approvalGate: form.value > 50000 ? 'VP Supply Chain' : 'Supply Chain Lead',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'create_po', po, actor: CURRENT_USER });
    setSubmitted(true);
  }

  return (
    <Layout title="Supplier & PO Coordination" description="APAC supplier roster and purchase-order lifecycle">
      <section className="mb-8 overflow-hidden rounded-xl border border-navy-100 bg-white">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-navy-900">Suppliers</h2>
          <span className="text-xs text-navy-400">{state.suppliers.length} suppliers &middot; APAC</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
            <tr>
              <th className="px-5 py-2.5 font-medium">Supplier</th>
              <th className="px-3 py-2.5 font-medium">Country</th>
              <th className="px-3 py-2.5 font-medium">Onboarding</th>
              <th className="px-3 py-2.5 font-medium text-right">Active POs</th>
              <th className="px-3 py-2.5 font-medium text-right">On-time %</th>
              <th className="px-3 py-2.5 font-medium text-right">Lead time</th>
            </tr>
          </thead>
          <tbody>
            {state.suppliers.map((s) => (
              <tr key={s.id} className="table-row-hover border-b border-navy-50 last:border-0">
                <td className="px-5 py-2.5">
                  <div className="font-medium text-navy-800">{s.name}</div>
                  <div className="text-xs text-navy-400">{s.contact}</div>
                </td>
                <td className="px-3 py-2.5 text-navy-600">{s.country}</td>
                <td className="px-3 py-2.5"><StatusPill tone={onboardingTone(s.onboarding)}>{s.onboarding}</StatusPill></td>
                <td className="px-3 py-2.5 text-right text-navy-700">{s.activePOs}</td>
                <td className="px-3 py-2.5 text-right text-navy-700">{s.onTimePct}%</td>
                <td className="px-3 py-2.5 text-right text-navy-500">{s.leadTimeDays}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy-900">Purchase Order Board</h2>
          <button
            onClick={() => { setSubmitted(false); setNewPoOpen(true); }}
            className="flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
          >
            <Plus size={14} /> New PO
          </button>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {stages.map((stage) => {
            const items = state.purchaseOrders.filter((p) => p.stage === stage);
            return (
              <div key={stage} className="rounded-xl bg-navy-50/60 p-2.5">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-navy-600">{stage}</span>
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] text-navy-400">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((po) => (
                    <div key={po.id} className="rounded-lg border border-navy-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-navy-800">{po.id}</span>
                        <span className="text-[11px] text-navy-400">{formatDate(po.createdAt)}</span>
                      </div>
                      <div className="mt-1 text-xs text-navy-600">{po.supplierName}</div>
                      <div className="mt-1 text-xs text-navy-400">{po.sku} &middot; qty {po.qty.toLocaleString()}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-navy-900">{formatCurrency(po.value)}</span>
                        <StatusPill tone="neutral" className="text-[10px]">{po.approvalGate}</StatusPill>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="px-1 py-6 text-center text-xs text-navy-300">No POs</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Modal
        open={newPoOpen}
        onClose={() => setNewPoOpen(false)}
        title="New purchase order"
        footer={
          submitted ? (
            <button onClick={() => setNewPoOpen(false)} className="rounded-md bg-navy-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-navy-800">Close</button>
          ) : (
            <>
              <button onClick={() => setNewPoOpen(false)} className="rounded-md border border-navy-200 px-3 py-1.5 text-sm text-navy-600 hover:bg-navy-50">Cancel</button>
              <button onClick={submitPo} className="rounded-md bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700">Submit for approval</button>
            </>
          )
        }
      >
        {submitted ? (
          <div className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">
            PO submitted and routed to the Approval Queue in the Control Tower &mdash; it now appears on the board under <span className="font-medium">Pending Approval</span>.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-500">Supplier</label>
              <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="w-full rounded-md border border-navy-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-400">
                {state.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-navy-500">SKU</label>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="ATH-SKN-101" className="w-full rounded-md border border-navy-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-navy-500">Quantity</label>
                <input type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} className="w-full rounded-md border border-navy-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-navy-500">Value (USD)</label>
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full rounded-md border border-navy-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-400" />
              </div>
            </div>
            <p className="text-xs text-navy-400">Routes to {form.value > 50000 ? 'VP Supply Chain' : 'Supply Chain Lead'} for approval. This is a prototype &mdash; nothing is submitted to a real system.</p>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
