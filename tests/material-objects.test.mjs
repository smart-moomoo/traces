import assert from 'node:assert/strict';
import {catalog} from '../animation/catalog.mjs';
import {objectPose} from '../animation/material-objects.mjs';
const scene=catalog.find(s=>s.id==='New-Orleans'),leaf=scene.objects[0];
assert.deepEqual(objectPose(leaf,0),objectPose(leaf,5));
assert.deepEqual(objectPose(leaf,29),objectPose(leaf,34));
let last=objectPose(leaf,0);
for(let i=1;i<=1000;i++){
 const t=scene.duration*i/1000,p=objectPose(leaf,t);
 assert.ok(Object.values(p).every(Number.isFinite));
 assert.ok(p.y>=last.y-1e-8,'Leaf must not jump upward between authored downward positions');
 assert.ok(Math.hypot(p.x-last.x,p.y-last.y)<6,'No discontinuities');
 assert.equal(p.scale,1,'Keep the original shell material scale');
 assert.deepEqual(objectPose(leaf,t),p,'Random seeking has no simulation history');
 last=p;
}
assert.ok(leaf.occluders.length>0,'A leaf passing the trunk needs an explicit occluder');
console.log('PASS: source-fragment rest, fall, landing, material scale and deterministic random access.');
