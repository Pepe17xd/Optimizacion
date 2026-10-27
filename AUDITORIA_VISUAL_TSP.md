# Auditoría visual y técnica de la presentación web TSP

**Fecha:** 27 de octubre de 2026  
**Alcance:** inspección estática de `index.html`, `styles.css`, `app.js`, `README.md` y `results/`. No se modificó ningún archivo de la presentación.

## A. Diagnóstico general

La presentación tiene una identidad oscura consistente, una estructura autónoma de HTML/CSS/JavaScript y una navegación por teclado implementada. El contenido cubre conceptualmente los 13 bloques solicitados, distribuidos en **18 diapositivas**: introducción y escala; métodos y familias; modelo y calibración; pipeline, semillas y validación; demo, defensa, cierre y fuentes. La expansión permite desarrollar los temas, aunque la agenda agrupa el material en cinco secciones y no comunica el total de diapositivas.

Los principales riesgos comprobables desde el código son: controles e indicaciones permanentes, una diferencia importante entre el comportamiento desktop y móvil, dependencia de cuatro imágenes ausentes, algunas etiquetas muy pequeñas en CSS y contenido de resultados cuya procedencia se describe como datos compartidos pero no se verifica en este paquete. La demo incorporada es explícitamente sintética; no ejecuta berlin52 ni eil51.

**Límite de la auditoría visual:** intenté abrir el HTML local con el control de navegador disponible. La política del navegador rechazó la URL `file://`; no intenté eludir esa restricción. Por ello no pude renderizar ni capturar la presentación y no afirmo haber probado visualmente sus diapositivas, dimensiones, animaciones o errores de ejecución. Las observaciones de tamaño y desbordamiento que siguen son riesgos derivados de CSS/HTML y necesitan confirmación visual.

## B. Problemas y hallazgos

Gravedad: **Alta** = afecta navegación, contenido central o expectativa principal; **Media** = afecta legibilidad, consistencia o mantenimiento; **Baja** = mejora opcional.

