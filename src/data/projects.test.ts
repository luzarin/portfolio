import { projects, getProject } from './projects'

test('hay 6 proyectos con slugs unicos', () => {
  expect(projects).toHaveLength(6)
  expect(new Set(projects.map((p) => p.slug)).size).toBe(6)
})

test('getProject resuelve y rechaza slugs', () => {
  expect(getProject('dtm-lidar')?.title).toMatch(/DTM/i)
  expect(getProject('no-existe')).toBeUndefined()
})
