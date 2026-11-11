# Presentación interactiva TSP · DS2011 · UTEC 2026-II

Presentación académica sobre el problema del vendedor viajante: formulación, métodos exactos, heurísticas, metaheurísticas y una demostración 2-opt con instancias TSPLIB95. Las rutas, costos y decisiones se calculan en el navegador.

## Tecnologías y estructura

HTML, CSS y módulos JavaScript nativos; Node.js para pruebas y build estático. No se requieren bibliotecas de ejecución ni servicios externos.

```text
index.html                  Entrada de la presentación
src/js/                     Navegación, demostraciones, configuración y motor TSP
src/css/                    Estilos
public/assets/              Logotipo y datos TSPLIB95
scripts/                    Build y servidor de prueba de producción
tests/                      Pruebas matemáticas y comprobaciones de navegador
docs/                       Informe y auditorías históricas
.github/workflows/pages.yml Build y despliegue de GitHub Pages
dist/                       Salida generada, no versionada
```

## Desarrollo local

Requisitos: Node.js 22 o posterior y Python 3 para el servidor estático. El proyecto no tiene dependencias npm de ejecución; no es necesario instalar paquetes para usarlo, compilarlo o ejecutar las pruebas matemáticas.

```sh
npm test
npm run build
npm run serve
```

Abrir `http://localhost:8000/`. Utilizar HTTP: los módulos y la carga de instancias no deben abrirse con `file://`. El build genera `dist/` sin rutas absolutas. Para servir la salida desde la raíz: `python -m http.server 8000 --directory dist`.

Las pruebas de interfaz históricas de `tests/` requieren Playwright y Chrome, además de un servidor en el puerto indicado en cada script; algunas fueron escritas para Windows y flujos anteriores. Las pruebas matemáticas incluidas en `npm test` comprueban rutas, trazas, reproducibilidad y ambas instancias.

## Navegación y demostraciones

- Flechas izquierda y derecha: diapositiva anterior o siguiente. Espacio también avanza; Home y End van a los extremos.
- M abre el índice; Escape lo cierra. F activa o desactiva pantalla completa.
- Las animaciones y simulaciones se inician al entrar y se detienen al salir; la presentación nunca cambia sola de diapositiva.
- `src/js/config.js` define `DEFAULT_DEMO_DURATION` (30 000 ms). Las trazas largas muestran una selección de estados reales; las cortas distribuyen sus movimientos en ese intervalo.
- En TSPLIB95, ejecutar, pausar, continuar, avanzar, retroceder, cambiar velocidad, instancia u origen y cargar `.tsp` tienen prioridad sobre el autoplay. La velocidad inicial se estima a partir de los movimientos 2-opt reales. El tiempo mostrado mide cálculo, no animación.

La demo utiliza la distancia EUC_2D redondeada por arista y conserva historial. Las referencias óptimas son berlin52 = 7 542 y eil51 = 426; los archivos propios no reciben un óptimo supuesto. Las simulaciones estocásticas usan semillas reproducibles. El resultado 2-opt es un óptimo local, no una garantía global.

## Publicar en GitHub Pages

1. Revisar cambios y ejecutar `npm test` y `npm run build`.
2. Crear un commit y hacer push a `main` cuando se desee publicar.
3. En GitHub, abrir **Settings → Pages** y seleccionar **GitHub Actions** como origen.
4. El workflow `Deploy GitHub Pages` ejecuta pruebas y build, y publica `dist/` tras el push a `main`; también puede lanzarse desde Actions con `workflow_dispatch`.
5. Abrir `https://USUARIO.github.io/NOMBRE_REPOSITORIO/`. Todas las referencias son relativas y funcionan en la subruta del repositorio.

La publicación requiere permisos de Pages en el repositorio. `node_modules/`, `dist/` y las capturas locales están excluidos por `.gitignore`.

## Datos y referencias

Las instancias incorporadas proceden de [TSPLIB95](https://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp/tspindex.html). El [informe del proyecto](docs/Optimización_2026_2.pdf) y las auditorías anteriores se conservan en `docs/`. Las expresiones de inserción, 2-opt, Held–Karp, recocido y ACO siguen las secciones 3.1–3.3 del informe.
