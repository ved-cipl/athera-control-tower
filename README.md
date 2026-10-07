# Athera Group — Phase 1 Operations Control Tower

A clickable, high-fidelity **prototype** of the Phase 1 Operations Control Tower for Athera
Group, an AI-first B2C distribution business. This is a demo only — there is no backend, no
real integrations, and no persistence beyond in-memory session state. All data is realistic
mock/seed data generated on load.

Athera sources raw materials from APAC suppliers and sells finished goods direct to US
consumers through established third-party platforms (e-commerce, payments, CRM, 3PL, and
accounting), which remain the systems of record. This app represents the governed
integration/orchestration and AI layer that sits above those platforms to coordinate and
monitor them — it does not replace any of them.

## Screens

1. **Control Tower** — KPI strip, exception queue, approval queue, trend sparklines
2. **Orders & Fulfillment** — order list with pipeline stepper, filters, cross-system event
   timeline drawer
3. **Supplier & PO Coordination** — supplier roster, PO kanban board, new-PO mock flow
4. **Inventory & Forecasting** — inventory by SKU/warehouse with demand forecast charts,
   AI replenishment recommendations
5. **Customer Service (AI)** — AI-triaged ticket queue with drafted responses, auto-resolved
   vs. routed-to-human views
6. **Reconciliation & Finance** — daily cash reconciliation with drill-in, duplicate-event/retry
   log
7. **Audit & Controls** — role-based access, audit trail, system health panel

Every action button (acknowledge, resolve, approve, reject, accept recommendation, send) makes
an optimistic update to in-memory mock state so the prototype feels interactive end to end.

## Tech

- React + TypeScript + Vite
- Tailwind CSS v4
- React Router (hash routing)
- Recharts for sparklines/trend charts
- lucide-react for icons
- All data lives in `src/lib/mockData.ts` and is held in a React Context store
  (`src/state/store.tsx`) — no network calls anywhere in the app.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```