| Gravedad | Archivo / selector o función | Diapositiva(s) | Hallazgo y efecto | Recomendación |
|---|---|---|---|---|
| Alta | `index.html`: `.topbar`, `#overviewBtn`, `#fullscreenBtn`, `.kbd-hint`, `footer.nav`, `.nav-help` | Todas | La barra superior, el aviso de flechas y el pie fijo con botones, contador y “NAVEGAR” están siempre presentes en escritorio. Contradice el requisito de no mostrar controles/instrucciones permanentes y reserva zonas visuales sobre el contenido. | Retirar los controles fijos visibles durante la exposición. Mantener flechas, espacio y F; ofrecer el índice como panel bajo demanda y un control discreto solo al mover el puntero o enfocar el borde, si se necesita ratón. |
| Alta | `styles.css`: `@media(max-width:900px)`; `app.js`: `goTo()` | Todas en móvil | En móvil todas las `.slide` pasan a `position:relative; display:block`; las teclas siguen cambiando `active`, pero `goTo()` solo pone `scrollTop=0` en la sección y no la lleva al viewport (`scrollIntoView`). Por tanto, teclas/índice pueden actualizar hash, progreso y estado sin mostrar la diapositiva seleccionada. | Definir un único modo móvil: navegación secuencial que desplace la sección activa a la vista, o documento continuo que no simule selección única al pulsar flechas. Verificar también navegación por fragmento. |
| Alta | `index.html`: cuatro atributos `data-figure`; `results/figures/` | `exactos`, `heuristicas`, `meta`, `calibracion` | El directorio contiene solo `README.txt`; faltan `explosion_combinatoria.png`, `ruta_berlin52_nearest_neighbor+2opt.png`, `gap_por_algoritmo.png` y `calibracion_hormigas_beta.png`. El fallback está previsto y marcado como conceptual, pero las visualizaciones experimentales reales no se muestran. | Incorporar las figuras originales con los nombres previstos, o conservar explícitamente los esquemas conceptuales y ajustar la promesa de estas diapositivas. No convertir los esquemas en datos ni inventar resultados. |
| Alta | `index.html`: `#demo`; `app.js`: `resetDemo()`, `twoOpt()` | `demo` | El widget resuelve 13 puntos sintéticos generados en el cliente. El texto aclara esta limitación, pero el título “DEMO INTERACTIVA · TSP DIDÁCTICO” y los pasos previos pueden hacer esperar una demostración de las instancias del proyecto. No carga archivos `.tsp` ni presenta mediciones de TSPLIB95. | Distinguir con más claridad la demo ilustrativa de una demo experimental, y alinear el texto de los pasos con lo que el widget realmente ejecuta. Si se agrega una demo real, usar datos y resultados verificables. |
| Media | `styles.css`: `.hero-caption`, `.source-line`, `.tag`, `.benchmark-bottom`, `.pipeline small`, `.figure-fallback > small`, `.figure-legend`, `.demo-widget > p` | `inicio`, `datos`, `exactos`, `pipeline`, `demo`, `fuentes` | Hay tipografía de 9–13 px para rótulos y anotaciones; en particular el subtítulo de portada es 9 px y anotaciones de figuras 12 px. En proyección o a distancia pueden perder legibilidad, pese al cuerpo principal mayor. | Elevar anotaciones informativas a un rango legible (aprox. 14–16 px), manteniendo solo microdetalles decorativos por debajo. Revisar contraste y lectura a escala de proyección. |
| Media | `styles.css`: `h1`, `h2`, `.slide-inner`, `.slide`, `.figure`, `.pipeline`, breakpoints a 900/580 px | Principalmente `indice`, `exactos`, `heuristicas`, `meta`, `calibracion`, `pipeline`, `demo`, `fuentes` | El título de diapositiva usa `clamp(36px,4.1vw,67px)`, superando la guía orientativa de 36–44 px en anchos medios/grandes. El contenido se centra verticalmente dentro de un área calculada como `100vh - 192px`; los gráficos tienen altura mínima de 320 px. En 1366×768 y 1280×720, la combinación puede producir scroll interno, densidad o solapamiento con el pie fijo. No se pudo confirmar renderizado. | Usar jerarquía de títulos de diapositiva más cercana a 36–44 px, y validar cada slide a 1920×1080, 1366×768 y 1280×720. En pantallas bajas, priorizar alineación superior y desplazamiento natural, con espacio seguro para navegación. |
| Media | `index.html`: slides `meta`, `exactos`, `heuristicas`, `calibracion`; fallback CSS | `exactos`, `heuristicas`, `meta`, `calibracion` | Los gráficos alternativos son esquemas sin escala, longitudes de barras conceptuales y una ruta sintética. Se etiquetan como conceptuales, lo cual evita presentarlos como mediciones, pero ocupan espacio de gráfico sin aportar resultados comparables. | Mantener sus avisos visibles y de tamaño legible. Si la charla necesita resultados, sustituirlos solo por gráficos procedentes del experimento y con ejes/unidades/fuente. |
| Media | `index.html`: diapositivas `exactos`, `heuristicas`, `meta`, `fuentes` | Resultados y validación | Se afirma equivalencia de óptimos para 8–10 ciudades, resultados 8 980/7 967 en berlin52 y menor gap cualitativo del recocido. La diapositiva de fuentes dice que provienen de datos facilitados al proyecto; en este checkout no hay tablas ni figuras fuente que permitan auditarlos. No son verificables en este paquete. | Conservar la atribución y añadir referencia al artefacto de datos/código de origen cuando esté disponible. No presentar el texto como resultado reproducido por esta página. |
| Media | `styles.css`: `@import` de Google Fonts | Todas | DM Sans y Manrope se cargan desde Google Fonts por red. Existe fallback `system-ui`, así que la página no depende de ellas para funcionar, pero sin acceso externo la apariencia y los saltos de línea pueden cambiar. | Considerar alojar fuentes con licencia compatible en el repositorio o aceptar documentadamente el fallback; verificar carga y composición sin conexión. |
| Media | `app.js`: listener `keydown`, `goTo()` y `history.replaceState()` | Todas, sobre todo `defensa` y `demo` | El listener implementa flechas, espacio, M, F, Home y End; los requisitos de flechas/espacio/F están cubiertos por código. Escape queda a cargo del navegador para salir de pantalla completa y cierra el índice si está abierto. Sin embargo, el estado del índice no gestiona foco como diálogo y `replaceState` reemplaza el fragmento actual, por lo que atrás/adelante no recorre las slides. | Añadir gestión de foco y semántica de diálogo al índice; definir comportamiento de historial. Proteger navegación de teclado mientras se interactúan controles y detalles. Mantener Escape compatible con fullscreen nativo. |
| Baja | `index.html`: 18 `<section class="slide">`; `#indice`; contador inicial | Todas | El guion pedido de 13 bloques está presente por tema, pero son 18 slides. La agenda ofrece 5 grupos y el contador HTML inicial dice `01 / 17`; JS lo corrige al inicializar, así que el número incorrecto es solo el estado previo a la ejecución. | Documentar la duración/agrupación de las 18 slides y actualizar el contador estático para que no parpadee un total obsoleto antes de JS. |
| Baja | `app.js`: construcción de `#overviewLinks`; `index.html`: `#overview` | Índice | La lista usa botones generados y se oculta con `aria-hidden`, pero el contenedor no tiene `role="dialog"`/nombre accesible ni devuelve el foco al botón que lo abrió. | Mejorar el patrón accesible del índice: diálogo modal o panel no modal coherente, foco inicial, Escape y retorno de foco. |
| Baja | `app.js`: `heroPath.animate()`; `styles.css`: `prefers-reduced-motion` | `inicio`, transiciones | CSS reduce animaciones y transiciones para `prefers-reduced-motion`; la ruta de portada también usa la Web Animations API directamente y no consulta esa preferencia. La mayoría de efectos son breves, pero esa animación no sigue completamente la preferencia. | Omitir o acortar `heroPath.animate()` cuando `matchMedia('(prefers-reduced-motion: reduce)')` sea verdadero. |

