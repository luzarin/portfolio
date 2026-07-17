import { buildColorRamp } from './colorRamp'

test('interpola extremos, medios y clampea', () => {
  const fn = buildColorRamp(0, 10, ['#000000', '#ffffff'])
  expect(fn(0)).toBe('rgb(0,0,0)')
  expect(fn(10)).toBe('rgb(255,255,255)')
  expect(fn(5)).toBe('rgb(128,128,128)')
  expect(fn(-5)).toBe('rgb(0,0,0)')
  expect(fn(99)).toBe('rgb(255,255,255)')
})

test('rechaza valores invalidos', () => {
  const fn = buildColorRamp(0, 1, ['#000', '#fff'])
  expect(fn(null)).toBeNull()
  expect(fn(undefined)).toBeNull()
  expect(fn(Number.NaN)).toBeNull()
})
