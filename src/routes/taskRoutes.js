/**
 * Task Routes
 * Defines API routing endpoints for tasks.
 */

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET /api/tasks - List all tasks with filters and summary
router.get('/', taskController.getAllTasks);

// POST /api/tasks - Create new task
router.post('/', taskController.createTask);

// POST /api/tasks/seed - Demo seed endpoint
router.post('/seed', taskController.seedDemoTasks);

// GET /api/tasks/:id - Get task by ID
router.get('/:id', taskController.getTaskById);

// PUT /api/tasks/:id - Update task by ID
router.put('/:id', taskController.updateTask);

// PATCH /api/tasks/:id/toggle - Toggle completion status
router.patch('/:id/toggle', taskController.toggleTaskComplete);

// DELETE /api/tasks/:id - Delete task by ID
router.delete('/:id', taskController.deleteTask);

module.exports = router;
