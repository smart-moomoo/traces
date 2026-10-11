import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors} from '../animation/scene-state.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const scene=expressiveCatalog.find(s=>s.id==='San-Francisco');
assert.equal(subjectInventory(scene).subjects,2);assert.deepEqual(validateActors(scene).errors,[]);
assert.ok(scene.objects.every(o=>!o.eraseOutline),'do not erase the bay/hills inside broad whole-vessel triangles');
assert.ok(scene.objects.every(o=>o.repair!==false),'each original piece owns its erasure');
for(const o of scene.objects){assert.ok(o.eraseDilation<=1.5);assert.deepEqual(o.pivot,[o.anchor[0]-o.crop[0],o.anchor[1]-o.crop[1]]);}
const stays=scene.objects.filter(o=>/forestay/.test(o.id));assert.equal(stays.length,2);
for(let i=0;i<=1000;i++){
 const poses=actorsAt(scene,scene.duration*i/1000);
 for(const o of stays){const p=poses.get(o.id),parent=poses.get(o.follows.actor);assert.deepEqual(p,parent,'standing rigging shares hull state instead of remaining behind');assert.equal(p.scaleX,1);assert.equal(p.scaleY,1);}
}
console.log('PASS: two semantic boats, individually repaired source pieces, bounded seam clearance, exact rest placement and hull-bound standing rigging over 1001 samples.');
