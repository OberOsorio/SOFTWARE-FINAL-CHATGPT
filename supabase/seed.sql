-- Ejecutar después de crear un usuario en Authentication y reemplazar el UUID.
-- insert into public.campaigns(name,candidate_name,election_type,election_date,vote_goal,cne_spending_limit,created_by)
-- values('Campaña Demo','Alejandro Doria','Alcaldía','2027-10-31',50000,75000000,'REEMPLAZAR_UUID_USUARIO');
-- Los datos de ejemplo de la interfaz son locales y no contienen datos personales reales.

-- Acceso global del propietario (ejecutar una sola vez con su UUID de Authentication):
-- insert into public.platform_admins(user_id,role,active)
-- values('REEMPLAZAR_UUID_USUARIO','owner',true);
