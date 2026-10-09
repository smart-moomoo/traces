import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {catalog} from '../animation/catalog.mjs';
const path=new URL('../animation/release-review.json',import.meta.url);
assert.ok(existsSync(path),'The default exhibition requires a completed release review.');
const review=JSON.parse(readFileSync(path));
assert.equal(review.status,'accepted-for-demo');
assert.equal(review.scenes.length,catalog.length);
const playback=JSON.parse(readFileSync(new URL('../animation/full-playback.json',import.meta.url)));
const performance=JSON.parse(readFileSync(new URL('../animation/region-benchmark.json',import.meta.url)));
const checks=['sourceFidelity','alphaEdges','occlusion','materialScale','causalMotion','storyArc'];
for(const scene of catalog){
 const r=review.scenes.find(r=>r.id===scene.id);
 assert.ok(r,`${scene.id}: missing review`);assert.ok(existsSync(new URL('../'+r.visualEvidence,import.meta.url)),`${scene.id}: missing inspected contact sheet`);
 for(const key of checks){assert.equal(r[key]?.verdict,'pass',`${scene.id}: ${key}`);assert.ok(r[key].evidence?.length>15);}
 const p=playback.find(r=>r.id===scene.id);
 assert.equal(p.sampledImages,24);assert.ok(p.renderedFrames>=500);assert.ok(p.wallSeconds>=scene.duration);
 assert.ok(p.maxTimelineStep<.25,`${scene.id}: playback stalled`);
 const b=performance.find(r=>r.id===scene.id);assert.ok(b.frames>=1000);assert.equal(b.newRequests??b.newAssetRequests,0);
}
for(const [file,hash] of Object.entries(review.sourceHashes)){
 const actual=createHash('sha256').update(readFileSync(new URL('../'+file,import.meta.url))).digest('hex');
 assert.equal(actual,hash,`${file}: implementation changed after visual review; review affected scenes again`);
}
console.log('PASS: all 23 scene decisions, real-time playback, fixed-asset rendering, and reviewed source hashes.');
