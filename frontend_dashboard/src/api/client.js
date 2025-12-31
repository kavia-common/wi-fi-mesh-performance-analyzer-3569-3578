/**
 * Lightweight API client with mock-first behavior.
 * - If REACT_APP_API_BASE is empty: returns seeded realistic data + simulates updates.
 * - If REACT_APP_API_BASE is provided: uses fetch() against that base.
 *
 * No external libs.
 */

const API_BASE = (process.env.REACT_APP_API_BASE || "").trim();
const WS_URL = (process.env.REACT_APP_WS_URL || "").trim();

function nowIso() {
  return new Date().toISOString();
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/** Deterministic pseudo-random generator (seeded). */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededPick(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function msSince(iso) {
  return Date.now() - new Date(iso).getTime();
}

function formatDuration(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}m ${String(ss).padStart(2, "0")}s`;
}

/**
 * Mock data store lives in-module so it survives across calls.
 */
const mockStore = (() => {
  const rand = mulberry32(35693578);
  const suites = ["Quick Smoke", "Roaming Stability", "Throughput Sweep", "Latency Baseline", "Packet Loss Stress"];

  const nodes = Array.from({ length: 9 }).map((_, i) => {
    const online = rand() > 0.08;
    const lastHeartbeat = new Date(Date.now() - Math.floor(rand() * 45_000)).toISOString();
    return {
      id: `node-${i + 1}`,
      name: `Mesh Node ${i + 1}`,
      role: i === 0 ? "Gateway" : "Repeater",
      rssi: clamp(Math.round(-48 - rand() * 35), -95, -30),
      snr: clamp(Math.round(18 + rand() * 22), 5, 45),
      linkRateMbps: clamp(Math.round(180 + rand() * 520), 24, 1200),
      batteryPct: clamp(Math.round(35 + rand() * 65), 0, 100),
      power: seededPick(rand, ["AC", "Battery"]),
      connectivity: online ? seededPick(rand, ["Online", "Degraded"]) : "Offline",
      lastHeartbeat,
    };
  });

  const runs = Array.from({ length: 12 }).map((_, idx) => {
    const finished = rand() > 0.25;
    const start = Date.now() - (idx + 1) * 55 * 60_000 - Math.floor(rand() * 20_000);
    const end = finished ? start + (10 + Math.floor(rand() * 32)) * 60_000 : null;
    const status = finished ? seededPick(rand, ["passed", "passed", "warning", "failed"]) : "running";
    const durationMs = (end || Date.now()) - start;

    const avgThroughput = clamp(Math.round(240 + rand() * 520), 40, 900);
    const avgLatency = clamp(Math.round(8 + rand() * 38), 3, 120);
    const avgJitter = clamp(Math.round(1 + rand() * 12), 1, 60);
    const avgPacketLoss = clamp(Number((rand() * 2.4).toFixed(2)), 0, 12);

    return {
      id: `run-${1000 + idx}`,
      suite: seededPick(rand, suites),
      status,
      startedAt: new Date(start).toISOString(),
      endedAt: end ? new Date(end).toISOString() : null,
      duration: formatDuration(durationMs),
      summary: {
        avgThroughputMbps: avgThroughput,
        avgLatencyMs: avgLatency,
        avgJitterMs: avgJitter,
        avgPacketLossPct: avgPacketLoss,
      },
      notes: seededPick(rand, [
        "Baseline run across three rooms.",
        "Roaming path included upstairs hallway.",
        "High utilization on channel 36 observed.",
        "Client device moved every 30 seconds.",
        "Power-save mode enabled on two repeaters.",
      ]),
    };
  });

  function makeSeries({ points = 36, base = 450, noise = 90, min = 0, max = 1000 }) {
    const t0 = Date.now() - points * 30_000;
    return Array.from({ length: points }).map((_, i) => {
      const x = new Date(t0 + i * 30_000).toISOString();
      const v = clamp(Math.round(base + (rand() - 0.5) * noise * 2), min, max);
      return { t: x, v };
    });
  }

  const metrics = {
    throughputMbps: makeSeries({ base: 520, noise: 140, min: 60, max: 980 }),
    latencyMs: makeSeries({ base: 18, noise: 10, min: 5, max: 90 }),
    jitterMs: makeSeries({ base: 3, noise: 4, min: 1, max: 35 }),
    packetLossPct: makeSeries({ base: 0.8, noise: 0.8, min: 0, max: 8 }),
  };

  const alerts = Array.from({ length: 9 }).map((_, i) => {
    const severity = seededPick(rand, ["info", "warning", "critical"]);
    return {
      id: `alert-${i + 1}`,
      severity,
      message: seededPick(rand, [
        "Node heartbeat delayed beyond threshold.",
        "Packet loss spike detected on backhaul.",
        "Latency exceeded baseline by >20ms.",
        "Channel utilization high; consider DFS.",
        "Roaming event failed; client re-auth needed.",
      ]),
      createdAt: new Date(Date.now() - Math.floor(rand() * 6 * 60 * 60_000)).toISOString(),
    };
  });

  const state = {
    suites,
    nodes,
    runs,
    metrics,
    alerts,
    currentTest: {
      suite: suites[0],
      status: "idle", // idle | running | stopping
      startedAt: null,
    },
  };

  function tick() {
    // Update nodes heartbeat + small metric drift.
    for (const n of state.nodes) {
      const offline = n.connectivity === "Offline";
      if (!offline) {
        if (Math.random() < 0.02) n.connectivity = "Degraded";
        else if (Math.random() < 0.06) n.connectivity = "Online";
        n.rssi = clamp(n.rssi + Math.round((Math.random() - 0.5) * 4), -95, -30);
        n.snr = clamp(n.snr + Math.round((Math.random() - 0.5) * 3), 5, 45);
        n.linkRateMbps = clamp(n.linkRateMbps + Math.round((Math.random() - 0.5) * 30), 24, 1200);
        n.lastHeartbeat = nowIso();
      } else if (Math.random() < 0.03) {
        n.connectivity = "Online";
        n.lastHeartbeat = nowIso();
      }
      if (n.power === "Battery") {
        n.batteryPct = clamp(n.batteryPct - (Math.random() < 0.30 ? 1 : 0), 0, 100);
      }
    }

    // If test is running, append metrics points and adjust.
    const isRunning = state.currentTest.status === "running";
    if (isRunning) {
      const append = (arr, v) => {
        arr.push({ t: nowIso(), v });
        while (arr.length > 60) arr.shift();
      };

      const lastTp = state.metrics.throughputMbps.at(-1)?.v || 500;
      const lastLat = state.metrics.latencyMs.at(-1)?.v || 18;
      const lastJit = state.metrics.jitterMs.at(-1)?.v || 3;
      const lastPl = state.metrics.packetLossPct.at(-1)?.v || 0.8;

      append(state.metrics.throughputMbps, clamp(Math.round(lastTp + (Math.random() - 0.5) * 60), 40, 980));
      append(state.metrics.latencyMs, clamp(Math.round(lastLat + (Math.random() - 0.5) * 6), 5, 110));
      append(state.metrics.jitterMs, clamp(Math.round(lastJit + (Math.random() - 0.5) * 3), 1, 50));
      append(state.metrics.packetLossPct, clamp(Number((lastPl + (Math.random() - 0.5) * 0.35).toFixed(2)), 0, 12));
    }

    // Occasional alerts
    if (Math.random() < 0.05) {
      const sev = seededPick(rand, ["info", "warning", "critical"]);
      state.alerts.unshift({
        id: `alert-${Date.now()}`,
        severity: sev,
        message: seededPick(rand, [
          "Backhaul RSSI drop detected.",
          "Node reconnected after brief outage.",
          "Latency variance increased significantly.",
          "High retry rate observed; check interference.",
        ]),
        createdAt: nowIso(),
      });
      state.alerts = state.alerts.slice(0, 30);
    }

    // If run is running, update duration and a couple averages.
    const running = state.runs.find((r) => r.status === "running");
    if (running) {
      const dur = msSince(running.startedAt);
      running.duration = formatDuration(dur);
      running.summary.avgThroughputMbps = clamp(running.summary.avgThroughputMbps + Math.round((Math.random() - 0.5) * 20), 40, 980);
      running.summary.avgLatencyMs = clamp(running.summary.avgLatencyMs + Math.round((Math.random() - 0.5) * 2), 5, 120);
    }
  }

  return { state, tick };
})();

let mockIntervalHandle = null;
const mockSubscribers = new Set();

function ensureMockTicker() {
  if (mockIntervalHandle) return;
  mockIntervalHandle = setInterval(() => {
    mockStore.tick();
    for (const fn of mockSubscribers) {
      try {
        fn();
      } catch {
        // ignore subscriber errors
      }
    }
  }, 2500);
}

async function httpJson(path, opts = {}) {
  const url = `${API_BASE.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}${text ? `: ${text}` : ""}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// PUBLIC_INTERFACE
export function createApiClient() {
  /** Factory for API client. Reads env vars; exposes a consistent interface. */
  const mockMode = !API_BASE;

  return {
    mockMode,
    apiBase: API_BASE,
    wsUrl: WS_URL,

    // PUBLIC_INTERFACE
    async getRuns() {
      /** Get recent test runs. */
      if (mockMode) return [...mockStore.state.runs];
      return httpJson("/runs");
    },

    // PUBLIC_INTERFACE
    async getNodes() {
      /** Get mesh nodes and their health/telemetry snapshot. */
      if (mockMode) return [...mockStore.state.nodes];
      return httpJson("/nodes");
    },

    // PUBLIC_INTERFACE
    async getMetrics(range = "15m") {
      /** Get metrics series; range is a friendly token (e.g., 15m, 1h, 6h). */
      if (mockMode) {
        // Range is currently informational in mock; could be used to slice series later.
        return { ...mockStore.state.metrics, range };
      }
      return httpJson(`/metrics?range=${encodeURIComponent(range)}`);
    },

    // PUBLIC_INTERFACE
    async getAlerts() {
      /** Get alerts feed. */
      if (mockMode) return [...mockStore.state.alerts];
      return httpJson("/alerts");
    },

    // PUBLIC_INTERFACE
    async getStatus() {
      /** Get current test status / selected suite. */
      if (mockMode) return { ...mockStore.state.currentTest, suites: [...mockStore.state.suites] };
      return httpJson("/status");
    },

    // PUBLIC_INTERFACE
    async startTest(suite) {
      /** Start a test suite. */
      if (mockMode) {
        ensureMockTicker();
        mockStore.state.currentTest.status = "running";
        mockStore.state.currentTest.suite = suite || mockStore.state.currentTest.suite;
        mockStore.state.currentTest.startedAt = nowIso();

        // Mark one run running
        mockStore.state.runs.unshift({
          id: `run-${Date.now()}`,
          suite: mockStore.state.currentTest.suite,
          status: "running",
          startedAt: mockStore.state.currentTest.startedAt,
          endedAt: null,
          duration: "0m 00s",
          summary: {
            avgThroughputMbps: 520,
            avgLatencyMs: 18,
            avgJitterMs: 3,
            avgPacketLossPct: 0.8,
          },
          notes: "Mock run started from dashboard controls.",
        });
        mockStore.state.runs = mockStore.state.runs.slice(0, 25);

        return { ok: true };
      }
      return httpJson("/tests/start", { method: "POST", body: JSON.stringify({ suite }) });
    },

    // PUBLIC_INTERFACE
    async stopTest() {
      /** Stop current running test. */
      if (mockMode) {
        mockStore.state.currentTest.status = "idle";
        mockStore.state.currentTest.startedAt = null;

        // finalize running run (if any)
        const r = mockStore.state.runs.find((x) => x.status === "running");
        if (r) {
          r.status = Math.random() < 0.75 ? "passed" : "warning";
          r.endedAt = nowIso();
        }
        return { ok: true };
      }
      return httpJson("/tests/stop", { method: "POST" });
    },

    // PUBLIC_INTERFACE
    connectTelemetry(onMessage) {
      /**
       * Optional websocket stub. If REACT_APP_WS_URL is set, we attempt to connect
       * using built-in WebSocket, and forward messages to the callback.
       * No dependency on external libs.
       *
       * Returns: { close: () => void, connected: boolean }
       */
      if (!WS_URL || typeof WebSocket === "undefined") {
        return { close: () => {}, connected: false };
      }
      try {
        const ws = new WebSocket(WS_URL);
        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            onMessage?.(data);
          } catch {
            onMessage?.({ type: "raw", data: ev.data });
          }
        };
        return {
          connected: true,
          close: () => {
            try {
              ws.close();
            } catch {
              // ignore
            }
          },
        };
      } catch {
        return { close: () => {}, connected: false };
      }
    },

    // PUBLIC_INTERFACE
    subscribeMockUpdates(cb) {
      /** In mock mode, subscribe to periodic updates (setInterval). */
      if (!mockMode) return () => {};
      ensureMockTicker();
      mockSubscribers.add(cb);
      return () => mockSubscribers.delete(cb);
    },
  };
}
