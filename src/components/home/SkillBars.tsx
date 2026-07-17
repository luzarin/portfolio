import type { CSSProperties } from 'react'
import { skills } from '../../data/skills'
import styles from './SkillBars.module.css'

export function SkillBars() {
  return (
    <div className={styles.card}>
      {skills.map((s) => (
        <div key={s.name} className={styles.skill} style={{ '--level': s.level } as CSSProperties}>
          <div className={styles.name}>{s.name}</div>
          <div className={styles.bar}>
            <div className={styles.fill} />
          </div>
        </div>
      ))}
    </div>
  )
}
