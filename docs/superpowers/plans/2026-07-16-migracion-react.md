# Plan de implementación: Migración del portafolio a React + TypeScript

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar el portafolio estático (7 HTML + Bootstrap CDN + JS vanilla) a una SPA Vite + React 19 + TypeScript con rediseño moderado, manteniendo paridad funcional de los mapas Leaflet/GeoRaster.

**Architecture:** SPA con React Router 7 (declarative mode, `BrowserRouter` con basename `/portfolio/`). Metadata de proyectos tipada en `src/data/`; el contenido de cada proyecto es un componente propio que compone bloques reutilizables (mapas, galerías, iframes). Los datos geo se sirven desde `public/datos/` y se cargan lazy por ruta.

**Tech Stack:** Vite (mayor estable, ≥6) · React 19 · TypeScript 5 · react-router 7 · react-leaflet 5 · leaflet 1.9 · georaster + georaster-layer-for-leaflet + geoblaze · @fontsource (Poppins, Noto Sans) · CSS Modules + custom properties · Vitest + React Testing Library · ESLint 9 flat + Prettier + Stylelint 16 · GitHub Actions → GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-07-16-migracion-react-design.md`

## Global Constraints

- React 19 y react-leaflet ^5 (v5 exige React 19). react-router ^7 se importa desde `react-router` (NO `react-router-dom`).
- `base: '/portfolio/'` en Vite. TODO asset de `public/` se referencia vía helper `asset()` (`src/lib/asset.ts`), nunca con ruta absoluta hardcodeada.
- Sin Bootstrap. Sin dependencias por CDN en runtime. Fuentes self-hosted con `@fontsource/*`.
- Estilos: CSS Modules por componente + `src/styles/tokens.css` (custom properties). Prohibido `style=` inline salvo custom properties dinámicas (ej. `style={{ '--level': 0.95 }}`).
- Contenido textual (bio, descripciones, títulos de proyectos): copiar EXACTO desde los HTML legacy (son la fuente de verdad). No inventar ni "mejorar" textos.
- Rediseño moderado: en cada tarea de UI, usar la skill `frontend-design`. Misma estructura de secciones e identidad visual (navbar oscura, acentos actuales); nada radical.
- Slugs fijos (spec §7): `aconcagua-ndvi-twi`, `precios-inmobiliarios-3d`, `dtm-lidar`, `lulc-colchagua`, `lst-uhi-rm`, `catastro-minero` (proyectos 1–6).
- Commits: formato del usuario (skill `commit`): UNA línea `tipo(alcance): descripcion`, español sin tildes, verbo presente 3ª persona, SIN `Co-Authored-By`.
- Gate por tarea: `npm run lint && npm run typecheck && npm run test -- --run && npm run build` en verde antes de commitear (desde que existen los scripts, Tarea 1).
- Los archivos legacy (`index.html` viejo se pisa en Tarea 1; `main.js`, `style.css`, `pag_proyecto.*`, `proyectos/`, `imagenes/`) NO se borran hasta la Tarea 13 — son referencia de contenido.
- Node 22 LTS local y en CI.

---

### Task 1: Scaffold Vite + React + TS + Vitest + tooling

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.prettierrc.json`, `.gitignore`, `index.html` (pisa el legacy), `src/main.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/test/setup.ts`, `src/vite-env.d.ts`, `src/lib/asset.ts`
- Delete: `.eslintrc.json`, `.htmlhintrc`, `.stylelintrc.json` (los reemplaza el tooling nuevo; stylelint moderno vuelve en Tarea 2), `package-lock.json` legacy (se regenera)
- Keep: `main.js`, `style.css`, `pag_proyecto.css`, `pag_proyecto.js`, `proyectos/`, `imagenes/`, `.gitattributes`

**Interfaces:**
- Produces: `asset(path: string): string` — antepone `import.meta.env.BASE_URL` a rutas de `public/` (lo usan TODAS las tareas siguientes). Scripts npm: `dev`, `build`, `preview`, `test`, `lint`, `typecheck`, `format`. `App.tsx` default export.

- [ ] **Step 1: Generar template en scratchpad y copiar la base**

```bash
cd "$SCRATCHPAD" && npm create vite@latest scaffold-tmp -- --template react-ts
```

Copiar al repo (raíz del worktree): `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`, `.gitignore`. NO copiar `src/App.tsx`/`App.css`/`index.css`/`assets` del template. Borrar `.eslintrc.json`, `.htmlhintrc`, `.stylelintrc.json` y `package-lock.json` legacy del repo.

- [ ] **Step 2: Ajustar `package.json`** — `"name": "portfolio"`, `"private": true`, y scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint .",
  "typecheck": "tsc -b --noEmit",
  "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
}
```

- [ ] **Step 3: Instalar dependencias**

```bash
npm install react-router leaflet react-leaflet georaster georaster-layer-for-leaflet geoblaze @fontsource/poppins @fontsource/noto-sans
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/leaflet prettier
```

(react, react-dom, typescript, eslint 9 + typescript-eslint + plugins ya vienen del template.)

- [ ] **Step 4: Configurar Vite + Vitest** — `vite.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

En `tsconfig.app.json`, agregar `"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]` dentro de `compilerOptions`. En `.prettierrc.json`: `{ "semi": false, "singleQuote": true, "printWidth": 100 }`.

- [ ] **Step 5: App mínima + helper `asset`**

`src/lib/asset.ts`:

```ts
export const asset = (path: string): string => import.meta.env.BASE_URL + path.replace(/^\//, '')
```

`src/App.tsx`:

```tsx
export default function App() {
  return <h1>Portafolio — migración en curso</h1>
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`index.html` (raíz): title `Lucas Blachet — Portafolio GIS`, `lang="es"`, `<div id="root"></div>` y `<script type="module" src="/src/main.tsx"></script>` (así lo genera el template; verificar title/lang).

- [ ] **Step 6: Test de humo (escribirlo, verlo fallar, verlo pasar)**

`src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renderiza el titulo', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /portafolio/i })).toBeInTheDocument()
})
```

Run: `npm run test -- --run` → PASS (1 test). Luego `npm run lint && npm run typecheck && npm run build` → verde. `npm run dev` y abrir en browser: se ve el h1.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore(repo): configura vite react y typescript"
```

---

### Task 2: Design tokens, estilos globales y fuentes

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `.stylelintrc.json`
- Modify: `src/main.tsx` (imports de fuentes y CSS), `package.json` (script lint:css)

**Interfaces:**
- Produces: custom properties usadas por TODOS los CSS Modules siguientes: `--color-bg`, `--color-surface`, `--color-surface-dark`, `--color-text`, `--color-text-inverse`, `--color-accent`, `--color-border`, `--font-heading` (Poppins), `--font-body` (Noto Sans), `--space-1..6` (4/8/16/24/40/64px), `--radius-sm/md/lg` (4/8/16px), `--shadow-card`, `--nav-height` (64px), `--container-max` (1200px).

- [ ] **Step 1: Escribir `tokens.css`** — usar la skill `frontend-design` para calibrar la paleta partiendo del look actual (`style.css` legacy: navbar #111, cards dark `bg-dark`, fondo claro). Contenido base:

```css
:root {
  --color-bg: #f6f7f9;
  --color-surface: #ffffff;
  --color-surface-dark: #16181d;
  --color-text: #1c1e21;
  --color-text-inverse: #f5f6f7;
  --color-accent: #2f6fed;
  --color-border: #d8dce2;
  --font-heading: 'Poppins', system-ui, sans-serif;
  --font-body: 'Noto Sans', system-ui, sans-serif;
  --space-1: 4px; --space-2: 8px; --space-3: 16px;
  --space-4: 24px; --space-5: 40px; --space-6: 64px;
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 16px;
  --shadow-card: 0 4px 16px rgb(0 0 0 / 0.08);
  --nav-height: 64px;
  --container-max: 1200px;
}
```

(frontend-design puede ajustar valores, pero los NOMBRES de las variables son contrato fijo.)

- [ ] **Step 2: Escribir `global.css`** — reset mínimo (box-sizing, margin 0), `body { font-family: var(--font-body); background: var(--color-bg); color: var(--color-text); }`, headings con `--font-heading`, `img { max-width: 100%; display: block; }`, `.container { max-width: var(--container-max); margin-inline: auto; padding-inline: var(--space-3); }`, `:focus-visible` visible.

- [ ] **Step 3: Importar en `main.tsx`** (antes de `App`):

```tsx
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/noto-sans/400.css'
import '@fontsource/noto-sans/600.css'
import './styles/tokens.css'
import './styles/global.css'
```

- [ ] **Step 4: Stylelint moderno**

```bash
npm install -D stylelint stylelint-config-standard
```

`.stylelintrc.json`: `{ "extends": "stylelint-config-standard", "rules": { "selector-class-pattern": null } }`. Agregar script `"lint:css": "stylelint \"src/**/*.css\""` y correrlo → verde.

- [ ] **Step 5: Verificar y commitear** — `npm run dev`: el h1 se ve con Poppins sobre fondo claro. Gate verde.

```bash
git add -A && git commit -m "feat(ui): agrega tokens de diseno y estilos base"
```

---

### Task 3: Capa de datos tipada

**Files:**
- Create: `src/types/project.ts`, `src/data/projects.ts`, `src/data/skills.ts`, `src/data/education.ts`, `src/data/experience.ts`, `src/data/projects.test.ts`

**Interfaces:**
- Produces:
  - `interface ProjectMeta { slug: string; title: string; summary: string; cardImage?: string }` (`cardImage` relativo a public, ej. `'imagenes/proyecto1.jpg'`; opcional porque proyecto 5 no tiene imagen — ver spec §10).
  - `const projects: ProjectMeta[]` (orden 1→6) y `getProject(slug: string): ProjectMeta | undefined`.
  - `interface Skill { name: string; level: number }` y `const skills: Skill[]`.
  - `interface EducationItem { school: string; degree: string; field: string; period: string; place: string; url: string; logo: string }` y `const education: EducationItem[]`.
  - `interface Experience { company: string; role: string; period: string; place: string; tools: string; logo: string; url: string; bullets: string[] }` y `const experience: Experience[]`.

- [ ] **Step 1: Test primero** — `src/data/projects.test.ts`:

```ts
import { projects, getProject } from './projects'

