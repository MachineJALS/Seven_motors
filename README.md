# Sitio web — Agencia de autos (Seven Motor)

Catálogo de vehículos con filtros, ficha por auto, contacto directo por WhatsApp,
y selector de idioma Español/Inglés. React + Vite + TypeScript. Costo de
infraestructura: $0.

**Fuera de alcance por ahora, a propósito**: pasarelas de pago, financiamiento
y scoring crediticio. La arquitectura está preparada para agregarlos más
adelante sin una reescritura — ver [`docs/architecture.md`](docs/architecture.md).

## Cómo correrlo en tu computadora

Necesitás tener [Node.js](https://nodejs.org) instalado (versión 18 o más reciente).

```bash
npm install     # instala las dependencias (solo la primera vez)
npm run dev     # levanta el sitio en http://localhost:5173
```

Cada vez que guardés un archivo, el navegador se actualiza solo.

## Lo primero que tenés que editar

1. **`src/shared/config/agency.ts`** — nombre real de la agencia, ciudad y
   **número de WhatsApp** (formato: código de país + número, sin "+" ni
   espacios, ej. `50688887777`).
2. **`src/modules/inventory/infrastructure/static-vehicle-repository.ts`** —
   reemplazá el inventario de ejemplo por el real. Cada auto es un objeto
   con marca, modelo, año, precio, fotos, etc. Para las fotos, por ahora
   podés usar links a imágenes que ya tengas subidas a algún lado (o
   subirlas a Supabase Storage cuando lleguemos a la Fase 2).
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

## Arquitectura y flujo de trabajo con Claude Code

Este repo usa una estructura por dominios (`src/modules/inventory`,
`src/modules/leads`, y los scaffolds `quotes`/`admin`), más tres artefactos de
Claude Code documentados a fondo en [`docs/architecture.md`](docs/architecture.md):

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

- Conectar Supabase (base de datos + autenticación) para poder editar el
  inventario desde un panel `/admin` en vez de tocar código.
- Roles `admin` / `vendedor` con Row Level Security.
- Guardar los mensajes de WhatsApp/formulario de contacto como leads.
- Evaluar agregar `vite-react-ssg` para mejorar las vistas previas al compartir
  fichas de autos por WhatsApp/Facebook (ver la sección de SEO del plan).

Detalle paso a paso de cada punto: [`docs/migration-plan.md`](docs/migration-plan.md).

## Estructura del proyecto

```
src/
  app/                        entrada (main.tsx) y rutas (App.tsx)
  modules/
    inventory/                 catálogo — domain / application / infrastructure / presentation
    leads/                      flujo de contacto por WhatsApp
    quotes/                     scaffold (Fase 2)
    admin/                      scaffold (Fase 2)
  shared/
    config/                     datos de la agencia (agency.ts)
    i18n/                       textos ES/EN y selector de idioma
    ui/                         Header, Footer, página 404
    styles/                     todos los estilos (index.css)
.claude/
  skills/                       procedimientos reutilizables para Claude Code
  agents/                       subagentes especializados por dominio
  specs/                        specs de features (formato Spec Driven Development)
  templates/                    plantilla de spec
docs/
  architecture.md               arquitectura objetivo y guía de uso
  audit-report.md                auditoría del estado previo
  migration-plan.md              plan de migración (hecho y futuro)
```
