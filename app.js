'use strict';

const slides = [...document.querySelectorAll('.slide')];
let current = 0;
let overviewReturnFocus = null;
const $ = (selector) => document.querySelector(selector);
const overview = $('#overview');
const overviewLinks = $('#overviewLinks');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function goTo(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
  const activeSlide = slides[current];
  activeSlide.scrollTop = 0;
  $('#progress').style.width = `${((current + 1) / slides.length) * 100}%`;
  history.replaceState(null, '', `#${activeSlide.id}`);

  if (window.matchMedia('(max-width: 900px)').matches) {
    activeSlide.scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}

function openOverview(open) {
  overview.classList.toggle('open', open);
  overview.setAttribute('aria-hidden', String(!open));
  if (open) {
    overviewReturnFocus = document.activeElement;
    overviewLinks.querySelector('button')?.focus();
  } else if (overviewReturnFocus instanceof HTMLElement) {
    overviewReturnFocus.focus({ preventScroll: true });
  }
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen?.();
  } else {
    document.documentElement.requestFullscreen?.();
  }
}

$('#closeOverview').addEventListener('click', () => openOverview(false));
overview.addEventListener('click', (event) => {
  if (event.target === overview) openOverview(false);
});

document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = slides.findIndex((slide) => slide.id === button.dataset.go);
    if (target >= 0) goTo(target);
  });
});

