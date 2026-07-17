import styles from './EmbedFrame.module.css'

type Props = { src: string; title: string; height?: number }

export function EmbedFrame({ src, title, height = 650 }: Props) {
  return <iframe className={styles.frame} src={src} title={title} height={height} loading="lazy" />
}
