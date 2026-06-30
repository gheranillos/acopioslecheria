-- =============================================================================
-- Renombrar rol 'delivery' → 'voluntario' (ejecutar una vez en Supabase SQL Editor)
-- =============================================================================

alter type public.rol_usuario_enum rename value 'delivery' to 'voluntario';

alter table public.perfiles
  alter column rol set default 'voluntario';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre_completo, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre_completo', new.email, 'Sin nombre'),
    'voluntario'
  );
  return new;
end;
$$;

create or replace function public.proteger_campos_necesidad()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.mi_rol() in ('logistica', 'voluntario') then
    new.item := old.item;
    new.cantidad_requerida := old.cantidad_requerida;
    new.prioridad := old.prioridad;
    new.zona_refugio_id := old.zona_refugio_id;
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop policy if exists "necesidades_update_por_rol" on public.necesidades;

create policy "necesidades_update_por_rol"
  on public.necesidades for update
  to authenticated
  using (
    public.es_operador()
    or public.mi_rol() = 'voluntario'
    or (
      public.mi_rol() in ('jefe_centro', 'logistica')
      and public.mi_centro_cubre_zona(zona_refugio_id)
    )
  )
  with check (
    public.es_operador()
    or public.mi_rol() = 'voluntario'
    or (
      public.mi_rol() in ('jefe_centro', 'logistica')
      and public.mi_centro_cubre_zona(zona_refugio_id)
    )
  );

-- Verificación:
select distinct rol from public.perfiles order by rol;
