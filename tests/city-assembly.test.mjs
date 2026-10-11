import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors} from '../animation/scene-state.mjs';
import {evaluateTrack} from '../animation/scene-contract.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const scene=expressiveCatalog.find(s=>s.id==='Dallas');
assert.deepEqual(validateActors(scene).errors,[]);assert.deepEqual(subjectInventory(scene).errors,[]);
assert.equal(scene.subjects.length,3);assert.equal(scene.objects.length,18);
assert.ok(scene.subjects.every(s=>s.subjectClass==='material-assembly'));
assert.ok(scene.repairPlate.endsWith('facade-backing-v2.png'),'no paper holes beneath architectural materials');
assert.deepEqual(actorsAt(scene,0),actorsAt(scene,scene.duration));
let minProjectedWidth=1;
for(let i=0;i<=1000;i++){
 const t=scene.duration*i/1000,poses=actorsAt(scene,t);
 for(const o of scene.objects){
  const p=poses.get(o.id),angle=evaluateTrack(o.tracks.pitch,t);
  assert.equal(p.x,o.anchor[0]);assert.equal(p.y,o.anchor[1]);assert.equal(p.scaleY,1);assert.equal(p.rotation,0);
  assert.ok(o.pivot[0]===0||o.pivot[0]===o.crop[2],'hinge must coincide with original seam');
  assert.ok(Math.abs(p.scaleX-Math.cos(angle))<1e-12,'planar foreshortening must follow authored hinge angle');
  assert.ok(Math.abs(p.lift-Math.abs(Math.sin(angle)))<1e-12,'shadow lift shares the same angle');
  assert.ok(p.scaleX>.5,'keep original front face visible; do not invent backface or cross zero');
  minProjectedWidth=Math.min(minProjectedWidth,p.scaleX);
 }
}
assert.ok(minProjectedWidth<.55,'opening silhouette must be readable');
for(const o of scene.objects){
 assert.ok(o.outline.length>=7,'trace chipped source boundaries');
 assert.equal(o.underlayMaterial,'matched-mineral-backing');
 const a=o.assembly;assert.ok(a.start<a.spread&&a.spread<a.hold&&a.hold<a.dock&&a.dock<a.rest&&a.rest<scene.duration);
 assert.equal(actorsAt(scene,a.rest).get(o.id).lift,0);
}
const starts=scene.subjects.map(s=>scene.objects.find(o=>o.id===s.root).assembly.start);
assert.ok(starts[0]<starts[1]&&starts[1]<starts[2]);
const seek=actorsAt(scene,12.34);actorsAt(scene,33);actorsAt(scene,1);assert.deepEqual(actorsAt(scene,12.34),seek);
console.log('PASS: 18 source panels, fixed seam hinges, rigid planar projection, same-state lift shadow, ordered opening/hold/closing and exact deterministic rest over 1001 samples.');