test('hay 6 proyectos con slugs unicos', () => {
  expect(projects).toHaveLength(6)
  expect(new Set(projects.map((p) => p.slug)).size).toBe(6)
})

test('getProject resuelve y rechaza slugs', () => {
  expect(getProject('dtm-lidar')?.title).toMatch(/DTM/i)
  expect(getProject('no-existe')).toBeUndefined()
})
```

Run: `npm run test -- --run` → FAIL (módulo no existe).

- [ ] **Step 2: Implementar datos** — copiar título y summary EXACTOS de las 6 cards de `index.html` legacy (líneas 170–260). Slugs y cardImage:

| # | slug | cardImage |
|---|---|---|
| 1 | `aconcagua-ndvi-twi` | `imagenes/proyecto1.jpg` |
| 2 | `precios-inmobiliarios-3d` | `imagenes/proyecto2.png` |
| 3 | `dtm-lidar` | `imagenes/proyecto3-4.png` |
| 4 | `lulc-colchagua` | `imagenes/proyecto4.png` |
| 5 | `lst-uhi-rm` | *(omitir — el PNG no existe en el repo)* |
| 6 | `catastro-minero` | `imagenes/proyecto6.jpg` |

`skills.ts`: los 7 skills con sus `--level` de `index.html:98-127` (0.95, 0.65, 0.85, 0.65, 0.75, 0.75, 0.95). `education.ts`: 2 items de `index.html:66-89`. `experience.ts`: IGM de `index.html:138-163` (2 bullets).

- [ ] **Step 3: Verificar y commitear** — tests PASS, gate verde.

```bash
git add src/types src/data && git commit -m "feat(data): agrega capa de datos tipada"
```

---

### Task 4: Router, layout (Navbar/Footer) y registro de páginas

**Files:**
- Create: `src/components/layout/Navbar.tsx` + `Navbar.module.css`, `src/components/layout/Footer.tsx` + `Footer.module.css`, `src/components/layout/ScrollToTop.tsx`, `src/components/common/Spinner.tsx` + `Spinner.module.css`, `src/pages/registry.ts`, `src/pages/HomePage.tsx`, `src/components/layout/Navbar.test.tsx`, `src/App.test.tsx` (reemplaza)
- Modify: `src/App.tsx`, `src/main.tsx`

**Interfaces:**
- Consumes: `asset()` (T1), tokens (T2).
- Produces: `projectPages: Record<string, LazyExoticComponent<ComponentType>>` en `registry.ts` (vacío por ahora; cada tarea de página agrega su entrada). `App` renderiza `<Navbar/> <main><Routes/></main> <Footer/>`. `HomePage` default export (secciones se agregan en T5/T6).

- [ ] **Step 1: Tests primero** — reemplazar `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

