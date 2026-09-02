import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workspace = new URL('../', import.meta.url);
const supabaseAdminUrl = new URL('functions/api/supabase-admin/[[path]].js', workspace).href;
const globalAuthUrl = new URL('functions/api/global-admin/auth/_middleware.js', workspace).href;

const [{ onRequest: onSupabaseAdmin }, { onRequest: onGlobalAuth }] = await Promise.all([
  import(`${supabaseAdminUrl}?existing-account-test=${Date.now()}`),
  import(`${globalAuthUrl}?existing-account-test=${Date.now()}`)
]);

const originalFetch = globalThis.fetch;
const findings = [];

function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(payload), { ...init, headers });
}

function record(name, passed, detail) {
  findings.push({ name, passed, detail });
}

function check(name, callback, detail) {
  try {
    callback();
    record(name, true, 'OK');
  } catch {
    record(name, false, detail);
  }
}

async function readSource(pathname) {
  return readFile(new URL(pathname, workspace), 'utf8');
}

async function testManagedUserCreationContract() {
  const calls = [];
  const exactPassword = ' Edge Pass#2026 ';

  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const method = String(init.method || 'GET').toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url, method, body });

    if (url.pathname === '/auth/v1/user') {
      return jsonResponse({ id: 'campaign-owner', email: 'owner@example.test' });
    }
    if (url.pathname === '/rest/v1/profiles' && method === 'GET') {
      return jsonResponse([{
        id: 'campaign-owner',
        role: 'ADMIN_CLIENTE',
        status: 'ACTIVE',
        client_id: 'client-existing',
        campaign_id: 'campaign-existing',
        allowed_modules: ['ADMINISTRATIVE']
      }]);
    }
    if (url.pathname === '/auth/v1/admin/users' && method === 'POST') {
      return jsonResponse({ id: 'created-auth-user', email: body.email });
    }
    if (url.pathname === '/rest/v1/profiles' && method === 'POST') {
      return jsonResponse([]);
    }
    if (url.pathname === '/rest/v1/user_permissions' && method === 'POST') {
      return jsonResponse([]);
    }
    return jsonResponse({ message: `Mock inesperado: ${method} ${url.pathname}` }, { status: 500 });
  };

  const response = await onSupabaseAdmin({
    request: new Request('https://software.example.test/api/supabase-admin/managed-user', {
      method: 'POST',
      headers: {
        authorization: 'Bearer campaign-owner-token',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        email: 'Existing.User@Example.Test',
        password: exactPassword,
        displayName: 'Cuenta de regresión',
        role: 'ADMIN_CLIENTE',
        allowedModules: ['ADMINISTRATIVE'],
        permissions: [{ moduleCode: 'ADMINISTRATIVE', functionCode: 'DASHBOARD' }]
      })
    }),
    env: {
      VITE_SUPABASE_URL: 'https://existing-account-test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'public-test-key',
      SUPABASE_SECRET_KEY: 'server-test-key'
    },
    params: { path: ['managed-user'] },
    data: {},
    waitUntil() {}
  });

  const responseBody = await response.json();
  assert.equal(response.status, 201, responseBody.error || 'La creación simulada falló.');

  const authCreate = calls.find((call) => (
    call.url.pathname === '/auth/v1/admin/users' && call.method === 'POST'
  ));
  const profileCreate = calls.find((call) => (
    call.url.pathname === '/rest/v1/profiles' && call.method === 'POST'
  ));

  assert.ok(authCreate, 'No se creó la cuenta en Supabase Auth.');
  assert.equal(authCreate.body.password, exactPassword, 'La contraseña cambió durante la creación.');
  assert.equal(authCreate.body.email, 'existing.user@example.test');
  assert.equal(authCreate.body.email_confirm, true, 'La cuenta no quedó confirmada para iniciar sesión.');
  assert.ok(profileCreate, 'No se creó el perfil asociado.');
  assert.equal(profileCreate.body.id, 'created-auth-user', 'Auth y profile no comparten el mismo id.');
  assert.equal(profileCreate.body.status, 'ACTIVE');
  assert.equal(profileCreate.body.campaign_id, 'campaign-existing');
}

