alter table fixtures
add column if not exists scorers jsonb not null default '[]'::jsonb;
