import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'

// Cada página de proyecto agrega aquí su entrada lazy(() => import('./ProyectoN'))
export const projectPages: Record<string, LazyExoticComponent<ComponentType>> = {
  'aconcagua-ndvi-twi': lazy(() => import('./Proyecto1')),
  'precios-inmobiliarios-3d': lazy(() => import('./Proyecto2')),
  'dtm-lidar': lazy(() => import('./Proyecto3')),
  'lulc-colchagua': lazy(() => import('./Proyecto4')),
  'lst-uhi-rm': lazy(() => import('./Proyecto5')),
  'catastro-minero': lazy(() => import('./Proyecto6')),
  'dependencia-riego-elqui': lazy(() => import('./Proyecto7')),
}
