import assert from 'node:assert/strict';
import {catalog} from '../animation/catalog.mjs';
import {scoreAt} from '../animation/material-scene.mjs';
assert.equal(catalog.length,23);assert.equal(new Set(catalog.map(s=>s.id)).size,23);
for(const s of catalog){assert.equal(s.visualReview,'pending');assert.ok(s.remaining.length);const before=scoreAt(s,-1),after=scoreAt(s,s.duration+1);assert.equal(before.energy,0);assert.equal(after.energy,0);let maximum=0;for(let i=0;i<=1000;i++){const t=s.duration*i/1000,state=scoreAt(s,t);assert.deepEqual(scoreAt(s,t),state);assert.ok(state.energy>=0&&state.energy<=1);maximum=Math.max(maximum,state.energy);}assert.ok(maximum>.99);for(const r of s.regions)for(const [x,y] of r.points)assert.ok(x>=0&&x<=1&&y>=0&&y<=1);}
console.log('PASS: 23 distinct scene scores; bounded regions; deterministic onset and decay across 23,023 sampled states. Visual acceptance remains pending.');
