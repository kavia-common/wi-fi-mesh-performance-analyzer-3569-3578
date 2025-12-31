import React, { useMemo, useState } from "react";

// PUBLIC_INTERFACE
export function Topbar({ actions = [], statusIndicators = [], onSearch, theme, onToggleTheme }) {
  /** Top bar with actions, search, and status indicators. */
  const [q, setQ] = useState("");

  const placeholder = useMemo(() => "Search: nodes, alerts, metrics…", []);

  return (
    <header className="topbar" aria-label="Top bar">
      <div className="topbarInner surface">
        <div className="topbarLeft">
          <div className="topbarTitle">
            <div className="topbarH1">Wi‑Fi Mesh Performance</div>
            <div className="topbarSub muted">Control tests • Monitor nodes • Explore metrics</div>
          </div>
        </div>

        <div className="topbarCenter">
          <form
            className="topbarSearch"
            onSubmit={(e) => {
              e.preventDefault();
              onSearch?.(q);
            }}
          >
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              aria-label="Search"
            />
          </form>
        </div>

        <div className="topbarRight">
          <div className="topbarIndicators" aria-label="Status indicators">
            {statusIndicators.map((s) => {
              const tone = s.tone || "muted";
              const dotClass = tone === "ok" ? "ok" : tone === "warn" ? "warn" : tone === "bad" ? "bad" : "";
              return (
                <span className="pill" key={s.label}>
                  <span className={`pillDot ${dotClass}`} aria-hidden="true" />
                  <span className="muted">{s.label}:</span> <span>{s.value}</span>
                </span>
              );
            })}
          </div>

          <div className="topbarActions" aria-label="Quick actions">
            {actions.map((a) => {
              const cls =
                a.variant === "primary" ? "btn btnPrimary" : a.variant === "danger" ? "btn btnDanger" : "btn btnGhost";
              return (
                <button key={a.key} className={cls} onClick={a.onClick} disabled={a.disabled}>
                  {a.label}
                </button>
              );
            })}
            <button className="btn btnGhost" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
