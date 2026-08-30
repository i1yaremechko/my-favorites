create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  message text not null check (char_length(message) > 0 and char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);