import { useState } from 'react'
import L from 'leaflet'
import { ProjectLayout } from './ProjectLayout'
import { MapPanel } from '../components/common/MapPanel'
import { EmbedFrame } from '../components/common/EmbedFrame'
import { LeafletMap } from '../components/maps/LeafletMap'
import { GeoJsonLayer } from '../components/maps/GeoJsonLayer'
import { MapLegend } from '../components/maps/MapLegend'
import { OpacityControl } from '../components/maps/OpacityControl'
import { asset } from '../lib/asset'
import styles from './Proyecto2.module.css'

function getColor(valor: number): string {
  if (valor <= 16) return '#fff5f0'
  if (valor <= 43) return '#fcbea5'
  if (valor <= 68) return '#fb7050'
  if (valor <= 126) return '#d32020'
  return '#67000d'
}

const hexStyle: L.StyleFunction = (feature) => {
  const valor = (feature?.properties?.['UF/M2 promedio'] as number | undefined) ?? 0
  return {
    fillColor: getColor(valor),
    weight: 0.5,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.8,
  }
}

function onEachHex(feature: GeoJSON.Feature, layer: L.Layer, map: L.Map) {
  const path = layer as L.Path
  const valor = ((feature.properties as Record<string, unknown>)?.['UF/M2 promedio'] as number) ?? 0
  const gridId = ((feature.properties as Record<string, unknown>)?.['GRID_ID'] as string) ?? 'N/A'
  const html =
    `<div style="text-align:center"><strong>Valor UF/M²</strong><br/>` +
    `<span style="font-size:17px;color:#d32020;font-weight:600">${valor.toFixed(2)} UF/M²</span><br/>` +
    `<span style="font-size:12px;color:#7f8c8d">GRID ID: ${gridId}</span></div>`
  path.on({
    mouseover: (e) => {
      const l = e.target as L.Path
      l.setStyle({ weight: 3, color: '#666', fillOpacity: 0.9 })
      l.bringToFront()
    },
    mouseout: (e) => {
      const l = e.target as L.Path
      l.setStyle({ weight: 0.5, color: 'white', fillOpacity: 0.8 })
    },
    click: (e) => {
      L.popup()
        .setLatLng((e as L.LeafletMouseEvent).latlng)
        .setContent(html)
        .openOn(map)
    },
  })
}

const LEGEND_ITEMS = [
  { color: getColor(1), label: '0–16' },
  { color: getColor(17), label: '16–43' },
  { color: getColor(44), label: '43–68' },
  { color: getColor(69), label: '68–126' },
  { color: getColor(127), label: '126+' },
]

export default function Proyecto2() {
  const [opacity, setOpacity] = useState(80)
  const [loading, setLoading] = useState(true)

  return (
    <ProjectLayout slug="precios-inmobiliarios-3d">
      <div className={styles.grid}>
        <MapPanel
          title="Visualización 2D"
          loading={loading}
          control={
            <OpacityControl value={opacity} onChange={setOpacity} label="Cambiar Transparencia" />
          }
        >
          <LeafletMap center={[-33.39, -70.53]} zoom={12} baseLayer="carto-light">
            <GeoJsonLayer
              url={asset('datos/proyecto-2/hexagonos_uf.geojson')}
              style={hexStyle}
              onEachFeature={onEachHex}
              fillOpacity={opacity / 100}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
            <MapLegend title="UF/M² Promedio" items={LEGEND_ITEMS} />
          </LeafletMap>
        </MapPanel>

        <MapPanel title="Visualización 3D">
          <EmbedFrame
            src={asset('embeds/hexagonos_uf_3d.html')}
            title="Mapa 3D de precios UF/m²"
          />
        </MapPanel>
      </div>

      <div className={styles.content}>
        <h2>Resumen del Proyecto</h2>
        <p>
          Pipeline de extracción y análisis espacial de datos inmobiliarios de Toc Toc Chile.
          Permite definir una zona (polígono Toc Toc), el tipo de propiedad y la operación, extraer
          todas las publicaciones reales usando requests con headers autenticados, consolidar
          múltiples descargas en un único dataset sin duplicados y con una superficie unificada.
        </p>
        <p>
          Luego lleva esos datos a una grilla espacial para construir un mapa 3D interactivo en
          PyDeck donde la altura y el color representan el valor UF/m² promedio de cada celda. Sirve
          para análisis exploratorio de mercado, detección de zonas con sobreprecio y generación
          rápida de entregables web a partir de datos scrapeados.
        </p>
        <h2>Más Información</h2>
        <p>
          <a
            href="https://github.com/luzarin/ScrapingTocToc"
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
