import { buildDistances, findBestTwoOptMove, nearestNeighbor, parseTsp, routeCost, validateRoute } from "./tsp-engine.js";

"use strict";

const $ = (selector) => document.querySelector(selector);
const slides = [...document.querySelectorAll(".slide")];
const overview = $("#overview");
const overviewLinks = $("#overviewLinks");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let current = 0;
let overviewReturnFocus = null;

function goTo(index, { focus = false } = {}) {
  if (typeof pausePlayback === "function") pausePlayback(false);
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
  const active = slides[current];
  active.scrollTop = 0;
  $("#progress").style.width = `${((current + 1) / slides.length) * 100}%`;
  $("#deckCount").textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  history.replaceState(null, "", `#${active.id}`);
  if (window.matchMedia("(max-width: 900px)").matches) {
    active.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" });
  }
  if (focus) {
    const heading = active.querySelector("h1, h2");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
}

function openOverview(open) {
  overview.classList.toggle("open", open);
  overview.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("dialog-open", open);
  if (open) {
    overviewReturnFocus = document.activeElement;
    overviewLinks.querySelector("button")?.focus();
  } else if (overviewReturnFocus instanceof HTMLElement) {
    overviewReturnFocus.focus({ preventScroll: true });
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.();
  else {
    const request = document.documentElement.requestFullscreen;
    if (request) request.call(document.documentElement).catch(() => {});
  }
}

$("#overviewBtn").addEventListener("click", () => openOverview(true));
$("#fullscreenBtn").addEventListener("click", toggleFullscreen);
$("#closeOverview").addEventListener("click", () => openOverview(false));
overview.addEventListener("click", (event) => { if (event.target === overview) openOverview(false); });
$("#prevSlide").addEventListener("click", () => goTo(current - 1));
$("#nextSlide").addEventListener("click", () => goTo(current + 1));

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = slides.findIndex((slide) => slide.id === button.dataset.go);
    if (target >= 0) goTo(target, { focus: true });
  });
});

slides.forEach((slide, index) => {
  const button = document.createElement("button");
  const number = document.createElement("span");
  number.textContent = String(index + 1).padStart(2, "0");
  const title = slide.querySelector("h1, h2")?.textContent.trim().replace(/\s+/g, " ").slice(0, 55) || slide.dataset.section;
  button.append(number, document.createTextNode(title));
  button.addEventListener("click", () => { goTo(index, { focus: true }); openOverview(false); });
  overviewLinks.appendChild(button);
});

document.addEventListener("keydown", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const interactive = target?.closest("button, summary, input, textarea, select, [contenteditable='true']");
  if (overview.classList.contains("open")) {
    if (event.key === "Escape") { event.preventDefault(); openOverview(false); return; }
    if (event.key === "Tab") {
      const items = [...overview.querySelectorAll("button")];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
    return;
  }
  if (interactive) return;
  if (event.key.toLowerCase() === "m") { event.preventDefault(); openOverview(true); return; }
  if (event.key.toLowerCase() === "f") { event.preventDefault(); toggleFullscreen(); return; }
  if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); goTo(current + 1); }
  else if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); goTo(current - 1); }
  else if (event.key === "Home") { event.preventDefault(); goTo(0); }
  else if (event.key === "End") { event.preventDefault(); goTo(slides.length - 1); }
});

window.addEventListener("hashchange", () => {
  const target = slides.findIndex((slide) => slide.id === location.hash.slice(1));
  if (target >= 0) goTo(target);
});

