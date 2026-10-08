import {evaluateTrack} from './scene-contract.mjs';

// Small authored fragments share the original material, world coordinates and
// time score. No generated frames and no free-running physics state.
export function objectPose(object,time){
 const read=(name,fallback)=>object.tracks[name]?evaluateTrack(object.tracks[name],time):fallback;
 return {x:read('x',object.anchor[0]),y:read('y',object.anchor[1]),rotation:read('rotation',0),scale:read('scale',1)};
}
export function prepareObjects(canvas,definitions=[]){
 const source=document.createElement('canvas');source.width=canvas.width;source.height=canvas.height;
 source.getContext('2d').drawImage(canvas,0,0);
 return definitions.map(definition=>{
  const [x,y,w,h]=definition.crop,cutout=document.createElement('canvas');cutout.width=w;cutout.height=h;
  const ctx=cutout.getContext('2d');ctx.beginPath();
  definition.outline.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();ctx.clip();ctx.drawImage(source,-x,-y);
  // Repair only the exact source footprint, with a declared existing material
  // sample. The extracted fragment is restored at its original pose at t=0.
  const plate=canvas.getContext('2d');plate.save();plate.beginPath();
  const pad=definition.repairPadding||0;
  if(pad)plate.rect(x-pad,y-pad,w+pad*2,h+pad*2);else definition.outline.forEach(([px,py],i)=>i?plate.lineTo(x+px,y+py):plate.moveTo(x+px,y+py));plate.closePath();plate.clip();
  const [sx,sy,sw,sh]=definition.repairSample;plate.drawImage(source,sx,sy,sw,sh,x-pad,y-pad,w+pad*2,h+pad*2);plate.restore();
  return {definition,texture:PIXI.Texture.from(cutout)};
 });
}
export function mountObjects(stage,prepared,width,height){
 return prepared.map(({definition,texture})=>{
  const group=new PIXI.Container(),sprite=new PIXI.Sprite(texture);sprite.pivot.set(...definition.pivot);group.addChild(sprite);stage.addChild(group);
  let maskTexture;
  if(definition.occluders?.length){
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation='destination-out';
   for(const polygon of definition.occluders){ctx.beginPath();polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
   maskTexture=PIXI.Texture.from(canvas);const mask=new PIXI.Sprite(maskTexture);stage.addChild(mask);group.mask=mask;
  }
  return {definition,texture,maskTexture,sprite};
 });
}
export function renderObjects(objects,time){
 for(const {definition,sprite} of objects){const pose=objectPose(definition,time);sprite.position.set(pose.x,pose.y);sprite.rotation=pose.rotation;sprite.scale.set(pose.scale);}
}
