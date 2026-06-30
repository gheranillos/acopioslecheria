-- =============================================================================
-- Acopios Lechería — Row Level Security
-- Ejecutar después de schema.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FUNCIONES AUXILIARES (security definer: leen perfiles sin disparar RLS
-- recursivamente; son la base de todas las políticas siguientes)
-- -----------------------------------------------------------------------------

create or replace function public.mi_rol()
returns rol_usuario_enum
language sql
security definer
set search_path = public
stable
as $$
  select rol from public.perfiles where id = auth.uid();
$$;

create or replace function public.mi_centro_acopio_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select centro_acopio_id from public.perfiles where id = auth.uid();
$$;

create or replace function public.es_operador()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfiles where id = auth.uid() and rol = 'operador'
  );
$$;

create or replace function public.es_jefe_de_centro(p_centro_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'jefe_centro' and centro_acopio_id = p_centro_id
  );
$$;

create or replace function public.es_logistica_de_centro(p_centro_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'logistica' and centro_acopio_id = p_centro_id
  );
$$;

-- Cobertura: ¿mi centro asignado cubre esta zona de refugio?
create or replace function public.mi_centro_cubre_zona(p_zona_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.cobertura_centro_zona ccz
    where ccz.zona_refugio_id = p_zona_id
      and ccz.centro_acopio_id = public.mi_centro_acopio_id()
  );
$$;

-- -----------------------------------------------------------------------------
-- TRIGGER: crear perfil automáticamente al registrarse un usuario
-- Rol por defecto = 'voluntario' (el menos privilegiado); el operador
-- reasigna rol y centro desde la pantalla de gestión de usuarios.
-- -----------------------------------------------------------------------------

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

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- TRIGGER: evitar que un usuario se auto-asigne rol/centro (solo el operador
-- puede cambiar rol o centro_acopio_id de un perfil, incluyendo el propio)
-- -----------------------------------------------------------------------------

create or replace function public.proteger_rol_y_centro()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- SQL Editor / migraciones: sin sesión auth.uid(); permitir bootstrap inicial.
  if auth.uid() is null then
    return new;
  end if;

  if not public.es_operador() then
    new.rol := old.rol;
    new.centro_acopio_id := old.centro_acopio_id;
  end if;
  return new;
end;
$$;

create trigger trg_perfiles_proteger_rol
  before update on public.perfiles
  for each row execute function public.proteger_rol_y_centro();

-- -----------------------------------------------------------------------------
-- TRIGGER: en necesidades, logística y voluntario solo pueden cambiar `estado`
-- (no item, cantidad_requerida, prioridad ni zona_refugio_id).
-- -----------------------------------------------------------------------------

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

create trigger trg_necesidades_proteger_campos
  before update on public.necesidades
  for each row execute function public.proteger_campos_necesidad();

-- -----------------------------------------------------------------------------
-- ACTIVAR RLS
-- -----------------------------------------------------------------------------

alter table public.centros_acopio enable row level security;
alter table public.depositos enable row level security;
alter table public.inventario enable row level security;
alter table public.zonas_refugio enable row level security;
alter table public.cobertura_centro_zona enable row level security;
alter table public.necesidades enable row level security;
alter table public.perfiles enable row level security;

-- -----------------------------------------------------------------------------
-- PERFILES
-- Lectura abierta a cualquier autenticado (se necesita para mostrar nombres
-- de "actualizado por" en el mapa, sin importar a qué centro pertenezca cada
-- quien). Escritura de rol/centro reservada al operador vía el trigger arriba.
-- -----------------------------------------------------------------------------

create policy "perfiles_select_autenticados"
  on public.perfiles for select
  to authenticated
  using (true);

create policy "perfiles_update_propio_o_operador"
  on public.perfiles for update
  to authenticated
  using (id = auth.uid() or public.es_operador())
  with check (id = auth.uid() or public.es_operador());

create policy "perfiles_insert_operador"
  on public.perfiles for insert
  to authenticated
  with check (public.es_operador());

create policy "perfiles_delete_operador"
  on public.perfiles for delete
  to authenticated
  using (public.es_operador());

-- -----------------------------------------------------------------------------
-- CENTROS_ACOPIO
-- Lectura abierta (mapa y dashboards muestran todos los centros activos).
-- Escritura: operador siempre; jefe_centro solo puede editar su propio centro.
-- -----------------------------------------------------------------------------

create policy "centros_select_autenticados"
  on public.centros_acopio for select
  to authenticated
  using (true);

create policy "centros_insert_operador"
  on public.centros_acopio for insert
  to authenticated
  with check (public.es_operador());

create policy "centros_update_operador_o_jefe_propio"
  on public.centros_acopio for update
  to authenticated
  using (public.es_operador() or public.es_jefe_de_centro(id))
  with check (public.es_operador() or public.es_jefe_de_centro(id));

create policy "centros_delete_operador"
  on public.centros_acopio for delete
  to authenticated
  using (public.es_operador());

-- -----------------------------------------------------------------------------
-- DEPOSITOS
-- Lectura abierta. Escritura: operador, o jefe/logística del centro dueño.
-- -----------------------------------------------------------------------------

create policy "depositos_select_autenticados"
  on public.depositos for select
  to authenticated
  using (true);

create policy "depositos_insert_operador_o_centro"
  on public.depositos for insert
  to authenticated
  with check (
    public.es_operador()
    or public.es_jefe_de_centro(centro_acopio_id)
    or public.es_logistica_de_centro(centro_acopio_id)
  );

