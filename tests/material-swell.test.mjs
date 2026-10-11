import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors,receiversAt} from '../animation/scene-state.mjs';
import {bankHeight} from '../animation/material-swell.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const scene=expressiveCatalog.find(s=>s.id==='Miami');
assert.deepEqual(validateActors(scene).errors,[]);assert.deepEqual(subjectInventory(scene).errors,[]);
assert.ok(scene.subjects.every(s=>s.subjectClass==='reflected-form'),'reflections must not be counted as physical moving vessels');
assert.equal(scene.objects.length,22);assert.ok(scene.objects.every(o=>o.materialClass==='rigid-shell'&&o.matte==='gold-water'));
let maxTravel=0;
for(let i=0;i<=1000;i++){
 const t=scene.duration*i/1000,poses=actorsAt(scene,t);
 for(const o of scene.objects){
  const p=poses.get(o.id),c=Math.cos(p.rotation),s=Math.sin(p.rotation);assert.equal(p.scaleX,1);assert.equal(p.scaleY,1);
  maxTravel=Math.max(maxTravel,Math.hypot(p.x-o.anchor[0],p.y-o.anchor[1]));
  for(const [x,y] of o.outline){
   const dx=x-o.pivot[0],dy=y-o.pivot[1],xx=p.x+dx*c-dy*s,yy=p.y+dx*s+dy*c;
   assert.ok(yy>=bankHeight(o.wave.bank,xx),`${o.id} intersects bank at ${t}`);
   assert.ok(xx>80&&xx<938&&yy<598,'fragment escaped material water footprint');
  }
 }
}
assert.ok(maxTravel>15,'wave cannot be replaced by imperceptible offsets');
assert.deepEqual(actorsAt(scene,0),actorsAt(scene,36),'reflections must rejoin original rest, not accumulate drift');
const west=scene.objects.filter(o=>o.materialGroup==='west-column-reflection');
assert.ok(west.at(-1).wave.start<west[0].wave.start,'front must advance toward bank, not all rows start together');
const side=actorsAt(scene,14);assert.ok(side.get(west[0].id).x<west[0].anchor[0]);
const bow=scene.objects.find(o=>o.materialGroup==='bow-reflection');assert.ok(side.get(bow.id).x>bow.anchor[0]);
assert.deepEqual(receiversAt(scene,28).map(r=>r.position),receiversAt(scene,36).map(r=>r.position));
const seek=actorsAt(scene,12.34);actorsAt(scene,1);assert.deepEqual(actorsAt(scene,12.34),seek);
console.log('PASS: 22 source reflection fragments, one bank-constrained swell clip, spatial arrival, opposite split, rigid material scale, source rest recovery, historical receivers and deterministic seeks over 1001 samples.');
