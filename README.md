# Presentación interactiva: TSP · DS2011 · UTEC 2026-II

Presentación científica estática en HTML, CSS y JavaScript nativo. No requiere compilación, frameworks ni backend. Está preparada para GitHub Pages.

## Abrir la presentación

- **GitHub Pages:** publica la raíz del repositorio desde `main` en Settings → Pages.
- **Vista local:** desde esta carpeta ejecuta `python -m http.server 8000` y abre `http://localhost:8000`. El servidor solo entrega archivos estáticos; ES modules y `fetch()` no funcionan de forma portable al abrir `index.html` como `file://`.

## Navegación

- `←` / `→`: diapositiva anterior/siguiente; `Home` / `End`: extremos del deck.
- `M`: abrir el índice; `Escape`: cerrarlo.
- `F`: pantalla completa.
- Botones de flecha en pantalla: navegación con ratón o táctil.
- En pantallas estrechas, las diapositivas forman un documento vertical y la navegación lleva la actual a la vista.

La presentación respeta `prefers-reduced-motion`. El panel del índice administra el foco y la URL conserva el ID de diapositiva actual.

## Demo reproducible

En la diapositiva **Demo** se cargan las coordenadas oficiales de `results/berlin52.tsp` y `results/eil51.tsp`. La demo permite cambiar la instancia y el origen, reiniciar una ruta determinista, ejecutar vecino más cercano y 2-opt, cargar otro `.tsp` `EUC_2D`, ver el historial del costo y consultar duración, reducción porcentual y gap cuando existe un óptimo conocido.

El motor está separado en `tsp-engine.js` y aplica la distancia TSPLIB `nint(sqrt(dx² + dy²))` por arista. Valida dimensión, IDs, coordenadas y la ruta como permutación completa; el cierre del tour se incluye al sumar la última arista al origen. 2-opt evalúa movimientos con el cambio de cuatro aristas y acepta el mejor movimiento de cada pasada.

Los dos archivos de datos se descargaron de [TSPLIB95, servidor de la Universidad de Heidelberg](https://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp/ALL_tsp.tar.gz) el 27 de octubre de 2026. El óptimo de referencia (berlin52 = 7 542; eil51 = 426) está publicado en el [listado oficial de soluciones](https://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp/TSP-BEST.html). Los óptimos solo se asocian a las instancias incorporadas; un archivo local subido por el usuario no recibe automáticamente esa referencia.

SHA-256 de los archivos extraídos:

- `berlin52.tsp`: `8496A5838133E3C3EB25A9FA8893B1AC302593FC8DC325350643A0CABD8ABADC`
- `eil51.tsp`: `66C05AD077FFD64D5778E358BBD16BE049F8C8AE880CBD24F034487331D1CCCE`

Una comprobación determinista del motor con origen TSPLIB ID 1 produjo 8 980 → 7 842 (berlin52, 11 movimientos 2-opt) y 511 → 435 (eil51, 9 movimientos). Son resultados de una corrida didáctica ejecutada por esta implementación; no son una comparación estadística ni mediciones de tiempo publicables. El 8 980 aportado para berlin52 coincide con este recorrido de vecino más cercano; el 7 967 aportado no coincide con el resultado de 2-opt reproducido aquí y sigue pendiente de explicación.

## Figuras y resultados experimentales

El repositorio original no contiene los cuatro PNG indicados por versiones anteriores (`explosion_combinatoria.png`, `ruta_berlin52_nearest_neighbor+2opt.png`, `gap_por_algoritmo.png`, `calibracion_hormigas_beta.png`) ni los datos tabulares/código que los originaron. Sus espacios en diapositivas se marcan como conceptuales o pendientes, sin inventar escalas.

Los valores berlin52 = 8 980 (vecino más cercano) y 7 967 (tras 2-opt), y cualquier comparación previa entre metaheurísticas, fueron aportados al proyecto. **Pendientes de verificación independiente:** faltan semilla, ciudad inicial, código, mediciones y artefactos de origen. No describen la demo que corre en el navegador.

## Referencias académicas verificadas

- Reinelt, G. (1991). “TSPLIB—A Traveling Salesman Problem Library.” *ORSA Journal on Computing*, 3(4), 376–384. [DOI: 10.1287/ijoc.3.4.376](https://doi.org/10.1287/ijoc.3.4.376).
- Held, M. & Karp, R. (1962). “A Dynamic Programming Approach to Sequencing Problems.” *Journal of the Society for Industrial and Applied Mathematics*, 10(1), 196–210. [DOI: 10.1137/0110015](https://doi.org/10.1137/0110015).
- Croes, G. A. (1958). “A Method for Solving Traveling-Salesman Problems.” *Operations Research*, 6(6), 791–812. [DOI: 10.1287/opre.6.6.791](https://doi.org/10.1287/opre.6.6.791).
- Kirkpatrick, S., Gelatt, C. D. & Vecchi, M. P. (1983). “Optimization by Simulated Annealing.” *Science*, 220(4598), 671–680. [DOI: 10.1126/science.220.4598.671](https://doi.org/10.1126/science.220.4598.671).
- Dorigo, M., Maniezzo, V. & Colorni, A. (1996). “Ant System: Optimization by a Colony of Cooperating Agents.” *IEEE Transactions on Systems, Man, and Cybernetics—Part B*, 26(1), 29–41. [DOI: 10.1109/3477.484436](https://doi.org/10.1109/3477.484436).
- Dantzig, G., Fulkerson, R. & Johnson, S. (1954). “Solution of a Large-Scale Traveling-Salesman Problem.” *Journal of the Operations Research Society of America*, 2(4), 393–410. [DOI: 10.1287/opre.2.4.393](https://doi.org/10.1287/opre.2.4.393).

## Verificación técnica y pendientes

- El proyecto conserva HTML/CSS/JS estáticos, no usa librerías externas para el cálculo y las rutas a recursos son relativas.
- La descarga de datos oficiales y verificación de metadatos bibliográficos se hizo durante la actualización. Las métricas de la demo se calcularon en cliente; los tiempos no son comparaciones entre equipos.
- La presentación no ejecuta Held–Karp, fuerza bruta, recocido simulado, algoritmo genético ni ACO. Sus esquemas no son una simulación de esos algoritmos.
- Verificación local: sintaxis de ambos módulos JavaScript; pruebas del motor/parser descritas arriba; demo y navegación probadas en Chrome a 1536 × 770; las 18 diapositivas recorridas sin desbordamiento horizontal y sin errores de consola. Los fallbacks de las cuatro figuras faltantes se activan.
- No se pudo probar Edge ni fijar 1920 × 1080, 1366 × 768, 1280 × 720 o 390 × 844 desde la interfaz de navegador disponible. La pantalla completa tampoco se ejecutó: `requestFullscreen` no existe en ese Chrome de prueba. Consulta [AUDITORIA_VISUAL_TSP.md](AUDITORIA_VISUAL_TSP.md) para el detalle y los desbordes verticales observados.
- Las figuras originales y la reproducibilidad de los resultados aportados siguen pendientes de recibir los artefactos del experimento.
