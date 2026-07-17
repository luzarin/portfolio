# Spec: Migración del portafolio a React + TypeScript

**Fecha:** 2026-07-16
**Estado:** Aprobado por Lucas
**Repo:** github.com/luzarin/portfolio · Deploy: GitHub Pages (`luzarin.github.io/portfolio`)

## 1. Contexto y objetivo

El portafolio actual son 7 páginas HTML estáticas (index + 6 proyectos GIS) con Bootstrap 5 por CDN, ~1.370 líneas de CSS propio, dos archivos JS vanilla con lógica duplicada, y mapas Leaflet que cargan GeoJSON/GeoTIFF por `fetch` más iframes de PyDeck.

Problemas: navbar/footer/menú duplicados en las 7 páginas, datos de proyectos hardcodeados en HTML, ~96 estilos inline, dependencias por CDN, ESLint 8 (EOL), carpetas con espacios (`proyecto 1/` → `%20` en URLs), assets sin optimizar (~22 MB imágenes, ~31 MB datos geo).

**Objetivo:** migrar a una SPA React moderna, con rediseño visual moderado, manteniendo toda la funcionalidad de mapas. Después de la migración se actualizarán los proyectos uno a uno (fase separada).

## 2. Decisiones tomadas

| Decisión | Elección |
|---|---|
| Framework | React 19 |
| Lenguaje | TypeScript 5 |
| Build | Vite 6 |
| Routing | React Router 7 (BrowserRouter) |
| Estilos | Sin Bootstrap. CSS Modules + design tokens (custom properties) |
| Rediseño | Moderado, con skill frontend-design; sin cambios radicales; misma estructura de secciones |
| Fuentes | Self-hosted vía @fontsource (Poppins, Noto Sans) |
| Mapas | react-leaflet + componente custom GeoRaster; deps npm (leaflet, georaster, georaster-layer-for-leaflet, geoblaze) |
| PyDeck | Los 2 HTML generados quedan como iframes en `public/embeds/` |
| Deploy | GitHub Pages con GitHub Action (build + deploy-pages), `base: '/portfolio/'`, copia `index.html` → `404.html` |
| Lint | ESLint 9 flat config + typescript-eslint + eslint-plugin-react-hooks + Prettier; Stylelint 16 para CSS |
| Testing | Vitest + React Testing Library |

## 3. Estructura del proyecto

```
├── index.html                  (entry de Vite)
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── .github/workflows/deploy.yml
├── public/
│   ├── imagenes/               (PNG/JPEG > 300 KB → WebP q80; se conserva original si el ahorro es < 20%)
│   ├── datos/proyecto-1/ … proyecto-5/   (geojson/tif, carpetas sin espacios)
│   ├── embeds/                 (hexagonos_uf_3d.html, hypsometric_curve_interactive.html)
│   └── docs/Lucas-Blachet-DelSolar-CV.pdf
└── src/
    ├── main.tsx
    ├── App.tsx                 (router + layout compartido)
    ├── components/
    │   ├── layout/             Navbar, MobileMenu, Footer
    │   ├── home/               About, SkillBars, EducationTimeline, ExperienceCard, ProjectsGrid, ProjectCard
    │   ├── maps/               LeafletMap, GeoRasterLayer, OpacityControl, MapLegend
    │   └── common/             EmbedFrame, ImageGallery, TextBlock, ErrorBoundary
    ├── pages/                  HomePage, Proyecto1 … Proyecto6 (lazy)
    ├── data/                   projects.ts, skills.ts, education.ts, experience.ts
    ├── styles/                 tokens.css, global.css
    └── types/                  project.ts
```

Los HTML/CSS/JS legacy y las carpetas `proyectos/`, `imagenes/` de la raíz se eliminan al final de la migración (su contenido migra a `public/` y `src/`).

## 4. Modelo de datos (híbrido)

- `src/data/projects.ts`: array tipado con la metadata común de los 6 proyectos — `slug`, `title`, `summary`, `cardImage`, `page` (referencia lazy al componente). La grid del home se genera de aquí. Agregar un proyecto = 1 entrada + 1 página.
- El **contenido** de cada proyecto es un componente propio (`pages/Proyecto1.tsx`…) que compone bloques reutilizables (`LeafletMap`, `ImageGallery`, `EmbedFrame`, `TextBlock`). Razón: los 6 proyectos son heterogéneos (mapas raster, vectoriales, galerías, iframes, textos largos) y se van a rediseñar individualmente en la fase siguiente; forzarlos a un esquema 100% data-driven sería sobre-ingeniería.
- Skills, educación y experiencia también salen de `src/data/` para eliminar hardcodeo del JSX.

