import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

type Props = {
  /** PNG RGBA pre-coloreado (ya georreferenciado a las bounds). */
  urlLeft: string
  urlRight: string
  bounds: L.LatLngBoundsExpression
  labelLeft: string
  labelRight: string
  opacity?: number
  /** Se llama cuando ambas imágenes cargaron. */
  onReady?: () => void
  onError?: () => void
}

const ACCENT = '#0e7490'

/**
 * Comparación tipo "swipe" entre dos rásteres como overlays de imagen: se dibujan
 * ambos y el de arriba (derecha) se recorta con clip-path, revelando el de abajo
 * (izquierda). Se usan imageOverlays (no dos capas georaster) porque dos capas
 * georaster superpuestas no co-renderizan de forma fiable.
 */
export function CompareRasters({
  urlLeft,
  urlRight,
  bounds,
  labelLeft,
  labelRight,
  opacity = 0.85,
  onReady,
  onError,
}: Props) {
  const map = useMap()
  const cb = useRef({ onReady, onError })
  useEffect(() => {
    cb.current = { onReady, onError }
  })

  useEffect(() => {
    const container = map.getContainer()
    let pct = 50

    const divider = document.createElement('div')
    Object.assign(divider.style, {
      position: 'absolute',
      top: '0',
      bottom: '0',
      width: '2px',
      background: ACCENT,
      zIndex: '450',
      cursor: 'ew-resize',
      transform: 'translateX(-1px)',
      touchAction: 'none',
    })
    const handle = document.createElement('div')
    Object.assign(handle.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: ACCENT,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '15px',
      boxShadow: '0 1px 6px rgba(0, 0, 0, 0.35)',
    })
    handle.textContent = '⇆'
    divider.appendChild(handle)
    container.appendChild(divider)

    const mkLabel = (text: string, side: 'left' | 'right') => {
      const el = document.createElement('div')
      Object.assign(el.style, {
        position: 'absolute',
        top: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#1b1f26',
        font: '600 12px Poppins, sans-serif',
        padding: '2px 8px',
        borderRadius: '4px',
        zIndex: '450',
        pointerEvents: 'none',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)',
      })
      if (side === 'left') el.style.left = '10px'
      else el.style.right = '10px'
      el.textContent = text
      container.appendChild(el)
      return el
    }
    const lblL = mkLabel(labelLeft, 'left')
    const lblR = mkLabel(labelRight, 'right')

    const leftLayer = L.imageOverlay(urlLeft, bounds, { opacity, interactive: false })
    const rightLayer = L.imageOverlay(urlRight, bounds, { opacity, interactive: false })

    const applyClip = () => {
      const el = rightLayer.getElement()
      if (el) el.style.clipPath = `inset(0 0 0 ${pct}%)`
      divider.style.left = `${pct}%`
    }

    let loaded = 0
    const onOneLoad = () => {
      loaded += 1
      applyClip()
      if (loaded >= 2) cb.current.onReady?.()
    }
    leftLayer.on('load', onOneLoad)
    rightLayer.on('load', onOneLoad)
    leftLayer.on('error', () => cb.current.onError?.())
    rightLayer.on('error', () => cb.current.onError?.())
    leftLayer.addTo(map)
    rightLayer.addTo(map) // se dibuja encima
    applyClip()

    let dragging = false
    const onDown = (e: PointerEvent) => {
      dragging = true
      map.dragging.disable()
      e.preventDefault()
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      const rect = container.getBoundingClientRect()
      pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
      applyClip()
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      map.dragging.enable()
    }
    divider.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    return () => {
      divider.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      leftLayer.remove()
      rightLayer.remove()
      divider.remove()
      lblL.remove()
      lblR.remove()
      map.dragging.enable()
    }
  }, [map, urlLeft, urlRight, bounds, labelLeft, labelRight, opacity])

  return null
}
