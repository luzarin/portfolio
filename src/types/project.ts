export interface ProjectMeta {
  slug: string
  title: string
  summary: string
  /** Ruta relativa a public/, ej. 'imagenes/proyecto1.jpg'. Sin imagen → placeholder. */
  cardImage?: string
}

export interface Skill {
  name: string
  /** Nivel 0..1 usado como --level en la barra. */
  level: number
}

export interface EducationItem {
  school: string
  degree: string
  field: string
  period: string
  place: string
  url: string
  logo: string
}

export interface Experience {
  company: string
  role: string
  period: string
  place: string
  tools: string
  logo: string
  url: string
  bullets: string[]
}
