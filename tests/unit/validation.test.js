const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { validateTaskInput, isValidDate } = require('../../src/validation/taskValidator');

describe('Task Input Validation Unit Tests', () => {
  it('should accept a fully valid task payload', () => {
    const payload = {
      title: 'DevOps CI/CD Lab Assignment',
      category: 'Assignment',
      priority: 'High',
      due_date: '2026-10-25',
      description: 'Implement GitHub Actions workflow',
    };

    const result = validateTaskInput(payload);
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  it('should reject missing or empty task title', () => {
    const missingTitle = {
      category: 'Assignment',
      due_date: '2026-10-25',
    };
    const emptyTitle = {
      title: '   ',
      category: 'Assignment',
      due_date: '2026-10-25',
    };

    const res1 = validateTaskInput(missingTitle);
    assert.equal(res1.isValid, false);
    assert.ok(res1.errors.some((e) => e.includes('title is required')));

    const res2 = validateTaskInput(emptyTitle);
    assert.equal(res2.isValid, false);
    assert.ok(res2.errors.some((e) => e.includes('at least 3 characters')));
  });

  it('should reject titles shorter than 3 characters', () => {
    const result = validateTaskInput({
      title: 'Hi',
      category: 'Assignment',
      due_date: '2026-10-25',
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('at least 3 characters')));
  });

  it('should reject invalid categories', () => {
    const result = validateTaskInput({
      title: 'Review Chapter 5',
      category: 'UnknownCategory',
      due_date: '2026-10-25',
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('Invalid category')));
  });

  it('should accept valid categories: Assignment, Exam, Project', () => {
    const categories = ['Assignment', 'Exam', 'Project'];
    for (const cat of categories) {
      const result = validateTaskInput({
        title: `Valid Test for ${cat}`,
        category: cat,
        due_date: '2026-10-25',
      });
      assert.equal(result.isValid, true);
    }
  });

  it('should reject invalid priorities', () => {
    const result = validateTaskInput({
      title: 'Physics Homework',
      category: 'Assignment',
      priority: 'UrgentNow',
      due_date: '2026-10-25',
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((e) => e.includes('Invalid priority')));
  });

  it('should accept valid priorities: Low, Medium, High', () => {
    const priorities = ['Low', 'Medium', 'High'];
    for (const prio of priorities) {
      const result = validateTaskInput({
        title: `Valid Test for ${prio}`,
        category: 'Assignment',
        priority: prio,
        due_date: '2026-10-25',
      });
      assert.equal(result.isValid, true);
    }
  });

  it('should reject invalid or malformed due dates', () => {
    const invalidDates = ['invalid-date', '2026-99-99', '', null, 12345];
    for (const dateVal of invalidDates) {
      const result = validateTaskInput({
        title: 'Math Assignment',
        category: 'Assignment',
        due_date: dateVal,
      });
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('date')));
    }
  });

  it('should accurately test isValidDate utility', () => {
    assert.equal(isValidDate('2026-12-31'), true);
    assert.equal(isValidDate('2026-02-28'), true);
    assert.equal(isValidDate('2026-02-30'), false); // non-existent date
    assert.equal(isValidDate('not-a-date'), false);
  });
});
