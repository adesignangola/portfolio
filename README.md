# Portfolio

## Executar localmente

1. Instale as dependencias:
   `npm install`
2. Crie um `.env` com:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_PUBLISHABLE_KEY` ou `VITE_SUPABASE_ANON_KEY`
3. Inicie o projeto:
   `npm run dev`

## Buscar a chave correta do Supabase

O frontend deve usar uma chave publica (`publishable`) ou a `anon` legada. Nao use `service_role` no navegador.

1. Gere um `SUPABASE_ACCESS_TOKEN` na sua conta do Supabase.
2. Rode:
   `npm run supabase:key -- --project-ref xahrwrfttaazplqarcha --type publishable --env`
3. Cole a linha retornada no seu `.env`.

Se o seu projeto ainda usa a chave legada:

`npm run supabase:key -- --project-ref xahrwrfttaazplqarcha --type anon --env`
