import React, { useMemo, useState } from "react";
import { useAppState } from "../state/AppStateContext";

function badgeForStatus(status) {
  if (status === "passed") return "badge ok";
  if (status === "warning") return "badge warn";
  if (status === "failed") return "badge bad";
  if (status === "running") return "badge ok";
  return "badge muted";
}

// PUBLIC_INTERFACE
export function TestRunsPage() {
  /** Table of test runs with a detail drawer. */
  const { runs } = useAppState();
  const [selected, setSelected] = useState(null);

  const sorted = useMemo(() => [...runs], [runs]);

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="h1">Test Runs</div>
          <div className="muted" style={{ fontSize: 12 }}>
            Review historical runs and open details.
          </div>
        </div>
      </div>

      <table className="table" aria-label="Test runs table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Suite</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Avg Throughput</th>
            <th>Avg Latency</th>
            <th>Packet Loss</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr
              key={r.id}
              onClick={() => setSelected(r)}
              style={{ cursor: "pointer" }}
              aria-label={`Open details for ${r.id}`}
            >
              <td className="mono">{r.id}</td>
              <td>{r.suite}</td>
              <td>
                <span className={badgeForStatus(r.status)}>{r.status}</span>
              </td>
              <td>{r.duration}</td>
              <td>{r.summary?.avgThroughputMbps ?? "—"} Mbps</td>
              <td>{r.summary?.avgLatencyMs ?? "—"} ms</td>
              <td>{r.summary?.avgPacketLossPct ?? "—"}%</td>
            </tr>
          ))}
          {!sorted.length ? (
            <tr>
              <td colSpan={7} className="muted" style={{ padding: 14 }}>
                No runs yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {selected ? (
        <div
          className="backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Run details drawer"
          onClick={() => setSelected(null)}
        >
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawerHeader">
              <div>
                <div className="h1">Run Details</div>
                <div className="muted mono">{selected.id}</div>
              </div>
              <button className="btn btnGhost" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div className="pill">
                <span className="muted">Suite:</span> <span>{selected.suite}</span>
              </div>
              <div className="pill">
                <span className="muted">Status:</span>{" "}
                <span className={badgeForStatus(selected.status)}>{selected.status}</span>
              </div>
              <div className="pill">
                <span className="muted">Started:</span> <span>{new Date(selected.startedAt).toLocaleString()}</span>
              </div>
              <div className="pill">
                <span className="muted">Ended:</span>{" "}
                <span>{selected.endedAt ? new Date(selected.endedAt).toLocaleString() : "—"}</span>
              </div>

              <div className="card">
                <div className="cardTitle">Average Metrics</div>
                <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="pill">
                    <span className="muted">Throughput:</span> <span>{selected.summary?.avgThroughputMbps} Mbps</span>
                  </div>
                  <div className="pill">
                    <span className="muted">Latency:</span> <span>{selected.summary?.avgLatencyMs} ms</span>
                  </div>
                  <div className="pill">
                    <span className="muted">Jitter:</span> <span>{selected.summary?.avgJitterMs} ms</span>
                  </div>
                  <div className="pill">
                    <span className="muted">Packet loss:</span> <span>{selected.summary?.avgPacketLossPct}%</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="cardTitle">Notes</div>
                <div className="muted" style={{ marginTop: 8, lineHeight: 1.55 }}>
                  {selected.notes || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
