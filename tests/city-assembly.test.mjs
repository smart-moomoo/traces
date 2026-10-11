import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors} from '../animation/scene-state.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const scene=expressiveCatalog.find(s=>s.id==='Dallas');
assert.deepEqual(validateActors(scene).errors,[]);assert.deepEqual(subjectInventory(scene).errors,[]);
assert.equal(scene.subjects.length,3);assert.equal(scene.objects.length,18);
assert.ok(scene.subjects.every(s=>s.subjectClass==='material-assembly'));
assert.deepEqual(actorsAt(scene,0),actorsAt(scene,scene.duration),'all original fragments return to exact source pose');
let travel=0;
for(let i=0;i<=1000;i++){
 const poses=actorsAt(scene,scene.duration*i/1000);
 for(const o of scene.objects){
  const p=poses.get(o.id);assert.equal(p.scaleX,1);assert.equal(p.scaleY,1);
  assert.ok(p.lift>=0&&p.lift<=1);assert.ok(Math.abs(p.rotation)<=.065001);
  travel=Math.max(travel,Math.hypot(p.x-o.anchor[0],p.y-o.anchor[1]));
  assert.ok(p.x>160&&p.x<860&&p.y>325&&p.y<510,'material escaped its architectural group');
 }
}
assert.ok(travel>20,'material expansion must be readable');
for(const o of scene.objects){
 assert.deepEqual(o.repairSample.slice(2),o.crop.slice(2),'paper stock is not stretched');
 assert.ok(o.outline.length>=7,'trace chipped source boundaries');
 const a=o.assembly;assert.ok(a.start<a.spread&&a.spread<a.hold&&a.hold<a.dock&&a.dock<a.rest&&a.rest<scene.duration);
 assert.equal(actorsAt(scene,a.spread).get(o.id).lift,1);
 assert.equal(actorsAt(scene,a.rest).get(o.id).lift,0,'shadow ends when piece docks');
}
const starts=scene.subjects.map(s=>scene.objects.find(o=>o.id===s.root).assembly.start);
assert.ok(starts[0]<starts[1]&&starts[1]<starts[2],'three groups take turns');
const seek=actorsAt(scene,12.34);actorsAt(scene,33);actorsAt(scene,1);assert.deepEqual(actorsAt(scene,12.34),seek);
console.log('PASS: three source material groups, 18 seam-traced pieces, rigid scale, ordered release/hold/dock, source-paper sampling, bounded lift and exact deterministic rest over 1001 samples.');