// Decorative SVGs are deterministic and respect reduced-motion settings.
const NS = "http://www.w3.org/2000/svg";
function svg(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  parent.appendChild(node);
  return node;
}
const heroPoints = [[100,96],[305,63],[431,171],[370,366],[167,419],[50,285],[242,220],[330,277]];
const heroEdges = $("#heroEdges"), heroNodes = $("#heroNodes");
heroPoints.forEach(([x,y], i) => {
  heroPoints.forEach(([a,b], j) => { if (j > i && Math.hypot(x-a,y-b) < 330) svg("line", { x1:x,y1:y,x2:a,y2:b,stroke:"#366075","stroke-opacity":".27","stroke-width":"1" }, heroEdges); });
  svg("circle", { cx:x,cy:y,r:i===0?9:6,fill:i===0?"#f1bb77":"#d7f3ec",stroke:"#07111e","stroke-width":"3" }, heroNodes);
});
const heroPath = $("#heroPath");
heroPath.setAttribute("d", "M" + [[0],[1],[2],[3],[7],[4],[5],[6],[0]].map(([i]) => heroPoints[i].join(",")).join(" L"));
if (reduceMotion.matches) heroPath.style.strokeDasharray = "none";
else {
  const length = heroPath.getTotalLength();
  heroPath.style.strokeDasharray = String(length);
  heroPath.style.strokeDashoffset = String(length);
  heroPath.animate([{ strokeDashoffset:length },{ strokeDashoffset:0 }], { duration:1800, fill:"forwards", easing:"ease-out" });
}
const problemPoints = [[90,80],[330,72],[375,245],[210,288],[65,230]];
const problemEdges = $("#problemEdges"), problemNodes = $("#problemNodes");
svg("polyline", { points:[0,1,2,3,4,0].map((i) => problemPoints[i].join(",")).join(" "),stroke:"#55e1c6",fill:"none","stroke-width":"4","stroke-linejoin":"round" }, problemEdges);
problemPoints.forEach(([x,y], i) => {
  svg("circle", { cx:x,cy:y,r:12,fill:i===0?"#f1bb77":"#e8f7f3" }, problemNodes);
  const label = svg("text", { x:x+16,y:y-12,fill:"#d7e7ee","font-size":"18" }, problemNodes);
  label.textContent = i === 0 ? "O" : "ABCDE"[i];
});

// Optional scientific figures fall back to explicitly labeled concepts.
document.querySelectorAll("[data-figure]").forEach((figure) => {
  const image = figure.querySelector("img");
  image.addEventListener("load", () => figure.classList.add("has-image"));
  image.addEventListener("error", () => figure.classList.remove("has-image"));
  image.src = figure.dataset.figure;
});

const demo = {
  instance: null, distances: null, route: [], baseRoute: [], initialCost: 0, steps: [], cursor: 0,
  durationMs: 0, lastMove: null, pending: null, playing: false, timer: 0,
  canvas: $("#demoCanvas"), chart: $("#costChart"),
};
const ctx = demo.canvas.getContext("2d");
const chartCtx = demo.chart.getContext("2d");
const colors = { bg:"#0d2030", grid:"#1a3446", route:"#55e1c6", city:"#f4f7fb", start:"#f1bb77", text:"#d5e4ea" };
const formatCost = (value) => Math.round(value).toLocaleString("es-PE");

function setStatus(message, error = false) {
  const status = $("#demoStatus"); status.textContent = message; status.classList.toggle("is-error", error);
}
function costHistory() { return demo.steps.slice(0, demo.cursor + 1).map((step) => step.cost); }

