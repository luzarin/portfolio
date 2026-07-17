import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ProjectsGrid } from './ProjectsGrid'
import { projects } from '../../data/projects'

test('renderiza las 6 cards con link a su ruta', () => {
  render(
    <MemoryRouter>
      <ProjectsGrid />
    </MemoryRouter>,
  )
  const links = screen.getAllByRole('link', { name: /ver más/i })
  expect(links).toHaveLength(6)
  expect(links[0]).toHaveAttribute('href', `/proyectos/${projects[0].slug}`)
})
