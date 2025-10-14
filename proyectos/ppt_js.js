// Clase principal para el control de la presentación
class PowerPointPresentation {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.slides = [];
        this.maps = {};
        this.isTransitioning = false;
        this.isFullscreen = false;
        
        this.init();
    }
    
    init() {
        // Esperar a que el DOM esté cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupPresentation());
        } else {
            this.setupPresentation();
        }
    }
    
    setupPresentation() {
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        
        this.createNavigationControls();
        this.createSlideIndicators();
        this.setupKeyboardControls();
        this.setupSwipeControls();
        
        // Mostrar primera diapositiva
        this.showSlide(0);
        
        // Cargar mapas después de un delay para mejor performance
        setTimeout(() => this.initializeMaps(), 1000);
        
        console.log('Presentación inicializada con', this.totalSlides, 'diapositivas');
    }
    
    createNavigationControls() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('Botón anterior clickeado');
                this.previousSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('Botón siguiente clickeado');
                this.nextSlide();
            });
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                console.log('Botón pantalla completa clickeado');
                this.toggleFullscreen();
            });
        }
        
        // Actualizar contador
        this.updateSlideCounter();
    }
    
    createSlideIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                console.log('Indicador clickeado:', index);
                this.goToSlide(index);
            });
        });
        
        this.updateIndicators();
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;
            
            console.log('Tecla presionada:', e.key);
            
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides - 1);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.exitFullscreen();
                    break;
                case 'F11':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // Escuchar cambios de fullscreen desde el navegador
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                // Salió de fullscreen
                this.isFullscreen = false;
                document.body.classList.remove('fullscreen-mode');
                // Actualizar transforms de slides para vista normal
                this.slides.forEach(slide => {
                    if (slide.classList.contains('active')) {
                        slide.style.transform = 'translateX(0) scale(0.65)';
                    }
                });
                console.log('Saliendo de modo pantalla completa');
            }
        });
    }
    
    setupSwipeControls() {
        let startX = 0;
        let endX = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            if (this.isTransitioning) return;
            
            endX = e.changedTouches[0].clientX;
            const deltaX = startX - endX;
            
            if (Math.abs(deltaX) > 50) { // Mínimo 50px de swipe
                if (deltaX > 0) {
                    this.nextSlide(); // Swipe izquierda = siguiente
                } else {
                    this.previousSlide(); // Swipe derecha = anterior
                }
            }
        });
    }
    
    showSlide(index) {
        if (index < 0 || index >= this.totalSlides || this.isTransitioning) {
            console.log('showSlide cancelado:', { index, totalSlides: this.totalSlides, isTransitioning: this.isTransitioning });
            return;
        }
        
        console.log('Mostrando slide:', index, 'desde:', this.currentSlide);
        this.isTransitioning = true;
        
        // Determinar dirección de la animación
        const direction = index > this.currentSlide ? 'next' : 'prev';
        
        // Ocultar diapositiva actual con animación lateral
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.remove('active');
            if (direction === 'next') {
                this.slides[this.currentSlide].style.transform = this.isFullscreen ? 
                    'translateX(-200px) scale(1)' : 'translateX(-200px) scale(0.65)';
            } else {
                this.slides[this.currentSlide].style.transform = this.isFullscreen ? 
                    'translateX(200px) scale(1)' : 'translateX(200px) scale(0.65)';
            }
        }
        
        // Preparar nueva diapositiva desde el lado opuesto
        this.currentSlide = index;
        if (direction === 'next') {
            this.slides[this.currentSlide].style.transform = this.isFullscreen ? 
                'translateX(200px) scale(1)' : 'translateX(200px) scale(0.65)';
        } else {
            this.slides[this.currentSlide].style.transform = this.isFullscreen ? 
                'translateX(-200px) scale(1)' : 'translateX(-200px) scale(0.65)';
        }
        
        // Mostrar nueva diapositiva
        setTimeout(() => {
            this.slides[this.currentSlide].classList.add('active');
            this.slides[this.currentSlide].style.transform = this.isFullscreen ? 
                'translateX(0) scale(1)' : 'translateX(0) scale(0.65)';
            
            this.updateSlideCounter();
            this.updateIndicators();
            this.updateNavigationButtons();
            
            // Cargar mapa si es necesario
            this.loadSlideMap(index);
            
            // Permitir nueva transición después de un delay
            setTimeout(() => {
                this.isTransitioning = false;
            }, 300);
        }, 50);
    }
    
    nextSlide() {
        console.log('nextSlide llamado. Current:', this.currentSlide, 'Total:', this.totalSlides);
        if (this.currentSlide < this.totalSlides - 1) {
            this.showSlide(this.currentSlide + 1);
        } else {
            console.log('Ya en la última diapositiva');
        }
    }
    
    previousSlide() {
        console.log('previousSlide llamado. Current:', this.currentSlide);
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        } else {
            console.log('Ya en la primera diapositiva');
        }
    }
    
    goToSlide(index) {
        console.log('goToSlide llamado con index:', index);
        this.showSlide(index);
    }
    
    updateSlideCounter() {
        const currentSlideSpan = document.getElementById('currentSlide');
        const totalSlidesSpan = document.getElementById('totalSlides');
        
        if (currentSlideSpan) {
            currentSlideSpan.textContent = this.currentSlide + 1;
        }
        if (totalSlidesSpan) {
            totalSlidesSpan.textContent = this.totalSlides;
        }
        
        console.log('Slide actualizado:', (this.currentSlide + 1), 'de', this.totalSlides);
    }
    
    updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                this.isFullscreen = true;
                document.body.classList.add('fullscreen-mode');
                // Actualizar transforms de slides para fullscreen
                this.slides.forEach(slide => {
                    if (slide.classList.contains('active')) {
                        slide.style.transform = 'translateX(0) scale(1)';
                    }
                });
                console.log('Entrando en modo pantalla completa');
            }).catch(err => {
                console.error('Error al entrar en pantalla completa:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                this.isFullscreen = false;
                document.body.classList.remove('fullscreen-mode');
                // Actualizar transforms de slides para vista normal
                this.slides.forEach(slide => {
                    if (slide.classList.contains('active')) {
                        slide.style.transform = 'translateX(0) scale(0.65)';
                    }
                });
                console.log('Saliendo de modo pantalla completa');
            }).catch(err => {
                console.error('Error al salir de pantalla completa:', err);
            });
        }
    }
    
    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen().then(() => {
                this.isFullscreen = false;
                document.body.classList.remove('fullscreen-mode');
                // Actualizar transforms de slides para vista normal
                this.slides.forEach(slide => {
                    if (slide.classList.contains('active')) {
                        slide.style.transform = 'translateX(0) scale(0.65)';
                    }
                });
            });
        }
    }
    
    // Inicializar mapas
    initializeMaps() {
        this.initializeInteractiveMap();
        this.initializeComparisonMaps();
        this.initializeObjectivesMap();
        this.initializeResultsMap();
    }
    
    initializeResultsMap() {
        // Mapa para slide 16 de resultados
        const mapContainer = document.getElementById('results-map');
        if (!mapContainer) {
            console.log('Contenedor results-map no encontrado');
            return;
        }
        
        try {
            // Crear mapa centrado en Chile volcánico
            const map = L.map('results-map', {
                center: [-39.5, -72.0],
                zoom: 6,
                zoomControl: true,
                scrollWheelZoom: true
            });
            
            // Agregar capa base
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(map);
            
            // Cargar GeoJSON de accidentes volcánicos
            fetch('ppt/acc_geo.geojson')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error al cargar el GeoJSON: ' + response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('GeoJSON cargado:', data);
                    console.log('Número de features:', data.features.length);
                    
                    L.geoJSON(data, {
                        // Usar las coordenadas LAT/LONG del properties en vez del geometry
                        pointToLayer: function(feature, latlng) {
                            // Crear punto usando LAT y LONG de properties
                            const lat = feature.properties.LAT;
                            const lon = feature.properties.LONG;
                            const tipoAccid = feature.properties.Tipo_accid;
                            
                            if (lat && lon) {
                                const newLatLng = L.latLng(lat, lon);
                                
                                // Diferenciar colores y tamaños según tipo de accidente
                                let color, radius;
                                if (tipoAccid === 'ESTR') {
                                    // Estratovolcanes: rojo, más grande
                                    color = '#fb5a5a';
                                    radius = 4.5;
                                } else {
                                    // Otros: celeste, más pequeño
                                    color = '#0ed3e4';
                                    radius = 3;
                                }
                                
                                return L.circleMarker(newLatLng, {
                                    radius: radius,
                                    fillColor: color,
                                    color: '#000',
                                    weight: 1,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            }
                            return null;
                        },
                        onEachFeature: function(feature, layer) {
                            if (feature.properties) {
                                let popupContent = '<div style="font-size: 14px;">';
                                if (feature.properties.Toponimo) {
                                    popupContent += `<b>${feature.properties.Toponimo}</b><br>`;
                                }
                                if (feature.properties.Tipo_accid) {
                                    popupContent += `Tipo: ${feature.properties.Tipo_accid}<br>`;
                                }
                                if (feature.properties.Actividad) {
                                    popupContent += `Actividad: ${feature.properties.Actividad}<br>`;
                                }
                                popupContent += '</div>';
                                layer.bindPopup(popupContent);
                            }
                        }
                    }).addTo(map);
                    
                    console.log('GeoJSON de accidentes añadido al mapa correctamente');
                })
                .catch(error => {
                    console.error('Error cargando GeoJSON:', error);
                });
            
            // Guardar referencia
            this.maps['results-map'] = map;
            
            console.log('Mapa de resultados inicializado correctamente');
            
            // Forzar recalculo del tamaño del mapa
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
            
        } catch (error) {
            console.error('Error inicializando mapa de resultados:', error);
        }
    }
    
    initializeObjectivesMap() {
        // Mapa para slide de objetivos
        const mapContainer = document.getElementById('objectives-map');
        if (!mapContainer) return;
        
        // Crear mapa básico para mostrar área de estudio
        const map = L.map('objectives-map', {
            center: [-39.0, -72.0], // Centro de Chile volcánico
            zoom: 7,
            zoomControl: true
        });
        
        // Agregar capa base
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);
        
        // Agregar algunos marcadores de volcanes principales
        const volcanes = [
            { name: 'Villarrica', lat: -39.4207, lng: -71.9370 },
            { name: 'Llaima', lat: -38.6920, lng: -71.7290 },
            { name: 'Osorno', lat: -41.1020, lng: -72.4930 },
            { name: 'Calbuco', lat: -41.3260, lng: -72.6170 }
        ];
        
        volcanes.forEach(volcan => {
            L.marker([volcan.lat, volcan.lng])
                .addTo(map)
                .bindPopup(`<strong>${volcan.name}</strong><br>Volcán activo`);
        });
        
        this.maps.objectives = map;
    }
    
    initializeInteractiveMap() {
        // Mapa interactivo para diapositiva 3
        const mapContainer = document.getElementById('interactive-map');
        if (!mapContainer) return;
        
        // Crear mapa Leaflet
        const map = L.map('interactive-map', {
            center: [-33.4489, -70.6693], // Santiago
            zoom: 12,
            zoomControl: true
        });
        
        // Agregar capa base CartoDB Positron
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);
        
        // Cargar datos GeoJSON de hexágonos
        this.loadHexagonData(map);
        
        this.maps.interactive = map;
    }
    
    initializeComparisonMaps() {
        // Mapa 2D para comparación
        const map2DContainer = document.getElementById('map-2d');
        if (map2DContainer) {
            const map2D = L.map('map-2d', {
                center: [-33.4489, -70.6693],
                zoom: 12,
                zoomControl: true
            });
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map2D);
            
            this.loadHexagonData(map2D);
            this.maps.comparison2D = map2D;
        }
        
        // Iframe para mapa 3D
        const map3DContainer = document.getElementById('map-3d');
        if (map3DContainer) {
            const iframe = document.createElement('iframe');
            iframe.src = '../hexagonos_uf_3d.html';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';
            map3DContainer.appendChild(iframe);
        }
    }
    
    loadHexagonData(map) {
        // Cargar archivo GeoJSON
        fetch('../hexagonos_uf.geojson')
            .then(response => response.json())
            .then(data => {
                // Transformar coordenadas si es necesario
                const transformedData = this.transformCoordinates(data);
                
                // Agregar capa de hexágonos
                const hexagonLayer = L.geoJSON(transformedData, {
                    style: (feature) => this.getHexagonStyle(feature),
                    onEachFeature: (feature, layer) => {
                        const props = feature.properties;
                        const popupContent = `
                            <div style="font-family: 'Noto Sans', sans-serif;">
                                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Datos del Hexágono</h4>
                                <p style="margin: 5px 0;"><strong>Valor UF/M²:</strong> ${props.uf_m2 || 'N/A'}</p>
                                <p style="margin: 5px 0;"><strong>ID:</strong> ${props.id || 'N/A'}</p>
                            </div>
                        `;
                        layer.bindPopup(popupContent);
                    }
                });
                
                hexagonLayer.addTo(map);
                
                // Ajustar vista al extent de los datos
                map.fitBounds(hexagonLayer.getBounds(), { padding: [20, 20] });
            })
            .catch(error => {
                console.error('Error cargando datos GeoJSON:', error);
            });
    }
    
    transformCoordinates(geojsonData) {
        // Función para transformar de EPSG:3857 a WGS84
        const transform = (coord) => {
            const x = coord[0];
            const y = coord[1];
            
            const lon = (x / 20037508.34) * 180;
            let lat = (y / 20037508.34) * 180;
            lat = 180/Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI/180)) - Math.PI/2);
            
            return [lon, lat];
        };
        
        // Clonar datos para no modificar el original
        const transformedData = JSON.parse(JSON.stringify(geojsonData));
        
        // Transformar coordenadas de cada feature
        transformedData.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                feature.geometry.coordinates = feature.geometry.coordinates.map(ring => 
                    ring.map(coord => transform(coord))
                );
            }
        });
        
        return transformedData;
    }
    
    getHexagonStyle(feature) {
        const ufValue = feature.properties.uf_m2 || 0;
        
        // Escala de colores basada en valor UF/M²
        let fillColor = '#3498db'; // Color por defecto
        let fillOpacity = 0.7;
        
        if (ufValue > 50) {
            fillColor = '#e74c3c'; // Rojo para valores altos
        } else if (ufValue > 30) {
            fillColor = '#f39c12'; // Naranja para valores medios-altos
        } else if (ufValue > 20) {
            fillColor = '#f1c40f'; // Amarillo para valores medios
        } else if (ufValue > 10) {
            fillColor = '#2ecc71'; // Verde para valores medios-bajos
        } else {
            fillColor = '#3498db'; // Azul para valores bajos
        }
        
        return {
            fillColor: fillColor,
            weight: 1,
            opacity: 0.8,
            color: '#34495e',
            fillOpacity: fillOpacity
        };
    }
    
    loadSlideMap(slideIndex) {
        // Cargar mapas específicos cuando se navega a ciertas diapositivas
        switch(slideIndex) {
            case 2: // Diapositiva de mapa interactivo
                if (this.maps.interactive) {
                    setTimeout(() => {
                        this.maps.interactive.invalidateSize();
                    }, 100);
                }
                break;
            case 3: // Diapositiva de comparación
                if (this.maps.comparison2D) {
                    setTimeout(() => {
                        this.maps.comparison2D.invalidateSize();
                    }, 100);
                }
                break;
            case 3: // Diapositiva de objetivos con mapa
                if (this.maps.objectives) {
                    setTimeout(() => {
                        this.maps.objectives.invalidateSize();
                    }, 100);
                }
                break;
        }
    }
}

