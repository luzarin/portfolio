import { Link } from 'react-router'
import type { ProjectMeta } from '../../types/project'
import { asset } from '../../lib/asset'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <article className={styles.card}>
      {project.cardImage ? (
        <img
          className={styles.image}
          src={asset(project.cardImage)}
          alt={project.title}
          loading="lazy"
        />
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          <span>{project.title.slice(0, 1)}</span>
        </div>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.summary}>{project.summary}</p>
        <Link
          to={`/proyectos/${project.slug}`}
          className={styles.more}
          aria-label={`Ver más: ${project.title}`}
        >
          Ver Más →
        </Link>
      </div>
    </article>
  )
}
