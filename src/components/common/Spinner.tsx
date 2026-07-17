import styles from './Spinner.module.css'

export function Spinner() {
  return (
    <div className={styles.wrap} role="status" aria-label="Cargando">
      <div className={styles.ring} />
    </div>
  )
}
