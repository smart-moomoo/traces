import {writeFileSync} from 'node:fs';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {objectPose} from '../animation/material-objects.mjs';
import {sweptBounds} from '../animation/scene-state.mjs';
const audit=expressiveCatalog.map(scene=>{
 const objects=(scene.objects||[]).map(o=>{
  const pose=objectPose(o,0),rest=[o.crop[0]+o.pivot[0],o.crop[1]+o.pivot[1]];
  const issues=[];
  if(Math.hypot(pose.x-rest[0],pose.y-rest[1])>.01)issues.push({kind:'source',symptom:'Initial pose differs from extracted source placement',actual:[pose.x,pose.y],expected:rest,action:'Inspect intentional occlusion and restore original rest reconstruction before reviewing motion.'});
  if(!scene.repairPlate)issues.push({kind:'source',symptom:'Repair uses a resized neighbouring sample, not an inspected hidden-area reconstruction',action:'Inspect exposed swept area for repeated structure, stretched tiles and residual subject pixels.'});
  if(o.outline.length<6)issues.push({kind:'alpha',symptom:'Coarse source polygon needs thin-edge and negative-space inspection',action:'Review cutout on contrasting mattes at source and exhibition size.'});
  return {id:o.id,representation:o.rig?.kind||'rigid',rest,sweptBounds:sweptBounds(scene,o.id),issues,visualStatus:'unreviewed'};
 });
 return {id:scene.id,source:scene.source,crop:scene.crop,status:'source-audit',objects,
  environment:scene.regions.map(r=>({id:r.id,kind:r.kind,visualStatus:'unreviewed'})),
  requiredEvidence:['rest-reconstruction','exposed-repair','alpha-mattes','rig-extremes','contact-depth','full-speed-playback'],
  note:scene.id==='Seattle'?'V2 uses the common renderer and the original small ferry; source/interaction review is pending.':undefined};
});
writeFileSync(new URL('../animation/expressive-audit.json',import.meta.url),JSON.stringify({scope:'Structural preflight only; no visual acceptance inferred',scenes:audit},null,2)+'\n');
console.log(`Audited ${audit.length} scene definitions; ${audit.reduce((n,s)=>n+s.objects.reduce((m,o)=>m+o.issues.length,0),0)} asset issues require inspection.`);
