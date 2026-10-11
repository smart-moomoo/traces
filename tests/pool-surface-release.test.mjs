import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,receiversAt,validateActors} from '../animation/scene-state.mjs';
import {createScore,controlAt} from '../animation/expressive-score.mjs';
import {deformGrid,restGrid,inspectGrid} from '../animation/material-rig.mjs';
const {gsap}=createRequire(import.meta.url)('../vendor/gsap.min.js');
const scene=expressiveCatalog.find(s=>s.id==='Fort-Worth'),score=createScore(scene.expression,gsap),owner=scene.objects[0],leaf=scene.objects[2];
assert.deepEqual(validateActors(scene).errors,[]);
for(let i=0;i<=1000;i++){
 const time=scene.duration*i/1000,state=score.sample(time);
 for(const name of Object.keys(scene.expression.channels))assert.ok(Math.abs(controlAt(scene.expression,name,time)-state[name])<2e-6,`${name}: historical GSAP mismatch`);
 for(const o of scene.objects.filter(o=>o.rig)){
  const grid=restGrid(o.crop[2],o.crop[3]),d=deformGrid(grid,o.rig,state[o.rig.channel],undefined,state[o.rig.secondaryChannel]||0),r=inspectGrid(grid,d);
  assert.ok(r.valid&&r.maxStretch<1.2);
 }
 if(time<=7){
  const g={width:owner.crop[2],height:owner.crop[3],vertices:new Float32Array([31,53])};
  const d=deformGrid(g,owner.rig,state.poolWest,undefined,state.poolWestTip),p=actorsAt(scene,time).get(leaf.id);
  assert.ok(Math.hypot(p.x-(owner.crop[0]+d[0]),p.y-(owner.crop[1]+d[1]))<.0001,'leaf slipped from deformed owner');
 }
}
const before=actorsAt(scene,7-1e-6).get(leaf.id),after=actorsAt(scene,7+1e-6).get(leaf.id);
assert.ok(Math.hypot(after.x-before.x,after.y-before.y)<.0001);assert.ok(Math.abs(after.rotation-before.rotation)<.0001);
const a=receiversAt(scene,16),b=receiversAt(scene,34),landing=actorsAt(scene,16).get(leaf.id);
assert.deepEqual(a[0].position,[landing.x,landing.y]);assert.deepEqual(a[0].position,b[0].position);
assert.ok(b[0].position[1]>420&&b[0].position[1]<480,'contact outside pool');
const end=actorsAt(scene,34).get(leaf.id);assert.ok(end.x>landing.x+50&&end.scaleY<.45);
assert.notDeepEqual(b[1].position,b[0].position);assert.ok(b[2].strength<b[1].strength);
const seek=actorsAt(scene,12);actorsAt(scene,34);assert.deepEqual(actorsAt(scene,12),seek);
score.destroy();gsap.ticker.sleep();
console.log('PASS: GSAP historical parity, mesh surface attachment, continuous release, fixed impact origin, later weaker drift contacts and deterministic seek.');
