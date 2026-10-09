import {vertex} from './environment.mjs';
import {prepareObjects,mountObjects,renderObjects,contactOrigins} from './material-objects.mjs';
import {StoryClock} from './timeline.mjs';
import {surfAt,shorelineSegments} from './surf.mjs';

const fragment=`
precision highp float;
in vec2 vTextureCoord;
in vec2 vSceneCoord;
uniform sampler2D uTexture;
uniform sampler2D uRegions;
uniform sampler2D uAnchors;
uniform vec4 uInputSize;
uniform vec4 uInputClamp;
uniform vec2 uSize;
uniform vec4 uScore;
uniform vec2 uOrigin;
uniform vec2 uDirection;
uniform vec4 uTiming;
uniform float uMode;
uniform vec4 uContact0;
uniform vec4 uContact1;
uniform vec4 uContact2;
uniform vec4 uShore0;
uniform vec4 uShore1;
uniform vec4 uShore2;
uniform vec4 uShore3;
uniform vec4 uSurf;
out vec4 finalColor;
float shoreDistance(vec2 p,vec4 edge){
 vec2 v=edge.zw-edge.xy;
 return length(p-edge.xy-v*clamp(dot(p-edge.xy,v)/max(dot(v,v),1.),0.,1.));
}
float contactWave(vec2 p,vec4 contact,float t){
 float age=t-contact.z;if(age<0.||contact.w<=0.)return 0.;
 float distance=length((p-contact.xy)*vec2(1.,2.6));
 float front=age*28.;return sin((distance-front)*.11)*exp(-pow((distance-front)/70.,2.))*exp(-age*.09)*contact.w;
}
void main(){
 vec2 p=vSceneCoord,uv=vTextureCoord,n=p/uSize;
 vec4 original=texture(uTexture,uv),regions=texture(uRegions,n),anchor=texture(uAnchors,n);
 float pigment=smoothstep(.025,.12,max(original.r,max(original.g,original.b))-min(original.r,min(original.g,original.b)));
 float t=uScore.x,progress=uScore.z;
 float span=max(.001,abs(uDirection.x)+abs(uDirection.y));
 float position=(dot(n,uDirection)-min(0.,uDirection.x)-min(0.,uDirection.y))/span;
 float delay=clamp(position,0.,1.)*2.8;
 float localTime=t-delay;
 float energy=smoothstep(uTiming.x,uTiming.y,localTime)*(1.-smoothstep(uTiming.z,uTiming.w,t));
 float leafPigment=smoothstep(.015,.08,original.g-original.b)*(1.-smoothstep(.035,.14,original.r-original.g));
 float foliage=regions.g*mix(leafPigment,1.,anchor.b);
 vec2 patch=floor(p/vec2(16.,12.))*vec2(16.,12.);
 float travelling=sin(dot(patch,uDirection)*.045-localTime*1.45);
 float distance=length((p-uOrigin*uSize)*vec2(1.,2.6));
 float radius=max(0.,t-5.)*28.;
 float ring=(contactWave(p,uContact0,t)+contactWave(p,uContact1,t)+contactWave(p,uContact2,t))*energy;
 float wave=mix(travelling*energy,ring,uMode==1.? .75:.2);
 float crest=0.;
 if(uMode==2.){
  float shore=min(min(shoreDistance(p,uShore0),shoreDistance(p,uShore1)),min(shoreDistance(p,uShore2),shoreDistance(p,uShore3)));
  crest=exp(-pow((shore-uSurf.x)/uSurf.y,2.))*uSurf.z;
  wave=sin((shore-uSurf.x)*.11)*crest;
 }
 float attachment=clamp(length((n-anchor.rg)*vec2(uSize.x/uSize.y,1.))*(anchor.b>.5?28.:4.),0.,1.);
 float sway=sin(localTime*1.4-patch.x*.008)*attachment*energy;
 vec2 offset=vec2((wave*2.5*regions.r+sway*2.*foliage),wave*.6*regions.r+sway*.25*foliage)*pigment;
 vec4 color=texture(uTexture,clamp(uv+offset*uInputSize.zw,uInputClamp.xy,uInputClamp.zw));
 float cloud=exp(-pow((position-(-.3+progress*1.6))/.23,2.));
 float shade=-cloud*.12*regions.b*energy;
 float sparkle=(travelling*.027+ring*.04)*regions.r*energy;
 float foliarLight=sin(patch.x*.017+patch.y*.009-t*.7)*foliage*.035*energy;
 color.rgb*=1.+(shade+sparkle+foliarLight)*pigment;
 // Relight existing shell relief instead of laying a smooth white vector strip
 // over it. White paper and protected coast geometry stay outside the mask.
 if(uMode==2.)color.rgb=mix(color.rgb,color.rgb*.82+vec3(.17,.18,.17),crest*regions.r*pigment*(.25+.65*uSurf.w));
 if(uMode==3.)color.rgb*=1.-.12*progress*pigment;
 if(uMode==3.){
   float warmth=smoothstep(.14,.28,original.r-original.b)*regions.b;
   color.rgb+=vec3(.18,.10,.016)*warmth*smoothstep(.1,.75,progress-n.x*.2);
 }
 if(uMode==4.)color.rgb+=vec3(.035,.024,.012)*regions.b*cloud*energy*pigment;
 finalColor=color;
}`;

