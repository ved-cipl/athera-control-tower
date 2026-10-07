import { randInt, pick, round2 } from './rng';
import type {
  ExceptionItem,
  ApprovalItem,
  Order,
  OrderStatus,
  OrderEvent,
  Supplier,
  PurchaseOrder,
  POStage,
  InventoryRow,
  ForecastPoint,
  Recommendation,
  Ticket,
  ReconciliationRow,
  RetryLogRow,
  UserRow,
  AuditEntry,
  SystemHealth,
} from './types';

const firstNames = [
  'Maria', 'James', 'Wei', 'Priya', 'Carlos', 'Aiko', 'Daniel', 'Fatima', 'Noah', 'Linh',
  'Sofia', 'Ethan', 'Grace', 'Omar', 'Hana', 'Lucas', 'Mei', 'Aaliyah', 'Tomas', 'Yuki',
  'Isabella', 'Ravi', 'Chloe', 'Kenji', 'Amara',
];
const lastNames = [
  'Garcia', 'Nguyen', 'Smith', 'Patel', 'Rossi', 'Tanaka', 'Kim', 'Haddad', 'Brown', 'Tran',
  'Martinez', 'Johnson', 'Suzuki', 'Khan', 'Lopez', 'Chen', 'Williams', 'Park', 'Dubois', 'Costa',
];

function fullName() {
  return `${pick(firstNames)} ${pick(lastNames)}`;
}
function emailFor(name: string) {
  return `${name.toLowerCase().replace(' ', '.')}@mailbox.com`;
}

const staff = [
  'J. Alvarez (Ops)', 'S. Chen (Ops)', 'R. Okafor (Finance)', 'T. Nakamura (Supply)',
  'M. Oduya (CS Lead)', 'K. Fischer (Finance)', 'A. Bennett (Approver)', 'Unassigned',
];

const skus = [
  { sku: 'ATH-SKN-101', name: 'Renew Vitamin C Serum 30ml' },
  { sku: 'ATH-SKN-204', name: 'Barrier Repair Night Cream' },
  { sku: 'ATH-SKN-312', name: 'Clarity Clay Mask' },
  { sku: 'ATH-WEL-050', name: 'Daily Multivitamin (60ct)' },
  { sku: 'ATH-WEL-077', name: 'Omega-3 Fish Oil (90ct)' },
  { sku: 'ATH-HOM-011', name: 'Ceramic Pour-Over Kettle' },
  { sku: 'ATH-HOM-018', name: 'Bamboo Desk Organizer' },
  { sku: 'ATH-ACC-203', name: 'Woven Crossbody Bag' },
  { sku: 'ATH-ACC-240', name: 'Stainless Travel Tumbler 20oz' },
  { sku: 'ATH-SKN-405', name: 'Hydrating Mist Toner' },
  { sku: 'ATH-WEL-091', name: 'Magnesium Sleep Gummies' },
  { sku: 'ATH-HOM-025', name: 'Linen Throw Blanket' },
];

const warehouses = ['Ontario, CA (West)', 'Columbus, OH (Central)', 'Edison, NJ (East)'];

