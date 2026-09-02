-- Keep the database role constraint aligned with every role recognized by the
-- authentication and authorization layer. Changing a profile's module causes
-- PostgreSQL to recheck this constraint, even when `role` is not modified.

begin;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (
    upper(btrim(role)) in (
      'SUPERADMIN',
      'GLOBAL_ADMIN',
      'ADMIN_CLIENTE',
      'ADMINISTRADOR',
      'DIRECTOR',
      'COORDINADOR',
      'USUARIO',
      'USUARIO_LIMITADO'
    )
  ) not valid;

-- Fail the migration instead of silently accepting an unknown legacy role.
alter table public.profiles
  validate constraint profiles_role_check;

commit;
