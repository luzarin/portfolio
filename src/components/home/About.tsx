import { useEffect, useState } from 'react'
import { asset } from '../../lib/asset'
import styles from './About.module.css'

const FOTO = asset('imagenes/perfil.JPEG')

export function About() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <section className={`container ${styles.section}`} id="about" aria-labelledby="about-title">
      <h2 id="about-title" className="sectionTitle">
        Sobre mí
      </h2>
      <div className={styles.grid}>
        <button
          className={styles.photoBtn}
          onClick={() => setOpen(true)}
          aria-label="Ampliar foto de perfil"
        >
          <img className={styles.photo} src={FOTO} alt="Foto de perfil" />
        </button>
        <div className={styles.bio}>
          <p>
            Geógrafo especializado en análisis espacial, teledetección y gestión de datos
            geoespaciales. Experiencia en el desarrollo de scripts para automatizar procesos SIG,
            administración de bases de datos espaciales y despliegue de servicios OGC.
          </p>
          <p>
            Actualmente enfocado en construir soluciones técnicas eficientes para la gestión,
            análisis y distribución de información territorial.
          </p>
        </div>
      </div>
      {open && (
        <div className={styles.modal} onClick={() => setOpen(false)} role="dialog" aria-modal="true">
          <img src={FOTO} alt="Foto de perfil ampliada" className={styles.modalImg} />
        </div>
      )}
    </section>
  )
}
