import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {createScore} from '../animation/expressive-score.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
import {validateActors,actorsAt,receiversAt} from '../animation/scene-state.mjs';
const require=createRequire(import.meta.url),{gsap}=require('../vendor/gsap.min.js');
for(const id of ['San-Diego','Miami-Beach']){
 const scene=expressiveCatalog.find(s=>s.id===id);
 assert.equal(subjectInventory(scene).subjects,3);assert.deepEqual(subjectInventory(scene).errors,[]);
 assert.deepEqual(validateActors(scene).errors,[]);
 if(id==='San-Diego'){
  const score=createScore(scene.expression,gsap);
  for(const o of scene.objects){
   const grid=restGrid(o.crop[2],o.crop[3],17,17),center={...grid,vertices:new Float32Array(o.rig.center)};let maximum=0;
   for(let n=0;n<=1000;n++){
    const state=score.sample(scene.duration*n/1000),a=state[o.rig.channel],b=state[o.rig.secondaryChannel];
    const vertices=deformGrid(grid,o.rig,a,undefined,b),report=inspectGrid(grid,vertices);
    assert.ok(report.valid,`${o.id}: folded mesh`);assert.ok(report.maxStretch<1.6);
    assert.deepEqual(deformGrid(center,o.rig,a,undefined,b),center.vertices,'trunk attachment moves');
    for(let i=0;i<vertices.length;i++)maximum=Math.max(maximum,Math.abs(vertices[i]-grid.vertices[i]));
    if(n===0||n===1000)assert.deepEqual(vertices,grid.vertices);
   }
   assert.ok(maximum>2,'fronds have no internal action');
  }
  const before=score.sample(9);score.sample(29);assert.deepEqual(score.sample(9),before);score.destroy();
 }else{
  for(const e of scene.subjectEvents){
   const buoy=scene.objects.find(o=>o.id===e.actor),before=actorsAt(scene,e.time-1).get(e.actor),hit=actorsAt(scene,e.time).get(e.actor),after=actorsAt(scene,e.time+5.8).get(e.actor);
   assert.equal(before.rotation,0);assert.ok(Math.abs(hit.rotation)>.15);assert.equal(after.rotation,0);
   for(const p of [before,hit,after])assert.deepEqual([p.x,p.y],buoy.anchor,'buoy waterline drifts');
   const boat=actorsAt(scene,e.emittedAt).get(e.source);assert.ok(Math.abs(boat.x-buoy.anchor[0])<20,'reaction unrelated to passing vessel');
   assert.ok(receiversAt(scene,36).some(r=>r.born===e.emittedAt));
  }
  const start=actorsAt(scene,0).get('channel-launch'),end=actorsAt(scene,36).get('channel-launch');
  assert.ok(end.x-start.x>500);assert.equal(start.scaleX,end.scaleX);
 }
}
gsap.ticker.sleep();
console.log('PASS: pinned radial fronds, bounded internal deformation, deterministic sampling, sequenced passage and anchored buoy reactions.');
