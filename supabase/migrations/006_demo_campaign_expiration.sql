alter table public.campaigns
  add column if not exists is_demo boolean not null default false,
  add column if not exists demo_expires_at timestamptz;

alter table public.campaigns
  drop constraint if exists campaigns_demo_expiration_valid;

alter table public.campaigns
  add constraint campaigns_demo_expiration_valid check (
    (not is_demo and demo_expires_at is null)
    or (
      is_demo
      and demo_expires_at is not null
      and demo_expires_at > created_at
      and demo_expires_at <= created_at + interval '5 days'
    )
  );

create index if not exists campaigns_demo_expiration_idx
  on public.campaigns (demo_expires_at)
  where is_demo = true;
