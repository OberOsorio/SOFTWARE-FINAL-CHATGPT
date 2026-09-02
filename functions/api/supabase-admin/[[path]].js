const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'x-content-type-options': 'nosniff'
};

const GLOBAL_OWNER_ROLES = ['SUPERADMIN', 'GLOBAL_ADMIN'];
const MANAGER_ROLES = [...GLOBAL_OWNER_ROLES, 'ADMIN_CLIENTE', 'ADMINISTRADOR'];
const ACTIVE_STATUSES = ['ACTIVE', 'ACTIVO'];

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

function clean(value) {
  return String(value || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/[\r\n]/g, '');
}

function getConfiguration(env) {
  const url = clean(env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL)
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/$/, '');
  const publicKey = clean(
    env.VITE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const serverKey = clean(env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);

  return { url, publicKey, serverKey };
}

function bearerToken(request) {
  const authorization = request.headers.get('authorization') || '';
  return authorization.toLowerCase().startsWith('bearer ')
    ? authorization.slice(7).trim()
    : '';
}

async function parseRequestBody(request) {
  try {
    return { body: await request.json() };
  } catch {
    return { error: json({ error: 'La solicitud enviada no contiene un JSON válido.' }, 400) };
  }
}

function errorMessage(payload, fallback) {
  if (!payload || typeof payload !== 'object') return fallback;
  return String(
    payload.message ||
    payload.msg ||
    payload.error_description ||
    payload.error ||
    payload.details ||
    fallback
  );
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: 'Supabase devolvió una respuesta no válida.' };
    }
  }
  return { ok: response.ok, status: response.status, data };
}

function serviceHeaders(configuration, withBody = false, prefer = '') {
  const headers = {
    apikey: configuration.serverKey,
    authorization: `Bearer ${configuration.serverKey}`,
    accept: 'application/json'
  };
  if (withBody) headers['content-type'] = 'application/json';
  if (prefer) headers.prefer = prefer;
  return headers;
}

async function readAuthenticatedUser(configuration, token) {
  const result = await fetchJson(`${configuration.url}/auth/v1/user`, {
    headers: {
      apikey: configuration.publicKey || configuration.serverKey,
      authorization: `Bearer ${token}`,
      accept: 'application/json'
    }
  });
  if (!result.ok || !result.data?.id) return null;
  return result.data;
}

