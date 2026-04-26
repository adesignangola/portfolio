#!/usr/bin/env node

import 'dotenv/config';

const args = process.argv.slice(2);

function readFlag(flagNames, fallback) {
  for (let index = 0; index < args.length; index += 1) {
    if (flagNames.includes(args[index])) {
      return args[index + 1];
    }
  }
  return fallback;
}

function hasFlag(flagNames) {
  return args.some((arg) => flagNames.includes(arg));
}

function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(parts[1].length / 4) * 4, '=');
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function getProjectRefFromUrl(url) {
  if (!url) return null;

  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.')[0] || null;
  } catch {
    return null;
  }
}

function normalizeTarget(key) {
  if (!key?.api_key) return 'unknown';
  if (key.api_key.startsWith('sb_publishable_')) return 'publishable';
  if (key.api_key.startsWith('sb_secret_')) return 'secret';

  const payload = decodeJwtPayload(key.api_key);
  if (payload?.role === 'anon') return 'anon';
  if (payload?.role === 'service_role') return 'service_role';

  return key.name || key.type || 'unknown';
}

function filterKeys(keys, target) {
  if (target === 'all') return keys;
  return keys.filter((key) => normalizeTarget(key) === target);
}

function printHelp() {
  console.log(`
Uso:
  node scripts/get-supabase-key.mjs --project-ref <ref> --type <publishable|anon|service_role|secret|all>

Opcoes:
  -p, --project-ref   Project ref do Supabase. Se omitido, tenta extrair de VITE_SUPABASE_URL.
  -t, --type          Tipo da chave. Padrao: publishable
  --json              Imprime o resultado em JSON
  --env               Imprime uma linha pronta para colar no .env
  -h, --help          Mostra esta ajuda

Variaveis de ambiente:
  SUPABASE_ACCESS_TOKEN    Token pessoal do Supabase com permissao para ler secrets
  VITE_SUPABASE_URL        Opcional, usado para inferir o project ref
`);
}

if (hasFlag(['-h', '--help'])) {
  printHelp();
  process.exit(0);
}

const targetType = readFlag(['-t', '--type'], 'publishable');
const projectRef = readFlag(['-p', '--project-ref'], getProjectRefFromUrl(process.env.VITE_SUPABASE_URL));
const outputJson = hasFlag(['--json']);
const outputEnv = hasFlag(['--env']);
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!projectRef) {
  console.error('Project ref nao informado. Use --project-ref <ref> ou configure VITE_SUPABASE_URL.');
  process.exit(1);
}

if (!accessToken) {
  console.error('SUPABASE_ACCESS_TOKEN nao definido. Gere um PAT no painel do Supabase e exporte essa variavel.');
  process.exit(1);
}

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/api-keys?reveal=true`;
const response = await fetch(endpoint, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  },
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Falha ao consultar a Management API (${response.status}).`);
  console.error(body);
  process.exit(1);
}

const keys = await response.json();
const matches = filterKeys(keys, targetType);

if (!matches.length) {
  console.error(`Nenhuma chave do tipo "${targetType}" foi encontrada para o projeto ${projectRef}.`);
  process.exit(1);
}

if (outputJson) {
  console.log(JSON.stringify(matches, null, 2));
  process.exit(0);
}

if (outputEnv) {
  const selected = matches[0];
  const envName = targetType === 'publishable' ? 'VITE_SUPABASE_PUBLISHABLE_KEY' : 'VITE_SUPABASE_ANON_KEY';
  console.log(`${envName}=${selected.api_key}`);
  process.exit(0);
}

for (const key of matches) {
  console.log(`${normalizeTarget(key)}: ${key.api_key}`);
}
