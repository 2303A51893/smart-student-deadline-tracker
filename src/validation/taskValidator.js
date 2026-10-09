/**
 * Task Input Validation Module
 * Validates task payload fields for creation and updates.
 */

const ALLOWED_CATEGORIES = ['Assignment', 'Exam', 'Project'];
const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High'];

/**
 * Validates a date string in YYYY-MM-DD or ISO format
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  // Accepts YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    // Also check standard ISO parseable
    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime());
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * Validates task creation payload.
 * 
 * @param {Object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateTaskInput(data = {}) {
  const errors = [];

  // 1. Title validation
  if (!data.title || typeof data.title !== 'string') {
    errors.push('Task title is required and must be a string.');
  } else {
    const trimmedTitle = data.title.trim();
    if (trimmedTitle.length < 3) {
      errors.push('Task title must be at least 3 characters long.');
    } else if (trimmedTitle.length > 255) {
      errors.push('Task title cannot exceed 255 characters.');
    }
  }

  // 2. Category validation
  if (!data.category || typeof data.category !== 'string') {
    errors.push(`Category is required. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}.`);
  } else if (!ALLOWED_CATEGORIES.includes(data.category)) {
    errors.push(`Invalid category "${data.category}". Allowed values: ${ALLOWED_CATEGORIES.join(', ')}.`);
  }

  // 3. Due Date validation
  if (!data.due_date) {
    errors.push('Due date is required (format: YYYY-MM-DD).');
  } else if (!isValidDate(data.due_date)) {
    errors.push('Invalid due date format. Please provide a valid calendar date in YYYY-MM-DD format.');
  }

  // 4. Priority validation (optional on creation, defaults to Medium)
  if (data.priority !== undefined && data.priority !== null) {
    if (!ALLOWED_PRIORITIES.includes(data.priority)) {
      errors.push(`Invalid priority "${data.priority}". Allowed values: ${ALLOWED_PRIORITIES.join(', ')}.`);
    }
  }

  // 5. Description validation (optional)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.push('Description must be a string if provided.');
    } else if (data.description.length > 1000) {
      errors.push('Description cannot exceed 1000 characters.');
    }
  }

  // 6. Completed validation (optional boolean)
  if (data.completed !== undefined && data.completed !== null) {
    if (typeof data.completed !== 'boolean') {
      errors.push('Completed status must be a boolean (true or false).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  ALLOWED_CATEGORIES,
  ALLOWED_PRIORITIES,
  isValidDate,
  validateTaskInput,
};
