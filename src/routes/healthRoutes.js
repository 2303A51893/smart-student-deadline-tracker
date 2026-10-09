/**
 * Health & DevOps Status Routes
 * Provides production-safe monitoring and pipeline status endpoints.
 */

const express = require('express');
const router = express.Router();
const { checkDbHealth } = require('../db');

/**
 * GET /api/health
 * Basic liveness and readiness probe for container orchestrators and monitoring
 */
router.get('/health', async (req, res) => {
  const dbHealth = await checkDbHealth();
  const uptimeSeconds = Math.floor(process.uptime());

  const statusCode = dbHealth.connected ? 200 : 503;

  return res.status(statusCode).json({
    status: dbHealth.connected ? 'healthy' : 'degraded',
    service: 'DeadlineWise API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds,
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbHealth.connected,
      provider: dbHealth.provider,
      message: dbHealth.message,
    },
    system: {
      nodeVersion: process.version,
      memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  });
});

/**
 * GET /api/devops/status
 * Exposes honest CI/CD pipeline and environment metrics.
 * Note: Never fabricates a successful pipeline run.
 */
router.get('/devops/status', async (req, res) => {
  const dbHealth = await checkDbHealth();

  // Inspect actual environment variables provided by GitHub Actions or deployment platforms
  const ciEnv = process.env.CI ? true : false;
  const githubRepo = process.env.GITHUB_REPOSITORY || null;
  const githubSha = process.env.GITHUB_SHA || process.env.RENDER_GIT_COMMIT || null;
  const githubRef = process.env.GITHUB_REF || null;
  const deployPlatform = process.env.RENDER ? 'Render Cloud' : 'Local / Custom Host';

  return res.status(200).json({
    success: true,
    service: 'DeadlineWise',
    environment: process.env.NODE_ENV || 'development',
    platform: deployPlatform,
    apiHealth: {
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
    },
    databaseHealth: {
      connected: dbHealth.connected,
      provider: dbHealth.provider,
      details: dbHealth.message,
    },
    ciPipeline: {
      isCiEnvironment: ciEnv,
      repository: githubRepo || 'Not configured in current runtime',
      commitSha: githubSha ? githubSha.substring(0, 7) : 'Local workspace',
      branch: githubRef || 'main',
      configuredWorkflow: '.github/workflows/ci.yml (Automated tests, lint, and build)',
      statusNote: githubSha
        ? `Built from commit ${githubSha.substring(0, 7)}`
        : 'Running in local development. Trigger CI by pushing to GitHub.',
    },
  });
});

module.exports = router;
