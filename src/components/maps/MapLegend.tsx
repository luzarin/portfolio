import type { CSSProperties } from 'react'
import styles from './MapLegend.module.css'

type Props = {
  title: string
  /** `line`: alto en px del swatch de línea (para jerarquías tipo Strahler). Sin `line`, swatch cuadrado. */
  items: { color: string; label: string; line?: number }[]
  position?: 'bottomright' | 'bottomleft'
}

export function MapLegend({ title, items, position = 'bottomright' }: Props) {
  return (
    <div className={`${styles.legend} ${position === 'bottomleft' ? styles.left : ''}`}>
      <h6 className={styles.title}>{title}</h6>
      {items.map((it) => (
        <div key={it.label} className={styles.item}>
          <i
            className={it.line ? styles.line : styles.swatch}
            style={{ '--swatch': it.color, '--line-h': `${it.line ?? 0}px` } as CSSProperties}
          />
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  )
}
