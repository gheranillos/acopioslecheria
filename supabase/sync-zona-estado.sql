-- =============================================================================
-- Sincroniza estado de zonas según necesidades (ejecutar una vez en Supabase)
-- =============================================================================

create or replace function public.derivar_estado_zona(p_zona_id uuid)
returns estado_zona_enum
language sql
stable
set search_path = public
as $$
  select case
    when coalesce(n.total, 0) = 0 or coalesce(n.pendientes, 0) = 0 then 'abastecido'::estado_zona_enum
    when coalesce(n.cubiertas, 0) > 0 then 'parcialmente_abastecido'::estado_zona_enum
    else 'no_abastecido'::estado_zona_enum
  end
  from (
    select
      count(*)::int as total,
      count(*) filter (where estado in ('abierta', 'en_proceso'))::int as pendientes,
      count(*) filter (where estado = 'cubierta')::int as cubiertas
    from public.necesidades
    where zona_refugio_id = p_zona_id
  ) n;
$$;

create or replace function public.sincronizar_estado_zona_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_zona_id uuid;
  v_nuevo estado_zona_enum;
begin
  v_zona_id := coalesce(new.zona_refugio_id, old.zona_refugio_id);
  v_nuevo := public.derivar_estado_zona(v_zona_id);

  update public.zonas_refugio
  set
    estado = v_nuevo,
    updated_by = auth.uid()
  where id = v_zona_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_necesidades_sync_zona_estado on public.necesidades;
create trigger trg_necesidades_sync_zona_estado
  after insert or update of estado, zona_refugio_id or delete
  on public.necesidades
  for each row
  execute function public.sincronizar_estado_zona_trigger();

-- Alinear zonas existentes con las necesidades actuales
update public.zonas_refugio z
set
  estado = public.derivar_estado_zona(z.id),
  updated_at = now();
