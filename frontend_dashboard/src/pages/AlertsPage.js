import React, { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";

function badgeForSeverity(sev) {
  if (sev === "critical") return "badge bad";
  if (sev === "warning") return "badge warn";
  return "badge muted";
}

// PUBLIC_INTERFACE
export function AlertsPage() {
  /** Alerts feed list with severity and timestamps. */
  const { alerts } = useAppState();

  const sorted = useMemo(() => {
    const arr = [...alerts];
    arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return arr;
  }, [alerts]);

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="h1">Alerts</div>
          <div className="muted" style={{ fontSize: 12 }}>
            System events and detected anomalies.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {sorted.map((a) => (
          <div key={a.id} className="card" style={{ padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span className={badgeForSeverity(a.severity)}>{a.severity}</span>
              <span className="muted mono" style={{ fontSize: 12 }}>
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop: 8, fontWeight: 700 }}>{a.message}</div>
            <div className="muted mono" style={{ marginTop: 6, fontSize: 12 }}>
              {a.id}
            </div>
          </div>
        ))}

        {!sorted.length ? <div className="muted">No alerts.</div> : null}
      </div>
    </div>
  );
}
