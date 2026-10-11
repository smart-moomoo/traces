import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {assemblyPose,insideAssemblyDomain} from '../animation/salt-direction.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
import {validateActors} from '../animation/scene-state.mjs';
const scene=expressiveCatalog.find(s=>s.id==='San-Jose');
assert.equal(scene.objects.length,9);assert.equal(scene.subjects.length,3);
assert.deepEqual(subjectInventory(scene).errors,[]);assert.deepEqual(validateActors(scene).errors,[]);
for(const o of scene.objects){
 assert.deepEqual([assemblyPose(o,0).x,assemblyPose(o,0).y],o.anchor);
 const end=assemblyPose(o,36);assert.deepEqual([end.x,end.y],o.assembly.target);assert.equal(end.rotation,0);
 assert.ok(Math.hypot(end.x-o.anchor[0],end.y-o.anchor[1])>20);
 let previous=assemblyPose(o,0);
 for(let i=0;i<=1000;i++){
  const p=assemblyPose(o,36*i/1000),c=Math.cos(p.rotation),s=Math.sin(p.rotation);
  // The entire rigid source piece remains in the authored brine domain.
  for(const [x,y] of o.outline){const dx=x-o.pivot[0],dy=y-o.pivot[1];assert.ok(insideAssemblyDomain([p.x+c*dx-s*dy,p.y+s*dx+c*dy],o.assembly.domain),o.id);}
  assert.ok(Math.hypot(p.x-previous.x,p.y-previous.y)<2,'trajectory discontinuity');previous=p;
 }
 assert.equal(o.tracks.scale,undefined);assert.equal(o.tracks.scaleX,undefined);
}
// At rest the fragments line up without intersecting declared pigment docking edges.
for(let g=0;g<3;g++){
 const a=scene.objects.filter(o=>o.assembly.group===g);
 for(let i=0;i<a.length-1;i++){
  const gap=a[i+1].assembly.target[0]+a[i+1].assembly.dockingEdges[0]-(a[i].assembly.target[0]+a[i].assembly.dockingEdges[1]);
  assert.ok(gap>=0&&gap<=1.1,'invalid docking gap');
 }
}
console.log('PASS: conserved original salt fragments, continuous bounded trajectories, rigid material scale, staged docking and stable final arrangement.');