export function scoreAt(scene,time){
  const s=scene.score,t=Math.max(0,Math.min(scene.duration,time));
  const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const energy=ease((t-s.onset)/(s.peak-s.onset))*(1-ease((t-s.decay)/(s.settle-s.decay)));
  return {time:t,energy,progress:t/scene.duration,ended:t>=scene.duration};
}

export class MaterialScene{
 static async mount(host,{scene,onTime=()=>{}}){
  const player=new MaterialScene();player.scene=scene;player.onTime=onTime;
  player.app=new PIXI.Application();const [sx,sy,w,h]=scene.crop;
  await player.app.init({width:w,height:h,resolution:Math.min(devicePixelRatio,2),autoDensity:true,antialias:true,autoStart:false,preference:'webgl',background:0xf8f6f1});
  player.app.canvas.style.cssText='width:100%;height:100%;object-fit:contain;display:block';host.append(player.app.canvas);
  player.sourceUrl=new URL('../'+scene.source,import.meta.url).href;
  const im=new Image();im.src=player.sourceUrl;await im.decode();
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(im,sx,sy,w,h,0,0,w,h);
  let repairPlate=null;
  if(scene.repairPlate){player.repairUrl=new URL('../'+scene.repairPlate,import.meta.url).href;repairPlate=new Image();repairPlate.src=player.repairUrl;await repairPlate.decode();}
  const objectMaterials=prepareObjects(canvas,scene.objects,repairPlate);
  player.art=PIXI.Texture.from(canvas);
  const makeCanvas=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const regions=makeCanvas(),anchors=makeCanvas(),rc=regions.getContext('2d'),ac=anchors.getContext('2d');
  rc.fillStyle='#000';rc.fillRect(0,0,w,h);ac.fillStyle='#808080';ac.fillRect(0,0,w,h);
  const draw=(ctx,r,color)=>{
   const path=polygon=>{polygon.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath();};
   ctx.save();ctx.fillStyle=color;ctx.beginPath();path(r.points);ctx.clip();ctx.beginPath();path(r.points);
   for(const polygon of r.exclusions||[])path(polygon);ctx.fill('evenodd');ctx.restore();
  };
  const priority={water:0,light:1,foliage:2,cloth:3};
  for(const r of [...scene.regions].sort((a,b)=>priority[a.kind]-priority[b.kind])){
   const strength=Math.round(Math.min(1,r.gain)*255),channel=r.kind==='water'?[strength,0,0]:r.kind==='light'?[0,0,strength]:[0,strength,0];
   rc.globalCompositeOperation='lighter';draw(rc,r,`rgb(${channel.join(',')})`);
   draw(ac,r,`rgb(${Math.round(r.anchor[0]*255)},${Math.round(r.anchor[1]*255)},${r.kind==='cloth'?255:0})`);
  }
  player.regionTexture=PIXI.Texture.from(regions);player.anchorTexture=PIXI.Texture.from(anchors);
  const origin=scene.regions.find(r=>r.kind==='water')?.anchor||[.5,.5];
  const shore=shorelineSegments(scene);while(shore.length<4)shore.push([0,0,0,0]);
  const contacts=contactOrigins(scene).slice(0,3);while(contacts.length<3)contacts.push([0,0,0,0]);
  player.filter=new PIXI.Filter({glProgram:PIXI.GlProgram.from({vertex,fragment}),resources:{uRegions:player.regionTexture.source,uAnchors:player.anchorTexture.source,sceneUniforms:{uShore0:{value:new Float32Array(shore[0]),type:'vec4<f32>'},uShore1:{value:new Float32Array(shore[1]),type:'vec4<f32>'},uShore2:{value:new Float32Array(shore[2]),type:'vec4<f32>'},uShore3:{value:new Float32Array(shore[3]),type:'vec4<f32>'},uSurf:{value:new Float32Array(4),type:'vec4<f32>'},uSize:{value:new Float32Array([w,h]),type:'vec2<f32>'},uScore:{value:new Float32Array(4),type:'vec4<f32>'},uOrigin:{value:new Float32Array(origin),type:'vec2<f32>'},uDirection:{value:new Float32Array(scene.score.direction),type:'vec2<f32>'},uTiming:{value:new Float32Array([scene.score.onset,scene.score.peak,scene.score.decay,scene.score.settle]),type:'vec4<f32>'},uContact0:{value:new Float32Array(contacts[0]),type:'vec4<f32>'},uContact1:{value:new Float32Array(contacts[1]),type:'vec4<f32>'},uContact2:{value:new Float32Array(contacts[2]),type:'vec4<f32>'},uMode:{value:({ripple:1,surf:2,dusk:3,glint:4})[scene.mode]||0,type:'f32'}}}});
  const sprite=new PIXI.Sprite(player.art);sprite.filters=[player.filter];sprite.filterArea=new PIXI.Rectangle(0,0,w,h);player.app.stage.addChild(sprite);
  player.objects=mountObjects(player.app.stage,objectMaterials,w,h);
  player.clock=new StoryClock(scene.duration);player.render(0);
  player.tick=()=>{if(!document.hidden&&!player.clock.paused)player.render(player.clock.tick(performance.now()));player.raf=requestAnimationFrame(player.tick);};
  player.visibility=()=>player.clock.suspend();document.addEventListener('visibilitychange',player.visibility);player.raf=requestAnimationFrame(player.tick);
  return player;
 }
 render(t){const s=scoreAt(this.scene,t),surf=surfAt(this.scene,t);this.filter.resources.sceneUniforms.uniforms.uScore.set([t,s.energy,s.progress,0]);this.filter.resources.sceneUniforms.uniforms.uSurf.set([surf.front,surf.width,surf.energy,surf.foam]);renderObjects(this.objects,t);this.app.render();this.onTime(t,s);}
 play(){this.clock.play();} pause(){this.clock.pause();} seek(t){this.clock.seek(t);this.render(this.clock.time);}
 async auditStability(){
  if(!this.scene.probes)return {available:false,reason:'No authored protection probes for this scene.'};
  this.pause();const restore=this.clock.time,gl=this.app.renderer.gl;
  const capture=t=>{this.render(t);gl.finish();const [,,w,h]=gl.getParameter(gl.VIEWPORT),pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return {w,h,pixels};};
  const a=capture(0),b=capture(this.scene.duration*.5);
  const difference=([x,y])=>{const px=Math.min(a.w-1,Math.max(0,Math.floor(x*a.w))),py=Math.min(a.h-1,Math.max(0,Math.floor((1-y)*a.h)));const i=(py*a.w+px)*4;return Math.max(...[0,1,2].map(c=>Math.abs(a.pixels[i+c]-b.pixels[i+c])));};
  const result={id:this.scene.id,fixedDifferences:this.scene.probes.fixed.map(difference),movingDifferences:this.scene.probes.moving.map(difference),scope:'Authored point samples, not visual acceptance.'};this.seek(restore);return result;
 }
 async benchmark(count=1000){
  this.pause();const restore=this.clock.time,start=performance.now(),before=performance.getEntriesByType('resource').length;let max=0;
  for(let i=0;i<count;i++){const b=performance.now();this.render(this.scene.duration*i/(count-1));max=Math.max(max,performance.now()-b);if(i%25===24){this.app.renderer.gl.finish();await new Promise(requestAnimationFrame);}}
  const result={frames:count,elapsedMs:Math.round(performance.now()-start),maxSubmissionMs:+max.toFixed(2),downloadedImages:1+(this.repairUrl?1:0),derivedMaskTextures:2+this.objects.filter(o=>o.maskTexture).length,derivedObjectTextures:this.objects.length,newRequests:performance.getEntriesByType('resource').length-before,visualReview:this.scene.visualReview};this.seek(restore);return result;
 }
 async destroy(){cancelAnimationFrame(this.raf);document.removeEventListener('visibilitychange',this.visibility);this.app.destroy(true,{children:true,texture:false});this.filter.destroy();for(const o of this.objects){o.texture.destroy(true);o.maskTexture?.destroy(true);}this.art.destroy(true);this.regionTexture.destroy(true);this.anchorTexture.destroy(true);}
}
