import { education } from '../../data/education'
import styles from './EducationTimeline.module.css'

export function EducationTimeline() {
  return (
    <div className={styles.card}>
      {education.map((e) => (
        <article key={e.field} className={styles.row}>
          <a href={e.url} target="_blank" rel="noopener noreferrer" className={styles.logoLink}>
            <img className={styles.logo} src={e.logo} alt={`Logo ${e.school}`} loading="lazy" />
          </a>
          <div>
            <div className={styles.school}>{e.school}</div>
            <div className={styles.degree}>{e.degree}</div>
            <div className={styles.field}>{e.field}</div>
            <div className={styles.meta}>
              <span>{e.period}</span> • <span>{e.place}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
