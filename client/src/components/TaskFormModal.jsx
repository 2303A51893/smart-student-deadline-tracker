import React, { useState, useEffect } from 'react';

export default function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Assignment');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Get default tomorrow date in YYYY-MM-DD
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'Assignment');
      setPriority(initialData.priority || 'Medium');
      setDueDate(
        initialData.due_date ? initialData.due_date.slice(0, 10) : getDefaultDueDate()
      );
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setCategory('Assignment');
      setPriority('Medium');
      setDueDate(getDefaultDueDate());
      setDescription('');
    }
    setFormError('');
  }, [initialData, isOpen]);

  // Handle escape key
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 3) {
      setFormError('Title must be at least 3 characters long.');
      return;
    }
    if (!dueDate) {
      setFormError('Please select a valid deadline date.');
      return;
    }

    setFormError('');
    onSubmit({
      id: initialData?.id,
      title: title.trim(),
      category,
      priority,
      due_date: dueDate,
      description: description.trim() || null,
      completed: initialData?.completed ?? false,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? '✏️ Edit Deadline' : '✨ New Academic Deadline'}
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && (
              <div
                style={{
                  background: '#fee2e2',
                  color: '#991b1b',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  marginBottom: '16px',
                  border: '1px solid #fecaca',
                }}
              >
                ⚠️ {formError}
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">
                Deadline Title <span className="req">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="e.g. Distributed Systems Lab 3 Assignment"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Category and Priority (2 columns) */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="task-cat">
                  Category <span className="req">*</span>
                </label>
                <select
                  id="task-cat"
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Exam">Exam / Quiz</option>
                  <option value="Project">Course Project</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-prio">
                  Priority <span className="req">*</span>
                </label>
                <select
                  id="task-prio"
                  className="form-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="High">🔴 High Priority</option>
                  <option value="Medium">🟡 Medium Priority</option>
                  <option value="Low">🟢 Low Priority</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-date">
                Due Date <span className="req">*</span>
              </label>
              <input
                id="task-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">
                Notes & Instructions <span style={{ color: '#94a3b8' }}>(Optional)</span>
              </label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Key requirements, submission portal links, rubric guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Deadline' : 'Create Deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
