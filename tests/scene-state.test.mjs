import assert from 'node:assert/strict';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {actorsAt,receiversAt,validateActors} from '../animation/scene-state.mjs';
for(const scene of expressiveCatalog)assert.deepEqual(validateActors(scene),{valid:true,errors:[]},scene.id);
const scene=structuredClone(expressiveCatalog.find(s=>s.id==='Bellevue'));
const reflection=scene.objects.find(o=>o.id==='duck-reflection');
reflection.tracks.x=[{time:0,value:-999},{time:28,value:-999}];
for(const t of [0,8,21,28,12,0]){
 const states=actorsAt(scene,t);assert.deepEqual(states.get('duck-reflection'),states.get('pool-duck'),'Reflection uses actor state, not its obsolete independent track');
}
const before=receiversAt(scene,12),after=receiversAt(scene,28);
assert.deepEqual(before.map(c=>c.position),after.map(c=>c.position),'Historical contacts cannot move with the current actor');
assert.ok(before.some(c=>Math.hypot(c.velocity.vx,c.velocity.vy)>0),'Wake has emitting velocity');
scene.objects.find(o=>o.id==='pool-duck').follows={actor:'duck-reflection'};
assert.match(validateActors(scene).errors.join(),/Cyclic/);
const jointScene={duration:10,objects:[
 {id:'branch',anchor:[100,100],tracks:{rotation:[{time:0,value:0},{time:10,value:Math.PI/2}]}},
 {id:'twig',anchor:[0,0],tracks:{rotation:[{time:0,value:0},{time:10,value:-.2}]},follows:{kind:'joint',actor:'branch',offset:[30,0]}}
]};
const joint=actorsAt(jointScene,10).get('twig');
assert.ok(Math.abs(joint.x-100)<1e-8);assert.equal(joint.y,130);
assert.equal(joint.rotation,Math.PI/2-.2,'Child angle is local to moving parent; attachment follows the parent');
console.log('PASS: actor/receiver dependencies, historical contact origins, authored motion bounds and cycle rejection.');
