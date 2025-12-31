# Frontend Dashboard (Ocean Professional)

A lightweight React dashboard UI for controlling Wi‑Fi mesh test runs, monitoring node health, and visualizing performance metrics.

## Navigation

Sidebar sections:
- Dashboard
- Test Runs
- Nodes
- Metrics
- Alerts
- Settings

Top bar provides quick actions (Start Test / Stop Test / Refresh), search (routes you to relevant sections), and status indicators.

## Mock mode vs live mode

This dashboard is **mock-first**:
- If `REACT_APP_API_BASE` is **empty**, the UI runs in **mock mode** with realistic seeded data and periodic updates.
- If `REACT_APP_API_BASE` is set, the UI will call the backend using `fetch()` against that base URL.

Optional real-time hook:
- If `REACT_APP_WS_URL` is set, the app attempts a native `WebSocket` connection via a minimal `connectTelemetry()` stub (no external libs).

## Environment variables used (read-only display + behavior)

These are read from `.env` and surfaced in Settings:
- `REACT_APP_API_BASE` (controls mock vs live)
- `REACT_APP_WS_URL`
- `REACT_APP_FRONTEND_URL`
- `REACT_APP_NODE_ENV`
- `REACT_APP_FEATURE_FLAGS` (display only)
- `REACT_APP_EXPERIMENTS_ENABLED` (display only)

## Styling

Theme: **Ocean Professional**
- Primary: `#2563EB`
- Accent (secondary/success): `#F59E0B`
- Error: `#EF4444`
- Background: `#f9fafb`
- Surface: `#ffffff`
- Text: `#111827`

Implementation uses **vanilla CSS** with CSS variables and minimal SVG charts (no charting libraries).

## Local dev

```bash
npm start
```

Open http://localhost:3000

Build:
```bash
npm run build
```
