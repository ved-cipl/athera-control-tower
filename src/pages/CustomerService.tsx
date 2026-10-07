import { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusPill } from '../components/StatusPill';
import { useStore } from '../state/store';
import { timeAgo } from '../lib/utils';
import type { Ticket } from '../lib/types';
import { Bot, Send, Pencil, UserRound } from 'lucide-react';

type Filter = 'all' | 'auto_resolved' | 'routed_to_human';

const categoryTone: Record<string, 'info' | 'warning' | 'danger' | 'neutral'> = {
  'Shipping delay': 'warning',
  'Return request': 'info',
  'Billing issue': 'danger',
  'Product question': 'neutral',
};

export default function CustomerService() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (filter === 'all') return state.tickets;
    return state.tickets.filter((t) => t.resolution === filter);
  }, [state.tickets, filter]);

  function draftText(t: Ticket) {
    return editing[t.id] ?? t.aiDraft;
  }

  return (
    <Layout title="Customer Service (AI)" description="AI-triaged tickets with drafted responses awaiting review">
      <div className="mb-4 flex items-center gap-2">
        {([
          { key: 'all', label: 'All tickets' },
          { key: 'auto_resolved', label: 'AI auto-resolved' },
          { key: 'routed_to_human', label: 'Routed to human' },
        ] as { key: Filter; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === f.key ? 'bg-navy-900 text-white' : 'border border-navy-200 text-navy-600 hover:bg-navy-50'}`}
          >{f.label}</button>
        ))}
        <span className="ml-auto text-sm text-navy-400">{filtered.length} tickets</span>
      </div>

      <div className="space-y-4">
        {filtered.map((t) => (
          <div key={t.id} className="rounded-xl border border-navy-100 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy-900">{t.id}</span>
                  <StatusPill tone={categoryTone[t.category]}>{t.category}</StatusPill>
                  <StatusPill tone={t.resolution === 'auto_resolved' ? 'success' : 'neutral'}>
                    {t.resolution === 'auto_resolved' ? 'AI auto-resolved' : 'Routed to human'}
                  </StatusPill>
                </div>
                <div className="mt-0.5 text-xs text-navy-400">{t.customer} &middot; {t.channel} &middot; {timeAgo(t.receivedAt)}</div>
              </div>
              <StatusPill tone={t.status === 'sent' ? 'success' : t.status === 'escalated' ? 'warning' : 'neutral'}>{t.status}</StatusPill>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-navy-50 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-navy-500">
                  <UserRound size={13} /> Original message
                </div>
                <p className="text-sm text-navy-700">{t.message}</p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3">
                <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-teal-700">
                  <span className="flex items-center gap-1.5"><Bot size={13} /> AI-drafted response</span>
                  <span>{t.confidence}% confidence</span>
                </div>
                <textarea
                  value={draftText(t)}
                  onChange={(e) => setEditing({ ...editing, [t.id]: e.target.value })}
                  disabled={t.status !== 'open'}
                  rows={4}
                  className="w-full resize-none rounded-md border border-teal-200/70 bg-white p-2 text-sm text-navy-700 outline-none focus:border-teal-400 disabled:bg-white/60 disabled:text-navy-400"
                />
                {t.status === 'open' && (
                  <div className="mt-2 flex justify-end gap-1.5">
                    <button className="flex items-center gap-1 rounded-md border border-navy-200 px-2.5 py-1 text-xs font-medium text-navy-600 hover:bg-navy-50">
                      <Pencil size={11} /> Edit
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'escalate_ticket', id: t.id })}
                      className="rounded-md border border-navy-200 px-2.5 py-1 text-xs font-medium text-navy-600 hover:bg-navy-50"
                    >Route to human</button>
                    <button
                      onClick={() => dispatch({ type: 'send_ticket', id: t.id, finalText: draftText(t) })}
                      className="flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-700"
                    ><Send size={11} /> Approve &amp; Send</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
