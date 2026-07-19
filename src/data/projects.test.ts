import { projects, getProject } from './projects'

test('hay 7 proyectos con slugs unicos', () => {
  expect(projects).toHaveLength(7)
  expect(new Set(projects.map((p) => p.slug)).size).toBe(7)
})

test('getProject resuelve y rechaza slugs', () => {
  expect(getProject('dtm-lidar')?.title).toMatch(/DTM/i)
  expect(getProject('no-existe')).toBeUndefined()
})
