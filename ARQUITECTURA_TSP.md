# Arquitectura y mapa de evolución del laboratorio TSP

## Auditoría inicial

El informe `Optimización_2026_2.pdf` no se encontró en el workspace. Por ello no se puede verificar la matriz del caso, las rutas, los resultados atribuidos al informe ni su notación. Los valores mencionados en la solicitud son afirmaciones pendientes de cotejo, no resultados calculados aquí.

La aplicación actual es estática y funciona con rutas relativas para GitHub Pages. `index.html` contiene 19 pantallas; `styles.css` controla presentación y adaptación; `app.js` gestiona navegación, visualizaciones y laboratorio; `tsp-engine.js` separa lectura TSPLIB EUC_2D, distancias redondeadas, validación de rutas, vecino más cercano y 2-opt simétrico. Se conservan `berlin52` y `eil51`, con óptimos de referencia documentados en README. El laboratorio admite carga de instancias, reproducción e historial de 2-opt. La visualización de ACO calcula probabilidades didácticas y no ejecuta una colonia. No se hallaron los datos ni figuras experimentales originales.

## Arquitectura propuesta

- Datos: instancias verificables y metadatos de procedencia, separados de coordenadas ilustrativas.
- Motor: funciones puras para validar, calcular costos y ejecutar algoritmos; eventos inmutables con estados intermedios y semilla explícita.
- Ejecución: worker para búsquedas costosas, límites por método y cancelación; animación independiente de los cálculos.
- Interfaz: siete capítulos, navegación accesible, reproducción desde historial y controles que invocan operaciones reales.
- Pruebas: validación de permutaciones y costos independientes; comparación exhaustiva en instancias pequeñas; reproducibilidad de algoritmos aleatorios.
- Proveniencia: marcar resultados del informe, ejemplos didácticos, cálculos reproducibles y experimentos pendientes de forma diferenciada.

## Mapa propuesto

1. Curiosidad: portada, desafío interactivo, reglas del TSP.
2. Dificultad: grafo, simetría, crecimiento factorial, modelo y complejidad.
3. Exactos: panorama, fuerza bruta, Held–Karp, branch and bound.
4. Heurísticas: vecino más cercano, inserción más barata, 2-opt, óptimo local.
5. Metaheurísticas: exploración y explotación, recocido, genéticos, construcción y aprendizaje ACO, comparación.
6. Caso del informe: contexto y matriz, ruta inicial, comparación, simulación reproducible ACO, resultado. Su contenido numérico requiere cotejar el PDF.
7. Elección y exploración: comparación de métodos, laboratorio TSPLIB, preguntas abiertas.

## Dependencias y verificaciones por fase

1. Auditoría: contrastar el PDF completo y registrar páginas, matriz, secuencias y fórmulas antes de atribuirlas al informe.
2. Navegación: probar teclado, índice, foco, móvil y movimiento reducido.
3. Fundamentos y exactos: verificar fórmulas y resultados contra enumeración pequeña.
4. Heurísticas y metaheurísticas: validar rutas, costos, historial y semillas; comprobar que los parámetros afectan al motor.
5. Caso: recalcular todos los recorridos con la matriz original; cotejar el óptimo mediante enumeración.
6. Laboratorio: preservar TSPLIB, archivos locales e historial 2-opt, y declarar métodos no implementados.
7. Calidad: pruebas automatizadas, navegador en escritorio y móvil, accesibilidad, rendimiento y despliegue estático.
