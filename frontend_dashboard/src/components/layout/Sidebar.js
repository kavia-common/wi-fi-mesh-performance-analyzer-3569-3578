import React, { useMemo, useState } from "react";

const NAV = [
  { key: "dashboard", label: "Dashboard" },
  { key: "test-runs", label: "Test Runs" },
  { key: "nodes", label: "Nodes" },
  { key: "metrics", label: "Metrics" },
  { key: "alerts", label: "Alerts" },
  { key: "settings", label: "Settings" },
];

function Icon({ name }) {
  // Inline minimal icons; no external libraries.
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" };
  const stroke = "currentColor";
  const sw = 2;

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <path d="M4 13h7V4H4v9Z" stroke={stroke} strokeWidth={sw} />
          <path d="M13 20h7V11h-7v9Z" stroke={stroke} strokeWidth={sw} />
          <path d="M13 9h7V4h-7v5Z" stroke={stroke} strokeWidth={sw} />
          <path d="M4 20h7v-5H4v5Z" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "test-runs":
      return (
        <svg {...common}>
          <path d="M9 2h6v4H9V2Z" stroke={stroke} strokeWidth={sw} />
          <path d="M7 6h10v16H7V6Z" stroke={stroke} strokeWidth={sw} />
          <path d="M9 10h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M9 14h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "nodes":
      return (
        <svg {...common}>
          <path d="M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" stroke={stroke} strokeWidth={sw} />
          <path d="M5 21a7 7 0 0 1 14 0" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M4 11h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M14 11h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "metrics":
      return (
        <svg {...common}>
          <path d="M4 19V5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M4 19h16" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M7 14l3-3 3 2 4-6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "alerts":
      return (
        <svg {...common}>
          <path d="M12 9v4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M12 17h.01" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path
            d="M10.3 4.2 3.6 16a2 2 0 0 0 1.7 3h13.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" stroke={stroke} strokeWidth={sw} />
          <path
            d="M19.4 15a8 8 0 0 0 .1-2l2-1.2-2-3.6-2.3.7a7.9 7.9 0 0 0-1.7-1L15 5h-6l-.5 2.9a7.9 7.9 0 0 0-1.7 1L4.5 8.2l-2 3.6 2 1.2a8 8 0 0 0 .1 2l-2 1.2 2 3.6 2.3-.7a7.9 7.9 0 0 0 1.7 1L9 21h6l.5-2.9a7.9 7.9 0 0 0 1.7-1l2.3.7 2-3.6-2.1-1.2Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

// PUBLIC_INTERFACE
export function Sidebar({ activeKey, onNavigate }) {
  /** Sidebar navigation component (responsive). */
  const [collapsedMobile, setCollapsedMobile] = useState(true);

  const isMobile = useMemo(() => window.matchMedia && window.matchMedia("(max-width: 760px)").matches, []);
  const collapsed = isMobile ? collapsedMobile : false;

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <div className="sidebarInner surface">
        <div className="sidebarTop">
          <div className="brand" onClick={() => onNavigate?.("dashboard")} role="button" tabIndex={0}>
            <div className="brandMark" aria-hidden="true">◉</div>
            <div className="brandText">
              <div className="brandName">Ocean</div>
              <div className="brandSub muted">Mesh Analyzer</div>
            </div>
          </div>

          <button className="btn btnGhost sidebarMobileBtn" onClick={() => setCollapsedMobile((v) => !v)}>
            {collapsed ? "Menu" : "Close"}
          </button>
        </div>

        <nav className={`sidebarNav ${collapsed ? "collapsed" : ""}`}>
          {NAV.map((item) => {
            const active = item.key === activeKey;
            return (
              <button
                key={item.key}
                className={`sidebarItem ${active ? "active" : ""}`}
                onClick={() => {
                  onNavigate?.(item.key);
                  if (isMobile) setCollapsedMobile(true);
                }}
                aria-current={active ? "page" : undefined}
              >
                <span className="sidebarIcon" aria-hidden="true">
                  <Icon name={item.key} />
                </span>
                <span className="sidebarLabel">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebarBottom muted">
          <div className="sidebarKicker">Wi‑Fi Mesh</div>
          <div className="sidebarHint">Performance dashboard</div>
        </div>
      </div>
    </aside>
  );
}
