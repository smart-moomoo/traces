import {actorsAt,receiversAt,validateActors} from './scene-state.mjs';
import {controlAt} from './expressive-score.mjs';
import {restGrid,deformGrid,inspectGrid} from './material-rig.mjs';

export function editableActions(scene){
 const used=new Set((scene.objects||[]).flatMap(o=>[o.rig?.channel,o.rig?.secondaryChannel,...Object.values(o.poseChannels||{})]).filter(Boolean));
 return [...used].map(id=>({id:`control:${id}`,label:id,kind:'control',value:structuredClone(scene.expression.channels[id])}))
  .concat((scene.objects||[]).flatMap(o=>Object.entries(o.tracks||{}).map(([property,keys])=>({id:`track:${o.id}:${property}`,label:`${o.id} · ${property}`,kind:'track',value:structuredClone(keys)}))));
}
export function sceneSnapshot(scene,time){
 if(!Number.isFinite(time)||time<0||time>scene.duration)throw new Error('Time must be inside this episode');
 return {time,actors:Object.fromEntries(actorsAt(scene,time)),controls:Object.fromEntries(Object.keys(scene.expression?.channels||{}).map(id=>[id,controlAt(scene.expression,id,time)])),receivers:receiversAt(scene,time)};
}
export function reviseAction(scene,id,value){
 const action=editableActions(scene).find(a=>a.id===id);if(!action)throw new Error('Unknown subject action');
 const next=structuredClone(scene),control=action.kind==='control',keys=control?value?.keys:value,oldKeys=control?action.value.keys:action.value;
 if(!Array.isArray(keys)||!keys.length||keys.length>200)throw new Error('Provide 1–200 numeric keys');
 if(control&&value.initial!==action.value.initial)throw new Error('Preserve the original initial state');
 let last=control?0:-1;
 for(const key of keys){
  if(!Number.isFinite(key.time)||!Number.isFinite(key.value)||key.time<=last||key.time<0||key.time>scene.duration)throw new Error('Key times must increase within the episode and values must be finite');
  if(control&&key.ease&&!['sine.inOut','none','linear'].includes(key.ease))throw new Error('Unsupported historical easing');
  if(!control&&!Number.isFinite(key.velocity))throw new Error('Tracks require finite velocities');
  last=key.time;
 }
 if(keys.at(-1).value!==oldKeys.at(-1).value||keys.at(-1).time!==oldKeys.at(-1).time||(!control&&(keys[0].value!==oldKeys[0].value||keys[0].time!==oldKeys[0].time)))throw new Error('Preserve the authored start and final pose/time');
 if(control)next.expression.channels[id.slice(8)]=structuredClone(value);
 else {const [,actor,property]=id.split(':');next.objects.find(o=>o.id===actor).tracks[property]=structuredClone(value);}
 const report=validateActors(next);if(report.errors.length)throw new Error(report.errors.join('; '));
 for(const o of next.objects.filter(o=>o.rig)){
  const grid=restGrid(o.crop[2],o.crop[3],o.rig.columns||10,o.rig.rows||14);
  for(let i=0;i<=100;i++){
   const t=next.duration*i/100,a=controlAt(next.expression,o.rig.channel,t),b=o.rig.secondaryChannel?controlAt(next.expression,o.rig.secondaryChannel,t):0;
   const r=inspectGrid(grid,deformGrid(grid,o.rig,a,undefined,b));
   if(!r.valid||r.minAreaRatio<.25||r.maxStretch>1.35)throw new Error(`${o.id}: edited action exceeds material deformation limits`);
  }
 }
 next.visualReview='pending';for(const key of Object.keys(next.gates||{}))next.gates[key]='pending';
 next.remaining=['Local action edit: source envelope, contact, complete performance and release evidence require renewed review.'];
 return next;
}
