import {shadowPlanesAt} from '../animation/shadows.mjs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {createScore} from '../animation/expressive-score.mjs';
import {validateActors,lightResponse} from '../animation/scene-state.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const require=createRequire(import.meta.url),{gsap}=require('../vendor/gsap.min.js');
for(const id of ['Sunnyvale','Charleston']){
 const scene=expressiveCatalog.find(s=>s.id===id),score=createScore(scene.expression,gsap);
 assert.deepEqual(validateActors(scene).errors,[]);assert.deepEqual(subjectInventory(scene).errors,[]);
 assert.equal(scene.subjects.length,3);assert.equal(scene.regions.some(r=>r.kind==='foliage'),false);
 for(const o of scene.objects){
  const grid=restGrid(o.crop[2],o.crop[3],11,19);let maximum=0;
  for(let n=0;n<=1000;n++){
   const state=score.sample(scene.duration*n/1000),v=deformGrid(grid,o.rig,state[o.rig.channel],undefined,state[o.rig.secondaryChannel]||0);
   const r=inspectGrid(grid,v);assert.ok(r.valid,`${o.id}: mesh inverted`);assert.ok(r.maxStretch<1.35,`${o.id}: material stretched ${r.maxStretch}`);
   for(let i=0;i<v.length;i+=2){
    const fixed=o.rig.pin==='top'?grid.vertices[i+1]===0:o.rig.pin==='right'?grid.vertices[i]===grid.width:o.rig.pin==='bottom'?grid.vertices[i+1]===grid.height:false;
    if(fixed){assert.equal(v[i],grid.vertices[i]);assert.equal(v[i+1],grid.vertices[i+1]);}
    maximum=Math.max(maximum,Math.hypot(v[i]-grid.vertices[i],v[i+1]-grid.vertices[i+1]));
   }
   if(n===0||n===1000)assert.deepEqual(v,grid.vertices);
  }
  assert.ok(maximum>5,`${o.id}: internal action too small`);
 }
 for(const t of [0,4,8,13,17,24,32]){
  const s=score.sample(t);assert.equal(s.wind,0);assert.ok(lightResponse(scene,s)>=0&&lightResponse(scene,s)<=.12);
 }
 const rest=shadowPlanesAt(scene,score.sample(0)),peak=shadowPlanesAt(scene,score.sample(9));
 assert.equal(rest.length,3);assert.ok(rest.every(p=>p[0]===0&&p[1]===0));
 assert.ok(peak.every(p=>Math.hypot(p[0],p[1])>.005));
 scene.shadowPlanes.forEach((p,i)=>{assert.equal(peak[i][0],p.travel[0]*score.sample(9)[p.channel]);assert.ok(p.points.every(q=>q.every(v=>v>=0&&v<=1)));});
 assert.throws(()=>shadowPlanesAt(scene,{}),/Missing shadow plane/);
 const pose=score.sample(12);score.sample(scene.duration);assert.deepEqual(score.sample(12),pose);score.destroy();
}
gsap.ticker.sleep();
console.log('PASS: six original subjects, independent articulation, fixed roots, bounded material strain, shared receiving light and deterministic seeks.');
