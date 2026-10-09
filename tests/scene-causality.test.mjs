import assert from 'node:assert/strict';
import {catalog} from '../animation/catalog.mjs';
import {objectPose,contactOrigins} from '../animation/material-objects.mjs';
for(const id of ['Los-Gatos','Fort-Worth']){
 const scene=catalog.find(s=>s.id===id),origins=contactOrigins(scene);
 for(let i=0;i<scene.contacts.length;i++){
  const contact=scene.contacts[i],actor=scene.objects.find(o=>o.id===contact.object),pose=objectPose(actor,contact.time);
  assert.equal(origins[i][0],pose.x+contact.offset[0]);assert.equal(origins[i][1],pose.y+contact.offset[1]);
 }
 for(const actor of scene.objects){let previous=objectPose(actor,0);for(let i=1;i<=2000;i++){const now=objectPose(actor,scene.duration*i/2000);assert.ok(Math.abs(now.x-previous.x)<1);assert.ok(Math.abs(now.y-previous.y)<1);assert.equal(now.scale,1);previous=now;}}
}
const duck=catalog.find(s=>s.id==='Los-Gatos').objects;
for(let t=0;t<=28;t+=.1){const a=objectPose(duck[0],t),b=objectPose(duck[1],t);assert.equal(a.x,b.x);assert.equal(a.y,b.y);}
const fort=catalog.find(s=>s.id==='Fort-Worth'),leaf=fort.objects[0];
assert.equal(objectPose(leaf,13).y,460);assert.equal(fort.contacts[0].time,13);
assert.equal(objectPose(leaf,28).y,463);
for(const scene of catalog)for(const shadow of scene.shadows||[]){for(const box of [shadow.source,shadow.target]){assert.equal(box.length,4);assert.ok(box.every(Number.isFinite));assert.ok(box[0]>=0&&box[1]>=0&&box[2]>0&&box[3]>0);assert.ok(box[0]+box[2]<=1&&box[1]+box[3]<=1);}}
console.log('PASS: duck/reflection share pose, impacts occur at historical actor contacts, leaf rests, source shadow regions stay bounded.');
