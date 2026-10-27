const EUC_2D = "EUC_2D";

export function parseTsp(text) {
  if (typeof text !== "string" || !text.trim()) throw new Error("El archivo está vacío.");
  const lines = text.replace(/\r/g, "").split("\n");
  const headers = new Map();
  let section = false;
  const nodes = [];
  const ids = new Set();
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (/^NODE_COORD_SECTION$/i.test(line)) { section = true; continue; }
    if (/^(EOF|DISPLAY_DATA_SECTION|EDGE_WEIGHT_SECTION)$/i.test(line)) break;
    if (!section) {
      const match = line.match(/^([^:]+)\s*:\s*(.*?)\s*$/);
      if (match) headers.set(match[1].trim().toUpperCase(), match[2].trim());
      continue;
    }
    const parts = line.split(/\s+/);
    if (parts.length !== 3) throw new Error(`Coordenada inválida: «${line}».`);
    const [id, x, y] = [Number(parts[0]), Number(parts[1]), Number(parts[2])];
    if (!Number.isInteger(id) || !Number.isFinite(x) || !Number.isFinite(y)) throw new Error(`Coordenada no numérica: «${line}».`);
    if (ids.has(id)) throw new Error(`El identificador ${id} está repetido.`);
    ids.add(id);
    nodes.push({ id, x, y });
  }
  const dimension = Number(headers.get("DIMENSION"));
  if (!section) throw new Error("Falta NODE_COORD_SECTION.");
  if (headers.get("EDGE_WEIGHT_TYPE")?.toUpperCase() !== EUC_2D) throw new Error("Esta demo solo admite EDGE_WEIGHT_TYPE: EUC_2D.");
  if (!Number.isInteger(dimension) || dimension < 3) throw new Error("DIMENSION debe ser un entero de al menos 3.");
  if (nodes.length !== dimension) throw new Error(`DIMENSION declara ${dimension} ciudades, pero se leyeron ${nodes.length}.`);
  return { name: headers.get("NAME") || "instancia-local", dimension, edgeWeightType: EUC_2D, nodes, optimal: null };
}

export function buildDistances(instance) {
  const { nodes } = instance;
  return nodes.map((a) => nodes.map((b) => Math.floor(Math.hypot(a.x - b.x, a.y - b.y) + 0.5)));
}

export function routeCost(route, distances) {
  validateRoute(route, distances.length);
  return route.reduce((sum, city, index) => sum + distances[city][route[(index + 1) % route.length]], 0);
}

export function validateRoute(route, dimension) {
  if (!Array.isArray(route) || route.length !== dimension) throw new Error("La ruta no contiene el número esperado de ciudades.");
  const seen = new Set(route);
  if (seen.size !== dimension || route.some((city) => !Number.isInteger(city) || city < 0 || city >= dimension)) {
    throw new Error("La ruta repite, omite o contiene una ciudad inválida.");
  }
  return true;
}

export function validateSymmetricDistances(distances) {
  const n = distances.length;
  if (n < 3 || distances.some((row) => !Array.isArray(row) || row.length !== n)) {
    throw new Error("La matriz de distancias debe ser cuadrada y contener al menos tres ciudades.");
  }
  for (let i = 0; i < n; i += 1) {
    if (distances[i][i] !== 0) throw new Error("La diagonal de distancias debe ser cero.");
    for (let j = i + 1; j < n; j += 1) {
      if (!Number.isFinite(distances[i][j]) || distances[i][j] < 0 || distances[i][j] !== distances[j][i]) {
        throw new Error("2-opt con evaluación incremental requiere una matriz simétrica y no negativa.");
      }
    }
  }
  return true;
}

export function findBestTwoOptMove(inputRoute, distances) {
  const route = [...inputRoute];
  validateRoute(route, distances.length);
  validateSymmetricDistances(distances);
  let bestDelta = 0;
  let bestIndices = null;
  const beforeCost = routeCost(route, distances);
  for (let i = 0; i < route.length; i += 1) {
    const a = route[i], b = route[(i + 1) % route.length];
    for (let j = i + 2; j < route.length; j += 1) {
      if (i === 0 && j === route.length - 1) continue;
      const c = route[j], d = route[(j + 1) % route.length];
      const delta = distances[a][c] + distances[b][d] - distances[a][b] - distances[c][d];
      if (delta < bestDelta) {
        bestDelta = delta;
        bestIndices = { i, j, a, b, c, d };
      }
    }
  }
  if (!bestIndices) return null;
  const { i, j, a, b, c, d } = bestIndices;
  const candidateRoute = [...route];
  const segment = candidateRoute.slice(i + 1, j + 1).reverse();
  candidateRoute.splice(i + 1, segment.length, ...segment);
  const afterCost = routeCost(candidateRoute, distances);
  if (afterCost - beforeCost !== bestDelta || afterCost >= beforeCost) {
    throw new Error("La diferencia incremental 2-opt no coincide con el costo de la ruta.");
  }
  const bestMove = {
    i, j, delta: bestDelta, beforeCost, afterCost, route: candidateRoute,
    reversedSegment: route.slice(i + 1, j + 1),
    removed: [[a, b], [c, d]], added: [[a, c], [b, d]],
  };
  return bestMove;
}

export function nearestNeighbor(distances, start = 0) {
  const n = distances.length;
  if (!Number.isInteger(start) || start < 0 || start >= n) throw new Error("Ciudad de origen no válida.");
  const route = [start];
  const remaining = new Set(Array.from({ length: n }, (_, i) => i).filter((i) => i !== start));
  while (remaining.size) {
    const from = route.at(-1);
    let next = -1;
    let best = Infinity;
    for (const city of remaining) {
      if (distances[from][city] < best || (distances[from][city] === best && city < next)) {
        best = distances[from][city]; next = city;
      }
    }
    route.push(next);
    remaining.delete(next);
  }
  validateRoute(route, n);
  return route;
}

export function improveTwoOpt(inputRoute, distances) {
  const route = [...inputRoute];
  validateRoute(route, distances.length);
  validateSymmetricDistances(distances);
  const history = [routeCost(route, distances)];
  const started = performance.now();
  let moves = 0;
  let lastMove = null;
  let changed = true;
  while (changed) {
    changed = false;
    const move = findBestTwoOptMove(route, distances);
    if (move) {
      lastMove = move;
      route.splice(0, route.length, ...move.route);
      const cost = routeCost(route, distances);
      if (cost !== move.afterCost || cost >= history.at(-1)) throw new Error("La mejora 2-opt no redujo el costo esperado.");
      history.push(cost);
      moves += 1;
      changed = true;
    }
  }
  validateRoute(route, distances.length);
  return { route, history, moves, lastMove, durationMs: performance.now() - started };
}

export function shuffledRoute(dimension, start, seed = 2026) {
  let state = seed >>> 0;
  const random = () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296; };
  const route = Array.from({ length: dimension }, (_, i) => i).filter((i) => i !== start);
  for (let i = route.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [route[i], route[j]] = [route[j], route[i]];
  }
  return [start, ...route];
}