vi.mock('./pages/registry', () => ({
  projectPages: { demo: () => <h1>Pagina Demo</h1> },
}))

test('home renderiza layout', () => {
  render(<MemoryRouter><App /></MemoryRouter>)
  expect(screen.getByRole('navigation')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})

test('ruta de proyecto resuelve por slug', async () => {
  render(<MemoryRouter initialEntries={['/proyectos/demo']}><App /></MemoryRouter>)
  expect(await screen.findByRole('heading', { name: /pagina demo/i })).toBeInTheDocument()
})

test('slug desconocido redirige al home', async () => {
  render(<MemoryRouter initialEntries={['/proyectos/nada']}><App /></MemoryRouter>)
  expect(await screen.findByRole('navigation')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /pagina demo/i })).not.toBeInTheDocument()
})
```

Run → FAIL.

- [ ] **Step 2: Implementar registry, App y páginas base**

`src/pages/registry.ts`:

```ts
import type { ComponentType, LazyExoticComponent } from 'react'

// Cada tarea de página agrega aquí su entrada lazy(() => import('./ProyectoN'))
export const projectPages: Record<string, LazyExoticComponent<ComponentType>> = {}
```

`src/pages/HomePage.tsx` (placeholder que T5/T6 rellenan):

```tsx
export default function HomePage() {
  return <div className="container"><h1>Lucas Blachet Del Solar</h1></div>
}
```

`src/App.tsx`:

```tsx
import { Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { Spinner } from './components/common/Spinner'
import { projectPages } from './pages/registry'
import HomePage from './pages/HomePage'

function ProjectRoute() {
  const { slug } = useParams()
  const Page = slug ? projectPages[slug] : undefined
  if (!Page) return <Navigate to="/" replace />
  return <Page />
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/proyectos/:slug" element={<ProjectRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
```

`src/main.tsx`: envolver `<App/>` con `<BrowserRouter basename={import.meta.env.BASE_URL}>` (import desde `react-router`).

`ScrollToTop.tsx`:

```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router'

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}
```

- [ ] **Step 3: Navbar con menú móvil** (usar frontend-design; estructura legacy: logo "Inicio" → `Link to="/"`, links CV / LinkedIn / GitHub). Comportamiento a portar de `main.js` legacy: clase `affix` (fondo sólido) cuando `scrollY > 50`; menú hamburguesa < 768px que abre/cierra con el botón, se cierra al clickear fuera, un link, o al pasar a desktop.

```tsx
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { asset } from '../../lib/asset'
import styles from './Navbar.module.css'

const LINKS = [
  { label: 'CV', href: asset('docs/Lucas-Blachet-DelSolar-CV.pdf'), external: true },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucas-blachet-del-solar-11a89a261/', external: true },
  { label: 'GitHub', href: 'https://github.com/luzarin', external: true },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onResize = () => window.innerWidth > 768 && setOpen(false)
    document.addEventListener('click', close)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('click', close)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.affix : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>Inicio</Link>
        <ul className={styles.links}>
          {LINKS.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
            </li>
          ))}
        </ul>
        <button
          className={styles.burger}
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        >☰</button>
        {open && (
          <div ref={menuRef} className={styles.mobileMenu}>
            <ul>
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  )
}
```

CSS Module: nav fija arriba (`position: fixed; height: var(--nav-height); background: transparent; transition`), `.affix { background: var(--color-surface-dark); box-shadow: var(--shadow-card); }`, links `color: var(--color-text-inverse)`, `.burger` visible solo `@media (max-width: 768px)` (y `.links` oculto), `.mobileMenu` panel bajo la nav con fondo `--color-surface-dark`.

`Footer.tsx`: `<footer>` con texto legacy: `Creado por Lucas Blachet Del Solar | Email: lucas.blachet@uc.cl`.

`Spinner.tsx`: div con clase de animación CSS (border girando), `role="status"`, `aria-label="Cargando"`.

- [ ] **Step 4: Test de Navbar** — `Navbar.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Navbar } from './Navbar'

test('toggle del menu movil', async () => {
  render(<MemoryRouter><Navbar /></MemoryRouter>)
  const btn = screen.getByRole('button', { name: /abrir menú/i })
  expect(btn).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(btn)
  expect(btn).toHaveAttribute('aria-expanded', 'true')
  await userEvent.click(document.body)
  expect(btn).toHaveAttribute('aria-expanded', 'false')
})
```

- [ ] **Step 5: Verificar** — todos los tests PASS. `npm run dev`: navbar fija, affix al scrollear, menú móvil funciona a <768px (probar en browser con viewport mobile). Gate verde.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(ui): agrega layout y rutas base"
```

