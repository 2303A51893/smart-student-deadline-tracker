/**
 * Task Controller
 * Handles REST API actions for tasks with input validation,
 * parameterized SQL queries, and status calculations.
 */

const { query } = require('../db');
const { validateTaskInput } = require('../validation/taskValidator');
const { decorateTask, calculateMetrics, isTaskOverdue } = require('../utils/taskStatus');
const { runSeed } = require('../db/seed');

/**
 * GET /api/tasks
 * Retrieves tasks with optional search, category, status, priority filters, and sorting.
 * Also returns aggregate summary metrics.
 */
async function getAllTasks(req, res, next) {
  try {
    const { search, category, priority, status, sort } = req.query;

    // First fetch all tasks to calculate accurate overall summary metrics
    const allTasksRes = await query('SELECT * FROM tasks ORDER BY due_date ASC');
    const allDecorated = (allTasksRes.rows || []).map((t) => decorateTask(t));
    const summary = calculateMetrics(allDecorated);

    // Now apply query filters for the list view
    let filteredTasks = [...allDecorated];

    // Filter by search string
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filteredTasks = filteredTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      filteredTasks = filteredTasks.filter((t) => t.category === category);
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      filteredTasks = filteredTasks.filter((t) => t.priority === priority);
    }

    // Filter by status: 'pending', 'completed', 'overdue', 'all'
    if (status && status !== 'all') {
      if (status === 'completed') {
        filteredTasks = filteredTasks.filter((t) => t.completed === true);
      } else if (status === 'pending') {
        filteredTasks = filteredTasks.filter((t) => t.completed === false);
      } else if (status === 'overdue') {
        filteredTasks = filteredTasks.filter((t) => t.is_overdue === true);
      }
    }

    // Sort order
    if (sort === 'deadline_desc') {
      filteredTasks.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
    } else if (sort === 'newest') {
      filteredTasks.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sort === 'priority_desc') {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      filteredTasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    } else {
      // Default: nearest deadline first (deadline_asc)
      filteredTasks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }

    return res.status(200).json({
      success: true,
      count: filteredTasks.length,
      summary,
      data: filteredTasks,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tasks/:id
 * Retrieves a single task by ID
 */
async function getTaskById(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID format.' });
    }

    const result = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Task #${taskId} not found.` });
    }

    return res.status(200).json({
      success: true,
      data: decorateTask(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/tasks
 * Creates a new task after strict input validation
 */
async function createTask(req, res, next) {
  try {
    const validation = validateTaskInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    const {
      title,
      description = null,
      category,
      priority = 'Medium',
      due_date,
      completed = false,
    } = req.body;

    const sql = `
      INSERT INTO tasks (title, description, category, priority, due_date, completed)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const params = [
      title.trim(),
      description ? description.trim() : null,
      category,
      priority || 'Medium',
      due_date,
      Boolean(completed),
    ];

    const result = await query(sql, params);
    const createdTask = result.rows[0];

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: decorateTask(createdTask),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/tasks/:id
 * Updates an existing task
 */
async function updateTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID format.' });
    }

    // Verify task exists
    const checkRes = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!checkRes.rows || checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Task #${taskId} not found.` });
    }

    const validation = validateTaskInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors,
      });
    }

    const {
      title,
      description = null,
      category,
      priority = 'Medium',
      due_date,
      completed = false,
    } = req.body;

    const sql = `
      UPDATE tasks
      SET title = $1,
          description = $2,
          category = $3,
          priority = $4,
          due_date = $5,
          completed = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const params = [
      title.trim(),
      description ? description.trim() : null,
      category,
      priority || 'Medium',
      due_date,
      Boolean(completed),
      taskId,
    ];

    const result = await query(sql, params);
    const updatedTask = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: decorateTask(updatedTask),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/tasks/:id/toggle
 * Toggles completed status of a task
 */
async function toggleTaskComplete(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID format.' });
    }

    const checkRes = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!checkRes.rows || checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Task #${taskId} not found.` });
    }

    const currentTask = checkRes.rows[0];
    const newCompleted = !currentTask.completed;

    const sql = `
      UPDATE tasks
      SET completed = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;
    const result = await query(sql, [newCompleted, taskId]);
    const updatedTask = result.rows[0];

    return res.status(200).json({
      success: true,
      message: `Task marked as ${newCompleted ? 'completed' : 'pending'}.`,
      data: decorateTask(updatedTask),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/tasks/:id
 * Deletes a task by ID
 */
async function deleteTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, error: 'Invalid task ID format.' });
    }

    const checkRes = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (!checkRes.rows || checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: `Task #${taskId} not found.` });
    }

    await query('DELETE FROM tasks WHERE id = $1', [taskId]);

    return res.status(200).json({
      success: true,
      message: `Task #${taskId} deleted successfully.`,
      deletedId: taskId,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/seed
 * Populates sample realistic college deadlines for demonstration
 */
async function seedDemoTasks(req, res, next) {
  try {
    const seeded = await runSeed();
    const decorated = seeded.map((t) => decorateTask(t));
    const summary = calculateMetrics(decorated);

    return res.status(201).json({
      success: true,
      message: `Successfully seeded ${seeded.length} realistic demo deadlines.`,
      count: seeded.length,
      summary,
      data: decorated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  seedDemoTasks,
};
