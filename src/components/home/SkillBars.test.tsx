import { render, screen } from '@testing-library/react'
import { SkillBars } from './SkillBars'
import { skills } from '../../data/skills'

test('renderiza una barra por skill', () => {
  render(<SkillBars />)
  for (const s of skills) expect(screen.getByText(s.name)).toBeInTheDocument()
})