function drawRoute() {
  if (!demo.instance) return;
  const { nodes } = demo.instance, width = demo.canvas.width, height = demo.canvas.height;
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
  for (let x = 20; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 20; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  const pad = 42, xs = nodes.map((node) => node.x), ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min((width - pad * 2) / (maxX - minX || 1), (height - pad * 2) / (maxY - minY || 1));
  const points = nodes.map((node) => ({ x: pad + (node.x - minX) * scale, y: pad + (maxY - node.y) * scale }));
  ctx.beginPath();
  demo.route.forEach((city, index) => { const point = points[city]; if (!index) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); });
  const first = points[demo.route[0]]; ctx.lineTo(first.x, first.y); ctx.strokeStyle = colors.route; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
  const move = demo.pending || demo.lastMove;
  if (move) {
    const drawEdges = (edges, color, dash, lineWidth) => {
      ctx.beginPath(); edges.forEach(([a, b]) => { ctx.moveTo(points[a].x, points[a].y); ctx.lineTo(points[b].x, points[b].y); });
      ctx.strokeStyle = color; ctx.lineWidth = lineWidth; ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]);
    };
    drawEdges(move.removed, "#ef8f7a", [9, 7], 4); drawEdges(move.added, "#55e1c6", [], 5);
  }
  points.forEach((point, index) => { ctx.beginPath(); ctx.arc(point.x, point.y, index === demo.route[0] ? 6 : 4, 0, Math.PI * 2); ctx.fillStyle = index === demo.route[0] ? colors.start : colors.city; ctx.fill(); });
  ctx.fillStyle = colors.text; ctx.font = "18px system-ui";
  ctx.fillText(`${demo.instance.name} \u00b7 ${nodes.length} ciudades \u00b7 EUC_2D \u00b7 origen ${nodes[demo.route[0]].id}`, 20, 28);
}

function drawChart() {
  const width = demo.chart.width, height = demo.chart.height, history = costHistory();
  chartCtx.clearRect(0, 0, width, height); chartCtx.fillStyle = colors.bg; chartCtx.fillRect(0, 0, width, height);
  chartCtx.strokeStyle = colors.grid; chartCtx.beginPath(); chartCtx.moveTo(40, 12); chartCtx.lineTo(40, height - 22); chartCtx.lineTo(width - 14, height - 22); chartCtx.stroke();
  if (!history.length) return;
  const low = Math.min(...history), high = Math.max(...history), span = high - low || 1;
  const coords = history.map((value, index) => ({ x: 44 + index * (width - 64) / Math.max(1, history.length - 1), y: 14 + (high - value) * (height - 42) / span }));
  chartCtx.beginPath(); coords.forEach((point, index) => { if (!index) chartCtx.moveTo(point.x, point.y); else chartCtx.lineTo(point.x, point.y); });
  chartCtx.strokeStyle = colors.route; chartCtx.lineWidth = 2.5; chartCtx.stroke();
  const cursor = coords.at(-1); chartCtx.beginPath(); chartCtx.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2); chartCtx.fillStyle = "#f1bb77"; chartCtx.fill();
  chartCtx.fillStyle = colors.text; chartCtx.font = "15px system-ui"; chartCtx.fillText(`${formatCost(history[0])} \u2192 ${formatCost(history.at(-1))} \u00b7 ${history.length - 1} mejoras aceptadas`, 46, 18);
}

function updateMetrics() {
  if (!demo.instance) return;
  const cost = routeCost(demo.route, demo.distances);
  $("#initialCost").textContent = formatCost(demo.initialCost);
  $("#finalCost").textContent = formatCost(cost);
  $("#demoGap").textContent = demo.instance.optimal ? `${(100 * (cost - demo.instance.optimal) / demo.instance.optimal).toFixed(2)} %` : "\u2014";
  $("#demoReduction").textContent = demo.initialCost ? `${(100 * (demo.initialCost - cost) / demo.initialCost).toFixed(2)} %` : "0,00 %";
  $("#demoTime").textContent = `${demo.durationMs.toFixed(3)} ms`;
  $("#moveCount").textContent = String(demo.cursor);
  $("#demoTitle").textContent = `${demo.instance.name.toUpperCase()} \u00b7 ${demo.instance.edgeWeightType}`;
  $("#proposalDelta").textContent = demo.pending ? `\u0394 ${demo.pending.delta}` : demo.lastMove ? `\u0394 ${demo.lastMove.delta}` : "\u0394 \u2014";
  drawRoute(); drawChart();
}

