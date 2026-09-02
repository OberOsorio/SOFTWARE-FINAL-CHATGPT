-- Roles globales separados de los roles internos de cada campaña.
create type public.platform_role as enum ('owner','support_admin','billing_admin','security_auditor');

create table public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.platform_role not null,
  active boolean not null default true,
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins
    where user_id = auth.uid() and role = 'owner' and active = true
  );
$$;

create policy platform_admins_read_self_or_owner
on public.platform_admins for select
using (user_id = auth.uid() or public.is_platform_owner());

create policy platform_admins_owner_insert
on public.platform_admins for insert
with check (public.is_platform_owner());

create policy platform_admins_owner_update
on public.platform_admins for update
using (public.is_platform_owner())
with check (public.is_platform_owner());

create policy platform_admins_owner_delete
on public.platform_admins for delete
using (public.is_platform_owner() and user_id <> auth.uid());

-- El propietario global puede inspeccionar campañas y membresías.
create policy platform_owner_campaigns_read
on public.campaigns for select
using (public.is_platform_owner());

create policy platform_owner_campaigns_update
on public.campaigns for update
using (public.is_platform_owner())
with check (public.is_platform_owner());

create policy platform_owner_members_read
on public.campaign_members for select
using (public.is_platform_owner());

create policy platform_owner_audit_read
on public.audit_logs for select
using (public.is_platform_owner());

-- Primera asignación: ejecute una sola vez desde SQL Editor con el UUID real.
-- insert into public.platform_admins(user_id, role, active)
-- values ('REEMPLAZAR_UUID_USUARIO', 'owner', true);
