import { render, screen } from '@testing-library/react'
import App from './App'

test('renderiza el titulo', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /portafolio/i })).toBeInTheDocument()
})
