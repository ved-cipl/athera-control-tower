import { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { KpiCard, TrendCard } from '../components/KpiCard';
import { StatusPill, severityTone } from '../components/StatusPill';
import { Modal } from '../components/Modal';
import { useStore, CURRENT_USER } from '../state/store';
import { genTrend } from '../lib/mockData';
import { formatAge, formatCurrency, timeAgo } from '../lib/utils';
import type { ApprovalItem } from '../lib/types';
import { CheckCircle2, Eye } from 'lucide-react';

const orderTrend = genTrend(14, 420, 30);
const exceptionRateTrend = genTrend(14, 6, 2);
const forecastAccuracyTrend = genTrend(14, 92, 2);

export default function ControlTower() {
  const { state, dispatch } = useStore();
  const [confirm, setConfirm] = useState<{ item: ApprovalItem; decision: 'approved' | 'rejected' } | null>(null);

  const openExceptions = state.exceptions.filter((e) => e.status !== 'resolved');
  const pendingApprovals = state.approvals.filter((a) => a.status === 'pending');
  const ordersInFlight = state.orders.filter((o) => !['Delivered', 'Returned/Refunded'].includes(o.status)).length;
  const openPOs = state.purchaseOrders.filter((p) => !['Reconciled'].includes(p.stage)).length;
  const sameDayReconPct = useMemo(() => {
    const matched = state.reconciliation.filter((r) => r.status === 'matched').length;
    return Math.round((matched / state.reconciliation.length) * 100);
  }, [state.reconciliation]);

  return (
    <Layout title="Control Tower" description="Live orchestration view across every connected system">
      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Orders in flight" value={String(ordersInFlight)} sub="across 3 fulfillment stages" />
        <KpiCard label="Open exceptions" value={String(openExceptions.length)} delta={`${openExceptions.filter(e=>e.severity==='critical').length} critical`} deltaTone={openExceptions.some(e=>e.severity==='critical') ? 'down' : 'neutral'} />
        <KpiCard label="Pending approvals" value={String(pendingApprovals.length)} sub={formatCurrency(pendingApprovals.reduce((s,a)=>s+a.amount,0)) + ' total value'} />
        <KpiCard label="Same-day reconciliation" value={`${sameDayReconPct}%`} delta={sameDayReconPct >= 90 ? 'On target' : 'Below target'} deltaTone={sameDayReconPct >= 90 ? 'up' : 'down'} />
        <KpiCard label="Open supplier POs" value={String(openPOs)} sub={`${state.suppliers.filter(s=>s.onboarding==='Active').length} active suppliers`} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <TrendCard label="Order volume (14d)" value={String(orderTrend[orderTrend.length - 1])} data={orderTrend} color="#0e8585" />
        <TrendCard label="Exception rate (14d)" value={`${exceptionRateTrend[exceptionRateTrend.length - 1]}%`} data={exceptionRateTrend} color="#dc5a3c" />
        <TrendCard label="Forecast accuracy (14d)" value={`${forecastAccuracyTrend[forecastAccuracyTrend.length - 1]}%`} data={forecastAccuracyTrend} color="#294166" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <section className="rounded-xl border border-navy-100 bg-white">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-navy-900">Exception Queue</h2>
            <StatusPill tone="danger" dot>{openExceptions.length} open</StatusPill>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
                <tr>
                  <th className="px-5 py-2 font-medium">Exception</th>
                  <th className="px-3 py-2 font-medium">Age</th>
                  <th className="px-3 py-2 font-medium">Severity</th>
                  <th className="px-3 py-2 font-medium">Assigned</th>
                  <th className="px-3 py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {openExceptions.map((e) => (
                  <tr key={e.id} className="table-row-hover border-b border-navy-50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-navy-800">{e.type}</div>
                      <div className="text-xs text-navy-400">{e.orderId} &middot; {e.system}</div>
                    </td>
                    <td className="px-3 py-3 text-navy-600">{formatAge(e.ageMinutes)}</td>
                    <td className="px-3 py-3"><StatusPill tone={severityTone(e.severity)}>{e.severity}</StatusPill></td>
                    <td className="px-3 py-3 text-navy-500">{e.assignedTo}</td>
                    <td className="px-3 py-3 text-right">
                      {e.status === 'open' && (
                        <button
                          onClick={() => dispatch({ type: 'ack_exception', id: e.id })}
                          className="rounded-md border border-navy-200 px-2.5 py-1 text-xs font-medium text-navy-600 hover:bg-navy-50"
                        >
                          Acknowledge
                        </button>
                      )}
                      {e.status === 'acknowledged' && (
                        <button
                          onClick={() => dispatch({ type: 'resolve_exception', id: e.id })}
                          className="rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-700"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-navy-100 bg-white">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-navy-900">Approval Queue</h2>
            <StatusPill tone="info" dot>{pendingApprovals.length} pending</StatusPill>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
                <tr>
                  <th className="px-5 py-2 font-medium">Request</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {state.approvals.map((a) => (
                  <tr key={a.id} className="table-row-hover border-b border-navy-50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-navy-800">{a.type}</div>
                      <div className="text-xs text-navy-400">{a.description}</div>
                      <div className="mt-1 text-xs text-navy-300">by {a.requestedBy} &middot; {timeAgo(a.requestedAt)}</div>
                    </td>
                    <td className="px-3 py-3 text-navy-600">{a.amount > 0 ? formatCurrency(a.amount) : '—'}</td>
                    <td className="px-3 py-3 text-right">
                      {a.status === 'pending' ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setConfirm({ item: a, decision: 'approved' })}
                            className="rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-700"
                          >Approve</button>
                          <button
                            onClick={() => setConfirm({ item: a, decision: 'rejected' })}
                            className="rounded-md border border-navy-200 px-2.5 py-1 text-xs font-medium text-navy-600 hover:bg-navy-50"
                          >Reject</button>
                        </div>
                      ) : (
                        <StatusPill tone={a.status === 'approved' ? 'success' : 'danger'}>{a.status}</StatusPill>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.decision === 'approved' ? 'Confirm approval' : 'Confirm rejection'}
        footer={
          <>
            <button onClick={() => setConfirm(null)} className="rounded-md border border-navy-200 px-3 py-1.5 text-sm text-navy-600 hover:bg-navy-50">Cancel</button>
            <button
              onClick={() => {
                if (confirm) dispatch({ type: 'decide_approval', id: confirm.item.id, decision: confirm.decision, actor: CURRENT_USER });
                setConfirm(null);
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white ${confirm?.decision === 'approved' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              <CheckCircle2 size={14} /> {confirm?.decision === 'approved' ? 'Approve' : 'Reject'}
            </button>
          </>
        }
      >
        {confirm && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-navy-500"><Eye size={14} /> {confirm.item.id}</div>
            <p><span className="font-medium text-navy-900">{confirm.item.type}:</span> {confirm.item.description}</p>
            {confirm.item.amount > 0 && <p className="text-navy-500">Amount: <span className="font-medium text-navy-800">{formatCurrency(confirm.item.amount)}</span></p>}
            <p className="text-navy-500">Requested by {confirm.item.requestedBy}</p>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
