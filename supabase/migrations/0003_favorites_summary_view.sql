create index if not exists favorites_movie_media_idx on public.favorites (movie_id, media_type);

create or replace view public.favorites_summary
with (security_invoker = true) as
select
  movie_id,
  media_type,
  count(*) as favorite_count,
  (array_agg(title order by created_at))[1] as title,
  (array_agg(poster_path order by created_at))[1] as poster_path,
  (array_agg(release_date order by created_at))[1] as release_date,
  (array_agg(vote_average order by created_at))[1] as vote_average,
  (array_agg(runtime order by created_at))[1] as runtime,
  (array_agg(genre_ids order by created_at))[1] as genre_ids
from public.favorites
group by movie_id, media_type;

grant select on public.favorites_summary to anon, authenticated;
