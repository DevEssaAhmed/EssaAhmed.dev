create extension if not exists pgcrypto;

create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null,
  title text not null,
  content text not null,
  excerpt text,
  image_url text,
  image_alt text,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_diary_entries_published_entry_date
on public.diary_entries (is_published, entry_date desc, created_at desc);

create or replace function public.set_diary_entries_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_diary_entries_updated_at on public.diary_entries;
create trigger trg_diary_entries_updated_at
before update on public.diary_entries
for each row
execute function public.set_diary_entries_updated_at();

alter table public.diary_entries enable row level security;

drop policy if exists "Public can read published diary entries" on public.diary_entries;
create policy "Public can read published diary entries"
on public.diary_entries
for select
using (is_published = true);

drop policy if exists "Authenticated users can manage diary entries" on public.diary_entries;
create policy "Authenticated users can manage diary entries"
on public.diary_entries
for all
to authenticated
using (true)
with check (true);
