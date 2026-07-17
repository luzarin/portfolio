import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

// Cada página de proyecto agrega aquí su entrada lazy(() => import('./ProyectoN'))
export const projectPages: Record<string, LazyExoticComponent<ComponentType>> = {
  'aconcagua-ndvi-twi': lazy(() => import('./Proyecto1')),
  'precios-inmobiliarios-3d': lazy(() => import('./Proyecto2')),
  'lulc-colchagua': lazy(() => import('./Proyecto4')),
}
