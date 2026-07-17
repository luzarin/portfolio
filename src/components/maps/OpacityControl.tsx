import { useId } from 'react'
import styles from './OpacityControl.module.css'

type Props = {
  /** 0..100 */
  value: number
  onChange: (value: number) => void
  label?: string
}

export function OpacityControl({ value, onChange, label = 'Cambiar transparencia' }: Props) {
  const id = useId()
  return (
    <div className={styles.control}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={styles.value}>{value}%</span>
    </div>
  )
}
