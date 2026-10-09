import React from 'react';

export default function Sidebar({
  activeCategory,
  onSelectCategory,
  taskCounts,
  onOpenDevOpsModal,
  onSeedDemoData,
  isSeeding,
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {mobileOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 35 }}
          onClick={onCloseMobile}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-logo-icon" aria-hidden="true">
              ⏱
            </div>
            <div className="brand-info">
              <h1>DeadlineWise</h1>
              <span>Student Academic Hub</span>
            </div>
          </div>
          {mobileOpen && (
            <button
              className="modal-close-btn"
              style={{ color: '#fff' }}
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Views & Categories</div>

          <button
            className={`nav-item ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => {
              onSelectCategory('All');
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <span className="nav-item-icon">📋</span>
            <span>All Deadlines</span>
            <span className="nav-badge">{taskCounts?.total || 0}</span>
          </button>

          <button
            className={`nav-item ${activeCategory === 'Assignment' ? 'active' : ''}`}
            onClick={() => {
              onSelectCategory('Assignment');
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <span className="nav-item-icon">📝</span>
            <span>Assignments</span>
          </button>

          <button
            className={`nav-item ${activeCategory === 'Exam' ? 'active' : ''}`}
            onClick={() => {
              onSelectCategory('Exam');
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <span className="nav-item-icon">🎯</span>
            <span>Exams & Quizzes</span>
          </button>

          <button
            className={`nav-item ${activeCategory === 'Project' ? 'active' : ''}`}
            onClick={() => {
              onSelectCategory('Project');
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <span className="nav-item-icon">🚀</span>
            <span>Course Projects</span>
          </button>

          <div className="nav-section-title" style={{ marginTop: '14px' }}>
            System & Automation
          </div>

          <button
            className="nav-item"
            onClick={() => {
              onOpenDevOpsModal();
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <span className="nav-item-icon">⚙️</span>
            <span>DevOps & Pipeline</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className="demo-seed-btn"
            onClick={onSeedDemoData}
            disabled={isSeeding}
            title="Populates realistic college tasks for live classroom demo"
          >
            <span>{isSeeding ? '⏳ Loading Demo...' : '✨ Load Demo Data'}</span>
          </button>

          <div className="course-badge">
            <span>B.Tech Fullstack & DevOps</span>
            <strong>10 Marks</strong>
          </div>
        </div>
      </aside>
    </>
  );
}