function stopTimer() { if (demo.timer) clearTimeout(demo.timer); demo.timer = 0; }
function pausePlayback(announce = true) {
  if (!demo.playing && !demo.timer) return;
  demo.playing = false; stopTimer();
  if (announce && demo.pending) setStatus("Reproduccion pausada. La propuesta sigue visible; continuar la acepta tras la pausa visual.");
  else if (announce) setStatus("Reproduccion pausada. El estado de la ruta se conserva.");
}
function commitMove(move, computeMs) {
  if (!move || move.delta >= 0 || move.beforeCost !== routeCost(demo.route, demo.distances)) throw new Error("La propuesta 2-opt no es una mejora valida para la ruta actual.");
  if (demo.cursor < demo.steps.length - 1) demo.steps.splice(demo.cursor + 1);
  validateRoute(move.route, demo.instance.dimension);
  const checkedCost = routeCost(move.route, demo.distances);
  if (checkedCost !== move.afterCost) throw new Error("El costo de la ruta no coincide con el cambio incremental.");
  demo.route = [...move.route]; demo.lastMove = move; demo.pending = null; demo.durationMs = computeMs;
  demo.steps.push({ route: [...demo.route], cost: checkedCost, move, computeMs }); demo.cursor = demo.steps.length - 1;
  updateMetrics();
}
function calculateNextMove() {
  if (!demo.instance || !demo.distances) { setStatus("Carga una instancia antes de ejecutar 2-opt.", true); return null; }
  const started = performance.now(), move = findBestTwoOptMove(demo.route, demo.distances), elapsed = performance.now() - started;
  if (!move) { demo.pending = null; demo.playing = false; stopTimer(); setStatus("Optimo local alcanzado: no hay intercambio 2-opt con Delta < 0."); return null; }
  demo.pending = { ...move, computeMs: elapsed }; demo.durationMs = elapsed; updateMetrics();
  setStatus(`Propuesta: retirar (${move.removed.map((e) => e.map((i) => demo.instance.nodes[i].id).join("\u2013")).join(") y (")}) y anadir (${move.added.map((e) => e.map((i) => demo.instance.nodes[i].id).join("\u2013")).join(") y (")}); Delta = ${move.delta}. Se acepta porque Delta < 0.`);
  return demo.pending;
}
function advanceOne() {
  if (!demo.instance) { setStatus("Carga una instancia antes de avanzar movimientos.", true); return false; }
  pausePlayback(false);
  if (demo.cursor < demo.steps.length - 1) {
    const next = demo.steps[demo.cursor + 1]; demo.cursor += 1; demo.route = [...next.route]; demo.lastMove = next.move; demo.durationMs = next.computeMs; updateMetrics();
    setStatus(`Reproducci?n del historial: movimiento ${demo.cursor}, costo ${formatCost(next.cost)}.`); return true;
  }
  const move = demo.pending || calculateNextMove();
  if (!move) return false;
  const { computeMs } = move; commitMove(move, computeMs);
  setStatus(`Movimiento ${demo.cursor} aceptado: Delta = ${move.delta}; costo ${formatCost(move.afterCost)}.`); return true;
}
function playbackTick() {
  if (!demo.playing) return;
  if (demo.pending) {
    const proposal = demo.pending;
    commitMove(proposal, proposal.computeMs);
    setStatus(`Movimiento ${demo.cursor} aceptado: Delta = ${proposal.delta}; costo ${formatCost(proposal.afterCost)}. Pausa de animaci?n: ${$("#speedRange").value} ms.`);
  } else if (!calculateNextMove()) return;
  demo.timer = setTimeout(playbackTick, Number($("#speedRange").value));
}
function startPlayback() {
  if (!demo.instance) { setStatus("Carga una instancia antes de iniciar la reproduccion.", true); return; }
  if (demo.playing) return;
  demo.playing = true; setStatus("Reproduccion activa. El tiempo indicado mide solo el calculo, no las pausas de animacion.");
  if (demo.pending) demo.timer = setTimeout(playbackTick, Number($("#speedRange").value)); else playbackTick();
}
function useStartingRoute(route, description) {
  pausePlayback(false); demo.baseRoute = [...route]; demo.route = [...route]; demo.initialCost = routeCost(route, demo.distances);
  demo.steps = [{ route: [...route], cost: demo.initialCost, move: null, computeMs: 0 }]; demo.cursor = 0; demo.durationMs = 0; demo.lastMove = null; demo.pending = null;
  validateRoute(demo.route, demo.instance.dimension); updateMetrics(); setStatus(description);
}
function resetDemo() {
  if (!demo.instance) return;
  const start = Number($("#originSelect").value || 0), route = nearestNeighbor(demo.distances, start);
  useStartingRoute(route, `Ruta inicial determinista de vecino mas cercano; origen TSPLIB ID ${demo.instance.nodes[start].id}.`);
}
function restartSameRoute() { useStartingRoute(demo.baseRoute, "Ruta inicial restaurada; instancia, origen y semilla se conservan."); }
function runNearest() {
  if (!demo.instance) { setStatus("Carga una instancia antes de ejecutar el algoritmo.", true); return; }
  const started = performance.now(), route = nearestNeighbor(demo.distances, Number($("#originSelect").value)), elapsed = performance.now() - started;
  useStartingRoute(route, `Vecino mas cercano calculado en ${elapsed.toFixed(3)} ms; tour validado y cerrado en su origen.`);
  demo.durationMs = elapsed; updateMetrics();
}