async function restRequest(configuration, table, options = {}) {
  const url = new URL(`${configuration.url}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const method = options.method || 'GET';
  const withBody = options.body !== undefined;
  return fetchJson(url, {
    method,
    headers: serviceHeaders(configuration, withBody, options.prefer || ''),
    body: withBody ? JSON.stringify(options.body) : undefined
  });
}

async function readProfile(configuration, userId, select = 'id,role,status,client_id,campaign_id,allowed_modules') {
  const result = await restRequest(configuration, 'profiles', {
    query: { id: `eq.${userId}`, select, limit: 1 }
  });
  if (!result.ok) return { error: result };
  const rows = Array.isArray(result.data) ? result.data : [];
  return { profile: rows[0] || null };
}

async function verifyRequester(request, configuration, allowedRoles) {
  const token = bearerToken(request);
  if (!token) {
    return { error: json({ error: 'Sesión administrativa requerida.' }, 401) };
  }

  const user = await readAuthenticatedUser(configuration, token);
  if (!user) {
    return { error: json({ error: 'La sesión administrativa expiró. Inicia sesión nuevamente.' }, 401) };
  }

  const profileResult = await readProfile(configuration, user.id);
  if (profileResult.error) {
    return { error: json({ error: 'No fue posible validar el perfil administrativo.' }, 502) };
  }

  const profile = profileResult.profile;
  const role = String(profile?.role || '').trim().toUpperCase();
  const status = String(profile?.status || '').trim().toUpperCase();
  if (!profile || !allowedRoles.includes(role) || !ACTIVE_STATUSES.includes(status)) {
    return { error: json({ error: 'Tu cuenta no tiene permisos para realizar esta acción.' }, 403) };
  }

  return { token, user, profile, role };
}

function authAdminUrl(configuration, userId = '') {
  const suffix = userId ? `/${encodeURIComponent(userId)}` : '';
  return `${configuration.url}/auth/v1/admin/users${suffix}`;
}

async function createAuthUser(configuration, attributes) {
  return fetchJson(authAdminUrl(configuration), {
    method: 'POST',
    headers: serviceHeaders(configuration, true),
    body: JSON.stringify(attributes)
  });
}

async function updateAuthUser(configuration, userId, attributes) {
  return fetchJson(authAdminUrl(configuration, userId), {
    method: 'PUT',
    headers: serviceHeaders(configuration, true),
    body: JSON.stringify(attributes)
  });
}

async function deleteAuthUser(configuration, userId) {
  return fetchJson(authAdminUrl(configuration, userId), {
    method: 'DELETE',
    headers: serviceHeaders(configuration)
  });
}

function authUserFrom(payload) {
  return payload?.user || payload?.data?.user || (payload?.id ? payload : null);
}

async function upsertProfile(configuration, profile) {
  return restRequest(configuration, 'profiles', {
    method: 'POST',
    query: { on_conflict: 'id' },
    body: profile,
    prefer: 'resolution=merge-duplicates,return=minimal'
  });
}

async function createCampaignUser(request, configuration) {
  const requester = await verifyRequester(request, configuration, GLOBAL_OWNER_ROLES);
  if (requester.error) return requester.error;

  const parsed = await parseRequestBody(request);
  if (parsed.error) return parsed.error;
  const email = String(parsed.body?.email || '').trim().toLowerCase();
  const password = String(parsed.body?.password || '');
  const displayName = String(parsed.body?.displayName || '').trim();
  const campaignId = String(parsed.body?.campaignId || '').trim();
  if (!email || !password || !displayName || !campaignId) {
    return json({ error: 'Correo, contraseña, responsable y campaña son obligatorios.' }, 400);
  }
  if (password.length < 10) {
    return json({ error: 'La contraseña debe tener al menos 10 caracteres.' }, 400);
  }

  const campaignResult = await restRequest(configuration, 'campaigns', {
    query: { id: `eq.${campaignId}`, select: 'id,client_id', limit: 1 }
  });
  const campaign = Array.isArray(campaignResult.data) ? campaignResult.data[0] : null;
  if (!campaignResult.ok || !campaign) {
    return json({ error: 'La campaña indicada no existe o no está disponible.' }, 404);
  }

  const createResult = await createAuthUser(configuration, {
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      campaign_id: campaign.id,
      client_id: campaign.client_id || null
    }
  });
  const createdUser = authUserFrom(createResult.data);
  if (!createResult.ok || !createdUser) {
    return json({ error: errorMessage(createResult.data, 'No fue posible crear el usuario.') }, 400);
  }

  const profileResult = await upsertProfile(configuration, {
    id: createdUser.id,
    email,
    display_name: displayName,
    role: 'ADMIN_CLIENTE',
    status: 'ACTIVE',
    client_id: campaign.client_id || null,
    campaign_id: campaign.id,
    allowed_modules: ['ADMINISTRATIVE', 'TERRITORY', 'STRATEGY', 'CRM', 'DAY_D'],
    updated_at: new Date().toISOString()
  });

  if (!profileResult.ok) {
    await deleteAuthUser(configuration, createdUser.id).catch(() => undefined);
    return json({
      error: `No se pudo vincular el perfil: ${errorMessage(profileResult.data, 'Error desconocido.')}`
    }, 400);
  }

  return json({
    success: true,
    user: { id: createdUser.id, email: createdUser.email || email, campaignId: campaign.id }
  }, 201);
}

async function listAuthUserByEmail(configuration, email) {
  for (let page = 1; page <= 10; page += 1) {
    const url = new URL(authAdminUrl(configuration));
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', '100');
    const result = await fetchJson(url, { headers: serviceHeaders(configuration) });
    if (!result.ok) return { error: result };
    const users = Array.isArray(result.data?.users) ? result.data.users : [];
    const user = users.find((candidate) => String(candidate.email || '').toLowerCase() === email);
    if (user) return { user };
    if (users.length < 100) break;
  }
  return { user: null };
}

async function resolveCampaignScope(configuration, profile) {
  let clientId = profile.client_id || null;
  let campaignId = profile.campaign_id || null;
  if (!campaignId && clientId) {
    const legacyResult = await restRequest(configuration, 'campaigns', {
      query: { id: `eq.${clientId}`, select: 'id,client_id', limit: 1 }
    });
    if (legacyResult.ok && Array.isArray(legacyResult.data) && legacyResult.data[0]) {
      campaignId = legacyResult.data[0].id;
      clientId = legacyResult.data[0].client_id || null;
    } else {
      const campaignsResult = await restRequest(configuration, 'campaigns', {
        query: { client_id: `eq.${clientId}`, select: 'id', limit: 2 }
      });
      if (campaignsResult.ok && Array.isArray(campaignsResult.data) && campaignsResult.data.length === 1) {
        campaignId = campaignsResult.data[0].id;
      }
    }
  }
  return { clientId, campaignId };
}

async function deleteProfile(configuration, userId) {
  return restRequest(configuration, 'profiles', {
    method: 'DELETE',
    query: { id: `eq.${userId}` },
    prefer: 'return=minimal'
  });
}

async function createManagedUser(request, configuration) {
  const requester = await verifyRequester(request, configuration, MANAGER_ROLES);
  if (requester.error) return requester.error;

  const parsed = await parseRequestBody(request);
  if (parsed.error) return parsed.error;
  const email = String(parsed.body?.email || '').trim().toLowerCase();
  const password = String(parsed.body?.password || '');
  const displayName = String(parsed.body?.displayName || '').trim();
  if (!email || !displayName || !password) {
    return json({ error: 'Nombre, correo y contraseña son obligatorios.' }, 400);
  }
  if (password.length < 10) {
    return json({ error: 'La contraseña debe tener al menos 10 caracteres.' }, 400);
  }

  const requestedRole = String(parsed.body?.role || '').trim().toUpperCase();
  const role = ['ADMIN_CLIENTE', 'DIRECTOR', 'COORDINADOR'].includes(requestedRole)
    ? requestedRole
    : 'ADMIN_CLIENTE';
  const allowedModules = Array.isArray(parsed.body?.allowedModules)
    ? [...new Set(parsed.body.allowedModules.map((value) => String(value).trim().toUpperCase()).filter(Boolean))]
    : [];
  const permissions = Array.isArray(parsed.body?.permissions) ? parsed.body.permissions : [];
  if (permissions.some((permission) => (
    !String(permission?.moduleCode || '').trim() || !String(permission?.functionCode || '').trim()
  ))) {
    return json({ error: 'La selección de permisos contiene valores incompletos.' }, 400);
  }
  const requesterIsGlobalOwner = GLOBAL_OWNER_ROLES.includes(requester.role);
  const requesterModules = new Set(
    (Array.isArray(requester.profile.allowed_modules) ? requester.profile.allowed_modules : [])
      .map((value) => String(value).trim().toUpperCase())
  );
  if (!requesterIsGlobalOwner) {
    const delegatedModules = new Set([
      ...allowedModules,
      ...permissions.map((permission) => String(permission?.moduleCode || '').trim().toUpperCase()).filter(Boolean)
    ]);
    const unauthorizedModule = [...delegatedModules].find((moduleCode) => !requesterModules.has(moduleCode));
    if (unauthorizedModule) {
      return json({
        error: 'No puedes delegar módulos que no están habilitados en tu propia cuenta.'
      }, 403);
    }
  }
  const { clientId, campaignId } = await resolveCampaignScope(configuration, requester.profile);
  const metadata = {
    display_name: displayName,
    role,
    client_id: clientId,
    campaign_id: campaignId
  };

  let targetUser = null;
  let createdNow = false;
  const createResult = await createAuthUser(configuration, {
    email,
    password,
    email_confirm: true,
    user_metadata: metadata
  });
  const newlyCreated = authUserFrom(createResult.data);
  if (createResult.ok && newlyCreated) {
    targetUser = newlyCreated;
    createdNow = true;
  } else if (errorMessage(createResult.data, '').toLowerCase().includes('already')) {
    if (!requesterIsGlobalOwner) {
      return json({
        error: 'El correo ya existe. Solo el propietario global puede reparar una cuenta de Auth sin perfil.'
      }, 409);
    }
    const existingResult = await listAuthUserByEmail(configuration, email);
    if (existingResult.error) {
      return json({ error: errorMessage(existingResult.error.data, 'No fue posible consultar la cuenta existente.') }, 400);
    }
    targetUser = existingResult.user;
    if (!targetUser) {
      return json({ error: 'El correo ya existe, pero no fue posible recuperar la cuenta.' }, 409);
    }

    const profileResult = await readProfile(configuration, targetUser.id, 'id');
    if (profileResult.error) {
      return json({ error: 'No fue posible validar la cuenta existente.' }, 400);
    }
    if (profileResult.profile) {
      return json({ error: 'Ya existe un usuario registrado con este correo.' }, 409);
    }

    const repairResult = await updateAuthUser(configuration, targetUser.id, {
      password,
      email_confirm: true,
      user_metadata: metadata
    });
    if (!repairResult.ok) {
      return json({ error: errorMessage(repairResult.data, 'No fue posible reparar la cuenta existente.') }, 400);
    }
  } else {
    return json({ error: errorMessage(createResult.data, 'No fue posible crear el acceso.') }, 400);
  }

  const profileResult = await upsertProfile(configuration, {
    id: targetUser.id,
    client_id: clientId,
    campaign_id: campaignId,
    email,
    display_name: displayName,
    role,
    status: 'ACTIVE',
    allowed_modules: allowedModules,
    updated_at: new Date().toISOString()
  });
  if (!profileResult.ok) {
    if (createdNow) await deleteAuthUser(configuration, targetUser.id).catch(() => undefined);
    return json({
      error: `No se pudo crear el perfil: ${errorMessage(profileResult.data, 'Error desconocido.')}`
    }, 400);
  }

  if (permissions.length) {
    const permissionRows = permissions.map((permission) => ({
      user_id: targetUser.id,
      module_code: String(permission?.moduleCode || ''),
      function_code: String(permission?.functionCode || ''),
      actions: ['ACCESS']
    }));
    const permissionsResult = await restRequest(configuration, 'user_permissions', {
      method: 'POST',
      body: permissionRows,
      prefer: 'return=minimal'
    });
    if (!permissionsResult.ok) {
      await deleteProfile(configuration, targetUser.id).catch(() => undefined);
      if (createdNow) await deleteAuthUser(configuration, targetUser.id).catch(() => undefined);
      return json({
        error: `No se pudieron asignar los permisos: ${errorMessage(permissionsResult.data, 'Error desconocido.')}`
      }, 400);
    }
  }

  return json({
    success: true,
    repaired: !createdNow,
    user: { id: targetUser.id, email, clientId, campaignId }
  }, createdNow ? 201 : 200);
}

function randomTemporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  const encoded = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `Cg#${encoded}9a`;
}

async function resetCampaignUserPassword(request, configuration, userId) {
  const requester = await verifyRequester(request, configuration, GLOBAL_OWNER_ROLES);
  if (requester.error) return requester.error;
  if (!userId) return json({ error: 'El usuario es obligatorio.' }, 400);

  const temporaryPassword = randomTemporaryPassword();
  const updateResult = await updateAuthUser(configuration, userId, {
    password: temporaryPassword,
    user_metadata: { password_reset_by_global_admin_at: new Date().toISOString() }
  });
  if (!updateResult.ok || !authUserFrom(updateResult.data)) {
    return json({ error: errorMessage(updateResult.data, 'No fue posible actualizar la contraseña.') }, 400);
  }

  return json({
    success: true,
    message: 'Contraseña temporal creada. Se mostrará una sola vez.',
    temporaryPassword
  });
}

async function deleteCampaign(request, configuration, campaignId) {
  const requester = await verifyRequester(request, configuration, GLOBAL_OWNER_ROLES);
  if (requester.error) return requester.error;
  if (!campaignId) return json({ error: 'La campaña es obligatoria.' }, 400);

  const profilesResult = await restRequest(configuration, 'profiles', {
    query: { campaign_id: `eq.${campaignId}`, select: 'id' }
  });
  if (!profilesResult.ok) {
    return json({ error: errorMessage(profilesResult.data, 'No fue posible consultar los usuarios vinculados.') }, 400);
  }
  const linkedProfiles = Array.isArray(profilesResult.data) ? profilesResult.data : [];
  if (linkedProfiles.length > 0) {
    return json({
      error: 'La campaña tiene usuarios vinculados. Debes retirarlos antes de eliminarla para evitar cuentas huérfanas.'
    }, 409);
  }

  const campaignResult = await restRequest(configuration, 'campaigns', {
    method: 'DELETE',
    query: { id: `eq.${campaignId}` },
    prefer: 'return=minimal'
  });
  if (!campaignResult.ok) {
    return json({ error: errorMessage(campaignResult.data, 'No fue posible eliminar la campaña.') }, 400);
  }

  return json({
    success: true,
    deletedUsers: 0,
    failedUsers: 0
  });
}

function routeSegments(url) {
  const pathname = new URL(url).pathname;
  const rawSegments = pathname.split('/').filter(Boolean);
  const adminIndex = rawSegments.findIndex((segment, index) =>
    segment === 'supabase-admin' && rawSegments[index - 1] === 'api'
  );
  if (adminIndex < 0) return [];
  return rawSegments.slice(adminIndex + 1).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return '';
    }
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method.toUpperCase();
  if (method === 'OPTIONS') return json({ success: true });

  const segments = routeSegments(request.url);
  const isCampaignUser = segments.length === 1 && segments[0] === 'campaign-user';
  const isManagedUser = segments.length === 1 && segments[0] === 'managed-user';
  const isPasswordReset = segments.length === 3 &&
    segments[0] === 'campaign-user' && segments[2] === 'reset-password';
  const isCampaignDelete = segments.length === 2 && segments[0] === 'campaigns';
  const knownRoute = isCampaignUser || isManagedUser || isPasswordReset || isCampaignDelete;

  if (!knownRoute) return json({ error: 'Ruta administrativa no disponible.' }, 404);

  const configuration = getConfiguration(env);
  if (!configuration.url || !configuration.serverKey) {
    return json({
      error: 'Falta configurar SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY en Cloudflare.'
    }, 503);
  }

  try {
    if (isCampaignUser && method === 'POST') return createCampaignUser(request, configuration);
    if (isManagedUser && method === 'POST') return createManagedUser(request, configuration);
    if (isPasswordReset && method === 'POST') {
      return resetCampaignUserPassword(request, configuration, segments[1]);
    }
    if (isCampaignDelete && method === 'DELETE') {
      return deleteCampaign(request, configuration, segments[1]);
    }

    const allow = isCampaignDelete ? 'DELETE' : 'POST';
    return json({ error: 'Método HTTP no permitido para esta ruta.' }, 405, { allow });
  } catch {
    return json({ error: 'No fue posible completar la operación segura en Supabase.' }, 502);
  }
}
