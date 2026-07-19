import type { ProjectMeta } from '../types/project'

export const projects: ProjectMeta[] = [
  {
    slug: 'aconcagua-ndvi-twi',
    title: 'Monitoreo estacional de vegetación irrigada vs no irrigada en el Valle de Aconcagua',
    summary:
      'Proyecto de Monitoreo estacional de vegetación irrigada en el valle del Aconcagua en el año 2024: análisis de dependencia hídrica mediante ΔNDVI y Topographic Wetness Index (TWI) con imágenes Sentinel-2.',
    cardImage: 'imagenes/proyecto1.jpg',
  },
  {
    slug: 'precios-inmobiliarios-3d',
    title: 'Scraping y Visualización 3D de Precios Inmobiliarios (UF/m²) desde Toc Toc',
    summary:
      'Pipeline que extrae datos de propiedades desde Toc Toc mediante scraping, consolida y limpia la información, y genera una visualización 3D interactiva en PyDeck. El mapa representa el valor promedio UF/m² por celda, con altura proporcional al precio.',
    cardImage: 'imagenes/proyecto2.png',
  },
  {
    slug: 'dtm-lidar',
    title: 'Herramienta Generador de DTM y edificaciones desde LiDAR',
    summary:
      'Conjunto de scripts (uno como herramienta de QGIS y otro standalone en Python) que procesan archivos LAZ/LAS, filtran clases 2 (suelo) y 6 (edificaciones), las fusionan, rasterizan a una resolución definida y rellenan NoData para producir un DTM con edificaciones.',
    cardImage: 'imagenes/proyecto3-4.png',
  },
  {
    slug: 'lulc-colchagua',
    title: 'Land Cover LCCS Valle de Colchagua',
    summary:
      'Mapa Land Use Land Cover (LULC) siguiendo el estándar de Land Cover Classification System (LCCS, ISO 19144-2). El flujo integra preprocesamiento óptico y SAR, extracción de índices espectrales y fenológicos, reducción de speckle, estadísticos multitemporales y un stack de 54 bandas. El resultado es un ráster de 10m de resolución con métricas por clase.',
    cardImage: 'imagenes/proyecto4.png',
  },
  {
    slug: 'lst-uhi-rm',
    title:
      'Análisis de Temperatura Superficial, Isla de Calor Urbana y Variabilidad Térmica en la Región Metropolitana (LST–UHI–UTFVI)',
    summary:
      'Mapa térmico para la Región Metropolitana a partir de Landsat 8: el script calcula la Temperatura Superficial (LST) con estimación de emisividad y produce los índices de Islas de Calor Urbano (UHI) y el Índice de Varianza del Campo Térmico Urbano (UTFVI) para identificar gradientes térmicos urbanos y zonas de mayor intensidad de calor.',
  },
  {
    slug: 'catastro-minero',
    title: 'Catastros de Terrenos Superficiales y de Propiedad Minera',
    summary:
      'Proyecto de análisis territorial aplicado al sector minero que combina el catastro de derechos mineros con el levantamiento de la capa superficial para evaluar la instalación de una desaladora y su tubería en Antofagasta. Incluye revisión de concesiones, propiedad fiscal y particular, actos administrativos, territorios indígenas, concesiones marítimas e IPT, junto con cronograma, presupuesto y planificación de terreno, todo integrado en una geodatabase para identificar restricciones y actores clave del territorio.',
    cardImage: 'imagenes/proyecto6.jpg',
  },
  {
    slug: 'dependencia-riego-elqui',
    title: 'Dependencia del riego en el Valle de Elqui — serie temporal (2020–2025)',
    summary:
      'Pipeline reutilizable y cloud-native (Sentinel-2 STAC + COG) que estima la dependencia hídrica inferida mediante ΔNDVI estacional, pendiente y TWI, con auto-configuración por AOI. Aplicado como serie multianual sobre el valle de Elqui: bajo la megasequía, el secano retrocede ~12 % mientras el riego se sostiene. Mapa de clasificación interactivo por año y comparador 2020 vs 2025.',
    cardImage: 'imagenes/proyecto7.png',
  },
]

export function getProject(slug: string): ProjectMeta | undefined {
  return projects.find((p) => p.slug === slug)
}