---

### Task 5: Secciones del home — Sobre mí, Habilidades, Educación, Experiencia

**Files:**
- Create: `src/components/home/About.tsx` + `.module.css`, `src/components/home/SkillBars.tsx` + `.module.css`, `src/components/home/EducationTimeline.tsx` + `.module.css`, `src/components/home/ExperienceCard.tsx` + `.module.css`, `src/components/home/SkillBars.test.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `skills`, `education`, `experience` (T3), `asset()` (T1).
- Produces: `About()`, `SkillBars()`, `EducationTimeline()`, `ExperienceCard()` — sin props (leen de `src/data/`). HomePage las compone en orden: About → Educación/Habilidades (2 columnas) → Experiencia.

- [ ] **Step 1: Test primero** — `SkillBars.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { SkillBars } from './SkillBars'
import { skills } from '../../data/skills'

test('renderiza una barra por skill', () => {
  render(<SkillBars />)
  for (const s of skills) expect(screen.getByText(s.name)).toBeInTheDocument()
})
```

Run → FAIL.

- [ ] **Step 2: Implementar componentes** (frontend-design para el look; contenido de `index.html` legacy líneas 39–164):
  - `About`: título "Sobre mí", foto `asset('imagenes/perfil.JPEG')` clickeable que abre modal ampliado (estado local `open`; overlay que cierra al click; `Escape` también cierra), bio de 2 párrafos EXACTA del legacy.
  - `SkillBars`: barra por skill; ancho por custom property:

```tsx
import { skills } from '../../data/skills'
import styles from './SkillBars.module.css'

export function SkillBars() {
  return (
    <div className={styles.list}>
      {skills.map((s) => (
        <div key={s.name} className={styles.skill} style={{ '--level': s.level } as React.CSSProperties}>
          <div className={styles.name}>{s.name}</div>
          <div className={styles.bar}><div className={styles.fill} /></div>
        </div>
      ))}
    </div>
  )
}
```

CSS: `.fill { width: calc(var(--level) * 100%); }` con transición y color `--color-accent`.
  - `EducationTimeline` y `ExperienceCard`: mapear los datos; logos vía sus URLs externas (están en `education.ts`/`experience.ts`); links con `target="_blank" rel="noopener noreferrer"`.
  - `HomePage`: componer con headings `<h2>` por sección y anchors `id="about"`, `id="cv"`.

- [ ] **Step 3: Verificar** — tests PASS; en browser comparar contra `https://luzarin.github.io/portfolio/` (misma info, mismas 7 barras con niveles correctos, modal de foto funciona). Gate verde.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(home): agrega secciones de perfil"
```

---

### Task 6: Grilla de proyectos

**Files:**
- Create: `src/components/home/ProjectCard.tsx` + `.module.css`, `src/components/home/ProjectsGrid.tsx` + `.module.css`, `src/components/home/ProjectsGrid.test.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `projects` (T3), `asset()`.
- Produces: `ProjectsGrid()` (sin props), `ProjectCard({ project }: { project: ProjectMeta })` → `<Link to={`/proyectos/${project.slug}`}>`. Placeholder con gradiente CSS cuando `cardImage` es undefined.

- [ ] **Step 1: Test primero** — `ProjectsGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ProjectsGrid } from './ProjectsGrid'
import { projects } from '../../data/projects'

test('renderiza las 6 cards con link a su ruta', () => {
  render(<MemoryRouter><ProjectsGrid /></MemoryRouter>)
  const links = screen.getAllByRole('link', { name: /ver más/i })
  expect(links).toHaveLength(6)
  expect(links[0]).toHaveAttribute('href', `/proyectos/${projects[0].slug}`)
})
```

Run → FAIL.

- [ ] **Step 2: Implementar** — grid CSS (`repeat(auto-fill, minmax(320px, 1fr))`, gap `--space-4`). Card: imagen (`asset(cardImage)` o `<div class="placeholder">` con gradiente + título si falta), título, summary, link "Ver Más". Look dark de las cards actuales modernizado (frontend-design): hover con elevación sutil.

