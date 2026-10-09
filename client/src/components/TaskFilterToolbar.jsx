import React from 'react';

export default function TaskFilterToolbar({
  searchQuery,
  onSearchChange,
  activeStatus,
  onStatusChange,
  activeCategory,
  onCategoryChange,
  activePriority,
  onPriorityChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="filter-toolbar">
      <div className="filter-left-group">
        {/* Search Input */}
        <div className="search-box-wrap">
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search deadlines by title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search deadlines"
          />
        </div>

        {/* Status Pills */}
        <div className="segmented-pills" role="tablist" aria-label="Status filters">
          <button
            role="tab"
            aria-selected={activeStatus === 'all'}
            className={`pill-btn ${activeStatus === 'all' ? 'active' : ''}`}
            onClick={() => onStatusChange('all')}
          >
            All
          </button>
          <button
            role="tab"
            aria-selected={activeStatus === 'pending'}
            className={`pill-btn ${activeStatus === 'pending' ? 'active' : ''}`}
            onClick={() => onStatusChange('pending')}
          >
            Pending
          </button>
          <button
            role="tab"
            aria-selected={activeStatus === 'completed'}
            className={`pill-btn ${activeStatus === 'completed' ? 'active' : ''}`}
            onClick={() => onStatusChange('completed')}
          >
            Completed
          </button>
          <button
            role="tab"
            aria-selected={activeStatus === 'overdue'}
            className={`pill-btn ${activeStatus === 'overdue' ? 'active' : ''}`}
            onClick={() => onStatusChange('overdue')}
          >
            Overdue
          </button>
        </div>
      </div>

      <div className="filter-right-group">
        {/* Category selector */}
        <select
          className="select-control"
          value={activeCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          <option value="Assignment">Assignments</option>
          <option value="Exam">Exams & Quizzes</option>
          <option value="Project">Projects</option>
        </select>

        {/* Priority selector */}
        <select
          className="select-control"
          value={activePriority}
          onChange={(e) => onPriorityChange(e.target.value)}
          aria-label="Filter by priority"
        >
          <option value="All">All Priorities</option>
          <option value="High">🔴 High Priority</option>
          <option value="Medium">🟡 Medium Priority</option>
          <option value="Low">🟢 Low Priority</option>
        </select>

        {/* Sort selector */}
        <select
          className="select-control"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort order"
        >
          <option value="deadline_asc">Nearest Deadline First</option>
          <option value="deadline_desc">Furthest Deadline First</option>
          <option value="priority_desc">Highest Priority First</option>
          <option value="newest">Recently Added</option>
        </select>
      </div>
    </div>
  );
}
