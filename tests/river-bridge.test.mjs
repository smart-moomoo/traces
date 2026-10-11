import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors,receiversAt} from '../animation/scene-state.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const scene=expressiveCatalog.find(s=>s.id==='Chicago'),inventory=subjectInventory(scene);
assert.equal(inventory.subjects,3);assert.equal(inventory.renderParts,6);assert.deepEqual(inventory.errors,[]);assert.deepEqual(validateActors(scene).errors,[]);
const [west,east,launch,tender,...antennas]=scene.objects,start=actorsAt(scene,0),end=actorsAt(scene,36);
for(let i=0;i<=1000;i++){
 const t=36*i/1000,poses=actorsAt(scene,t);
 for(const o of scene.objects){const p=poses.get(o.id);assert.equal(p.scaleX,1);assert.equal(p.scaleY,1);}
 for(const leaf of [west,east]){const p=poses.get(leaf.id);assert.deepEqual([p.x,p.y],leaf.anchor);}
 const boat=poses.get(tender.id);
 for(const antenna of antennas)assert.deepEqual(poses.get(antenna.id),boat,'rigging must share whole tender pose');
 assert.ok(Math.abs(poses.get(launch.id).x-boat.x)>340,'boats entered the same lane');
}
assert.deepEqual(start.get(west.id),end.get(west.id));assert.deepEqual(start.get(east.id),end.get(east.id));
const open=actorsAt(scene,16);assert.equal(open.get(west.id).rotation,-.66);assert.equal(open.get(east.id).rotation,.66);
assert.deepEqual(actorsAt(scene,13).get(west.id),actorsAt(scene,21).get(west.id),'bridge must hold open');
assert.ok(end.get(launch.id).y-start.get(launch.id).y>60);assert.ok(end.get(tender.id).x-start.get(tender.id).x>50);
assert.deepEqual(start.get(tender.id),actorsAt(scene,9).get(tender.id),'tender must wait before departure');
const wake=receiversAt(scene,36);assert.deepEqual(wake.map(x=>x.position),receiversAt(scene,32).map(x=>x.position));
assert.ok(Math.hypot(wake[1].position[0]-wake[2].position[0],wake[1].position[1]-wake[2].position[1])>30);
const seek=actorsAt(scene,9.5);actorsAt(scene,36);assert.deepEqual(actorsAt(scene,9.5),seek);
console.log('PASS: three river subjects; paired rigid hinges, staggered opening/hold/closure, independent boat lanes, attached rigging, source scale, historical wakes and random seeks over 1001 samples.');
