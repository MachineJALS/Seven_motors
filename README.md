# Sitio web — Agencia de autos (Seven Motor)

Sitio con Home, catálogo de vehículos con filtros y buscador, ficha por auto,
sección de financiamiento, "Sobre nosotros", contacto directo por WhatsApp
(con registro de leads), y selector de idioma Español/Inglés. React + Vite +
TypeScript. Costo de infraestructura: $0.

**Contenido pendiente de tu parte**: la página "Sobre nosotros" tiene texto
genérico honesto (no inventamos años de fundación, historia ni testimonios
falsos) — ver [`src/modules/marketing/README.md`](src/modules/marketing/README.md)
para la lista de qué falta (historia real, fotos del equipo, testimonios,
mapa embebido de verdad).

**Fuera de alcance por ahora, a propósito**: pasarelas de pago, financiamiento
y scoring crediticio. La arquitectura está preparada para agregarlos más
adelante sin una reescritura — ver [`docs/architecture.md`](docs/architecture.md).

## Cómo correrlo en tu computadora

Necesitás tener [Node.js](https://nodejs.org) instalado (versión 18 o más reciente)
y un proyecto de [Supabase](https://supabase.com) (el inventario ya no vive
en el código, vive en una base de datos real — ver "Inventario y panel de
administración" más abajo).

```bash
cp .env.example .env.local   # solo la primera vez: completá con tus datos de Supabase
npm install                  # instala las dependencias (solo la primera vez)
npm run dev                  # levanta el sitio en http://localhost:5173
```

Cada vez que guardés un archivo, el navegador se actualiza solo.

## Inventario y panel de administración

Desde la reestructuración de Fase 2, los autos ya no se editan tocando
código:

1. Corré una vez, en orden, cada archivo de `supabase/migrations/` en el
   **SQL Editor** de tu proyecto de Supabase: `0001_create_vehicles.sql`
   (tabla de autos + RLS + carga los 4 autos existentes) y
   `0002_create_leads.sql` (tabla de consultas de WhatsApp + RLS).
2. Creá tu cuenta de administrador en **Authentication → Users** del
   dashboard de Supabase (con el email/contraseña que vas a usar para
   entrar).
3. Entrá a `/admin` en el sitio, iniciá sesión, y desde ahí agregás, editás,
   marcás como vendido, o eliminás autos — se reflejan en el catálogo
   público al instante, sin tocar código ni hacer `git push`. Desde
   `/admin/leads` ves cada clic en "Escribir por WhatsApp" (general o por
   auto), con fecha y mensaje.

Las fotos siguen siendo un link a una imagen (no se suben archivos desde el
panel todavía). Los precios se cargan en **colones (₡)**, no dólares.

## Lo primero que tenés que editar

1. **`src/shared/config/agency.ts`** — nombre real de la agencia, ciudad y
   **número de WhatsApp** (formato: código de país + número, sin "+" ni
   espacios, ej. `50688887777`).
2. **`.env.local`** — tu `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   (Project Settings → API en tu proyecto de Supabase). Nunca compartas ni
   subas a git la clave `service_role` — este sitio no la necesita.
3. **`src/shared/i18n/locales/{es,en}/common.json`** — si cambiás textos
   fijos del sitio (botones, títulos), actualizalos en **ambos** idiomas.
4. **`index.html`** — título y descripción ya apuntan a Seven Motor; ajustalos
   si cambia el nombre del negocio.

## Cómo publicarlo gratis (Cloudflare Pages)

1. Subí este proyecto a un repositorio de GitHub (podés usar
   [GitHub Desktop](https://desktop.github.com/) si preferís no usar la terminal para esto).
2. Entrá a [pages.cloudflare.com](https://pages.cloudflare.com), creá una cuenta gratis,
   y conectá tu repositorio.
3. Cuando te pregunte por la configuración del build, usá:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Cloudflare te da un dominio gratis del tipo `tuagencia.pages.dev`, y despliega
   automáticamente cada vez que hacés `git push`.

**Sobre las variables de entorno**: si tu proyecto quedó creado en Cloudflare
como un "Worker" de solo archivos estáticos (no clásico "Pages"), el panel
de **Settings → Variables** puede bloquearse con el error *"Variables
cannot be added to a Worker that only has static assets"* — es una
limitación de Cloudflare, no algo que rompiste. Por eso este repo ya trae
committeado un archivo **`.env.production`** con `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` — Vite los toma automáticamente al hacer
`npm run build`, sin depender del panel de Cloudflare. Es seguro tenerlos
en el repo porque la `anon key` está pensada para ser pública (la
protección real la da Row Level Security en Supabase, no que la clave sea
secreta). Si alguna vez cambiás de proyecto de Supabase, actualizá ese
archivo con los valores nuevos.

## Arquitectura y flujo de trabajo con Claude Code

Este repo usa una estructura por dominios (`src/modules/inventory`,
`src/modules/leads`, `src/modules/admin` implementados; `quotes` sigue como
scaffold), más tres artefactos de Claude Code documentados a fondo en
[`docs/architecture.md`](docs/architecture.md):

- **Skills** (`.claude/skills/`) — procedimientos reutilizables para tareas
  específicas (VIN, filtrado de inventario, cotizaciones básicas).
- **Agents** (`.claude/agents/`) — subagentes especializados por dominio,
  usados durante el desarrollo (no son bots en producción).
- **Specs** (`.claude/specs/`, plantilla en `.claude/templates/`) — el flujo
  de Spec Driven Development: spec → diseño → tareas → código → validación.

Guía completa de arquitectura: [`docs/architecture.md`](docs/architecture.md).
Auditoría del estado previo a esta reestructuración: [`docs/audit-report.md`](docs/audit-report.md).
Plan de migración (hecho y futuro): [`docs/migration-plan.md`](docs/migration-plan.md).
Instrucciones para Claude Code: [`CLAUDE.md`](CLAUDE.md).

## Qué sigue (Fase 2 del plan)

- ~~Conectar Supabase y un panel `/admin` para editar inventario sin tocar código~~ — hecho.
- ~~Guardar los clics de WhatsApp como leads~~ — hecho, ver `/admin/leads`.
- Roles `admin` / `vendedor` separados con Row Level Security (hoy hay un solo rol admin, a propósito — ver la spec de `admin-vehicle-management`).
- Subida de fotos a Supabase Storage en vez de pegar un link.
- Evaluar agregar `vite-react-ssg` para mejorar las vistas previas al compartir
  fichas de autos por WhatsApp/Facebook (ver la sección de SEO del plan).

Detalle paso a paso de cada punto: [`docs/migration-plan.md`](docs/migration-plan.md).

## Estructura del proyecto

```
src/
  app/                        entrada (main.tsx) y rutas (App.tsx)
  modules/
    inventory/                 catálogo — domain / application / infrastructure / presentation
    leads/                      flujo de contacto por WhatsApp + registro de leads
    admin/                      panel /admin — auth, CRUD de vehículos, ver leads
    marketing/                  Home, Financiamiento, Sobre Nosotros (páginas de contenido)
    quotes/                     scaffold (Fase 2, aún sin construir)
  shared/
    config/                     datos de la agencia (agency.ts)
    i18n/                       textos ES/EN y selector de idioma
    infrastructure/             cliente de Supabase compartido
    ui/                         Header, Footer, página 404
    styles/                     todos los estilos (index.css)
.claude/
  skills/                       procedimientos reutilizables para Claude Code
  agents/                       subagentes especializados por dominio
  specs/                        specs de features (formato Spec Driven Development)
  templates/                    plantilla de spec
supabase/
  migrations/                   SQL para correr en el editor de Supabase
docs/
  architecture.md               arquitectura objetivo y guía de uso
  audit-report.md                auditoría del estado previo
  migration-plan.md              plan de migración (hecho y futuro)
  git-workflow.md                 flujo de ramas (Git Flow, aún no en uso)
```
