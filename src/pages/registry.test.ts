import { projectPages } from './registry'
import { projects } from '../data/projects'

test('todas las paginas de proyecto estan registradas', () => {
  for (const p of projects) expect(projectPages[p.slug]).toBeDefined()
})
