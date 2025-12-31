import React, { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";
import { SparklineChart } from "../components/charts/SparklineChart";
import { TestControlsPanel } from "../components/test/TestControlsPanel";

function computeNodeHealth(nodes) {
  const online = nodes.filter((n) => n.connectivity === "Online").length;
  const degraded = nodes.filter((n) => n.connectivity === "Degraded").length;
  const offline = nodes.filter((n) => n.connectivity === "Offline").length;
  return { online, degraded, offline, total: nodes.length };
}

function latest(metrics, key, fallback = null) {
  const s = metrics?.[key] || [];
  return s.length ? s[s.length - 1].v : fallback;
}

// PUBLIC_INTERFACE
export function DashboardPage() {
  /** Dashboard overview page with key KPIs + charts + controls. */
  const { nodes, runs, metrics, status } = useAppState();

  const health = useMemo(() => computeNodeHealth(nodes), [nodes]);
  const runningRun = useMemo(() => runs.find((r) => r.status === "running") || null, [runs]);
  const lastRun = useMemo(() => runs[0] || null, [runs]);

  const throughput = latest(metrics, "throughputMbps", 0);
  const latency = latest(metrics, "latencyMs", 0);
  const packetLoss = latest(metrics, "packetLossPct", 0);

  const activeSuite = status.testStatus === "running" ? status.selectedSuite : (runningRun?.suite || lastRun?.suite || "—");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="gridCards">
        <div className="card span3">
          <div className="cardHeader">
            <div className="cardTitle">Active Test</div>
          </div>
          <div className="cardValue">{activeSuite}</div>
          <div className="cardHint">{status.testStatus === "running" ? "Currently running" : "Most recent / selected"}</div>
        </div>

        <div className="card span3">
          <div className="cardHeader">
            <div className="cardTitle">Throughput</div>
          </div>
          <div className="cardValue">{throughput} Mbps</div>
          <div className="cardHint">Latest sample</div>
        </div>

        <div className="card span3">
          <div className="cardHeader">
            <div className="cardTitle">Latency</div>
          </div>
          <div className="cardValue">{latency} ms</div>
          <div className="cardHint">Latest sample</div>
        </div>

        <div className="card span3">
          <div className="cardHeader">
            <div className="cardTitle">Packet Loss</div>
          </div>
          <div className="cardValue">{packetLoss}%</div>
          <div className="cardHint">Latest sample</div>
        </div>

        <div className="card span4">
          <div className="cardHeader">
            <div className="cardTitle">Node Health</div>
          </div>
          <div className="cardValue">
            {health.online}/{health.total} Online
          </div>
          <div className="cardHint">
            {health.degraded} degraded • {health.offline} offline
          </div>
        </div>

        <div className="card span8">
          <div className="cardHeader">
            <div className="cardTitle">Quick Context</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <div className="pill">
              <span className="muted">Mode:</span> <span>{status.mockMode ? "Mock" : "Live"}</span>
            </div>
            <div className="pill">
              <span className="muted">Runs:</span> <span>{runs.length}</span>
            </div>
            <div className="pill">
              <span className="muted">Range:</span> <span>{metrics?.range || "—"}</span>
            </div>
          </div>
        </div>

        <div className="span6">
          <SparklineChart title="Throughput Trend" series={metrics?.throughputMbps || []} unit="Mbps" color="#2563EB" />
        </div>
        <div className="span6">
          <SparklineChart title="Latency Trend" series={metrics?.latencyMs || []} unit="ms" color="#F59E0B" />
        </div>

        <div className="span12">
          <TestControlsPanel />
        </div>
      </div>
    </div>
  );
}
