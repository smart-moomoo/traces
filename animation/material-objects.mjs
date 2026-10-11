import {evaluateTrack} from './scene-contract.mjs';
import {mountRig,sampleRig} from './material-rig.mjs?v=2-harbor-tether';

// Close sub-pixel pigment holes inside an authored silhouette. The original
// coverage is a hard upper bound: intentionally cut source holes and exterior
// sky never become part of the moving object. Runs once during extraction.
export function closeMaterialMatte(rgba,width,height,radius,coverage){
 const count=width*height,dilated=new Uint8ClampedArray(count),closed=new Uint8ClampedArray(count);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  let maximum=0;
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   const xx=x+dx,yy=y+dy;if(xx>=0&&xx<width&&yy>=0&&yy<height)maximum=Math.max(maximum,rgba[(yy*width+xx)*4+3]);
  }
  dilated[y*width+x]=maximum;
 }
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  let minimum=255;
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   const xx=Math.max(0,Math.min(width-1,x+dx)),yy=Math.max(0,Math.min(height-1,y+dy));minimum=Math.min(minimum,dilated[yy*width+xx]);
  }
  const i=y*width+x;closed[i]=Math.min(minimum,coverage[i]);
 }
 for(let i=0;i<count;i++)rgba[i*4+3]=closed[i];
}

