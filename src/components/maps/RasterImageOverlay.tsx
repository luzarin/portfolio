import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

type Props = {
  /** PNG RGBA pre-coloreado, georreferenciado a `bounds`. */
  url: string
  bounds: L.LatLngBoundsExpression
  opacity?: number
  onLoad?: () => void
  onError?: () => void
}

/**
 * Overlay de un único raster pre-renderizado a PNG. Se usa en vez de
 * georaster-layer-for-leaflet para series donde se alterna el año: esa
 * librería reutiliza los tiles de la instancia anterior al cambiar de capa
 * y el mapa deja de reflejar el año seleccionado.
 */
export function RasterImageOverlay({ url, bounds, opacity = 0.8, onLoad, onError }: Props) {
  const map = useMap()
  const cb = useRef({ onLoad, onError })
  useEffect(() => {
    cb.current = { onLoad, onError }
  })

  useEffect(() => {
    const layer = L.imageOverlay(url, bounds, { opacity, interactive: false })
    layer.on('load', () => cb.current.onLoad?.())
    layer.on('error', () => cb.current.onError?.())
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map, url, bounds, opacity])

  return null
}
