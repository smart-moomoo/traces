import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {createScore} from '../animation/expressive-score.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
import {validateActors} from '../animation/scene-state.mjs';
const require=createRequire(import.meta.url),{gsap}=require('../vendor/gsap.min.js');
const scene=expressiveCatalog.find(s=>s.id==='Everglades'),score=createScore(scene.expression,gsap);
assert.equal(subjectInventory(scene).subjects,3);
assert.deepEqual(subjectInventory(scene).errors,[]);
assert.ok(validateActors(scene).valid);
assert.ok(!scene.regions.some(r=>r.kind==='body'));
assert.equal(scene.contacts.length,0,'Tail on dry bank must not emit a water impact');
for(const o of scene.objects){
 const grid=restGrid(o.crop[2],o.crop[3]);let motion=0;
 for(let n=0;n<=1000;n++){
  const state=score.sample(scene.duration*n/1000),vertices=deformGrid(grid,o.rig,state[o.rig.channel]);
  const report=inspectGrid(grid,vertices);assert.ok(report.valid);assert.ok(report.maxStretch<1.25);
  for(let i=0;i<vertices.length;i+=2){
   const fixed=o.rig.pin==='bottom'?grid.vertices[i+1]===grid.height:o.rig.pin==='right'?grid.vertices[i]===grid.width:grid.vertices[i]===0;
   if(fixed){assert.equal(vertices[i],grid.vertices[i]);assert.equal(vertices[i+1],grid.vertices[i+1]);}
   motion=Math.max(motion,Math.hypot(vertices[i]-grid.vertices[i],vertices[i+1]-grid.vertices[i+1]));
  }
  if(n===0||n===1000)assert.deepEqual(vertices,grid.vertices);
 }
 assert.ok(motion>3,`${o.id}: no visible silhouette action`);
}
const expected=score.sample(10);score.sample(29);assert.deepEqual(score.sample(10),expected);
score.destroy();gsap.ticker.sleep();
console.log('PASS: three semantic wetland subjects; root-preserving backbone and leaf cupping, bounded meshes, rest recovery and random seek.');
