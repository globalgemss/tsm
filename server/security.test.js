import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

test('health endpoint reports demo-only and security headers', async () => {
  const response = await worker.fetch(
    new Request('https://example.test/api/health'),
    {DB: {}, ASSETS: {fetch: () => new Response('asset')}}
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store, private');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal((await response.json()).demoOnly, true);
});

test('demo APIs fail closed when demo is disabled', async () => {
  const response = await worker.fetch(
    new Request('https://example.test/api/state'),
    {DB: {}, DEMO_ENABLED: 'false', ASSETS: {fetch: () => new Response('asset')}}
  );
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.includes('Production authentication is not configured.'), true);
});

test('demo API rejects cross-origin POST before state access', async () => {
  const response = await worker.fetch(
    new Request('https://example.test/api/command', {
      method: 'POST',
      headers: {'Origin': 'https://untrusted.example', 'Content-Type': 'application/json'},
      body: '{}'
    }),
    {DB: {}, DEMO_ENABLED: 'true', ASSETS: {fetch: () => new Response('asset')}}
  );
  assert.equal(response.status, 403);
});
