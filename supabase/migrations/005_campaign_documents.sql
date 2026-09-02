-- Private documents attached to a campaign (CVs, certificates and supporting files).
alter table public.profiles
  add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'campaign-documents',
  'campaign-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists campaign_documents_select on storage.objects;
create policy campaign_documents_select on storage.objects
for select to authenticated
using (
  bucket_id = 'campaign-documents'
  and exists (
    select 1
    from public.campaigns c
    join public.profiles p on p.id = auth.uid()
    where c.id::text = split_part(storage.objects.name, '/', 1)
      and (p.client_id = c.client_id or p.campaign_id = c.id)
  )
);

drop policy if exists campaign_documents_insert on storage.objects;
create policy campaign_documents_insert on storage.objects
for insert to authenticated
with check (
  bucket_id = 'campaign-documents'
  and exists (
    select 1
    from public.campaigns c
    join public.profiles p on p.id = auth.uid()
    where c.id::text = split_part(storage.objects.name, '/', 1)
      and (p.client_id = c.client_id or p.campaign_id = c.id)
  )
);

drop policy if exists campaign_documents_update on storage.objects;
create policy campaign_documents_update on storage.objects
for update to authenticated
using (
  bucket_id = 'campaign-documents'
  and exists (
    select 1
    from public.campaigns c
    join public.profiles p on p.id = auth.uid()
    where c.id::text = split_part(storage.objects.name, '/', 1)
      and (p.client_id = c.client_id or p.campaign_id = c.id)
  )
);

drop policy if exists campaign_documents_delete on storage.objects;
create policy campaign_documents_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'campaign-documents'
  and exists (
    select 1
    from public.campaigns c
    join public.profiles p on p.id = auth.uid()
    where c.id::text = split_part(storage.objects.name, '/', 1)
      and (p.client_id = c.client_id or p.campaign_id = c.id)
  )
);