### Inventario y arquitectura

- `index.html` concentra las 18 slides, los SVG estáticos, controles, widget de canvas y estructura del índice en líneas muy extensas. La edición y revisión de contenido es difícil; no se observa plantilla/componentización HTML.
- `styles.css` está casi enteramente minificado en una sola línea y combina tokens, componentes y breakpoints en un único archivo. Hay un tema central mediante variables, pero varias reglas de color, tamaños y espaciado siguen siendo valores directos; eleva el costo de mantenimiento y de detectar cascadas.
- `app.js` agrupa navegación, índice, fullscreen, dibujos SVG, demo canvas y optimización 2-opt en un solo script sin módulos. La reutilización de utilidades es acotada; no se identificó una duplicación masiva, pero sí estilos/componentes de fallback mantenidos en bloque.
- La navegación usa un índice de slide global. En escritorio, CSS muestra una sola slide; en móvil, convierte el deck en páginas apiladas. Esa divergencia requiere tratamiento explícito en lógica y accesibilidad.

### Contenido y secuencia

La secuencia académica solicitada está cubierta semánticamente, con desgloses adicionales:

1. Portada (`inicio`); 2. índice (`indice`); 3. introducción (`problema`, `escala`); 4. TSPLIB95 (`datos`); 5. métodos exactos (`exactos`); 6. heurísticas (`heuristicas`); 7. metaheurísticas (`meta`); 8. función de costo (`costo`); 9. calibración (`calibracion`); 10. pipeline (`pipeline`); 11. robustez/resultados/validación (`semillas`, `validacion` y contenido de métodos); 12. demostración (`demo`); 13. conclusiones y referencias (`defensa`, `cierre`, `fuentes`).

No detecté una sección académica entera ausente. La diapositiva `defensa` añade preguntas frecuentes y `cierre` un resumen; no son redundantes estrictos, aunque junto con `fuentes` extienden el cierre. El hueco principal es de evidencia reproducible: este checkout no incluye los cuatro PNG ni artefactos de resultados, y la demo es sintética.

## C. Evidencia visual

No hay capturas adjuntas: la navegación del navegador rechazó la apertura local `file://` por política. Por esa razón no inspeccioné visualmente las 18 diapositivas ni las resoluciones indicadas. La tabla de problemas identifica los selectores y el contenido HTML que fundamentan la revisión estática; las estimaciones de riesgo de overflow deben verificarse en un navegador antes de decidir cambios de layout.

### Matriz de verificación visual pendiente

| Tamaño | Estado | Aspectos a comprobar |
|---|---|---|
| 1920×1080 | No renderizado | Balance de portada, espacio vacío por el ancho máximo de 1160 px, escala de gráficos y tamaño de rótulos. |
| 1366×768 | No renderizado | Slides densas, espacio disponible bajo títulos, scroll interno y relación con el pie fijo. |
| 1280×720 | No renderizado | Desbordes verticales/horizontales, fórmulas, comparativos y pipeline. |
| Móvil (referencia sugerida: 390×844) | No renderizado | Orden en scroll, navegación por teclas/hash, tablas/gráficos, botones táctiles y persistencia de barra superior. |

## D. Recomendaciones concretas