- [ ] **Step 3: Verificar** — test PASS; browser: 6 cards, card 5 muestra placeholder digno (hoy en el sitio vivo está rota). Gate verde.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(home): agrega grilla de proyectos"
```

---

### Task 7: Migración de assets a `public/`

**Files:**
- Create: `public/imagenes/` (12 archivos), `public/datos/proyecto-1/` (2 tif + 2 geojson), `public/datos/proyecto-2/hexagonos_uf.geojson`, `public/datos/proyecto-4/lulc_lccs.tif`, `public/datos/proyecto-5/` (3 tif), `public/embeds/hypsometric_curve_interactive.html`, `public/embeds/hexagonos_uf_3d.html`, `public/docs/Lucas-Blachet-DelSolar-CV.pdf`

**Interfaces:**
- Produces: rutas de assets que usan T5–T11 vía `asset()`: `imagenes/<archivo>`, `datos/proyecto-N/<archivo>`, `embeds/<archivo>.html`, `docs/Lucas-Blachet-DelSolar-CV.pdf`. Los originales en `imagenes/` y `proyectos/` NO se tocan (se borran en T13).

- [ ] **Step 1: Copiar con nombres sin espacios**

```bash
mkdir -p public/imagenes public/embeds public/docs public/datos/proyecto-1 public/datos/proyecto-2 public/datos/proyecto-4 public/datos/proyecto-5
cp imagenes/* public/imagenes/
cp "proyectos/Lucas-Blachet-DelSolar-CV.pdf" public/docs/
cp "proyectos/proyecto 1/mapa3.tif" "proyectos/proyecto 1/mapa4.tif" "proyectos/proyecto 1/ae_hidro.geojson" "proyectos/proyecto 1/basin_streamnetwork.geojson" public/datos/proyecto-1/
cp "proyectos/proyecto 1/hypsometric_curve_interactive.html" public/embeds/
cp "proyectos/proyecto 2/hexagonos_uf.geojson" public/datos/proyecto-2/
cp "proyectos/proyecto 2/hexagonos_uf_3d.html" public/embeds/
cp "proyectos/proyecto 4/lulc_lccs.tif" public/datos/proyecto-4/
cp "proyectos/proyecto 5/LST_RM.tif" "proyectos/proyecto 5/UHI_RM.tif" "proyectos/proyecto 5/UTFVI_RM.tif" public/datos/proyecto-5/
```

NO copiar `*.aux.xml` (metadatos de QGIS, el browser no los usa).

- [ ] **Step 2: Verificar** — `find public -type f | wc -l` → 22 archivos. `npm run build` → verde (los assets se copian a `dist/`). ADVERTIR en el resumen de la tarea: esto duplica ~50 MB en el repo hasta T13 (aceptado, se borra el origen al final).

- [ ] **Step 3: Commit**

```bash
git add public && git commit -m "chore(assets): migra assets a public"
```

---

### Task 8: Componentes de mapas (Leaflet + GeoRaster)

**Files:**
- Create: `src/components/maps/LeafletMap.tsx` + `.module.css`, `src/components/maps/GeoRasterLayer.tsx`, `src/components/maps/GeoJsonLayer.tsx`, `src/components/maps/OpacityControl.tsx` + `.module.css`, `src/components/maps/MapLegend.tsx` + `.module.css`, `src/components/common/ErrorBoundary.tsx`, `src/types/geolibs.d.ts`, `src/components/maps/GeoRasterLayer.test.tsx`

**Interfaces:**
- Consumes: react-leaflet 5, leaflet, georaster, georaster-layer-for-leaflet, geoblaze.
- Produces (contrato para T9–T11):

```ts
LeafletMap({ center: [number, number], zoom: number, baseLayer?: 'carto-light' | 'esri-imagery' | 'osm',
             height?: number /* default 650 */, children?: ReactNode }): JSX.Element
GeoRasterLayer({ url: string, pixelValuesToColorFn: (values: number[]) => string | null,
                 opacity?: number /* 0..1, default 0.9 */, resolution?: number /* default 256 */,
                 identifyLabel?: (value: number) => string, onLoad?: () => void,
                 onError?: (err: unknown) => void }): null
GeoJsonLayer({ url: string, style?: L.PathOptions | L.StyleFunction,
               onEachFeature?: (f: GeoJSON.Feature, l: L.Layer) => void,
               fillOpacity?: number /* 0..1; effect reactivo: layer.setStyle({ fillOpacity }) */,
               onLoad?: (data: GeoJSON.FeatureCollection) => void,
               onError?: (err: unknown) => void }): null
OpacityControl({ value: number /* 0..100 */, onChange: (v: number) => void, label?: string }): JSX.Element
MapLegend({ title: string, items: { color: string; label: string }[] }): JSX.Element  // overlay abs. dentro del mapa
ErrorBoundary({ fallback: ReactNode, children: ReactNode }): JSX.Element
```

- [ ] **Step 1: Declaraciones de tipos** — `src/types/geolibs.d.ts` (las libs geo no publican types):

```ts
declare module 'georaster' {
  const parseGeoraster: (input: ArrayBuffer) => Promise<unknown>
  export default parseGeoraster
}
declare module 'georaster-layer-for-leaflet' {
  import L from 'leaflet'
  export default class GeoRasterLayer extends L.GridLayer {
    constructor(options: {
      georaster: unknown
      opacity?: number
      resolution?: number
      pixelValuesToColorFn?: (values: number[]) => string | null
    })
    setOpacity(opacity: number): this
  }
}
declare module 'geoblaze' {
  const geoblaze: { identify: (georaster: unknown, point: [number, number]) => number[] | null }
  export default geoblaze
}
```

- [ ] **Step 2: Test primero (GeoRasterLayer con mocks)** — `GeoRasterLayer.test.tsx`:

```tsx
import { render, waitFor } from '@testing-library/react'
import { GeoRasterLayer } from './GeoRasterLayer'

const addTo = vi.fn()
const remove = vi.fn()
vi.mock('react-leaflet', () => ({ useMap: () => ({ on: vi.fn(), off: vi.fn() }) }))
vi.mock('georaster', () => ({ default: vi.fn(async () => ({ fake: true })) }))
vi.mock('georaster-layer-for-leaflet', () => ({
  default: vi.fn(function (this: Record<string, unknown>) {
    this.addTo = addTo; this.remove = remove; this.setOpacity = vi.fn()
  }),
}))
vi.mock('geoblaze', () => ({ default: { identify: vi.fn() } }))

test('descarga, parsea y agrega la capa al mapa', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(new ArrayBuffer(8))))
  const onLoad = vi.fn()
  render(<GeoRasterLayer url="/x.tif" pixelValuesToColorFn={() => null} onLoad={onLoad} />)
  await waitFor(() => expect(onLoad).toHaveBeenCalled())
  expect(addTo).toHaveBeenCalled()
})

test('reporta error si el fetch falla', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })))
  const onError = vi.fn()
  render(<GeoRasterLayer url="/x.tif" pixelValuesToColorFn={() => null} onError={onError} />)
  await waitFor(() => expect(onError).toHaveBeenCalled())
})
```

Run → FAIL.

- [ ] **Step 3: Implementar `GeoRasterLayer`**

```tsx
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import parseGeoraster from 'georaster'
import GeoRasterLeaflet from 'georaster-layer-for-leaflet'
import geoblaze from 'geoblaze'

