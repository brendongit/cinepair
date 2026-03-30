🚀 Prompt do Projeto: CinePair (Next.js Edition)
Contexto do Projeto
"Atue como um Engenheiro de Software Fullstack Especialista em Next.js e Supabase. Preciso desenvolver um MVP de uma Web App Mobile-First para casais gerenciarem listas de filmes e séries. O objetivo é criar 'hype' para lançamentos de cinema e organizar maratonas em casa."

Tech Stack
Framework: Next.js 15+ (App Router).

Estilização: Tailwind CSS + Shadcn/UI (focado em componentes mobile-friendly).

State Management/Data Fetching: React Query (ou SWR) para o autocomplete e Server Actions para mutações.

Backend/Database: Supabase (Auth, PostgreSQL e Realtime).

API de Dados: TMDB API (v3).

Arquitetura de Dados (Supabase)
Tabela watchlist:

id (uuid, primary key)

created_at (timestamp)

tmdb_id (integer)

title (text)

poster_path (text)

media_type (enum: 'movie', 'tv')

category (enum: 'streaming', 'cinema')

release_date (date)

added_by (uuid, fk para users)

Funcionalidades & UX (Mobile-First)
Autocomplete de Busca:

Implementar um componente de busca que consome o endpoint search/multi da TMDB.

Exibir resultados em um "overlay" mobile com thumbnail, título e ano.

Debounce de 300ms para evitar excesso de requisições.

Sistema de Abas (Tabs Navigation):

Interface com duas abas principais: [🍿 Cinema] e [📺 Em Casa].

Na aba Cinema:

Consumir /movie/upcoming da TMDB.

Lógica de Negócio: Agrupar os filmes por Mês (ex: "Abril", "Maio") usando date-fns ou Intl.DateTimeFormat.

UI: Grid de posters verticais (2 colunas no mobile) com a data de lançamento exata formatada abaixo do título.

Realtime Sync:

Utilizar o SDK do Supabase para escutar INSERT e DELETE na tabela watchlist.

Se um usuário adicionar um filme, a lista do outro deve atualizar instantaneamente sem refresh (efeito "Hype").

Dicas de "Sênior" para Next.js:
PWA Setup: Como você quer "hypar" com sua namorada, configure o next-pwa. Isso permite que vocês adicionem o site à tela inicial do celular como se fosse um app nativo, removendo as barras do navegador.

Caché de Imagens: Use o componente <Image /> do Next.js. As imagens da TMDB (https://image.tmdb.org/t/p/w500/...) devem ser configuradas no next.config.js para otimização automática.

Filtro de Lançamentos: O endpoint upcoming da TMDB às vezes traz filmes que já saíram em outros países. No seu código, filtre os resultados para exibir apenas datas >= hoje para manter o foco no que "vai estrear".

Server Actions vs API Routes: Para adicionar filmes à lista, use Server Actions. É mais limpo, tipado com TypeScript e lida melhor com revalidação de cache (revalidatePath).
