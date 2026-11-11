# Auditoría visual y pedagógica · fase 1

Fuente principal: Optimización_2026_2.pdf, secciones 1–6 y referencias. El documento de arquitectura anterior señala que el PDF faltaba; esa observación ya no es vigente. La presentación actual consta de 30 pantallas generadas desde index.html y learning.js. Las demostraciones usan detailed-demos.js y tsp-engine.js; app.js integra navegación, escala y laboratorio TSPLIB.

## Mapa y diagnóstico por diapositiva

| # | Pantalla | Información esencial del informe / revisión |
|---|---|---|
| 1 | Inicio | Formular el objetivo: ruta cerrada de menor costo. Portada actualizada. |
| 2 | Reto | Aplicación de §6: almacén, cinco clientes y matriz ficticia. Posiciones esquemáticas; interacción preservada. |
| 3 | Reglas | §2: visitar cada nodo una vez, regresar y minimizar; factibilidad no implica optimalidad. |
| 4 | Grafo | §2: nodos, aristas, costos y ciclo hamiltoniano. Los costos no se deducen de las posiciones. |
| 5 | Simetría | §2 tabla 1: igualdad de costos en ambos sentidos frente al caso asimétrico. |
| 6 | Escala | §2.2: (n−1)!/2 para simétrico, inicio fijo y recorridos inversos equivalentes. Gráfico logarítmico explícito. |
| 7 | Modelo | §2.1: objetivo, restricciones de grado y eliminación de subtours. El texto plegado es denso y necesita jerarquía visual posterior. |
| 8 | Familias | §3: exactos certifican, heurísticas y metaheurísticas no garantizan óptimo. Evitar afirmar que toda metaheurística escapa siempre de óptimos locales. |
| 9–11 | Fuerza bruta, Held–Karp, branch and bound | §3.1: enumeración, subproblemas y poda con cotas. Las trazas necesitan revisión de legibilidad y carga cognitiva. |
| 12–15 | Vecino, inserción, 2-opt, óptimo local | §3.2: construcción, mejora y límite de vecindad. Dar prioridad a comparaciones de rutas y cambio de aristas. |
| 16–21 | Equilibrio, recocido, genético, hormigas, feromonas y comparación | §3.3 y §5: exploración/explotación, aceptación probabilística, población y feromona. Hormigas y feromonas repiten título y simulación; diferenciarlas pedagógicamente en una fase posterior. |
| 22–26 | Caso, referencia, comparación, evolución y resultado | §6: matriz ficticia, 40,3 km, 24,9 km y 38,21 % de reducción de distancia; el óptimo se verifica por fuerza bruta. La simulación reproducible no es el registro histórico. |
| 27 | Elección | §3 y §5: relacionar garantía, calidad y costo computacional sin afirmar un orden universal de rendimiento. |
| 28 | Laboratorio | TSPLIB y 2-opt: fuente externa al caso del informe, datos y óptimos identificados por instancia. Controles densos; requiere revisión posterior. |
| 29–30 | Preguntas y cierre | Extensiones y conclusión: calidad y costo de búsqueda. Evitar repetir formulaciones anteriores. |

## Hallazgos y pendientes

- La secuencia general sigue el informe, aunque varias descripciones técnicas aparecen antes de que el gráfico las explique; simplificar las pantallas posteriores por etapas.
- La misma composición de texto, controles y visualización se repite en numerosos algoritmos. Diferenciar las representaciones según el mecanismo, sin perder controles.
- El sistema anterior acumulaba reglas y colores superpuestos, etiquetas pequeñas y fondos radiales. Fase 1 incorpora tokens y una base uniforme; quedan valores codificados en componentes posteriores y SVG generados.
- La prueba automatizada de desbordamiento detecta scroll vertical en hormigas, feromonas y evolución a 1366×768; requieren redistribución en fases posteriores. En móvil el desplazamiento vertical es intencional para contenido largo.
- Las pruebas de navegador y las páginas generadas deben seguir cubriendo teclado, índice, foco, estado de las simulaciones, tamaños 16:9 y móvil. Los informes README y ARQUITECTURA contienen datos históricos contradictorios sobre cantidad de pantallas, PDF y algoritmos; actualizarlos con la siguiente fase documental.
- El PDF distingue el resultado ACO de su certificación por fuerza bruta. Las coordenadas del caso son solo un esquema y no reproducen geométricamente la matriz.
