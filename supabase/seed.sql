-- =============================================================================
-- Acopios Lechería — Datos semilla (idempotente: se puede ejecutar más de una vez)
-- Ejecutar en Supabase → SQL Editor DESPUÉS de schema.sql y policies.sql
-- =============================================================================

-- CENTROS DE ACOPIO (4 centros iniciales)
insert into public.centros_acopio (nombre, slug, descripcion, ciudad, lat, lng, estado)
values
  ('Puerto Príncipe', 'puerto-principe', 'Centro de acopio con datos operativos reales (depósito Puente Real).', 'Lechería', 10.19616, -64.68603, 'activo'),
  ('Playa Mansa', 'playa-mansa', null, 'Lechería', 10.20368, -64.70235, 'activo'),
  ('Forum', 'forum', null, 'Lechería', 10.18679, -64.68912, 'activo'),
  ('Gestión Social', 'gestion-social', null, 'Barcelona', 10.13707, -64.68628, 'activo')
on conflict (slug) do update set
  lat = excluded.lat,
  lng = excluded.lng;

-- DEPÓSITO Puente Real → Puerto Príncipe
insert into public.depositos (centro_acopio_id, nombre, ubicacion)
select c.id, 'Puente Real', 'Puerto Príncipe, Lechería'
from public.centros_acopio c
where c.slug = 'puerto-principe'
  and not exists (
    select 1 from public.depositos d
    where d.centro_acopio_id = c.id and d.nombre = 'Puente Real'
  );

-- ZONAS DE REFUGIO
insert into public.zonas_refugio (nombre, ciudad, encargado_nombre, lat, lng, estado)
select v.nombre, v.ciudad::ciudad_enum, v.encargado, v.lat, v.lng, v.estado::estado_zona_enum
from (
  values
    ('Aldea de Pescadores', 'Lechería', 'Edith', 10.19020, -64.69450, 'parcialmente_abastecido'),
    ('Capilla Aldea de Pescadores', 'Lechería', null::text, 10.19080, -64.69520, 'no_abastecido'),
    ('Troconal 5to', 'Lechería', null::text, 10.17065, -64.67364, 'no_abastecido')
) as v(nombre, ciudad, encargado, lat, lng, estado)
where not exists (
  select 1 from public.zonas_refugio z where z.nombre = v.nombre
);

-- Actualizar coordenadas si las zonas ya existían con datos viejos
update public.zonas_refugio set lat = 10.19020, lng = -64.69450 where nombre = 'Aldea de Pescadores';
update public.zonas_refugio set lat = 10.19080, lng = -64.69520 where nombre = 'Capilla Aldea de Pescadores';
update public.zonas_refugio set lat = 10.17065, lng = -64.67364 where nombre = 'Troconal 5to';

-- COBERTURA: Puerto Príncipe cubre las 3 zonas
insert into public.cobertura_centro_zona (centro_acopio_id, zona_refugio_id)
select c.id, z.id
from public.centros_acopio c
cross join public.zonas_refugio z
where c.slug = 'puerto-principe'
  and z.nombre in (
    'Aldea de Pescadores',
    'Capilla Aldea de Pescadores',
    'Troconal 5to'
  )
on conflict do nothing;

-- INVENTARIO DE EJEMPLO en Puente Real
insert into public.inventario (deposito_id, categoria, item, cantidad, unidad)
select d.id, v.categoria::categoria_inventario_enum, v.item, v.cantidad, v.unidad::unidad_inventario_enum
from public.depositos d
join public.centros_acopio c on c.id = d.centro_acopio_id and c.slug = 'puerto-principe'
cross join (
  values
    ('agua', 'Agua embotellada 500ml', 120, 'cajas'),
    ('alimentos_no_perecederos', 'Arroz', 80, 'kg'),
    ('medicinas', 'Suero oral', 50, 'unidades'),
    ('higiene', 'Jabón de baño', 100, 'unidades')
) as v(categoria, item, cantidad, unidad)
where d.nombre = 'Puente Real'
  and not exists (
    select 1 from public.inventario i
    where i.deposito_id = d.id and i.item = v.item
  );

-- NECESIDADES DE EJEMPLO
insert into public.necesidades (zona_refugio_id, item, cantidad_requerida, prioridad, estado)
select z.id, v.item, v.cantidad_requerida, v.prioridad::prioridad_enum, v.estado::estado_necesidad_enum
from public.zonas_refugio z
join (
  values
    ('Aldea de Pescadores', 'Agua potable', 200, 'alta', 'abierta'),
    ('Aldea de Pescadores', 'Pañales talla M', 50, 'media', 'en_proceso'),
    ('Capilla Aldea de Pescadores', 'Colchonetas', 30, 'alta', 'abierta'),
    ('Troconal 5to', 'Medicinas para presión arterial', 20, 'alta', 'abierta')
) as v(zona, item, cantidad_requerida, prioridad, estado) on z.nombre = v.zona
where not exists (
  select 1 from public.necesidades n
  where n.zona_refugio_id = z.id and n.item = v.item
);

-- Verificación rápida (debe devolver 4 centros):
select count(*) as total_centros from public.centros_acopio;
