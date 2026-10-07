export const REQUIRED_REVIEWS=['sourceFidelity','alphaEdges','occlusion','materialScale','causalMotion','storyArc','fullPlayback'];

// This validation separates structural correctness from artistic acceptance.
// A performance benchmark cannot set any of the visual-review verdicts.
export function validateScene(scene,{release=false}={}){
  const errors=[];
  if(!scene.id||!Number.isFinite(scene.duration)||scene.duration<=0)errors.push('Scene identity and positive duration are required.');
  if(!scene.source?.path||!scene.source?.crop)errors.push('An explicit approved-art source region is required.');
  const layers=new Map((scene.layers||[]).map(l=>[l.id,l]));
  if(layers.size!==(scene.layers||[]).length)errors.push('Layer IDs must be unique.');
  for(const l of layers.values()){
    if(!l.material||!l.role)errors.push(`${l.id}: material and semantic role are required.`);
    if(l.motion&&(!l.anchor||!l.maxTransform))errors.push(`${l.id}: moving layers require attachment/anchor and transform limits.`);
    if(l.motion==='cutout'&&(!l.cleanPlate||!l.alphaReview))errors.push(`${l.id}: cutouts require a clean plate and alpha review.`);
    for(const ref of [l.mask,l.cleanPlate,l.follows].filter(Boolean))if(!layers.has(ref))errors.push(`${l.id}: missing layer reference ${ref}.`);
  }
  const events=new Map((scene.events||[]).map(e=>[e.id,e]));
  if(events.size!==(scene.events||[]).length)errors.push('Event IDs must be unique.');
  for(const e of events.values()){
    if(!(e.start>=0&&e.end>e.start&&e.end<=scene.duration))errors.push(`${e.id}: invalid event interval.`);
    if(!e.effect||!e.resolution)errors.push(`${e.id}: effect and resolution are required.`);
    for(const target of e.targets||[])if(!layers.has(target))errors.push(`${e.id}: missing target ${target}.`);
    for(const cause of e.causes||[]){const c=events.get(cause);if(!c)errors.push(`${e.id}: missing cause ${cause}.`);else if(c.start>e.start)errors.push(`${e.id}: effect precedes its cause.`);}
  }
  const visited=new Set(),visiting=new Set();
  const visit=id=>{if(visiting.has(id)){errors.push('Causal events must not contain a cycle.');return;}if(visited.has(id))return;visiting.add(id);for(const c of events.get(id)?.causes||[])if(events.has(c))visit(c);visiting.delete(id);visited.add(id);};
  for(const id of events.keys())visit(id);
  if(!scene.beats?.some(b=>b.role==='setup')||!scene.beats?.some(b=>b.role==='change')||!scene.beats?.some(b=>b.role==='resolution'))errors.push('Story needs a setup, change and resolution.');
  if(release){
    for(const key of REQUIRED_REVIEWS){const r=scene.review?.[key];if(r?.verdict!=='pass'||!r.evidence)errors.push(`Release requires independently evidenced ${key} review.`);}
    if(scene.status!=='reviewed')errors.push('Only reviewed scenes may ship.');
    if(!(scene.performance?.frames>=1000&&scene.performance.newAssetRequests===0))errors.push('Missing 1,000-frame fixed-asset performance evidence.');
  }
  return {valid:errors.length===0,errors};
}

// Cubic Hermite tracks allow explicit endpoint velocities rather than asking an
// image generator to infer motion from prose. All values are evaluated at time t.
export function evaluateTrack(keys,t){
  if(!keys.length)throw new Error('Empty track');
  if(t<=keys[0].time)return keys[0].value;
  if(t>=keys.at(-1).time)return keys.at(-1).value;
  const i=keys.findIndex(k=>k.time>t),a=keys[i-1],b=keys[i],dt=b.time-a.time,u=(t-a.time)/dt;
  return (2*u**3-3*u*u+1)*a.value+(u**3-2*u*u+u)*dt*(a.velocity??0)+(-2*u**3+3*u*u)*b.value+(u**3-u*u)*dt*(b.velocity??0);
}
