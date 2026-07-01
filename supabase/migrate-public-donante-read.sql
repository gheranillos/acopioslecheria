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

drop policy if exists "cobertura_select_anon" on public.cobertura_centro_zona;
create policy "cobertura_select_anon"
  on public.cobertura_centro_zona for select
  to anon
  using (true);

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
    'necesidades_por_centro', coalesce((
      select json_agg(centro_group order by centro_group->'centro'->>'nombre')
      from (
        select json_build_object(
          'centro', jsonb_build_object(
            'id', c.id,
            'nombre', c.nombre,
            'ciudad', c.ciudad
          ),
          'necesidades', (
            select coalesce(json_agg(
              to_jsonb(n) order by
                case n.prioridad when 'alta' then 0 when 'media' then 1 else 2 end,
                n.created_at desc
            ), '[]'::json)
            from public.necesidades n
            inner join public.cobertura_centro_zona ccz
              on ccz.zona_refugio_id = n.zona_refugio_id
             and ccz.centro_acopio_id = c.id
            where n.estado in ('abierta', 'en_proceso')
          )
        ) as centro_group
        from public.centros_acopio c
        where c.estado = 'activo'
      ) groups
      where (groups.centro_group->'necesidades')::jsonb <> '[]'::jsonb
    ), '[]'::json)
  );
$$;

revoke all on function public.obtener_datos_donante() from public;
grant execute on function public.obtener_datos_donante() to anon, authenticated;

-- Verificación rápida (debe devolver centros > 0 si corriste seed.sql):
select public.obtener_datos_donante();
