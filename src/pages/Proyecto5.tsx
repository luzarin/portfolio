import { useState } from 'react'
import { ProjectLayout } from './ProjectLayout'
import { MapPanel } from '../components/common/MapPanel'
import { LeafletMap } from '../components/maps/LeafletMap'
import { GeoRasterLayer } from '../components/maps/GeoRasterLayer'
import { MapLegend } from '../components/maps/MapLegend'
import { asset } from '../lib/asset'
import { buildColorRamp, rampLegendItems } from '../lib/colorRamp'
import styles from './Proyecto5.module.css'

const CENTER: [number, number] = [-33.605828, -70.709793]

const RASTERS = [
  {
    key: 'lst',
    title: 'Temperatura Superficial (LST)',
    url: 'datos/proyecto-5/LST_RM.tif',
    min: 10,
    max: 45,
    palette: [
      '#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf',
      '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026',
    ],
    legendTitle: 'LST (°C)',
    format: (v: number) => `${v.toFixed(1)} °C`,
  },
  {
    key: 'uhi',
    title: 'Isla de Calor Urbana (UHI)',
    url: 'datos/proyecto-5/UHI_RM.tif',
    min: -3,
    max: 3,
    palette: ['#313695', '#4575b4', '#abd9e9', '#ffffbf', '#fdae61', '#f46d43', '#d73027'],
    legendTitle: 'UHI (σ)',
    format: (v: number) => `${v.toFixed(1)} σ`,
  },
  {
    key: 'utfvi',
    title: 'Índice de Varianza del Campo Térmico (UTFVI)',
    url: 'datos/proyecto-5/UTFVI_RM.tif',
    min: -3,
    max: 3,
    palette: ['#313695', '#74add1', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#b10026'],
    legendTitle: 'UTFVI',
    format: (v: number) => v.toFixed(1),
  },
]

function RasterPanel({ raster }: { raster: (typeof RASTERS)[number] }) {
  const [loading, setLoading] = useState(true)
  const colorFn = buildColorRamp(raster.min, raster.max, raster.palette)
  return (
    <MapPanel title={raster.title} loading={loading}>
      <LeafletMap center={CENTER} zoom={9} baseLayer="carto-light" height={520}>
        <GeoRasterLayer
          url={asset(raster.url)}
          pixelValuesToColorFn={(values) => colorFn(values[0])}
          opacity={0.9}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />
        <MapLegend
          title={raster.legendTitle}
          items={rampLegendItems(raster.min, raster.max, raster.palette, raster.format)}
          position="bottomleft"
        />
      </LeafletMap>
    </MapPanel>
  )
}

export default function Proyecto5() {
  return (
    <ProjectLayout slug="lst-uhi-rm">
      <div className={styles.layout}>
        <div className={styles.maps}>
          {RASTERS.map((r) => (
            <RasterPanel key={r.key} raster={r} />
          ))}
        </div>
        <div className={styles.text}>
          <h2>Resumen del Proyecto</h2>
          <p>
            Para elaborar este proyecto se utilizó como metodología el paper "Leveraging cloud-based
            computing and spatial modeling approaches for land surface temperature disparities in
            response to land cover change" de Waleed y Sajjad (2022).
          </p>
          <p>
            Primero, se cargó el área de estudio desde un asset y se estableció el rango temporal
            para el verano del hemisferio sur 2024-2025.
          </p>
          <p>
            Segundo, se establecieron dos funciones de preprocesamiento, siendo la primera la que
            aplica los factores de escala de Landsat 8, transformando las bandas ópticas a
            reflectancia física y las térmicas a temperatura de brillo en Kelvin mediante los
            multiplicadores y offsets provistos por el dataset. La segunda función generó la máscara
            de nubes/sombras mediante la interpretación bit a bit de la banda QA_PIXEL, manteniendo
            solamente los píxeles despejados. Estas funciones permiten transformar los valores
            digitales (DN) crudos en datos físicamente consistentes y sin nubes/sombras.
          </p>
          <p>
            Tercero, se construyó el mosaico de trabajo, donde se filtró la colección de Landsat 8
            por geometría y fecha, se aplicaron las funciones de escala y máscara a cada escena y
            luego se tomó la mediana temporal para obtener una imagen representativa. El resultado
            se recortó al polígono de la Región Metropolitana al ser esta el área de análisis.
          </p>
          <p>
            Cuarto, con la imagen procesada se calculó el NDVI a partir de las bandas de
            reflectancia superficial, y de la cual se obtuvieron dos parámetros biofísicos
            esenciales: la proporción de vegetación (Pv = (NDVImax − NDVImin / NDVI − NDVImin)²;
            normalizada 0-1 y utilizando los valores min-max del NDVI de toda la RM) y la emisividad
            superficial (ε=0.986+0.004Pv), derivada mediante una relación lineal estandarizada.
            Luego, se extrajo la banda térmica reescalada y se aplicó una corrección atmosférica
            simplificada para convertir la temperatura de brillo en temperatura superficial (LST) en
            grados Celsius, integrando la emisividad en el cálculo.
          </p>
          <p>
            Una vez obtenido el LST, se extrajeron estadísticas descriptivas sobre la RM: media,
            desviación estándar, valores extremos y percentiles. Estas estadísticas permitieron
            construir índices derivados. El Urban Heat Island (UHI) se definió como la
            estandarización de la LST respecto a la media regional, expresada en desviaciones
            estándar, lo cual permite identificar píxeles relativamente más cálidos/más fríos que el
            entorno. El Urban Thermal Field Variance Index (UTFVI) se definió como la desviación
            relativa del LST respecto a la media, normalizada por el propio valor de LST, indicador
            usado frecuentemente para evaluar la variabilidad térmica urbana con énfasis en el
            riesgo ambiental.
          </p>
          <p>
            Cada uno de estos tres productos (LST, UHI y UTFVI) se visualizó con paletas térmicas
            apropiadas y posteriormente se configuró su exportación a Google Drive en formato
            GeoTIFF con proyección UTM 19S (EPSG: 5361) y de 30m de resolución.
          </p>
          <p>
            Finalmente, se generaron visualizaciones analíticas en la consola: histogramas que
            muestran la distribución de LST y UHI en la RM, y un diagrama de dispersión NDVI–LST
            construido a partir de una muestra aleatoria de píxeles, el cual permite observar la
            relación inversa típica entre vegetación y temperatura superficial, reforzando la
            interpretación ecológica del modelo térmico desarrollado.
          </p>
          <h2>Más Información</h2>
          <p>
            <a
              href="https://github.com/luzarin/LST-UHI-UTFVI-Landsat8"
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 GitHub
            </a>
          </p>
        </div>
      </div>
    </ProjectLayout>
  )
}
