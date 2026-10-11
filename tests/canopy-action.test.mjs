import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {createScore} from '../animation/expressive-score.mjs';
import {validateActors,lightResponse} from '../animation/scene-state.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const require=createRequire(import.meta.url),{gsap}=require('../vendor/gsap.min.js');
for(const id of ['Savannah','Wallace']){
 const scene=expressiveCatalog.find(s=>s.id===id),score=createScore(scene.expression,gsap);
 assert.deepEqual(validateActors(scene).errors,[]);assert.deepEqual(subjectInventory(scene).errors,[]);
 assert.equal(scene.subjects.length,id==='Savannah'?4:2);
 assert.equal(scene.regions.some(r=>['moss','foliage'].includes(r.kind)),false);
 for(const o of scene.objects){
  const grid=restGrid(o.crop[2],o.crop[3],11,19);let maximum=0;
  for(let n=0;n<=1000;n++){
   const state=score.sample(scene.duration*n/1000),v=deformGrid(grid,o.rig,state[o.rig.channel],undefined,state[o.rig.secondaryChannel]||0);
   const r=inspectGrid(grid,v);assert.ok(r.valid,`${o.id}: mesh inverted`);assert.ok(r.maxStretch<1.3,`${o.id}: material stretched`);
   for(let i=0;i<v.length;i+=2){
    const fixed=o.rig.pin==='top'?grid.vertices[i+1]===0:o.rig.pin==='right'?grid.vertices[i]===grid.width:grid.vertices[i]===0;
    if(fixed){assert.equal(v[i],grid.vertices[i]);assert.equal(v[i+1],grid.vertices[i+1]);}
    maximum=Math.max(maximum,Math.hypot(v[i]-grid.vertices[i],v[i+1]-grid.vertices[i+1]));
   }
   if(n===0||n===1000)assert.deepEqual(v,grid.vertices);
  }
  assert.ok(maximum>5,`${o.id}: internal action too small`);
 }
 if(id==='Wallace'){
  assert.equal(lightResponse(scene,score.sample(0)),0);assert.equal(lightResponse(scene,score.sample(30)),0);
  for(const t of [4,8,13,17,24]){
   const s=score.sample(t);assert.equal(lightResponse(scene,s),(Math.max(0,s.westCanopyLift)+Math.max(0,s.eastCanopyLift))*.5*.16);
   assert.equal(s.wind,0,'An unrelated environment oscillator remains active');
  }
  assert.throws(()=>lightResponse(scene,{}),/Missing light source/);
 }
 const pose=score.sample(12);score.sample(scene.duration);assert.deepEqual(score.sample(12),pose);score.destroy();
}
gsap.ticker.sleep();
console.log('PASS: hanging attachment invariance, independent strand lag, canopy root seams, shared light response, bounded material strain and deterministic sampling.');
