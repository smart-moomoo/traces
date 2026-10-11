import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors,receiversAt} from '../animation/scene-state.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
for(const id of ['Stanford','New-Orleans','Champaign-Urbana']){
 const scene=expressiveCatalog.find(s=>s.id===id);
 for(const leaf of scene.objects.filter(o=>o.follows?.releaseAt!==undefined)){
 const release=leaf.follows.releaseAt;
 assert.equal(subjectInventory(scene).subjects,3);assert.deepEqual(subjectInventory(scene).errors,[]);
 assert.deepEqual(validateActors(scene).errors,[]);
 const birth=actorsAt(scene,release).get(leaf.id),before=actorsAt(scene,release-1e-6).get(leaf.id),after=actorsAt(scene,release+1e-6).get(leaf.id);
 for(const k of ['x','y','rotation']){
  assert.ok(Math.abs(birth[k]-before[k])<1e-5,`${id}: discontinuity before release ${k}`);
  assert.ok(Math.abs(birth[k]-after[k])<1e-5,`${id}: discontinuity after release ${k}`);
 }
 for(const t of [0,2,5,6.5]){
  const states=actorsAt(scene,t),p=states.get(leaf.follows.actor),q=states.get(leaf.id),[dx,dy]=leaf.follows.offset;
  assert.ok(Math.abs(q.x-p.x-dx*Math.cos(p.rotation)+dy*Math.sin(p.rotation))<1e-9);
  assert.ok(Math.abs(q.y-p.y-dx*Math.sin(p.rotation)-dy*Math.cos(p.rotation))<1e-9);
 }
 const landed=actorsAt(scene,scene.duration-1).get(leaf.id);assert.deepEqual(actorsAt(scene,scene.duration).get(leaf.id),landed);
 assert.ok(landed.scaleY<.45&&landed.scaleY>.3,'A landed lamina is projected flat, not left upright above the ground');
 assert.equal(landed.scaleX,1);assert.equal(landed.scale,1);
 assert.ok(landed.y-birth.y>100,'Release must lead to a complete descent, not a tiny background wiggle');
 const baseline=actorsAt(scene,12);actorsAt(scene,scene.duration);assert.deepEqual(actorsAt(scene,12),baseline);
 assert.ok(scene.objects.find(o=>o.id===leaf.follows.actor).sourceHoles.length,'Parent cutout must not keep a duplicate leaf');
 // Receiver positions follow the released world pose, not its old source anchor.
 const withContact={...scene,contacts:[{object:leaf.id,time:scene.duration,offset:[0,0]}]};
 const r=receiversAt(withContact,scene.duration)[0];assert.deepEqual(r.position,[landed.x,landed.y]);
 }
}
const bad=structuredClone(expressiveCatalog.find(s=>s.id==='Stanford'));bad.objects.at(-1).follows.releaseAt=-1;assert.equal(validateActors(bad).valid,false);
console.log('PASS: three tree scenes, attached world pose, continuous release, source ownership, projected persistent landing, receiver coherence and random access.');
