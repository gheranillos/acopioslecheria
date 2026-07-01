-- =============================================================================
-- Lectura pública para el home de donantes (ejecutar una vez en Supabase)
-- =============================================================================

-- Políticas RLS para rol anon (idempotente)
drop policy if exists "centros_select_anon" on public.centros_acopio;
create policy "centros_select_anon"
  on public.centros_acopio for select
  to anon
  using (estado = 'activo');

drop policy if exists "zonas_select_anon" on public.zonas_refugio;
create policy "zonas_select_anon"
  on public.zonas_refugio for select
  to anon
  using (true);

drop policy if exists "necesidades_select_anon" on public.necesidades;
create policy "necesidades_select_anon"
  on public.necesidades for select
  to anon
  using (estado in ('abierta', 'en_proceso'));

-- Función RPC: la app la usa como vía principal (security definer, lectura acotada)
create or replace function public.obtener_datos_donante()
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'centros', coalesce((
      select json_agg(to_jsonb(c) order by c.nombre)
      from public.centros_acopio c
      where c.estado = 'activo'
    ), '[]'::json),
    'zonas', coalesce((
      select json_agg(to_jsonb(z) order by z.nombre)
      from public.zonas_refugio z
    ), '[]'::json),
    'necesidades', coalesce((
      select json_agg(
        to_jsonb(n) || jsonb_build_object(
          'zona', jsonb_build_object('nombre', z.nombre, 'ciudad', z.ciudad)
        )
        order by
          case n.prioridad when 'alta' then 0 when 'media' then 1 else 2 end,
          n.created_at desc
      )
      from public.necesidades n
      inner join public.zonas_refugio z on z.id = n.zona_refugio_id
      where n.estado in ('abierta', 'en_proceso')
    ), '[]'::json)
  );
$$;

revoke all on function public.obtener_datos_donante() from public;
grant execute on function public.obtener_datos_donante() to anon, authenticated;

-- Verificación rápida (debe devolver centros > 0 si corriste seed.sql):
select public.obtener_datos_donante();
