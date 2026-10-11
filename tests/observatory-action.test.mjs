import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors} from '../animation/scene-state.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const scene=expressiveCatalog.find(s=>s.id==='Los-Angeles');
const [door,scope]=scene.objects;
assert.equal(subjectInventory(scene).subjects,2);
assert.deepEqual(subjectInventory(scene).errors,[]);
assert.deepEqual(validateActors(scene).errors,[]);
for(let i=0;i<=1000;i++){
 const time=scene.duration*i/1000,p=actorsAt(scene,time);
 assert.equal(p.get(door.id).x,door.anchor[0]);
 assert.equal(p.get(door.id).rotation,0);
 assert.equal(p.get(scope.id).x,scope.anchor[0]);
 assert.equal(p.get(scope.id).y,scope.anchor[1]);
 for(const q of p.values()){assert.equal(q.scaleX,1);assert.equal(q.scaleY,1);}
}
const start=actorsAt(scene,0),open=actorsAt(scene,16),end=actorsAt(scene,34);
assert.ok(start.get(door.id).y-open.get(door.id).y>70,'opening must expose most of the aperture');
assert.ok(open.get(scope.id).rotation<-.2,'telescope must actually elevate');
assert.deepEqual(start,end,'mechanisms return to their source rest without accumulation');
assert.deepEqual(actorsAt(scene,18),actorsAt(scene,20),'observation hold must be steady');
const before=actorsAt(scene,8);actorsAt(scene,34);assert.deepEqual(actorsAt(scene,8),before);
assert.ok(scene.objects.every(o=>o.clipPolygon?.length>=5),'both mechanisms stay inside original housing');
assert.equal(scene.contacts.length,0,'mechanical episode has no invented water reactions');
console.log('PASS: two mechanical subjects, rigid dimensions, mounted telescope elevation, bounded shutter retraction, fixed apertures, holds, rest recovery and deterministic seeking.');
