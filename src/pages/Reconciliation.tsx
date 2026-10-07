import { useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusPill } from '../components/StatusPill';
import { Drawer } from '../components/Drawer';
import { useStore, CURRENT_USER } from '../state/store';
import { formatCurrency, formatDate } from '../lib/utils';
import type { ReconciliationRow } from '../lib/types';

export default function Reconciliation() {
  const { state, dispatch } = useStore();
  const [drill, setDrill] = useState<ReconciliationRow | null>(null);

  const unmatchedCount = state.reconciliation.filter((r) => r.status === 'unmatched').length;

  return (
    <Layout title="Reconciliation & Finance" description="Daily cash reconciliation across gateway, ledger and bank">
      <section className="mb-8 overflow-hidden rounded-xl border border-navy-100 bg-white">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-navy-900">Daily Cash Reconciliation</h2>
          <StatusPill tone={unmatchedCount > 0 ? 'warning' : 'success'} dot>{unmatchedCount} unmatched</StatusPill>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
            <tr>
              <th className="px-5 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium text-right">Gateway settlement</th>
              <th className="px-3 py-2.5 font-medium text-right">Accounting ledger</th>
              <th className="px-3 py-2.5 font-medium text-right">Bank</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium text-right">Drill-in</th>
            </tr>
          </thead>
          <tbody>
            {state.reconciliation.map((r) => (
              <tr key={r.id} className="table-row-hover border-b border-navy-50 last:border-0">
                <td className="px-5 py-2.5 text-navy-700">{formatDate(r.date)}</td>
                <td className="px-3 py-2.5 text-right text-navy-700">{formatCurrency(r.gatewayAmount)}</td>
                <td className="px-3 py-2.5 text-right text-navy-700">{formatCurrency(r.ledgerAmount)}</td>
                <td className="px-3 py-2.5 text-right text-navy-700">{formatCurrency(r.bankAmount)}</td>
                <td className="px-3 py-2.5"><StatusPill tone={r.status === 'matched' ? 'success' : 'warning'}>{r.status}</StatusPill></td>
                <td className="px-3 py-2.5 text-right">
                  {r.status === 'unmatched' && (
                    <button onClick={() => setDrill(r)} className="rounded-md border border-navy-200 px-2.5 py-1 text-xs font-medium text-navy-600 hover:bg-navy-50">
                      Investigate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-hidden rounded-xl border border-navy-100 bg-white">
        <div className="border-b border-navy-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-navy-900">Duplicate-Event &amp; Retry Log</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
            <tr>
              <th className="px-5 py-2.5 font-medium">Event</th>
              <th className="px-3 py-2.5 font-medium">Source</th>
              <th className="px-3 py-2.5 font-medium">Dedup status</th>
              <th className="px-3 py-2.5 font-medium text-right">Retries</th>
              <th className="px-3 py-2.5 font-medium">Last attempt</th>
            </tr>
          </thead>
          <tbody>
            {state.retryLog.map((e) => (
              <tr key={e.id} className="table-row-hover border-b border-navy-50 last:border-0">
                <td className="px-5 py-2.5">
                  <div className="font-medium text-navy-800">{e.eventType}</div>
                  <div className="text-xs text-navy-400">{e.eventId}</div>
                </td>
                <td className="px-3 py-2.5 text-navy-600">{e.source}</td>
                <td className="px-3 py-2.5">
                  <StatusPill tone={e.dedupStatus === 'processed' ? 'success' : e.dedupStatus === 'retrying' ? 'warning' : 'neutral'}>
                    {e.dedupStatus.replace('_', ' ')}
                  </StatusPill>
                </td>
                <td className="px-3 py-2.5 text-right text-navy-700">{e.retryCount}</td>
                <td className="px-3 py-2.5 text-navy-400">{formatDate(e.lastAttempt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Drawer open={!!drill} onClose={() => setDrill(null)} title={drill?.id ?? ''} subtitle={drill ? formatDate(drill.date) : ''} widthClass="max-w-md">
        {drill && (
          <div className="space-y-4">
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{drill.mismatchReason}</div>
            <div className="space-y-2 rounded-lg bg-navy-50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-navy-500">Gateway settlement</span><span className="font-medium text-navy-800">{formatCurrency(drill.gatewayAmount)}</span></div>
              <div className="flex justify-between"><span className="text-navy-500">Accounting ledger</span><span className="font-medium text-navy-800">{formatCurrency(drill.ledgerAmount)}</span></div>
              <div className="flex justify-between"><span className="text-navy-500">Bank</span><span className="font-medium text-navy-800">{formatCurrency(drill.bankAmount)}</span></div>
              <div className="flex justify-between border-t border-navy-100 pt-2"><span className="text-navy-500">Variance</span><span className="font-medium text-rose-600">{formatCurrency(drill.gatewayAmount - drill.ledgerAmount)}</span></div>
            </div>
            <button
              onClick={() => { dispatch({ type: 'override_reconciliation', id: drill.id, actor: CURRENT_USER }); setDrill(null); }}
              className="w-full rounded-md bg-navy-900 px-3 py-2 text-sm font-medium text-white hover:bg-navy-800"
            >
              Submit manual reconciliation override
            </button>
            <p className="text-xs text-navy-400">Override requests over $1,000 route to the Control Tower approval queue in a live deployment; this prototype applies it directly and logs it to the audit trail.</p>
          </div>
        )}
      </Drawer>
    </Layout>
  );
}
