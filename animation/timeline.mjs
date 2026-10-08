export const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth = x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export const SEATTLE_DURATION=36;

// Evaluate the authored scene score. Shared material scale is invariant; this
// replaces the rejected oversized cutout approach, not a camera zoom.
export function seattleAt(seconds){
  const t=clamp(seconds,0,SEATTLE_DURATION),p=smooth((t-1)/33);
  const tracks=seattleSpec.tracks,scale=evaluateTrack(tracks.scale,t),wind=evaluateTrack(tracks.wind,t);
  return {t,progress:p,z:1/scale,scale,x:evaluateTrack(tracks.x,t),y:evaluateTrack(tracks.y,t),
    roll:Math.sin(t*.65)*.001*wind,speed:Math.abs(evaluateTrack(tracks.x,t+.001)-evaluateTrack(tracks.x,t-.001))/.002,
    wind, surfaceEnergy:clamp(wind*.5 + Math.sin(Math.PI*clamp((t-5)/30))*.5),
    ended:t>=SEATTLE_DURATION};
}

export function wakeAt(seconds,index){
  const passage=seattleSpec.events.find(e=>e.id==='passage');
  const born=passage.start+.3+index*.55,age=seconds-born;
  if(born>=passage.end)return {visible:false};
  if(age<0||age>9)return {visible:false};
  const origin=seattleAt(born),life=age/9;
  return {visible:true,x:origin.x+130*origin.scale,y:origin.y-16*origin.scale,
    spread:(8+age*11)*origin.scale,alpha:Math.sin(Math.PI*life)*.32*clamp(origin.speed/6),
    width:(13+age*12)*origin.scale};
}

export class StoryClock{
  constructor(duration){this.duration=duration;this.time=0;this.paused=true;this.last=null;}
  seek(seconds){this.time=clamp(seconds,0,this.duration);this.last=null;return this.time;}
  play(){if(this.time>=this.duration)this.time=0;this.paused=false;this.last=null;}
  pause(){this.paused=true;this.last=null;}
  tick(now){if(this.last!==null&&!this.paused)this.time=clamp(this.time+(now-this.last)/1000,0,this.duration);this.last=now;if(this.time>=this.duration)this.pause();return this.time;}
  suspend(){this.last=null;}
}
import {evaluateTrack} from './scene-contract.mjs';
import {seattleSpec} from './seattle-spec.mjs';
