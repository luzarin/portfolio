import type { EducationItem } from '../types/project'

const LOGO_UC =
  'https://upload.wikimedia.org/wikipedia/commons/8/84/Escudo_de_la_Pontificia_Universidad_Cat%C3%B3lica_de_Chile.svg'

export const education: EducationItem[] = [
  {
    school: 'Pontificia Universidad Católica de Chile',
    degree: 'Grado',
    field: 'Geógrafo Profesional y Licenciado en Geografía',
    period: '2020 - 2025',
    place: 'Santiago, Chile',
    url: 'https://geografia.uc.cl/licenciatura-y-titulo-profesional-del-geografo/',
    logo: LOGO_UC,
  },
  {
    school: 'Pontificia Universidad Católica de Chile',
    degree: 'Certificado Académico',
    field: 'Certificado Académico en Estudios Urbano-Regionales',
    period: '2020 - 2024',
    place: 'Santiago, Chile',
    url: 'https://www.uc.cl/',
    logo: LOGO_UC,
  },
]