create policy "depositos_update_operador_o_centro"
  on public.depositos for update
  to authenticated
  using (
    public.es_operador()
    or public.es_jefe_de_centro(centro_acopio_id)
    or public.es_logistica_de_centro(centro_acopio_id)
  )
  with check (
    public.es_operador()
    or public.es_jefe_de_centro(centro_acopio_id)
    or public.es_logistica_de_centro(centro_acopio_id)
  );

create policy "depositos_delete_operador_o_jefe"
  on public.depositos for delete
  to authenticated
  using (public.es_operador() or public.es_jefe_de_centro(centro_acopio_id));

-- -----------------------------------------------------------------------------
-- INVENTARIO
-- Aislado por centro a nivel de fila: solo operador, o jefe/logística del
-- centro dueño del depósito, pueden ver y editar. Logística no puede borrar.
-- -----------------------------------------------------------------------------

create policy "inventario_select_operador_o_centro"
  on public.inventario for select
  to authenticated
  using (
    public.es_operador()
    or exists (
      select 1 from public.depositos d
      where d.id = inventario.deposito_id
        and (
          public.es_jefe_de_centro(d.centro_acopio_id)
          or public.es_logistica_de_centro(d.centro_acopio_id)
        )
    )
  );

create policy "inventario_insert_operador_o_centro"
  on public.inventario for insert
  to authenticated
  with check (
    public.es_operador()
    or exists (
      select 1 from public.depositos d
      where d.id = inventario.deposito_id
        and (
          public.es_jefe_de_centro(d.centro_acopio_id)
          or public.es_logistica_de_centro(d.centro_acopio_id)
        )
    )
  );

create policy "inventario_update_operador_o_centro"
  on public.inventario for update
  to authenticated
  using (
    public.es_operador()
    or exists (
      select 1 from public.depositos d
      where d.id = inventario.deposito_id
        and (
          public.es_jefe_de_centro(d.centro_acopio_id)
          or public.es_logistica_de_centro(d.centro_acopio_id)
        )
    )
  )
  with check (
    public.es_operador()
    or exists (
      select 1 from public.depositos d
      where d.id = inventario.deposito_id
        and (
          public.es_jefe_de_centro(d.centro_acopio_id)
          or public.es_logistica_de_centro(d.centro_acopio_id)
        )
    )
  );

create policy "inventario_delete_operador_o_jefe"
  on public.inventario for delete
  to authenticated
  using (
    public.es_operador()
    or exists (
      select 1 from public.depositos d
      where d.id = inventario.deposito_id
        and public.es_jefe_de_centro(d.centro_acopio_id)
    )
  );

-- -----------------------------------------------------------------------------
-- ZONAS_REFUGIO
-- Lectura abierta (mapa público interno muestra todas las zonas).
-- Escritura: operador siempre; jefe_centro solo si su centro cubre la zona.
-- Logística NO puede editar zonas (solo inventario y estado de necesidades).
-- -----------------------------------------------------------------------------

create policy "zonas_select_autenticados"
  on public.zonas_refugio for select
  to authenticated
  using (true);

create policy "zonas_insert_operador_o_jefe"
  on public.zonas_refugio for insert
  to authenticated
  with check (public.es_operador() or public.mi_rol() = 'jefe_centro');

create policy "zonas_update_operador_o_jefe_cobertura"
  on public.zonas_refugio for update
  to authenticated
  using (
    public.es_operador()
    or (public.mi_rol() = 'jefe_centro' and public.mi_centro_cubre_zona(id))
  )
  with check (
    public.es_operador()
    or (public.mi_rol() = 'jefe_centro' and public.mi_centro_cubre_zona(id))
  );

create policy "zonas_delete_operador_o_jefe_cobertura"
  on public.zonas_refugio for delete
  to authenticated
  using (
    public.es_operador()
    or (public.mi_rol() = 'jefe_centro' and public.mi_centro_cubre_zona(id))
  );

-- -----------------------------------------------------------------------------
-- COBERTURA_CENTRO_ZONA
-- Lectura abierta. Gestión (asociar/desasociar zona-centro): operador o
-- jefe_centro, únicamente sobre su propio centro_acopio_id.
-- -----------------------------------------------------------------------------

create policy "cobertura_select_autenticados"
  on public.cobertura_centro_zona for select
  to authenticated
  using (true);

create policy "cobertura_insert_operador_o_jefe"
  on public.cobertura_centro_zona for insert
  to authenticated
  with check (public.es_operador() or public.es_jefe_de_centro(centro_acopio_id));

create policy "cobertura_delete_operador_o_jefe"
  on public.cobertura_centro_zona for delete
  to authenticated
  using (public.es_operador() or public.es_jefe_de_centro(centro_acopio_id));

-- -----------------------------------------------------------------------------
-- NECESIDADES
-- Lectura abierta (tablero tipo "oferta" visible para todos los roles,
-- incluyendo voluntario). Creación/borrado: operador o jefe del centro que
-- cubre la zona. Edición de estado: operador, jefe/logística del centro que
-- cubre la zona, y voluntario (cualquier zona) — el trigger de arriba garantiza
-- que logística/voluntario solo puedan tocar la columna `estado`.
-- -----------------------------------------------------------------------------

create policy "necesidades_select_autenticados"
  on public.necesidades for select
  to authenticated
  using (true);

create policy "necesidades_insert_operador_o_jefe_cobertura"
  on public.necesidades for insert
  to authenticated
  with check (
    public.es_operador()
    or (public.mi_rol() = 'jefe_centro' and public.mi_centro_cubre_zona(zona_refugio_id))
  );

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

create policy "necesidades_delete_operador_o_jefe_cobertura"
  on public.necesidades for delete
  to authenticated
  using (
    public.es_operador()
    or (public.mi_rol() = 'jefe_centro' and public.mi_centro_cubre_zona(zona_refugio_id))
  );
