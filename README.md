# Sitio web — Agencia de autos (Fase 1)

Catálogo de vehículos con filtros, ficha por auto y contacto directo por WhatsApp.
React + Vite + TypeScript. Costo de infraestructura: $0.

## Cómo correrlo en tu computadora

Necesitás tener [Node.js](https://nodejs.org) instalado (versión 18 o más reciente).

```bash
npm install     # instala las dependencias (solo la primera vez)
npm run dev     # levanta el sitio en http://localhost:5173
```

Cada vez que guardés un archivo, el navegador se actualiza solo.

## Lo primero que tenés que editar

1. **`src/config.ts`** — poné el nombre real de la agencia, la ciudad y sobre todo
   tu **número de WhatsApp** (formato: código de país + número, sin "+" ni espacios,
   ej. `50688887777`).
2. **`src/data/vehiculos.ts`** — reemplazá los 8 autos de ejemplo por tu inventario real.
   Cada auto es un objeto con marca, modelo, año, precio, fotos, etc. Para las fotos,
   por ahora podés usar links a imágenes que ya tengas subidas a algún lado (o subirlas
   a Supabase Storage cuando lleguemos a la Fase 2).
3. **`index.html`** — cambiá el `<title>` y la descripción por los datos reales de tu negocio.

No hace falta tocar ningún otro archivo para tener el sitio andando con tu información.

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

## Qué sigue (Fase 2 del plan)

- Conectar Supabase (base de datos + autenticación) para poder editar el inventario
  desde un panel `/admin` en vez de tocar código.
- Roles `admin` / `vendedor` con Row Level Security.
- Guardar los mensajes del formulario de contacto como leads.
- Evaluar agregar `vite-react-ssg` para mejorar las vistas previas al compartir
  fichas de autos por WhatsApp/Facebook (ver la sección de SEO del plan).

## Estructura del proyecto

```
src/
  config.ts                 ← tus datos y el número de WhatsApp
  types.ts                  ← forma de un "Vehiculo"
  data/vehiculos.ts         ← el inventario (Fase 1: a mano; Fase 2: desde Supabase)
  components/
    Header.tsx               Footer.tsx
    VehiculoCard.tsx          ← tarjeta del catálogo
    FiltroBar.tsx             ← filtros de marca/precio/año/combustible
    PriceTag.tsx              ← el "rótulo de precio"
    WhatsAppButton.tsx        ← botón de contacto
  pages/
    CatalogoPage.tsx          ← página principal
    VehiculoDetallePage.tsx   ← ficha de un auto
    NoEncontradaPage.tsx      ← 404
  App.tsx                    ← rutas (React Router)
  main.tsx                   ← punto de entrada
  index.css                  ← todos los estilos
```