async function loadInstance(name) {
  pausePlayback(false); setStatus(`Cargando ${name}...`);
  try {
    const response = await fetch(`results/${name}.tsp`);
    if (!response.ok) throw new Error(`No se pudo leer results/${name}.tsp (${response.status}).`);
    const instance = parseTsp(await response.text()); instance.optimal = { berlin52: 7542, eil51: 426 }[name] ?? null;
    installInstance(instance);
  } catch (error) { setStatus(`${error.message} Abre el proyecto con un servidor est?tico local para cargar recursos.`, true); }
}
function installInstance(instance) {
  demo.instance = instance; demo.distances = buildDistances(instance); populateOrigin(); resetDemo();
}
function populateOrigin() {
  const select = $("#originSelect"); select.replaceChildren();
  demo.instance.nodes.forEach((node, index) => { const option = document.createElement("option"); option.value = String(index); option.textContent = String(node.id); select.appendChild(option); });
}
function reproduceComparison() {
  const host = $("#qualityComparison"); host.replaceChildren(); $("#reproducedResults").textContent = "Calculando ambas instancias oficiales desde el ID TSPLIB 1...";
  Promise.all(["berlin52", "eil51"].map(async (name) => {
    const response = await fetch(`results/${name}.tsp`); if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    const instance = parseTsp(await response.text()); const distances = buildDistances(instance), start = instance.nodes.findIndex((node) => node.id === 1);
    if (start < 0) throw new Error(`${name}: no contiene ciudad TSPLIB ID 1`);
    const nn = nearestNeighbor(distances, start), nnCost = routeCost(nn, distances); let route = nn, moves = 0;
    for (;;) { const move = findBestTwoOptMove(route, distances); if (!move) break; route = move.route; moves += 1; }
    const twoCost = routeCost(route, distances), optimum = { berlin52: 7542, eil51: 426 }[name];
    validateRoute(route, instance.dimension);
    return { name, nnCost, twoCost, moves, optimum, nodes: instance.nodes, nnRoute: nn, twoRoute: route, nnGap: 100 * (nnCost - optimum) / optimum, twoGap: 100 * (twoCost - optimum) / optimum };
  })).then((results) => {
    $("#reproducedResults").textContent = "Una corrida por instancia; no es un an\u00e1lisis estad\u00edstico.";
    const mapCanvas = document.createElement("canvas");
    mapCanvas.className = "quality-map"; mapCanvas.width = 760; mapCanvas.height = 140;
    mapCanvas.setAttribute("role", "img");
    mapCanvas.setAttribute("aria-label", "Comparación de las rutas calculadas por vecino más cercano y por 2-opt para berlin52");
    host.appendChild(mapCanvas);
    drawComparisonMap(mapCanvas, results.find((result) => result.name === "berlin52"));
    results.forEach((result) => {
      const row = document.createElement("article"); row.className = "quality-row";
      row.innerHTML = `<header><strong>${result.name}</strong><span>${result.moves} movimientos aceptados</span></header><div class="quality-values"><span>Vecino m\u00e1s cercano <b>${formatCost(result.nnCost)}</b><small>gap ${result.nnGap.toFixed(2)} %</small></span><span>Tras 2-opt <b>${formatCost(result.twoCost)}</b><small>gap ${result.twoGap.toFixed(2)} %</small></span><span>\u00d3ptimo TSPLIB95 <b>${formatCost(result.optimum)}</b></span></div>`;
      host.appendChild(row);
    });
  }).catch((error) => { $("#reproducedResults").textContent = `No se pudo reproducir: ${error.message}`; });
}

