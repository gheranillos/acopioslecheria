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
  login/                 → login (público)
  (panel)/                → rutas protegidas, comparten el layout con sidebar/nav
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
  seed.sql                → datos semilla (centros, depósito, zonas, inventario/necesidades de ejemplo)
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
   ```

### Crear el primer usuario operador

No se puede crear un usuario de `auth.users` por SQL de forma confiable. Pasos:

1. Crea la cuenta desde la pantalla de login de la app, o desde el Dashboard de
   Supabase → Authentication → Add user (con el email de Gherard, el operador).
2. El trigger `handle_new_user` le crea automáticamente un perfil con `rol = 'voluntario'`.
3. Sube su rol a operador ejecutando en el SQL Editor:

   ```sql
   update public.perfiles
   set rol = 'operador'
   where id = (select id from auth.users where email = 'correo-de-gherard@ejemplo.com');
   ```

4. Desde la pantalla **Usuarios** (visible solo para operadores), puedes asignar rol y
   centro de acopio a las siguientes cuentas que se registren.

## 2. Correr en local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 3. Roles y permisos

| Rol | Permisos |
|---|---|
| Operador | Acceso total: todas las entidades, gestión de usuarios y roles, ve todos los centros |
| Jefe de centro de acopio | CRUD completo sobre su propio centro: inventario, zonas cubiertas, necesidades |
| Encargado de logística | Edita inventario y estado de necesidades de su centro; no elimina ni gestiona usuarios |
| Voluntario | Lectura del tablero de necesidades; puede actualizar su estado (en proceso / cubierta) |

La aplicación de estos permisos es **doble**: la UI oculta lo que cada rol no puede
hacer, pero la garantía real está en las políticas de Row Level Security definidas en
`supabase/policies.sql`, que aíslan los datos a nivel de base de datos.

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

3. Guarda y haz **Redeploy** (Deployments → ⋯ → Redeploy). Sin estas variables la app muestra *Internal Server Error* porque el proxy intenta conectar a Supabase en cada request.

4. En Supabase → Authentication → URL Configuration, agrega tu dominio de Vercel (ej. `https://acopioslecheria.vercel.app`) en **Site URL** y **Redirect URLs**.

Pensado para Vercel: conecta el repositorio, configura las variables de entorno y despliega.
