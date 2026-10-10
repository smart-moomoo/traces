import {writeFileSync} from 'node:fs';
import {expressiveCatalog} from '../animation/expressive-catalog.mjs';
import {subjectInventory} from '../animation/subject-direction.mjs';

// This ledger makes incomplete migrations explicit. No shader change or layer
// count can accidentally advance an episode to authored-subject status.
const scenes=expressiveCatalog.map(scene=>{
 const report=subjectInventory(scene),parts=scene.objects||[];
 const owned=new Set((scene.subjects||[]).flatMap(subject=>subject.parts));
 const unassigned=parts.filter(part=>!owned.has(part.id)).map(part=>part.id);
 const missing=[];
 if(!report.subjects)missing.push('No semantic subject/action programme is wired to the renderer');
 if(!scene.subjectBeats?.length)missing.push('No staged subject event sequence');
 if(unassigned.length)missing.push('Existing moving layers have not been assigned to semantic subjects');
 return {id:scene.id,source:scene.source,subjects:report.subjects,renderParts:report.renderParts,
  rigs:parts.filter(p=>p.rig).map(p=>({part:p.id,kind:p.rig.kind,pin:p.rig.pin})),
  joints:parts.filter(p=>p.follows?.kind==='joint').map(p=>({part:p.id,parent:p.follows.actor})),
  actions:report.actionNames,unassigned,missing,errors:report.errors,
  authored:!missing.length&&!report.errors.length,visualReview:scene.visualReview,gates:scene.gates};
});
const report={scope:'Implementation inventory only. Authored does not mean reviewed, natural, accepted or released.',
 total:scenes.length,authored:scenes.filter(s=>s.authored).length,scenes};
writeFileSync(new URL('../animation/subject-audit.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(`${report.authored}/${report.total} scenes have explicit subject/action programmes; visual gates remain separate.`);