function drawComparisonMap(canvas, result) {
  if (!result) return;
  const context = canvas.getContext("2d"), { nodes } = result, width = canvas.width, height = canvas.height;
  context.fillStyle = colors.bg; context.fillRect(0, 0, width, height);
  const minX = Math.min(...nodes.map((node) => node.x)), maxX = Math.max(...nodes.map((node) => node.x));
  const minY = Math.min(...nodes.map((node) => node.y)), maxY = Math.max(...nodes.map((node) => node.y));
  const routes = [result.nnRoute, result.twoRoute], labels = ["Vecino más cercano", "Tras 2-opt"], colorsForRoute = ["#f1bb77", "#55e1c6"];
  routes.forEach((route, routeIndex) => {
    const left = routeIndex * width / 2 + 14, panelWidth = width / 2 - 28, pad = 20;
    const scale = Math.min((panelWidth - pad * 2) / (maxX - minX || 1), (height - 50) / (maxY - minY || 1));
    const points = nodes.map((node) => ({ x: left + pad + (node.x - minX) * scale, y: 30 + (maxY - node.y) * scale }));
    context.beginPath(); route.forEach((city, index) => { const point = points[city]; if (!index) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y); });
    context.lineTo(points[route[0]].x, points[route[0]].y); context.strokeStyle = colorsForRoute[routeIndex]; context.lineWidth = 1.4; context.stroke();
    context.fillStyle = colorsForRoute[routeIndex]; context.font = "13px system-ui"; context.fillText(labels[routeIndex], left + 8, 18);
    context.fillStyle = "#f4f7fb"; points.forEach((point) => { context.beginPath(); context.arc(point.x, point.y, 1.8, 0, Math.PI * 2); context.fill(); });
  });
}

