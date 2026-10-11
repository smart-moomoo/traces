import assert from 'node:assert/strict';
import {closeMaterialMatte} from '../animation/material-objects.mjs';
const w=13,h=11,rgba=new Uint8ClampedArray(w*h*4),coverage=new Uint8ClampedArray(w*h);
for(let y=2;y<9;y++)for(let x=2;x<11;x++){
 const i=y*w+x;coverage[i]=255;rgba[i*4]=127;rgba[i*4+3]=255;
}
// Pigment classification made a one-pixel hole; it belongs inside the leaf.
rgba[(5*w+5)*4+3]=0;
// This second hole was explicitly cut for an occluder; it must remain empty.
coverage[5*w+8]=rgba[(5*w+8)*4+3]=0;
closeMaterialMatte(rgba,w,h,1,coverage);
assert.equal(rgba[(5*w+5)*4+3],255);
assert.equal(rgba[(5*w+8)*4+3],0);
for(let i=0;i<w*h;i++){
 assert.ok(rgba[i*4+3]<=coverage[i]);
 if(coverage[i])assert.equal(rgba[i*4],127,'matting repainted source RGB');
}
console.log('PASS: tiny pigment gaps repaired; exterior and explicit occluder holes remain transparent; source RGB preserved.');
