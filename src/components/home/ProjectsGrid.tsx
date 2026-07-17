import { projects } from '../../data/projects'
import { ProjectCard } from './ProjectCard'
import styles from './ProjectsGrid.module.css'

export function ProjectsGrid() {
  return (
    <section className="container" id="projects" aria-labelledby="projects-title">
      <h2 id="projects-title" className="sectionTitle">
        Proyectos
      </h2>
      <div className={styles.grid}>
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  )
}
