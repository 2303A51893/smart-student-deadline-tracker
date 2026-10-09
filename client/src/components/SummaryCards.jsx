import React from 'react';

export default function SummaryCards({ summary, activeStatus, onSelectStatus }) {
  const {
    total = 0,
    pending = 0,
    completed = 0,
    overdue = 0,
    completionRate = 0,
  } = summary || {};

  return (
    <section className="metrics-grid" aria-label="Deadline summary metrics">
      {/* 1. Total Tasks */}
      <div
        className={`metric-card total ${activeStatus === 'all' ? 'active-filter' : ''}`}
        onClick={() => onSelectStatus('all')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelectStatus('all')}
      >
        <div className="metric-card-top">
          <span className="metric-label">Total Deadlines</span>
          <div className="metric-icon-wrap" aria-hidden="true">
            📚
          </div>
        </div>
        <div className="metric-value">{total}</div>
        <div className="metric-sub">Across all subjects</div>
      </div>

      {/* 2. Pending Tasks */}
      <div
        className={`metric-card pending ${activeStatus === 'pending' ? 'active-filter' : ''}`}
        onClick={() => onSelectStatus('pending')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelectStatus('pending')}
      >
        <div className="metric-card-top">
          <span className="metric-label">Pending</span>
          <div className="metric-icon-wrap" aria-hidden="true">
            ⏳
          </div>
        </div>
        <div className="metric-value">{pending}</div>
        <div className="metric-sub">In progress & upcoming</div>
      </div>

      {/* 3. Completed Tasks */}
      <div
        className={`metric-card completed ${activeStatus === 'completed' ? 'active-filter' : ''}`}
        onClick={() => onSelectStatus('completed')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelectStatus('completed')}
      >
        <div className="metric-card-top">
          <span className="metric-label">Completed</span>
          <div className="metric-icon-wrap" aria-hidden="true">
            ✅
          </div>
        </div>
        <div className="metric-value">{completed}</div>
        <div className="metric-sub">Submitted / Done</div>
      </div>

      {/* 4. Overdue Tasks */}
      <div
        className={`metric-card overdue ${overdue > 0 ? 'has-overdue' : ''} ${activeStatus === 'overdue' ? 'active-filter' : ''}`}
        onClick={() => onSelectStatus('overdue')}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelectStatus('overdue')}
      >
        <div className="metric-card-top">
          <span className="metric-label">Overdue Alerts</span>
          <div className="metric-icon-wrap" aria-hidden="true">
            ⚠️
          </div>
        </div>
        <div className="metric-value">{overdue}</div>
        <div className="metric-sub">
          {overdue > 0 ? 'Requires immediate action' : 'All deadlines on track'}
        </div>
      </div>

      {/* 5. Progress Card */}
      <div className="progress-metric-card">
        <div className="progress-header">
          <span className="progress-title">Completion Rate</span>
          <span className="progress-rate-big">{completionRate}%</span>
        </div>
        <div className="progress-bar-track" aria-hidden="true">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(completionRate, 100)}%` }}
          />
        </div>
        <div className="progress-footer">
          <span>{completed} of {total} completed</span>
          <span>{pending} remaining</span>
        </div>
      </div>
    </section>
  );
}
