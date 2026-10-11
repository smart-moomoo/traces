import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {editableActions,reviseAction,sceneSnapshot} from '../animation/action-authoring.mjs';
const source=expressiveCatalog.find(s=>s.id==='Santa-Monica'),original=JSON.stringify(source);
const action=editableActions(source).find(a=>a.id==='control:cafe-west-palmPressure'),edit=structuredClone(action.value);edit.keys[1].value=.8;
const next=reviseAction(source,action.id,edit);assert.equal(JSON.stringify(source),original,'editor must not mutate catalogue');
assert.notDeepEqual(sceneSnapshot(next,4),sceneSnapshot(source,4));assert.deepEqual(sceneSnapshot(next,30),sceneSnapshot(source,30));
assert.ok(Object.values(next.gates).every(v=>v==='pending'));assert.equal(next.visualReview,'pending');
const snapshot=sceneSnapshot(next,5);sceneSnapshot(next,25);sceneSnapshot(next,0);assert.deepEqual(sceneSnapshot(next,5),snapshot);
const invalid=structuredClone(edit);invalid.keys[1].value=200;assert.throws(()=>reviseAction(source,action.id,invalid),/deformation limits/);
invalid.keys[1].time=-1;assert.throws(()=>reviseAction(source,action.id,invalid),/Key times/);
assert.throws(()=>sceneSnapshot(next,-1),/Time/);
const city=expressiveCatalog.find(s=>s.id==='Dallas'),hinge=editableActions(city).find(a=>a.id.startsWith('track:'));const pose=structuredClone(hinge.value);pose[3].value=.8;const folded=reviseAction(city,hinge.id,pose);assert.notDeepEqual(sceneSnapshot(folded,8),sceneSnapshot(city,8));
pose.at(-1).value=.2;assert.throws(()=>reviseAction(city,hinge.id,pose),/final pose/);
console.log('PASS: local action edits, immutable catalogue, channel/track editing, pose endpoints, mesh and motion limits, review invalidation and arbitrary deterministic comparison.');

for(const scene of expressiveCatalog){const action=editableActions(scene)[0];assert.ok(action,scene.id+' missing editable action');const roundtrip=reviseAction(scene,action.id,action.value);assert.deepEqual(sceneSnapshot(roundtrip,scene.duration/2),sceneSnapshot(scene,scene.duration/2));}
console.log('PASS: all 23 scene programmes round-trip through the local authoring contract without pose changes.');
