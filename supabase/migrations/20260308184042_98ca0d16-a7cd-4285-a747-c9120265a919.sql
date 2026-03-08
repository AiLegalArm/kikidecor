
create extension if not exists vector with schema extensions;

create table if not exists public.product_embeddings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null unique,
  embedding vector(768),
  feature_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_embeddings enable row level security;

create policy "Anyone can view product embeddings" on public.product_embeddings
  for select using (true);

create policy "Service can manage product embeddings" on public.product_embeddings
  for all using (true) with check (true);

create or replace function public.match_products(
  query_embedding vector(768),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  product_id uuid,
  similarity float
)
language plpgsql stable
as $$
begin
  return query
  select
    pe.product_id,
    (1 - (pe.embedding <=> query_embedding))::float as similarity
  from public.product_embeddings pe
  where pe.embedding is not null
    and 1 - (pe.embedding <=> query_embedding) > match_threshold
  order by pe.embedding <=> query_embedding
  limit match_count;
end;
$$;
