-- Campaña Ganadora AI: esquema multi-tenant y políticas RLS.
create extension if not exists pgcrypto;

create type public.campaign_role as enum ('owner','admin','strategist','finance','territory_lead','witness','viewer');
create type public.voter_status as enum ('pending','confirmed','mobilized','inactive');
create type public.expense_status as enum ('draft','approved','reported');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  candidate_name text not null,
  election_type text not null,
  election_date date,
  vote_goal integer not null default 0 check (vote_goal >= 0),
  cne_spending_limit numeric(14,2) not null default 0 check (cne_spending_limit >= 0),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create table public.campaign_members (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.campaign_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (campaign_id,user_id)
);
create table public.leaders (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  parent_id uuid references public.leaders(id) on delete set null, full_name text not null, document_id text,
  phone text, zone text, target integer not null default 10, active boolean not null default true, created_at timestamptz not null default now(),
  unique(campaign_id,document_id)
);
create table public.voters (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  leader_id uuid references public.leaders(id) on delete set null, full_name text not null, document_id text not null,
  phone text, email text, zone text, neighborhood text, polling_place text, polling_table text,
  status public.voter_status not null default 'pending', consent_at timestamptz, created_by uuid references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(campaign_id,document_id)
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  concept text not null, category text not null, amount numeric(14,2) not null check(amount>0), expense_date date not null,
  supplier text, document_url text, status public.expense_status not null default 'draft', created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table public.polling_stations (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  zone text not null, place text not null, table_number text not null, registered_voters integer default 0,
  witness_id uuid references auth.users(id), status text not null default 'pending', unique(campaign_id,place,table_number)
);
create table public.e14_reports (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  polling_station_id uuid not null references public.polling_stations(id) on delete cascade, image_path text,
  candidate_votes integer check(candidate_votes>=0), total_votes integer check(total_votes>=0), notes text, validation_status text not null default 'pending',
  reported_by uuid references auth.users(id), reported_at timestamptz not null default now(), unique(polling_station_id)
);
create table public.strategy_documents (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  kind text not null, title text not null, content text not null default '', created_by uuid references auth.users(id), updated_at timestamptz not null default now()
);
create table public.audit_logs (
  id bigint generated always as identity primary key, campaign_id uuid not null references public.campaigns(id) on delete cascade,
  actor_id uuid references auth.users(id), action text not null, entity text not null, entity_id text, metadata jsonb not null default '{}', created_at timestamptz not null default now()
);

create index voters_campaign_status_idx on public.voters(campaign_id,status);
create index voters_campaign_zone_idx on public.voters(campaign_id,zone);
create index leaders_campaign_parent_idx on public.leaders(campaign_id,parent_id);
create index expenses_campaign_date_idx on public.expenses(campaign_id,expense_date desc);
create index audit_campaign_created_idx on public.audit_logs(campaign_id,created_at desc);

create or replace function public.is_campaign_member(cid uuid) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.campaign_members m where m.campaign_id=cid and m.user_id=auth.uid());
$$;
create or replace function public.has_campaign_role(cid uuid, allowed public.campaign_role[]) returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.campaign_members m where m.campaign_id=cid and m.user_id=auth.uid() and m.role=any(allowed));
$$;

alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;
alter table public.leaders enable row level security;
alter table public.voters enable row level security;
alter table public.expenses enable row level security;
alter table public.polling_stations enable row level security;
alter table public.e14_reports enable row level security;
alter table public.strategy_documents enable row level security;
alter table public.audit_logs enable row level security;

create policy campaigns_select on public.campaigns for select using(public.is_campaign_member(id) or created_by=auth.uid());
create policy campaigns_insert on public.campaigns for insert with check(created_by=auth.uid());
create policy campaigns_update on public.campaigns for update using(public.has_campaign_role(id,array['owner','admin']::public.campaign_role[]));
create policy members_select on public.campaign_members for select using(public.is_campaign_member(campaign_id));
create policy members_manage on public.campaign_members for all using(public.has_campaign_role(campaign_id,array['owner','admin']::public.campaign_role[])) with check(public.has_campaign_role(campaign_id,array['owner','admin']::public.campaign_role[]));

create policy leaders_select on public.leaders for select using(public.is_campaign_member(campaign_id));
create policy leaders_write on public.leaders for all using(public.has_campaign_role(campaign_id,array['owner','admin','territory_lead']::public.campaign_role[])) with check(public.has_campaign_role(campaign_id,array['owner','admin','territory_lead']::public.campaign_role[]));
create policy voters_select on public.voters for select using(public.is_campaign_member(campaign_id));
create policy voters_write on public.voters for all using(public.has_campaign_role(campaign_id,array['owner','admin','territory_lead']::public.campaign_role[])) with check(public.has_campaign_role(campaign_id,array['owner','admin','territory_lead']::public.campaign_role[]));
create policy expenses_select on public.expenses for select using(public.is_campaign_member(campaign_id));
create policy expenses_write on public.expenses for all using(public.has_campaign_role(campaign_id,array['owner','admin','finance']::public.campaign_role[])) with check(public.has_campaign_role(campaign_id,array['owner','admin','finance']::public.campaign_role[]));
create policy stations_select on public.polling_stations for select using(public.is_campaign_member(campaign_id));
create policy stations_write on public.polling_stations for all using(public.has_campaign_role(campaign_id,array['owner','admin','territory_lead','witness']::public.campaign_role[])) with check(public.has_campaign_role(campaign_id,array['owner','admin','territory_lead','witness']::public.campaign_role[]));
create policy reports_select on public.e14_reports for select using(public.is_campaign_member(campaign_id));
create policy reports_write on public.e14_reports for all using(public.has_campaign_role(campaign_id,array['owner','admin','territory_lead','witness']::public.campaign_role[])) with check(public.has_campaign_role(campaign_id,array['owner','admin','territory_lead','witness']::public.campaign_role[]));
create policy strategy_select on public.strategy_documents for select using(public.is_campaign_member(campaign_id));
create policy strategy_write on public.strategy_documents for all using(public.has_campaign_role(campaign_id,array['owner','admin','strategist']::public.campaign_role[])) with check(public.has_campaign_role(campaign_id,array['owner','admin','strategist']::public.campaign_role[]));
create policy audit_select on public.audit_logs for select using(public.has_campaign_role(campaign_id,array['owner','admin']::public.campaign_role[]));
create policy audit_insert on public.audit_logs for insert with check(public.is_campaign_member(campaign_id) and actor_id=auth.uid());

-- El primer miembro se crea automáticamente al crear una campaña.
create or replace function public.add_campaign_owner() returns trigger language plpgsql security definer set search_path=public as $$ begin
  insert into public.campaign_members(campaign_id,user_id,role) values(new.id,new.created_by,'owner'); return new;
end $$;
create trigger campaign_owner_after_insert after insert on public.campaigns for each row execute function public.add_campaign_owner();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('e14','e14',false,10485760,array['image/jpeg','image/png','application/pdf']) on conflict(id) do nothing;
create policy e14_files_read on storage.objects for select using(bucket_id='e14' and public.is_campaign_member(((storage.foldername(name))[1])::uuid));
create policy e14_files_insert on storage.objects for insert with check(bucket_id='e14' and public.has_campaign_role(((storage.foldername(name))[1])::uuid,array['owner','admin','territory_lead','witness']::public.campaign_role[]));
