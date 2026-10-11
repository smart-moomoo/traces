import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {validateActors} from '../animation/scene-state.mjs';
const root=new URL('../',import.meta.url),read=file=>readFileSync(new URL(file,root),'utf8');
const deployment=JSON.parse(read('animation/deployment.json'));
assert.equal(deployment.channel,'review-preview');assert.equal(deployment.visualAcceptance,'pending');
assert.ok(deployment.publicationBasis.includes('User explicitly requested'));
assert.equal(expressiveCatalog.length,23);
for(const scene of expressiveCatalog){
 assert.equal(scene.version,deployment.sceneVersion);assert.equal(scene.visualReview,'pending');
 assert.deepEqual(validateActors(scene).errors,[]);
 assert.ok(existsSync(new URL(`assets/posters/${scene.id}.png`,root)),`${scene.id}: missing source artwork`);
 if(scene.repairPlate)assert.ok(existsSync(new URL(scene.repairPlate,root)),`${scene.id}: missing fixed repair plate`);
}
const app=read('app.js');assert.ok(app.includes("import('./animation/expressive-catalog.mjs')"));
assert.ok(!app.includes('SeattleScene'),'Exhibition must use the same multi-subject renderer as the workbench, including Seattle');
assert.ok(read('index.html').includes(deployment.version),'HTML must request the current app entry');
console.log('PASS: explicit preview policy, all 23 v2 programmes/assets and default exhibition integration; no artistic acceptance inferred.');
