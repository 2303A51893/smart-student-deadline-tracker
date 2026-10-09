process.env.USE_TEST_MEMORY_DB = 'true';
process.env.NODE_ENV = 'test';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../../src/app');

describe('Health and DevOps Telemetry Integration Tests', () => {
  it('GET /api should return welcome metadata and endpoint links', async () => {
    const res = await request(app).get('/api');
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Welcome to DeadlineWise REST API');
    assert.ok(res.body.endpoints.health);
  });

  it('GET /api/health should return health probe data with 200 OK', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.service, 'DeadlineWise API');
    assert.equal(res.body.status, 'healthy');
    assert.equal(res.body.database.connected, true);
    assert.ok(res.body.uptimeSeconds >= 0);
  });

  it('GET /api/devops/status should return pipeline and platform telemetry', async () => {
    const res = await request(app).get('/api/devops/status');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.apiHealth.status, 'UP');
    assert.ok(res.body.ciPipeline.configuredWorkflow.includes('.github/workflows/ci.yml'));
  });

  it('GET /api/unknown-route should return structured 404 JSON', async () => {
    const res = await request(app).get('/api/does-not-exist');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.includes('API route not found'));
  });
});
