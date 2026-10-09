import React from 'react';

export default function TaskList({
  tasks,
  loading,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  onSeedDemoData,
}) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
        <p style={{ fontWeight: 600 }}>Loading deadlines from PostgreSQL...</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state-wrap">
        <div className="empty-icon-wrap" aria-hidden="true">
          📂
        </div>
        <h3 className="empty-state-title">No Deadlines Found</h3>
        <p className="empty-state-text">
          No tasks match your current filter criteria, or your tracker is empty.
          Add a deadline manually or load sample college tasks for a live demo.
        </p>
        <div className="empty-state-actions">
          <button className="btn-primary" onClick={onOpenCreateModal}>
            + Add First Deadline
          </button>
          <button className="btn-secondary" onClick={onSeedDemoData}>
            ✨ Load Demo Data
          </button>
        </div>
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="tasks-container">
      <div className="section-header-row">
        <h2 className="section-title">
          <span>Active Deadlines</span>
          <span className="counter-badge">{tasks.length}</span>
        </h2>
      </div>

      {tasks.map((task) => {
        const catClass = task.category ? task.category.toLowerCase() : 'assignment';
        const prioClass = task.priority ? task.priority.toLowerCase() : 'medium';

        let urgencyClass = 'upcoming';
        if (task.completed) {
          urgencyClass = 'completed';
        } else if (task.is_overdue) {
          urgencyClass = 'overdue';
        } else if (task.days_remaining === 0) {
          urgencyClass = 'today';
        }

        return (
          <div
            key={task.id}
            className={`task-card ${task.completed ? 'completed' : ''} ${task.is_overdue ? 'is-overdue' : ''}`}
          >
            {/* Checkbox Toggle */}
            <div className="task-checkbox-wrap">
              <button
                type="button"
                className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
                onClick={() => onToggleTask(task.id)}
                aria-label={task.completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
              >
                {task.completed && '✓'}
              </button>
            </div>

            {/* Task Content */}
            <div className="task-content-main">
              <div className="task-badges-row">
                {/* Category Badge */}
                <span className={`badge-cat ${catClass}`}>
                  {task.category}
                </span>

                {/* Priority Badge */}
                <span className={`badge-priority ${prioClass}`}>
                  <span className="prio-dot" />
                  <span>{task.priority} Priority</span>
                </span>

                {/* Urgency Badge */}
                <span className={`badge-urgency ${urgencyClass}`}>
                  {task.completed ? '✓ Submitted' : (task.is_overdue ? '⚠️ ' : '📅 ') + task.urgency_label}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="task-title">{task.title}</h3>
              {task.description && <p className="task-desc">{task.description}</p>}

              {/* Due Date Details */}
              <div className="task-meta-footer">
                <span className="task-due-raw">
                  <span>Due:</span>
                  <strong>{formatDate(task.due_date)}</strong>
                </span>
              </div>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="task-actions">
              <button
                className="action-icon-btn edit"
                onClick={() => onEditTask(task)}
                title="Edit deadline"
                aria-label={`Edit ${task.title}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
              </button>
              <button
                className="action-icon-btn delete"
                onClick={() => onDeleteTask(task)}
                title="Delete deadline"
                aria-label={`Delete ${task.title}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" x2="10" y1="11" y2="17"/>
                  <line x1="14" x2="14" y1="11" y2="17"/>
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
