declare module 'georaster' {
  const parseGeoraster: (input: ArrayBuffer) => Promise<unknown>
  export default parseGeoraster
}

declare module 'georaster-layer-for-leaflet' {
  import L from 'leaflet'

  export default class GeoRasterLayer extends L.GridLayer {
    constructor(options: {
      georaster: unknown
      opacity?: number
      resolution?: number
      pixelValuesToColorFn?: (values: number[]) => string | null
    })
    setOpacity(opacity: number): this
    getBounds(): L.LatLngBounds
    getContainer(): HTMLElement | null
  }
}

declare module 'geoblaze' {
  const geoblaze: {
    identify: (georaster: unknown, point: [number, number]) => number[] | null
  }
  export default geoblaze
}
