import type { CSSProperties, ReactNode } from 'react'
import { MapContainer, ScaleControl, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './LeafletMap.module.css'

const BASE_LAYERS = {
  'carto-light': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  'esri-imagery': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar',
  },
  's2-cloudless': {
    url: 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg',
    attribution: 'Sentinel-2 cloudless by <a href="https://s2maps.eu">EOX</a>',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
} as const

type Props = {
  center: [number, number]
  zoom: number
  baseLayer?: keyof typeof BASE_LAYERS
  /** Alto del mapa en px (default 650). */
  height?: number
  scrollWheelZoom?: boolean
  /** Posición del control de escala (default 'bottomleft'). */
  scalePosition?: 'bottomleft' | 'bottomright' | 'topleft' | 'topright'
  children?: ReactNode
}

export function LeafletMap({
  center,
  zoom,
  baseLayer = 'carto-light',
  height = 650,
  scrollWheelZoom = true,
  scalePosition = 'bottomleft',
  children,
}: Props) {
  const base = BASE_LAYERS[baseLayer]
  return (
    <div className={styles.wrap} style={{ '--map-h': `${height}px` } as CSSProperties}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={scrollWheelZoom}
        className={styles.map}
      >
        <TileLayer url={base.url} attribution={base.attribution} maxZoom={19} />
        <ScaleControl imperial={false} position={scalePosition} />
        {children}
      </MapContainer>
    </div>
  )
}
