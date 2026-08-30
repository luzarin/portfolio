import { useState } from 'react'
import { ProjectLayout } from './ProjectLayout'
import { MapPanel } from '../components/common/MapPanel'
import { LeafletMap } from '../components/maps/LeafletMap'
import { CompareRasters } from '../components/maps/CompareRasters'
import { RasterImageOverlay } from '../components/maps/RasterImageOverlay'
import { MapLegend } from '../components/maps/MapLegend'
import { asset } from '../lib/asset'
import styles from './Proyecto7.module.css'

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025] as const
type Year = (typeof YEARS)[number]

const COLORS: Record<number, string> = { 1: '#d73027', 2: '#fc8d59', 3: '#fee090', 4: '#4575b4' }

const LABELS: Record<number, string> = {
  1: 'Riego intenso',
  2: 'Riego moderado',
  3: 'Equilibrio',
  4: 'Secano',
}

const LEGEND_ITEMS = Object.entries(COLORS).map(([k, color]) => ({
  color,
  label: `${k} · ${LABELS[Number(k)]}`,
}))

// Bounds WGS84 del ráster (mismas para todos los años) para los overlays de comparación.
const ELQUI_BOUNDS: [number, number][] = [
  [-30.15718, -70.95418],
  [-29.94283, -70.39698],
]

const CHANGE = [
  { label: 'Riego intenso', y0: 187, y1: 191, pct: 2.1 },
  { label: 'Riego moderado', y0: 2712, y1: 2616, pct: -3.5 },
  { label: 'Equilibrio', y0: 677, y1: 918, pct: 35.6 },
  { label: 'Secano', y0: 1444, y1: 1277, pct: -11.6 },
]

const ha = (n: number): string => n.toLocaleString('es-CL')

export default function Proyecto7() {
  const [mode, setMode] = useState<Year | 'compare'>(2025)
  const [loading, setLoading] = useState(true)

  const select = (m: Year | 'compare') => {
    if (m !== mode) {
      setLoading(true)
      setMode(m)
    }
  }

  return (
    <ProjectLayout slug="dependencia-riego-elqui">
      <div className={styles.layout}>
        <MapPanel
          title={
            mode === 'compare'
              ? 'Comparación de clasificación · 2020 vs 2025'
              : `Clasificación de dependencia hídrica en ${mode}`
          }
          loading={loading}
          control={
            <div className={styles.years} role="group" aria-label="Ver un año o comparar">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={mode === y ? styles.yearActive : styles.year}
                  aria-pressed={mode === y}
                  onClick={() => select(y)}
                >
                  {y}
                </button>
              ))}
              <button
                type="button"
                className={`${mode === 'compare' ? styles.yearActive : styles.year} ${styles.compareSep}`}
                aria-pressed={mode === 'compare'}
                onClick={() => select('compare')}
              >
                ⇆ 2020/25
              </button>
            </div>
          }
        >
          <LeafletMap
            center={[-30.04, -70.68]}
            zoom={11}
            baseLayer="esri-imagery"
            height={720}
            scalePosition="bottomright"
          >
            {mode === 'compare' ? (
              <CompareRasters
                urlLeft={asset('datos/proyecto-7/clasificacion_2020.png')}
                urlRight={asset('datos/proyecto-7/clasificacion_2025.png')}
                bounds={ELQUI_BOUNDS}
                labelLeft="2020"
                labelRight="2025"
                opacity={0.85}
                onReady={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            ) : (
              <RasterImageOverlay
                key={mode}
                url={asset(`datos/proyecto-7/clasificacion_${mode}.png`)}
                bounds={ELQUI_BOUNDS}
                opacity={0.8}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            )}
            <MapLegend title="Dependencia hídrica" items={LEGEND_ITEMS} position="bottomleft" />
          </LeafletMap>
        </MapPanel>

        <div className={styles.text}>
          <h2>Resumen del Proyecto</h2>
          <p>
            Pipeline reutilizable y cloud-native que estima la <strong>dependencia hídrica
            inferida</strong> de la superficie agrícola a partir de la respuesta espectral estacional
            (ΔNDVI de Sentinel-2) y las condiciones topográficas (pendiente y Topographic Wetness
            Index, TWI). La señal central es ΔNDVI = NDVI(verano seco) − NDVI(invierno húmedo), donde
            positivo indica verdor sostenido por riego y negativo, una respuesta natural a la lluvia
            invernal (secano), mientras que TWI distingue el riego de la humedad topográfica natural.
          </p>
          <p>
            El pipeline es AOI-agnóstico y auto-configurable, ya que deriva las ventanas seco/húmedo del
            hemisferio y el CRS de la zona; consume Sentinel-2 L2A y DEM de Copernicus vía STAC + COG,
            y exporta GeoTIFF/GeoPackage/GeoParquet junto a un catálogo STAC de las salidas. Aquí se
            aplica como <strong>serie temporal 2020–2025</strong> sobre el valle de Elqui (Coquimbo),
            en plena megasequía.
          </p>
          <p>
            El pipeline se construyó como un paquete Python modular (<code>src/riego/</code>), donde cada
            etapa (AOI, ventana temporal, composición espectral, terreno, máscara, clasificación,
            exportación) es una función independiente, orquestada por un único archivo
            de configuración. La ingesta usa STAC (Planetary Computer/Earth Search) para identificar
            las escenas y las lee como COG, sin descargar la imagen completa. La serie 2020–2025
            corre con un orquestador robusto que gestiona el almacenamiento en caché por año y maneja 
            reintentos ante fallos temporales de la API, evitando el reprocesamiento innecesario. En el 
            frontend, cada clasificación se expone como un overlay georreferenciado sobre Leaflet, 
            mientras que el comparador utiliza ese mismo mecanismo junto con <em>clip-path</em> de
            CSS para activar el slider entre 2020 y 2025.
          </p>

          <h2>Cambio 2020 → 2025</h2>
          <ul className={styles.change}>
            {CHANGE.map((c) => (
              <li key={c.label}>
                <span className={styles.dot} style={{ background: colorFor(c.label) }} />
                <span>{c.label}</span>
                <span className={styles.vals}>
                  {ha(c.y0)} → {ha(c.y1)} ha
                </span>
                <span className={c.pct < 0 ? styles.down : styles.up}>
                  {c.pct > 0 ? '+' : ''}
                  {c.pct}%
                </span>
              </li>
            ))}
          </ul>
          <p>
            Sobre una superficie vegetada estable de ~5.000 ha, el <strong>secano cae ~12%</strong> mientras 
            que la categoría de <strong>equilibrio crece ~36%</strong>. Este comportamiento
            refleja cómo la vegetación dependiente de la lluvia invernal retrocede bajo el impacto de
            la sequía, forzando a que parte de la superficie se estabilice (cobertura perenne o riego continuo)
            mientras el riego tradicional se sostiene. Cabe destacar que la clasificación por percentiles 
            es interna al AOI, por lo que actúa como un indicador relativo y no como una medición absoluta de
            agua en el suelo.
          </p>

          <h2>Más Información</h2>
          <p>
            <a
              href="https://github.com/luzarin/Monitoreo-Dependencia-Riego"
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

function colorFor(label: string): string {
  const code = Object.entries(LABELS).find(([, l]) => l === label)?.[0]
  return code ? COLORS[Number(code)] : '#999'
}
