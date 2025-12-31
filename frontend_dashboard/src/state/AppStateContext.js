import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createApiClient } from "../api/client";

const AppStateContext = createContext(null);

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function usePersistedTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem("ocean_theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    window.localStorage.setItem("ocean_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return [theme, setTheme];
}

// PUBLIC_INTERFACE
export function AppStateProvider({ children }) {
  /** Provides the global dashboard state: runs, nodes, metrics, alerts, status, and actions. */
  const api = useMemo(() => createApiClient(), []);
  const [theme, setTheme] = usePersistedTheme();

  const [runs, setRuns] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const [selectedSuite, setSelectedSuite] = useState("Quick Smoke");
  const [testStatus, setTestStatus] = useState("idle");
  const [testStartedAt, setTestStartedAt] = useState(null);
  const [suites, setSuites] = useState(["Quick Smoke", "Roaming Stability", "Throughput Sweep", "Latency Baseline", "Packet Loss Stress"]);

  const [timeRange, setTimeRange] = useState("15m");
  const [loading, setLoading] = useState({ runs: false, nodes: false, metrics: false, alerts: false, status: false });
  const [error, setError] = useState(null);

  const refreshInFlight = useRef(false);

  const env = useMemo(() => {
    const featureFlags = safeJsonParse(process.env.REACT_APP_FEATURE_FLAGS || "", {});
    const experimentsEnabled = (process.env.REACT_APP_EXPERIMENTS_ENABLED || "").toLowerCase() === "true";

    return {
      REACT_APP_API_BASE: process.env.REACT_APP_API_BASE || "",
      REACT_APP_WS_URL: process.env.REACT_APP_WS_URL || "",
      REACT_APP_FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL || "",
      REACT_APP_NODE_ENV: process.env.REACT_APP_NODE_ENV || "",
      REACT_APP_FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS || "",
      REACT_APP_EXPERIMENTS_ENABLED: process.env.REACT_APP_EXPERIMENTS_ENABLED || "",
      featureFlagsParsed: featureFlags,
      experimentsEnabled,
    };
  }, []);

  async function safeLoad(key, fn, setter) {
    setLoading((p) => ({ ...p, [key]: true }));
    try {
      const data = await fn();
      setter(data);
      setError(null);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading((p) => ({ ...p, [key]: false }));
    }
  }

  // PUBLIC_INTERFACE
  async function refreshAll() {
    /** Refresh all dashboard datasets. */
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    try {
      await Promise.all([
        safeLoad("status", () => api.getStatus(), (s) => {
          setSuites(s?.suites || suites);
          if (s?.suite) setSelectedSuite(s.suite);
          if (s?.status) setTestStatus(s.status);
          if (s?.startedAt !== undefined) setTestStartedAt(s.startedAt);
        }),
        safeLoad("runs", () => api.getRuns(), setRuns),
        safeLoad("nodes", () => api.getNodes(), setNodes),
        safeLoad("metrics", () => api.getMetrics(timeRange), setMetrics),
        safeLoad("alerts", () => api.getAlerts(), setAlerts),
      ]);
    } finally {
      refreshInFlight.current = false;
    }
  }

  // PUBLIC_INTERFACE
  async function startTest(suite) {
    /** Start a test suite and refresh. */
    const nextSuite = suite || selectedSuite;
    await api.startTest(nextSuite);
    await refreshAll();
  }

  // PUBLIC_INTERFACE
  async function stopTest() {
    /** Stop current test and refresh. */
    await api.stopTest();
    await refreshAll();
  }

  // On mount, hydrate once.
  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Periodic refresh (lightweight) + mock update subscription.
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, 10_000);

    const unsub = api.subscribeMockUpdates(() => {
      // in mock mode, keep UI feeling live by pulling from store
      refreshAll();
    });

    return () => {
      clearInterval(interval);
      unsub?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Optional telemetry websocket hook (stub; no heavy deps).
  useEffect(() => {
    const conn = api.connectTelemetry((msg) => {
      // For now, we only demonstrate the integration point.
      // A real backend can send {type:'metric_update', ...} etc.
      if (msg?.type === "alert") {
        setAlerts((prev) => [msg.payload, ...prev].slice(0, 50));
      }
    });
    return () => conn?.close?.();
  }, [api]);

  const nodesOnlineCount = useMemo(() => nodes.filter((n) => n.connectivity !== "Offline").length, [nodes]);

  const value = useMemo(() => {
    return {
      api,
      env,
      runs,
      nodes,
      metrics,
      alerts,

      status: {
        mockMode: api.mockMode,
        nodeEnv: env.REACT_APP_NODE_ENV,
        selectedSuite,
        suites,
        testStatus,
        testStartedAt,
        nodesOnlineCount,
      },

      ui: { theme, timeRange, loading, error },

      // actions
      refreshAll,
      startTest,
      stopTest,
      setSelectedSuite,
      setTimeRange,
      setTheme,
    };
  }, [
    api,
    env,
    runs,
    nodes,
    metrics,
    alerts,
    selectedSuite,
    suites,
    testStatus,
    testStartedAt,
    nodesOnlineCount,
    theme,
    timeRange,
    loading,
    error,
  ]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAppState() {
  /** Hook to access global application state. */
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
