import React, { useMemo } from "react";
import { useAppState } from "../state/AppStateContext";

function badgeForConn(conn) {
  if (conn === "Online") return "badge ok";
  if (conn === "Degraded") return "badge warn";
  if (conn === "Offline") return "badge bad";
  return "badge muted";
}

// PUBLIC_INTERFACE
export function NodesPage() {
  /** Nodes list/table for mesh health and telemetry. */
  const { nodes } = useAppState();

  const sorted = useMemo(() => {
    const arr = [...nodes];
    arr.sort((a, b) => (a.id > b.id ? 1 : -1));
    return arr;
  }, [nodes]);

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <div className="h1">Nodes</div>
          <div className="muted" style={{ fontSize: 12 }}>
            Mesh nodes snapshot: RSSI/SNR, link rate, battery/power, connectivity, heartbeat.
          </div>
        </div>
      </div>

      <table className="table" aria-label="Nodes table">
        <thead>
          <tr>
            <th>Node</th>
            <th>Role</th>
            <th>Connectivity</th>
            <th>RSSI</th>
            <th>SNR</th>
            <th>Link Rate</th>
            <th>Battery</th>
            <th>Power</th>
            <th>Last Heartbeat</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((n) => (
            <tr key={n.id}>
              <td>
                <div style={{ display: "grid" }}>
                  <span style={{ fontWeight: 700 }}>{n.name}</span>
                  <span className="muted mono">{n.id}</span>
                </div>
              </td>
              <td>{n.role}</td>
              <td>
                <span className={badgeForConn(n.connectivity)}>{n.connectivity}</span>
              </td>
              <td className="mono">{n.rssi} dBm</td>
              <td className="mono">{n.snr} dB</td>
              <td className="mono">{n.linkRateMbps} Mbps</td>
              <td className="mono">{n.batteryPct}%</td>
              <td>{n.power}</td>
              <td className="mono">{new Date(n.lastHeartbeat).toLocaleTimeString()}</td>
            </tr>
          ))}
          {!sorted.length ? (
            <tr>
              <td colSpan={9} className="muted" style={{ padding: 14 }}>
                No nodes available.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
