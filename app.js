'use strict';
const $=s=>document.querySelector(s),map=$('#map'),surface=$('#map-surface'),dialog=$('#poster-dialog'),helpDialog=$('#help-dialog');
const islandPoints=[[19,20],[21,50],[20,80],[49,68],[60,25],[62,84],[83,50],[86,84]];regions.forEach((r,i)=>{[r.x,r.y]=islandPoints[i];});
const posterPath=p=>`assets/posters/${p.id}.png`;
let camera={x:50,y:50,zoom:innerWidth<=760?1.35:1},posterIndex=0,filter=null,drag=null,scenePaused=false,mapPaused=false,sceneFrame=0,mapFrame=0,lastScene=0,lastMap=0,loadVersion=0,sceneReady=false,mapReady=false,storyEnded=false;
const continuousPreview=new URLSearchParams(location.search).get('animation')==='continuous';
let continuousPlayer=null,continuousModules;
async function loadContinuousModules(){
 if(!continuousModules)continuousModules=(async()=>{
  if(!window.PIXI)await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='vendor/pixi.min.js';script.onload=resolve;script.onerror=()=>reject(new Error('Renderer unavailable'));document.head.append(script);});
  const [{catalog},{MaterialScene},{SeattleScene}]=await Promise.all([import('./animation/catalog.mjs'),import('./animation/material-scene.mjs'),import('./animation/seattle.mjs')]);return {catalog,MaterialScene,SeattleScene};
 })().catch(e=>{continuousModules=null;throw e;});return continuousModules;
}
function disposeContinuous(){const previous=continuousPlayer;continuousPlayer=null;previous?.destroy();$('#continuous-scene')?.remove();}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
let visited=new Set();try{visited=new Set(JSON.parse(localStorage.getItem('shell-atlas-visited')||'[]'));}catch{}
function geometry(){const r=map.getBoundingClientRect(),fit=Math.min(r.width/1600,r.height/1200);return{w:1600*fit*camera.zoom,h:1200*fit*camera.zoom,vw:r.width,vh:r.height};}
function paintCamera(){const g=geometry(),limit=(v,size,view)=>size<=view?50:Math.max(view/size*50,Math.min(100-view/size*50,v));camera.x=limit(camera.x,g.w,g.vw);camera.y=limit(camera.y,g.h,g.vh);surface.style.width=g.w+'px';surface.style.height=g.h+'px';surface.style.left=g.vw/2-camera.x/100*g.w+'px';surface.style.top=g.vh/2-camera.y/100*g.h+'px';$('#zoom-out').disabled=camera.zoom<=1;$('#zoom-in').disabled=camera.zoom>=3;}
function zoom(d){camera.zoom=Math.max(1,Math.min(3,camera.zoom+d));paintCamera();}
const destinationPoints=[[23,15],[32,20],[25,42],[15,49],[26,50],[35,55],[24,60],[14,59],[7,54],[23,73],[30,83],[12,87],[51,67],[45,75],[65,20],[72,29],[65,83],[56,87],[88,46],[78,54],[85,85],[92,81],[80,92]];
function renderMarkers(){places.forEach((p,i)=>{const b=document.createElement('button');b.className='landmark destination-landmark';b.dataset.id=p.id;b.style.left=destinationPoints[i][0]+'%';b.style.top=destinationPoints[i][1]+'%';b.setAttribute('aria-label',`走进${p.name}`);b.innerHTML=`<span class="place-label">${p.en}</span>`;b.onclick=e=>{e.stopPropagation();openPoster(i);};$('#markers').append(b);});}
function updateVisited(){try{localStorage.setItem('shell-atlas-visited',JSON.stringify([...visited]));}catch{}$('#progress').textContent=`${visited.size} / 23`;renderNotebook();}
function renderNotebook(){$('#destinations').replaceChildren();for(const p of places.filter(p=>!filter||p.region===filter)){const b=document.createElement('button');b.className='destination';b.innerHTML=`<img src="${posterPath(p)}" alt="" loading="lazy"><span><strong>${p.name}</strong><small>${p.en}</small></span><span class="stamp ${visited.has(p.id)?'done':''}">${visited.has(p.id)?'已到访':String(p.number).padStart(2,'0')}</span>`;b.onclick=()=>{closeNotebook();openPoster(places.indexOf(p));};$('#destinations').append(b);}}
function renderRegions(){for(const r of [{id:null,name:'全部'},...regions]){let b=document.createElement('button');b.textContent=r.name;b.setAttribute('aria-pressed',String(r.id===filter));b.onclick=()=>{filter=r.id;$('#regions').replaceChildren();renderRegions();renderNotebook();};$('#regions').append(b);}}
function closeNotebook(){$('#collection').hidden=true;$('#collection-toggle').setAttribute('aria-expanded','false');}
const filmBindings=new WeakMap(),imageLoads=new Map();
const MAP_FILM={frames:Array.from({length:6},(_,i)=>`assets/map-frames/${i+1}.png`)};
function loadImage(src){
  if(!imageLoads.has(src))imageLoads.set(src,new Promise((resolve,reject)=>{
    const image=new Image();image.onload=()=>{
      const finish=()=>{resolve(image);while(imageLoads.size>24)imageLoads.delete(imageLoads.keys().next().value);};
      image.decode().then(finish,finish);
    };
    image.onerror=()=>{imageLoads.delete(src);reject(new Error('Image unavailable'));};image.src=src;
  }));
  return imageLoads.get(src);
}
function showFrame(el,frame){
  const film=filmBindings.get(el);
  if(film?.frames){el.style.backgroundImage=`url('${film.frames[frame]}')`;el.style.backgroundPosition='center';}
  else el.style.backgroundPosition=`${frame%3*50}% ${frame<3?0:100}%`;
  el.dataset.frame=String(frame);
}
function setFilm(el,film){
  filmBindings.set(el,film);el.style.backgroundSize=film.frames?'100% 100%':'300% 200%';
  if(!film.frames)el.style.backgroundImage=`url('${film.src}')`;
  showFrame(el,0);
}
async function openPoster(i){
  disposeContinuous();
  posterIndex=(i+places.length)%places.length;
  const p=places[posterIndex],film=FILMS[p.id],version=++loadVersion;
  dialog.classList.toggle('approaching-ship',!continuousPreview&&p.id==='Seattle'&&film.story==='cargo_approach');
  sceneReady=false;storyEnded=false;sceneFrame=0;lastScene=0;scenePaused=reduceMotion.matches;
  dialog.setAttribute('aria-label',p.name+'的材料故事');
  $('#story-film').setAttribute('aria-label',p.name+'：纸面材料拼贴中的光影与环境变化');
  $('#story-film').hidden=true;$('#story-loading').hidden=false;$('#story-error').hidden=true;
  $('#full-poster').hidden=true;$('#scene-stage').hidden=false;dialog.classList.remove('poster-view');
  $('#toggle-poster').setAttribute('aria-pressed','false');$('#toggle-poster').setAttribute('aria-label','查看完整海报');
  $('#pause-scene').setAttribute('aria-pressed',String(scenePaused));
  $('#pause-scene').setAttribute('aria-label',scenePaused?'继续故事':'暂停故事');
  $('#pause-scene').textContent=scenePaused?'▷':'Ⅱ';
  $('#poster-image').src=posterPath(p);$('#poster-image').alt=p.name+'完整摄影与拼贴海报';
  if(!dialog.open)dialog.showModal();
  try{
    if(continuousPreview){
      const {catalog,MaterialScene,SeattleScene}=await loadContinuousModules();
      if(version!==loadVersion||!dialog.open)return;
      const scene=catalog.find(s=>s.id===p.id),host=document.createElement('div');
      host.id='continuous-scene';host.style.cssText='width:100%;height:100%;position:absolute;inset:0';
      const ratio=scene.crop[2]/scene.crop[3];$('#scene-stage').style.setProperty('--film-ratio',ratio);dialog.style.setProperty('--film-ratio',ratio);
      const renderer=await (p.id==='Seattle'?SeattleScene:MaterialScene).mount(host,{scene,onTime:(t,state)=>{
        if(version!==loadVersion)return;
        if(state.ended){storyEnded=true;scenePaused=true;$('#pause-scene').textContent='↻';$('#pause-scene').setAttribute('aria-label','重播故事');$('#pause-scene').setAttribute('aria-pressed','true');}
      }});
      if(version!==loadVersion||!dialog.open){await renderer.destroy();return;}
      continuousPlayer=renderer;$('#scene-stage').append(host);$('#story-loading').hidden=true;sceneReady=true;
      if(!scenePaused)renderer.play();visited.add(p.id);updateVisited();return;
    }
    const images=await Promise.all((film.frames||[film.src]).map(loadImage));
    if(version!==loadVersion)return;
    const ratio=images[0].naturalWidth/images[0].naturalHeight*(film.frames?1:2/3);
    setFilm($('#story-film'),film);
    $('#scene-stage').style.setProperty('--film-ratio',ratio);dialog.style.setProperty('--film-ratio',ratio);
    $('#story-loading').hidden=true;$('#story-film').hidden=false;sceneReady=true;
    visited.add(p.id);updateVisited();
  }catch{
    if(version!==loadVersion)return;
    $('#story-loading').hidden=true;$('#story-error').hidden=false;
  }
}
$('#close-poster').onclick=()=>dialog.close();$('#previous').onclick=()=>openPoster(posterIndex-1);$('#next').onclick=()=>openPoster(posterIndex+1);
$('#toggle-poster').onclick=()=>{const full=$('#full-poster').hidden;$('#full-poster').hidden=!full;$('#scene-stage').hidden=full;dialog.classList.toggle('poster-view',full);if(continuousPlayer){if(full)continuousPlayer.pause();else if(!scenePaused&&!storyEnded)continuousPlayer.play();}$('#toggle-poster').setAttribute('aria-pressed',String(full));$('#toggle-poster').setAttribute('aria-label',full?'回到逐帧故事':'查看完整海报');};$('#pause-scene').onclick=()=>{if(continuousPreview){if(!continuousPlayer)return;if(storyEnded){continuousPlayer.seek(0);storyEnded=false;scenePaused=true;}scenePaused=!scenePaused;if(scenePaused)continuousPlayer.pause();else if($('#full-poster').hidden)continuousPlayer.play();$('#pause-scene').setAttribute('aria-pressed',String(scenePaused));$('#pause-scene').setAttribute('aria-label',scenePaused?'继续故事':'暂停故事');$('#pause-scene').textContent=scenePaused?'▷':'Ⅱ';return;}if(storyEnded){storyEnded=false;sceneFrame=0;showFrame($('#story-film'),0);lastScene=performance.now();scenePaused=true;}scenePaused=!scenePaused;lastScene=performance.now();$('#pause-scene').setAttribute('aria-pressed',String(scenePaused));$('#pause-scene').setAttribute('aria-label',scenePaused?'继续故事':'暂停故事');$('#pause-scene').textContent=scenePaused?'▷':'Ⅱ';};
$('#pause-map').onclick=()=>{mapPaused=!mapPaused;$('#pause-map').setAttribute('aria-pressed',String(mapPaused));$('#pause-map').setAttribute('aria-label',mapPaused?'继续地图微动':'暂停地图微动');$('#pause-map').textContent=mapPaused?'▷':'Ⅱ';};
$('#help').onclick=()=>helpDialog.showModal();$('#close-help').onclick=$('#start-walk').onclick=()=>helpDialog.close();$('#reset-visits').onclick=()=>{visited.clear();updateVisited();};$('#collection-toggle').onclick=()=>{const open=$('#collection').hidden;$('#collection').hidden=!open;$('#collection-toggle').setAttribute('aria-expanded',String(open));if(open)$('#close-collection').focus();};$('#close-collection').onclick=closeNotebook;
$('#overview').onclick=()=>{camera={x:50,y:50,zoom:1};paintCamera();};$('#zoom-in').onclick=()=>zoom(.3);$('#zoom-out').onclick=()=>zoom(-.3);$('#next-story').onclick=()=>{const p=places.find(p=>!visited.has(p.id));openPoster(p?places.indexOf(p):(posterIndex+1)%places.length);};
for(const d of [dialog,helpDialog])d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});
map.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;drag={sx:e.clientX,sy:e.clientY,cx:camera.x,cy:camera.y};map.setPointerCapture(e.pointerId);});map.addEventListener('pointermove',e=>{if(!drag)return;const g=geometry();camera.x=drag.cx-(e.clientX-drag.sx)/g.w*100;camera.y=drag.cy-(e.clientY-drag.sy)/g.h*100;paintCamera();});map.addEventListener('pointerup',()=>drag=null);map.addEventListener('pointercancel',()=>drag=null);map.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?.12:-.12);},{passive:false});
window.addEventListener('keydown',e=>{if(dialog.open){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();openPoster(posterIndex+(e.key==='ArrowLeft'?-1:1));}else if(e.key===' '&&!e.target.closest('button')){e.preventDefault();$('#pause-scene').click();}return;}if(e.key==='Escape')closeNotebook();});
function frame(t){if(!document.hidden){if(!continuousPreview&&dialog.open&&sceneReady&&!scenePaused&&$('#full-poster').hidden){const film=FILMS[places[posterIndex].id],duration=film.durations?.[sceneFrame]||film.frameMs||650;if(!lastScene)lastScene=t;if(t-lastScene>duration){if(film.playMode==='once'&&sceneFrame===(film.frames?.length||6)-1){storyEnded=true;scenePaused=true;$('#pause-scene').textContent='↻';$('#pause-scene').setAttribute('aria-label','重播故事');$('#pause-scene').setAttribute('aria-pressed','true');}else{sceneFrame=(sceneFrame+1)%(film.frames?.length||6);showFrame($('#story-film'),sceneFrame);}lastScene=t;}}if(mapReady&&!mapPaused&&!reduceMotion.matches&&!dialog.open&&!helpDialog.open&&t-lastMap>1200){mapFrame=(mapFrame+1)%6;showFrame($('#map-film'),mapFrame);lastMap=t;}}requestAnimationFrame(frame);}
Promise.all(MAP_FILM.frames.map(loadImage)).then(()=>{
  setFilm($('#map-film'),MAP_FILM);$('#map-film').hidden=false;$('.map-art').hidden=true;mapReady=true;
}).catch(()=>{$('#pause-map').hidden=true;});
document.addEventListener('visibilitychange',()=>{lastScene=0;lastMap=performance.now();});
new ResizeObserver(paintCamera).observe(map);renderMarkers();renderRegions();updateVisited();paintCamera();requestAnimationFrame(frame);

dialog.addEventListener('close',()=>{++loadVersion;sceneReady=false;disposeContinuous();});
