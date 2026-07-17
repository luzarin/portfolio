import { ProjectLayout } from './ProjectLayout'
import { ImageGallery } from '../components/common/ImageGallery'
import { asset } from '../lib/asset'
import styles from './Proyecto3.module.css'

const IMAGES = [
  { src: asset('imagenes/proyecto3-1.png'), alt: 'Herramienta en QGIS', caption: 'Herramienta en QGIS.' },
  {
    src: asset('imagenes/proyecto3-2.png'),
    alt: 'Archivos .tif de celdas DTM+buildings corregidas',
    caption: 'Archivos .tif de celdas DTM+buildings corregidas.',
  },
  {
    src: asset('imagenes/proyecto3-3.png'),
    alt: 'Ráster virtual del DTM+buildings final',
    caption: 'Ráster virtual del DTM+buildings final.',
  },
  {
    src: asset('imagenes/proyecto3-4.png'),
    alt: 'Producto renderizado en Blender',
    caption: 'Producto resultante del Ráster virtual (Renderizado en Blender).',
  },
]

export default function Proyecto3() {
  return (
    <ProjectLayout slug="dtm-lidar">
      <ImageGallery images={IMAGES} />
      <div className={styles.content}>
        <h2>Resumen del Proyecto</h2>
        <p>
          Proyecto diseñado para automatizar un flujo de trabajo LiDAR completo orientado a generar
          Modelos Digitales del Terreno (DTM) que incluyan edificaciones, a partir de archivos
          LAZ/LAS clasificados. Consta de dos implementaciones:
        </p>
        <p>
          <strong>1. dtmbuildings-qgis.py:</strong> pensado como script de procesamiento dentro de
          QGIS (Processing Toolbox), para ejecutarlo como herramienta.
          <br />
          <strong>2. dtmbuildings.py:</strong> versión standalone en Python puro, mismo flujo fuera
          de QGIS, ideal para batch.
        </p>
        <p>
          El pipeline ejecuta una secuencia fija de procesamiento LiDAR. Primero filtra los puntos
          de suelo (clase 2) y edificaciones (clase 6) con PDAL, luego fusiona ambas
          clasificaciones en un único archivo para conservar las elevaciones estructurales. Después
          rasteriza el conjunto combinado mediante writers.gdal, generando un DTM+edificaciones con
          resolución configurable (por ejemplo, 0.5 m) y compresión optimizada. Finalmente aplica
          gdal_fillnodata para rellenar huecos y obtener superficies continuas. Produce rasters
          finales coherentes, sin NoData, listos para análisis o para construcción de rásters.
        </p>
        <h2>Más Información</h2>
        <p>
          <a
            href="https://github.com/luzarin/DTM-y-edificaciones"
            target="_blank"
            rel="noopener noreferrer"
          >
            🔗 GitHub
          </a>
        </p>
      </div>
    </ProjectLayout>
  )
}
