-- Create watchlist table
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  tmdb_id integer not null,
  title text not null,
  poster_path text not null default '',
  media_type text not null check (media_type in ('movie', 'tv')),
  category text not null check (category in ('streaming', 'cinema')),
  release_date date,
  added_by uuid references auth.users(id) on delete cascade not null
);

-- Enable Row Level Security
alter table public.watchlist enable row level security;

-- Policy: all authenticated users can read all watchlist items (shared list)
create policy "Anyone authenticated can view watchlist"
  on public.watchlist for select
  using (auth.role() = 'authenticated');

-- Policy: users can only insert their own items
create policy "Users can insert their own items"
  on public.watchlist for insert
  with check (auth.uid() = added_by);

-- Policy: users can only delete their own items
create policy "Users can delete their own items"
  on public.watchlist for delete
  using (auth.uid() = added_by);

-- Enable realtime
alter publication supabase_realtime add table public.watchlist;
