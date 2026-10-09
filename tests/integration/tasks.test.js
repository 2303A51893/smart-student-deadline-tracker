process.env.USE_TEST_MEMORY_DB = 'true';
process.env.NODE_ENV = 'test';

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../../src/app');
const { memoryDb } = require('../../src/db');

describe('Task CRUD and API Workflow Integration Tests', () => {
  beforeEach(() => {
    // Reset test database before each test
    memoryDb.reset();
  });

  it('POST /api/tasks should create a valid task with 201 Created', async () => {
    const payload = {
      title: 'Operating Systems Scheduling Lab',
      description: 'Implement Round Robin and Priority scheduling algorithms in C',
      category: 'Assignment',
      priority: 'High',
      due_date: '2026-10-25',
    };

    const res = await request(app).post('/api/tasks').send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, payload.title);
    assert.equal(res.body.data.category, 'Assignment');
    assert.equal(res.body.data.priority, 'High');
    assert.equal(res.body.data.completed, false);
    assert.ok(res.body.data.id);
  });

  it('POST /api/tasks should reject missing title with 400 Bad Request', async () => {
    const res = await request(app).post('/api/tasks').send({
      category: 'Assignment',
      due_date: '2026-10-25',
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.includes('title is required')));
  });

  it('POST /api/tasks should reject invalid category with 400 Bad Request', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Valid Task Title',
      category: 'Hackathon', // invalid category
      due_date: '2026-10-25',
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.includes('Invalid category')));
  });

  it('POST /api/tasks should reject invalid date with 400 Bad Request', async () => {
    const res = await request(app).post('/api/tasks').send({
      title: 'Valid Task Title',
      category: 'Assignment',
      due_date: 'invalid-date-string',
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.includes('due date')));
  });

  it('GET /api/tasks should list tasks and return computed summary metrics', async () => {
    // Insert 2 tasks
    await request(app).post('/api/tasks').send({
      title: 'Task A',
      category: 'Assignment',
      due_date: '2026-10-25',
    });
    await request(app).post('/api/tasks').send({
      title: 'Task B',
      category: 'Exam',
      due_date: '2026-10-28',
    });

    const res = await request(app).get('/api/tasks');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 2);
    assert.equal(res.body.summary.total, 2);
    assert.equal(res.body.summary.pending, 2);
    assert.equal(res.body.summary.completed, 0);
  });

  it('GET /api/tasks should filter by search term', async () => {
    await request(app).post('/api/tasks').send({
      title: 'Database Normalization',
      category: 'Assignment',
      due_date: '2026-10-25',
    });
    await request(app).post('/api/tasks').send({
      title: 'Computer Networks Quiz',
      category: 'Exam',
      due_date: '2026-10-28',
    });

    const res = await request(app).get('/api/tasks?search=database');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].title, 'Database Normalization');
  });

  it('GET /api/tasks/:id should return single task or 404', async () => {
    const createRes = await request(app).post('/api/tasks').send({
      title: 'Single Task Test',
      category: 'Project',
      due_date: '2026-10-30',
    });
    const id = createRes.body.data.id;

    // Existing ID
    const foundRes = await request(app).get(`/api/tasks/${id}`);
    assert.equal(foundRes.status, 200);
    assert.equal(foundRes.body.data.id, id);

    // Non-existent ID
    const notFoundRes = await request(app).get('/api/tasks/99999');
    assert.equal(notFoundRes.status, 404);
    assert.equal(notFoundRes.body.success, false);

    // Malformed ID
    const badIdRes = await request(app).get('/api/tasks/abc');
    assert.equal(badIdRes.status, 400);
  });

  it('PUT /api/tasks/:id should update existing task or return 404', async () => {
    const createRes = await request(app).post('/api/tasks').send({
      title: 'Original Title',
      category: 'Assignment',
      due_date: '2026-10-20',
    });
    const id = createRes.body.data.id;

    const updateRes = await request(app).put(`/api/tasks/${id}`).send({
      title: 'Updated Title',
      category: 'Project',
      priority: 'High',
      due_date: '2026-10-22',
      completed: true,
    });

    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.title, 'Updated Title');
    assert.equal(updateRes.body.data.category, 'Project');
    assert.equal(updateRes.body.data.completed, true);

    // Non-existent ID
    const notFoundRes = await request(app).put('/api/tasks/8888').send({
      title: 'Non-existent',
      category: 'Exam',
      due_date: '2026-10-20',
    });
    assert.equal(notFoundRes.status, 404);
  });

  it('PATCH /api/tasks/:id/toggle should toggle completion status', async () => {
    const createRes = await request(app).post('/api/tasks').send({
      title: 'Toggle Task',
      category: 'Assignment',
      due_date: '2026-10-25',
    });
    const id = createRes.body.data.id;
    assert.equal(createRes.body.data.completed, false);

    // Toggle 1 -> true
    const toggle1 = await request(app).patch(`/api/tasks/${id}/toggle`);
    assert.equal(toggle1.status, 200);
    assert.equal(toggle1.body.data.completed, true);

    // Toggle 2 -> false
    const toggle2 = await request(app).patch(`/api/tasks/${id}/toggle`);
    assert.equal(toggle2.status, 200);
    assert.equal(toggle2.body.data.completed, false);

    // Non-existent
    const notFound = await request(app).patch('/api/tasks/9999/toggle');
    assert.equal(notFound.status, 404);
  });

  it('DELETE /api/tasks/:id should delete task and return 404 on subsequent attempts', async () => {
    const createRes = await request(app).post('/api/tasks').send({
      title: 'To Be Deleted',
      category: 'Assignment',
      due_date: '2026-10-25',
    });
    const id = createRes.body.data.id;

    // Delete existing
    const deleteRes = await request(app).delete(`/api/tasks/${id}`);
    assert.equal(deleteRes.status, 200);
    assert.equal(deleteRes.body.success, true);

    // Attempting to delete again should return 404
    const deleteAgain = await request(app).delete(`/api/tasks/${id}`);
    assert.equal(deleteAgain.status, 404);
  });

  it('POST /api/tasks/seed should populate realistic demo deadlines', async () => {
    const seedRes = await request(app).post('/api/tasks/seed');
    assert.equal(seedRes.status, 201);
    assert.equal(seedRes.body.success, true);
    assert.ok(seedRes.body.count >= 5);
    assert.ok(seedRes.body.summary.total >= 5);
  });
});
