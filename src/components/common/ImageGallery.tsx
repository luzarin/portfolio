import { useEffect, useState } from 'react'
import styles from './ImageGallery.module.css'

type GalleryImage = { src: string; alt: string; caption?: string }

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<GalleryImage | null>(null)

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active])

  return (
    <>
      <div className={styles.grid}>
        {images.map((img) => (
          <figure key={img.src} className={styles.figure}>
            <button
              className={styles.zoomBtn}
              onClick={() => setActive(img)}
              aria-label={`Ampliar: ${img.alt}`}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
            </button>
            {img.caption && <figcaption>{img.caption}</figcaption>}
          </figure>
        ))}
      </div>
      {active && (
        <div
          className={styles.modal}
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <figure className={styles.modalFigure}>
            <img src={active.src} alt={active.alt} />
            {active.caption && <figcaption>{active.caption}</figcaption>}
          </figure>
        </div>
      )}
    </>
  )
}
