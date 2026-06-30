-- =============================================================================
-- Acopios Lechería — Datos semilla
-- Ejecutar después de schema.sql y policies.sql
--
-- Coordenadas aproximadas (Lechería / Barcelona / Puerto La Cruz / Guanta,
-- Anzoátegui). Ajusta lat/lng desde la UI cuando tengas la ubicación exacta
-- de cada centro y zona.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CENTROS DE ACOPIO
-- -----------------------------------------------------------------------------

insert into public.centros_acopio (nombre, slug, descripcion, ciudad, lat, lng, estado)
values
  ('Puerto Príncipe', 'puerto-principe', 'Centro de acopio con datos operativos reales (depósito Puente Real).', 'Lechería', 10.22330, -64.69500, 'activo'),
  ('Playa Mansa', 'playa-mansa', null, 'Lechería', 10.22800, -64.69000, 'activo'),
  ('Forum', 'forum', null, 'Lechería', 10.21250, -64.68250, 'activo'),
  ('Gestión Social', 'gestion-social', null, 'Barcelona', 10.14500, -64.69000, 'activo');

-- -----------------------------------------------------------------------------
-- DEPÓSITOS — Puente Real es el único con datos reales hasta ahora.
-- -----------------------------------------------------------------------------

insert into public.depositos (centro_acopio_id, nombre, ubicacion)
select id, 'Puente Real', 'Puerto Príncipe, Lechería'
from public.centros_acopio
where slug = 'puerto-principe';

-- -----------------------------------------------------------------------------
-- ZONAS DE REFUGIO — todas bajo cobertura de Puerto Príncipe por ahora.
-- -----------------------------------------------------------------------------

insert into public.zonas_refugio (nombre, ciudad, encargado_nombre, lat, lng, estado)
values
  ('Aldea de Pescadores', 'Lechería', 'Edith', 10.23500, -64.70500, 'parcialmente_abastecido'),
  ('Capilla Aldea de Pescadores', 'Lechería', null, 10.23620, -64.70650, 'no_abastecido'),
  ('Troconal 5to', 'Lechería', null, 10.20500, -64.67000, 'no_abastecido');

-- -----------------------------------------------------------------------------
-- COBERTURA: Puerto Príncipe cubre las 3 zonas semilla.
-- -----------------------------------------------------------------------------

insert into public.cobertura_centro_zona (centro_acopio_id, zona_refugio_id)
select c.id, z.id
from public.centros_acopio c
join public.zonas_refugio z on z.nombre in (
  'Aldea de Pescadores',
  'Capilla Aldea de Pescadores',
  'Troconal 5to'
)
where c.slug = 'puerto-principe';

-- -----------------------------------------------------------------------------
-- INVENTARIO DE EJEMPLO en Puente Real (editar/borrar según datos reales).
-- -----------------------------------------------------------------------------

insert into public.inventario (deposito_id, categoria, item, cantidad, unidad)
select d.id, v.categoria::categoria_inventario_enum, v.item, v.cantidad, v.unidad::unidad_inventario_enum
from public.depositos d
join (
  values
    ('agua', 'Agua embotellada 500ml', 120, 'cajas'),
    ('alimentos_no_perecederos', 'Arroz', 80, 'kg'),
    ('medicinas', 'Suero oral', 50, 'unidades'),
    ('higiene', 'Jabón de baño', 100, 'unidades')
) as v(categoria, item, cantidad, unidad) on true
where d.nombre = 'Puente Real';

-- -----------------------------------------------------------------------------
-- NECESIDADES DE EJEMPLO (tablero de necesidades) en las zonas semilla.
-- -----------------------------------------------------------------------------

insert into public.necesidades (zona_refugio_id, item, cantidad_requerida, prioridad, estado)
select z.id, v.item, v.cantidad_requerida, v.prioridad::prioridad_enum, v.estado::estado_necesidad_enum
from public.zonas_refugio z
join (
  values
    ('Aldea de Pescadores', 'Agua potable', 200, 'alta', 'abierta'),
    ('Aldea de Pescadores', 'Pañales talla M', 50, 'media', 'en_proceso'),
    ('Capilla Aldea de Pescadores', 'Colchonetas', 30, 'alta', 'abierta'),
    ('Troconal 5to', 'Medicinas para presión arterial', 20, 'alta', 'abierta')
) as v(zona, item, cantidad_requerida, prioridad, estado) on z.nombre = v.zona;

-- -----------------------------------------------------------------------------
-- PRIMER USUARIO OPERADOR (Gherard)
-- No se puede crear un usuario de auth.users por SQL de forma confiable.
-- Pasos:
--   1. Crea la cuenta desde la pantalla de login (o desde el Dashboard de
--      Supabase → Authentication → Add user) con el email de Gherard.
--   2. El trigger handle_new_user le crea automáticamente un perfil con
--      rol = 'delivery'. Sube su rol a operador ejecutando:
--
--      update public.perfiles
--      set rol = 'operador'
--      where id = (select id from auth.users where email = 'gherard@ejemplo.com');
-- -----------------------------------------------------------------------------
