# Presentación web · TSP

Presentación interactiva estática de HTML + CSS + JavaScript. No requiere build, Node ni backend.

## Publicar en GitHub Pages

1. Sube `index.html`, `styles.css`, `app.js` y la carpeta `results/` a la raíz de un repositorio público.
2. En el repositorio abre **Settings → Pages → Build and deployment**.
3. Selecciona **Deploy from a branch**, rama `main`, carpeta `/ (root)`; guarda.
4. Abre la dirección de GitHub Pages mostrada en Settings.

## Figuras del proyecto

Los archivos deben ir exactamente en `results/figures/`:

- `explosion_combinatoria.png`
- `ruta_berlin52_nearest_neighbor+2opt.png`
- `gap_por_algoritmo.png`
- `calibracion_hormigas_beta.png`

Sin ellos se muestran visuales **expresamente señalados como conceptuales**, nunca mediciones inventadas.

## Controles

- Flechas izquierda/derecha, espacio: navegación
- `M`: índice global
- `F`: pantalla completa
- `Home` / `End`: primera / última diapositiva
- En móvil, las diapositivas quedan una debajo de otra y se recorren con scroll.

## Nota metodológica

Los óptimos berlin52 = 7542 y eil51 = 426 proceden de TSPLIB95. Las cifras 8980 y 7967 fueron proporcionadas para este proyecto, no verificadas por ejecución en este paquete. La demo visual usa datos sintéticos independientes de TSPLIB95.