## 5. Mapas y datos geo

- `LeafletMap`: wrapper sobre react-leaflet (contenedor, tiles base Esri/OSM, escala).
- `GeoRasterLayer`: componente custom que integra georaster-layer-for-leaflet con react-leaflet (patrón `useMap` + effect); soporta `pixelValuesToColorFn`, opacidad y click-to-identify con geoblaze — paridad con el comportamiento actual.
- Cada página de proyecto es ruta lazy: TIF/GeoJSON se descargan solo al navegar a ella (comportamiento igual a hoy, pero con code splitting del JS).
- Spinner de carga mientras se parsea el raster; `ErrorBoundary` por página: si un asset falla, la página muestra error localizado sin romper la app.
- Los TIF se sirven tal cual desde `public/datos/` (georaster los parsea en el browser, igual que hoy). Optimizar a COG/tiles queda fuera de alcance.

## 6. Estilos y rediseño moderado

- `styles/tokens.css`: custom properties para paleta, tipografía, espaciado, radios, sombras — derivadas del look actual (navbar oscura, cards dark, acentos claros).
- CSS Modules por componente; `global.css` solo para reset, tipografía base y utilidades mínimas.
- Los ~96 estilos inline y los `<style>` embebidos desaparecen: todo pasa a módulos.
- Rediseño con skill frontend-design al implementar: mejor jerarquía tipográfica, hero/about más limpio, cards con hover sutil, espaciado consistente. **Restricción:** misma estructura de secciones (Sobre mí → Educación/Habilidades → Experiencia → Proyectos), misma identidad; nada exagerado.

## 7. Routing y deploy

- Rutas: `/` (home) y `/proyectos/:slug`. Slugs definidos: `aconcagua-ndvi-twi`, `precios-inmobiliarios-3d`, `dtm-lidar`, `lulc-colchagua`, `lst-uhi-rm`, `catastro-minero` (proyectos 1–6 respectivamente).
- `vite.config.ts` con `base: '/portfolio/'`.
- SPA fallback en Pages: el build copia `dist/index.html` a `dist/404.html`.
- `.github/workflows/deploy.yml`: en push a `main` → install, lint, typecheck, test, build, deploy con `actions/deploy-pages`. (Requiere cambiar la config de Pages del repo a "GitHub Actions" — paso manual de Lucas al mergear.)
- Los enlaces externos (CV PDF, LinkedIn, GitHub) se mantienen.

## 8. Testing y verificación

- Vitest + React Testing Library + jsdom:
  - `ProjectsGrid` renderiza las 6 cards desde `projects.ts`.
  - Las rutas resuelven al componente correcto (home y al menos una de proyecto).
  - `Navbar`/`MobileMenu`: toggle y cierre.
  - Componentes de mapa montan con Leaflet mockeado (no se testea render real de tiles/raster).
- Gate de calidad: `npm run lint && npm run typecheck && npm run test && npm run build`.
- Verificación manual en navegador (dev server): comparar cada página contra el sitio actual en vivo — los 6 proyectos con sus mapas, popups de identify, sliders de opacidad, iframes, menú móvil y modal de foto.

## 9. Fuera de alcance

- Conversión de TIFs a COG o tiles (mejora de performance futura).
- Rehacer visualizaciones PyDeck en deck.gl nativo.
- Dark mode toggle, i18n, blog, CMS, analytics.
- Rediseño profundo por proyecto (fase siguiente: "actualizar proyectos según requerimientos").

## 10. Riesgos y mitigaciones

- **Compatibilidad react-leaflet 5 / React 19:** react-leaflet v5 requiere React 19 — verificar versiones exactas al iniciar; si hubiera fricción, fallback a Leaflet vanilla en hooks propios (API idéntica a la actual).
- **georaster en bundle:** estas libs asumen globals en algunos builds; si el import ESM falla, se cargan como side-effect imports o desde `public/` como último recurso (documentar en el plan).
- **Peso de assets:** la migración no los agranda (mismos archivos); la optimización de imágenes es best-effort sin cambiar contenido visual.
- **URLs viejas** (`/proyectos/proyecto1.html`) dejarán de existir; aceptado (portafolio personal, sin SEO crítico).
