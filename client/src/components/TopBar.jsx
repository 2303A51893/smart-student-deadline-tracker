import React from 'react';

export default function TopBar({
  onOpenCreateModal,
  onOpenDevOpsModal,
  devOpsStatus,
  onToggleMobileMenu,
}) {
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const isHealthy = devOpsStatus?.databaseHealth?.connected && devOpsStatus?.apiHealth?.status === 'UP';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>

        <div className="today-chip">
          <span aria-hidden="true">📅</span>
          <span>{todayStr}</span>
        </div>
      </div>

      <div className="topbar-right">
        <button
          className={`devops-indicator-pill ${isHealthy ? 'healthy' : 'degraded'}`}
          onClick={onOpenDevOpsModal}
          title="Click to view full DevOps, API health, and CI/CD status"
        >
          <span className={`status-dot ${isHealthy ? 'pulse' : ''}`} />
          <span>{isHealthy ? 'API & DB Online' : 'System Diagnostic'}</span>
        </button>

        <button className="btn-primary" onClick={onOpenCreateModal}>
          <span>+</span>
          <span>New Deadline</span>
        </button>
      </div>
    </header>
  );
}
