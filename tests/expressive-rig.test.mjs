import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {createScore} from '../animation/expressive-score.mjs';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
const require=createRequire(import.meta.url),{gsap}=require('../vendor/gsap.min.js');
const scene=expressiveCatalog.find(s=>s.id==='San-Francisco'),score=createScore(scene.expression,gsap);
const times=[0,4,8,11,15,21,27,32],expected=times.map(t=>score.sample(t));
for(const i of [7,0,4,1,6,3,2,5])assert.deepEqual(score.sample(times[i]),expected[i],'Backward/random seeking must reproduce forward evaluation');
for(const o of scene.objects.filter(o=>o.rig)){
 const grid=restGrid(o.crop[2],o.crop[3]);
 assert.deepEqual(deformGrid(grid,o.rig,0),grid.vertices,'Rest geometry preserves source pixels');
 for(let n=0;n<=1000;n++){
  const state=score.sample(scene.duration*n/1000),positions=deformGrid(grid,o.rig,state[o.rig.channel]);
  const report=inspectGrid(grid,positions);assert.ok(report.valid,'No triangle inversion');assert.ok(report.maxStretch<1.2,'Bounded cloth deformation');
  for(let i=0;i<positions.length;i+=2){const x=grid.vertices[i];if(x===(o.rig.pin==='left'?0:grid.width)){assert.equal(positions[i],x);assert.equal(positions[i+1],grid.vertices[i+1],'Mast attachment cannot drift');}}
 }
}
score.destroy();gsap.ticker.sleep();
console.log('PASS: pinned cloth, source rest pose, bounded deformation and random-access GSAP score. Visual review remains pending.');
