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

En la diapositiva **Demo**, los controles permiten reiniciar la misma ruta, calcular vecino mas cercano, ejecutar/pausar/continuar, avanzar o retroceder movimientos 2-opt y ajustar la pausa visual. La duracion mostrada mide solo computo, no animacion. El mapa, el gap y la grafica se actualizan al aceptar cada intercambio. Tambien se puede cargar un archivo `.tsp` EUC_2D.

El motor está separado en `tsp-engine.js` y aplica la distancia TSPLIB `nint(sqrt(dx² + dy²))` por arista. Valida dimensión, IDs, coordenadas y la ruta como permutación completa; el cierre del tour se incluye al sumar la última arista al origen. 2-opt evalúa movimientos con el cambio de cuatro aristas y acepta el mejor movimiento de cada pasada.

Los dos archivos de datos se descargaron de [TSPLIB95, servidor de la Universidad de Heidelberg](https://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp/ALL_tsp.tar.gz) el 27 de octubre de 2026. El óptimo de referencia (berlin52 = 7 542; eil51 = 426) está publicado en el [listado oficial de soluciones](https://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp/TSP-BEST.html). Los óptimos solo se asocian a las instancias incorporadas; un archivo local subido por el usuario no recibe automáticamente esa referencia.

SHA-256 de los archivos extraídos:

- `berlin52.tsp`: `8496A5838133E3C3EB25A9FA8893B1AC302593FC8DC325350643A0CABD8ABADC`
- `eil51.tsp`: `66C05AD077FFD64D5778E358BBD16BE049F8C8AE880CBD24F034487331D1CCCE`

Una corrida determinista desde ciudad TSPLIB ID 1 produjo berlin52: 8 980 ? 7 842 (11 movimientos 2-opt) y eil51: 511 ? 435 (9 movimientos). Sus gaps finales son 3,98 % y 2,11 % respecto de los ?ptimos publicados; son resultados did?cticos de una corrida por instancia, no una comparaci?n estad?stica ni un benchmark de tiempos. El 7 967 queda como resultado aportado anteriormente y no reproducido.

## Figuras y resultados experimentales

El repositorio original no contiene los cuatro PNG indicados por versiones anteriores (`explosion_combinatoria.png`, `ruta_berlin52_nearest_neighbor+2opt.png`, `gap_por_algoritmo.png`, `calibracion_hormigas_beta.png`) ni los datos tabulares/código que los originaron. Sus espacios en diapositivas se marcan como conceptuales o pendientes, sin inventar escalas.

El valor 7 967 y las comparaciones previas entre metaheur?sticas fueron aportados al proyecto y no se reproducen en esta demo; faltan semilla, ruta, configuraci?n, mediciones y archivos de origen.

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
- No se ejecutan fuerza bruta, Held-Karp, recocido simulado ni algoritmo genetico. El control ACO calcula probabilidades de una eleccion didactica, no una colonia completa.
- Verificaci?n de esta actualizaci?n: `node --check` para ambos m?dulos; parser y motor Node con las dos instancias, redondeo EUC_2D, rutas, diferencias incrementales y entradas malformadas; Chrome local para resultados, mapa, demo 2-opt, retroceso, avance, pausa, reanudaci?n, hash, teclado e ?ndice. Sin errores de consola.
- En Chrome se verificaron 1920 ? 1080, 1366 ? 768, 1280 ? 720 y 390 ? 844: sin overflow horizontal ni desbordamiento interno de diapositivas. Edge y pantalla completa no se pudieron confirmar. La carga de archivos locales no pudo probarse porque la extensi?n de Chrome bloquea file chooser; el parser s? se prob? directamente. Consulta [AUDITORIA_VISUAL_TSP.md](AUDITORIA_VISUAL_TSP.md).
- Las figuras originales y la reproducibilidad de los resultados aportados siguen pendientes de recibir los artefactos del experimento.

## Visualizaciones interactivas

La diapositiva de escala calcula exactamente (n-1)!/2 con BigInt y muestra el crecimiento en eje logaritmico. El control ACO calcula probabilidades normalizadas para un escenario numerico didactico; no ejecuta una colonia completa ni representa resultados experimentales. Los datos experimentales y PNG ausentes siguen pendientes de incorporar con procedencia trazable.

La presentaci?n tiene 19 diapositivas, incluida una explicaci?n gr?fica de 2-opt. El protocolo de 30 semillas permanece planificado; no se afirma que haya sido ejecutado.