1. Resolver primero el modelo de navegación: eliminar controles persistentes visibles en modo presentación, mantener teclado y abrir índice bajo demanda; definir una conducta móvil coherente.
2. Conseguir las cuatro figuras originales o mantener los fallbacks claramente conceptuales. Añadir atribución a datos fuente de resultados proporcionados, sin recalcular ni asumir métricas.
3. Ajustar el sistema tipográfico: títulos de slide en torno a 36–44 px según espacio, cuerpo con línea cómoda y anotaciones legibles; conservar la paleta oscura teal/ámbar y bajar adornos de 9 px que contengan información.
4. Verificar overflow y proporciones por diapositiva en los cuatro tamaños solicitados. Simplificar o reordenar únicamente los bloques que efectivamente fallen, sin borrar contenido académico.
5. Mejorar accesibilidad del índice/foco y contemplar la animación de portada bajo reducción de movimiento. Mantener el foco visible ya presente para botones, enlaces y `summary`.
6. Ordenar el código en una pasada posterior: formatear HTML/CSS/JS, separar estilos base/componentes/responsive y aislar navegación de visualizaciones, sin introducir una cadena de build innecesaria para GitHub Pages.

## E. Prioridades

### Críticas

- Corregir la navegación móvil para que una tecla o selección de índice lleve realmente al contenido activo.
- Quitar u ocultar controles e instrucciones persistentes conforme al diseño de presentación solicitado.
- Resolver la ausencia de figuras experimentales o hacer explícito que se entrega una versión con esquemas conceptuales.

### Importantes

- Validar visualmente slides densas y layout en 1920×1080, 1366×768, 1280×720 y móvil.
- Subir tamaños de rótulos informativos; ajustar jerarquía de títulos y espacio vertical donde el render confirme problemas.
- Clarificar el alcance sintético de la demo y la trazabilidad de resultados aportados.
- Hacer que el índice administre foco/semántica y respetar reducción de movimiento en la animación JS.

### Opcionales

- Decidir si la navegación debe usar el historial del navegador.
- Formatear/separar archivos extensos y homogeneizar valores CSS en tokens.
- Revisar si el total de 18 diapositivas y el desglose en agenda reflejan el tiempo de exposición esperado.

## F. Plan de implementación

1. **Acordar comportamiento de presentación:** navegación por teclado, índice bajo demanda y política móvil (slides secuenciales o scroll continuo).
2. **Cerrar evidencia de resultados:** reunir PNG/datos originales y sus fuentes; conservar disclaimers para valores provistos y demo sintética.
3. **Estabilizar navegación y accesibilidad:** foco, Escape, hash/historial y movimiento reducido.
4. **Ajustar tipografía y layout** a partir de capturas renderizadas de cada slide en escritorio grande, laptop, 720p y móvil; corregir solo desbordes y densidades observados.
5. **Ordenar arquitectura sin cambiar identidad:** formatear archivos, agrupar CSS y separar los subsistemas JS para que los cambios sean localizados.
6. **Verificar GitHub Pages:** abrir la ruta publicada o un servidor de vista previa permitido, revisar consola/recursos y enlaces, probar navegación directa por fragmento y confirmar el fallback si falta una figura.

### Compatibilidad GitHub Pages: revisión estática

- **Rutas:** `styles.css`, `app.js` y los PNG usan rutas relativas a la raíz de la página; son adecuadas si se publica la estructura descrita en `README.md`.
- **Backend/build:** no se requieren backend ni pasos de build; la página es estática.
- **Fuentes:** Google Fonts requiere acceso de red, con fallback local declarado.
- **Enlaces externos:** la fuente TSPLIB abre en pestaña nueva y declara `rel="noopener"`.
- **Navegación directa:** `app.js` lee el fragmento inicial y ofrece IDs por slide; `history.replaceState` actualiza la URL. No se verificó la página en GitHub Pages.
- **JavaScript y animaciones:** existe lógica de carga de figuras con fallback, SVG generado y canvas; no se ejecutó JS en navegador, por lo que no se pueden descartar errores de runtime. `prefers-reduced-motion` está en CSS, con la salvedad de la animación JS de portada.
- **Accesibilidad básica:** hay `lang="es"`, viewport, etiquetas ARIA puntuales, texto alternativo y estilos `:focus-visible`; quedan por mejorar el diálogo del índice, el foco y el patrón móvil.

## G. Actualización de implementación y verificación · 27 de octubre de 2026

### Cambios realizados

