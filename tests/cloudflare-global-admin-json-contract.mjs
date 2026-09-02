import assert from 'node:assert/strict';

const functionUrl = new URL('../functions/api/global-admin/[[path]].js', import.meta.url).href;

const { onRequest } = await import(`${functionUrl}?contract-test=${Date.now()}`);
assert.equal(typeof onRequest, 'function', 'La Function debe exportar onRequest(context).');

const supabaseCalls = [];
const originalFetch = globalThis.fetch;

function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json; charset=utf-8');
  }
  return new Response(JSON.stringify(payload), { ...init, headers });
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  supabaseCalls.push({ url: url.href, method: String(init.method || 'GET').toUpperCase() });

  if (url.pathname === '/auth/v1/user') {
    return jsonResponse({
      id: 'admin-contract-test',
      email: 'admin@example.test',
      factors: []
    });
  }

  if (url.pathname === '/auth/v1/health') {
    return jsonResponse({ version: 'contract-test' });
  }

  if (url.pathname === '/rest/v1/profiles') {
    return jsonResponse([{
      id: 'admin-contract-test',
      email: 'admin@example.test',
      display_name: 'Administrador de prueba',
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      allowed_modules: ['GLOBAL_ADMIN_FULL']
    }]);
  }

  if (url.pathname === '/rest/v1/campaigns') {
    return jsonResponse([{
      id: 'campaign-contract-test',
      code: 'CAM-TEST',
      name: 'Campaña de prueba',
      candidate_name: 'Candidata de prueba',
      type: 'ALCALDIA',
      department: 'Córdoba',
      city: 'Cotorra',
      status: 'ACTIVE',
      created_at: '2026-09-02T00:00:00.000Z'
    }]);
  }

  if (url.pathname === '/rest/v1/modules') {
    return jsonResponse([{
      id: 'module-contract-test',
      code: 'ADMINISTRATIVE',
      name: 'Gestión Administrativa',
      description: 'Módulo de prueba',
      created_at: '2026-09-02T00:00:00.000Z'
    }]);
  }

  if (url.pathname === '/rest/v1/module_functions') {
    return jsonResponse([]);
  }

  if (url.pathname === '/rest/v1/audit_logs' || url.pathname === '/rest/v1/custom_roles') {
    return jsonResponse([]);
  }

  return jsonResponse({ message: `Mock Supabase sin ruta para ${url.pathname}` }, { status: 404 });
};

const env = {
  VITE_SUPABASE_URL: 'https://contract-test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'anon-contract-test',
  SUPABASE_SECRET_KEY: 'service-role-contract-test'
};

async function invoke(pathname, method = 'GET') {
  const wildcard = pathname
    .replace(/^\/api\/global-admin\/?/, '')
    .split('/')
    .filter(Boolean);

  return onRequest({
    request: new Request(`https://software.example.test${pathname}`, {
      method,
      headers: { authorization: 'Bearer valid-contract-test-token' }
    }),
    env,
    params: { path: wildcard },
    data: {},
    waitUntil() {},
    // Simula el fallback SPA de Pages. La Function nunca debe delegar una ruta API aquí.
    next: async () => new Response('<!doctype html><html><body>SPA fallback</body></html>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    })
  });
}

async function assertJsonOnly(pathname, expectedStatus) {
  const response = await invoke(pathname);
  const body = await response.text();
  const contentType = response.headers.get('content-type') || '';

  assert.equal(response.status, expectedStatus, `${pathname} devolvió estado ${response.status}.`);
  assert.match(contentType, /^application\/json\b/i, `${pathname} no devolvió Content-Type JSON.`);
  assert.doesNotMatch(body.trimStart(), /^<(?:!doctype|html)\b/i, `${pathname} filtró HTML.`);
  assert.doesNotThrow(() => JSON.parse(body), `${pathname} devolvió un cuerpo que no es JSON válido.`);

  return JSON.parse(body);
}

try {
  const apis = await assertJsonOnly('/api/global-admin/apis', 200);
  assert.equal(apis.success, true);
  assert.ok(Array.isArray(apis.apis), '/apis debe incluir un arreglo apis.');

  const campaigns = await assertJsonOnly('/api/global-admin/campaigns', 200);
  assert.equal(campaigns.success, true);
  assert.ok(Array.isArray(campaigns.campaigns), '/campaigns debe incluir un arreglo campaigns.');

  const successfulReads = [
    '/api/global-admin/permissions',
    '/api/global-admin/roles',
    '/api/global-admin/modules',
    '/api/global-admin/audit-logs',
    '/api/global-admin/security/events',
    '/api/global-admin/config',
    '/api/global-admin/system/health'
  ];
  for (const pathname of successfulReads) {
    const payload = await assertJsonOnly(pathname, 200);
    assert.equal(payload.success, true, `${pathname} no confirmó success=true.`);
  }

  const unknown = await assertJsonOnly('/api/global-admin/ruta-inexistente', 404);
  assert.equal(unknown.success, false);
  assert.equal(typeof unknown.error, 'string');

  assert.ok(
    supabaseCalls.some(({ url }) => new URL(url).pathname === '/auth/v1/health'),
    '/apis no consultó el estado de Supabase.'
  );
  assert.ok(
    supabaseCalls.some(({ url }) => new URL(url).pathname === '/rest/v1/campaigns'),
    '/campaigns no consultó la tabla campaigns.'
  );

  console.log('Cloudflare global-admin JSON contract: 10/10 rutas válidas; no se filtró HTML.');
} finally {
  globalThis.fetch = originalFetch;
}
