import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ProjectsGrid } from './ProjectsGrid'
import { projects } from '../../data/projects'

test('renderiza una card con link por cada proyecto', () => {
  render(
    <MemoryRouter>
      <ProjectsGrid />
    </MemoryRouter>,
  )
  const links = screen.getAllByRole('link', { name: /ver más/i })
  expect(links).toHaveLength(projects.length)
  expect(links[0]).toHaveAttribute('href', `/proyectos/${projects[0].slug}`)
})
