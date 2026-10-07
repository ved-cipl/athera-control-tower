import { useState } from 'react';
import { Layout } from '../components/Layout';
import { StatusPill } from '../components/StatusPill';
import { MiniForecastChart } from '../components/Sparkline';
import { useStore, CURRENT_USER } from '../state/store';
import { cn } from '../lib/utils';
import { Sparkles, Check, X } from 'lucide-react';

type Horizon = 30 | 60 | 90;

export default function Inventory() {
  const { state, dispatch } = useStore();
  const [horizon, setHorizon] = useState<Horizon>(30);

  const forecastKey = horizon === 30 ? 'forecast30' : horizon === 60 ? 'forecast60' : 'forecast90';

  return (
    <Layout title="Inventory & Forecasting" description="On-hand, in-transit, and AI demand forecasts by SKU / warehouse">
      <section className="mb-6 overflow-hidden rounded-xl border border-navy-100 bg-white">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-navy-900">Inventory by SKU / Warehouse</h2>
          <div className="flex items-center gap-1 rounded-md bg-navy-50 p-1 text-xs">
            {([30, 60, 90] as Horizon[]).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={cn('rounded px-2.5 py-1 font-medium', horizon === h ? 'bg-white text-navy-800 shadow-sm' : 'text-navy-400')}
              >{h}d forecast</button>
            ))}
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-400">
            <tr>
              <th className="px-5 py-2.5 font-medium">SKU</th>
              <th className="px-3 py-2.5 font-medium">Warehouse</th>
              <th className="px-3 py-2.5 font-medium text-right">On hand</th>
              <th className="px-3 py-2.5 font-medium text-right">In transit</th>
              <th className="px-3 py-2.5 font-medium text-right">Reorder point</th>
              <th className="px-3 py-2.5 font-medium">Demand forecast ({horizon}d)</th>
            </tr>
          </thead>
          <tbody>
            {state.inventory.map((row) => {
              const low = row.onHand + row.inTransit < row.reorderPoint;
              return (
                <tr key={row.id} className="table-row-hover border-b border-navy-50 last:border-0">
                  <td className="px-5 py-2.5">
                    <div className="font-medium text-navy-800">{row.sku}</div>
                    <div className="text-xs text-navy-400">{row.productName}</div>
                  </td>
                  <td className="px-3 py-2.5 text-navy-600">{row.warehouse}</td>
                  <td className="px-3 py-2.5 text-right text-navy-700">{row.onHand.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-navy-500">{row.inTransit.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={low ? 'font-medium text-rose-600' : 'text-navy-500'}>{row.reorderPoint.toLocaleString()}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="h-9 w-32">
                      <MiniForecastChart data={row[forecastKey]} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-navy-100 bg-white">
        <div className="flex items-center gap-2 border-b border-navy-100 px-5 py-3.5">
          <Sparkles size={15} className="text-teal-600" />
          <h2 className="text-sm font-semibold text-navy-900">Replenishment Recommendations</h2>
          <span className="ml-auto text-xs text-navy-400">AI-suggested purchase quantities based on demand velocity &amp; lead time</span>
        </div>
        <div className="divide-y divide-navy-50">
          {state.recommendations.map((rec) => (
            <div key={rec.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy-800">{rec.sku}</span>
                  <span className="text-xs text-navy-400">{rec.productName} &middot; {rec.warehouse}</span>
                </div>
                <div className="mt-0.5 text-xs text-navy-500">{rec.rationale}</div>
              </div>
              <div className="w-28 text-right">
                <div className="text-sm font-semibold text-navy-900">{rec.suggestedQty.toLocaleString()} units</div>
                <div className="text-xs text-navy-400">suggested PO qty</div>
              </div>
              <div className="w-28">
                <div className="mb-1 flex items-center justify-between text-[11px] text-navy-400">
                  <span>Confidence</span><span>{rec.confidence}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-navy-100">
                  <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${rec.confidence}%` }} />
                </div>
              </div>
              <div className="w-40 text-right">
                {rec.status === 'pending' ? (
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => dispatch({ type: 'accept_recommendation', id: rec.id, actor: CURRENT_USER })}
                      className="flex items-center gap-1 rounded-md bg-teal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-teal-700"
                    ><Check size={12} /> Accept &rarr; Draft PO</button>
                    <button
                      onClick={() => dispatch({ type: 'dismiss_recommendation', id: rec.id })}
                      className="rounded-md border border-navy-200 p-1.5 text-navy-400 hover:bg-navy-50"
                    ><X size={12} /></button>
                  </div>
                ) : (
                  <StatusPill tone={rec.status === 'accepted' ? 'success' : 'neutral'}>
                    {rec.status === 'accepted' ? 'Draft PO created' : 'Dismissed'}
                  </StatusPill>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
