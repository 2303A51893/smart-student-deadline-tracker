import React, { useEffect } from 'react';

export default function DevOpsModal({
  isOpen,
  onClose,
  devOpsStatus,
  onRefresh,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isHealthy = devOpsStatus?.databaseHealth?.connected && devOpsStatus?.apiHealth?.status === 'UP';
  const ciInfo = devOpsStatus?.ciPipeline;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚙️</span>
            <span>DevOps & System Telemetry</span>
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '18px', lineHeight: 1.5 }}>
            Real-time infrastructure health probe and pipeline metadata for the B.Tech Fullstack & DevOps submission.
          </p>

          <div className="devops-info-grid">
            {/* API Health */}
            <div className="devops-info-box">
              <div className="box-label">REST API Status</div>
              <div
                className="box-val"
                style={{
                  color: devOpsStatus?.apiHealth?.status === 'UP' ? '#059669' : '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>●</span>
                <span>{devOpsStatus?.apiHealth?.status === 'UP' ? 'HEALTHY (200 OK)' : 'DEGRADED'}</span>
              </div>
            </div>

            {/* Database Health */}
            <div className="devops-info-box">
              <div className="box-label">Database Connection</div>
              <div
                className="box-val"
                style={{
                  color: devOpsStatus?.databaseHealth?.connected ? '#059669' : '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>●</span>
                <span>
                  {devOpsStatus?.databaseHealth?.connected
                    ? `${devOpsStatus?.databaseHealth?.provider} Connected`
                    : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Server Environment */}
            <div className="devops-info-box">
              <div className="box-label">Environment</div>
              <div className="box-val">{devOpsStatus?.environment?.toUpperCase() || 'DEVELOPMENT'}</div>
            </div>

            {/* Uptime */}
            <div className="devops-info-box">
              <div className="box-label">API Uptime</div>
              <div className="box-val">
                {devOpsStatus?.apiHealth?.uptimeSeconds !== undefined
                  ? `${devOpsStatus.apiHealth.uptimeSeconds}s`
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* CI/CD Pipeline Section */}
          <div className="ci-callout-box">
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🚀</span>
              <span>CI/CD Pipeline Telemetry</span>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <strong>Workflow:</strong> {ciInfo?.configuredWorkflow || '.github/workflows/ci.yml'}
            </div>

            <div style={{ marginBottom: '6px' }}>
              <strong>Active Branch:</strong> <code>{ciInfo?.branch || 'main'}</code>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <strong>Commit Ref:</strong> <code>{ciInfo?.commitSha || 'Local workspace'}</code>
            </div>

            <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.78rem', color: '#475569' }}>
              ℹ️ <strong>Truth in DevOps:</strong> {ciInfo?.statusNote || 'Configured for GitHub Actions triggers on push/pull_request.'}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onRefresh}>
            🔄 Refresh Status
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
