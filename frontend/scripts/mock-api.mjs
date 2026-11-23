#!/usr/bin/env node
/**
 * Deterministic in-memory mock ClearGig API server for local UI previews and tests.
 * Never reads .env, never runs Prisma migrations, and never writes to any database.
 *
 * Usage:
 *   node scripts/mock-api.mjs [--port 5001] [--mode ok|unavailable]
 *
 * Mirrors actual backend/routes/*.js contracts (including PATCH /projects/:id
 * and 204 No Content on DELETE /projects/:id).
 */
import http from 'node:http';
import { FIXTURE_CLIENTS, FIXTURE_PROJECTS, FIXTURE_ERRORS } from './fixtures/mock-data.mjs';

const args = process.argv.slice(2);
const portIdx = args.indexOf('--port');
const modeIdx = args.indexOf('--mode');
const PORT = Number(portIdx >= 0 ? args[portIdx + 1] : process.env.MOCK_API_PORT ?? 5001);
const MODE = modeIdx >= 0 ? args[modeIdx + 1] : (process.env.MOCK_API_MODE ?? 'ok');

const clients = structuredClone(FIXTURE_CLIENTS);
const projects = structuredClone(FIXTURE_PROJECTS);
let nextId = 100;

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function sendEmpty(res, status) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return sendEmpty(res, 200);
  }

  const url = new URL(req.url ?? '/', `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/api/v1/health' || pathname === '/health') {
    return sendJson(res, 200, { status: 'ok', message: 'ClearGig Mock API (in-memory fixtures)' });
  }

  if (MODE === 'unavailable' || url.searchParams.get('mockError') === '503') {
    return sendJson(res, FIXTURE_ERRORS.unavailable.status, FIXTURE_ERRORS.unavailable.body);
  }

  try {
    if (pathname === '/api/v1/clients' && req.method === 'GET') {
      return sendJson(res, 200, clients);
    }

    if (pathname === '/api/v1/clients' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.name) {
        return sendJson(res, FIXTURE_ERRORS.badRequest.status, FIXTURE_ERRORS.badRequest.body);
      }
      const created = {
        id: `client-sample-${++nextId}`,
        name: String(body.name),
        email: body.email ? String(body.email) : undefined,
        createdAt: new Date().toISOString(),
      };
      clients.push(created);
      return sendJson(res, 201, created);
    }

    if (pathname === '/api/v1/projects' && req.method === 'GET') {
      return sendJson(res, 200, projects);
    }

    if (pathname === '/api/v1/projects' && req.method === 'POST') {
      const body = await readBody(req);
      if (!body.client_id || !body.title) {
        return sendJson(res, FIXTURE_ERRORS.badRequest.status, FIXTURE_ERRORS.badRequest.body);
      }
      const client = clients.find((c) => c.id === body.client_id);
      const created = {
        id: `proj-sample-${++nextId}`,
        clientId: body.client_id,
        title: String(body.title),
        status: 'DRAFT',
        contingencyPercentage: Number(body.contingency_percentage ?? 0),
        profitMargin: Number(body.profit_margin ?? 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        client,
        lineItems: [],
      };
      projects.push(created);
      return sendJson(res, 201, created);
    }

    const projectMatch = pathname.match(/^\/api\/v1\/projects\/([^/]+)$/);
    if (projectMatch) {
      const id = decodeURIComponent(projectMatch[1]);
      const idx = projects.findIndex((p) => p.id === id);

      if (req.method === 'GET') {
        if (idx === -1) return sendJson(res, FIXTURE_ERRORS.notFound.status, FIXTURE_ERRORS.notFound.body);
        return sendJson(res, 200, projects[idx]);
      }

      if (req.method === 'PATCH') {
        if (idx === -1) return sendJson(res, FIXTURE_ERRORS.notFound.status, FIXTURE_ERRORS.notFound.body);
        const body = await readBody(req);
        const target = projects[idx];
        if (body.title !== undefined) target.title = String(body.title);
        if (body.status !== undefined) target.status = String(body.status);
        if (body.contingency_percentage !== undefined) {
          target.contingencyPercentage = Number(body.contingency_percentage);
        }
        if (body.profit_margin !== undefined) {
          target.profitMargin = Number(body.profit_margin);
        }
        target.updatedAt = new Date().toISOString();
        return sendJson(res, 200, target);
      }

      if (req.method === 'DELETE') {
        if (idx === -1) return sendJson(res, FIXTURE_ERRORS.notFound.status, FIXTURE_ERRORS.notFound.body);
        projects.splice(idx, 1);
        return sendEmpty(res, 204);
      }
    }

    const lineItemCreateMatch = pathname.match(/^\/api\/v1\/projects\/([^/]+)\/line-items$/);
    if (lineItemCreateMatch && req.method === 'POST') {
      const projectId = decodeURIComponent(lineItemCreateMatch[1]);
      const project = projects.find((p) => p.id === projectId);
      if (!project) return sendJson(res, FIXTURE_ERRORS.notFound.status, FIXTURE_ERRORS.notFound.body);
      const body = await readBody(req);
      const created = {
        id: `li-sample-${++nextId}`,
        projectId,
        category: body.category ?? 'FRONTEND',
        description: String(body.description ?? ''),
        estimatedHours: Number(body.estimated_hours ?? 0),
        hourlyRate: Number(body.hourly_rate ?? 0),
        isRecurring: Boolean(body.is_recurring),
      };
      project.lineItems.push(created);
      return sendJson(res, 201, created);
    }

    const lineItemDeleteMatch = pathname.match(/^\/api\/v1\/line-items\/([^/]+)$/);
    if (lineItemDeleteMatch && req.method === 'DELETE') {
      const itemId = decodeURIComponent(lineItemDeleteMatch[1]);
      for (const p of projects) {
        const idx = p.lineItems.findIndex((li) => li.id === itemId);
        if (idx !== -1) {
          p.lineItems.splice(idx, 1);
          return sendJson(res, 200, { message: 'Line item deleted' });
        }
      }
      return sendJson(res, FIXTURE_ERRORS.notFound.status, FIXTURE_ERRORS.notFound.body);
    }

    return sendJson(res, 404, { error: 'Not found', message: `No mock route for ${req.method} ${pathname}` });
  } catch (err) {
    return sendJson(res, 400, { error: 'Invalid JSON', message: err instanceof Error ? err.message : 'Bad request' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`ClearGig deterministic mock API listening on http://127.0.0.1:${PORT}/api/v1 (mode=${MODE})`);
});
