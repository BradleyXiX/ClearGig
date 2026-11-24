import test from 'node:test';
import assert from 'node:assert/strict';
import { api, ApiError, API_BASE_URL } from './api.ts';

test('api.updateProject uses PATCH and handles project update', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let interceptedUrl = '';
  let interceptedMethod = '';
  let interceptedBody = '';
  let interceptedHeaders: Record<string, string> = {};

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    interceptedUrl = String(input);
    interceptedMethod = init?.method ?? 'GET';
    interceptedBody = String(init?.body ?? '');
    interceptedHeaders = (init?.headers as Record<string, string>) ?? {};

    return new Response(
      JSON.stringify({
        id: 'proj-123',
        clientId: 'client-1',
        title: 'Updated Title',
        status: 'SENT',
        contingencyPercentage: 15,
        profitMargin: 20,
        createdAt: '2026-11-20T00:00:00.000Z',
        updatedAt: '2026-11-24T00:00:00.000Z',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  };

  const payload = {
    title: 'Updated Title',
    status: 'SENT',
    contingency_percentage: 15,
    profit_margin: 20,
  };

  const result = await api.updateProject('proj-123', payload);

  assert.equal(interceptedUrl, `${API_BASE_URL}/projects/proj-123`);
  assert.equal(interceptedMethod, 'PATCH');
  assert.equal(interceptedHeaders['Content-Type'], 'application/json');
  assert.equal(interceptedBody, JSON.stringify(payload));
  assert.equal(result.id, 'proj-123');
  assert.equal(result.title, 'Updated Title');
});

test('api.deleteProject handles 204 No Content without attempting JSON parse', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let interceptedUrl = '';
  let interceptedMethod = '';

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    interceptedUrl = String(input);
    interceptedMethod = init?.method ?? 'GET';
    return new Response(null, { status: 204 });
  };

  const result = await api.deleteProject('proj-123');
  assert.equal(interceptedUrl, `${API_BASE_URL}/projects/proj-123`);
  assert.equal(interceptedMethod, 'DELETE');
  assert.equal(result, undefined);
});

test('api handles normal JSON success and returns parsed data', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify([{ id: 'c1', name: 'Client 1', createdAt: '2026-11-01T00:00:00.000Z' }]),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  };

  const clients = await api.getClients();
  assert.equal(clients.length, 1);
  assert.equal(clients[0].name, 'Client 1');
});

test('api handles structured JSON error responses with status and code', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    return new Response(
      JSON.stringify({
        error: 'Project not found',
        message: 'Project proj-missing was not found',
        code: 'NOT_FOUND',
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  };

  await assert.rejects(
    async () => {
      await api.getProjectById('proj-missing');
    },
    (err: unknown) => {
      assert(err instanceof ApiError);
      assert.equal(err.status, 404);
      assert.equal(err.message, 'Project proj-missing was not found');
      assert.equal(err.code, 'NOT_FOUND');
      return true;
    }
  );
});

test('api handles non-JSON error responses (e.g. proxy HTML error) gracefully', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = async () => {
    return new Response('<html><body>502 Bad Gateway</body></html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });
  };

  await assert.rejects(
    async () => {
      await api.getProjects();
    },
    (err: unknown) => {
      assert(err instanceof ApiError);
      assert.equal(err.status, 502);
      assert.equal(err.message, 'Request failed (502)');
      assert.equal(err.code, undefined);
      return true;
    }
  );
});
