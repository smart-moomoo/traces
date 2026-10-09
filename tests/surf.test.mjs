import assert from 'node:assert/strict';
import {catalog} from '../animation/catalog.mjs';
import {surfAt,shorelineSegments} from '../animation/surf.mjs';
for(const scene of catalog.filter(s=>s.surf)){
 const s=scene.surf;assert.equal(shorelineSegments(scene).length,4);
 assert.equal(surfAt(scene,0).energy,0);assert.equal(surfAt(scene,scene.duration).energy,0);
 assert.equal(surfAt(scene,s.break).front,0);assert.equal(surfAt(scene,s.hold).front,0);
 let last=surfAt(scene,0);
 for(let i=1;i<=1000;i++){
  const t=scene.duration*i/1000,current=surfAt(scene,t);
  assert.deepEqual(current,surfAt(scene,t));
  assert.ok(Math.abs(current.front-last.front)<1,'Continuous swell path');
  if(t<=s.break)assert.ok(current.front<=last.front,'Approach shore');
  if(t>s.hold)assert.ok(current.front>=last.front,'Withdraw from shore');
  assert.ok(current.energy>=0&&current.energy<=1);last=current;
 }
}
