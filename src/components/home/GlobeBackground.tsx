import { useEffect, useRef } from 'react'
import { asset } from '../../lib/asset'
import styles from './GlobeBackground.module.css'

/**
 * Fondo del home: globo ortográfico fijo al viewport, detrás de todo el
 * contenido y visible al hacer scroll. Costas reales (Natural Earth 50m,
 * pre-simplificadas en public/datos/world-50m.json). Canvas puro, sin libs.
 * Reemplaza la retícula del fondo mientras está montado (body.has-globe).
 */
export function GlobeBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    document.body.classList.add('has-globe')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const D2R = Math.PI / 180
    const tilt = -0.42
    let LAND: number[][] = []
    let W = 0, H = 0, cx = 0, cy = 0, R = 0, dpr = 1, rot = 2.0
    let running = false, raf = 0, cancelled = false

    const ll = (lat: number, lon: number): [number, number, number] => {
      const la = lat * D2R, lo = lon * D2R
      return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)]
    }
    const proj = (x: number, y: number, z: number) => {
      const xr = x * Math.cos(rot) + z * Math.sin(rot)
      const zr = -x * Math.sin(rot) + z * Math.cos(rot)
      const yt = y * Math.cos(tilt) - zr * Math.sin(tilt)
      const zt = y * Math.sin(tilt) + zr * Math.cos(tilt)
      return { sx: cx + R * xr, sy: cy - R * yt, z: zt }
    }
    const projLL = (lat: number, lon: number) => { const v = ll(lat, lon); return proj(v[0], v[1], v[2]) }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth; H = window.innerHeight
      canvas!.width = Math.max(1, W * dpr); canvas!.height = Math.max(1, H * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = W * (W < 720 ? 0.5 : 0.7); cy = H * 0.5
      R = Math.min(W * 0.48, H * 0.74)
    }

    function sphere() {
      const g = ctx!.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R)
      g.addColorStop(0, 'rgba(255,255,255,0.42)')
      g.addColorStop(0.7, 'rgba(232,236,238,0.24)')
      g.addColorStop(1, 'rgba(40,44,50,0.05)')
      ctx!.beginPath(); ctx!.arc(cx, cy, R, 0, Math.PI * 2); ctx!.fillStyle = g; ctx!.fill()
      ctx!.beginPath(); ctx!.arc(cx, cy, R, 0, Math.PI * 2)
      ctx!.strokeStyle = 'rgba(40,44,50,0.20)'; ctx!.lineWidth = 0.8; ctx!.stroke()
    }
    function graticule() {
      const front = new Path2D(), back = new Path2D()
      const add = (p0: { sx: number; sy: number; z: number }, p1: { sx: number; sy: number; z: number }) => {
        const pth = (p0.z + p1.z) / 2 >= 0 ? front : back
        pth.moveTo(p0.sx, p0.sy); pth.lineTo(p1.sx, p1.sy)
      }
      for (let lat = -60; lat <= 60; lat += 30) { let pv = projLL(lat, -180); for (let lon = -170; lon <= 180; lon += 10) { const p = projLL(lat, lon); add(pv, p); pv = p } }
      for (let lon = -180; lon < 180; lon += 30) { let pv = projLL(-90, lon); for (let lat = -80; lat <= 90; lat += 10) { const p = projLL(lat, lon); add(pv, p); pv = p } }
      ctx!.strokeStyle = 'rgba(40,44,50,0.05)'; ctx!.lineWidth = 0.5; ctx!.stroke(back)
      ctx!.strokeStyle = 'rgba(40,44,50,0.15)'; ctx!.lineWidth = 0.5; ctx!.stroke(front)
    }
    function land() {
      const front = new Path2D(), back = new Path2D()
      for (let r = 0; r < LAND.length; r++) {
        const ring = LAND[r]
        let p0 = projLL(ring[1], ring[0])
        for (let i = 2; i < ring.length; i += 2) {
          const p1 = projLL(ring[i + 1], ring[i])
          const pth = (p0.z + p1.z) / 2 >= 0 ? front : back
          pth.moveTo(p0.sx, p0.sy); pth.lineTo(p1.sx, p1.sy)
          p0 = p1
        }
      }
      ctx!.lineJoin = 'round'
      ctx!.strokeStyle = 'rgba(40,44,50,0.11)'; ctx!.lineWidth = 0.5; ctx!.stroke(back)
      ctx!.strokeStyle = 'rgba(40,44,50,0.65)'; ctx!.lineWidth = 0.6; ctx!.stroke(front)
    }

    function frame() {
      ctx!.clearRect(0, 0, W, H)
      sphere(); graticule(); land()
      if (running && !reduce && !document.hidden) { rot += 0.0009; raf = requestAnimationFrame(frame) }
      else running = false
    }
    function start() {
      if (reduce) { frame(); return }
      if (running) return
      running = true; raf = requestAnimationFrame(frame)
    }

    const onResize = () => { resize(); if (!running) frame() }
    const onVis = () => { if (!document.hidden) start() }

    fetch(asset('datos/world-50m.json'))
      .then((r) => r.json())
      .then((data: number[][]) => { if (cancelled) return; LAND = data; resize(); start() })
      .catch(() => { /* fondo decorativo: si falla, se omite */ })

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelled = true; running = false; cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      document.body.classList.remove('has-globe')
    }
  }, [])

  return <canvas ref={ref} className={styles.globe} aria-hidden="true" />
}
