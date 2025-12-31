import React, { useMemo } from "react";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AppStateProvider, useAppState } from "./state/AppStateContext";

import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";

import { DashboardPage } from "./pages/DashboardPage";
import { TestRunsPage } from "./pages/TestRunsPage";
import { NodesPage } from "./pages/NodesPage";
import { MetricsPage } from "./pages/MetricsPage";
import { AlertsPage } from "./pages/AlertsPage";
import { SettingsPage } from "./pages/SettingsPage";

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { status, refreshAll, startTest, stopTest, ui, setTheme } = useAppState();

  const activeNav = useMemo(() => {
    const p = location.pathname || "/dashboard";
    if (p.startsWith("/test-runs")) return "test-runs";
    if (p.startsWith("/nodes")) return "nodes";
    if (p.startsWith("/metrics")) return "metrics";
    if (p.startsWith("/alerts")) return "alerts";
    if (p.startsWith("/settings")) return "settings";
    return "dashboard";
  }, [location.pathname]);

  // Quick actions (Topbar)
  const canStart = status.testStatus !== "running";
  const canStop = status.testStatus === "running";

  return (
    <div className="appRoot" data-theme={ui.theme}>
      <div className="appGradientBg" aria-hidden="true" />

      <div className="appLayout">
        <Sidebar
          activeKey={activeNav}
          onNavigate={(key) => {
            const map = {
              dashboard: "/dashboard",
              "test-runs": "/test-runs",
              nodes: "/nodes",
              metrics: "/metrics",
              alerts: "/alerts",
              settings: "/settings",
            };
            navigate(map[key] || "/dashboard");
          }}
        />

        <div className="appMain">
          <Topbar
            onSearch={(q) => {
              // Minimal "search": route to relevant section.
              const term = (q || "").toLowerCase().trim();
              if (!term) return;
              if (term.includes("node")) navigate("/nodes");
              else if (term.includes("alert")) navigate("/alerts");
              else if (term.includes("metric") || term.includes("lat") || term.includes("through")) navigate("/metrics");
              else if (term.includes("run") || term.includes("test")) navigate("/test-runs");
              else navigate("/dashboard");
            }}
            statusIndicators={[
              { label: "Mode", value: status.mockMode ? "Mock" : "Live", tone: status.mockMode ? "warn" : "ok" },
              { label: "Test", value: status.testStatus, tone: status.testStatus === "running" ? "ok" : "muted" },
              { label: "Nodes", value: String(status.nodesOnlineCount), tone: status.nodesOnlineCount > 0 ? "ok" : "muted" },
            ]}
            actions={[
              { key: "start", label: "Start Test", variant: "primary", disabled: !canStart, onClick: () => startTest(status.selectedSuite) },
              { key: "stop", label: "Stop Test", variant: "danger", disabled: !canStop, onClick: () => stopTest() },
              { key: "refresh", label: "Refresh", variant: "ghost", disabled: false, onClick: () => refreshAll() },
            ]}
            theme={ui.theme}
            onToggleTheme={() => setTheme(ui.theme === "dark" ? "light" : "dark")}
          />

          <main className="appContent" aria-label="Main content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/test-runs" element={<TestRunsPage />} />
              <Route path="/nodes" element={<NodesPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          <footer className="appFooter">
            <div className="muted">
              Wi‑Fi Mesh Performance Analyzer • {status.mockMode ? "Mock data" : "API-backed"} •{" "}
              <span className="mono">REACT_APP_NODE_ENV={status.nodeEnv || "unknown"}</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Root application component with state provider + router. */
  return (
    <AppStateProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
