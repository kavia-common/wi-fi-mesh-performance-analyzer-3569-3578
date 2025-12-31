import React from "react";
import { useAppState } from "../state/AppStateContext";
import { SparklineChart } from "../components/charts/SparklineChart";

// PUBLIC_INTERFACE
export function MetricsPage() {
  /** Metrics charts page with time range filter. */
  const { metrics, ui, setTimeRange, status } = useAppState();

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="h1">Metrics</div>
            <div className="muted" style={{ fontSize: 12 }}>
              Charts rendered with lightweight SVG (no charting libraries). {status.mockMode ? "Mock mode updates every few seconds." : ""}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="muted" style={{ fontSize: 12 }}>
              Range
            </span>
            <select
              className="select"
              value={ui.timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              aria-label="Time range"
            >
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="6h">6h</option>
              <option value="24h">24h</option>
            </select>
          </div>
        </div>

        <div className="muted" style={{ fontSize: 12 }}>
          Current range token: <span className="mono">{metrics?.range || ui.timeRange}</span>
        </div>
      </div>

      <div className="gridCards">
        <div className="span6">
          <SparklineChart title="Throughput" series={metrics?.throughputMbps || []} unit="Mbps" color="#2563EB" />
        </div>
        <div className="span6">
          <SparklineChart title="Latency" series={metrics?.latencyMs || []} unit="ms" color="#F59E0B" />
        </div>
        <div className="span6">
          <SparklineChart title="Jitter" series={metrics?.jitterMs || []} unit="ms" color="#2563EB" />
        </div>
        <div className="span6">
          <SparklineChart title="Packet Loss" series={metrics?.packetLossPct || []} unit="%" color="#EF4444" />
        </div>
      </div>
    </div>
  );
}
