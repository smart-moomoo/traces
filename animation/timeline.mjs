export const clamp = (x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth = x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export const SEATTLE_DURATION=36;

// A fixed heading and diminishing camera-space depth give perspective growth.
// No integration state: seeking and replay evaluate exactly the same scene.
export function seattleAt(seconds){
  const t=clamp(seconds,0,SEATTLE_DURATION),p=smooth((t-1)/33);
  const z=1/(.32+(3.5-.32)*p),scale=1/z;
  return {t,progress:p,z,scale,x:826-140*p,y:448+65*scale,
    roll:Math.sin(t*.65)*.002*(1-p),speed:(3.5-.32)*30*clamp((t-1)/33)**2*(clamp((t-1)/33)-1)**2/33,
    ended:t>=SEATTLE_DURATION};
}

export function wakeAt(seconds,index){
  const born=1+index*.55,age=seconds-born;
  if(age<0||age>9)return {visible:false};
  const origin=seattleAt(born),life=age/9;
  return {visible:true,x:origin.x+130*origin.scale,y:origin.y-16*origin.scale,
    spread:(8+age*11)*origin.scale,alpha:Math.sin(Math.PI*life)*.32,
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
