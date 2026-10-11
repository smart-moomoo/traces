import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,receiversAt,validateActors} from '../animation/scene-state.mjs';
import {createScore} from '../animation/expressive-score.mjs';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
const {gsap}=createRequire(import.meta.url)('../vendor/gsap.min.js');
const scene=expressiveCatalog.find(s=>s.id==='Seattle'),score=createScore(scene.expression,gsap);
assert.equal(subjectInventory(scene).subjects,2,'parts of one cargo vessel are not separate subjects');
assert.deepEqual(subjectInventory(scene).errors,[]);assert.deepEqual(validateActors(scene).errors,[]);
const cables=scene.objects.filter(o=>o.rig?.kind==='tether');
const booms=scene.objects.filter(o=>o.poseChannels);
for(let i=0;i<=1000;i++){
 const t=scene.duration*i/1000,state=score.sample(t),poses=actorsAt(scene,t);
 for(const o of scene.objects){const pose=poses.get(o.id);assert.equal(pose.scaleX,1);assert.equal(pose.scaleY,1);}
 for(const boom of booms){const pose=poses.get(boom.id);assert.deepEqual([pose.x,pose.y],boom.anchor);assert.ok(Math.abs(pose.rotation-state[boom.poseChannels.rotation])<2e-6);}
 for(const cable of cables){
  const rig=cable.rig,boom=booms.find(o=>o.poseChannels.rotation===rig.channel),pose=poses.get(boom.id),grid=restGrid(cable.crop[2],cable.crop[3]);
  const d=deformGrid(grid,rig,state[rig.channel]),quality=inspectGrid(grid,d);assert.ok(quality.valid&&quality.maxStretch<1.02,'cable must shorten without folding or thickening');
  const [sx,sy]=rig.start,[ex,ey]=rig.end,[px,py]=rig.pivot;
  const ends=deformGrid({...grid,vertices:new Float32Array([sx,sy,ex,ey])},rig,state[rig.channel]);
  assert.ok(Math.hypot(ends[0]-sx,ends[1]-sy)<1e-5,'mast attachment slipped');
  const expected=[px+(ex-px)*Math.cos(pose.rotation)-(ey-py)*Math.sin(pose.rotation),py+(ex-px)*Math.sin(pose.rotation)+(ey-py)*Math.cos(pose.rotation)];
  assert.ok(Math.hypot(ends[2]-expected[0],ends[3]-expected[1])<1e-4,'cable detached from boom');
  const dx=ex-sx,dy=ey-sy,l=Math.hypot(dx,dy),cx=(ex+sx)/2,cy=(ey+sy)/2;
  const width=deformGrid({...grid,vertices:new Float32Array([cx-dy/l,cy+dx/l,cx+dy/l,cy-dx/l])},rig,state[rig.channel]);
  assert.ok(Math.abs(Math.hypot(width[2]-width[0],width[3]-width[1])-2)<1e-4,'cable width changed');
 }
}
const start=actorsAt(scene,0),mid=actorsAt(scene,13),end=actorsAt(scene,36);
for(const boom of booms){assert.deepEqual(start.get(boom.id),end.get(boom.id));assert.ok(mid.get(boom.id).rotation>.1);}
assert.notEqual(mid.get(booms[0].id).rotation,mid.get(booms[1].id).rotation,'hoists should not move in lockstep');
assert.ok(end.get('harbor-ferry').x-start.get('harbor-ferry').x>500);
const wake=receiversAt(scene,36),earlier=receiversAt(scene,27);assert.deepEqual(wake.map(x=>x.position),earlier.map(x=>x.position));
assert.ok(wake[0].position[0]<wake[1].position[0]&&wake[1].position[0]<wake[2].position[0]);
const seek=actorsAt(scene,8);actorsAt(scene,36);assert.deepEqual(actorsAt(scene,8),seek);
score.destroy();gsap.ticker.sleep();
console.log('PASS: two semantic subjects; staged fixed-hinge hoists, rigid scale, fixed cable anchors and shared moving endpoints, preserved cable width, historical wake and deterministic seek across 1001 samples.');
