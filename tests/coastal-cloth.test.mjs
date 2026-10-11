import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {createScore} from '../animation/expressive-score.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const require=createRequire(import.meta.url),{gsap}=require('../vendor/gsap.min.js');
for(const id of ['Santa-Monica','Santa-Cruz']){
 const scene=expressiveCatalog.find(s=>s.id===id),score=createScore(scene.expression,gsap);
 assert.equal(subjectInventory(scene).subjects,id==='Santa-Monica'?5:2);assert.deepEqual(subjectInventory(scene).errors,[]);
 assert.ok(!scene.regions.some(r=>r.kind==='cloth'),'Old background flag warp cannot run underneath the actual flag');
 for(const o of scene.objects.filter(o=>['flag','hanging'].includes(o.rig?.kind))){
  const grid=restGrid(o.crop[2],o.crop[3]);let moved=0;
  for(let n=0;n<=1000;n++){
   const t=scene.duration*n/1000,state=score.sample(t);
   const points=deformGrid(grid,o.rig,state[o.rig.channel],undefined,state[o.rig.secondaryChannel]);
   const report=inspectGrid(grid,points);assert.ok(report.valid,`${id}/${o.id}: inverted mesh`);assert.ok(report.maxStretch<1.25,`${id}/${o.id}: excessive cloth strain ${report.maxStretch}`);
   for(let k=0;k<points.length;k+=2){
    const fixed=o.rig.pin==='top'?grid.vertices[k+1]===0:grid.vertices[k]===grid.width;
    if(fixed){assert.equal(points[k],grid.vertices[k]);assert.equal(points[k+1],grid.vertices[k+1],'Attachment must not move with flutter');}
    moved=Math.max(moved,Math.hypot(points[k]-grid.vertices[k],points[k+1]-grid.vertices[k+1]));
   }
   if(n===0||n===1000)assert.deepEqual(points,grid.vertices,'Rest and settled frame reconstruct the authored material');
  }
  assert.ok(moved>3,'Deformation must produce a visible silhouette change');
 }
 score.destroy();
}
gsap.ticker.sleep();
console.log('PASS: side-pinned and hanging flag attachments, bounded fold deformation, visible free-edge action and settled recovery across 2,002 samples.');
