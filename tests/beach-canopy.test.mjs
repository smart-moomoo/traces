import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {restGrid,deformGrid,inspectGrid} from '../animation/material-rig.mjs';
import {controlAt} from '../animation/expressive-score.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';
import {validateActors} from '../animation/scene-state.mjs';
const scene=expressiveCatalog.find(s=>s.id==='Santa-Monica'),palms=scene.objects.filter(o=>o.rig?.kind==='radial-fronds');
assert.equal(scene.subjects.length,5);assert.equal(palms.length,3);assert.deepEqual(subjectInventory(scene).errors,[]);assert.deepEqual(validateActors(scene).errors,[]);
assert.ok(!scene.regions.some(r=>r.id==='palm-crowns'),'background must not deform the same crown a second time');
let maxStretch=1,minArea=1,maxMotion=0;
for(const o of palms){
 const grid=restGrid(o.crop[2],o.crop[3],25,29),heart={width:grid.width,height:grid.height,vertices:new Float32Array(o.rig.center)};
 assert.equal(o.sourceExclusions.length,1,'original rigid trunk is excluded from moving alpha');
 for(let i=0;i<=1000;i++){
  const t=scene.duration*i/1000,p=controlAt(scene.expression,o.rig.channel,t),q=controlAt(scene.expression,o.rig.secondaryChannel,t);
  const posed=deformGrid(grid,o.rig,p,undefined,q),report=inspectGrid(grid,posed);
  assert.ok(report.valid);maxStretch=Math.max(maxStretch,report.maxStretch);minArea=Math.min(minArea,report.minAreaRatio);
  const pin=deformGrid(heart,o.rig,p,undefined,q);assert.deepEqual(pin,heart.vertices);
  for(let n=0;n<posed.length;n+=2)maxMotion=Math.max(maxMotion,Math.hypot(posed[n]-grid.vertices[n],posed[n+1]-grid.vertices[n+1]));
 }
 assert.equal(controlAt(scene.expression,o.rig.channel,30),0);assert.equal(controlAt(scene.expression,o.rig.secondaryChannel,30),0);
}
assert.ok(maxStretch<1.25);assert.ok(minArea>.6);assert.ok(maxMotion>5);
assert.notEqual(controlAt(scene.expression,palms[0].rig.channel,4),controlAt(scene.expression,palms[2].rig.channel,4));
console.log(JSON.stringify({pass:true,subjects:5,palms:3,maxStretch,minArea,maxMotion,scope:'rig, pin and timing mechanics; not visual acceptance'}));
