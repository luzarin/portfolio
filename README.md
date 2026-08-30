# Portafolio — Lucas Blachet

Portafolio personal de Lucas Blachet, geógrafo y desarrollador enfocado en análisis espacial, teledetección y arquitectura de soluciones geoespaciales.

**Sitio en vivo**: https://luzarin.github.io/portfolio/

## Stack

- React 19 + TypeScript + Vite
- React Router
- Leaflet / react-leaflet (mapas), georaster / georaster-layer-for-leaflet / geoblaze (rásters en el navegador)
- Vitest + Testing Library
- ESLint, Stylelint, Prettier
- Deploy automático a GitHub Pages vía GitHub Actions (`.github/workflows/deploy.yml`)

## Estructura

```
src/
  components/   # UI compartida (layout, mapas, home)
  data/         # Contenido: proyectos, experiencia, educación, skills
  pages/        # Home + una página por proyecto
  styles/       # Tokens de diseño y estilos globales
  lib/          # Utilidades (resolución de assets, etc.)
public/         # Imágenes, datos estáticos (rásters, geometrías)
```

Cada proyecto del portafolio vive en `src/pages/ProyectoN.tsx` + su registro en `src/pages/registry.ts` y metadata en `src/data/projects.ts`.

## Desarrollo local

```bash
npm install
npm run dev
```

Otros comandos:

```bash
npm run build      # build de producción
npm run test       # tests (Vitest)
npm run lint        # ESLint
npm run lint:css    # Stylelint
npm run typecheck   # chequeo de tipos
npm run format      # Prettier
```

## Despliegue

Cada push a `main` dispara el workflow de GitHub Actions: corre lint, typecheck y tests, y si pasan, publica `dist/` en GitHub Pages.
