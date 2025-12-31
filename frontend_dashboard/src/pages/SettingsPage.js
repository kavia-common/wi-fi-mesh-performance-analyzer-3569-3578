import React from "react";
import { useAppState } from "../state/AppStateContext";

function Row({ k, v }) {
  return (
    <tr>
      <td className="mono" style={{ width: "44%" }}>{k}</td>
      <td className="mono" style={{ color: "var(--muted)" }}>{v === "" ? "—" : String(v)}</td>
    </tr>
  );
}

// PUBLIC_INTERFACE
export function SettingsPage() {
  /** Read-only environment view + theme toggle. */
  const { env, ui, setTheme } = useAppState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="h1">Settings</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Read-only configuration (from REACT_APP_* env vars) and UI preferences.
            </div>
          </div>

          <button className="btn btnGhost" onClick={() => setTheme(ui.theme === "dark" ? "light" : "dark")}>
            Toggle theme
          </button>
        </div>

        <div className="pill">
          <span className="muted">Theme:</span> <span style={{ fontWeight: 700 }}>{ui.theme}</span>
        </div>
      </div>

      <div className="card">
        <div className="h2">Environment</div>

        <table className="table" aria-label="Environment variables">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value (read-only)</th>
            </tr>
          </thead>
          <tbody>
            <Row k="REACT_APP_API_BASE" v={env.REACT_APP_API_BASE} />
            <Row k="REACT_APP_WS_URL" v={env.REACT_APP_WS_URL} />
            <Row k="REACT_APP_FRONTEND_URL" v={env.REACT_APP_FRONTEND_URL} />
            <Row k="REACT_APP_NODE_ENV" v={env.REACT_APP_NODE_ENV} />
            <Row k="REACT_APP_FEATURE_FLAGS" v={env.REACT_APP_FEATURE_FLAGS} />
            <Row k="REACT_APP_EXPERIMENTS_ENABLED" v={env.REACT_APP_EXPERIMENTS_ENABLED} />
          </tbody>
        </table>

        <div className="muted" style={{ marginTop: 10, fontSize: 12, lineHeight: 1.55 }}>
          Notes:
          <ul style={{ marginTop: 8 }}>
            <li>
              If <span className="mono">REACT_APP_API_BASE</span> is empty, the dashboard runs in <strong>mock mode</strong>.
            </li>
            <li>
              <span className="mono">REACT_APP_WS_URL</span> is optional; the app includes a minimal <span className="mono">WebSocket</span> stub.
            </li>
            <li>
              Feature flags and experiments are displayed only (no behavior changes in this UI).
            </li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="h2">Parsed flags (display only)</div>
        <pre className="mono" style={{ margin: 0, whiteSpace: "pre-wrap", color: "var(--muted)" }}>
{JSON.stringify(
  {
    experimentsEnabled: env.experimentsEnabled,
    featureFlags: env.featureFlagsParsed,
  },
  null,
  2
)}
        </pre>
      </div>
    </div>
  );
}