// Funciones auxiliares
function formatNumber(num) {
    return new Intl.NumberFormat('es-CL').format(num);
}

function createLegend(map) {
    const legend = L.control({ position: 'bottomright' });
    
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'legend');
        div.style.background = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        div.style.fontFamily = "'Noto Sans', sans-serif";
        div.style.fontSize = '12px';
        
        div.innerHTML = `
            <h4 style="margin: 0 0 10px 0;">Valor UF/M²</h4>
            <div><span style="background: #e74c3c; width: 15px; height: 15px; display: inline-block; margin-right: 8px;"></span> > 50</div>
            <div><span style="background: #f39c12; width: 15px; height: 15px; display: inline-block; margin-right: 8px;"></span> 30-50</div>
            <div><span style="background: #f1c40f; width: 15px; height: 15px; display: inline-block; margin-right: 8px;"></span> 20-30</div>
            <div><span style="background: #2ecc71; width: 15px; height: 15px; display: inline-block; margin-right: 8px;"></span> 10-20</div>
            <div><span style="background: #3498db; width: 15px; height: 15px; display: inline-block; margin-right: 8px;"></span> < 10</div>
        `;
        
        return div;
    };
    
    legend.addTo(map);
}

// Inicializar presentación cuando se cargue la página
let presentation;
document.addEventListener('DOMContentLoaded', () => {
    presentation = new PowerPointPresentation();
});

// Hacer la presentación accesible globalmente para debugging
window.presentation = presentation;
