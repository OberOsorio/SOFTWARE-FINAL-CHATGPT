-- Close privilege-escalation paths left by earlier permissive profile policies.
-- The service-role backend bypasses RLS and remains responsible for privileged
-- profile creation and role/tenant assignment.

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and upper(role) in ('SUPERADMIN', 'GLOBAL_ADMIN')
      and upper(status) in ('ACTIVE', 'ACTIVO')
  );
$$;

create or replace function public.get_user_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id
  from public.profiles
  where id = auth.uid()
    and upper(status) in ('ACTIVE', 'ACTIVO')
  limit 1;
$$;

create or replace function public.get_user_campaign_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select campaign_id
  from public.profiles
  where id = auth.uid()
    and upper(status) in ('ACTIVE', 'ACTIVO')
  limit 1;
$$;

create or replace function public.is_active_campaign_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and upper(role) in ('ADMIN_CLIENTE', 'ADMINISTRADOR')
      and upper(status) in ('ACTIVE', 'ACTIVO')
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists profile_select on public.profiles;
drop policy if exists profile_insert on public.profiles;
drop policy if exists profile_update on public.profiles;
drop policy if exists profile_delete on public.profiles;
drop policy if exists "Profiles: Users can view profiles from same client" on public.profiles;
drop policy if exists "Profiles: Admin can manage profiles from same client" on public.profiles;

create policy profile_select_hardened
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_superadmin()
  or (
    public.is_active_campaign_admin()
    and (
      (client_id is not null and client_id = public.get_user_client_id())
      or (campaign_id is not null and campaign_id = public.get_user_campaign_id())
    )
  )
);

create policy profile_insert_owner_only
on public.profiles for insert
to authenticated
with check (public.is_superadmin());

create policy profile_update_owner_only
on public.profiles for update
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

create policy profile_delete_owner_only
on public.profiles for delete
to authenticated
using (public.is_superadmin() and id <> auth.uid());

alter table public.clients enable row level security;
drop policy if exists client_isolation on public.clients;
drop policy if exists "Clients: Users can view their own client" on public.clients;
drop policy if exists "Clients: SuperAdmin full access" on public.clients;

create policy clients_read_hardened
on public.clients for select
to authenticated
using (id = public.get_user_client_id() or public.is_superadmin());

create policy clients_owner_write
on public.clients for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

alter table public.user_permissions enable row level security;
drop policy if exists permission_isolation on public.user_permissions;
drop policy if exists "Permissions: Users can view their own permissions" on public.user_permissions;
drop policy if exists "Permissions: Admin can manage permissions from same client" on public.user_permissions;

create policy permissions_read_hardened
on public.user_permissions for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_superadmin()
  or (
    public.is_active_campaign_admin()
    and exists (
      select 1
      from public.profiles target
      where target.id = user_id
        and (
          (target.client_id is not null and target.client_id = public.get_user_client_id())
          or (target.campaign_id is not null and target.campaign_id = public.get_user_campaign_id())
        )
    )
  )
);

create policy permissions_owner_write
on public.user_permissions for all
to authenticated
using (public.is_superadmin())
with check (public.is_superadmin());

