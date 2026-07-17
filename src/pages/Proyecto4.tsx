import { useState } from 'react'
import { ProjectLayout } from './ProjectLayout'
import { MapPanel } from '../components/common/MapPanel'
import { LeafletMap } from '../components/maps/LeafletMap'
import { GeoRasterLayer } from '../components/maps/GeoRasterLayer'
import { MapLegend } from '../components/maps/MapLegend'
import { asset } from '../lib/asset'
import styles from './Proyecto4.module.css'

const COLOR_RAMP: Record<number, string> = {
  1: '#f2c74b',
  2: '#e67e22',
  3: '#1b5e20',
  4: '#b8860b',
  5: '#66bb6a',
  6: '#9e9e9e',
  7: '#1f78b4',
}

const lulcColor = (values: number[]): string | null => {
  const val = values[0]
  if (val === null || val === undefined || val <= 0) return null
  return COLOR_RAMP[val] ?? '#000000'
}

const LEGEND_ITEMS = [
  { color: '#f2c74b', label: 'C1 Agrícola perenne' },
  { color: '#e67e22', label: 'C2 Agrícola caducifolio' },
  { color: '#1b5e20', label: 'C3 Bosque esclerófilo' },
  { color: '#b8860b', label: 'C4 Matorral/Espinal' },
  { color: '#66bb6a', label: 'C5 Bosque caducifolio' },
  { color: '#9e9e9e', label: 'C6 Urbano/Suelo desnudo' },
  { color: '#1f78b4', label: 'C7 Agua' },
]

export default function Proyecto4() {
  const [loading, setLoading] = useState(true)

  return (
    <ProjectLayout slug="lulc-colchagua">
      <div className={styles.layout}>
        <MapPanel title="LCCS - Valle de Colchagua" loading={loading}>
          <LeafletMap center={[-34.61, -71.32]} zoom={10} baseLayer="carto-light" height={720}>
            <GeoRasterLayer
              url={asset('datos/proyecto-4/lulc_lccs.tif')}
              pixelValuesToColorFn={lulcColor}
              opacity={0.85}
              resolution={128}
              fitBounds
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
            <MapLegend title="Leyenda LULC" items={LEGEND_ITEMS} position="bottomleft" />
          </LeafletMap>
        </MapPanel>

        <div className={styles.text}>
          <h2>Resumen del Proyecto</h2>
          <p>
            El proyecto construye un mapa de cobertura y uso del suelo (LULC) para el Valle de
            Colchagua, basado en insumos ópticos Sentinel-2 y radar Sentinel-1, estructurado bajo la
            lógica del Land Cover Classification System (LCCS; ISO 19144-2). El objetivo es generar
            un ráster de 10m de resolución que represente siete clases definidas por atributos
            observables (forma de vida, fenología, humedad, artificialidad) y respaldado por
            productos secundarios como métricas de área y tablas de precisión. El análisis cubre un
            ciclo agrícola completo (01-09-2023 a 31-08-2024) sobre un AOI (área de estudio).
          </p>
          <p>
            La fase conceptual-operativa se estructura alrededor de una leyenda LCCS adaptada a
            Colchagua: cultivos perennes irrigados, cultivos caducifolios, bosque nativo
            esclerófilo, matorral/espinal, bosque caducifolio, áreas urbanas/suelo desnudo y agua
            permanente. Cada clase se fundamenta en observables RS específicos: fenología de NDVI,
            humedad NDWI, proporciones SAR VV/VH y rasgos estructurales derivados. El
            preprocesamiento integra máscaras SCL de Sentinel-2, reflectancias reescaladas, índices
            e indicadores fenológicos; en radar se aplican calibración a γ⁰, reducción de speckle y
            estadísticos multitemporales. Todo se consolida en un stack final de ~54 bandas
            óptico-SAR-topográficas.
          </p>
          <p>
            El entrenamiento utiliza 8277 muestras etiquetadas para las siete clases, combinadas en
            un único conjunto y dividido 70/30 para entrenamiento y validación. La clasificación se
            realiza con Random Forest estratificado, incorporando estadísticos ópticos, radar y
            fenológicos. La validación independiente entrega OA ≈ 0.68 y Kappa ≈ 0.63, con
            rendimientos altos en clases urbanas y cuerpos de agua (&gt;0.9), coherentes con la
            separabilidad espectral estructural de la zona mediterránea.
          </p>
          <p>
            El resultado es un flujo reproducible y escalable que integra óptico, SAR y topografía
            para resolver la heterogeneidad del Valle de Colchagua. El producto final se exporta
            como GeoTIFF a 10 m (EPSG 5361), acompañado de métricas por clase, tablas de precisión y
            capas auxiliares que sostienen el análisis posterior.
          </p>
          <h2>Más Información</h2>
          <p>
            <a
              href="https://github.com/luzarin/LULC-LCCS-Colchagua"
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 GitHub
            </a>
          </p>
        </div>
      </div>
    </ProjectLayout>
  )
}
