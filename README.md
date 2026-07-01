# Acopios Lechería

Plataforma de coordinación de ayuda humanitaria post-terremoto en Anzoátegui (Lechería,
Barcelona, Puerto La Cruz y Guanta). Conecta **centros de acopio** con **zonas de
refugio** para saber en tiempo real qué se necesita, dónde, y quién lo está cubriendo.

## Stack

- **Next.js 16 (App Router)** + TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** (Postgres + Auth + Row Level Security)
- **Leaflet** / **react-leaflet** con tiles de OpenStreetMap (sin Google Maps)
- Deploy pensado para **Vercel**

## Estructura de carpetas

```
app/
  page.tsx               → home público (rol donante, sin login)
  login/                 → acceso equipo (autenticación)
  (panel)/               → rutas protegidas, comparten el layout con sidebar/nav
    dashboard/
    mapa/
    inventario/
    necesidades/
    cobertura/
    usuarios/
components/
  ui/                    → shadcn/ui
  layout/                → shell de la app (sidebar, header móvil, bottom nav)
  map/                   → mapa Leaflet, iconos, paneles de detalle
  inventario/ necesidades/ cobertura/ usuarios/ auth/ dashboard/ shared/
lib/
  supabase/              → clientes de Supabase (browser, server, middleware)
  auth/                  → sesión actual + helpers de permisos por rol
  data/                  → queries y derivación de datos para Server Components
  nav.ts                 → definición de la navegación por rol
  utils/                 → tiempo relativo, etc.
types/                   → tipos de la base de datos y del dominio
supabase/
  schema.sql             → enums + tablas + triggers de updated_at
  policies.sql           → funciones auxiliares + Row Level Security por rol
  seed.sql               → datos semilla (centros, depósito, zonas, inventario/necesidades de ejemplo)
  migrate-public-donante-read.sql → lectura pública para el home donante (bases ya creadas)
proxy.ts                 → proxy (antes "middleware") que protege rutas y refresca la sesión
```

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el **SQL Editor**, ejecuta en este orden:
   1. `supabase/schema.sql`
   2. `supabase/policies.sql`
   3. `supabase/seed.sql`
