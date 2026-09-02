-- ═══════════════════════════════════════════════════════════════════════
--  CHIDORI · superficie pública para la web del congreso
--  Correr en Supabase → SQL Editor → Run. Es idempotente.
--
--  IDEA: la web pública es anónima, así que NO puede tocar las tablas.
--  Solo ve cuatro vistas `public_*` que exponen:
--    · únicamente las sesiones marcadas is_public
--    · el CÓDIGO del sujeto (P-001), nunca nombre ni apellido
--    · únicamente los campos declarados y activos en field_definitions
--    · nunca las notas libres (patients.notes / sessions.notes)
--
--  Las vistas corren con los permisos de su dueño (NO security_invoker):
--  eso es a propósito. Es el único punto por donde `anon` ve datos, y lo
--  que se ve está fijado acá, en el SQL, no en el frontend.
-- ═══════════════════════════════════════════════════════════════════════


-- ─── 1 · CURADURÍA ─────────────────────────────────────────────────────
-- is_public  → aparece en el sitio
-- is_featured → es la Figura 1 de la portada

alter table public.sessions add column if not exists is_public   boolean not null default false;
alter table public.sessions add column if not exists is_featured boolean not null default false;

create index if not exists sessions_is_public_idx
  on public.sessions (is_public) where is_public;

create index if not exists measurements_session_idx
  on public.measurements (session_id);

create index if not exists session_events_session_idx
  on public.session_events (session_id);


-- ─── 2 · VISTAS PÚBLICAS ───────────────────────────────────────────────

drop view if exists public.public_measurements;
drop view if exists public.public_session_events;
drop view if exists public.public_sessions;
drop view if exists public.public_field_definitions;

-- Catálogo: solo lo necesario para poner etiquetas y unidades reales.
create view public.public_field_definitions as
select f.id, f.scope, f.key, f.label, f.type, f.unit, f.sort_order
from public.field_definitions f
where f.active;

-- Sesiones. Los JSONB se reconstruyen campo por campo contra el catálogo:
-- así, una clave suelta que haya quedado en la base (o un campo dado de baja)
-- no puede filtrarse a la web por descuido.
create view public.public_sessions as
select
  s.id,
  s.session_number,
  s.created_at                                   as recorded_at,
  s.initial_impedance,
  s.final_impedance,
  s.elapsed_time_str,
  s.total_events,
  s.is_featured,
  coalesce(p.code, '—')                          as subject_code,
  (select coalesce(jsonb_object_agg(f.key, s.session_data -> f.key), '{}'::jsonb)
     from public.field_definitions f
    where f.scope = 'session'
      and f.active
      and jsonb_exists(coalesce(s.session_data, '{}'::jsonb), f.key)) as session_data,
  (select coalesce(jsonb_object_agg(f.key, p.data -> f.key), '{}'::jsonb)
     from public.field_definitions f
    where f.scope = 'patient'
      and f.active
      and jsonb_exists(coalesce(p.data, '{}'::jsonb), f.key))        as subject_data
from public.sessions s
left join public.patients p on p.id = s.patient_id
where s.is_public;

create view public.public_measurements as
select m.session_id, m.elapsed_time, m.impedance
from public.measurements m
join public.sessions s on s.id = m.session_id
where s.is_public;

create view public.public_session_events as
select
  e.session_id,
  e.event_number,
  e.elapsed_time,
  e.impedance,
  e.impedance_change,
  e.kind,
  e.amount_ml
from public.session_events e
join public.sessions s on s.id = e.session_id
where s.is_public;


-- ─── 3 · PERMISOS ──────────────────────────────────────────────────────
-- Solo lectura, y solo sobre las vistas.

grant select on public.public_field_definitions to anon, authenticated;
grant select on public.public_sessions          to anon, authenticated;
grant select on public.public_measurements      to anon, authenticated;
grant select on public.public_session_events    to anon, authenticated;


-- ─── 4 · QUIÉN PUEDE PUBLICAR ──────────────────────────────────────────
-- Solo superadmin cambia is_public / is_featured. Es una policy nueva y
-- permisiva: se SUMA a las que ya tengas sobre `sessions`.

drop policy if exists "sessions_publish" on public.sessions;
create policy "sessions_publish" on public.sessions
  for update to authenticated
  using      (exists (select 1 from public.profiles pr
                       where pr.id = auth.uid() and pr.role = 'superadmin'))
  with check (exists (select 1 from public.profiles pr
                       where pr.id = auth.uid() and pr.role = 'superadmin'));


-- ═══════════════════════════════════════════════════════════════════════
--  5 · AUDITORÍA — correr esto y LEER el resultado antes de publicar el QR
-- ═══════════════════════════════════════════════════════════════════════

-- (a) ¿Qué policies existen hoy? Si aparece alguna UPDATE sobre `sessions`
--     o `profiles` abierta a `authenticated` sin filtrar por superadmin,
--     cualquier usuario logueado podría auto-publicarse o auto-aprobarse.
select tablename, policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public'
order by tablename, cmd;

-- (b) ¿Tienen RLS activo todas las tablas con datos?
select relname,
       relrowsecurity as rls_activo,
       relforcerowsecurity as rls_forzado
from pg_class
where relnamespace = 'public'::regnamespace
  and relkind = 'r'
  and relname in ('profiles','patients','sessions','measurements',
                  'session_events','field_definitions')
order by relname;

-- (c) Esto es EXACTAMENTE lo que ve un visitante anónimo. Revisalo.
select * from public.public_sessions;
