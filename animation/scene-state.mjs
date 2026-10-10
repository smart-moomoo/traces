import {objectPose} from './material-objects.mjs';

function transformOffset(pose,[x,y]){
 const c=Math.cos(pose.rotation),s=Math.sin(pose.rotation);
 return [pose.x+x*pose.scaleX*c-y*pose.scaleY*s,pose.y+x*pose.scaleX*s+y*pose.scaleY*c];
}
// Pure reconstruction, including parent relationships, is shared by drawing and
// event receivers. No reflection or historical wake has its own movement track.
export function actorsAt(scene,time){
 const definitions=new Map((scene.objects||[]).map(o=>[o.id,o])),states=new Map(),visiting=new Set();
 function visit(id){
  if(states.has(id))return states.get(id);
  if(visiting.has(id))throw new Error(`Cyclic actor attachment: ${id}`);
  const object=definitions.get(id);if(!object)throw new Error(`Missing actor: ${id}`);
  visiting.add(id);let pose=objectPose(object,time);
  if(object.follows){
   const parent=visit(object.follows.actor),[x,y]=transformOffset(parent,object.follows.offset||[0,0]);
   const joint=object.follows.kind==='joint';
   pose={...parent,x,y,rotation:parent.rotation*(object.follows.rotationFactor??1)+(object.follows.rotation||0)+(joint?pose.rotation:0)};
  }
  states.set(id,pose);visiting.delete(id);return pose;
 }
 for(const id of definitions.keys())visit(id);
 return states;
}
export function motionAt(scene,id,time,offset=[0,0]){
 const dt=.01,a=actorsAt(scene,Math.max(0,time-dt)).get(id),b=actorsAt(scene,Math.min(scene.duration,time+dt)).get(id);
 if(!a||!b)throw new Error(`Missing contact actor: ${id}`);
 const elapsed=Math.min(scene.duration,time+dt)-Math.max(0,time-dt);
 const aa=transformOffset(a,offset),bb=transformOffset(b,offset);
 return {vx:(bb[0]-aa[0])/elapsed,vy:(bb[1]-aa[1])/elapsed};
}
export function receiversAt(scene,time){
 return (scene.contacts||[]).map(event=>{
  if(!event.object)return {position:[event.position[0]*scene.crop[2],event.position[1]*scene.crop[3]],born:event.time,strength:event.strength??1,age:time-event.time};
  const birth=actorsAt(scene,event.time).get(event.object);
  if(!birth)throw new Error(`Missing contact actor: ${event.object}`);
  const velocity=motionAt(scene,event.object,event.time,event.offset||[0,0]);
  return {position:transformOffset(birth,event.offset||[0,0]),born:event.time,age:time-event.time,velocity,strength:event.strength??1};
 });
}
export function validateActors(scene){
 const errors=[],ids=new Set();
 for(const o of scene.objects||[]){
  if(ids.has(o.id))errors.push(`${o.id}: duplicate actor`);ids.add(o.id);
  if(!o.materialClass)errors.push(`${o.id}: missing material class`);
  if(!o.motionBounds||o.motionBounds.length!==4)errors.push(`${o.id}: missing world motion bounds`);
 }
 try{
  for(let i=0;i<=120;i++)for(const [id,p] of actorsAt(scene,scene.duration*i/120)){
   const o=scene.objects.find(o=>o.id===id),b=o.motionBounds;
   if(!Object.values(p).every(Number.isFinite))throw new Error(`${id}: non-finite pose`);
   if(b&&(p.x<b[0]||p.y<b[1]||p.x>b[2]||p.y>b[3]))throw new Error(`${id}: anchor outside authored bounds`);
   if(o.materialClass==='rigid-shell'&&(p.scaleX!==1||p.scaleY!==1))throw new Error(`${id}: rigid material scale changed`);
  }
  receiversAt(scene,scene.duration);
 }catch(e){errors.push(e.message);}
 return {valid:!errors.length,errors};
}

export function sweptBounds(scene,id,samples=240){
 const actor=scene.objects.find(o=>o.id===id);if(!actor)throw new Error(`Missing actor: ${id}`);
 const bounds=[Infinity,Infinity,-Infinity,-Infinity],pad=Math.abs(actor.rig?.amplitude||0)+Math.abs(actor.rig?.lift||0);
 for(let i=0;i<=samples;i++){
  const pose=actorsAt(scene,scene.duration*i/samples).get(id);
  for(const [x,y] of actor.outline){
   const point=transformOffset(pose,[x-actor.pivot[0],y-actor.pivot[1]]);
   bounds[0]=Math.min(bounds[0],point[0]-pad);bounds[1]=Math.min(bounds[1],point[1]-pad);
   bounds[2]=Math.max(bounds[2],point[0]+pad);bounds[3]=Math.max(bounds[3],point[1]+pad);
  }
 }
 return bounds;
}
