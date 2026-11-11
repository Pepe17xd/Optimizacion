import { DEFAULT_DEMO_DURATION } from "./config.js";
import "./learning.js";
import { buildDistances, findBestTwoOptMove, nearestNeighbor, parseTsp, routeCost, validateRoute } from "./tsp-engine.js";

"use strict";

const $ = (selector) => document.querySelector(selector);
const slides = [...document.querySelectorAll(".slide")];
const overview = $("#overview");
const overviewLinks = $("#overviewLinks");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let current = 0;
let entryTimer = 0; let entryGeneration = 0;
let overviewReturnFocus = null;
// Entry animations are visual only; navigation and algorithm execution remain separate.
let entryAnimations = [];
function animateEntry(slide) {
  entryAnimations.forEach(animation => animation.cancel());
  entryAnimations = [];
  const groups = [
    slide.querySelector('.eyebrow'), slide.querySelector('h1, h2'),
    ...slide.querySelectorAll('.hero-subtitle, .hero-visual, .hero-foot, .formula-row, .factorial-panel, .footer-note, .method-row, .learning-grid > div:first-child > .lead, .learning-grid > div:first-child > .insertion-formula, .learning-grid > div:first-child > .math-display, .learning-visual, .learning-controls, .learning-status, .demo-heading p, .demo-instance-label, .demo-map-frame, .demo-chart, .demo-metrics > div, .demo-config, .demo-player, .closing-sign')
  ].filter(Boolean);
  if (reduceMotion.matches) return;
  groups.forEach((node, index) => {
    const animation = node.animate([{opacity:0,transform:'translateY(30px)'},{opacity:1,transform:'translateY(0)'}], {duration:600,delay:Math.min(index*95,850),easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
    entryAnimations.push(animation);
    animation.onfinish = () => { animation.cancel(); entryAnimations = entryAnimations.filter(item => item !== animation); };
  });
  slide.querySelectorAll('.learning-visual svg line, .learning-visual svg polyline, .learning-visual svg path').forEach((edge, i) => {
    if (typeof edge.getTotalLength !== 'function') return;
    const length = edge.getTotalLength();
    if (!Number.isFinite(length) || !length) return;
    const animation = edge.animate([{strokeDasharray:`${length}`,strokeDashoffset:length},{strokeDasharray:`${length}`,strokeDashoffset:0}],{duration:650,delay:Math.min(250+i*20,650),easing:'ease-out'});
    entryAnimations.push(animation);
  });
  slide.querySelectorAll('.learning-visual svg circle').forEach((node,i) => {
    const animation = node.animate([{opacity:0},{opacity:1}],{duration:450,delay:Math.min(200+i*35,650),easing:'ease-out'});
    entryAnimations.push(animation);
  });

}
function advancePresentation(direction) { goTo(current + direction); }


let factorialTimer = 0;
function goTo(index, { focus = false } = {}) {
  clearTimeout(entryTimer); clearInterval(factorialTimer); const generation = ++entryGeneration;
  const destination = Math.max(0, Math.min(slides.length - 1, index));
  slides[current]?.dispatchEvent(new Event("presentationleave"));
  slides[current]?.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  if (slides[current]?.id === "demo") stopTimer();
  if (typeof pausePlayback === "function") pausePlayback(false);
  current = destination;
  slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
  const active = slides[current];
  if (active.id === "escala") { $("#cityCount").value = "3"; updateFactorial(); }
  animateEntry(active);
  entryTimer = setTimeout(async () => {
    if (generation !== entryGeneration || slides[current] !== active) return;
    if (active.id === "demo") {
      $("#instanceSelect").value = "berlin52";
      await loadInstance("berlin52");
      if (generation !== entryGeneration || slides[current] !== active || !demo.instance) return;
      setSuggestedSpeed();
      demo.visualKind = "initial"; demo.visualProgress = 0; animateDemoGeometry(850);
      entryTimer = setTimeout(() => { if (generation === entryGeneration && slides[current] === active) startPlayback(); }, 950);
    } else if (active.id === "escala") {
      let n = 3; $("#cityCount").value = n; updateFactorial();
      factorialTimer = setInterval(() => { if (generation !== entryGeneration || slides[current] !== active) { clearInterval(factorialTimer); return; } n++; $("#cityCount").value = n; updateFactorial(); if (n >= 40) clearInterval(factorialTimer); }, DEFAULT_DEMO_DURATION / 37);
    } else active.dispatchEvent(new Event("presentationenter"));
  }, 500);
  if (active.id === "demo") requestAnimationFrame(() => { if (slides[current].id === "demo" && demo.instance) { drawRoute(); drawChart(); } });
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
$("#prevSlide").addEventListener("click", () => advancePresentation(-1));
$("#nextSlide").addEventListener("click", () => advancePresentation(1));

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
  const interactive = target?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])");
  const focusedButton = target?.closest("button, summary");
  if (overview.classList.contains("open")) {
    if (event.key === "Escape") { event.preventDefault(); openOverview(false); return; }
    if (event.key === "Tab") {
      const items = [...overview.querySelectorAll("button")];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
    return;
  }
  if (interactive || (focusedButton && event.key === " ")) return;
  if (event.key.toLowerCase() === "m") { event.preventDefault(); openOverview(true); return; }
  if (event.key.toLowerCase() === "f") { event.preventDefault(); toggleFullscreen(); return; }
  if (["ArrowRight", "PageDown", " "].includes(event.key)) { event.preventDefault(); advancePresentation(1); }
  else if (["ArrowLeft", "PageUp"].includes(event.key)) { event.preventDefault(); advancePresentation(-1); }
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
// Optional scientific figures fall back to explicitly labeled concepts.
document.querySelectorAll("[data-figure]").forEach((figure) => {
  const image = figure.querySelector("img");
  image.addEventListener("load", () => figure.classList.add("has-image"));
  image.addEventListener("error", () => figure.classList.remove("has-image"));
  image.src = figure.dataset.figure;
});

const demo = {
  instance: null, distances: null, route: [], baseRoute: [], initialCost: 0, steps: [], cursor: 0,
  durationMs: 0, lastMove: null, pending: null, playing: false, timer: 0, frame: 0, visualKind: null, visualProgress: 1,
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

function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const width = 1200, height = Math.max(80, Math.round(width * rect.height / rect.width));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
}
function drawRoute() {
  if (!demo.instance) return;
  fitCanvas(demo.canvas);
  const { nodes } = demo.instance, width = demo.canvas.width, height = demo.canvas.height;
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = colors.bg; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
  for (let x = 20; x < width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  for (let y = 20; y < height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
  const pad = 42, xs = nodes.map((node) => node.x), ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min((width - pad * 2) / (maxX - minX || 1), (height - pad * 2) / (maxY - minY || 1));
  const offsetX = (width - (maxX - minX) * scale) / 2, offsetY = (height - (maxY - minY) * scale) / 2;
  const points = nodes.map((node) => ({ x: offsetX + (node.x - minX) * scale, y: offsetY + (maxY - node.y) * scale }));
  const route = [...demo.route, demo.route[0]];
  const fraction = demo.visualKind === "initial" ? demo.visualProgress : 1;
  const count = (route.length - 1) * fraction;
  ctx.beginPath(); ctx.moveTo(points[route[0]].x, points[route[0]].y);
  for (let i=0; i<Math.ceil(count); i++) { const a=points[route[i]], b=points[route[i+1]], t=Math.min(1,count-i); ctx.lineTo(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t); }
  ctx.strokeStyle = colors.route; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
  const move = demo.pending || demo.lastMove;
  if (move) {
    const drawEdges = (edges, color, dash, lineWidth, fraction = 1) => {
      ctx.beginPath(); edges.forEach(([a,b]) => { const p=points[a],q=points[b];ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+(q.x-p.x)*fraction,p.y+(q.y-p.y)*fraction); });
      ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);
    };
    drawEdges(move.removed, "#ef8f7a", [9,7], 4);
    drawEdges(move.added, "#75f5c9", [], 5, demo.pending && demo.visualKind === "proposal" ? demo.visualProgress : 1);
  }
  ctx.shadowColor = "#75e9d4"; ctx.shadowBlur = 8;
  points.forEach((point, index) => { ctx.beginPath(); ctx.arc(point.x, point.y, index === demo.route[0] ? 6 : 4, 0, Math.PI * 2); ctx.fillStyle = index === demo.route[0] ? colors.start : colors.city; ctx.fill(); });
  ctx.shadowBlur = 0; ctx.fillStyle = colors.text; ctx.font = "18px system-ui";
  ctx.fillText(`${demo.instance.name} \u00b7 ${nodes.length} ciudades \u00b7 EUC_2D \u00b7 origen ${nodes[demo.route[0]].id}`, 20, 28);
}

function drawChart() {
  fitCanvas(demo.chart);
  const width = demo.chart.width, height = demo.chart.height, history = costHistory();
  chartCtx.clearRect(0, 0, width, height); chartCtx.fillStyle = colors.bg; chartCtx.fillRect(0, 0, width, height);
  if (!history.length) return;
  if (history.length === 1) {
    chartCtx.fillStyle = "#9fbcc7"; chartCtx.font = "16px system-ui";
    chartCtx.fillText("La evoluci\u00f3n aparecer\u00e1 al aceptar el primer movimiento", 20, Math.max(24, height / 2));
    return;
  }
  chartCtx.strokeStyle = colors.grid; chartCtx.beginPath(); chartCtx.moveTo(40, 12); chartCtx.lineTo(40, height - 22); chartCtx.lineTo(width - 14, height - 22); chartCtx.stroke();
  const low = Math.min(...history), high = Math.max(...history), span = high - low || 1;
  const coords = history.map((value, index) => ({ x: 44 + index * (width - 64) / Math.max(1, history.length - 1), y: 14 + (high - value) * (height - 42) / span }));
  chartCtx.beginPath(); coords.forEach((point, index) => { if (!index) chartCtx.moveTo(point.x, point.y); else chartCtx.lineTo(point.x, point.y); });
  chartCtx.strokeStyle = colors.route; chartCtx.lineWidth = 2.5; chartCtx.stroke();
  const cursor = coords.at(-1); chartCtx.beginPath(); chartCtx.arc(cursor.x, cursor.y, 5, 0, Math.PI * 2); chartCtx.fillStyle = "#f1bb77"; chartCtx.fill();
  chartCtx.fillStyle = colors.text; chartCtx.font = "15px system-ui"; chartCtx.fillText(`${formatCost(history[0])} \u2192 ${formatCost(history.at(-1))} \u00b7 ${history.length - 1} mejoras aceptadas`, 46, 18);
}

window.addEventListener("resize", () => { if (slides[current].id === "demo" && demo.instance) { drawRoute(); drawChart(); } });

function updateMetrics() {
  if (!demo.instance) return;
  const cost = routeCost(demo.route, demo.distances);
  const previousCost = $("#finalCost").textContent;
  $("#initialCost").textContent = formatCost(demo.initialCost);
  $("#finalCost").textContent = formatCost(cost);
  $("#demoGap").textContent = demo.instance.optimal ? `${(100 * (cost - demo.instance.optimal) / demo.instance.optimal).toFixed(2)} %` : "\u2014";
  $("#demoReduction").textContent = demo.initialCost ? `${(100 * (demo.initialCost - cost) / demo.initialCost).toFixed(2)} %` : "0,00 %";
  $("#demoTime").textContent = `${demo.durationMs.toFixed(3)} ms`;
  $("#moveCount").textContent = String(demo.cursor);
  $("#autoProgress").textContent = `${demo.cursor} movimientos aceptados`;
  $("#demoTitle").textContent = `${demo.instance.name.toUpperCase()} \u00b7 ${demo.instance.edgeWeightType}`;
  $("#proposalDelta").textContent = demo.pending ? `\u0394 ${demo.pending.delta}` : demo.lastMove ? `\u0394 ${demo.lastMove.delta}` : "\u0394 \u2014";
  drawRoute(); drawChart(); syncDemoControls();
  if (!reduceMotion.matches && previousCost !== $("#finalCost").textContent) {
    [$("#finalCost"), $("#demoGap"), $("#demoReduction"), demo.chart].forEach(node => node.animate([{opacity:.55},{opacity:1}], {duration:350,easing:'ease-out'}));
  }
}

function syncDemoControls() {
  const ready = !!demo.instance;
  $("#playBtn").disabled = !ready || demo.playing;
  $("#pauseBtn").disabled = !demo.playing;
  $("#continueBtn").disabled = !ready || demo.playing || (!demo.pending && demo.cursor === 0);
  $("#stepBtn").disabled = !ready;
  $("#backBtn").disabled = !ready || demo.cursor === 0;
}
function stopTimer() { if (demo.timer) clearTimeout(demo.timer); demo.timer = 0; if (demo.frame) cancelAnimationFrame(demo.frame); demo.frame = 0; }
function animateDemoGeometry(duration) {
  if (demo.frame) cancelAnimationFrame(demo.frame);
  if (reduceMotion.matches) { demo.visualProgress = 1; drawRoute(); return; }
  const from = demo.visualProgress, start = performance.now();
  function tick(now) {
    if (slides[current].id !== "demo") { demo.frame=0; return; }
    demo.visualProgress = Math.min(1, from + (now-start)/duration);
    drawRoute();
    if (demo.visualProgress < 1) demo.frame = requestAnimationFrame(tick); else demo.frame=0;
  }
  demo.frame = requestAnimationFrame(tick);
}
function pausePlayback(announce = true) {
  if (!demo.playing && !demo.timer) return;
  demo.playing = false; stopTimer(); if (announce) $("#autoState").textContent = "PAUSADA"; syncDemoControls();
  if (announce && demo.pending) setStatus("Reproduccion pausada. La propuesta sigue visible; continuar la acepta tras la pausa visual.");
  else if (announce) setStatus("Reproduccion pausada. El estado de la ruta se conserva.");
}
function commitMove(move, computeMs) {
  if (!move || move.delta >= 0 || move.beforeCost !== routeCost(demo.route, demo.distances)) throw new Error("La propuesta 2-opt no es una mejora valida para la ruta actual.");
  if (demo.cursor < demo.steps.length - 1) demo.steps.splice(demo.cursor + 1);
  validateRoute(move.route, demo.instance.dimension);
  const checkedCost = routeCost(move.route, demo.distances);
  if (checkedCost !== move.afterCost) throw new Error("El costo de la ruta no coincide con el cambio incremental.");
  demo.route = [...move.route]; demo.lastMove = move; demo.pending = null; demo.visualKind = null; demo.visualProgress = 1; demo.durationMs = computeMs;
  demo.steps.push({ route: [...demo.route], cost: checkedCost, move, computeMs }); demo.cursor = demo.steps.length - 1;
  updateMetrics();
}
function calculateNextMove() {
  if (!demo.instance || !demo.distances) { setStatus("Carga una instancia antes de ejecutar 2-opt.", true); return null; }
  const started = performance.now(), move = findBestTwoOptMove(demo.route, demo.distances), elapsed = performance.now() - started;
  if (!move) { demo.pending = null; demo.playing = false; stopTimer(); syncDemoControls(); setStatus("Optimizaci\u00f3n completada: no hay intercambio 2-opt que mejore la ruta."); $("#autoState").textContent = "OPTIMIZACI\u00d3N COMPLETADA"; return null; }
  demo.pending = { ...move, computeMs: elapsed }; demo.visualKind = "proposal"; demo.visualProgress = 0; demo.durationMs = elapsed; updateMetrics(); if (demo.playing) animateDemoGeometry(Number($("#speedRange").value));
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
function setSuggestedSpeed() {
  let route = [...demo.route], count = 0, move;
  while ((move = findBestTwoOptMove(route, demo.distances))) { route = move.route; count++; }
  const delay = Math.max(100, Math.min(10000, Math.round(DEFAULT_DEMO_DURATION / (2 * count + 1) / 100) * 100));
  $("#speedRange").value = String(delay);
  $("#speedValue").value = `${delay} ms / movimiento`;
  $("#speedValue").textContent = `${delay} ms / movimiento`;
}
function startPlayback() {
  if (!demo.instance) { setStatus("Carga una instancia antes de iniciar la reproduccion.", true); return; }
  if (demo.playing) return;
  demo.playing = true; $("#autoState").textContent = "REPRODUCCI\u00d3N AUTOM\u00c1TICA"; syncDemoControls(); setStatus("Reproduccion activa. El tiempo indicado mide solo el calculo, no las pausas de animacion.");
  if (demo.pending) { animateDemoGeometry(Number($("#speedRange").value)); demo.timer = setTimeout(playbackTick, Number($("#speedRange").value) * (1-demo.visualProgress)); } else playbackTick();
}
function useStartingRoute(route, description) {
  pausePlayback(false); demo.baseRoute = [...route]; demo.route = [...route]; demo.initialCost = routeCost(route, demo.distances);
  demo.visualKind = null; demo.visualProgress = 1;
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

let loadGeneration = 0;
async function loadInstance(name) {
  const loadId = ++loadGeneration;
  pausePlayback(false); setStatus(`Cargando ${name}...`);
  try {
    const response = await fetch(`public/assets/data/${name}.tsp`);
    if (!response.ok) throw new Error(`No se pudo leer public/assets/data/${name}.tsp (${response.status}).`);
    const instance = parseTsp(await response.text()); if (loadId !== loadGeneration) return; instance.optimal = { berlin52: 7542, eil51: 426 }[name] ?? null;
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
function updateFactorial() {
  const n = Number($("#cityCount").value); $("#cityCountValue").value = String(n); $("#cityCountValue").textContent = String(n);
  let factorial = 1n; for (let k = 2n; k <= BigInt(n - 1); k += 1n) factorial *= k;
  const tours = factorial / 2n; const valueNode = $("#factorialValue");
  const formatted = new Intl.NumberFormat("es-PE").format(tours);
  if (valueNode.textContent !== formatted && !reduceMotion.matches && slides[current].id === "escala") valueNode.animate([{opacity:.55,transform:"translateY(4px)"},{opacity:1,transform:"translateY(0)"}],{duration:300,easing:"ease-out"});
  valueNode.textContent = formatted;
  const group = $("#factorialPlot"); group.replaceChildren(); const ns = "http://www.w3.org/2000/svg";
  const add = (tag, attrs, parent = group) => { const node = document.createElementNS(ns, tag); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value))); parent.appendChild(node); return node; };
  add("path", { d: "M54 10V178H700", fill: "none", stroke: "#648096", "stroke-width": 1.5 });
  const log10factorial = (value) => { let sum = 0; for (let k = 2; k <= value; k += 1) sum += Math.log10(k); return sum - Math.log10(2); };
  const maxLog = log10factorial(39) || 1, points = [];
  for (let cityCount = 3; cityCount <= n; cityCount += 1) {
    const x = 58 + (cityCount - 3) * 638 / 37, y = 176 - log10factorial(cityCount - 1) * 158 / maxLog; points.push(`${x},${y}`);
  }
  add("polyline", { points: points.join(" "), fill: "none", stroke: "#55e1c6", "stroke-width": 3, "stroke-linejoin": "round" });
  const x = 58 + (n - 3) * 638 / 37, y = 176 - log10factorial(n - 1) * 158 / maxLog;
  [5, 10, 20, 30, 40].filter(point => point <= n).forEach(point => add("circle", { cx: 58 + (point-3)*638/37, cy: 176-log10factorial(point-1)*158/maxLog, r: 3.5, fill: "#78dbc9" }));
  add("line", { x1: x, x2: x, y1: y, y2: 178, stroke: "#f1bb77", "stroke-dasharray": "4 5" }); add("circle", { cx: x, cy: y, r: 6, fill: "#f1bb77" });
  [0, 10, 20, 30].forEach((exp) => { const yy = 176 - exp * 158 / maxLog; add("line", { x1: 54, x2: 700, y1: yy, y2: yy, stroke: "#294354", "stroke-width": 1 }); const label = add("text", { x: 5, y: yy + 4, fill: "#a8bfca", "font-size": 12 }); label.textContent = `10^${exp}`; });
  const labelX = add("text", { x: 700, y: 205, fill: "#a8bfca", "font-size": 13, "text-anchor": "end" }); labelX.textContent = "n \u00b7 ciudades";
}
function claimDemoControl() {
  clearTimeout(entryTimer); ++entryGeneration; ++loadGeneration;
}
async function selectInstance(name) {
  claimDemoControl(); const token=entryGeneration;
  await loadInstance(name);
  if (token === entryGeneration && slides[current].id === "demo" && demo.instance?.name.toLowerCase() === name.toLowerCase()) startPlayback();
}
$("#instanceSelect").addEventListener("change", e => selectInstance(e.target.value));
$("#originSelect").addEventListener("change", () => { claimDemoControl(); resetDemo(); startPlayback(); });
$("#shuffleBtn").addEventListener("click", () => { claimDemoControl(); restartSameRoute(); startPlayback(); });
$("#nearestBtn").addEventListener("click", () => { claimDemoControl(); runNearest(); startPlayback(); });
$("#playBtn").addEventListener("click", () => { claimDemoControl(); startPlayback(); });
$("#pauseBtn").addEventListener("click", () => { claimDemoControl(); pausePlayback(); });
$("#continueBtn").addEventListener("click", () => { claimDemoControl(); startPlayback(); });
$("#stepBtn").addEventListener("click", () => { claimDemoControl(); advanceOne(); $("#autoState").textContent="CONTROL MANUAL"; });
$("#backBtn").addEventListener("click", () => { claimDemoControl(); if (!demo.instance) return; pausePlayback(false); if (demo.cursor <= 0) return; demo.cursor--; const previous=demo.steps[demo.cursor]; demo.route=[...previous.route]; demo.lastMove=previous.move; demo.durationMs=previous.computeMs; demo.pending=null; demo.visualKind=null; demo.visualProgress=1; updateMetrics(); $("#autoState").textContent="CONTROL MANUAL"; setStatus(`Retroceso: movimiento ${demo.cursor}; costo ${formatCost(previous.cost)}.`); });
$("#speedRange").addEventListener("input", e => {
  claimDemoControl(); const delay=Number(e.target.value); $("#speedValue").value=`${delay} ms / movimiento`; $("#speedValue").textContent=`${delay} ms / movimiento`;
  if (demo.playing) { stopTimer(); if (demo.pending) { animateDemoGeometry(delay); demo.timer=setTimeout(playbackTick,delay*(1-demo.visualProgress)); } else demo.timer=setTimeout(playbackTick,delay); }
});
$("#cityCount").addEventListener("input", updateFactorial);
$("#tspFile").addEventListener("change", async event => { claimDemoControl(); const token=entryGeneration, file=event.target.files?.[0]; if (!file) return; try { const instance=parseTsp(await file.text()); if (token!==entryGeneration || slides[current].id!=="demo") return; instance.optimal=null; installInstance(instance); $("#instanceSelect").value=""; setStatus(`Archivo ${file.name} cargado y validado. Optimo de referencia no asignado.`); startPlayback(); } catch(error) { setStatus(error.message,true); } });

const initialSlide = slides.findIndex((slide) => slide.id === location.hash.slice(1));
goTo(initialSlide >= 0 ? initialSlide : 0); updateFactorial(); loadInstance($("#instanceSelect").value);