3. Copia `.env.local.example` a `.env.local` y completa con las credenciales de tu
   proyecto (Project Settings → API):

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # solo servidor; para crear usuarios desde /usuarios
   ```

   La **service role** está en Supabase → Settings → API → `service_role` (secret). **No** la expongas en el cliente ni la subas a Git.

### Crear el primer usuario operador

Opción A — **desde la app** (recomendado una vez tengas un operador):

1. Configura `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` o Vercel.
2. Inicia sesión como operador → **Usuarios** → **Nuevo usuario** (correo, contraseña temporal, rol).

Opción B — **bootstrap manual** (primera vez):

1. Crea la cuenta en Supabase → Authentication → Add user, o desde `/login` si el registro está abierto.
2. El trigger `handle_new_user` crea el perfil con `rol = 'voluntario'`.
3. Promueve a operador en el SQL Editor:

   ```sql
   update public.perfiles
   set rol = 'operador'
   where id = (select id from auth.users where email = 'correo@ejemplo.com');
   ```

Desde **Usuarios**, el operador puede crear más cuentas, centros de acopio y asignar rol/centro sin entrar a Supabase.

## 2. Correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz (`/`) es el home para donantes; el panel operativo empieza tras iniciar sesión en `/login`.

## 3. Roles, permisos y qué ve cada uno

La app tiene **cinco modos de uso**: el **donante** (público, sin cuenta) y **cuatro roles autenticados**. Los permisos se aplican en **dos capas**: la UI oculta acciones no permitidas (`lib/auth/roles.ts`, `lib/nav.ts`), pero la **seguridad real** está en las políticas RLS de `supabase/policies.sql`.

### Donante (sin login) — `/`

No es un rol en la base de datos: es el **home público**. Cualquiera entra directo a la web y ve qué se necesita y dónde donar. El enlace **Acceso equipo** (header/footer) lleva a `/login` de forma discreta.

| Ve | Puede hacer |
|----|-------------|
| Necesidades **abiertas** y **en proceso** (ítem, cantidad, prioridad, zona) | Solo lectura |
| Estado de **todas las zonas** (abastecido / parcial / no abastecido) | Solo lectura |
| Mapa de **centros de acopio activos** | Solo lectura |

No ve inventario interno, cobertura, usuarios ni necesidades ya **cubiertas**. Requiere las políticas `anon` de `supabase/migrate-public-donante-read.sql` (o un `policies.sql` actualizado).

### Menú del panel (usuarios autenticados)

| Pantalla | Operador | Jefe centro | Logística | Voluntario |
|----------|:--------:|:-----------:|:---------:|:----------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Mapa | ✅ | ✅ | ✅ | ✅ |
| Inventario | ✅ | ✅ | ✅ | ❌ |
| Necesidades | ✅ | ✅ | ✅ | ✅ |
| Cobertura | ✅ | ✅ | ❌ | ❌ |
| Usuarios | ✅ | ❌ | ❌ | ❌ |

Tras login, la app redirige a `/dashboard`. Si un usuario autenticado visita `/`, se envía al dashboard.

### Operador

Alcance: **todo el sistema**, todos los centros.

- **Dashboard / mapa:** todos los centros, zonas y necesidades.
- **Inventario:** cualquier centro (con filtro); crear, editar y borrar depósitos e ítems.
- **Necesidades:** crear, editar, borrar y cambiar estado en cualquier zona.
- **Cobertura:** asociar/desasociar zonas a centros; crear zonas.
- **Usuarios:** cambiar rol y centro; **crear cuentas** (correo + contraseña temporal) y **crear centros de acopio** desde la misma pantalla (requiere `SUPABASE_SERVICE_ROLE_KEY`).

### Jefe de centro de acopio

Alcance: su **centro asignado** (`centro_acopio_id`). Sin centro asignado, muchas pantallas quedan vacías.

- **Dashboard / mapa:** su centro y las zonas que cubre.
- **Inventario:** solo depósitos de su centro; crear depósito; editar y borrar ítems.
- **Necesidades:** ve el tablero global, pero solo **crea/edita/borra** en zonas que **su centro cubre**; cambia estado solo en esas zonas.
- **Cobertura:** asociar/desasociar zonas a **su** centro; crear zonas nuevas.
- **Zonas:** editar/borrar solo zonas que su centro cubre.
- **Centros:** lectura de todos; editar solo el propio.

No gestiona usuarios ni borra centros.

### Encargado de logística

Alcance: operación de **su centro asignado**.

- **Dashboard / mapa:** su centro y zonas que cubre.
- **Inventario:** solo su centro; crear y editar ítems/depósitos; **no puede borrar** ítems.
- **Necesidades:** ve todas; **solo cambia el estado** (abierta → en proceso → cubierta) en zonas que su centro cubre. No crea, no edita ítem/cantidad/prioridad ni borra.

No accede a cobertura ni usuarios.

### Voluntario

Alcance: apoyo en campo — ver necesidades y marcar avances.

- **Dashboard / mapa:** filtrado a su centro si tiene uno asignado.
- **Necesidades:** ve **todas**; puede **cambiar el estado en cualquier zona**. No crea, no edita campos completos ni borra.

No accede a inventario, cobertura ni usuarios. Rol por defecto al registrarse (el operador reasigna desde **Usuarios**).

### Resumen por entidad (base de datos)

| Entidad | Operador | Jefe centro | Logística | Voluntario | Donante |
|---------|----------|-------------|-----------|------------|---------|
| Centros | CRUD | Editar el suyo | — | — | Ver activos |
| Depósitos | CRUD | CRUD su centro | CRUD su centro | — | — |
| Inventario | CRUD | CRUD su centro | Crear/editar su centro | — | — |
| Zonas | CRUD | CRUD si cubre | Solo lectura | Solo lectura | Ver estado |
| Cobertura | CRUD | Su centro | — | — | — |
| Necesidades | CRUD | CRUD si cubre | Estado si cubre | Estado en todas | Ver abiertas/en proceso |
| Perfiles | Gestionar | Solo el suyo | Solo el suyo | Solo el suyo | — |

### Notas importantes

- **Jefe, logística y voluntario** necesitan que un operador les asigne `centro_acopio_id` en `/usuarios` (el voluntario puede operar sin centro, pero el dashboard se filtra).
- **Voluntario vs logística:** el voluntario puede marcar estado en **cualquier** necesidad; logística y jefe solo en zonas que **su centro cubre**.
- **Trigger en DB:** logística y voluntario, al editar una necesidad, solo pueden cambiar la columna `estado` — no ítem, cantidad ni prioridad.
- Lo que publican jefes y operadores en necesidades y el estado de zonas **se refleja en el home donante**; el inventario interno no es público.

Detalle de implementación: `lib/auth/roles.ts`, `supabase/policies.sql`. Para contribuir, ver también [CONTRIBUTING.md](./CONTRIBUTING.md).

## 4. Notas de diseño

- El mapa, el dashboard y los paneles de detalle cargan todo el dataset operativo en un
  solo round-trip (`lib/data/queries.ts#getMapaData`) para que la navegación posterior
  no dependa de una conexión estable — clave dado que la mayoría de usuarios entra desde
  el celular con conexión inestable.
- En móvil, el mapa ocupa toda la pantalla con un botón flotante para volver al panel.
- Las tablas de inventario se muestran como tarjetas apiladas en móvil (sin scroll
  horizontal) y como tabla en pantallas md+.
- Una zona de refugio se marca como "dato desactualizado" si su `updated_at` tiene más
  de 24 horas.

## 5. Fuera de alcance (MVP actual)

Mencionado explícitamente como fuera de alcance, pero con la arquitectura abierta para
agregarlo después:

- Notificaciones push/SMS a encargados de zona
- Modo offline / sincronización diferida
- Reportes exportables (PDF/Excel)
- Historial de auditoría detallado por cambio

## 6. Deploy en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com).
2. **Antes del primer deploy**, en el proyecto de Vercel ve a **Settings → Environment Variables** y agrega (para Production, Preview y Development):

   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto (Supabase → Settings → API) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key del mismo panel |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role secret (solo servidor; crear usuarios en `/usuarios`) |

3. Guarda y haz **Redeploy** (Deployments → ⋯ → Redeploy). Sin estas variables la app muestra *Internal Server Error* porque el proxy intenta conectar a Supabase en cada request.

4. En Supabase → Authentication → URL Configuration, agrega tu dominio de Vercel (ej. `https://acopioslecheria.vercel.app`) en **Site URL** y **Redirect URLs**.

Pensado para Vercel: conecta el repositorio, configura las variables de entorno y despliega.
