-- =============================================================================
-- Acopios Lechería — Esquema de base de datos
-- Ejecutar en el SQL Editor de Supabase en este orden:
--   1. schema.sql   (este archivo)
--   2. policies.sql
--   3. seed.sql
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMS
-- -----------------------------------------------------------------------------

create type ciudad_enum as enum (
  'Lechería',
  'Barcelona',
  'Puerto La Cruz',
  'Guanta'
);

create type estado_centro_enum as enum (
  'activo',
  'inactivo'
);

create type estado_zona_enum as enum (
  'abastecido',
  'parcialmente_abastecido',
  'no_abastecido'
);

create type categoria_inventario_enum as enum (
  'agua',
  'alimentos_no_perecederos',
  'medicinas',
  'higiene',
  'ropa',
  'otros'
);

create type unidad_inventario_enum as enum (
  'kg',
  'litros',
  'unidades',
  'cajas'
);

create type prioridad_enum as enum (
  'alta',
  'media',
  'baja'
);

create type estado_necesidad_enum as enum (
  'abierta',
  'en_proceso',
  'cubierta'
);

create type rol_usuario_enum as enum (
  'operador',
  'jefe_centro',
  'logistica',
  'voluntario'
);

-- -----------------------------------------------------------------------------
-- TABLAS
-- -----------------------------------------------------------------------------

create table public.centros_acopio (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  slug        text not null unique,
  descripcion text,
  ciudad      ciudad_enum not null,
  lat         double precision not null,
  lng         double precision not null,
  estado      estado_centro_enum not null default 'activo',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.centros_acopio is 'Centros de acopio que reciben y almacenan donaciones.';

create table public.depositos (
  id                uuid primary key default gen_random_uuid(),
  centro_acopio_id  uuid not null references public.centros_acopio(id) on delete cascade,
  nombre            text not null,
  ubicacion         text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.depositos is 'Depósitos físicos asociados a un centro de acopio.';

create index depositos_centro_acopio_id_idx on public.depositos(centro_acopio_id);

create table public.zonas_refugio (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  ciudad              ciudad_enum not null,
  encargado_nombre    text,
  encargado_contacto  text,
  lat                 double precision not null,
  lng                 double precision not null,
  estado              estado_zona_enum not null default 'no_abastecido',
  updated_at          timestamptz not null default now(),
  updated_by          uuid references auth.users(id) on delete set null
);

comment on table public.zonas_refugio is 'Comunidades / zonas de refugio que necesitan ser abastecidas.';

-- Perfiles: extiende auth.users con datos de rol y centro asignado.
-- Se crea antes de inventario/necesidades porque ambas referencian perfiles(id).
create table public.perfiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  nombre_completo   text not null,
  rol               rol_usuario_enum not null default 'voluntario',
  centro_acopio_id  uuid references public.centros_acopio(id) on delete set null,
  telefono          text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.perfiles is 'Extiende auth.users con rol, centro asignado y datos de contacto.';

create index perfiles_centro_acopio_id_idx on public.perfiles(centro_acopio_id);

create table public.inventario (
  id          uuid primary key default gen_random_uuid(),
  deposito_id uuid not null references public.depositos(id) on delete cascade,
  categoria   categoria_inventario_enum not null,
  item        text not null,
  cantidad    numeric not null default 0 check (cantidad >= 0),
  unidad      unidad_inventario_enum not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null
);

comment on table public.inventario is 'Stock disponible por depósito.';

create index inventario_deposito_id_idx on public.inventario(deposito_id);
create index inventario_categoria_idx on public.inventario(categoria);

create table public.cobertura_centro_zona (
  centro_acopio_id  uuid not null references public.centros_acopio(id) on delete cascade,
  zona_refugio_id   uuid not null references public.zonas_refugio(id) on delete cascade,
  created_at        timestamptz not null default now(),
  primary key (centro_acopio_id, zona_refugio_id)
);

comment on table public.cobertura_centro_zona is 'Relación N:N entre centros de acopio y zonas de refugio que cubren.';

create index cobertura_zona_refugio_id_idx on public.cobertura_centro_zona(zona_refugio_id);

create table public.necesidades (
  id                  uuid primary key default gen_random_uuid(),
  zona_refugio_id     uuid not null references public.zonas_refugio(id) on delete cascade,
  item                text not null,
  cantidad_requerida  numeric not null default 1 check (cantidad_requerida > 0),
  prioridad           prioridad_enum not null default 'media',
  estado              estado_necesidad_enum not null default 'abierta',
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.necesidades is 'Tablero de necesidades abiertas por zona de refugio.';

create index necesidades_zona_refugio_id_idx on public.necesidades(zona_refugio_id);
create index necesidades_estado_idx on public.necesidades(estado);

-- -----------------------------------------------------------------------------
-- TRIGGERS: mantener updated_at al día
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_centros_acopio_updated_at
  before update on public.centros_acopio
  for each row execute function public.set_updated_at();

create trigger trg_depositos_updated_at
  before update on public.depositos
  for each row execute function public.set_updated_at();

create trigger trg_inventario_updated_at
  before update on public.inventario
  for each row execute function public.set_updated_at();

create trigger trg_zonas_refugio_updated_at
  before update on public.zonas_refugio
  for each row execute function public.set_updated_at();

create trigger trg_necesidades_updated_at
  before update on public.necesidades
  for each row execute function public.set_updated_at();

create trigger trg_perfiles_updated_at
  before update on public.perfiles
  for each row execute function public.set_updated_at();
