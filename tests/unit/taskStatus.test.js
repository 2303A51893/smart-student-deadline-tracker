const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  isTaskOverdue,
  getDaysRemaining,
  decorateTask,
  calculateMetrics,
} = require('../../src/utils/taskStatus');

describe('Task Status and Overdue Calculations', () => {
  const referenceToday = '2026-10-10';

  it('should mark uncompleted task in the past as overdue', () => {
    const task = {
      title: 'Past Assignment',
      due_date: '2026-10-05',
      completed: false,
    };
    const overdue = isTaskOverdue(task, referenceToday);
    assert.equal(overdue, true);
  });

  it('should NEVER mark a completed task as overdue even if due date is in the past', () => {
    const task = {
      title: 'Submitted Exam',
      due_date: '2026-10-01',
      completed: true,
    };
    const overdue = isTaskOverdue(task, referenceToday);
    assert.equal(overdue, false, 'Completed tasks must never be marked as overdue');
  });

  it('should not mark task due in future as overdue', () => {
    const task = {
      title: 'Future Project',
      due_date: '2026-10-20',
      completed: false,
    };
    const overdue = isTaskOverdue(task, referenceToday);
    assert.equal(overdue, false);
  });

  it('should not mark task due today as overdue', () => {
    const task = {
      title: 'Due Today Task',
      due_date: '2026-10-10',
      completed: false,
    };
    const overdue = isTaskOverdue(task, referenceToday);
    assert.equal(overdue, false);
  });

  it('should accurately calculate positive, negative, and zero days remaining', () => {
    assert.equal(getDaysRemaining('2026-10-15', referenceToday), 5);
    assert.equal(getDaysRemaining('2026-10-10', referenceToday), 0);
    assert.equal(getDaysRemaining('2026-10-08', referenceToday), -2);
  });

  it('should decorate a task with computed metadata fields', () => {
    const task = {
      id: 1,
      title: 'Compiler Project',
      due_date: '2026-10-12',
      completed: false,
    };
    const decorated = decorateTask(task, referenceToday);
    assert.equal(decorated.is_overdue, false);
    assert.equal(decorated.days_remaining, 2);
    assert.equal(decorated.urgency_label, 'Due in 2 days');
  });

  it('should compute aggregate metrics accurately across tasks', () => {
    const taskList = [
      { id: 1, due_date: '2026-10-05', completed: false }, // Overdue
      { id: 2, due_date: '2026-10-08', completed: true },  // Completed (past, but NOT overdue)
      { id: 3, due_date: '2026-10-12', completed: false }, // Pending (future)
      { id: 4, due_date: '2026-10-15', completed: true },  // Completed (future)
    ];

    const metrics = calculateMetrics(taskList, referenceToday);
    assert.equal(metrics.total, 4);
    assert.equal(metrics.completed, 2);
    assert.equal(metrics.pending, 2);
    assert.equal(metrics.overdue, 1);
    assert.equal(metrics.completionRate, 50);
  });

  it('should handle empty task list cleanly', () => {
    const metrics = calculateMetrics([]);
    assert.deepEqual(metrics, {
      total: 0,
      pending: 0,
      completed: 0,
      overdue: 0,
      completionRate: 0,
    });
  });
});
