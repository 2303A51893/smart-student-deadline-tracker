/**
 * Task Status & Metrics Utility
 * Pure functions for deadline calculations, overdue detection, and analytics.
 */

/**
 * Normalizes a date into YYYY-MM-DD string in local/UTC context
 * @param {Date|string} dateInput
 * @returns {string}
 */
function normalizeDateString(dateInput) {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a task is overdue.
 * Rule: Completed tasks are NEVER overdue.
 * Uncompleted tasks whose due_date is before today are overdue.
 * 
 * @param {Object} task
 * @param {string|Date} [referenceDate] - defaults to today's date
 * @returns {boolean}
 */
function isTaskOverdue(task, referenceDate = new Date()) {
  if (!task) return false;
  if (task.completed) return false;

  const taskDateStr = normalizeDateString(task.due_date);
  const refDateStr = normalizeDateString(referenceDate);

  if (!taskDateStr || !refDateStr) return false;

  return taskDateStr < refDateStr;
}

/**
 * Calculates remaining days until deadline.
 * Positive = days in future, 0 = due today, Negative = days overdue.
 * 
 * @param {string|Date} dueDate
 * @param {string|Date} [referenceDate]
 * @returns {number}
 */
function getDaysRemaining(dueDate, referenceDate = new Date()) {
  const taskDateStr = normalizeDateString(dueDate);
  const refDateStr = normalizeDateString(referenceDate);

  if (!taskDateStr || !refDateStr) return 0;

  const t1 = new Date(taskDateStr + 'T00:00:00');
  const t2 = new Date(refDateStr + 'T00:00:00');
  const diffTime = t1.getTime() - t2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Decorates a task object with computed status metadata.
 * 
 * @param {Object} task
 * @param {string|Date} [referenceDate]
 * @returns {Object}
 */
function decorateTask(task, referenceDate = new Date()) {
  const overdue = isTaskOverdue(task, referenceDate);
  const daysLeft = getDaysRemaining(task.due_date, referenceDate);

  let urgencyLabel = 'Upcoming';
  if (task.completed) {
    urgencyLabel = 'Completed';
  } else if (overdue) {
    const daysAgo = Math.abs(daysLeft);
    urgencyLabel = daysAgo === 1 ? 'Overdue by 1 day' : `Overdue by ${daysAgo} days`;
  } else if (daysLeft === 0) {
    urgencyLabel = 'Due today';
  } else if (daysLeft === 1) {
    urgencyLabel = 'Due tomorrow';
  } else {
    urgencyLabel = `Due in ${daysLeft} days`;
  }

  return {
    ...task,
    due_date: normalizeDateString(task.due_date),
    is_overdue: overdue,
    days_remaining: daysLeft,
    urgency_label: urgencyLabel,
  };
}

/**
 * Computes dashboard metric summaries from a task array.
 * 
 * @param {Array<Object>} tasks
 * @param {string|Date} [referenceDate]
 * @returns {Object} { total, pending, completed, overdue, completionRate }
 */
function calculateMetrics(tasks, referenceDate = new Date()) {
  if (!Array.isArray(tasks)) {
    return { total: 0, pending: 0, completed: 0, overdue: 0, completionRate: 0 };
  }

  const total = tasks.length;
  let completed = 0;
  let overdue = 0;

  for (const t of tasks) {
    if (t.completed) {
      completed++;
    } else if (isTaskOverdue(t, referenceDate)) {
      overdue++;
    }
  }

  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    pending,
    completed,
    overdue,
    completionRate,
  };
}

module.exports = {
  normalizeDateString,
  isTaskOverdue,
  getDaysRemaining,
  decorateTask,
  calculateMetrics,
};
