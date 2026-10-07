import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import {
  genExceptions, genApprovals, genOrders, genSuppliers, genPurchaseOrders,
  genInventory, genRecommendations, genTickets, genReconciliation, genRetryLog,
  genUsers, genAuditTrail, genSystemHealth,
} from '../lib/mockData';
import type {
  ExceptionItem, ApprovalItem, Order, Supplier, PurchaseOrder, InventoryRow,
  Recommendation, Ticket, ReconciliationRow, RetryLogRow, UserRow, AuditEntry, SystemHealth,
} from '../lib/types';

interface State {
  exceptions: ExceptionItem[];
  approvals: ApprovalItem[];
  orders: Order[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  inventory: InventoryRow[];
  recommendations: Recommendation[];
  tickets: Ticket[];
  reconciliation: ReconciliationRow[];
  retryLog: RetryLogRow[];
  users: UserRow[];
  auditTrail: AuditEntry[];
  systemHealth: SystemHealth[];
}

function initState(): State {
  const suppliers = genSuppliers();
  const inventory = genInventory();
  return {
    exceptions: genExceptions(),
    approvals: genApprovals(),
    orders: genOrders(),
    suppliers,
    purchaseOrders: genPurchaseOrders(suppliers),
    inventory,
    recommendations: genRecommendations(inventory),
    tickets: genTickets(),
    reconciliation: genReconciliation(),
    retryLog: genRetryLog(),
    users: genUsers(),
    auditTrail: genAuditTrail(),
    systemHealth: genSystemHealth(),
  };
}

type Action =
  | { type: 'ack_exception'; id: string }
  | { type: 'resolve_exception'; id: string }
  | { type: 'decide_approval'; id: string; decision: 'approved' | 'rejected'; actor: string }
  | { type: 'accept_recommendation'; id: string; actor: string }
  | { type: 'dismiss_recommendation'; id: string }
  | { type: 'create_po'; po: PurchaseOrder; actor: string }
  | { type: 'move_po_stage'; id: string; stage: PurchaseOrder['stage'] }
  | { type: 'send_ticket'; id: string; finalText: string }
  | { type: 'escalate_ticket'; id: string }
  | { type: 'override_reconciliation'; id: string; actor: string };

function auditRow(actor: string, action: string, target: string, before?: string, after?: string): AuditEntry {
  return {
    id: `AUD-live-${Math.random().toString(36).slice(2, 9)}`,
    actor, action, target, before, after,
    timestamp: new Date().toISOString(),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ack_exception':
      return {
        ...state,
        exceptions: state.exceptions.map((e) => e.id === action.id ? { ...e, status: 'acknowledged' } : e),
      };
    case 'resolve_exception':
      return {
        ...state,
        exceptions: state.exceptions.map((e) => e.id === action.id ? { ...e, status: 'resolved' } : e),
      };
    case 'decide_approval': {
      const item = state.approvals.find((a) => a.id === action.id);
      return {
        ...state,
        approvals: state.approvals.map((a) => a.id === action.id
          ? { ...a, status: action.decision, decidedBy: action.actor, decidedAt: new Date().toISOString() }
          : a),
        auditTrail: item
          ? [auditRow(action.actor, action.decision === 'approved' ? `Approved ${item.type.toLowerCase()}` : `Rejected ${item.type.toLowerCase()}`, item.id, 'Pending', action.decision === 'approved' ? 'Approved' : 'Rejected'), ...state.auditTrail]
          : state.auditTrail,
      };
    }
    case 'accept_recommendation': {
      const rec = state.recommendations.find((r) => r.id === action.id);
      if (!rec) return state;
      const newPo: PurchaseOrder = {
        id: `PO-${7900 + Math.floor(Math.random() * 90)}`,
        supplierId: state.suppliers[0]?.id ?? 'SUP-100',
        supplierName: state.suppliers[Math.floor(Math.random() * state.suppliers.length)]?.name ?? 'TBD Supplier',
        sku: rec.sku,
        qty: rec.suggestedQty,
        value: Math.round(rec.suggestedQty * 6.5),
        stage: 'Draft',
        approvalGate: 'Supply Chain Lead',
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        recommendations: state.recommendations.map((r) => r.id === action.id ? { ...r, status: 'accepted' } : r),
        purchaseOrders: [newPo, ...state.purchaseOrders],
        auditTrail: [auditRow(action.actor, 'Accepted AI replenishment recommendation', rec.sku, 'Recommended', `Draft PO ${newPo.id} created`), ...state.auditTrail],
      };
    }
    case 'dismiss_recommendation':
      return {
        ...state,
        recommendations: state.recommendations.map((r) => r.id === action.id ? { ...r, status: 'dismissed' } : r),
      };
    case 'create_po':
      return {
        ...state,
        purchaseOrders: [action.po, ...state.purchaseOrders],
        auditTrail: [auditRow(action.actor, 'Created draft PO', action.po.id, undefined, 'Draft'), ...state.auditTrail],
      };
    case 'move_po_stage':
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((p) => p.id === action.id ? { ...p, stage: action.stage } : p),
      };
    case 'send_ticket':
      return {
        ...state,
        tickets: state.tickets.map((t) => t.id === action.id ? { ...t, status: 'sent', aiDraft: action.finalText } : t),
      };
    case 'escalate_ticket':
      return {
        ...state,
        tickets: state.tickets.map((t) => t.id === action.id ? { ...t, status: 'escalated', resolution: 'routed_to_human' } : t),
      };
    case 'override_reconciliation': {
      const row = state.reconciliation.find((r) => r.id === action.id);
      return {
        ...state,
        reconciliation: state.reconciliation.map((r) => r.id === action.id
          ? { ...r, status: 'matched', mismatchReason: undefined }
          : r),
        auditTrail: row
          ? [auditRow(action.actor, 'Overrode reconciliation match', row.id, 'Unmatched', 'Matched (manual override)'), ...state.auditTrail]
          : state.auditTrail,
      };
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export const CURRENT_USER = 'A. Bennett (Approver)';
