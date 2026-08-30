alter table public.favorites
  add column if not exists title_uk text,
  add column if not exists title_en text;

-- Best-effort backfill for existing rows: both columns start out equal to
-- whatever language the title happened to be saved in. Older rows will show
-- the same text in both languages until re-favorited.
update public.favorites set title_uk = title where title_uk is null;
update public.favorites set title_en = title where title_en is null;

alter table public.favorites
  alter column title_uk set not null,
  alter column title_en set not null;

create or replace view public.favorites_summary
with (security_invoker = true) as
select
  movie_id,
  media_type,
  count(*) as favorite_count,
  (array_agg(title order by created_at))[1] as title,
  (array_agg(title_uk order by created_at))[1] as title_uk,
  (array_agg(title_en order by created_at))[1] as title_en,
  (array_agg(poster_path order by created_at))[1] as poster_path,
  (array_agg(release_date order by created_at))[1] as release_date,
  (array_agg(vote_average order by created_at))[1] as vote_average,
  (array_agg(runtime order by created_at))[1] as runtime,
  (array_agg(genre_ids order by created_at))[1] as genre_ids
from public.favorites
group by movie_id, media_type;

grant select on public.favorites_summary to anon, authenticated;
