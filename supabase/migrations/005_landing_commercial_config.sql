create table if not exists public.landing_commercial_config (
  id text primary key default 'main',
  plans jsonb not null default '[]'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  check (jsonb_typeof(plans) = 'array'),
  check (jsonb_typeof(contact) = 'object')
);

alter table public.landing_commercial_config enable row level security;

drop policy if exists landing_commercial_public_read on public.landing_commercial_config;
create policy landing_commercial_public_read on public.landing_commercial_config
for select using (true);

drop policy if exists landing_commercial_global_admin_write on public.landing_commercial_config;
create policy landing_commercial_global_admin_write on public.landing_commercial_config
for all to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and upper(p.role) in ('SUPERADMIN', 'GLOBAL_ADMIN')
      and upper(p.status) in ('ACTIVE', 'ACTIVO')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and upper(p.role) in ('SUPERADMIN', 'GLOBAL_ADMIN')
      and upper(p.status) in ('ACTIVE', 'ACTIVO')
  )
);

