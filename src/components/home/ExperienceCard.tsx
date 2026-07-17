import { experience } from '../../data/experience'
import styles from './ExperienceCard.module.css'

export function ExperienceCard() {
  return (
    <section className="container" aria-labelledby="exp-title">
      <h2 id="exp-title" className="sectionTitle">
        Experiencia Laboral
      </h2>
      {experience.map((exp) => (
        <article key={exp.company + exp.period} className={styles.card}>
          <div className={styles.left}>
            <a href={exp.url} target="_blank" rel="noopener noreferrer">
              <img className={styles.logo} src={exp.logo} alt={`Logo ${exp.company}`} loading="lazy" />
            </a>
            <h3 className={styles.company}>{exp.company}</h3>
            <div className={styles.role}>{exp.role}</div>
            <div className={styles.meta}>{exp.period}</div>
            <div className={styles.meta}>{exp.place}</div>
            <div className={styles.tools}>{exp.tools}</div>
          </div>
          <ul className={styles.bullets}>
            {exp.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  )
}
