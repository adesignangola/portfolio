const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const SINGLETON_TABLES = new Set(['perfil', 'quemsou', 'configuracoes']);
const RECORD_TABLES = new Set([
  'slides',
  'servicos',
  'projectos',
  'metricas',
  'depoimentos',
  'contactos',
  'sectores',
  'paises',
  'ferramentas',
  'parceiros',
]);

type CmsRequest =
  | { action: 'status' }
  | { action: 'upsert-singleton'; table: string; data: Record<string, unknown> }
  | { action: 'upsert-record'; table: string; id: string; data: Record<string, unknown> }
  | { action: 'insert-record'; table: string; data: Record<string, unknown> }
  | { action: 'delete-record'; table: string; id: string };

type AdminUser = {
  id: string;
  email?: string | null;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice('Bearer '.length).trim();
}

function getAdminHeaders(extraHeaders?: Record<string, string>) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as T;
}

async function getRequestUser(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return { user: null, error: 'Sessao ausente. Faz login novamente.' };
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await parseJsonResponse<{ msg?: string; message?: string }>(response);
    return { user: null, error: errorBody?.msg || errorBody?.message || 'Sessao invalida.' };
  }

  const user = await parseJsonResponse<AdminUser>(response);
  return { user, error: null };
}

async function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/cms_admin_emails?select=email&email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`,
    {
      method: 'GET',
      headers: getAdminHeaders(),
    },
  );

  if (!response.ok) {
    const errorBody = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(errorBody?.message || 'Falha ao validar allowlist do CMS.');
  }

  const rows = (await parseJsonResponse<Array<{ email: string }>>(response)) || [];
  return rows.length > 0;
}

function assertAllowedTable(table: string, allowedTables: Set<string>) {
  if (!allowedTables.has(table)) {
    throw new Error(`Tabela nao permitida: ${table}`);
  }
}

async function fetchFirstRow(table: string) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?select=id&order=created_at.asc&limit=1`,
    {
      method: 'GET',
      headers: getAdminHeaders(),
    },
  );

  if (!response.ok) {
    const errorBody = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(errorBody?.message || `Falha ao ler tabela ${table}.`);
  }

  const rows = (await parseJsonResponse<Array<{ id: string }>>(response)) || [];
  return rows[0] ?? null;
}

async function upsertRow(table: string, payload: Record<string, unknown>) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: getAdminHeaders({
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(errorBody?.message || `Falha ao escrever em ${table}.`);
  }

  const rows = (await parseJsonResponse<Array<Record<string, unknown>>>(response)) || [];
  return rows[0] ?? null;
}

async function insertRow(table: string, payload: Record<string, unknown>) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: getAdminHeaders({
      Prefer: 'return=representation',
    }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(errorBody?.message || `Falha ao inserir em ${table}.`);
  }

  const rows = (await parseJsonResponse<Array<Record<string, unknown>>>(response)) || [];
  return rows[0] ?? null;
}

async function deleteRow(table: string, id: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const errorBody = await parseJsonResponse<{ message?: string }>(response);
    throw new Error(errorBody?.message || `Falha ao apagar em ${table}.`);
  }

  // Delete associated images from storage if it's projectos table
  if (table === 'projectos') {
    await deleteProjectImages(id);
  }
}

async function deleteProjectImages(projectId: string) {
  // Get project to find image paths
  const getResponse = await fetch(
    `${supabaseUrl}/rest/v1/projectos?id=eq.${encodeURIComponent(projectId)}&select=imagemdestaque`,
    { method: 'GET', headers: getAdminHeaders() }
  );
  
  if (!getResponse.ok) return;
  
  const rows = await parseJsonResponse<Array<{ imagemdestaque: string[] | null }>>(getResponse);
  if (!rows || rows.length === 0 || !rows[0].imagemdestaque) return;
  
  const images = rows[0].imagemdestaque;
  
  // Delete each image from storage
  for (const imageUrl of images) {
    if (!imageUrl) continue;
    
    // Extract path from Supabase storage URL
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) continue;
    
    const storagePath = urlParts[1];
    
    await fetch(`${supabaseUrl}/storage/v1/object/${storagePath}`, {
      method: 'DELETE',
      headers: getAdminHeaders(),
    });
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, error: 'Secrets do Supabase indisponiveis na function.' }, 500);
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Metodo nao suportado.' }, 405);
  }

  try {
    const payload = (await request.json()) as CmsRequest;
    const auth = await getRequestUser(request);

    if (payload.action === 'status') {
      if (!auth.user) {
        return jsonResponse({
          ok: true,
          authenticated: false,
          isAdmin: false,
          email: null,
        });
      }

      const email = auth.user.email?.toLowerCase() ?? null;
      const isAdmin = await isAdminEmail(email);

      return jsonResponse({
        ok: true,
        authenticated: true,
        isAdmin,
        email,
      });
    }

    if (auth.error || !auth.user) {
      return jsonResponse({ ok: false, error: auth.error || 'Sessao invalida.' }, 401);
    }

    const email = auth.user.email?.toLowerCase() ?? null;
    const isAdmin = await isAdminEmail(email);

    if (!isAdmin) {
      return jsonResponse({ ok: false, error: 'Conta autenticada sem permissao de admin CMS.' }, 403);
    }

    switch (payload.action) {
      case 'upsert-singleton': {
        assertAllowedTable(payload.table, SINGLETON_TABLES);
        const existingRow = await fetchFirstRow(payload.table);
        const data = await upsertRow(payload.table, existingRow ? { id: existingRow.id, ...payload.data } : payload.data);
        return jsonResponse({ ok: true, data });
      }

      case 'upsert-record': {
        assertAllowedTable(payload.table, RECORD_TABLES);
        const data = await upsertRow(payload.table, { id: payload.id, ...payload.data });
        return jsonResponse({ ok: true, data, id: payload.id });
      }

      case 'insert-record': {
        assertAllowedTable(payload.table, RECORD_TABLES);
        const data = await insertRow(payload.table, payload.data);
        return jsonResponse({ ok: true, data, id: String(data?.id ?? '') });
      }

      case 'delete-record': {
        assertAllowedTable(payload.table, RECORD_TABLES);
        await deleteRow(payload.table, payload.id);
        return jsonResponse({ ok: true, id: payload.id });
      }

      default:
        return jsonResponse({ ok: false, error: 'Acao CMS invalida.' }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido no CMS backend.';
    console.error('cms-admin error', error);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
