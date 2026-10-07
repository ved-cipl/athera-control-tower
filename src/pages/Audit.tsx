import { Layout } from '../components/Layout';
import { StatusPill } from '../components/StatusPill';
import { useStore } from '../state/store';
import { formatDateTime, timeAgo } from '../lib/utils';

function roleTone(role: string) {
  switch (role) {
    case 'Admin': return 'danger' as const;
    case 'Approver': return 'info' as const;
    default: return 'neutral' as const;
  }
}

export default function Audit() {
  const { state } = useStore();

  return (
    <Layout title="Audit & Controls" description="Role-based access, decision history, and integration health">
      <div className="grid grid-cols-3 gap-5">
        <section className="col-span-1 overflow-hidden rounded-xl border border-navy-100 bg-white">
          <div className="border-b border-navy-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-navy-900">Role-Based Access</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
              <tr>
                <th className="px-5 py-2.5 font-medium">User</th>
                <th className="px-3 py-2.5 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map((u) => (
                <tr key={u.id} className="table-row-hover border-b border-navy-50 last:border-0">
                  <td className="px-5 py-2.5">
                    <div className="font-medium text-navy-800">{u.name}</div>
                    <div className="text-xs text-navy-400">{timeAgo(u.lastActive)}</div>
                  </td>
                  <td className="px-3 py-2.5"><StatusPill tone={roleTone(u.role)}>{u.role}</StatusPill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="col-span-2 overflow-hidden rounded-xl border border-navy-100 bg-white">
          <div className="border-b border-navy-100 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-navy-900">Audit Trail</h2>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Actor</th>
                  <th className="px-3 py-2.5 font-medium">Action</th>
                  <th className="px-3 py-2.5 font-medium">Target</th>
                  <th className="px-3 py-2.5 font-medium">Before &rarr; After</th>
                  <th className="px-3 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {state.auditTrail.map((a) => (
                  <tr key={a.id} className="table-row-hover border-b border-navy-50 last:border-0">
                    <td className="px-5 py-2.5 text-navy-700">{a.actor}</td>
                    <td className="px-3 py-2.5 text-navy-700">{a.action}</td>
                    <td className="px-3 py-2.5 text-navy-500">{a.target}</td>
                    <td className="px-3 py-2.5 text-xs text-navy-500">
                      {a.before && a.after ? <>{a.before} <span className="text-navy-300">&rarr;</span> {a.after}</> : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-navy-400">{formatDateTime(a.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-5 overflow-hidden rounded-xl border border-navy-100 bg-white">
        <div className="border-b border-navy-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-navy-900">System Health</h2>
        </div>
        <div className="grid grid-cols-5 divide-x divide-navy-50">
          {state.systemHealth.map((s) => (
            <div key={s.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy-800">{s.name}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${s.status === 'green' ? 'bg-emerald-500' : s.status === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`} />
              </div>
              <div className="text-xs text-navy-400">{s.category}</div>
              <div className="mt-3 text-xs text-navy-500">Uptime (30d): <span className="font-medium text-navy-700">{s.uptimePct}%</span></div>
              <div className="text-xs text-navy-500">Last sync: <span className="font-medium text-navy-700">{timeAgo(s.lastSync)}</span></div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
