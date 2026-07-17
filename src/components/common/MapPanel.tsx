import type { ReactNode } from 'react'
import { Spinner } from './Spinner'
import styles from './MapPanel.module.css'

type Props = {
  title: string
  children: ReactNode
  loading?: boolean
  /** Slot para controles (ej. OpacityControl) debajo del mapa. */
  control?: ReactNode
}

export function MapPanel({ title, children, loading = false, control }: Props) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.body}>
        {children}
        {loading && (
          <div className={styles.overlay}>
            <Spinner />
          </div>
        )}
      </div>
      {control && <div className={styles.control}>{control}</div>}
    </section>
  )
}
