import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors,receiversAt} from '../animation/scene-state.mjs';
import {deformGrid,restGrid,inspectGrid} from '../animation/material-rig.mjs';
import {controlAt} from '../animation/expressive-score.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const inside=(x,y,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [a,b]=poly[i],[c,d]=poly[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)hit=!hit;}return hit;};
for(const id of ['Stanford','New-Orleans','Champaign-Urbana']){
 const scene=expressiveCatalog.find(s=>s.id===id);
 for(const branch of scene.objects.filter(o=>o.rig)){
  const grid=restGrid(branch.crop[2],branch.crop[3]);
  for(let i=0;i<=1000;i++){
   const amount=controlAt(scene.expression,branch.rig.channel,scene.duration*i/1000);
   const quality=inspectGrid(grid,deformGrid(grid,branch.rig,amount));
   assert.ok(quality.valid&&quality.maxStretch<1.2,`${id}: inverted or overstrained branch`);
  }
 }
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
  const states=actorsAt(scene,t),p=states.get(leaf.follows.actor),q=states.get(leaf.id);
  const owner=scene.objects.find(o=>o.id===leaf.follows.actor),[dx,dy]=leaf.follows.offset,rig=owner.rig;
  assert.equal(leaf.follows.surface,true);
  const amount=controlAt(scene.expression,rig.channel,t);
  const point={width:owner.crop[2],height:owner.crop[3],vertices:new Float32Array([owner.pivot[0]+dx,owner.pivot[1]+dy])};
  const d=deformGrid(point,rig,amount),x=d[0]-owner.pivot[0],y=d[1]-owner.pivot[1];
  assert.ok(Math.abs(q.x-p.x-x*Math.cos(p.rotation)+y*Math.sin(p.rotation))<1e-9);
  assert.ok(Math.abs(q.y-p.y-x*Math.sin(p.rotation)-y*Math.cos(p.rotation))<1e-9);
  const grid=restGrid(owner.crop[2],owner.crop[3]),v=deformGrid(grid,rig,amount),quality=inspectGrid(grid,v);
  assert.ok(quality.valid&&quality.maxStretch<1.2);
  const rootRow=rig.pin==='top'?0:grid.vertices.length-20;
  for(let j=rootRow;j<rootRow+20;j++)assert.ok(Math.abs(v[j]-grid.vertices[j])<.0001,'root edge moved');
 }
 const landed=actorsAt(scene,scene.duration-1).get(leaf.id);assert.deepEqual(actorsAt(scene,scene.duration).get(leaf.id),landed);
 assert.ok(landed.scaleY<.45&&landed.scaleY>.3,'A landed lamina is projected flat, not left upright above the ground');
 assert.ok(!(leaf.occluders||[]).some(poly=>inside(landed.x,landed.y,poly)),`${id}: final leaf hidden behind obstacle`);
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
