import { buildDistances, improveTwoOpt, nearestNeighbor, parseTsp, routeCost, shuffledRoute, validateRoute } from "./tsp-engine.js";

"use strict";

const $ = (selector) => document.querySelector(selector);
const slides = [...document.querySelectorAll(".slide")];
const overview = $("#overview");
const overviewLinks = $("#overviewLinks");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let current = 0;
let overviewReturnFocus = null;

function goTo(index, { focus = false } = {}) {
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
  else document.documentElement.requestFullscreen?.().catch(() => {});
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
  instance: null, distances: null, route: [], initialCost: 0, history: [], durationMs: 0, lastMove: null,
  canvas: $("#demoCanvas"), chart: $("#costChart"),
};
const ctx = demo.canvas.getContext("2d");
const chartCtx = demo.chart.getContext("2d");
const colors = { bg:"#0d2030", grid:"#1a3446", route:"#55e1c6", city:"#f4f7fb", start:"#f1bb77", text:"#d5e4ea" };

function setStatus(message, error = false) {
  const status = $("#demoStatus"); status.textContent = message; status.classList.toggle("is-error", error);
}

function drawRoute() {
  const { nodes } = demo.instance;
  const width = demo.canvas.width, height = demo.canvas.height;
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = colors.bg; ctx.fillRect(0,0,width,height);
  ctx.strokeStyle = colors.grid; ctx.lineWidth = 1;
  for (let x=20; x<width; x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
  for (let y=20; y<height; y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }
  const pad = 42;
  const xs = nodes.map((node) => node.x), ys = nodes.map((node) => node.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min((width-pad*2)/(maxX-minX || 1),(height-pad*2)/(maxY-minY || 1));
  const points = nodes.map((node) => ({ x:pad+(node.x-minX)*scale, y:pad+(maxY-node.y)*scale }));
  ctx.beginPath();
  demo.route.forEach((city, index) => { const point = points[city]; if (index === 0) ctx.moveTo(point.x,point.y); else ctx.lineTo(point.x,point.y); });
  const first = points[demo.route[0]]; ctx.lineTo(first.x,first.y);
  ctx.strokeStyle = colors.route; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
  if (demo.lastMove) {
    const drawEdges=(edges,color,dash,width)=>{
      ctx.beginPath();
      edges.forEach(([a,b])=>{ctx.moveTo(points[a].x,points[a].y);ctx.lineTo(points[b].x,points[b].y);});
      ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);
    };
    drawEdges(demo.lastMove.removed,"#ef8f7a",[9,7],4);
    drawEdges(demo.lastMove.added,"#55e1c6",[],5);
  }
  points.forEach((point, index) => {
    ctx.beginPath(); ctx.arc(point.x,point.y,index===demo.route[0]?6:4,0,Math.PI*2);
    ctx.fillStyle = index===demo.route[0]?colors.start:colors.city; ctx.fill();
  });
  ctx.fillStyle = colors.text; ctx.font = "18px system-ui";
  ctx.fillText(`${demo.instance.name} · ${nodes.length} ciudades · EUC_2D`, 20, 28);
}

function drawChart() {
  const width = demo.chart.width, height = demo.chart.height;
  chartCtx.clearRect(0,0,width,height); chartCtx.fillStyle = colors.bg; chartCtx.fillRect(0,0,width,height);
  chartCtx.strokeStyle = colors.grid; chartCtx.beginPath(); chartCtx.moveTo(40,12); chartCtx.lineTo(40,height-22); chartCtx.lineTo(width-14,height-22); chartCtx.stroke();
  if (!demo.history.length) return;
  const low = Math.min(...demo.history), high = Math.max(...demo.history), span = high-low || 1;
  chartCtx.beginPath();
  demo.history.forEach((value,index) => {
    const x = 44 + index * (width-64) / Math.max(1,demo.history.length-1);
    const y = 14 + (high-value) * (height-42) / span;
    if (index === 0) chartCtx.moveTo(x,y); else chartCtx.lineTo(x,y);
  });
  chartCtx.strokeStyle = colors.route; chartCtx.lineWidth=2.5; chartCtx.stroke();
  chartCtx.fillStyle = colors.text; chartCtx.font="15px system-ui";
  chartCtx.fillText(`${Math.round(high)} → ${Math.round(low)} · ${demo.history.length-1} mejoras`,46,18);
}

function updateMetrics() {
  const cost = routeCost(demo.route, demo.distances);
  $("#initialCost").textContent = Math.round(demo.initialCost).toLocaleString("es-PE");
  $("#finalCost").textContent = Math.round(cost).toLocaleString("es-PE");
  $("#demoGap").textContent = demo.instance.optimal ? `${(100*(cost-demo.instance.optimal)/demo.instance.optimal).toFixed(2)} %` : "—";
  $("#demoReduction").textContent = demo.initialCost ? `${(100*(demo.initialCost-cost)/demo.initialCost).toFixed(2)} %` : "0.00 %";
  $("#demoTime").textContent = `${demo.durationMs.toFixed(2)} ms`;
  $("#demoTitle").textContent = `${demo.instance.name.toUpperCase()} · ${demo.instance.edgeWeightType}`;
  drawRoute(); drawChart();
}

function populateOrigin() {
  const select = $("#originSelect"); select.replaceChildren();
  demo.instance.nodes.forEach((node,index) => {
    const option = document.createElement("option"); option.value=String(index); option.textContent=String(node.id); select.appendChild(option);
  });
}

function resetDemo() {
  const start = Number($("#originSelect").value || 0);
  const seed = 2026 + start;
  demo.route = shuffledRoute(demo.instance.dimension, start, seed);
  demo.lastMove=null;
  demo.initialCost = routeCost(demo.route,demo.distances);
  demo.history = [demo.initialCost]; demo.durationMs=0;
  validateRoute(demo.route,demo.instance.dimension); updateMetrics();
  setStatus(`Ruta inicial reproducible (semilla ${seed}), cerrada en la ciudad ${demo.instance.nodes[start].id}.`);
}

function runNearest() {
  const started=performance.now();
  demo.route=nearestNeighbor(demo.distances,Number($("#originSelect").value));
  demo.lastMove=null;
  demo.durationMs=performance.now()-started;
  demo.initialCost=routeCost(demo.route,demo.distances); demo.history=[demo.initialCost];
  updateMetrics(); setStatus("Vecino más cercano calculado; la ruta recorre todas las ciudades y vuelve al origen.");
}

function runTwoOpt() {
  const result=improveTwoOpt(demo.route,demo.distances);
  demo.route=result.route; demo.history=result.history; demo.durationMs=result.durationMs;
  demo.lastMove=result.lastMove;
  validateRoute(demo.route,demo.instance.dimension); updateMetrics();
  setStatus(`2-opt terminó con ${result.moves} intercambios aceptados. La duración se mide en este navegador y equipo.`);
}

async function loadInstance(name) {
  setStatus(`Cargando ${name}…`);
  try {
    const response=await fetch(`results/${name}.tsp`);
    if (!response.ok) throw new Error(`No se pudo leer results/${name}.tsp (${response.status}).`);
    const instance=parseTsp(await response.text());
    instance.optimal={ berlin52:7542, eil51:426 }[name] ?? null;
    installInstance(instance);
  } catch (error) { setStatus(`${error.message} Carga el archivo oficial .tsp o abre el sitio con un servidor estático local.`,true); }
}

function installInstance(instance) {
  demo.instance=instance; demo.distances=buildDistances(instance); populateOrigin(); resetDemo();
  $("#demoTitle").textContent=`${instance.name.toUpperCase()} · ${instance.edgeWeightType}`;
}

$("#instanceSelect").addEventListener("change",(event) => loadInstance(event.target.value));
$("#originSelect").addEventListener("change",resetDemo);
$("#shuffleBtn").addEventListener("click",resetDemo);
$("#nearestBtn").addEventListener("click",runNearest);
$("#optimizeBtn").addEventListener("click",runTwoOpt);
$("#tspFile").addEventListener("change",async(event) => {
  const file=event.target.files?.[0]; if (!file) return;
  try { installInstance(parseTsp(await file.text())); $("#instanceSelect").value=""; setStatus(`Archivo ${file.name} cargado y validado. Óptimo conocido solo disponible para berlin52 y eil51 oficiales.`); }
  catch(error) { setStatus(error.message,true); }
});

const initialSlide=slides.findIndex((slide) => slide.id===location.hash.slice(1));
goTo(initialSlide>=0?initialSlide:0);
loadInstance($("#instanceSelect").value);
