import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
import {actorsAt} from '../animation/scene-state.mjs';

const bay=expressiveCatalog.find(s=>s.id==='San-Francisco');
const lake=expressiveCatalog.find(s=>s.id==='Los-Gatos');
assert.equal(subjectInventory(bay).subjects,2,'Eight boat parts represent two subjects, not eight');
assert.equal(subjectInventory(lake).subjects,3,'Heads and reflections must not inflate the cast');
for(const scene of [bay,lake]){
 assert.deepEqual(subjectInventory(scene).errors,[]);
 for(const subject of scene.subjects){
  assert.ok(subject.actions.length>=3,'A subject needs distinct authored actions');
  const start=actorsAt(scene,0).get(subject.root);
  assert.ok(Array.from({length:100},(_,i)=>actorsAt(scene,scene.duration*i/99).get(subject.root)).some(p=>Math.abs(p.rotation-start.rotation)>.01),'Each subject changes pose, not only screen position');
 }
 const stamps=[0,2,5,8,12,19,24,scene.duration];
 const expected=stamps.map(t=>actorsAt(scene,t));
 for(const i of [7,2,5,0,6,3,1,4])assert.deepEqual(actorsAt(scene,stamps[i]),expected[i],'Arbitrary seek must reconstruct the same complete ensemble');
}
for(let i=0;i<=1000;i++){
 const t=32*i/1000,poses=actorsAt(bay,t);
 for(const [body,parts] of [['vessel-hull',['main-sail','jib','mast']],['far-hull',['far-main-sail','far-jib','far-mast']]]){
  for(const part of parts)assert.deepEqual(poses.get(part),poses.get(body),'All mast/sail pivots stay on their own heeling vessel');
 }
 const near=poses.get('vessel-hull'),far=poses.get('far-hull');
 assert.ok(near.y-far.y>=29,'Passing hulls remain in distinct water lanes');
}
const still=actorsAt(lake,2),preening=actorsAt(lake,5);
assert.ok(preening.get('shore-duck-head').rotation-still.get('shore-duck-head').rotation>.8,'Head actually folds toward breast');
assert.equal(preening.get('shore-duck-body').x,still.get('shore-duck-body').x,'Preening does not slide the planted duck');
const duplicate=structuredClone(bay);duplicate.subjects[1].parts.push('far-hull');
assert.ok(subjectInventory(duplicate).errors.some(e=>e.includes('two subjects')),'Part ownership cannot be double-counted');
console.log('PASS: semantic cast, articulated action, attachment continuity, independent water lanes and deterministic ensemble seeking.');
