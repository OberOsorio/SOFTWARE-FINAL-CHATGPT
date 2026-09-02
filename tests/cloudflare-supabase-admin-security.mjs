import assert from 'node:assert/strict';

const functionUrl = new URL('../functions/api/supabase-admin/[[path]].js', import.meta.url).href;
const { onRequest } = await import(`${functionUrl}?security-test=${Date.now()}`);

assert.equal(typeof onRequest, 'function', 'La Function debe exportar onRequest(context).');

const originalFetch = globalThis.fetch;
const calls = [];
let scenario = '';

const env = {
  VITE_SUPABASE_URL: 'https://security-test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'anon-security-test',
  SUPABASE_SECRET_KEY: 'service-role-security-test'
};

function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(payload), { ...init, headers });
}

function requestMethod(input, init) {
  return String(init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
}

function adminClientProfile() {
  return {
    id: 'requester-admin-client',
    role: 'ADMIN_CLIENTE',
    status: 'ACTIVE',
    client_id: 'client-1',
    campaign_id: 'campaign-1',
    allowed_modules: ['ADMINISTRATIVE']
  };
}

function globalOwnerProfile() {
  return {
    id: 'requester-global-owner',
    role: 'SUPERADMIN',
    status: 'ACTIVE',
    client_id: null,
    campaign_id: null,
    allowed_modules: ['GLOBAL_ADMIN_FULL']
  };
}

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  const method = requestMethod(input, init);
  const call = { url, method, body: init.body ? JSON.parse(String(init.body)) : undefined };
  calls.push(call);

  if (url.pathname === '/auth/v1/user') {
    return jsonResponse({
      id: scenario === 'linked-campaign' ? 'requester-global-owner' : 'requester-admin-client',
      email: 'requester@example.test'
    });
  }

  if (url.pathname === '/rest/v1/profiles' && method === 'GET') {
    if (url.searchParams.get('campaign_id') === 'eq.campaign-with-users') {
      return jsonResponse([{ id: 'linked-user-1' }]);
    }

    if (url.searchParams.has('id')) {
      return jsonResponse([
        scenario === 'linked-campaign' ? globalOwnerProfile() : adminClientProfile()
      ]);
    }

    return jsonResponse([]);
  }

  if (url.pathname === '/auth/v1/admin/users' && method === 'POST') {
    return jsonResponse(
      { message: 'A user with this email address has already been registered' },
      { status: 422 }
    );
  }

  return jsonResponse(
    { message: `El mock no esperaba ${method} ${url.pathname}${url.search}` },
    { status: 500 }
  );
};

function wildcardFor(pathname) {
  return pathname
    .replace(/^\/api\/supabase-admin\/?/, '')
    .split('/')
    .filter(Boolean);
}

async function invoke(pathname, { method = 'POST', body } = {}) {
  const headers = new Headers({ authorization: 'Bearer requester-token' });
  if (body !== undefined) headers.set('content-type', 'application/json');

  const response = await onRequest({
    request: new Request(`https://software.example.test${pathname}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    }),
    env,
    params: { path: wildcardFor(pathname) },
    data: {},
    waitUntil() {},
    next: async () => new Response('<!doctype html><html>SPA fallback</html>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    })
  });

  const rawBody = await response.text();
  const contentType = response.headers.get('content-type') || '';
  assert.match(contentType, /^application\/json\b/i, `${pathname} no devolvió Content-Type JSON.`);
  assert.doesNotMatch(rawBody.trimStart(), /^<(?:!doctype|html)\b/i, `${pathname} filtró HTML.`);
  assert.doesNotThrow(() => JSON.parse(rawBody), `${pathname} no devolvió JSON válido.`);

  return { response, payload: JSON.parse(rawBody) };
}

function resetScenario(nextScenario) {
  scenario = nextScenario;
  calls.length = 0;
}

function callsTo(pathname, method) {
  return calls.filter((call) => (
    call.url.pathname === pathname && (!method || call.method === method)
  ));
}

try {
  resetScenario('existing-email');
  const existingEmail = await invoke('/api/supabase-admin/managed-user', {
    body: {
      email: 'existing@example.test',
      password: 'Secure#Pass123',
      displayName: 'Usuario existente',
      role: 'COORDINADOR',
      allowedModules: ['ADMINISTRATIVE']
    }
  });
  assert.equal(existingEmail.response.status, 409);
  assert.match(existingEmail.payload.error, /solo el propietario global/i);
  assert.equal(
    calls.some((call) => call.url.pathname.startsWith('/auth/v1/admin/users/') && call.method === 'PUT'),
    false,
    'ADMIN_CLIENTE no debe modificar ni apropiarse de una cuenta Auth existente.'
  );
  assert.equal(
    callsTo('/rest/v1/profiles', 'POST').length,
    0,
    'ADMIN_CLIENTE no debe crear un perfil para el correo Auth existente.'
  );

  resetScenario('foreign-module');
  const foreignModule = await invoke('/api/supabase-admin/managed-user', {
    body: {
      email: 'new-user@example.test',
      password: 'Secure#Pass123',
      displayName: 'Usuario nuevo',
      role: 'COORDINADOR',
      allowedModules: ['STRATEGY'],
      permissions: [{ moduleCode: 'STRATEGY', functionCode: 'DASHBOARD' }]
    }
  });
  assert.equal(foreignModule.response.status, 403);
  assert.match(foreignModule.payload.error, /no puedes delegar módulos/i);
  assert.equal(
    callsTo('/auth/v1/admin/users', 'POST').length,
    0,
    'La validación de módulos debe ocurrir antes de crear la cuenta Auth.'
  );

  resetScenario('linked-campaign');
  const linkedCampaign = await invoke('/api/supabase-admin/campaigns/campaign-with-users', {
    method: 'DELETE'
  });
  assert.equal(linkedCampaign.response.status, 409);
  assert.match(linkedCampaign.payload.error, /usuarios vinculados/i);
  assert.equal(
    callsTo('/rest/v1/campaigns', 'DELETE').length,
    0,
    'No debe eliminarse la campaña mientras tenga perfiles vinculados.'
  );
  assert.equal(
    calls.some((call) => call.url.pathname.startsWith('/auth/v1/admin/users') && call.method === 'DELETE'),
    false,
    'No debe eliminarse ninguna cuenta Auth al rechazar la eliminación de la campaña.'
  );

  console.log('Cloudflare Supabase Admin security: 4/4 controles aprobados; todas las respuestas fueron JSON.');
} finally {
  globalThis.fetch = originalFetch;
}
