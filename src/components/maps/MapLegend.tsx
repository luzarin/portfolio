import type { CSSProperties } from 'react'
import styles from './MapLegend.module.css'

type Props = {
  title: string
  items: { color: string; label: string }[]
}

export function MapLegend({ title, items }: Props) {
  return (
    <div className={styles.legend}>
      <h6 className={styles.title}>{title}</h6>
      {items.map((it) => (
        <div key={it.label} className={styles.item}>
          <i className={styles.swatch} style={{ '--swatch': it.color } as CSSProperties} />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  )
}
