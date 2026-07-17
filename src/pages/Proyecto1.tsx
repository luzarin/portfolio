import { useState } from 'react'
import { ProjectLayout } from './ProjectLayout'
import { MapPanel } from '../components/common/MapPanel'
import { EmbedFrame } from '../components/common/EmbedFrame'
import { LeafletMap } from '../components/maps/LeafletMap'
import { GeoJsonLayer } from '../components/maps/GeoJsonLayer'
import { GeoRasterLayer } from '../components/maps/GeoRasterLayer'
import { MapLegend } from '../components/maps/MapLegend'
import { OpacityControl } from '../components/maps/OpacityControl'
import { asset } from '../lib/asset'
import styles from './Proyecto1.module.css'

const riegoColor = (values: number[]): string | null => {
  const val = values[0]
  if (val === 0 || val === null) return null
  if (val === 1) return 'rgb(255, 0, 0)'
  if (val === 2) return 'rgb(255, 165, 0)'
  if (val === 3) return 'rgb(255, 255, 0)'
  if (val === 4) return 'rgb(0, 255, 0)'
  return null
}

const criticoColor = (values: number[]): string | null => {
  const val = values[0]
  if (val === 0 || val === null) return null
  if (val === 1) return 'rgb(255, 249, 0)'
  return null
}

export default function Proyecto1() {
  const [riegoOpacity, setRiegoOpacity] = useState(90)
  const [riegoLoading, setRiegoLoading] = useState(true)
  const [criticoOpacity, setCriticoOpacity] = useState(90)
  const [criticoLoading, setCriticoLoading] = useState(true)

  return (
    <ProjectLayout slug="aconcagua-ndvi-twi">
      <div className={styles.grid}>
        <MapPanel title="Red de drenaje de la cuenca">
          <LeafletMap center={[-32.8122, -71.249]} zoom={11} baseLayer="carto-light">
            <GeoJsonLayer
              url={asset('datos/proyecto-1/ae_hidro.geojson')}
              style={{ color: '#ff0000', weight: 2, fillColor: 'transparent', fillOpacity: 0 }}
            />
            <GeoJsonLayer
              url={asset('datos/proyecto-1/basin_streamnetwork.geojson')}
              style={(f) => {
                const strahler = (f?.properties?.Strahler as number | undefined) ?? 1
                return { color: '#0066cc', weight: strahler * 0.7, opacity: 0.8 }
              }}
            />
            <MapLegend
              title="Leyenda"
              items={[
                { color: '#ff0000', label: 'Cuenca', line: 2 },
                { color: '#0066cc', label: 'Strahler 1-2', line: 1 },
                { color: '#0066cc', label: 'Strahler 3-4', line: 2 },
                { color: '#0066cc', label: 'Strahler 5+', line: 3 },
              ]}
            />
          </LeafletMap>
        </MapPanel>

        <MapPanel title="Curva Hipsométrica">
          <EmbedFrame
            src={asset('embeds/hypsometric_curve_interactive.html')}
            title="Curva hipsométrica interactiva"
          />
        </MapPanel>

        <MapPanel
          title="Clasificación de Riego"
          loading={riegoLoading}
          control={
            <OpacityControl
              value={riegoOpacity}
              onChange={setRiegoOpacity}
              label="Cambiar Transparencia"
            />
          }
        >
          <LeafletMap center={[-32.8122, -71.249]} zoom={11} baseLayer="esri-imagery">
            <GeoRasterLayer
              url={asset('datos/proyecto-1/mapa3.tif')}
              pixelValuesToColorFn={riegoColor}
              opacity={riegoOpacity / 100}
              identifyLabel={(v) => `Valor: ${v}`}
              onLoad={() => setRiegoLoading(false)}
              onError={() => setRiegoLoading(false)}
            />
            <MapLegend
              title="Leyenda"
              items={[
                { color: 'rgb(255, 0, 0)', label: 'Riego intenso' },
                { color: 'rgb(255, 165, 0)', label: 'Riego moderado' },
                { color: 'rgb(255, 255, 0)', label: 'Equilibrio' },
                { color: 'rgb(0, 255, 0)', label: 'Secano' },
              ]}
            />
          </LeafletMap>
        </MapPanel>

        <MapPanel
          title="Riego Crítico"
          loading={criticoLoading}
          control={
            <OpacityControl
              value={criticoOpacity}
              onChange={setCriticoOpacity}
              label="Cambiar Transparencia"
            />
          }
        >
          <LeafletMap center={[-32.727, -71.2024]} zoom={13} baseLayer="esri-imagery">
            <GeoRasterLayer
              url={asset('datos/proyecto-1/mapa4.tif')}
              pixelValuesToColorFn={criticoColor}
              opacity={criticoOpacity / 100}
              identifyLabel={(v) => `Valor: ${v}`}
              onLoad={() => setCriticoLoading(false)}
              onError={() => setCriticoLoading(false)}
            />
            <MapLegend title="Leyenda" items={[{ color: 'rgb(255, 249, 0)', label: 'Riego crítico' }]} />
          </LeafletMap>
        </MapPanel>
      </div>

      <div className={styles.content}>
        <h2>Resumen del Proyecto</h2>
        <p>
          Proyecto de monitoreo estacional de vegetación irrigada en el valle del Aconcagua (2024),
          enfocado en cuantificar la dependencia del riego en cultivos y áreas productivas mediante
          imágenes Sentinel-2. Se compararon compuestos estacionales de verano (dic-feb) e invierno
          (jun-ago), calculando el ΔNDVI para representar la variación del vigor vegetal entre
          periodos seco y húmedo.
        </p>
        <p>
          A partir de percentiles estadísticos y del índice de humedad topográfica (TWI), se
          clasificó la superficie agrícola en cuatro niveles de dependencia hídrica: riego intenso,
          riego moderado, equilibrio y secano. Los resultados permiten identificar zonas críticas
          donde el verdor estival depende totalmente del riego y áreas con mayor eficiencia o aporte
          natural de humedad, aportando una herramienta reproducible para planificación hídrica en
          valles mediterráneos de Chile central.
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
    </ProjectLayout>
  )
}