slides.forEach((slide, index) => {
  const button = document.createElement('button');
  const number = document.createElement('span');
  number.textContent = String(index + 1).padStart(2, '0');
  const title = slide.querySelector('h1, h2')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 55)
    || slide.dataset.section;
  button.append(number, document.createTextNode(title));
  button.addEventListener('click', () => {
    goTo(index);
    openOverview(false);
    const heading = slide.querySelector('h1, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  });
  overviewLinks.appendChild(button);
});

document.addEventListener('keydown', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const isInteractive = target?.closest('button, summary, input, textarea, select, [contenteditable="true"]');

  if (overview.classList.contains('open')) {
    if (event.key === 'Escape') {
      event.preventDefault();
      openOverview(false);
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [...overview.querySelectorAll('button')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    return;
  }

  if (event.key.toLowerCase() === 'm') {
    event.preventDefault();
    openOverview(true);
    return;
  }
  if (event.key.toLowerCase() === 'f') {
    event.preventDefault();
    toggleFullscreen();
    return;
  }
  if (isInteractive && event.key === ' ') return;

  if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    goTo(current + 1);
  } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    goTo(current - 1);
  } else if (event.key === 'Home') {
    goTo(0);
  } else if (event.key === 'End') {
    goTo(slides.length - 1);
  }
});

window.addEventListener('hashchange', () => {
  const index = slides.findIndex((slide) => slide.id === location.hash.slice(1));
  if (index >= 0) goTo(index);
});

const initialSlide = slides.findIndex((slide) => slide.id === location.hash.slice(1));
goTo(initialSlide >= 0 ? initialSlide : 0);
// Optional real figures. No invented experimental values.
document.querySelectorAll('[data-figure]').forEach(fig=>{const img=fig.querySelector('img');img.onload=()=>fig.classList.add('has-image');img.onerror=()=>fig.classList.remove('has-image');img.src=fig.dataset.figure});
const NS='http://www.w3.org/2000/svg';function el(tag,attrs,parent){const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));parent.appendChild(n);return n}const pts=[[100,96],[305,63],[431,171],[370,366],[167,419],[50,285],[242,220],[330,277]];const heroE=$('#heroEdges'),heroN=$('#heroNodes');const order=[0,1,2,3,7,4,5,6,0];pts.forEach(([x,y],i)=>{pts.forEach(([a,b],j)=>{if(j>i&&Math.hypot(x-a,y-b)<330)el('line',{x1:x,y1:y,x2:a,y2:b,stroke:'#366075','stroke-opacity':'.27','stroke-width':'1'},heroE)});el('circle',{cx:x,cy:y,r:i===0?9:6,fill:i===0?'#f1bb77':'#d7f3ec',stroke:'#07111e','stroke-width':3},heroN)});const heroPath=$('#heroPath');heroPath.setAttribute('d','M'+order.map(i=>pts[i].join(',')).join(' L'));const pathLength=heroPath.getTotalLength();heroPath.style.strokeDasharray=pathLength;if(reduceMotion.matches){heroPath.style.strokeDashoffset=0}else{heroPath.style.strokeDashoffset=pathLength;heroPath.animate([{strokeDashoffset:pathLength},{strokeDashoffset:0}],{duration:2300,fill:'forwards',easing:'ease-in-out'})}
const xy=[[90,80],[330,72],[375,245],[210,288],[65,230]],pedges=$('#problemEdges'),pnodes=$('#problemNodes');const edgeOrder=[0,1,2,3,4,0];el('polyline',{points:edgeOrder.map(i=>xy[i].join(',')).join(' '),stroke:'#55e1c6',fill:'none','stroke-width':4,'stroke-linejoin':'round'},pedges);xy.forEach(([x,y],i)=>{el('circle',{cx:x,cy:y,r:12,fill:i===0?'#f1bb77':'#e8f7f3'},pnodes);const t=el('text',{x:x+16,y:y-12,fill:'#d7e7ee','font-size':18},pnodes);t.textContent=i===0?'O':['','A','B','C','D'][i]});
function rand(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}const rr=rand(75),routePoints=Array.from({length:24},()=>[25+rr()*375,18+rr()*265]);const rs=$('#routeDemoSvg');el('polyline',{points:[...routePoints,routePoints[0]].map(p=>p.join(',')).join(' '),fill:'none',stroke:'#56dec4','stroke-width':2,'stroke-opacity':'.7'},rs);routePoints.forEach(([x,y])=>el('circle',{cx:x,cy:y,r:3.2,fill:'#efc08c'},rs));
const canvas=$('#demoCanvas'),ctx=canvas.getContext('2d');const scale=canvas.width/560;let demoPts=[],demoOrder=[];let demoSeed=12;function randLocal(){demoSeed=(1664525*demoSeed+1013904223)>>>0;return demoSeed/4294967296}function resetDemo(){demoPts=Array.from({length:13},()=>[35+randLocal()*490,28+randLocal()*276]);demoOrder=demoPts.map((_,i)=>i);for(let i=demoOrder.length-1;i>0;i--){const j=Math.floor(randLocal()*(i+1));[demoOrder[i],demoOrder[j]]=[demoOrder[j],demoOrder[i]]}drawDemo()}function lengthOf(o){return o.reduce((a,u,i)=>{const v=o[(i+1)%o.length];return a+Math.hypot(demoPts[u][0]-demoPts[v][0],demoPts[u][1]-demoPts[v][1])},0)}function drawDemo(){ctx.clearRect(0,0,560,340);ctx.fillStyle='#0d2030';ctx.fillRect(0,0,560,340);ctx.strokeStyle='#1a3446';ctx.lineWidth=1;for(let x=20;x<560;x+=35){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,340);ctx.stroke()}for(let y=10;y<340;y+=35){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(560,y);ctx.stroke()}ctx.lineWidth=2.7;ctx.strokeStyle='#55e1c6';ctx.beginPath();demoOrder.forEach((id,i)=>{const [x,y]=demoPts[id];if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y)});ctx.lineTo(...demoPts[demoOrder[0]]);ctx.stroke();demoPts.forEach(([x,y],i)=>{ctx.beginPath();ctx.fillStyle=i===0?'#f1bb77':'#f1f8f8';ctx.arc(x,y,i===0?6:4,0,2*Math.PI);ctx.fill()});ctx.fillStyle='#bed3df';ctx.font='12px DM Sans, sans-serif';ctx.fillText('Longitud relativa: '+Math.round(lengthOf(demoOrder))+' u.',17,22)}function twoOpt(){let changed=true,iter=0;while(changed&&iter++<100){changed=false;for(let i=0;i<demoOrder.length-1;i++){for(let j=i+2;j<demoOrder.length;j++){if(i===0&&j===demoOrder.length-1)continue;const copy=demoOrder.slice();copy.splice(i+1,j-i,...demoOrder.slice(i+1,j+1).reverse());if(lengthOf(copy)<lengthOf(demoOrder)-.00001){demoOrder=copy;changed=true}}}}drawDemo()}$('#shuffleBtn').addEventListener('click',resetDemo);$('#optimizeBtn').addEventListener('click',twoOpt);resetDemo();
