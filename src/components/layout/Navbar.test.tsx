import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { Navbar } from './Navbar'

test('toggle del menu movil', async () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  )
  const btn = screen.getByRole('button', { name: /abrir menú/i })
  expect(btn).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(btn)
  expect(btn).toHaveAttribute('aria-expanded', 'true')
  await userEvent.click(document.body)
  expect(btn).toHaveAttribute('aria-expanded', 'false')
})