function iso(daysAgo: number, hoursAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

// ---------- Exceptions ----------
const exceptionTypes = [
  { type: 'Payment captured, no 3PL ack', system: 'Payments → 3PL' },
  { type: 'Duplicate order event suppressed', system: 'Checkout' },
  { type: 'SKU mismatch: order vs WMS', system: 'Orchestration → WMS' },
  { type: 'Refund issued, ledger not updated', system: 'Payments → Accounting' },
  { type: 'Tracking number missing after ship confirm', system: '3PL' },
  { type: 'CRM contact sync failed', system: 'CRM' },
  { type: 'Inventory reservation stale', system: 'Orchestration → WMS' },
  { type: 'Address validation failed, order held', system: 'Checkout → 3PL' },
];

export function genExceptions(): ExceptionItem[] {
  const items: ExceptionItem[] = [];
  for (let i = 0; i < 22; i++) {
    const t = pick(exceptionTypes);
    const sev = pick(['critical', 'high', 'high', 'medium', 'medium', 'low'] as const);
    const age = randInt(8, 620);
    items.push({
      id: `EXC-${3000 + i}`,
      type: t.type,
      description: descriptionFor(t.type, age),
      orderId: `ORD-${90000 + randInt(0, 400)}`,
      ageMinutes: age,
      severity: sev,
      assignedTo: pick(staff),
      status: i < 3 ? 'open' : pick(['open', 'open', 'acknowledged', 'resolved'] as const),
      system: t.system,
    });
  }
  return items.sort((a, b) => b.ageMinutes - a.ageMinutes);
}

function descriptionFor(type: string, ageMin: number) {
  const hrs = Math.floor(ageMin / 60);
  switch (type) {
    case 'Payment captured, no 3PL ack':
      return `Payment captured ${hrs}h ago; no fulfillment acknowledgment received from 3PL.`;
    case 'Duplicate order event suppressed':
      return 'Checkout platform emitted a duplicate order-created webhook; auto-deduplicated.';
    case 'SKU mismatch: order vs WMS':
      return 'SKU on the order does not match the SKU confirmed by the warehouse management system.';
    case 'Refund issued, ledger not updated':
      return `Refund processed at the gateway ${hrs}h ago; accounting ledger entry not yet posted.`;
    case 'Tracking number missing after ship confirm':
      return '3PL marked the order as shipped but did not return a tracking number.';
    case 'CRM contact sync failed':
      return 'Customer record failed to sync to CRM after order placement; retry scheduled.';
    case 'Inventory reservation stale':
      return 'Inventory reservation has exceeded its hold window without a fulfillment confirmation.';
    default:
      return 'Address validation failed at checkout; order held pending manual review.';
  }
}

// ---------- Approvals ----------
export function genApprovals(): ApprovalItem[] {
  const types = ['PO release', 'Refund', 'Supplier onboarding', 'Manual reconciliation override'] as const;
  const items: ApprovalItem[] = [];
  for (let i = 0; i < 14; i++) {
    const type = pick(types);
    let amount = 0;
    let description = '';
    if (type === 'PO release') {
      amount = randInt(8, 120) * 1000;
      description = `Release PO to ${pick(['Hanzhou Botanicals Co.', 'Pacific Rim Nutraceuticals', 'Minh Phat Textiles', 'Kaosiung Ceramics Ltd.'])} — exceeds auto-approval threshold`;
    } else if (type === 'Refund') {
      amount = randInt(150, 2200);
      description = `Refund for order ORD-${90000 + randInt(0, 400)} — exceeds $150 auto-approval limit`;
    } else if (type === 'Supplier onboarding') {
      amount = 0;
      description = `Onboard new supplier: ${pick(['Guangzhou Herbal Extracts', 'Bangkok Ceramics Works', 'Mekong Textile Group'])}`;
    } else {
      amount = randInt(300, 9000);
      description = 'Manual override to force-match a reconciliation exception';
    }
    items.push({
      id: `APR-${5000 + i}`,
      type,
      description,
      requestedBy: pick(staff),
      requestedAt: iso(randInt(0, 3), randInt(0, 23)),
      amount,
      status: i < 2 ? 'pending' : pick(['pending', 'pending', 'approved', 'rejected'] as const),
    });
  }
  return items;
}

// ---------- Orders ----------
const orderPipeline: OrderStatus[] = [
  'Order Placed', 'Payment Captured', 'Sent to 3PL', 'Shipped', 'Delivered', 'Returned/Refunded',
];

function genEvents(status: OrderStatus, placedAt: string, hasException: boolean): OrderEvent[] {
  const idx = orderPipeline.indexOf(status);
  const systems = ['Checkout (Shopify Plus)', 'Payment Gateway (Stripe)', 'Orchestration Layer', '3PL (ShipBob)', 'Accounting (NetSuite)'];
  const labels = ['Order placed', 'Payment captured', 'Sent to 3PL', 'Shipment confirmed', 'Delivered', 'Return initiated'];
  const base = new Date(placedAt).getTime();
  const events: OrderEvent[] = [];
  for (let i = 0; i <= idx; i++) {
    events.push({
      id: `EVT-${i}-${Math.round(base)}`,
      timestamp: new Date(base + i * 3600_000 * (i + 1)).toISOString(),
      system: systems[Math.min(i, systems.length - 1)],
      label: labels[i],
      detail: labels[i] === 'Payment captured'
        ? 'Charge succeeded, funds authorized and captured'
        : labels[i] === 'Sent to 3PL'
        ? 'Fulfillment request transmitted to warehouse'
        : labels[i] === 'Shipment confirmed'
        ? `Carrier: ${pick(['UPS', 'FedEx', 'USPS'])}`
        : labels[i],
    });
  }
  if (hasException) {
    events.push({
      id: `EVT-exc-${Math.round(base)}`,
      timestamp: new Date(base + (idx + 1) * 3600_000).toISOString(),
      system: 'Orchestration Layer',
      label: 'Exception raised',
      detail: 'Flagged to Control Tower exception queue for review',
    });
  }
  return events;
}

export function genOrders(): Order[] {
  const orders: Order[] = [];
  for (let i = 0; i < 28; i++) {
    const name = fullName();
    const status = pick(orderPipeline);
    const placedAt = iso(randInt(0, 10), randInt(0, 23));
    const item = pick(skus);
    const hasException = randInt(0, 100) < 22;
    orders.push({
      id: `ORD-${90000 + i}`,
      customer: name,
      email: emailFor(name),
      placedAt,
      status,
      total: round2(randInt(18, 240) + Math.random()),
      sku: item.sku,
      qty: randInt(1, 4),
      hasException,
      events: genEvents(status, placedAt, hasException),
    });
  }
  return orders.sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime());
}

