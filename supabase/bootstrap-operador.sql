-- =============================================================================
-- Promover el primer usuario a operador
-- Ejecutar en Supabase → SQL Editor (una sola vez, por usuario)
-- =============================================================================

-- 1) Verifica que el usuario y su perfil existen:
select u.id, u.email, p.rol, p.nombre_completo
from auth.users u
left join public.perfiles p on p.id = u.id
where lower(u.email) = lower('gherardgon@gmail.com');

-- 2) Si la fila de arriba muestra rol = 'delivery', ejecuta esto:
update public.perfiles p
set
  rol = 'operador',
  nombre_completo = coalesce(nullif(p.nombre_completo, ''), 'Gherard')
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('gherardgon@gmail.com');

-- 3) Confirma el cambio:
select u.email, p.rol, p.nombre_completo
from auth.users u
join public.perfiles p on p.id = u.id
where lower(u.email) = lower('gherardgon@gmail.com');

-- Si el paso 1 no devuelve filas → el usuario no existe en Authentication → Users.
-- Créalo ahí primero (Auto Confirm User) y vuelve a ejecutar.

-- Si el paso 1 muestra perfil = NULL (usuario sí existe, perfil no):
-- insert into public.perfiles (id, nombre_completo, rol)
-- select id, email, 'operador'
-- from auth.users
-- where lower(email) = lower('gherardgon@gmail.com');
