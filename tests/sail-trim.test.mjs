import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,validateActors} from '../animation/scene-state.mjs';
import {controlAt} from '../animation/expressive-score.mjs';
import {deformGrid,restGrid,inspectGrid} from '../animation/material-rig.mjs';
const scene=expressiveCatalog.find(s=>s.id==='San-Francisco');
assert.deepEqual(validateActors(scene).errors,[]);
const world=(p,x,y)=>[p.x+x*Math.cos(p.rotation)-y*Math.sin(p.rotation),p.y+x*Math.sin(p.rotation)+y*Math.cos(p.rotation)];
for(const [sailId,boomId,clewX,foot] of [['main-sail','near-boom',44,94],['far-main-sail','far-boom',22,47]]){
 const sail=scene.objects.find(o=>o.id===sailId),boom=scene.objects.find(o=>o.id===boomId),rig=sail.rig;
 const grid=restGrid(sail.crop[2],sail.crop[3]),rest=deformGrid(grid,rig,0,undefined,0);
 assert.deepEqual(rest,grid.vertices);
 for(let i=0;i<=1000;i++){
  const time=scene.duration*i/1000,angle=controlAt(scene.expression,rig.secondaryChannel,time),pressure=controlAt(scene.expression,rig.channel,time),poses=actorsAt(scene,time);
  const report=inspectGrid(grid,deformGrid(grid,rig,pressure,undefined,angle));
  assert.ok(report.minAreaRatio>.65&&report.maxStretch<1.3,'Trim must not invert or over-stretch the original material');
  const pointGrid={width:sail.crop[2],height:sail.crop[3],vertices:new Float32Array([clewX,foot,0,foot,0,0])};
  const v=deformGrid(pointGrid,rig,pressure,undefined,angle);
  assert.equal(v[2],0);assert.equal(v[3],foot);assert.equal(v[4],0);assert.equal(v[5],0);
  const cloth=world(poses.get(sailId),v[0]-sail.pivot[0],v[1]-sail.pivot[1]);
  const spar=world(poses.get(boomId),clewX,0);
  assert.ok(Math.hypot(cloth[0]-spar[0],cloth[1]-spar[1])<.001,'Sail foot and boom endpoint must coincide in world space');
 }
 const amount=controlAt(scene.expression,rig.secondaryChannel,sailId==='main-sail'?15:13);
 assert.ok(Math.abs(clewX*Math.sin(amount))>5,'Internal action must visibly move the clew, not only translate the boat');
}
assert.notEqual(controlAt(scene.expression,'nearSheet',3),controlAt(scene.expression,'farSheet',3),'Independent staggered adjustments');
console.log('PASS: shared boom/clew endpoints, fixed luff, full-duration mesh strain, visible internal action and staggered two-vessel score.');