// ---------- Suppliers ----------
const supplierNames = [
  { name: 'Hanzhou Botanicals Co.', country: 'China' },
  { name: 'Pacific Rim Nutraceuticals', country: 'Vietnam' },
  { name: 'Minh Phat Textiles', country: 'Vietnam' },
  { name: 'Kaosiung Ceramics Ltd.', country: 'Taiwan' },
  { name: 'Guangzhou Herbal Extracts', country: 'China' },
  { name: 'Bangkok Ceramics Works', country: 'Thailand' },
  { name: 'Mekong Textile Group', country: 'Vietnam' },
  { name: 'Busan Packaging Solutions', country: 'South Korea' },
  { name: 'Surabaya Natural Oils', country: 'Indonesia' },
  { name: 'Shenzhen Precision Molds', country: 'China' },
  { name: 'Chiang Mai Herbal Co-op', country: 'Thailand' },
  { name: 'Cebu Fiber Craft', country: 'Philippines' },
];

export function genSuppliers(): Supplier[] {
  return supplierNames.map((s, i) => ({
    id: `SUP-${100 + i}`,
    name: s.name,
    region: 'APAC',
    country: s.country,
    onboarding: pick(['Active', 'Active', 'Active', 'Pending review', 'Onboarding', 'Suspended'] as const),
    activePOs: randInt(0, 6),
    onTimePct: randInt(78, 99),
    leadTimeDays: randInt(14, 55),
    contact: `${pick(firstNames)} ${pick(lastNames)} · procurement@${s.name.split(' ')[0].toLowerCase()}.com`,
  }));
}

// ---------- Purchase Orders ----------
const poStages: POStage[] = ['Draft', 'Pending Approval', 'Approved', 'In Transit', 'Received', 'Reconciled'];

