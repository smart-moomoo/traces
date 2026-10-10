// GSAP is sampled by the exhibition clock. There is no independent animation
// ticker, forward-only event callback, or state accumulated between seeks.
let loading;
export async function loadScoreEngine(){
 if(globalThis.gsap)return globalThis.gsap;
 if(typeof document==='undefined')throw new Error('Provide GSAP to createScore in non-browser environments');
 if(!loading)loading=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=new URL('../vendor/gsap.min.js',import.meta.url).href;
  script.onload=()=>resolve(globalThis.gsap);script.onerror=()=>{loading=null;script.remove();reject(new Error('Could not load local animation score engine'));};document.head.append(script);
 });
 return loading;
}
export function createScore(definition,gsap){
 const state=Object.fromEntries(Object.entries(definition.channels).map(([id,c])=>[id,c.initial]));
 const timeline=gsap.timeline({paused:true});
 for(const [id,channel] of Object.entries(definition.channels)){
  let last=0,value=channel.initial;
  for(const key of channel.keys){
   if(!(key.time>last))throw new Error(`${id}: score keys must increase from zero`);
   timeline.fromTo(state,{[id]:value},{[id]:key.value,duration:key.time-last,ease:key.ease||'sine.inOut',immediateRender:false},last);
   last=key.time;value=key.value;
  }
 }
 return {sample(time){timeline.totalTime(Math.max(0,Math.min(definition.duration,time)),true);return {...state};},destroy(){timeline.kill();}};
}