// Small authored fragments share the original material, world coordinates and
// time score. No generated frames and no free-running physics state.
export function objectPose(object,time){
 const read=(name,fallback)=>object.tracks[name]?evaluateTrack(object.tracks[name],time):fallback;
 const pitch=read('pitch',0),foreshortening=Math.cos(pitch),axis=object.projection?.axis;
 return {lift:object.projection?.shadowFromPitch?Math.abs(Math.sin(pitch)):read('lift',0),
  x:read('x',object.anchor[0]),y:read('y',object.anchor[1]),rotation:read('rotation',0),scale:read('scale',1),
  scaleX:read('scaleX',read('scale',1))*(axis==='y'?foreshortening:1),
  scaleY:read('scaleY',read('scale',1))*(axis==='x'?foreshortening:1)};
}
// A wake belongs to the position where contact happened, not the current actor
// position. Missing authored contacts produce no invented impact rings.
export function contactOrigins(scene){
 const [,,width,height]=scene.crop;
 return (scene.contacts||[]).map(event=>{
  if(event.object){
   const object=scene.objects?.find(o=>o.id===event.object);
   if(!object)throw new Error(`Unknown contact actor: ${event.object}`);
   const pose=objectPose(object,event.time);
   return [pose.x+(event.offset?.[0]||0),pose.y+(event.offset?.[1]||0),event.time,event.strength??1];
  }
  if(!event.position)throw new Error('Contact needs an actor or authored position');
  return [event.position[0]*width,event.position[1]*height,event.time,event.strength??1];
 });
}
export function prepareObjects(canvas,definitions=[],repairPlate=null,{preciseRepair=false}={}){
 const source=document.createElement('canvas');source.width=canvas.width;source.height=canvas.height;
 source.getContext('2d').drawImage(canvas,0,0);
 return definitions.map(definition=>{
  const [x,y,w,h]=definition.crop,cutout=document.createElement('canvas');cutout.width=w;cutout.height=h;
  const ctx=cutout.getContext('2d');ctx.beginPath();
  definition.outline.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.clip();ctx.drawImage(source,-x,-y);
  // Foreground leaves/rails belong to their own depth plane. Removing their
  // source pixels from an actor prevents the actor carrying a second copy.
  const sourceHoles=[...(definition.sourceExclusions||[]),...(definition.sourceHoles||[])];
  if(sourceHoles.length){
   ctx.save();ctx.globalCompositeOperation='destination-out';
   for(const polygon of sourceHoles){ctx.beginPath();polygon.forEach(([px,py],i)=>i?ctx.lineTo(px-x,py-y):ctx.moveTo(px-x,py-y));ctx.closePath();ctx.fill();}
   ctx.restore();
  }
  if(['warm-reflection','foliage','vegetation','moss','salt','mechanical-gold','ivory-rigging','rust-structure','gold-water'].includes(definition.matte)){
   // Retain warm/dark reflected pigment, not the surrounding cyan water tile.
   // This is a source-pixel matte; no synthetic mirrored replacement artwork.
   const data=ctx.getImageData(0,0,w,h);
   const coverage=definition.matteClose?new Uint8ClampedArray(w*h):null;
   if(coverage)for(let i=0;i<coverage.length;i++)coverage[i]=data.data[i*4+3];
   for(let i=0;i<data.data.length;i+=4){
    const r=data.data[i],g=data.data[i+1],b=data.data[i+2],warm=Math.max(r-b,g-b);
    const green=(Math.min(g-r,g-b)+2)/8;
    // Gold leaves and lit brown twigs need full opacity too; a luminance cap
    // left half of each lit twig in the base and produced a duplicate branch.
    const vegetation=Math.max(green,Math.min((g-b-10)/18,(r-b-35)/25),definition.matteDark===undefined?0:(definition.matteDark-b)/24);
    const moss=Math.min((r-110)/45,(g-100)/45,(r-g+5)/12,(g-b+8)/25);
    const salt=Math.min((r-165)/25,(g-165)/25,(r-b+12)/16);
    const gold=Math.min((r-60)/45,(g-35)/30,(r-b-20)/25);
    const ivory=Math.min((r-175)/40,(g-170)/40,(b-150)/45);
    const structure=1-Math.max(0,Math.min(1,(g-r-3)/10));
    const reflectedGold=Math.min((r-b-6)/16,(g-b-2)/12,(r-120)/40);
    const pigment=definition.matte==='gold-water'?reflectedGold:definition.matte==='rust-structure'?structure:definition.matte==='ivory-rigging'?ivory:definition.matte==='mechanical-gold'?gold:definition.matte==='salt'?salt:definition.matte==='moss'?moss:definition.matte==='vegetation'?vegetation:definition.matte==='foliage'?green:(warm-3)/14;
    const alpha=Math.max(0,Math.min(1,definition.matte==='vegetation'?(pigment-.25)/.5:pigment));data.data[i+3]*=alpha*alpha*(3-2*alpha);
   }
   if(coverage)closeMaterialMatte(data.data,w,h,definition.matteClose,coverage);
   ctx.putImageData(data,0,0);
  }
  // Repair only the exact source footprint, with a declared existing material
  // sample. The extracted fragment is restored at its original pose at t=0.
  const plate=canvas.getContext('2d');
  if(definition.repair===false)return {definition,cutout,texture:PIXI.Texture.from(cutout)};
  if(repairPlate){
   if(['foliage','vegetation','moss','salt','ivory-rigging','gold-water'].includes(definition.matte)){
    // Repair the pigment mask, not its bounding polygon: blue/cream sky tiles
    // between leaves must stay original instead of moving as a textured patch.
    const patch=document.createElement('canvas');patch.width=w;patch.height=h;
    const pc=patch.getContext('2d');pc.drawImage(repairPlate,-x,-y,canvas.width,canvas.height);
    pc.globalCompositeOperation='destination-in';pc.drawImage(cutout,0,0);plate.drawImage(patch,x,y);
    // Detached children are erased from the base as part of the parent, but
    // are restored separately by their own attached/released draw state.
    if(definition.sourceHoles?.length){plate.save();plate.beginPath();for(const polygon of definition.sourceHoles){polygon.forEach(([px,py],i)=>i?plate.lineTo(px,py):plate.moveTo(px,py));plate.closePath();}plate.clip();plate.drawImage(repairPlate,0,0,canvas.width,canvas.height);plate.restore();}
    return {definition,cutout,texture:PIXI.Texture.from(cutout)};
   }
   if(preciseRepair){
    plate.save();plate.beginPath();(definition.eraseOutline||definition.outline).forEach(([px,py],i)=>i?plate.lineTo(x+px,y+py):plate.moveTo(x+px,y+py));plate.closePath();plate.clip();plate.drawImage(repairPlate,0,0,canvas.width,canvas.height);plate.restore();
    if(definition.sourceExclusions?.length){plate.save();plate.beginPath();for(const polygon of definition.sourceExclusions){polygon.forEach(([px,py],i)=>i?plate.lineTo(px,py):plate.moveTo(px,py));plate.closePath();}plate.clip();plate.drawImage(source,0,0);plate.restore();}
    return {definition,cutout,texture:PIXI.Texture.from(cutout)};
   }
   const pad=3,patch=document.createElement('canvas'),mask=document.createElement('canvas');patch.width=mask.width=w+pad*2;patch.height=mask.height=h+pad*2;
   const pc=patch.getContext('2d'),mc=mask.getContext('2d');pc.drawImage(repairPlate,-x+pad,-y+pad,canvas.width,canvas.height);
   mc.fillStyle=mc.strokeStyle='white';mc.lineWidth=4;mc.lineJoin='round';mc.beginPath();definition.outline.forEach(([px,py],i)=>i?mc.lineTo(px+pad,py+pad):mc.moveTo(px+pad,py+pad));mc.closePath();mc.fill();mc.stroke();
   pc.globalCompositeOperation='destination-in';pc.filter='blur(1px)';pc.drawImage(mask,0,0);plate.drawImage(patch,x-pad,y-pad);
   return {definition,cutout,texture:PIXI.Texture.from(cutout)};
  }
  plate.save();plate.beginPath();
  const pad=definition.repairPadding||0;
  if(pad)plate.rect(x-pad,y-pad,w+pad*2,h+pad*2);else definition.outline.forEach(([px,py],i)=>i?plate.lineTo(x+px,y+py):plate.moveTo(x+px,y+py));plate.closePath();plate.clip();
  const [sx,sy,sw,sh]=definition.repairSample;plate.drawImage(source,sx,sy,sw,sh,x-pad,y-pad,w+pad*2,h+pad*2);plate.restore();
  return {definition,cutout,texture:PIXI.Texture.from(cutout)};
 });
}
export function mountObjects(stage,prepared,width,height){
 return prepared.map(({definition,texture})=>{
  const group=new PIXI.Container(),rig=mountRig(texture,definition),sprite=rig.display;sprite.pivot.set(...definition.pivot);
  let contactShadow;
  if((definition.landingTime!==undefined||definition.liftShadow)){contactShadow=new PIXI.Sprite(texture);contactShadow.pivot.set(...definition.pivot);contactShadow.tint=0x625743;contactShadow.alpha=0;group.addChild(contactShadow);}
  group.addChild(sprite);stage.addChild(group);
  let maskTexture;
  if(definition.occluders?.length||definition.clipPolygon){
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='white';
   // Fixed apertures are world-space receiver geometry: a retracting shutter
   // disappears behind its housing rather than sliding over the whole dome.
   if(definition.clipPolygon){ctx.beginPath();definition.clipPolygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
   else ctx.fillRect(0,0,width,height);
   ctx.globalCompositeOperation='destination-out';
   for(const polygon of definition.occluders||[]){ctx.beginPath();polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
   maskTexture=PIXI.Texture.from(canvas);const mask=new PIXI.Sprite(maskTexture);stage.addChild(mask);group.mask=mask;
  }
  return {definition,texture,maskTexture,sprite,rig,contactShadow};
 });
}
export function renderObjects(objects,time,state={},poses=null){
 for(const {definition,sprite,rig,contactShadow} of objects){const pose=poses?.get(definition.id)||objectPose(definition,time);sprite.position.set(pose.x,pose.y);sprite.rotation=pose.rotation;sprite.scale.set(pose.scaleX,pose.scaleY);sampleRig(rig,definition,state);
  if(contactShadow&&definition.liftShadow){const lift=Math.max(0,Math.min(1,pose.lift));contactShadow.position.set(pose.x+lift*3,pose.y+lift*4);contactShadow.rotation=pose.rotation;contactShadow.scale.set(pose.scaleX,pose.scaleY);contactShadow.alpha=lift*.18;}
  else if(contactShadow){const p=Math.max(0,Math.min(1,(time-definition.landingTime)/.6));contactShadow.position.set(pose.x+1,pose.y+1.5);contactShadow.rotation=pose.rotation;contactShadow.scale.set(pose.scaleX,pose.scaleY*.55);contactShadow.alpha=p*p*(3-2*p)*.2;}
 }
}
