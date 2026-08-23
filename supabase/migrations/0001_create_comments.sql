-- Таблиця коментарів під фільмами/серіалами.
-- Читати можуть усі, писати/видаляти — тільки автор (RLS нижче).

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  movie_id bigint not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  author_name text not null,
  author_avatar_url text,
  text text not null check (char_length(text) > 0 and char_length(text) <= 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_movie_idx on public.comments (movie_id, media_type, created_at desc);

alter table public.comments enable row level security;

create policy "Anyone can read comments"
  on public.comments for select
  using (true);

create policy "Users can insert own comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);
