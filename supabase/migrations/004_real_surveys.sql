-- Encuestas reales, aisladas por campaña y protegidas con RLS.
create extension if not exists pgcrypto;

create table if not exists public.survey_studies (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  code text not null,
  title text not null,
  study_type text not null,
  methodology text not null,
  status text not null default 'Borrador' check (status in ('En Campo','Borrador','Finalizado','En Auditoría')),
  target_sample integer not null check (target_sample > 0),
  completed_sample integer not null default 0 check (completed_sample >= 0),
  pollsters_count integer not null default 0 check (pollsters_count >= 0),
  margin_error numeric(5,2) not null check (margin_error > 0),
  confidence_level numeric(5,2) not null default 95,
  start_date date not null,
  end_date date not null,
  location text not null,
  questions jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, code),
  check (jsonb_typeof(questions) = 'array'),
  check (end_date >= start_date)
);

create table if not exists public.survey_pollsters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  survey_id uuid not null references public.survey_studies(id) on delete cascade,
  name text not null,
  cedula text not null,
  phone text,
  email text,
  assigned_zone text not null,
  daily_goal integer not null default 0 check (daily_goal >= 0),
  completed_count integer not null default 0 check (completed_count >= 0),
  status text not null default 'Activo' check (status in ('Activo','En Recorrido','Meta Cumplida','Pausado','Inactivo')),
  last_activity_at timestamptz,
  battery_level integer check (battery_level between 0 and 100),
  latitude double precision,
  longitude double precision,
  last_address text,
  in_geofence boolean,
  gps_accuracy_meters numeric(8,2),
  device_imei text,
  accreditation_code text not null,
  audit_flags jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, cedula),
  unique (accreditation_code)
);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  survey_id uuid not null references public.survey_studies(id) on delete cascade,
  pollster_id uuid references public.survey_pollsters(id) on delete set null,
  respondent_code text,
  answers jsonb not null,
  consent_confirmed boolean not null default false,
  latitude double precision,
  longitude double precision,
  gps_accuracy_meters numeric(8,2),
  duration_seconds integer check (duration_seconds > 0),
  device_fingerprint text,
  submitted_by uuid references auth.users(id),
  submitted_at timestamptz not null default now(),
  check (jsonb_typeof(answers) = 'object')
);

create index if not exists survey_studies_campaign_idx on public.survey_studies(campaign_id, created_at desc);
create index if not exists survey_pollsters_campaign_idx on public.survey_pollsters(campaign_id, survey_id);
create index if not exists survey_responses_survey_idx on public.survey_responses(survey_id, submitted_at desc);

create or replace function public.can_access_campaign(target_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.campaigns c
    left join public.profiles p on p.id = auth.uid()
    where c.id = target_campaign_id
      and (c.created_by = auth.uid() or c.client_id = p.client_id)
  );
$$;

alter table public.survey_studies enable row level security;
alter table public.survey_pollsters enable row level security;
alter table public.survey_responses enable row level security;

drop policy if exists survey_studies_campaign_access on public.survey_studies;
create policy survey_studies_campaign_access on public.survey_studies
for all using (public.can_access_campaign(campaign_id))
with check (public.can_access_campaign(campaign_id));

drop policy if exists survey_pollsters_campaign_access on public.survey_pollsters;
create policy survey_pollsters_campaign_access on public.survey_pollsters
for all using (public.can_access_campaign(campaign_id))
with check (public.can_access_campaign(campaign_id));

drop policy if exists survey_responses_campaign_access on public.survey_responses;
create policy survey_responses_campaign_access on public.survey_responses
for all using (public.can_access_campaign(campaign_id))
with check (public.can_access_campaign(campaign_id));

create or replace function public.refresh_survey_counters()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_survey uuid;
  target_pollster uuid;
begin
  if tg_op = 'DELETE' then
    target_survey := old.survey_id;
    target_pollster := old.pollster_id;
  else
    target_survey := new.survey_id;
    target_pollster := new.pollster_id;
  end if;
  update public.survey_studies
  set completed_sample = (select count(*) from public.survey_responses r where r.survey_id = target_survey),
      updated_at = now()
  where id = target_survey;

  if target_pollster is not null then
    update public.survey_pollsters
    set completed_count = (select count(*) from public.survey_responses r where r.pollster_id = target_pollster),
        last_activity_at = now(),
        updated_at = now()
    where id = target_pollster;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

drop trigger if exists survey_response_counters on public.survey_responses;
create trigger survey_response_counters
after insert or delete on public.survey_responses
for each row execute function public.refresh_survey_counters();

create or replace function public.refresh_survey_pollster_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_survey uuid;
begin
  if tg_op = 'DELETE' then target_survey := old.survey_id; else target_survey := new.survey_id; end if;
  update public.survey_studies
  set pollsters_count = (select count(*) from public.survey_pollsters p where p.survey_id = target_survey),
      updated_at = now()
  where id = target_survey;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

drop trigger if exists survey_pollster_counters on public.survey_pollsters;
create trigger survey_pollster_counters
after insert or delete on public.survey_pollsters
for each row execute function public.refresh_survey_pollster_count();
