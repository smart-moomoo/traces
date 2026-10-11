import {vertex} from './environment.mjs';
import {prepareObjects,mountObjects,renderObjects,contactOrigins} from './material-objects.mjs?v=2-truss-matte';
import {StoryClock} from './timeline.mjs';
import {surfAt,shorelineSegments} from './surf.mjs';
import {makeShadowMap,makeReceiverPlanes,shadowPlanesAt} from './shadows.mjs?v=2-projection-planes';
import {loadScoreEngine,createScore} from './expressive-score.mjs';
import {actorsAt,receiversAt,lightResponse} from './scene-state.mjs?v=2-harbor-tether';

const fragment=`
precision highp float;
in vec2 vTextureCoord;
in vec2 vSceneCoord;
uniform sampler2D uTexture;
uniform sampler2D uRegions;
uniform sampler2D uAnchors;
uniform sampler2D uShadows;
uniform sampler2D uReceiverPlanes;
uniform vec4 uPlane0;
uniform vec4 uPlane1;
uniform vec4 uPlane2;
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
uniform vec4 uMotion0;
uniform vec4 uMotion1;
uniform vec4 uMotion2;
uniform float uVersion;
uniform vec4 uControls;
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
float contactWave(vec2 p,vec4 contact,vec4 motion,float t){
 float age=t-contact.z;if(age<0.||contact.w<=0.)return 0.;
 if(uVersion>1.){
  vec2 direction=motion.xy/max(length(motion.xy),.001),normal=vec2(-direction.y,direction.x);
  if(length(motion.xy)<.1){direction=vec2(1.,0.);normal=vec2(0.,1.);}
  vec2 delta=p-contact.xy;
  float along=dot(delta,direction),across=dot(delta,normal)*2.6;
  float distance=length(vec2(along*.7,across));
  float front=age*19.;
  float birth=smoothstep(0.,.65,age),death=1.-smoothstep(8.,15.,age);
  float velocityGain=mix(.5,1.,clamp(length(motion.xy)/18.,0.,1.));
  return sin((distance-front)*.12)*exp(-pow((distance-front)/24.,2.))*birth*death*contact.w*velocityGain;
 }
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
 if(uVersion>1.)energy=mix(uControls.x,uControls.y,clamp(position,0.,1.))*(1.-smoothstep(uTiming.w-2.8,uTiming.w,t));
 float leafPigment=smoothstep(.015,.08,original.g-original.b)*(1.-smoothstep(.035,.14,original.r-original.g));
 float mossPigment=smoothstep(.46,.72,min(original.r,original.g))*(1.-smoothstep(.01,.13,original.b-original.g));
 float warmPigment=smoothstep(.02,.10,original.r-original.b)*smoothstep(.4,.65,max(original.r,original.g));
 float body=regions.g*(anchor.b>.625&&anchor.b<.875?1.:0.);
 float foliage=body>0.?0.:regions.g*(anchor.b>.875?1.:anchor.b>.25?mossPigment:anchor.b>.075?max(leafPigment,warmPigment):leafPigment);
 vec2 patch=floor(p/vec2(16.,12.))*vec2(16.,12.);
 float travelling=sin(dot(patch,uDirection)*.045-localTime*1.45);
 float distance=length((p-uOrigin*uSize)*vec2(1.,2.6));
 float radius=max(0.,t-5.)*28.;
 float ring=(contactWave(p,uContact0,uMotion0,t)+contactWave(p,uContact1,uMotion1,t)+contactWave(p,uContact2,uMotion2,t))*energy;
 float wave=mix(travelling*energy,ring,uMode==1.? .75:.2);
 float crest=0.;
 if(uMode==2.){
  float shore=min(min(shoreDistance(p,uShore0),shoreDistance(p,uShore1)),min(shoreDistance(p,uShore2),shoreDistance(p,uShore3)));
  crest=exp(-pow((shore-uSurf.x)/uSurf.y,2.))*uSurf.z;
  wave=sin((shore-uSurf.x)*.11)*crest;
 }
 float attachment=anchor.b>.25&&anchor.b<.75?clamp((n.y-anchor.g)*10.,0.,1.):clamp(length((n-anchor.rg)*vec2(uSize.x/uSize.y,1.))*(anchor.b>.75?28.:4.),0.,1.);
 float sway=sin(localTime*1.4-patch.x*.008-attachment*.8)*attachment*energy;
 if(uVersion>1.)sway=attachment*(energy+.24*(uControls.y-uControls.x))*4.;
 vec2 offset=vec2((wave*(uVersion>1.?5.:2.5)*regions.r+sway*2.*foliage),wave*(uVersion>1.?1.2:.6)*regions.r+sway*.25*foliage)*pigment;
 float breath=pow(sin(clamp((t-4.)/20.,0.,1.)*6.2831853),2.)*smoothstep(0.,.08,anchor.g-n.y);
 offset.y+=body*breath*1.8;
 vec4 color=texture(uTexture,clamp(uv+offset*uInputSize.zw,uInputClamp.xy,uInputClamp.zw));
 float cloud=exp(-pow((position-(uVersion>1.?uControls.z:-.3+progress*1.6))/.23,2.));
 float projected=texture(uShadows,clamp(n+vec2(sin(localTime*.55)*.014,cos(localTime*.4)*.004)*energy,vec2(0.),vec2(1.))).r;
 float shade=uMode==4.?0.:-(cloud*.18+projected*.16)*regions.b*energy;
 shade+=projected*regions.b*uControls.w;
 vec3 receivers=texture(uReceiverPlanes,n).rgb;
 float restShadow=texture(uShadows,n).r;
 vec3 movedShadow=vec3(texture(uShadows,clamp(n-uPlane0.xy,vec2(0.),vec2(1.))).r,texture(uShadows,clamp(n-uPlane1.xy,vec2(0.),vec2(1.))).r,texture(uShadows,clamp(n-uPlane2.xy,vec2(0.),vec2(1.))).r);
 shade+=dot(receivers,(vec3(restShadow)-movedShadow)*vec3(uPlane0.z,uPlane1.z,uPlane2.z));
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
 if(uMode==4.)color.rgb+=vec3(.10,.073,.035)*regions.b*cloud*energy*pigment;
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
  if(scene.expression)player.expression=createScore(scene.expression,await loadScoreEngine());
  player.app=new PIXI.Application();const [sx,sy,w,h]=scene.crop;
  await player.app.init({width:w,height:h,resolution:Math.min(devicePixelRatio,2),autoDensity:true,antialias:true,autoStart:false,preference:'webgl',background:0xf8f6f1});
  player.app.canvas.style.cssText='width:100%;height:100%;object-fit:contain;display:block';host.append(player.app.canvas);
  player.sourceUrl=new URL('../'+scene.source,import.meta.url).href;
  const im=new Image();im.src=player.sourceUrl;await im.decode();
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(im,sx,sy,w,h,0,0,w,h);
  let repairPlate=null;
  if(scene.repairPlate){player.repairUrl=new URL('../'+scene.repairPlate,import.meta.url).href;repairPlate=new Image();repairPlate.src=player.repairUrl;await repairPlate.decode();}
  player.shadowTexture=PIXI.Texture.from(makeShadowMap(canvas,scene));
  player.receiverTexture=PIXI.Texture.from(makeReceiverPlanes(canvas,scene));
  const objectMaterials=prepareObjects(canvas,scene.objects,repairPlate,{preciseRepair:scene.version===2});
  player.auditAssets={source:im,cleanPlate:canvas,objects:objectMaterials};
  player.art=PIXI.Texture.from(canvas);
  const makeCanvas=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const regions=makeCanvas(),anchors=makeCanvas(),rc=regions.getContext('2d'),ac=anchors.getContext('2d');
  rc.fillStyle='#000';rc.fillRect(0,0,w,h);ac.fillStyle='#808080';ac.fillRect(0,0,w,h);
  const draw=(ctx,r,color)=>{
   const path=polygon=>{polygon.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));ctx.closePath();};
   ctx.save();ctx.fillStyle=color;ctx.beginPath();path(r.points);ctx.clip();if(r.kind==='body')ctx.filter='blur(2px)';ctx.beginPath();path(r.points);
   for(const polygon of r.exclusions||[])path(polygon);ctx.fill('evenodd');ctx.restore();
  };
  const priority={water:0,light:1,foliage:2,moss:3,body:4,cloth:5};
  for(const r of [...scene.regions].sort((a,b)=>priority[a.kind]-priority[b.kind])){
   const strength=Math.round(Math.min(1,r.gain)*255),channel=r.kind==='water'?[strength,0,0]:r.kind==='light'?[0,0,strength]:[0,strength,0];
   rc.globalCompositeOperation='lighter';draw(rc,r,`rgb(${channel.join(',')})`);
   draw(ac,r,`rgb(${Math.round(r.anchor[0]*255)},${Math.round(r.anchor[1]*255)},${r.kind==='cloth'?255:r.kind==='body'?192:r.kind==='moss'?128:r.palette==='warm'?32:0})`);
  }
  player.regionTexture=PIXI.Texture.from(regions);player.anchorTexture=PIXI.Texture.from(anchors);
  const origin=scene.regions.find(r=>r.kind==='water')?.anchor||[.5,.5];
  const shore=shorelineSegments(scene);while(shore.length<4)shore.push([0,0,0,0]);
  const contacts=(scene.version===2?receiversAt(scene,0).map(c=>[...c.position,c.born,c.strength]):contactOrigins(scene)).slice(0,3);while(contacts.length<3)contacts.push([0,0,0,0]);
  const emissions=scene.version===2?receiversAt(scene,0).map(c=>[c.velocity?.vx||0,c.velocity?.vy||0,0,0]):[];while(emissions.length<3)emissions.push([0,0,0,0]);
  player.filter=new PIXI.Filter({glProgram:PIXI.GlProgram.from({vertex,fragment}),resources:{uReceiverPlanes:player.receiverTexture.source,uShadows:player.shadowTexture.source,uRegions:player.regionTexture.source,uAnchors:player.anchorTexture.source,sceneUniforms:{uPlane0:{value:new Float32Array(4),type:'vec4<f32>'},uPlane1:{value:new Float32Array(4),type:'vec4<f32>'},uPlane2:{value:new Float32Array(4),type:'vec4<f32>'},uControls:{value:new Float32Array(4),type:'vec4<f32>'},uVersion:{value:scene.version||1,type:'f32'},uMotion0:{value:new Float32Array(emissions[0]),type:'vec4<f32>'},uMotion1:{value:new Float32Array(emissions[1]),type:'vec4<f32>'},uMotion2:{value:new Float32Array(emissions[2]),type:'vec4<f32>'},uShore0:{value:new Float32Array(shore[0]),type:'vec4<f32>'},uShore1:{value:new Float32Array(shore[1]),type:'vec4<f32>'},uShore2:{value:new Float32Array(shore[2]),type:'vec4<f32>'},uShore3:{value:new Float32Array(shore[3]),type:'vec4<f32>'},uSurf:{value:new Float32Array(4),type:'vec4<f32>'},uSize:{value:new Float32Array([w,h]),type:'vec2<f32>'},uScore:{value:new Float32Array(4),type:'vec4<f32>'},uOrigin:{value:new Float32Array(origin),type:'vec2<f32>'},uDirection:{value:new Float32Array(scene.score.direction),type:'vec2<f32>'},uTiming:{value:new Float32Array([scene.score.onset,scene.score.peak,scene.score.decay,scene.score.settle]),type:'vec4<f32>'},uContact0:{value:new Float32Array(contacts[0]),type:'vec4<f32>'},uContact1:{value:new Float32Array(contacts[1]),type:'vec4<f32>'},uContact2:{value:new Float32Array(contacts[2]),type:'vec4<f32>'},uMode:{value:({ripple:1,surf:2,dusk:3,glint:4})[scene.mode]||0,type:'f32'}}}});
  const sprite=new PIXI.Sprite(player.art);player.backgroundSprite=sprite;player.backgroundEffects=true;sprite.filters=[player.filter];sprite.filterArea=new PIXI.Rectangle(0,0,w,h);player.app.stage.addChild(sprite);
  player.objects=mountObjects(player.app.stage,objectMaterials,w,h);
  player.clock=new StoryClock(scene.duration);player.render(0);
  player.tick=()=>{if(!document.hidden&&!player.clock.paused)player.render(player.clock.tick(performance.now()));player.raf=requestAnimationFrame(player.tick);};
  player.visibility=()=>player.clock.suspend();document.addEventListener('visibilitychange',player.visibility);player.raf=requestAnimationFrame(player.tick);
  return player;
 }
 render(t){
  const s=scoreAt(this.scene,t),surf=surfAt(this.scene,t);
  const delayed=this.expression?.sample(Math.max(0,t-2.8)),controls=this.expression?.sample(t);
  if(controls){const planes=shadowPlanesAt(this.scene,controls);for(let i=0;i<3;i++)this.filter.resources.sceneUniforms.uniforms['uPlane'+i].set(planes[i]||[0,0,0,0]);}
  if(controls)this.filter.resources.sceneUniforms.uniforms.uControls.set([controls.wind||0,delayed.wind||0,controls.lightPosition||0,lightResponse(this.scene,controls)]);this.filter.resources.sceneUniforms.uniforms.uScore.set([t,s.energy,s.progress,0]);this.filter.resources.sceneUniforms.uniforms.uSurf.set([surf.front,surf.width,surf.energy,surf.foam]);renderObjects(this.objects,t,controls,this.scene.version===2?actorsAt(this.scene,t):null);this.app.render();this.onTime(t,s);}
 play(){this.clock.play();} pause(){this.clock.pause();} seek(t){this.clock.seek(t);this.render(this.clock.time);}
 setBackgroundEffects(enabled){this.backgroundEffects=!!enabled;this.backgroundSprite.filters=enabled?[this.filter]:[];this.render(this.clock.time);}
 async auditStability(){
  if(!this.scene.probes)return {available:false,reason:'No authored protection probes for this scene.'};
  this.pause();const restore=this.clock.time,gl=this.app.renderer.gl;
  const capture=t=>{this.render(t);gl.finish();const [,,w,h]=gl.getParameter(gl.VIEWPORT),pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return {w,h,pixels};};
  const a=capture(0),b=capture(this.scene.duration*.5);
  const difference=([x,y])=>{const px=Math.min(a.w-1,Math.max(0,Math.floor(x*a.w))),py=Math.min(a.h-1,Math.max(0,Math.floor((1-y)*a.h)));const i=(py*a.w+px)*4;return Math.max(...[0,1,2].map(c=>Math.abs(a.pixels[i+c]-b.pixels[i+c])));};
  const result={id:this.scene.id,fixedDifferences:this.scene.probes.fixed.map(difference),movingDifferences:this.scene.probes.moving.map(difference),scope:'Authored point samples, not visual acceptance.'};this.seek(restore);return result;
 }
 async auditApertures(){
  const objects=this.scene.objects||[];
  if(!objects.length||objects.some(o=>!o.clipPolygon))return {available:false,reason:'This scene is not entirely confined to fixed apertures.'};
  this.pause();const restore=this.clock.time,effects=this.backgroundEffects,gl=this.app.renderer.gl;
  try{
   this.setBackgroundEffects(false);
   const capture=t=>{this.render(t);gl.finish();const [,,w,h]=gl.getParameter(gl.VIEWPORT),pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return {w,h,pixels};};
   const base=capture(0),mask=document.createElement('canvas');mask.width=base.w;mask.height=base.h;
   const ctx=mask.getContext('2d');ctx.scale(base.w/this.scene.crop[2],base.h/this.scene.crop[3]);ctx.fillStyle=ctx.strokeStyle='white';ctx.lineWidth=3;
   for(const object of objects){ctx.beginPath();object.clipPolygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();ctx.stroke();}
   const allowed=ctx.getImageData(0,0,base.w,base.h).data,reports=[];
   for(const fraction of [.1,.25,.4,.5,.65,.8,1]){
    const time=this.scene.duration*fraction,frame=capture(time);let outsideChanged=0,insideChanged=0,maxOutsideDelta=0,maxInsideDelta=0;
    for(let y=0;y<base.h;y++)for(let x=0;x<base.w;x++){
     const i=(y*base.w+x)*4,permitted=allowed[((base.h-1-y)*base.w+x)*4+3]>0;
     const delta=Math.max(...[0,1,2].map(c=>Math.abs(base.pixels[i+c]-frame.pixels[i+c])));
     if(permitted){maxInsideDelta=Math.max(maxInsideDelta,delta);if(delta>1)insideChanged++;}
     else{maxOutsideDelta=Math.max(maxOutsideDelta,delta);if(delta>1)outsideChanged++;}
    }
    reports.push({time,outsideChanged,insideChanged,maxOutsideDelta,maxInsideDelta});
   }
   return {id:this.scene.id,width:base.w,height:base.h,backgroundEffects:false,edgeAllowanceSourcePixels:1.5,reports,scope:'Every rendered pixel outside fixed apertures compared at seven times. Engineering containment/rest evidence only, not artistic acceptance.'};
  }finally{this.setBackgroundEffects(effects);this.seek(restore);}
 }
 async benchmark(count=1000){
  this.pause();const restore=this.clock.time,start=performance.now(),before=performance.getEntriesByType('resource').length;let max=0;
  for(let i=0;i<count;i++){const b=performance.now();this.render(this.scene.duration*i/(count-1));max=Math.max(max,performance.now()-b);if(i%25===24){this.app.renderer.gl.finish();await new Promise(requestAnimationFrame);}}
  const result={frames:count,elapsedMs:Math.round(performance.now()-start),maxSubmissionMs:+max.toFixed(2),downloadedImages:1+(this.repairUrl?1:0),derivedMaskTextures:4+this.objects.filter(o=>o.maskTexture).length,derivedObjectTextures:this.objects.length,newRequests:performance.getEntriesByType('resource').length-before,visualReview:this.scene.visualReview};this.seek(restore);return result;
 }
 async destroy(){cancelAnimationFrame(this.raf);document.removeEventListener('visibilitychange',this.visibility);this.expression?.destroy();this.app.destroy(true,{children:true,texture:false});this.filter.destroy();for(const o of this.objects){o.rig?.geometry?.destroy(true);o.texture.destroy(true);o.maskTexture?.destroy(true);}this.art.destroy(true);this.regionTexture.destroy(true);this.anchorTexture.destroy(true);this.shadowTexture.destroy(true);this.receiverTexture.destroy(true);}
}