export function genPurchaseOrders(suppliers: Supplier[]): PurchaseOrder[] {
  const pos: PurchaseOrder[] = [];
  for (let i = 0; i < 24; i++) {
    const supplier = pick(suppliers);
    const item = pick(skus);
    const qty = randInt(500, 12000);
    const value = round2(qty * (randInt(2, 14) + Math.random()));
    pos.push({
      id: `PO-${7000 + i}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      sku: item.sku,
      qty,
      value,
      stage: pick(poStages),
      approvalGate: value > 50000 ? 'VP Supply Chain' : 'Supply Chain Lead',
      createdAt: iso(randInt(1, 45)),
    });
  }
  return pos;
}

// ---------- Inventory & forecasting ----------
function genForecast(days: number, base: number): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const steps = days === 30 ? 6 : days === 60 ? 8 : 10;
  for (let i = 0; i < steps; i++) {
    const drift = Math.sin(i / 2) * base * 0.12;
    points.push({ day: Math.round((days / steps) * (i + 1)), demand: Math.max(0, Math.round(base + drift + randInt(-base * 0.08, base * 0.08))) });
  }
  return points;
}

export function genInventory(): InventoryRow[] {
  const rows: InventoryRow[] = [];
  let id = 0;
  for (const wh of warehouses) {
    for (const item of skus) {
      if (randInt(0, 100) < 20) continue;
      const base = randInt(40, 260);
      rows.push({
        id: `INV-${id++}`,
        sku: item.sku,
        productName: item.name,
        warehouse: wh,
        onHand: randInt(0, 2400),
        inTransit: randInt(0, 1800),
        reorderPoint: randInt(200, 900),
        forecast30: genForecast(30, base),
        forecast60: genForecast(60, base),
        forecast90: genForecast(90, base),
      });
    }
  }
  return rows;
}

export function genRecommendations(inventory: InventoryRow[]): Recommendation[] {
  return inventory
    .filter((r) => r.onHand + r.inTransit < r.reorderPoint * 1.4)
    .slice(0, 12)
    .map((r, i) => ({
      id: `REC-${900 + i}`,
      sku: r.sku,
      productName: r.productName,
      warehouse: r.warehouse,
      suggestedQty: Math.round((r.reorderPoint - r.onHand - r.inTransit) * 1.6 + randInt(100, 500)),
      confidence: randInt(72, 97),
      rationale: `Projected stockout in ${randInt(7, 21)} days at current demand velocity; APAC lead time ${randInt(18, 40)}d.`,
      status: 'pending' as const,
    }));
}

// ---------- Customer Service ----------
const categories = ['Shipping delay', 'Return request', 'Billing issue', 'Product question'] as const;
const messagesByCategory: Record<string, string[]> = {
  'Shipping delay': [
    "My order ORD-{id} was supposed to arrive 3 days ago. Where is it?",
    'Tracking hasn\'t updated in a week for order ORD-{id}. Is it lost?',
  ],
  'Return request': [
    'I\'d like to return the night cream from order ORD-{id}, it broke me out.',
    'Can I exchange the size on ORD-{id} for a different one?',
  ],
  'Billing issue': [
    'I was charged twice for order ORD-{id}, can you refund the duplicate?',
    'The discount code I used didn\'t apply on ORD-{id}.',
  ],
  'Product question': [
    'Is the Vitamin C serum safe to use with retinol at night?',
    'Does the travel tumbler keep drinks hot for 12 hours?',
  ],
};
const draftsByCategory: Record<string, string[]> = {
  'Shipping delay': [
    'Hi {name}, I\'m sorry for the delay on order {order} — I can see it\'s currently in transit with the carrier and running behind their published ETA. I\'ve escalated with our fulfillment partner and expect movement within 24 hours; I\'ll follow up proactively either way.',
  ],
  'Return request': [
    'Hi {name}, happy to help with that return on {order}. I\'ve started a free return label for you — once it\'s scanned at drop-off, your refund will process automatically within 3-5 business days.',
  ],
  'Billing issue': [
    'Hi {name}, thanks for flagging this — I can confirm order {order} shows a duplicate authorization. I\'ve issued a refund for the extra charge; it should post back to your original payment method within 2-3 business days.',
  ],
  'Product question': [
    'Hi {name}, great question! Yes, this product is formulated to layer safely with most routines — we generally recommend introducing one active at a time and always finishing with SPF in the morning. Happy to suggest a routine order if helpful.',
  ],
};

export function genTickets(): Ticket[] {
  const tickets: Ticket[] = [];
  for (let i = 0; i < 20; i++) {
    const category = pick(categories);
    const name = fullName();
    const orderId = `ORD-${90000 + randInt(0, 400)}`;
    const rawMsg = pick(messagesByCategory[category]).replace('{id}', orderId.replace('ORD-', ''));
    const draft = pick(draftsByCategory[category]).replace('{name}', name.split(' ')[0]).replace('{order}', orderId);
    const resolution = randInt(0, 100) < 55 ? 'auto_resolved' : 'routed_to_human';
    tickets.push({
      id: `TCK-${4000 + i}`,
      customer: name,
      channel: pick(['Email', 'Chat', 'Instagram DM', 'SMS']),
      category,
      message: rawMsg,
      aiDraft: draft,
      confidence: randInt(68, 98),
      resolution,
      status: resolution === 'auto_resolved' ? pick(['sent', 'sent', 'open'] as const) : 'escalated',
      receivedAt: iso(randInt(0, 3), randInt(0, 23)),
    });
  }
  return tickets.sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

// ---------- Reconciliation ----------
export function genReconciliation(): ReconciliationRow[] {
  const rows: ReconciliationRow[] = [];
  for (let i = 0; i < 18; i++) {
    const base = randInt(40000, 180000) + Math.random();
    const isMismatch = randInt(0, 100) < 25;
    const gateway = round2(base);
    const ledger = isMismatch ? round2(base - randInt(50, 900)) : gateway;
    const bank = isMismatch && randInt(0, 1) ? round2(base - randInt(20, 500)) : gateway;
    rows.push({
      id: `REC-${8000 + i}`,
      date: iso(i).slice(0, 10),
      gatewayAmount: gateway,
      ledgerAmount: ledger,
      bankAmount: bank,
      status: gateway === ledger && ledger === bank ? 'matched' : 'unmatched',
      mismatchReason:
        gateway === ledger && ledger === bank
          ? undefined
          : pick([
              'Settlement batch split across two bank deposits',
              'Chargeback reversal not yet posted to ledger',
              'Currency conversion rounding difference',
              'Refund processed after ledger close',
            ]),
    });
  }
  return rows;
}

export function genRetryLog(): RetryLogRow[] {
  const rows: RetryLogRow[] = [];
  const sources = ['Checkout Webhook', 'Payment Gateway', '3PL Callback', 'CRM Sync', 'Accounting Export'];
  const types = ['order.created', 'payment.captured', 'shipment.updated', 'refund.issued', 'contact.synced'];
  for (let i = 0; i < 20; i++) {
    const status = pick(['suppressed_duplicate', 'processed', 'processed', 'retrying'] as const);
    rows.push({
      id: `EVT-${20000 + i}`,
      eventId: `evt_${Math.random().toString(36).slice(2, 10)}`,
      source: pick(sources),
      eventType: pick(types),
      dedupStatus: status,
      retryCount: status === 'retrying' ? randInt(1, 5) : status === 'suppressed_duplicate' ? 0 : randInt(0, 1),
      lastAttempt: iso(0, randInt(0, 23)),
    });
  }
  return rows;
}

// ---------- Audit & Controls ----------
export function genUsers(): UserRow[] {
  const roles = ['Approver', 'Analyst', 'Admin'] as const;
  const names = [
    'J. Alvarez', 'S. Chen', 'R. Okafor', 'T. Nakamura', 'M. Oduya', 'K. Fischer', 'A. Bennett',
    'D. Souza', 'P. Varga', 'L. Ibarra', 'C. Whitfield', 'N. Osei',
  ];
  return names.map((n, i) => ({
    id: `USR-${i}`,
    name: n,
    email: `${n.toLowerCase().replace('. ', '.').replace(' ', '')}@athera.com`,
    role: i < 3 ? 'Admin' : pick(roles),
    lastActive: iso(randInt(0, 6), randInt(0, 23)),
  }));
}

export function genAuditTrail(): AuditEntry[] {
  const rows: AuditEntry[] = [];
  const actions = [
    { action: 'Approved PO release', before: 'Pending Approval', after: 'Approved' },
    { action: 'Rejected refund request', before: 'Pending', after: 'Rejected' },
    { action: 'Approved supplier onboarding', before: 'Pending review', after: 'Active' },
    { action: 'Overrode reconciliation match', before: 'Unmatched', after: 'Matched (manual)' },
    { action: 'Changed user role', before: 'Analyst', after: 'Approver' },
    { action: 'Acknowledged exception', before: 'Open', after: 'Acknowledged' },
    { action: 'Resolved exception', before: 'Acknowledged', after: 'Resolved' },
  ];
  for (let i = 0; i < 26; i++) {
    const a = pick(actions);
    rows.push({
      id: `AUD-${6000 + i}`,
      actor: pick(staff),
      action: a.action,
      target: a.action.includes('PO') ? `PO-${7000 + randInt(0, 23)}`
        : a.action.includes('refund') ? `ORD-${90000 + randInt(0, 400)}`
        : a.action.includes('supplier') ? pick(supplierNames).name
        : a.action.includes('reconciliation') ? `REC-${8000 + randInt(0, 17)}`
        : a.action.includes('role') ? pick(['J. Alvarez', 'S. Chen', 'D. Souza'])
        : `EXC-${3000 + randInt(0, 21)}`,
      timestamp: iso(randInt(0, 10), randInt(0, 23)),
      before: a.before,
      after: a.after,
    });
  }
  return rows.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function genSystemHealth(): SystemHealth[] {
  return [
    { id: 'sys-1', name: 'Shopify Plus', category: 'E-commerce', status: 'green', lastSync: iso(0, 0), uptimePct: 99.98 },
    { id: 'sys-2', name: 'Stripe', category: 'Payments', status: 'green', lastSync: iso(0, 0), uptimePct: 99.99 },
    { id: 'sys-3', name: 'HubSpot', category: 'CRM', status: 'green', lastSync: iso(0, 0), uptimePct: 99.95 },
    { id: 'sys-4', name: 'ShipBob', category: '3PL / Fulfillment', status: 'amber', lastSync: iso(0, 1), uptimePct: 99.62 },
    { id: 'sys-5', name: 'NetSuite', category: 'Accounting', status: 'green', lastSync: iso(0, 0), uptimePct: 99.91 },
  ];
}

// ---------- Trend series for sparklines ----------
export function genTrend(points: number, base: number, volatility: number): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    v = Math.max(0, v + (randInt(-volatility, volatility)));
    out.push(Math.round(v));
  }
  return out;
}
