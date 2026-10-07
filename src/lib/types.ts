export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type ExceptionStatus = 'open' | 'acknowledged' | 'resolved';

export interface ExceptionItem {
  id: string;
  type: string;
  description: string;
  orderId?: string;
  ageMinutes: number;
  severity: Severity;
  assignedTo: string;
  status: ExceptionStatus;
  system: string;
}

export type ApprovalType =
  | 'PO release'
  | 'Refund'
  | 'Supplier onboarding'
  | 'Manual reconciliation override';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  description: string;
  requestedBy: string;
  requestedAt: string;
  amount: number;
  status: ApprovalStatus;
  decidedBy?: string;
  decidedAt?: string;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Payment Captured'
  | 'Sent to 3PL'
  | 'Shipped'
  | 'Delivered'
  | 'Returned/Refunded';

export interface OrderEvent {
  id: string;
  timestamp: string;
  system: string;
  label: string;
  detail: string;
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  placedAt: string;
  status: OrderStatus;
  total: number;
  sku: string;
  qty: number;
  hasException: boolean;
  events: OrderEvent[];
}

export type SupplierOnboarding = 'Active' | 'Pending review' | 'Onboarding' | 'Suspended';

export interface Supplier {
  id: string;
  name: string;
  region: string;
  country: string;
  onboarding: SupplierOnboarding;
  activePOs: number;
  onTimePct: number;
  leadTimeDays: number;
  contact: string;
}

export type POStage = 'Draft' | 'Pending Approval' | 'Approved' | 'In Transit' | 'Received' | 'Reconciled';

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  sku: string;
  qty: number;
  value: number;
  stage: POStage;
  approvalGate: string;
  createdAt: string;
}

export interface ForecastPoint {
  day: number;
  demand: number;
}

export interface InventoryRow {
  id: string;
  sku: string;
  productName: string;
  warehouse: string;
  onHand: number;
  inTransit: number;
  reorderPoint: number;
  forecast30: ForecastPoint[];
  forecast60: ForecastPoint[];
  forecast90: ForecastPoint[];
}

export interface Recommendation {
  id: string;
  sku: string;
  productName: string;
  warehouse: string;
  suggestedQty: number;
  confidence: number;
  rationale: string;
  status: 'pending' | 'accepted' | 'dismissed';
}

export type TicketCategory = 'Shipping delay' | 'Return request' | 'Billing issue' | 'Product question';

export interface Ticket {
  id: string;
  customer: string;
  channel: string;
  category: TicketCategory;
  message: string;
  aiDraft: string;
  confidence: number;
  resolution: 'auto_resolved' | 'routed_to_human';
  status: 'open' | 'sent' | 'escalated';
  receivedAt: string;
}

export type MatchStatus = 'matched' | 'unmatched';

export interface ReconciliationRow {
  id: string;
  date: string;
  gatewayAmount: number;
  ledgerAmount: number;
  bankAmount: number;
  status: MatchStatus;
  mismatchReason?: string;
}

export interface RetryLogRow {
  id: string;
  eventId: string;
  source: string;
  eventType: string;
  dedupStatus: 'suppressed_duplicate' | 'processed' | 'retrying';
  retryCount: number;
  lastAttempt: string;
}

export type Role = 'Approver' | 'Analyst' | 'Admin';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  lastActive: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  before?: string;
  after?: string;
}

export interface SystemHealth {
  id: string;
  name: string;
  category: string;
  status: 'green' | 'amber' | 'red';
  lastSync: string;
  uptimePct: number;
}
