import assert from 'node:assert/strict';
import {bruteForce,heldKarp,branchBound,cheapestInsertion,anneal,genetic,antColony,nearestNeighbor,routeCost,validateRoute,findBestTwoOptMove,parseTsp,buildDistances} from '../src/js/tsp-engine.js';
import {readFileSync} from 'node:fs';
const d=[[0,6.3,8.6,9.4,7.1,3.6],[6.3,0,3.2,6.1,7.1,4.1],[8.6,3.2,0,3.6,6.3,5.4],[9.4,6.1,3.6,0,4.1,5.8],[7.1,7.1,6.3,4.1,0,4.1],[3.6,4.1,5.4,5.8,4.1,0]];
const independent=r=>r.reduce((s,x,i)=>s+d[x][r[(i+1)%r.length]],0);
const exact=bruteForce(d);assert.equal(exact.evaluated,60);assert.ok(Math.abs(exact.cost-24.9)<1e-9);assert.ok(Math.abs(routeCost([0,1,4,2,5,3],d)-40.3)<1e-9);
for(const fn of [heldKarp,branchBound,cheapestInsertion,anneal,genetic,antColony]){const r=fn(d);assert.ok(validateRoute(r.route,6));assert.ok(Math.abs(independent(r.route)-r.cost)<1e-8);if(fn===heldKarp||fn===branchBound)assert.ok(Math.abs(r.cost-exact.cost)<1e-8);}
for(const fn of [anneal,genetic,antColony])assert.deepEqual(fn(d,{seed:42}),fn(d,{seed:42}));
assert.ok(Math.abs(routeCost(nearestNeighbor(d),d)-25.7)<1e-9);let m=findBestTwoOptMove([0,2,4,1,5,3],d);assert.ok(m.afterCost<m.beforeCost);
for(const name of ['berlin52','eil51']){let instance=parseTsp(readFileSync(`public/assets/data/${name}.tsp`,'utf8'));let dist=buildDistances(instance);assert.ok(validateRoute(nearestNeighbor(dist),instance.dimension));}
console.log('Pruebas correctas: caso del informe, exactos, heurísticas, metaheurísticas, reproducibilidad y TSPLIB.');

import {bruteTrace,heldTrace,branchTrace,insertionTrace,twoOptExchange,orderCrossover} from '../src/js/tsp-engine.js';
const traces=bruteTrace(d);assert.equal(traces.length,60);assert.ok(Math.abs(traces.at(-1).best-24.9)<1e-9);assert.equal(traces.filter(t=>t.improved).length,bruteForce(d).states.length);
const ht=heldTrace(d);assert.ok(ht.events.some(x=>x.type==='reuse'));assert.ok(Math.abs(ht.cost-24.9)<1e-9);assert.ok(validateRoute(ht.route,6));
const bt=branchTrace(d);assert.ok(bt.events.some(x=>x.type==='prune'));assert.ok(bt.events.filter(x=>x.type==='prune').every(x=>x.bound>=x.best-1e-9));assert.ok(Math.abs(bt.cost-24.9)<1e-9);
const it=insertionTrace(d);assert.equal(it.length,4);for(const step of it){assert.ok(step.candidates.every(c=>c.delta>=step.chosen.delta-1e-9));}
const r0=[0,2,4,1,5,3],exchange=twoOptExchange(r0,d,0,2);assert.ok(validateRoute(exchange.route,6));assert.ok(Math.abs(routeCost(exchange.route,d)-routeCost(r0,d)-exchange.delta)<1e-9);assert.throws(()=>twoOptExchange(r0,d,0,1));
const parentA=[0,1,2,3,4,5],parentB=[0,4,5,2,1,3],child=orderCrossover(parentA,parentB,2,3);assert.ok(validateRoute(child,6));assert.deepEqual(child.slice(2,4),parentA.slice(2,4));
const ac=antColony(d,{seed:10,iterations:2});for(const state of ac.states)for(const tour of state.tours)for(const decision of tour.decisions){assert.ok(Math.abs(decision.choices.reduce((s,c)=>s+c.probability,0)-1)<1e-9);assert.ok(decision.choices.some(c=>c.city===decision.chosen));}
console.log('Trazas, cotas, decisiones probabilísticas, OX y 2-opt verificadas.');
