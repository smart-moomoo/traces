import assert from 'node:assert/strict';
import {compareSourcePixels} from '../animation/reconstruction-audit.mjs';
const source=new Uint8ClampedArray([100,100,100,255,120,120,120,255,150,150,150,255]);
const coverage=new Uint8ClampedArray([255,255,255,255,255,255,255,128,0,0,0,0]);
const rebuilt=new Uint8ClampedArray([130,100,100,255,120,150,120,255,150,150,160,255]);
const r=compareSourcePixels(source,rebuilt,coverage);assert.equal(r.metrics.changedPixels,3);assert.equal(r.metrics.outsideDeclaredPixels,1);assert.equal(r.metrics.edgePixels,1);assert.equal(r.metrics.maxDelta,30);assert.equal(r.heat[0],120);assert.equal(r.heat[11],255);
assert.equal(compareSourcePixels(source,source,coverage).metrics.changedPixels,0);
assert.throws(()=>compareSourcePixels(source,new Uint8ClampedArray(4),coverage),/Matching/);
console.log('PASS: reconstruction diagnostic separates declared interior, partial seam and out-of-footprint changes without inferring visual acceptance.');