- Se integró el PNG institucional sin editarlo. Propiedades locales: 1024 × 607 px, RGBA con transparencia; su arte original es oscuro y se invierte/aclarea solo mediante CSS para mostrarlo sobre el fondo oscuro.
- El encabezado incluye identidad de curso, contador, índice y fullscreen; se añadieron flechas de navegación en pantalla. El índice implementa semántica de diálogo, ciclo de foco, cierre por Escape y retorno de foco. La navegación por hash y las teclas solicitadas se mantienen. En móvil, `goTo()` desplaza la slide activa a la vista.
- La demo sintética anterior se sustituyó por coordenadas oficiales de berlin52 y eil51, parser local `.tsp`, matriz simétrica EUC_2D con redondeo `floor(d + 0.5)`, rutas completas verificables, vecino más cercano, 2-opt por delta de cuatro aristas, origen seleccionable, costo, gap, reducción y tiempo de ejecución.
- El motor quedó separado en `tsp-engine.js`. La demo enseña el historial del costo y marca las dos aristas eliminadas y las dos añadidas en el último movimiento 2-opt.
- Se sustituyeron afirmaciones sin trazabilidad por esquemas rotulados como conceptuales o por avisos de procedencia pendiente. Los resultados aportados se conservaron claramente separados del cálculo de la demo.
- Se verificaron metadatos y DOI de las seis referencias clásicas y se añadieron citas en los bloques correspondientes. Se descargaron solo `berlin52.tsp` y `eil51.tsp` desde el archivo oficial de TSPLIB95.

### Verificación efectuada

- `node --check app.js` y `node --check tsp-engine.js`: sin errores de sintaxis.
- Prueba local del motor en Node 24.13.0: dimensiones (52/51), tipo EUC_2D, simetría y diagonal cero; vecino más cercano y 2-opt. berlin52: 8 980 → 7 842 en 11 movimientos. eil51: 511 → 435 en 9 movimientos. Todas las mejoras aceptadas redujeron estrictamente el costo y los tours validaron una visita por ciudad con cierre al origen.
- Pruebas del parser: archivo vacío, tipo de peso no admitido, ID repetido y dimensión inconsistente fueron rechazados. Casos de distancia 1,4 y 1,5 confirmaron redondeo TSPLIB (1 y 2); el costo de la ruta de tres puntos confirmó el retorno al origen.
- Chrome local a 1536 × 770: se recorrieron las 18 diapositivas; no se detectó desbordamiento horizontal. Presentación, logo y recursos del motor cargaron; los cuatro PNG experimentales siguen ausentes y se mostraron sus fallbacks conceptuales. No aparecieron errores ni advertencias en la consola.
- En Chrome se verificaron flechas en pantalla, selección desde el índice, navegación por `Home`, `End`, flechas, `M` y `Escape`, actualización de hash/contador y recuperación de foco. El encabezado precisó `pointer-events:auto` para que el índice y fullscreen fueran clicables.
- La UI de la demo confirmó los mismos costos, gap y reducciones: berlin52 8 980 → 7 842, gap 3,98 %, reducción 12,67 %; eil51 511 → 435, gap 2,11 %, reducción 14,87 %.
- El API de pantalla completa no está disponible en este Chrome de prueba (`requestFullscreen` no existe); la interacción se dejó implementada y su prueba visual queda pendiente en un navegador con esa capacidad.

### Pendientes y límites

- No se probó Edge ni fue posible fijar los viewports de 1920 × 1080, 1366 × 768, 1280 × 720 y 390 × 844 desde la interfaz de navegador disponible. La comprobación de overflow cubre un viewport de 1536 × 770 y se inspeccionaron las reglas CSS de los breakpoints; la matriz completa de resoluciones permanece pendiente.
- Las diapositivas `datos`, `exactos`, `heuristicas` y `demo` requieren algo de scroll vertical en el viewport comprobado (aprox. +45, +33, +32 y +169 px). La bibliografía se reorganizó en dos columnas y ya cabe en ese viewport. El modo móvil conserva scroll vertical por diseño.
- No hay datos tabulares ni figuras originales que permitan reproducir el experimento de 8 980/7 967, tiempos, calibración, ni la comparación entre metaheurísticas. El valor 8 980 sí coincide con vecino más cercano berlin52 desde ID 1 en el motor actualizado; el 7 967 no coincide: el 2-opt reproducido obtiene 7 842. La cifra 7 967 necesita semilla/ruta, versión de código o explicación de otra convención.
- No se implementan fuerza bruta, Held–Karp, recocido simulado, algoritmo genético ni ACO; sus diapositivas son explicaciones teóricas, no resultados del paquete.
- `.git` no permitió crear rama ni restaurar el índice (permiso denegado al crear `.git/index.lock`). Se generó `prechange-tracked-snapshot.zip` desde el commit original `HEAD` para preservar la línea base rastreada; el logo UTEC, que ya era un archivo no rastreado, se dejó intacto.
