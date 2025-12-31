import React, { useMemo } from "react";
import { useAppState } from "../../state/AppStateContext";

function formatStartedAt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

// PUBLIC_INTERFACE
export function TestControlsPanel() {
  /** Panel to select suite and start/stop tests; shows current status. */
  const { status, ui, startTest, stopTest, setSelectedSuite } = useAppState();

  const canStart = status.testStatus !== "running";
  const canStop = status.testStatus === "running";

  const statusBadge = useMemo(() => {
    if (status.testStatus === "running") return { cls: "badge ok", label: "Running" };
    if (status.testStatus === "stopping") return { cls: "badge warn", label: "Stopping" };
    return { cls: "badge muted", label: "Idle" };
  }, [status.testStatus]);

  return (
    <section className="card" aria-label="Test controls">
      <div className="cardHeader">
        <div>
          <div className="cardTitle">Test Controls</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
            Start a suite, monitor live metrics, and review results.
          </div>
        </div>
        <span className={statusBadge.cls}>{statusBadge.label}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "end" }}>
        <div>
          <label className="muted" style={{ fontSize: 12, display: "block", marginBottom: 6 }}>
            Suite
          </label>
          <select
            className="select"
            value={status.selectedSuite}
            onChange={(e) => setSelectedSuite(e.target.value)}
            disabled={!canStart}
            aria-label="Select test suite"
            style={{ width: "100%" }}
          >
            {status.suites.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btnPrimary" onClick={() => startTest(status.selectedSuite)} disabled={!canStart || ui.loading.status}>
          Start
        </button>
        <button className="btn btnDanger" onClick={() => stopTest()} disabled={!canStop || ui.loading.status}>
          Stop
        </button>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div className="pill">
          <span className="muted">Selected:</span> <span>{status.selectedSuite}</span>
        </div>
        <div className="pill">
          <span className="muted">Started:</span> <span>{formatStartedAt(status.testStartedAt)}</span>
        </div>
      </div>

      {ui.error ? (
        <div style={{ marginTop: 12 }} className="badge bad" role="alert">
          {ui.error}
        </div>
      ) : null}
    </section>
  );
}
