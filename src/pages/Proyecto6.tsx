import { ProjectLayout } from './ProjectLayout'
import { ImageGallery } from '../components/common/ImageGallery'
import { asset } from '../lib/asset'
import styles from './Proyecto6.module.css'

const IMAGES = [
  {
    src: asset('imagenes/proyecto6.jpg'),
    alt: 'Catastro de concesiones mineras',
    caption: 'Catastro de concesiones mineras del área de interés.',
  },
  {
    src: asset('imagenes/proyecto6-1.jpg'),
    alt: 'Área de interés del catastro de propiedad minera',
    caption: 'Área de interés para el catastro de propiedad minera.',
  },
]

export default function Proyecto6() {
  return (
    <ProjectLayout slug="catastro-minero">
      <ImageGallery images={IMAGES} />
      <div className={styles.content}>
        <h2>Resumen del Proyecto</h2>
        <p>
          Trabajo desarrollado en el curso de Taller de Análisis Territorial de la UC, compuesto por
          dos TP complementarios orientados al sector minero: el primero centrado en el catastro y
          análisis de propiedad minera (exploración, explotación, pedimentos, manifestaciones y
          mensuras) para caracterizar el estado jurídico del subsuelo y los actores titulares; y el
          segundo enfocado en el catastro de terrenos superficiales, actos administrativos, tierras
          indígenas, concesiones marítimas, IPT y restricciones normativas, con el fin de evaluar la
          viabilidad territorial de un proyecto minero–desaladora. Ambos trabajos integran
          recopilación de información oficial, análisis espacial en SIG y construcción de una base
          territorial validada para apoyar decisiones de inversión y planificación.
        </p>
        <p>
          Las tareas ejecutadas consolidan capacidades en catastro minero y superficial, análisis
          normativo y de planificación territorial, levantamiento de actores y restricciones,
          integración jurídica-territorial en SIG, elaboración de geodatabases, síntesis espacial
          aplicada a proyectos, y diseño de metodologías operativas propias de consultoría
          (planificación, presupuestos, logística de terreno y estructuración de entregables).
        </p>
      </div>
    </ProjectLayout>
  )
}
