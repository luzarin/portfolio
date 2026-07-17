// Rampa de color continua interpolada, portada del legacy proyecto5.html
type Rgb = { r: number; g: number; b: number }

function hexToRgb(hex: string): Rgb {
  let clean = hex.startsWith('#') ? hex.slice(1) : hex
  if (clean.length === 3) {
    clean = clean
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(clean, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function interpolate(start: Rgb, end: Rgb, t: number): Rgb {
  return {
    r: Math.round(start.r + (end.r - start.r) * t),
    g: Math.round(start.g + (end.g - start.g) * t),
    b: Math.round(start.b + (end.b - start.b) * t),
  }
}

export function buildColorRamp(
  min: number,
  max: number,
  palette: string[],
): (value: number | null | undefined) => string | null {
  const rgbPalette = palette.map(hexToRgb)
  return (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return null
    const clamped = Math.max(min, Math.min(max, value))
    const normalized = (clamped - min) / (max - min)
    if (!Number.isFinite(normalized)) return null
    let scaled = normalized * (rgbPalette.length - 1)
    let index = Math.floor(scaled)
    if (index >= rgbPalette.length - 1) {
      index = rgbPalette.length - 2
      scaled = rgbPalette.length - 1
    }
    const t = scaled - index
    const mixed = interpolate(rgbPalette[index], rgbPalette[index + 1], t)
    return `rgb(${mixed.r},${mixed.g},${mixed.b})`
  }
}

/** Entradas de leyenda para una rampa: un valor interpolado por color de la paleta. */
export function rampLegendItems(
  min: number,
  max: number,
  palette: string[],
  format: (value: number) => string,
): { color: string; label: string }[] {
  const steps = Math.max(1, palette.length - 1)
  return palette.map((color, index) => {
    const value = index === palette.length - 1 ? max : min + ((max - min) / steps) * index
    return { color, label: format(value) }
  })
}
