import { render, waitFor } from '@testing-library/react'
import { GeoRasterLayer } from './GeoRasterLayer'

const addTo = vi.fn()
const remove = vi.fn()

vi.mock('react-leaflet', () => ({ useMap: () => ({ on: vi.fn(), off: vi.fn() }) }))
vi.mock('georaster', () => ({ default: vi.fn(async () => ({ fake: true })) }))
vi.mock('georaster-layer-for-leaflet', () => ({
  default: vi.fn(function (this: Record<string, unknown>) {
    this.addTo = addTo
    this.remove = remove
    this.setOpacity = vi.fn()
  }),
}))
vi.mock('geoblaze', () => ({ default: { identify: vi.fn() } }))

test('descarga, parsea y agrega la capa al mapa', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(new ArrayBuffer(8))))
  const onLoad = vi.fn()
  render(<GeoRasterLayer url="/x.tif" pixelValuesToColorFn={() => null} onLoad={onLoad} />)
  await waitFor(() => expect(onLoad).toHaveBeenCalled())
  expect(addTo).toHaveBeenCalled()
})

test('reporta error si el fetch falla', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })))
  const onError = vi.fn()
  render(<GeoRasterLayer url="/x.tif" pixelValuesToColorFn={() => null} onError={onError} />)
  await waitFor(() => expect(onError).toHaveBeenCalled())
})
