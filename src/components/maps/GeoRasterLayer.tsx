import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import parseGeoraster from 'georaster'
import GeoRasterLeaflet from 'georaster-layer-for-leaflet'
import geoblaze from 'geoblaze'

type Props = {
  url: string
  pixelValuesToColorFn: (values: number[]) => string | null
  /** 0..1 */
  opacity?: number
  resolution?: number
  /** Si se pasa, un click en el mapa muestra popup con el valor del pixel. */
  identifyLabel?: (value: number) => string
  /** Ajusta la vista al extent del raster al cargar. */
  fitBounds?: boolean
  onLoad?: () => void
  onError?: (err: unknown) => void
}

export function GeoRasterLayer({
  url,
  pixelValuesToColorFn,
  opacity = 0.9,
  resolution = 256,
  identifyLabel,
  fitBounds = false,
  onLoad,
  onError,
}: Props) {
  const map = useMap()
  const layerRef = useRef<GeoRasterLeaflet | null>(null)
  const georasterRef = useRef<unknown>(null)
  const callbacks = useRef({ pixelValuesToColorFn, identifyLabel, onLoad, onError })
  useEffect(() => {
    callbacks.current = { pixelValuesToColorFn, identifyLabel, onLoad, onError }
  })

  useEffect(() => {
    let cancelled = false
    const initialOpacity = layerRef.current ? undefined : opacity
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} al cargar ${url}`)
        return r.arrayBuffer()
      })
      .then((buf) => parseGeoraster(buf))
      .then((georaster) => {
        if (cancelled) return
        georasterRef.current = georaster
        const layer = new GeoRasterLeaflet({
          georaster,
          opacity: initialOpacity ?? 0.9,
          resolution,
          pixelValuesToColorFn: (v) => callbacks.current.pixelValuesToColorFn(v),
        })
        layer.addTo(map)
        layerRef.current = layer
        if (fitBounds) {
          try {
            map.fitBounds(layer.getBounds(), { padding: [20, 20] })
          } catch (e) {
            console.warn('No fue posible ajustar el mapa al raster:', e)
          }
        }
        callbacks.current.onLoad?.()
      })
      .catch((err) => {
        if (!cancelled) callbacks.current.onError?.(err)
      })
    return () => {
      cancelled = true
      layerRef.current?.remove()
      layerRef.current = null
    }
    // La capa se crea una vez por url; la opacidad reactiva va en el effect siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, map, resolution])

  useEffect(() => {
    layerRef.current?.setOpacity(opacity)
  }, [opacity])

  useEffect(() => {
    if (!identifyLabel) return
    const onClick = (e: L.LeafletMouseEvent) => {
      const g = georasterRef.current
      if (!g) return
      const values = geoblaze.identify(g, [e.latlng.lng, e.latlng.lat])
      const v = values?.[0]
      if (v !== null && v !== undefined) {
        L.popup()
          .setLatLng(e.latlng)
          .setContent(callbacks.current.identifyLabel!(v))
          .openOn(map)
      }
    }
    map.on('click', onClick)
    return () => {
      map.off('click', onClick)
    }
  }, [identifyLabel, map])

  return null
}