function updateFactorial() {
  const n = Number($("#cityCount").value); $("#cityCountValue").value = String(n); $("#cityCountValue").textContent = String(n);
  let factorial = 1n; for (let k = 2n; k <= BigInt(n - 1); k += 1n) factorial *= k;
  const tours = factorial / 2n; $("#factorialValue").textContent = new Intl.NumberFormat("es-PE").format(tours);
  const group = $("#factorialPlot"); group.replaceChildren(); const ns = "http://www.w3.org/2000/svg";
  const add = (tag, attrs, parent = group) => { const node = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value))); parent.appendChild(node); return node; };
  add("path", { d: "M54 10V178H700", fill: "none", stroke: "#648096", "stroke-width": 1.5 });
  const log10factorial = (value) => { let sum = 0; for (let k = 2; k <= value; k += 1) sum += Math.log10(k); return sum - Math.log10(2); };
  const maxLog = log10factorial(39) || 1, points = [];
  for (let cityCount = 3; cityCount <= 40; cityCount += 1) {
    const x = 58 + (cityCount - 3) * 638 / 37, y = 176 - log10factorial(cityCount - 1) * 158 / maxLog; points.push(`${x},${y}`);
  }
  add("polyline", { points: points.join(" "), fill: "none", stroke: "#55e1c6", "stroke-width": 3, "stroke-linejoin": "round" });
  const x = 58 + (n - 3) * 638 / 37, y = 176 - log10factorial(n - 1) * 158 / maxLog;
  add("line", { x1: x, x2: x, y1: y, y2: 178, stroke: "#f1bb77", "stroke-dasharray": "4 5" }); add("circle", { cx: x, cy: y, r: 6, fill: "#f1bb77" });
  [0, 10, 20, 30].forEach((exp) => { const yy = 176 - exp * 158 / maxLog; add("line", { x1: 54, x2: 700, y1: yy, y2: yy, stroke: "#294354", "stroke-width": 1 }); const label = add("text", { x: 5, y: yy + 4, fill: "#a8bfca", "font-size": 12 }); label.textContent = `10^${exp}`; });
  const labelX = add("text", { x: 700, y: 205, fill: "#a8bfca", "font-size": 13, "text-anchor": "end" }); labelX.textContent = "n \u00b7 ciudades";
}
function updateAco() {
  const alpha = Number($("#alphaRange").value), beta = Number($("#betaRange").value), tau = [1, .5, .25], distance = [2, 4, 8];
  $("#alphaValue").value = alpha.toFixed(1); $("#alphaValue").textContent = alpha.toFixed(1); $("#betaValue").value = beta.toFixed(1); $("#betaValue").textContent = beta.toFixed(1);
  const weights = tau.map((value, i) => value ** alpha * (1 / distance[i]) ** beta), total = weights.reduce((sum, value) => sum + value, 0), host = $("#acoProbabilities"); host.replaceChildren();
  weights.forEach((weight, i) => { const probability = total ? weight / total : 1 / weights.length, row = document.createElement("div"); row.className = "aco-prob-row"; row.innerHTML = `<span>Arista ${i + 1} \u00b7 d=${distance[i]}</span><i><b style="width:${100 * probability}%"></b></i><strong>${(100 * probability).toFixed(1)}%</strong>`; host.appendChild(row); });
}

$("#instanceSelect").addEventListener("change", (event) => loadInstance(event.target.value));
$("#originSelect").addEventListener("change", resetDemo);
$("#shuffleBtn").addEventListener("click", resetDemo);
$("#nearestBtn").addEventListener("click", runNearest);
$("#playBtn").addEventListener("click", startPlayback);
$("#pauseBtn").addEventListener("click", () => pausePlayback());
$("#continueBtn").addEventListener("click", startPlayback);
$("#stepBtn").addEventListener("click", advanceOne);
$("#backBtn").addEventListener("click", () => { if (!demo.instance) { setStatus("Carga una instancia antes de retroceder movimientos.", true); return; } pausePlayback(false); if (demo.cursor <= 0) { setStatus("La ruta ya esta en el estado inicial."); return; } demo.cursor -= 1; const previous = demo.steps[demo.cursor]; demo.route = [...previous.route]; demo.lastMove = previous.move; demo.durationMs = previous.computeMs; demo.pending = null; updateMetrics(); setStatus(`Retroceso: movimiento ${demo.cursor}; costo ${formatCost(previous.cost)}. El historial posterior se conserva para avanzar de nuevo.`); });
$("#speedRange").addEventListener("input", (event) => { $("#speedValue").value = `${event.target.value} ms / movimiento`; $("#speedValue").textContent = `${event.target.value} ms / movimiento`; });
$("#reproduceResults").addEventListener("click", reproduceComparison);
$("#cityCount").addEventListener("input", updateFactorial);
$("#alphaRange").addEventListener("input", updateAco); $("#betaRange").addEventListener("input", updateAco);
$("#tspFile").addEventListener("change", async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const instance = parseTsp(await file.text()); instance.optimal = null; installInstance(instance); $("#instanceSelect").value = ""; setStatus(`Archivo ${file.name} cargado y validado. Optimo de referencia no asignado.`); } catch (error) { setStatus(error.message, true); } });

const initialSlide = slides.findIndex((slide) => slide.id === location.hash.slice(1));
goTo(initialSlide >= 0 ? initialSlide : 0); updateFactorial(); updateAco(); loadInstance($("#instanceSelect").value); reproduceComparison();
