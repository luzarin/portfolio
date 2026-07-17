import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

type Props = {
  url: string
  style?: L.PathOptions | L.StyleFunction
  onEachFeature?: (feature: GeoJSON.Feature, layer: L.Layer) => void
  /** 0..1; cambia el fillOpacity de toda la capa de forma reactiva. */
  fillOpacity?: number
  onLoad?: (data: GeoJSON.FeatureCollection) => void
  onError?: (err: unknown) => void
}

export function GeoJsonLayer({ url, style, onEachFeature, fillOpacity, onLoad, onError }: Props) {
  const map = useMap()
  const layerRef = useRef<L.GeoJSON | null>(null)
  const callbacks = useRef({ style, onEachFeature, onLoad, onError })
  useEffect(() => {
    callbacks.current = { style, onEachFeature, onLoad, onError }
  })

  useEffect(() => {
    let cancelled = false
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} al cargar ${url}`)
        return r.json()
      })
      .then((data: GeoJSON.FeatureCollection) => {
        if (cancelled) return
        const layer = L.geoJSON(data, {
          style: callbacks.current.style,
          onEachFeature: callbacks.current.onEachFeature,
        })
        layer.addTo(map)
        layerRef.current = layer
        callbacks.current.onLoad?.(data)
      })
      .catch((err) => {
        if (!cancelled) callbacks.current.onError?.(err)
      })
    return () => {
      cancelled = true
      layerRef.current?.remove()
      layerRef.current = null
    }
  }, [url, map])

  useEffect(() => {
    if (fillOpacity !== undefined) layerRef.current?.setStyle({ fillOpacity })
  }, [fillOpacity])

  return null
}
