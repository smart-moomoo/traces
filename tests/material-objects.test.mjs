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

// Separately cut pieces must remain one vessel; decorative cloth deformation
// may change sail width, but cannot move its attachment away from the mast.
const sf=catalog.find(s=>s.id==='San-Francisco');
for(let i=0;i<=1000;i++){
 const t=sf.duration*i/1000,poses=sf.objects.map(o=>objectPose(o,t));
 for(const pose of poses){assert.equal(pose.x,poses[0].x);assert.equal(pose.y,poses[0].y);assert.equal(pose.scaleY,1);}
}
const {contactOrigins}=await import('../animation/material-objects.mjs');
assert.deepEqual(contactOrigins(catalog.find(s=>s.id==='Miami')),[],'Wind does not invent a point impact');
for(const id of ['Bellevue','San-Francisco']){
 const s=catalog.find(s=>s.id===id),contacts=contactOrigins(s);
 for(let i=0;i<contacts.length;i++){
  const event=s.contacts[i],actor=s.objects.find(o=>o.id===event.object),birth=objectPose(actor,event.time),end=objectPose(actor,s.duration);
  assert.equal(contacts[i][0],birth.x+(event.offset?.[0]||0));
  assert.notEqual(contacts[i][0],end.x+(event.offset?.[0]||0),'Wake must not follow actor after birth');
 }
}
assert.throws(()=>contactOrigins({...sf,contacts:[{object:'missing',time:5}]}),/Unknown contact actor/);
