import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

vi.mock('./pages/registry', () => ({
  projectPages: { demo: () => <h1>Pagina Demo</h1> },
}))

test('home renderiza layout', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )
  expect(screen.getByRole('navigation')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})

test('ruta de proyecto resuelve por slug', async () => {
  render(
    <MemoryRouter initialEntries={['/proyectos/demo']}>
      <App />
    </MemoryRouter>,
  )
  expect(await screen.findByRole('heading', { name: /pagina demo/i })).toBeInTheDocument()
})

test('slug desconocido redirige al home', async () => {
  render(
    <MemoryRouter initialEntries={['/proyectos/nada']}>
      <App />
    </MemoryRouter>,
  )
  expect(await screen.findByRole('navigation')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: /pagina demo/i })).not.toBeInTheDocument()
})
