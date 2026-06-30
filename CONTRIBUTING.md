# Guía de contribución — Acopios Lechería

Gracias por sumarte. Este documento explica **cómo trabajar en el repo**, el **flujo de desarrollo** y **cómo la app se conecta con Supabase** (auth, datos y permisos).

Para contexto del producto y setup rápido, lee primero el [README](./README.md).

---

## Qué es el proyecto (en una frase)

Plataforma web **mobile-first** que coordina **centros de acopio** con **zonas de refugio** en Anzoátegui (Lechería, Barcelona, Puerto La Cruz, Guanta) para saber qué se necesita, dónde hay stock y quién lo está cubriendo.

---

## Requisitos

- **Node.js 20+** (el proyecto corre con Next.js 16)
- **npm**
- Cuenta en [Supabase](https://supabase.com) (proyecto propio para desarrollo local)
- Git

Opcional: cuenta en [Vercel](https://vercel.com) si vas a tocar deploy o variables de entorno de producción.

---

## Primer arranque en local

```bash
git clone <url-del-repo>
cd acopioslecheria
npm install
cp .env.local.example .env.local
```

Completa `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Luego configura la base de datos (ver sección [Supabase](#supabase-cómo-lo-manejamos)) y corre:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Verifica el build antes de abrir PR:

```bash
npm run build
npm run lint
```

---

## Flujo de trabajo (Git)

No hay CI estricto todavía; seguimos un flujo simple y predecible:

### 1. Antes de codear

- Revisa issues / tareas acordadas con el equipo.
- Si el cambio toca **schema o permisos**, coordina primero: afecta a todos los entornos Supabase.

### 2. Rama

```bash
git checkout -b tipo/descripcion-corta
```

Prefijos habituales:

| Prefijo | Uso |
|---------|-----|
| `feat/` | Funcionalidad nueva |
| `fix/` | Corrección de bug |
| `refactor/` | Cambio interno sin cambiar comportamiento |
| `docs/` | Solo documentación |
| `supabase/` | Cambios de schema, policies o migraciones |

Ejemplos: `feat/crud-centros`, `fix/mapa-blur-desktop`, `supabase/add-audit-log`.

### 3. Commits

- Mensajes en **español o inglés**, pero claros y en imperativo: `fix: overlay del mapa en desktop`, `feat: exportar necesidades a CSV`.
- Un commit = un cambio lógico. No mezclar refactor grande + feature + SQL en el mismo commit si se puede evitar.

### 4. Pull Request

Abre PR contra `main` (o la rama base acordada) con:

- **Qué** cambia y **por qué**
- Capturas si hay UI
- Si hay SQL: indicar **qué archivo ejecutar** y en **qué orden**
- Checklist de prueba manual (ver abajo)

### 5. Revisión y merge

- Al menos una revisión de otro dev antes de merge (cuando el equipo lo permita).
- Quien mergea en producción debe aplicar las migraciones SQL en el proyecto Supabase de **producción** si el PR las incluye.

---

## Arquitectura de la app (resumen)

```
Browser                    Next.js (Vercel)                    Supabase
───────                    ────────────────                    ────────
/login ───────────────►  proxy.ts (sesión)  ───────────────►  Auth (JWT en cookies)
(panel)/* ────────────►  Server Components  ──select/insert──►  Postgres + RLS
formularios ──────────►  Server Actions     ──mutations──────►  (mismas policies)
mapa (client) ────────►  datos ya cargados  (sin fetch extra por click)
```

### Capas principales

| Carpeta | Rol |
|---------|-----|
| `app/` | Rutas App Router. `(panel)/` = rutas autenticadas. |
| `components/` | UI por dominio (`map/`, `inventario/`, …) + `ui/` (shadcn). |
| `lib/data/queries.ts` | Lecturas en Server Components (PostgREST vía Supabase). |
| `app/(panel)/*/actions.ts` | Escrituras con Server Actions. |
| `lib/auth/` | Sesión (`session.ts`) y permisos de UI (`roles.ts`). |
| `lib/supabase/` | Clientes browser / server / middleware. |
| `types/` | Tipos del dominio y de la DB (`database.types.ts`). |
| `supabase/*.sql` | **Fuente de verdad** del schema, RLS y datos semilla. |

### Patrón de lectura

Las páginas del panel son **Server Components** que llaman funciones en `lib/data/queries.ts`:

```ts
const supabase = await createClient(); // lib/supabase/server.ts
const { data, error } = await supabase.from("centros_acopio").select("*");
```

El dataset operativo completo se carga de una vez con `getMapaData()` para el mapa y el dashboard — diseño pensado para **conexión móvil inestable**.

### Patrón de escritura

Las mutaciones van en **Server Actions** (`"use server"`):

1. `await requireUsuario()` — asegura sesión + perfil.
2. `createClient()` y operación PostgREST (`insert`, `update`, `delete`).
3. `revalidatePath(...)` en las rutas afectadas.

Ejemplo real: `app/(panel)/cobertura/actions.ts`.

Si RLS rechaza la operación, Supabase devuelve error y la acción lo propaga a la UI.

### Permisos: dos capas (obligatorio)

| Capa | Dónde | Para qué |
|------|-------|----------|
| **UI** | `lib/auth/roles.ts`, checks en páginas | Ocultar botones y rutas |
| **RLS** | `supabase/policies.sql` | **Seguridad real** — nadie puede saltársela desde la API |

Regla: **nunca** confíes solo en la UI. Todo cambio de permiso debe incluir política RLS + ajuste de UI si aplica.

---

## Supabase: cómo lo manejamos

Este proyecto **no usa** Supabase CLI ni migraciones automáticas. El schema vive en archivos SQL versionados en Git y se aplica **manualmente** en el SQL Editor de cada entorno (local/staging/prod).

### Archivos SQL y orden de ejecución

| Orden | Archivo | Contenido |
|-------|---------|-----------|
| 1 | `supabase/schema.sql` | Extensiones, enums, tablas, índices, triggers `updated_at` |
| 2 | `supabase/policies.sql` | Funciones helper, triggers de auth/seguridad, **RLS** |
| 3 | `supabase/seed.sql` | Datos semilla idempotentes (centros, zonas, inventario de ejemplo) |

**Proyecto nuevo:** ejecuta los tres en ese orden.

**Proyecto existente:** no vuelvas a correr `schema.sql` entero (fallará si las tablas ya existen). Usa scripts de migración puntuales (ver abajo).

### Scripts auxiliares en `supabase/`

| Archivo | Cuándo usarlo |
|---------|---------------|
| `bootstrap-operador.sql` | Promover el primer usuario a `operador` |
| `fix-coords.sql` | Corregir lat/lng de centros y zonas |
| `rename-delivery-to-voluntario.sql` | Migración de enum de rol (bases creadas antes del rename) |

Convención para **nuevas migraciones**: crea `supabase/migrate-<descripcion>.sql` con comentario al inicio que diga si es idempotente y qué entornos necesitan ejecutarlo.

### Modelo de datos (resumen)

```
auth.users
    └── perfiles (rol, centro_acopio_id)

centros_acopio ──< depositos ──< inventario
       │
       └──< cobertura_centro_zona >── zonas_refugio ──< necesidades
```

Enums importantes: `rol_usuario_enum`, `estado_zona_enum`, `estado_necesidad_enum`, `ciudad_enum`.

### Auth: flujo completo

```
1. Usuario se registra / login
      ↓
2. Supabase Auth crea fila en auth.users
      ↓
3. Trigger handle_new_user (policies.sql)
      → insert en public.perfiles con rol = 'voluntario'
      ↓
4. Operador asigna rol y centro desde /usuarios
      (o vía SQL en bootstrap-operador.sql la primera vez)
      ↓
5. Cada request HTTP:
      proxy.ts → updateSession() → refresca JWT en cookies
      ↓
6. Server Component / Action:
      createClient() (server) → auth.getUser() + queries con RLS
```

**No crear usuarios con SQL directo en `auth.users`.** Usar la app, el dashboard de Supabase (Authentication → Users) o la API de Auth.

**Trigger `proteger_rol_y_centro`:** solo un `operador` puede cambiar `rol` y `centro_acopio_id` de un perfil (excepto cuando `auth.uid()` es null, para scripts en SQL Editor).

### Clientes Supabase (tres contextos)

| Cliente | Archivo | Usar en |
|---------|---------|---------|
| Browser | `lib/supabase/client.ts` | Componentes `"use client"` que hablen con Supabase |
| Server | `lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| Middleware | `lib/supabase/middleware.ts` | Invocado desde `proxy.ts` — refresco de sesión |

Todos usan `@supabase/ssr` y leen credenciales de `NEXT_PUBLIC_SUPABASE_*` vía `lib/supabase/env.ts`.

Si faltan variables, el proxy no crashea: redirige a `/login`. Las páginas del panel requieren Supabase configurado para funcionar.

### Row Level Security (RLS)

Todas las tablas operativas tienen RLS habilitado en `policies.sql`.

Funciones helper usadas en policies:

- `mi_rol()`, `mi_centro_acopio_id()`, `mi_centro_cubre_zona()`
- `es_operador()`, `es_jefe_de_centro()`, `es_logistica_de_centro()`

Al agregar una tabla nueva:

1. Definirla en `schema.sql`
2. Habilitar RLS y escribir policies en `policies.sql`
3. Actualizar `types/database.types.ts`
4. Documentar la migración en un `.sql` aparte si la DB ya existe en prod

### Cambiar el schema (checklist para contributors)

- [ ] Editar `supabase/schema.sql` (proyectos nuevos)
- [ ] Crear `supabase/migrate-<nombre>.sql` (proyectos existentes)
- [ ] Actualizar `supabase/policies.sql` si hay RLS/triggers nuevos
- [ ] Actualizar `types/database.types.ts` y tipos en `types/index.ts` si aplica
- [ ] Actualizar `seed.sql` si hace falta data de prueba
- [ ] Probar en tu proyecto Supabase local antes del PR
- [ ] Indicar en el PR qué SQL ejecutar en producción

### Tipos TypeScript de la DB

`types/database.types.ts` está **escrito a mano** (no se genera con `supabase gen types` todavía). Si cambias columnas o enums en SQL, **actualiza ese archivo en el mismo PR**.

---

## Convenciones de código

### TypeScript / React

- App Router de Next.js 16. Lee `AGENTS.md` — esta versión de Next puede diferir de docs antiguas.
- Server Components por defecto; `"use client"` solo cuando hace falta (mapa Leaflet, formularios interactivos, hooks).
- Tipos del dominio en `types/`. Evita `any`.
- Componentes UI reutilizables en `components/shared/`; dominio en `components/<modulo>/`.

### Estilos

- Tailwind v4 + tokens en `app/globals.css`.
- Componentes base de shadcn en `components/ui/` — reutilizar antes de inventar widgets nuevos.
- **Mobile-first**: probar en viewport estrecho; tablas → tarjetas en móvil donde ya hay precedente (inventario).

### Nombres e idioma

- Código (variables, funciones, archivos): **inglés** o convención existente del archivo.
- Texto visible al usuario: **español**.
- Comentarios: solo cuando la lógica de negocio no es obvia.

### Mapa

- Leaflet + OpenStreetMap. No introducir Google Maps sin acuerdo del equipo.
- Coordenadas en `lat` / `lng` (WGS84). Preferir fuentes verificables (OSM/Nominatim) para datos semilla.

---

## Roles (referencia rápida)

| Rol | Valor en DB | Permisos principales |
|-----|-------------|----------------------|
| Operador | `operador` | Todo + gestión de usuarios |
| Jefe de centro | `jefe_centro` | Su centro: inventario, cobertura, necesidades |
| Logística | `logistica` | Inventario y estado de necesidades de su centro |
| Voluntario | `voluntario` | Lee necesidades; actualiza estado (en proceso / cubierta) |

Detalle completo de policies: `supabase/policies.sql` y tabla en el README.

---

## Qué NO está en el MVP (ideas de contribución)

- Notificaciones push / SMS
- Modo offline / sync diferida
- Export PDF / Excel
- Auditoría detallada por cambio
- CRUD de centros de acopio desde UI (hoy: SQL / seed)
- Tests automatizados (Jest/Playwright) — bienvenidos como primer contribución de infra

---

## Checklist antes de abrir PR

- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` sin warnings nuevos relevantes
- [ ] Probado en móvil (o DevTools responsive) si tocaste UI
- [ ] Si hay cambio de permisos: RLS + UI actualizados
- [ ] Si hay SQL: migración documentada y probada en Supabase local
- [ ] Si hay cambio de schema: `types/database.types.ts` actualizado
- [ ] PR describe pasos para quien despliegue (variables, SQL a ejecutar)

---

## Entornos y deploy

| Entorno | App | Base de datos |
|---------|-----|---------------|
| Local | `npm run dev` | Tu proyecto Supabase (dev) |
| Producción | Vercel (`acopioslecheria.vercel.app`) | Proyecto Supabase compartido del equipo |

Variables obligatorias en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

En Supabase → Authentication → URL Configuration, incluir dominios de Vercel en **Site URL** y **Redirect URLs**.

Detalle de deploy: [README § Deploy](./README.md#6-deploy-en-vercel).

---

## Dudas y contacto

- Abre un issue en el repo con etiqueta clara (`bug`, `feature`, `supabase`, `docs`).
- Para cambios de schema o permisos en producción, coordina con quien tenga acceso al proyecto Supabase del equipo antes de mergear.

¡Gracias por contribuir!
