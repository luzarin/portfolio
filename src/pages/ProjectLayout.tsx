import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { getProject } from '../data/projects'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import styles from './ProjectLayout.module.css'

type Props = { slug: string; children: ReactNode }

export function ProjectLayout({ slug, children }: Props) {
  const project = getProject(slug)
  return (
    <div className={`container ${styles.page}`}>
      <Link to="/" className={styles.back}>
        ← Volver
      </Link>
      <h1 className={styles.title}>{project?.title ?? 'Proyecto'}</h1>
      <ErrorBoundary
        fallback={
          <p className={styles.error}>
            Ocurrió un error mostrando este proyecto. Probá recargar la página.
          </p>
        }
      >
        {children}
      </ErrorBoundary>
    </div>
  )
}