type Props = {
  url: string
  pixelValuesToColorFn: (values: number[]) => string | null
  opacity?: number
  resolution?: number
  identifyLabel?: (value: number) => string
  onLoad?: () => void
  onError?: (err: unknown) => void
}

export function GeoRasterLayer({
  url, pixelValuesToColorFn, opacity = 0.9, resolution = 256, identifyLabel, onLoad, onError,
}: Props) {
  const map = useMap()
  const layerRef = useRef<GeoRasterLeaflet | null>(null)
  const georasterRef = useRef<unknown>(null)
  const callbacks = useRef({ pixelValuesToColorFn, identifyLabel, onLoad, onError })
  callbacks.current = { pixelValuesToColorFn, identifyLabel, onLoad, onError }

  useEffect(() => {
    let cancelled = false
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status} al cargar ${url}`); return r.arrayBuffer() })
      .then((buf) => parseGeoraster(buf))
      .then((georaster) => {
        if (cancelled) return
        georasterRef.current = georaster
        const layer = new GeoRasterLeaflet({
          georaster, opacity, resolution,
          pixelValuesToColorFn: (v) => callbacks.current.pixelValuesToColorFn(v),
        })
        layer.addTo(map)
        layerRef.current = layer
        callbacks.current.onLoad?.()
      })
      .catch((err) => { if (!cancelled) callbacks.current.onError?.(err) })
    return () => {
      cancelled = true
      layerRef.current?.remove()
      layerRef.current = null
    }
    // opacity/resolution solo aplican al crear; cambios de opacidad van por el effect de abajo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, map])

  useEffect(() => { layerRef.current?.setOpacity(opacity) }, [opacity])

  useEffect(() => {
    if (!identifyLabel) return
    const onClick = (e: L.LeafletMouseEvent) => {
      const g = georasterRef.current
      if (!g) return
      const values = geoblaze.identify(g, [e.latlng.lng, e.latlng.lat])
      const v = values?.[0]
      if (v !== null && v !== undefined) {
        L.popup().setLatLng(e.latlng).setContent(callbacks.current.identifyLabel!(v)).openOn(map)
      }
    }
    map.on('click', onClick)
    return () => { map.off('click', onClick) }
  }, [identifyLabel, map])

  return null
}
```

- [ ] **Step 4: Implementar el resto**
  - `LeafletMap`: `MapContainer` + `TileLayer` según `baseLayer` + `ScaleControl` (métrico), envuelto en div `position: relative` con `height` (las URLs: carto `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`, esri `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`, osm estándar — con sus attributions legacy).
  - `GeoJsonLayer`: `useMap` + effect: `fetch(url)` → `L.geoJSON(data, { style, onEachFeature }).addTo(map)`, cleanup `.remove()`, callbacks `onLoad(data)`/`onError`.
  - `OpacityControl`: `<label>` + `<input type="range" min={0} max={100}>` + valor "%", controlado.
  - `MapLegend`: div absolute bottom-right, `z-index: 1000`, swatches de color + labels (estilo de la legend legacy `proyecto1.html:92-121`).
  - `ErrorBoundary`: class component estándar (`static getDerivedStateFromError`, render fallback).

- [ ] **Step 5: Verificar** — tests PASS. `npm run build` verde (atención a que georaster/geoblaze bundleen bien; si Vite falla por CommonJS, agregar a `optimizeDeps.include` en `vite.config.ts` — riesgo previsto en spec §10). Gate verde.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(maps): agrega componentes de mapas"
```

---

### Task 9: Página Proyecto 1 (Aconcagua ΔNDVI/TWI) + layout de proyecto

**Files:**
- Create: `src/pages/ProjectLayout.tsx` + `.module.css`, `src/components/common/EmbedFrame.tsx`, `src/components/common/MapPanel.tsx` + `.module.css`, `src/pages/Proyecto1.tsx`
- Modify: `src/pages/registry.ts`

**Interfaces:**
- Consumes: todo T8, `getProject` (T3), `asset()`.
- Produces:
  - `ProjectLayout({ slug: string, children: ReactNode })` — busca el `ProjectMeta`, renderiza `<h1>{title}</h1>`, link "← Volver", envuelve children en `ErrorBoundary` con fallback de error localizado.
  - `EmbedFrame({ src: string, title: string, height?: number /* default 650 */ })` — iframe sin borde.
  - `MapPanel({ title: string, children: ReactNode, loading?: boolean, control?: ReactNode })` — título del mapa + contenedor con overlay `<Spinner/>` mientras `loading` y slot para `OpacityControl` debajo.

- [ ] **Step 1: Implementar `ProjectLayout`, `EmbedFrame`, `MapPanel`** según el contrato de arriba (frontend-design para jerarquía del header de página).

- [ ] **Step 2: Implementar `Proyecto1.tsx`** — fuente: `proyectos/proyecto1.html`. Estructura (líneas 230–370 del legacy): intro textual + mapa principal + curva hipsométrica (iframe) + 2 mapas raster con slider de opacidad. Copiar textos EXACTOS. Configuración de mapas (extraída del legacy):
  - Mapa principal (legacy L385): center `[-32.8122, -71.2490]`, zoom 11, base esri-imagery; `GeoJsonLayer` de `asset('datos/proyecto-1/ae_hidro.geojson')` y `asset('datos/proyecto-1/basin_streamnetwork.geojson')` — portar estilos/popups de L393–427.
  - Iframe: `<EmbedFrame src={asset('embeds/hypsometric_curve_interactive.html')} title="Curva hipsométrica" />` (legacy L275).
  - Raster ΔNDVI (legacy L429–470): `GeoRasterLayer url={asset('datos/proyecto-1/mapa3.tif')}` — portar `pixelValuesToColorFn` EXACTA del legacy, opacidad con estado + `OpacityControl`, `identifyLabel` = `(v) => \`Valor: ${v}\``.
  - Raster TWI (legacy L479–517): ídem con `mapa4.tif` (colorFn: val 1 → `'rgb(255, 249, 0)'`, resto null).
  - `MapLegend` con los items de la legend legacy (L92–121 + su HTML).

Patrón de página (se repite en T10/T11):

```tsx
import { lazy, useState } from 'react'   // lazy solo en registry
// ...
const [ndviOpacity, setNdviOpacity] = useState(90)
const [ndviLoading, setNdviLoading] = useState(true)
// ...
<MapPanel title="ΔNDVI verano-invierno" loading={ndviLoading}
  control={<OpacityControl value={ndviOpacity} onChange={setNdviOpacity} label="Cambiar transparencia" />}>
  <LeafletMap center={[-32.8122, -71.249]} zoom={11} baseLayer="esri-imagery">
    <GeoRasterLayer
      url={asset('datos/proyecto-1/mapa3.tif')}
      pixelValuesToColorFn={ndviColor}
      opacity={ndviOpacity / 100}
      identifyLabel={(v) => `Valor: ${v}`}
      onLoad={() => setNdviLoading(false)}
      onError={() => setNdviLoading(false)}
    />
  </LeafletMap>
</MapPanel>
```

- [ ] **Step 3: Registrar la ruta** — en `registry.ts`:

```ts
import { lazy } from 'react'
// dentro del objeto:
'aconcagua-ndvi-twi': lazy(() => import('./Proyecto1')),
```

- [ ] **Step 4: Verificar en browser (crítico — primera página con mapas reales)** — `npm run dev`, navegar desde la card 1: los 3 mapas cargan, rasters visibles con sus colores, popup de identify al click, slider cambia opacidad, iframe de curva hipsométrica funciona, spinner aparece mientras parsea. Comparar lado a lado con `https://luzarin.github.io/portfolio/proyectos/proyecto1.html`. Gate verde.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(proyectos): agrega pagina proyecto 1"
```

---

### Task 10: Páginas Proyecto 2 (Precios 3D) y Proyecto 4 (LULC Colchagua)

**Files:**
- Create: `src/pages/Proyecto2.tsx`, `src/pages/Proyecto4.tsx`
- Modify: `src/pages/registry.ts` (2 entradas)

**Interfaces:**
- Consumes: contratos de T8/T9 (mismos nombres y tipos — ver bloque Interfaces de T8).

- [ ] **Step 1: `Proyecto2.tsx`** — fuente `proyectos/proyecto2.html` (contenido: líneas 200–280; script: 284–496). Envolver en `<ProjectLayout slug="precios-inmobiliarios-3d">`. Textos exactos. Mapas:
  - Leaflet: `GeoJsonLayer` de `asset('datos/proyecto-2/hexagonos_uf.geojson')` — portar de L364–480 el style por rangos de UF/m² y popups (`onEachFeature`). El legacy abre en `[-33.4, -70.34]` z14 y salta a `[-33.39, -70.53]` z12 al cargar: usar directamente center `[-33.39, -70.53]` zoom 12 en `LeafletMap` (base carto-light) — efecto visual equivalente. Slider de opacidad (default 80) vía prop `fillOpacity` de `GeoJsonLayer` (contrato T8).
  - `EmbedFrame` del 3D: `asset('embeds/hexagonos_uf_3d.html')` (legacy L244).
  - `MapLegend` con los rangos de color del legacy.
- [ ] **Step 2: Registrar** `'precios-inmobiliarios-3d': lazy(() => import('./Proyecto2'))`. Verificar en browser contra el sitio vivo (popups UF/m², slider, iframe 3D).
- [ ] **Step 3: `Proyecto4.tsx`** — fuente `proyectos/proyecto4.html` (contenido: 150–215; script: 222–327). Envolver en `<ProjectLayout slug="lulc-colchagua">`. Leaflet center `[-34.61, -71.32]` zoom 10, carto-light; `GeoRasterLayer` de `asset('datos/proyecto-4/lulc_lccs.tif')` con `opacity={0.85}` fija — portar `pixelValuesToColorFn` de L257+ (mapa de clases LCCS → color) y la leyenda de clases como `MapLegend` items (mismos colores/labels del legacy). SIN slider ni identify: el legacy no los tiene (carga geoblaze pero nunca lo usa) — no pasar `identifyLabel`.
- [ ] **Step 4: Registrar** `'lulc-colchagua': lazy(() => import('./Proyecto4'))`. Verificar en browser contra el sitio vivo.
- [ ] **Step 5: Gate verde y commit**

```bash
git add -A && git commit -m "feat(proyectos): agrega paginas proyectos 2 y 4"
```

---

### Task 11: Páginas Proyecto 3 (DTM LiDAR), 5 (LST/UHI/UTFVI) y 6 (Catastro minero) + galería

**Files:**
- Create: `src/components/common/ImageGallery.tsx` + `.module.css`, `src/pages/Proyecto3.tsx`, `src/pages/Proyecto5.tsx`, `src/pages/Proyecto6.tsx`, `src/pages/registry.test.ts`
- Modify: `src/pages/registry.ts` (3 entradas)

**Interfaces:**
- Consumes: contratos T8/T9.
- Produces: `ImageGallery({ images: { src: string; alt: string; caption?: string }[] })` — grid de figuras con caption.

- [ ] **Step 1: `ImageGallery`** — grid responsive de `<figure>` + `<figcaption>`; imágenes con `loading="lazy"`.
- [ ] **Step 2: `Proyecto3.tsx`** — fuente `proyectos/proyecto3.html` (sin mapas; script 139+ es solo UI legacy que NO se porta). Envolver en `<ProjectLayout slug="dtm-lidar">`. Textos exactos + `ImageGallery` con `imagenes/proyecto3-1.png` … `proyecto3-4.png` y `proyecto_3.png` según aparezcan en el legacy (usar `asset()`). Registrar `'dtm-lidar'`.
- [ ] **Step 3: `Proyecto5.tsx`** — fuente `proyectos/proyecto5.html` (script 261–451: array de 3 configs). Envolver en `<ProjectLayout slug="lst-uhi-rm">`. Tres `MapPanel` (LST, UHI, UTFVI), cada uno `LeafletMap` carto-light con center/zoom del config legacy + `GeoRasterLayer` (`datos/proyecto-5/LST_RM.tif`, `UHI_RM.tif`, `UTFVI_RM.tif`) portando cada rampa de color de L335+ y la opacidad fija del config, `MapLegend` por mapa. SIN slider ni identify (paridad con el legacy). Registrar `'lst-uhi-rm'`.
- [ ] **Step 3b: Imagen de card del proyecto 5 (best-effort, spec §10)** — con la página P5 funcionando en dev, capturar screenshot del mapa LST con el browser (`computer` screenshot → recortar zona del mapa), guardarlo como `public/imagenes/proyecto5.png` y setear `cardImage: 'imagenes/proyecto5.png'` en `projects.ts`. Si la captura no resulta digna, mantener el placeholder y anotarlo en el resumen final.
- [ ] **Step 4: `Proyecto6.tsx`** — fuente `proyectos/proyecto6.html` (sin mapas). Envolver en `<ProjectLayout slug="catastro-minero">`. Textos exactos + `ImageGallery` (`imagenes/proyecto6.jpg`, `proyecto6-1.jpg` según legacy). Registrar `'catastro-minero'`.
- [ ] **Step 5: Test de cobertura del registro** — `src/pages/registry.test.ts`:

```ts
import { projectPages } from './registry'
import { projects } from '../data/projects'

test('todas las paginas de proyecto estan registradas', () => {
  for (const p of projects) expect(projectPages[p.slug]).toBeDefined()
})
```

Run → PASS (si falla, falta una entrada).
- [ ] **Step 6: Verificar en browser** las 3 páginas contra el sitio vivo (3 mapas térmicos del P5 con colores correctos, galerías completas). Gate verde.
- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(proyectos): agrega paginas proyectos 3 5 y 6"
```

---

### Task 12: Deploy — SPA fallback + GitHub Actions

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `package.json` (build con 404)

**Interfaces:**
- Consumes: scripts npm (T1).
- Produces: sitio desplegable; `dist/404.html` = copia de `dist/index.html`.

- [ ] **Step 1: 404 fallback** — en `package.json`:

```json
"build": "tsc -b && vite build && cp dist/index.html dist/404.html"
```

`npm run build` → verificar que `dist/404.html` existe.

- [ ] **Step 2: Workflow** — `.github/workflows/deploy.yml`:

```yaml
name: Deploy a GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --run
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Probar el build de producción localmente** — `npm run build && npm run preview` y abrir la URL del preview (sirve bajo `/portfolio/`): navegar home → proyecto 1 → recargar la página del proyecto (F5) para validar el comportamiento de deep-link (en preview no hay 404.html, validar que al menos la navegación interna funciona; el deep-link real se valida post-merge en Pages).

- [ ] **Step 4: Commit** (NOTA para el resumen final: al mergear a main, Lucas debe cambiar Settings → Pages → Source a "GitHub Actions" — paso manual, spec §7.)

```bash
git add -A && git commit -m "chore(deploy): agrega workflow de github pages"
```

---

### Task 13: Limpieza de legacy y verificación final

**Files:**
- Delete: `main.js`, `style.css`, `pag_proyecto.css`, `pag_proyecto.js`, `proyectos/` (completa), `imagenes/` (completa)
- Modify: ninguno (el `index.html` raíz ya es el de Vite)

- [ ] **Step 1: Verificación completa PRE-borrado** — con `npm run dev` abierto, checklist contra el sitio vivo:
  - Home: navbar (affix + menú móvil), foto + modal, bio, 7 skills con niveles, educación (2), experiencia IGM, 6 cards, footer.
  - Las 6 páginas de proyecto: textos completos, todos los mapas con sus capas/colores/identify/sliders, 2 iframes, galerías.
  - Links externos: CV (PDF abre), LinkedIn, GitHub.
- [ ] **Step 2: Borrar legacy**

```bash
git rm -r main.js style.css pag_proyecto.css pag_proyecto.js proyectos imagenes
```

- [ ] **Step 3: Optimización de imágenes best-effort** (spec §3: >300 KB → WebP q80, conservar original si ahorro <20%). Solo si `magick` está disponible (`command -v magick`); si no, SALTEAR este paso y anotarlo en el resumen final:

```bash
for f in public/imagenes/*.png public/imagenes/*.jpg public/imagenes/*.JPEG; do
  [ -f "$f" ] || continue
  size=$(stat -f%z "$f")
  [ "$size" -gt 300000 ] || continue
  out="${f%.*}.webp"
  magick "$f" -quality 80 "$out"
  newsize=$(stat -f%z "$out")
  if [ $((newsize * 100 / size)) -lt 80 ]; then rm "$f"; else rm "$out"; fi
done
```

Si algún archivo cambió de extensión, actualizar sus referencias en `src/data/projects.ts` (cardImage), `About.tsx` (perfil) y galerías; correr tests y verificar en browser que ninguna imagen quedó rota.
- [ ] **Step 4: Gate final completo** — `npm run lint && npm run lint:css && npm run typecheck && npm run test -- --run && npm run build` → todo verde. `npm run preview`: recorrido completo una vez más.
- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore(repo): elimina archivos legacy"
```

---

## Verificación de cierre (post-plan)

1. `git log --oneline main..HEAD` — ~14 commits con formato del usuario.
2. Usar la skill `verify` para el recorrido end-to-end final en browser.
3. Ofrecer merge/PR con la skill `superpowers:finishing-a-development-branch`. Recordar el paso manual de Pages (Settings → Pages → Source: GitHub Actions).
