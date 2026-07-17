import { About } from '../components/home/About'
import { SkillBars } from '../components/home/SkillBars'
import { EducationTimeline } from '../components/home/EducationTimeline'
import { ExperienceCard } from '../components/home/ExperienceCard'
import styles from './HomePage.module.css'

export default function HomePage() {
  return (
    <>
      <About />
      <section className={`container ${styles.eduSkills}`} id="cv" aria-label="Educación y habilidades">
        <div>
          <h2 className="sectionTitle">Educación</h2>
          <EducationTimeline />
        </div>
        <div>
          <h2 className="sectionTitle">Habilidades</h2>
          <SkillBars />
        </div>
      </section>
      <ExperienceCard />
    </>
  )
}