async function testExistingGlobalAccountLogin() {
  const calls = [];
  const exactPassword = ' Admin Pass#2026 ';

  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const method = String(init.method || 'GET').toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : undefined;
    calls.push({ url, method, body });

    if (url.pathname === '/auth/v1/token' && method === 'POST') {
      return jsonResponse({
        access_token: 'existing-account-access-token',
        expires_in: 3600,
        user: { id: 'existing-global-owner', email: 'owner@example.test', factors: [] }
      });
    }
    if (url.pathname === '/rest/v1/profiles' && method === 'GET') {
      return jsonResponse([{
        id: 'existing-global-owner',
        email: 'owner@example.test',
        display_name: 'Propietario existente',
        role: 'GLOBAL_ADMIN',
        status: 'ACTIVO',
        allowed_modules: []
      }]);
    }
    return jsonResponse({ message: `Mock inesperado: ${method} ${url.pathname}` }, { status: 500 });
  };

  const response = await onGlobalAuth({
    request: new Request('https://software.example.test/api/global-admin/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'Owner@Example.Test', password: exactPassword })
    }),
    env: {
      VITE_SUPABASE_URL: 'https://existing-account-test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'public-test-key',
      SUPABASE_SECRET_KEY: 'server-test-key'
    },
    params: {},
    data: {},
    waitUntil() {}
  });

  const payload = await response.json();
  assert.equal(response.status, 200, payload.error || 'El acceso de la cuenta existente falló.');
  assert.equal(payload.success, true);
  assert.equal(payload.session.user.id, 'existing-global-owner');

  const tokenCall = calls.find((call) => call.url.pathname === '/auth/v1/token');
  assert.equal(tokenCall.body.email, 'owner@example.test');
  assert.equal(tokenCall.body.password, exactPassword, 'La contraseña existente fue normalizada o recortada.');
}

try {
  try {
    await testManagedUserCreationContract();
    record('Alta nueva: Auth y profile quedan alineados', true, 'OK');
  } catch (error) {
    record('Alta nueva: Auth y profile quedan alineados', false, error.message);
  }

  try {
    await testExistingGlobalAccountLogin();
    record('Cuenta global existente: credenciales y estado ACTIVO funcionan', true, 'OK');
  } catch (error) {
    record('Cuenta global existente: credenciales y estado ACTIVO funcionan', false, error.message);
  }

  const loginModalSource = await readSource('src/components/LoginModal.tsx');

  const loginModalBody = loginModalSource.match(
    /const handleCredentialsSubmit[\s\S]*?\n  const handlePasswordRecovery/
  )?.[0] || '';
  check(
    'Login modular: conserva exactamente la contraseña',
    () => {
      assert.doesNotMatch(loginModalBody, /password(?:Input)?\.trim\s*\(/);
      assert.match(
        loginModalBody,
        /signInWithPassword\s*\(\s*\{\s*email\s*,\s*password\s*\}\s*\)/
      );
    },
    'No se deben quitar espacios válidos de una contraseña existente'
  );
  check(
    'Login modular: distingue correo no confirmado de credenciales incorrectas',
    () => {
      assert.match(
        loginModalBody,
        /authMessage\.includes\(['"]email not confirmed['"]\)\s*\?\s*['"]AUTH_EMAIL_NOT_CONFIRMED['"]/
      );
      assert.match(
        loginModalBody,
        /code === ['"]AUTH_EMAIL_NOT_CONFIRMED['"][\s\S]{0,240}(?:pendiente de confirmación|confirmar|confirmación)/i
      );
      assert.match(loginModalBody, /Correo o contraseña incorrectos\./);
    },
    'El correo pendiente de confirmación debe tener una instrucción propia y no parecer una contraseña errónea'
  );
  check(
    'Login modular: admite estados ACTIVE y ACTIVO',
    () => assert.match(
      loginModalBody,
      /\[['"]ACTIVE['"],\s*['"]ACTIVO['"]\]|ACTIVE[\s\S]{0,100}ACTIVO/,
      'El modal solo acepta ACTIVE y rechaza perfiles heredados con ACTIVO'
    ),
    'Debe normalizarse el estado antes de decidir si la cuenta está activa'
  );

  for (const finding of findings) {
    console.log(`${finding.passed ? 'PASS' : 'FAIL'} - ${finding.name}${finding.passed ? '' : `: ${finding.detail}`}`);
  }

  const failures = findings.filter((finding) => !finding.passed);
  console.log(`\nResultado: ${findings.length - failures.length}/${findings.length} controles aprobados.`);
  if (failures.length) process.exitCode = 1;
} finally {
  globalThis.fetch = originalFetch;
}
