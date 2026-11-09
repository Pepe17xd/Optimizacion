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
  if (Math.abs(afterCost - beforeCost - bestDelta) > 1e-9 || afterCost >= beforeCost) {
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
      if (Math.abs(cost - move.afterCost) > 1e-9 || cost >= history.at(-1)) throw new Error("La mejora 2-opt no redujo el costo esperado.");
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

// Algoritmos educativos: los estados se calculan antes de reproducirlos.
export function bruteForce(d) {
  validateSymmetricDistances(d); const n=d.length; if(n>10) throw Error('Fuerza bruta limitada a 10 ciudades.');
  let best=Infinity, route=null, evaluated=0; const states=[];
  function visit(p,left){ if(!left.length){if(p[1]>p.at(-1)) return; const cost=routeCost(p,d); evaluated++; if(cost<best){best=cost;route=[...p];states.push({route:[...p],cost,evaluated});} return;} for(const c of left) visit([...p,c],left.filter(x=>x!==c)); }
  visit([0],Array.from({length:n-1},(_,i)=>i+1)); return {route,cost:best,evaluated,states};
}
export function heldKarp(d){
 validateSymmetricDistances(d);const n=d.length;if(n>16)throw Error('Heldâ€“Karp limitado a 16 ciudades.');const memo=new Map();
 function solve(mask,j){const key=mask+','+j;if(memo.has(key))return memo.get(key);if(mask===(1<<j))return {cost:d[0][j],prev:0};let best=Infinity,prev=0;for(let k=1;k<n;k++)if(k!==j&&(mask&(1<<k))){const c=solve(mask^(1<<j),k).cost+d[k][j];if(c<best){best=c;prev=k;}}const v={cost:best,prev};memo.set(key,v);return v;}
 let mask=(1<<n)-2,best=Infinity,last=0;for(let j=1;j<n;j++){const c=solve(mask,j).cost+d[j][0];if(c<best){best=c;last=j;}}const rev=[];while(last){rev.push(last);const p=solve(mask,last).prev;mask^=1<<last;last=p;}return {route:[0,...rev.reverse()],cost:best,states:[],subproblems:memo.size};
}
export function cheapestInsertion(d){validateSymmetricDistances(d);let route=[0,1],remaining=Array.from({length:d.length-2},(_,i)=>i+2),states=[];while(remaining.length){let choice=null;for(const c of remaining)for(let i=0;i<route.length;i++){let a=route[i],b=route[(i+1)%route.length],delta=d[a][c]+d[c][b]-d[a][b];if(!choice||delta<choice.delta)choice={c,i,delta};}route.splice(choice.i+1,0,choice.c);remaining=remaining.filter(x=>x!==choice.c);states.push({route:[...route],delta:choice.delta});}return {route,cost:routeCost(route,d),states};}
function rng(seed){let s=seed>>>0;return ()=>((s=(1664525*s+1013904223)>>>0)/4294967296);}
export function anneal(d,{seed=2026,iterations=200,temperature=10,cooling=.98}={}){validateSymmetricDistances(d);const random=rng(seed);let route=nearestNeighbor(d),cost=routeCost(route,d),best=[...route],bestCost=cost,states=[];for(let t=0;t<iterations;t++){let i=1+Math.floor(random()*(d.length-1)),j=1+Math.floor(random()*(d.length-1));if(i>j)[i,j]=[j,i];let next=[...route];next.splice(i,j-i+1,...next.slice(i,j+1).reverse());let nc=routeCost(next,d),delta=nc-cost,T=temperature*cooling**t,accepted=delta<=0||random()<Math.exp(-delta/T);if(accepted){route=next;cost=nc;}if(cost<bestCost){best=[...route];bestCost=cost;}states.push({route:[...route],cost,bestCost,temperature:T,delta,accepted,probability:delta<=0?1:Math.exp(-delta/T),proposal:next});}return {route:best,cost:bestCost,states};}
export function genetic(d,{seed=2026,iterations=100,population=24}={}){validateSymmetricDistances(d);const random=rng(seed),n=d.length;function shuffle(){let a=Array.from({length:n-1},(_,i)=>i+1);for(let i=a.length-1;i>0;i--){let j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return [0,...a];}let pop=Array.from({length:population},shuffle),states=[];for(let g=0;g<iterations;g++){pop.sort((a,b)=>routeCost(a,d)-routeCost(b,d));let next=[[...pop[0]]], offspring=[];function tournament(){return Array.from({length:3},()=>pop[Math.floor(random()*population)]).sort((a,b)=>routeCost(a,d)-routeCost(b,d))[0];}while(next.length<population){let a=tournament(),b=tournament(),i=1+Math.floor(random()*(n-1)),j=1+Math.floor(random()*(n-1));if(i>j)[i,j]=[j,i];let child=Array(n).fill(null);child[0]=0;for(let k=i;k<=j;k++)child[k]=a[k];let vals=[...b.slice(j+1),...b.slice(1,j+1)].filter(x=>!child.includes(x)),pos=[];for(let k=j+1;k<n;k++)pos.push(k);for(let k=1;k<i;k++)pos.push(k);pos.forEach((k,z)=>child[k]=vals[z]);let beforeMutation=[...child], mutation=null;if(random()<.25){let x=1+Math.floor(random()*(n-1)),y=1+Math.floor(random()*(n-1));[child[x],child[y]]=[child[y],child[x]];mutation=[x,y];}offspring.push({parentA:[...a],parentB:[...b],segment:[i,j],beforeMutation,mutation,child:[...child]});next.push(child);}pop=next;states.push({route:[...pop[0]],cost:routeCost(pop[0],d),generation:g+1,offspring,population:pop.map(r=>[...r])});}pop.sort((a,b)=>routeCost(a,d)-routeCost(b,d));return {route:pop[0],cost:routeCost(pop[0],d),states};}
export function antColony(d,{seed=2026,iterations=50,ants=d.length,alpha=1,beta=2,rho=.5,Q=100}={}){validateSymmetricDistances(d);if(rho<0||rho>=1||alpha<0||beta<0)throw Error('ParÃ¡metros ACO invÃ¡lidos');const random=rng(seed),n=d.length,tau=Array.from({length:n},()=>Array(n).fill(1));let best=null,bestCost=Infinity,states=[];for(let t=0;t<iterations;t++){let tours=[],pheromoneBefore=tau.map(row=>[...row]);for(let a=0;a<ants;a++){let route=[a%n],decisions=[],left=Array.from({length:n},(_,i)=>i).filter(i=>i!==a%n);while(left.length){let from=route.at(-1),w=left.map(j=>tau[from][j]**alpha*(1/Math.max(d[from][j],1e-9))**beta),sum=w.reduce((x,y)=>x+y,0),r=random()*sum,k=0;while(k<w.length-1&&(r-=w[k])>0)k++;let chosen=left[k];decisions.push({from,choices:left.map((city,z)=>({city,probability:w[z]/sum,pheromone:tau[from][city],distance:d[from][city]})),chosen});route.push(left.splice(k,1)[0]);}let cost=routeCost(route,d);tours.push({route,cost,decisions});if(cost<bestCost){bestCost=cost;best=[...route];}}for(let i=0;i<n;i++)for(let j=0;j<n;j++)tau[i][j]*=1-rho;for(const tour of tours)for(let k=0;k<n;k++){let i=tour.route[k],j=tour.route[(k+1)%n];tau[i][j]+=Q/tour.cost;tau[j][i]+=Q/tour.cost;}states.push({iteration:t+1,pheromoneBefore,route:[...best],cost:bestCost,tours,pheromone:tau.map(row=>[...row])});}return {route:best,cost:bestCost,states};}
export function branchBound(d){validateSymmetricDistances(d);if(d.length>10)throw Error('Branch and bound limitado a 10 ciudades.');let initial=nearestNeighbor(d),best=routeCost(initial,d),route=initial,pruned=0,states=[];function visit(path,left,cost){if(!left.length){let total=cost+d[path.at(-1)][0];if(total<best){best=total;route=[...path];states.push({route:[...route],cost:best,pruned});}return;}let bound=cost;for(const v of [path.at(-1),...left]){let options=[...left,0].filter(x=>x!==v);bound+=Math.min(...options.map(x=>d[v][x]));}if(bound>=best-1e-10){pruned++;return;}for(const v of left)visit([...path,v],left.filter(x=>x!==v),cost+d[path.at(-1)][v]);}visit([0],Array.from({length:d.length-1},(_,i)=>i+1),0);return {route,cost:best,pruned,states:[{route,cost:best,pruned}]};}



// Trazas pequeñas para enseñanza: eventos reales, separados del renderizado.
export function bruteTrace(d) {
 validateSymmetricDistances(d); if(d.length>8) throw Error('Traza limitada a 8 ciudades'); let states=[], best=Infinity, bestRoute=null;
 function visit(p,left){if(!left.length){if(p[1]>p.at(-1))return;let cost=routeCost(p,d),improved=cost<best-1e-9;if(improved){best=cost;bestRoute=[...p];}states.push({route:[...p],cost,best,bestRoute:[...bestRoute],improved,evaluated:states.length+1});return;}for(const x of left)visit([...p,x],left.filter(y=>y!==x));}
 visit([0],Array.from({length:d.length-1},(_,i)=>i+1));return states;
}
export function heldTrace(d){
 validateSymmetricDistances(d);if(d.length>8)throw Error('Traza limitada a 8 ciudades');let memo=new Map(),events=[];
 function solve(mask,j){let key=mask+','+j;if(memo.has(key)){let v=memo.get(key);events.push({type:'reuse',mask,j,cost:v.cost});return v;}let best=Infinity,prev=0;if(mask===(1<<j))best=d[0][j];else for(let k=1;k<d.length;k++)if(k!==j&&(mask&(1<<k))){let c=solve(mask^(1<<j),k).cost+d[k][j];if(c<best){best=c;prev=k;}}let v={cost:best,prev};memo.set(key,v);events.push({type:'save',mask,j,cost:best,prev});return v;}
 let mask=(1<<d.length)-2,best=Infinity,last=0;for(let j=1;j<d.length;j++){let c=solve(mask,j).cost+d[j][0];if(c<best){best=c;last=j;}}let reverse=[];while(last){reverse.push(last);events.push({type:'reconstruct',mask,j:last,path:[0,...reverse.slice().reverse()]});let p=solve(mask,last).prev;mask^=1<<last;last=p;}return {events,route:[0,...reverse.reverse()],cost:best};
}
export function branchTrace(d){validateSymmetricDistances(d);if(d.length>8)throw Error('Traza limitada a 8 ciudades');let bestRoute=nearestNeighbor(d),best=routeCost(bestRoute,d),events=[];function visit(path,left,cost){if(!left.length){let total=cost+d[path.at(-1)][0];if(total<best){best=total;bestRoute=[...path];}events.push({path:[...path],cost:total,bound:total,best,type:'leaf'});return;}let bound=cost;for(const v of [path.at(-1),...left])bound+=Math.min(...[...left,0].filter(x=>x!==v).map(x=>d[v][x]));let type=bound>=best-1e-10?'prune':'branch';events.push({path:[...path],cost,bound,best,type});if(type==='branch')for(const x of left)visit([...path,x],left.filter(y=>y!==x),cost+d[path.at(-1)][x]);}visit([0],Array.from({length:d.length-1},(_,i)=>i+1),0);return {events,route:bestRoute,cost:best};}
export function insertionTrace(d){validateSymmetricDistances(d);let route=[0,1],left=Array.from({length:d.length-2},(_,i)=>i+2),events=[];while(left.length){let candidates=[];for(const city of left)for(let i=0;i<route.length;i++){let a=route[i],b=route[(i+1)%route.length];candidates.push({city,i,a,b,delta:d[a][city]+d[city][b]-d[a][b]});}candidates.sort((a,b)=>a.delta-b.delta);let chosen=candidates[0],before=[...route];route.splice(chosen.i+1,0,chosen.city);left=left.filter(x=>x!==chosen.city);events.push({before,route:[...route],candidates,chosen});}return events;}
export function twoOptExchange(route,d,i,j){validateSymmetricDistances(d);validateRoute(route,d.length);if(!Number.isInteger(i)||!Number.isInteger(j))throw Error('Selecciona dos aristas');if(i>j)[i,j]=[j,i];if(i<0||j>=route.length||j-i<2||(i===0&&j===route.length-1))throw Error('Selecciona aristas no adyacentes');let a=route[i],b=route[(i+1)%route.length],c=route[j],e=route[(j+1)%route.length],next=[...route];next.splice(i+1,j-i,...route.slice(i+1,j+1).reverse());return {route:next,removed:[[a,b],[c,e]],added:[[a,c],[b,e]],delta:routeCost(next,d)-routeCost(route,d),cost:routeCost(next,d)};}
export function orderCrossover(a,b,i,j){validateRoute(a,a.length);validateRoute(b,a.length);if(i<1||j>=a.length||i>j)throw Error('Segmento OX inválido');let child=Array(a.length).fill(null);child[0]=0;for(let k=i;k<=j;k++)child[k]=a[k];let slots=[],other=[];for(let k=j+1;k<a.length;k++)slots.push(k);for(let k=1;k<i;k++)slots.push(k);for(let k=j+1;k<a.length;k++)other.push(b[k]);for(let k=1;k<=j;k++)other.push(b[k]);other=other.filter(x=>!child.includes(x));slots.forEach((k,z)=>child[k]=other[z]);validateRoute(child,a.length);return child;}
