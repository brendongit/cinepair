# Cinematch

A lista de filmes do casal. Um PWA mobile-first para gerenciar o que assistir juntos — no cinema ou em casa.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- Supabase (Auth, PostgreSQL, Realtime)
- TMDB API v3
- React Query (autocomplete debounced)
- next-pwa
- TypeScript

---

## Setup

### 1. Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. No painel, vá em **SQL Editor** e execute o conteúdo do arquivo:
   ```
   supabase/migrations/001_watchlist.sql
   ```
3. Nas configurações do projeto (**Settings > API**), copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Habilite o **Realtime** para a tabela `watchlist`:
   - Vá em **Database > Replication**
   - Ative a tabela `watchlist` em "Source"

5. Configure **Authentication**:
   - Vá em **Authentication > Providers**
   - Habilite Email/Password (ou o provedor que preferir)

### 2. TMDB API Key

1. Crie uma conta em [themoviedb.org](https://www.themoviedb.org/)
2. Vá em **Settings > API** e gere uma chave de API (v3 auth)
3. Copie a chave → `NEXT_PUBLIC_TMDB_API_KEY`

### 3. Variáveis de ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_TMDB_API_KEY=sua_chave_tmdb_aqui
```

### 4. Rodar o projeto

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 5. Build de produção

```bash
npm run build
npm start
```

---

## Funcionalidades

- **Busca** de filmes e séries via TMDB com debounce (300ms)
- **Adicionar** itens à lista de Cinema (🍿) ou Em Casa (📺)
- **Remover** itens da lista
- **Aba Estreias** com filmes futuros agrupados por mês (dados do TMDB, cache de 1h)
- **Realtime** — mudanças aparecem instantaneamente para todos os usuários conectados
- **PWA** — instalável no celular como app nativo

## Estrutura

```
src/
  app/
    actions.ts        # Server Actions (add/remove/get watchlist)
    layout.tsx        # Root layout com Providers
    page.tsx          # Página principal
  components/
    providers.tsx     # React Query provider
    search-bar.tsx    # Campo de busca com autocomplete
    watchlist.tsx     # Grid de itens com Realtime
    upcoming-cinema.tsx  # Estreias agrupadas por mês (Server Component)
    ui/               # shadcn/ui components
  lib/
    supabase/
      client.ts       # Browser Supabase client
      server.ts       # Server Supabase client
    tmdb.ts           # TMDB API helpers
    types.ts          # TypeScript types
supabase/
  migrations/
    001_watchlist.sql # Schema SQL
```
