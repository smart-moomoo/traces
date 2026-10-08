import {vertex} from './environment.mjs';
import {prepareObjects,mountObjects,renderObjects} from './material-objects.mjs';
import {StoryClock} from './timeline.mjs';

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
uniform float uMode;
out vec4 finalColor;
void main(){
 vec2 p=vSceneCoord,uv=vTextureCoord,n=p/uSize;
 vec4 original=texture(uTexture,uv),regions=texture(uRegions,n),anchor=texture(uAnchors,n);
 float pigment=smoothstep(.025,.12,max(original.r,max(original.g,original.b))-min(original.r,min(original.g,original.b)));
 float t=uScore.x,energy=uScore.y,progress=uScore.z;
 float leafPigment=smoothstep(.015,.08,original.g-original.b)*(1.-smoothstep(.035,.14,original.r-original.g));
 float foliage=regions.g*mix(leafPigment,1.,anchor.b);
 vec2 patch=floor(p/vec2(16.,12.))*vec2(16.,12.);
 float travelling=sin(patch.y*.10+patch.x*.016-t*1.45);
 float distance=length((p-uOrigin*uSize)*vec2(1.,2.6));
 float radius=max(0.,t-5.)*28.;
 float ring=sin((distance-radius)*.11)*exp(-pow((distance-radius)/90.,2.))*energy;
 float wave=mix(travelling*energy,ring,uMode==1.? .75:.2);
 if(uMode==2.)wave=sin(patch.y*.09-patch.x*.02-t*1.2)*energy;
 float attachment=clamp(abs(n.y-anchor.g)*4.,0.,1.);
 float sway=sin(t*1.4-patch.x*.008)*attachment*energy;
 vec2 offset=vec2((wave*2.5*regions.r+sway*2.*foliage),wave*.6*regions.r+sway*.25*foliage)*pigment;
 vec4 color=texture(uTexture,clamp(uv+offset*uInputSize.zw,uInputClamp.xy,uInputClamp.zw));
 float cloud=exp(-pow((n.x+n.y*.18-(-.3+progress*1.6))/.23,2.));
 float shade=-cloud*.12*regions.b*energy;
 float sparkle=(travelling*.027+ring*.04)*regions.r*energy;
 float foliarLight=sin(patch.x*.017+patch.y*.009-t*.7)*foliage*.035*energy;
 color.rgb*=1.+(shade+sparkle+foliarLight)*pigment;
 if(uMode==3.)color.rgb*=1.-.12*progress*pigment;
 if(uMode==3.){
   float warmth=smoothstep(.14,.28,original.r-original.b)*regions.b;
   color.rgb+=vec3(.18,.10,.016)*warmth*progress;
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
  const objectMaterials=prepareObjects(canvas,scene.objects);
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
  player.filter=new PIXI.Filter({glProgram:PIXI.GlProgram.from({vertex,fragment}),resources:{uRegions:player.regionTexture.source,uAnchors:player.anchorTexture.source,sceneUniforms:{uSize:{value:new Float32Array([w,h]),type:'vec2<f32>'},uScore:{value:new Float32Array(4),type:'vec4<f32>'},uOrigin:{value:new Float32Array(origin),type:'vec2<f32>'},uMode:{value:({ripple:1,surf:2,dusk:3,glint:4})[scene.mode]||0,type:'f32'}}}});
  const sprite=new PIXI.Sprite(player.art);sprite.filters=[player.filter];sprite.filterArea=new PIXI.Rectangle(0,0,w,h);player.app.stage.addChild(sprite);
  player.objects=mountObjects(player.app.stage,objectMaterials,w,h);
  player.clock=new StoryClock(scene.duration);player.render(0);
  player.tick=()=>{if(!document.hidden&&!player.clock.paused)player.render(player.clock.tick(performance.now()));player.raf=requestAnimationFrame(player.tick);};
  player.visibility=()=>player.clock.suspend();document.addEventListener('visibilitychange',player.visibility);player.raf=requestAnimationFrame(player.tick);
  return player;
 }
 render(t){const s=scoreAt(this.scene,t);this.filter.resources.sceneUniforms.uniforms.uScore.set([t,s.energy,s.progress,0]);renderObjects(this.objects,t);this.app.render();this.onTime(t,s);}
 play(){this.clock.play();} pause(){this.clock.pause();} seek(t){this.clock.seek(t);this.render(this.clock.time);}
 async benchmark(count=1000){
  this.pause();const restore=this.clock.time,start=performance.now(),before=performance.getEntriesByType('resource').length;let max=0;
  for(let i=0;i<count;i++){const b=performance.now();this.render(this.scene.duration*i/(count-1));max=Math.max(max,performance.now()-b);if(i%25===24){this.app.renderer.gl.finish();await new Promise(requestAnimationFrame);}}
  const result={frames:count,elapsedMs:Math.round(performance.now()-start),maxSubmissionMs:+max.toFixed(2),downloadedImages:1,derivedMaskTextures:2+this.objects.filter(o=>o.maskTexture).length,derivedObjectTextures:this.objects.length,newRequests:performance.getEntriesByType('resource').length-before,visualReview:this.scene.visualReview};this.seek(restore);return result;
 }
 async destroy(){cancelAnimationFrame(this.raf);document.removeEventListener('visibilitychange',this.visibility);this.app.destroy(true,{children:true,texture:false});this.filter.destroy();for(const o of this.objects){o.texture.destroy(true);o.maskTexture?.destroy(true);}this.art.destroy(true);this.regionTexture.destroy(true);this.anchorTexture.destroy(true);}
}
