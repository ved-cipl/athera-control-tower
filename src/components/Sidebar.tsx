import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PackageSearch, Factory, Boxes, Headset, ScrollText, ShieldCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', label: 'Control Tower', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders & Fulfillment', icon: PackageSearch },
  { to: '/suppliers', label: 'Supplier & PO Coordination', icon: Factory },
  { to: '/inventory', label: 'Inventory & Forecasting', icon: Boxes },
  { to: '/customer-service', label: 'Customer Service (AI)', icon: Headset },
  { to: '/reconciliation', label: 'Reconciliation & Finance', icon: ScrollText },
  { to: '/audit', label: 'Audit & Controls', icon: ShieldCheck },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-navy-800 bg-navy-900 text-navy-100">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-sm font-bold text-navy-950">A</div>
        <div>
          <div className="text-sm font-semibold text-white">Athera Group</div>
          <div className="text-[11px] text-navy-400">Operations Control Tower</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              isActive
                ? 'bg-navy-800 text-white font-medium'
                : 'text-navy-300 hover:bg-navy-800/60 hover:text-white',
            )}
          >
            <Icon size={17} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mx-3 mb-4 rounded-lg bg-navy-800/60 px-3 py-3 text-[11px] leading-relaxed text-navy-400">
        Phase 1 prototype &middot; mock data only. No live systems are connected.
      </div>
    </aside>
  );
}
