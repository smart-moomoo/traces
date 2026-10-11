import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {createScore} from '../animation/expressive-score.mjs';
import {validateActors} from '../animation/scene-state.mjs';
const require=createRequire(import.meta.url),{gsap}=require('../vendor/gsap.min.js');
const scene=expressiveCatalog.find(s=>s.id==='Mountain-View'),score=createScore(scene.expression,gsap);
assert.deepEqual(validateActors(scene).errors,[]);
assert.equal(scene.subjects.length,3);assert.equal(scene.regions.some(r=>r.kind==='foliage'),false);
for(const o of scene.objects){
 const grid=restGrid(o.crop[2],o.crop[3],9,25);let maximum=0;
 for(let n=0;n<=1000;n++){
  const st=score.sample(scene.duration*n/1000),v=deformGrid(grid,o.rig,st[o.rig.channel],undefined,st[o.rig.secondaryChannel]);
  const r=inspectGrid(grid,v);assert.ok(r.valid);assert.ok(r.maxStretch<1.04);assert.ok(r.minAreaRatio>.95);
  for(let i=0;i<v.length;i+=2){
   if(grid.vertices[i+1]===grid.height){assert.equal(v[i],grid.vertices[i]);assert.equal(v[i+1],grid.vertices[i+1]);}
   maximum=Math.max(maximum,Math.hypot(v[i]-grid.vertices[i],v[i+1]-grid.vertices[i+1]));
  }
  if(n===0||n===1000)assert.deepEqual(v,grid.vertices);
 }
 assert.ok(maximum>8,'stalk has no meaningful internal bend');
 const primary=deformGrid(grid,o.rig,.6,undefined,0),lagged=deformGrid(grid,o.rig,.6,undefined,.8);
 assert.ok(Math.abs(primary[0]-lagged[0])>2,'seed-head lag is missing');
}
const expected=score.sample(10);score.sample(31);assert.deepEqual(score.sample(10),expected);
score.destroy();gsap.ticker.sleep();
console.log('PASS: three rooted stalks, delayed upper-stem response, low material strain and deterministic full-score recovery.');
