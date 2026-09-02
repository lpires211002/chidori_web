-- ═══════════════════════════════════════════════════════════════════════
--  CHIDORI · serie decimada en el servidor
--  Correr en Supabase → SQL Editor → Run. Es idempotente.
--
--  PROBLEMA QUE RESUELVE
--  PostgREST corta toda respuesta en 1.000 filas (db-max-rows) y no hay
--  `limit` del cliente que lo evite. Una sesión de 27 min tiene 5.734
--  muestras: el sitio estaba graficando los primeros 5 minutos y llamándolos
--  la sesión entera. Con sesiones de 4 h el recorte sería del 98 %.
--
--  POR QUÉ NO ALCANZA CON PAGINAR
--  Paginar de a 1.000 son 58 pedidos y ~2 MB para una sesión larga, en un
--  celular con el wifi de un congreso. Mejor decimar en el servidor.
--
--  POR QUÉ MIN/MAX Y NO UN PROMEDIO POR BUCKET
--  Un promedio se comería justo los artefactos de movimiento (hasta 4,33 Ω),
--  que son la mitad de la historia que cuenta el póster. Devolver el punto
--  más bajo y el más alto de cada bucket conserva la envolvente completa,
--  con su tiempo real, y cuesta 2 puntos por bucket.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function public.public_series(
  p_session uuid,
  p_buckets int default 500
)
returns table (t double precision, z double precision, n bigint)
language sql
stable
security definer
set search_path = public
as $$
  with s as (
    select m.elapsed_time::double precision as t,
           m.impedance::double precision    as z
    from public.measurements m
    join public.sessions ss on ss.id = m.session_id
    where m.session_id = p_session
      and ss.is_public
  ),
  lim as (
    select min(t) as lo, max(t) as hi, count(*) as n from s
  ),
  g as (
    select s.t, s.z,
           width_bucket(s.t, lim.lo, lim.hi + 1e-6, greatest(p_buckets, 1)) as b
    from s, lim
    where lim.hi > lim.lo
  ),
  bajos as (select distinct on (b) b, t, z from g order by b, z asc,  t asc),
  altos as (select distinct on (b) b, t, z from g order by b, z desc, t asc),
  -- La primera y la última muestra van siempre: de ellas salen la duración,
  -- la basal y el valor final que se muestran en la ficha.
  extremos as (
    (select t, z from s order by t asc  limit 1)
    union all
    (select t, z from s order by t desc limit 1)
  )
  select u.t, u.z, (select lim.n from lim) as n
  from (
    select t, z from bajos
    union
    select t, z from altos
    union
    select t, z from extremos
  ) u
  order by u.t;
$$;

grant execute on function public.public_series(uuid, int) to anon, authenticated;


-- ─── VERIFICACIÓN ──────────────────────────────────────────────────────
-- Poné el id de una sesión publicada. `n` tiene que ser el total real de
-- muestras, y la cantidad de filas devueltas rondar las 1.000.
--
-- select count(*) as filas, max(n) as muestras_reales,
--        min(t) as t_inicial, max(t) as t_final
--   from public.public_series('120878ab-8c2c-46b5-9122-46ee4540ab59');
