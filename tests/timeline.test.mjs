import assert from 'node:assert/strict';
import {seattleAt,wakeAt,StoryClock} from '../animation/timeline.mjs';
let previous=seattleAt(0);
for(let i=0;i<=1000;i++){const t=i*36/1000,s=seattleAt(t);assert.ok(Object.values(s).every(v=>typeof v!=='number'||Number.isFinite(v)));assert.ok(s.scale>=previous.scale);assert.ok(Math.abs(s.scale-previous.scale)<.01);assert.deepEqual(seattleAt(t),s);previous=s;}
for(let i=0;i<64;i++){const a=wakeAt(1+i*.55+1,i),b=wakeAt(1+i*.55+2,i);assert.equal(a.x,b.x);assert.equal(a.y,b.y);assert.ok(b.spread>a.spread);}
const c=new StoryClock(36);c.play();c.tick(1000);c.tick(2000);assert.equal(c.time,1);c.pause();c.tick(10000);assert.equal(c.time,1);c.play();c.tick(20000);c.tick(21000);assert.equal(c.time,2);c.seek(50);assert.equal(c.time,36);c.play();assert.equal(c.time,0);c.suspend();c.tick(100000);assert.equal(c.time,0);
console.log('PASS: 1001 deterministic continuous states, anchored wakes, pause/replay/seek/background clock.');
