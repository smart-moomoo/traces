import {actorsAt} from './scene-state.mjs?v=2-lift-shadow';
import {rigPadding} from './material-rig.mjs?v=2-harbor-tether';
// Workbench-only visual evidence. No pass/fail is inferred from these images.
export function inspectAssets(player,host){
 host.replaceChildren();
 if(!player.auditAssets){host.textContent='This renderer has not exposed its source reconstruction yet.';return;}
 const {source,cleanPlate,objects}=player.auditAssets,[sx,sy,w,h]=player.scene.crop;
 const add=(label,draw,width=w,height=h)=>{
  const figure=document.createElement('figure');figure.style.margin='0';
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.style.cssText='width:100%;max-height:340px;object-fit:contain;display:block';draw(canvas.getContext('2d'));
  const caption=document.createElement('figcaption');caption.textContent=label;figure.append(canvas,caption);host.append(figure);return canvas;
 };
 const original=add('原画：静止重建基准',ctx=>ctx.drawImage(source,sx,sy,w,h,0,0,w,h));
 add('物体移除：检查完整露出区域',ctx=>ctx.drawImage(cleanPlate,0,0));
 const restored=add('源位置重建：检查接缝、丢失与重复',ctx=>{ctx.drawImage(cleanPlate,0,0);for(const {definition,cutout} of objects)ctx.drawImage(cutout,definition.crop[0],definition.crop[1]);});
 add('差异放大 × 4（诊断，不代表视觉合格）',ctx=>{
  const a=original.getContext('2d').getImageData(0,0,w,h),b=restored.getContext('2d').getImageData(0,0,w,h);
  for(let i=0;i<a.data.length;i+=4){for(let c=0;c<3;c++)a.data[i+c]=Math.min(255,Math.abs(a.data[i+c]-b.data[i+c])*4);a.data[i+3]=255;}ctx.putImageData(a,0,0);
 });
 for(const {definition,cutout} of objects){
  const pad=12,ww=cutout.width+2*pad,hh=cutout.height+2*pad;
  add(`${definition.id} · 原位露出`,ctx=>ctx.drawImage(cleanPlate,definition.crop[0]-pad,definition.crop[1]-pad,ww,hh,0,0,ww,hh),ww,hh);
  for(const color of ['#f8f6ef','#263539'])add(`${definition.id} · ${color}`,ctx=>{ctx.fillStyle=color;ctx.fillRect(0,0,ww,hh);ctx.drawImage(cutout,pad,pad);},ww,hh);
 }
}

export function inspectPoses(player,host){
 host.replaceChildren();const scene=player.scene;
 if(!scene?.objects?.length){host.textContent='此场景没有独立物体；请检查整段环境运动。';return;}
 const restore=player.clock.time;player.pause();
 const roots=new Set(scene.subjects?.map(s=>s.root));
 for(const t of [...new Set(scene.inspectionTimes||[0,3,5,8,scene.duration*.5,scene.duration*.8,scene.duration])]){
  player.seek(t);const poses=actorsAt(scene,t);
  for(const object of scene.objects.filter(o=>roots.size?roots.has(o.id):!o.follows)){
   // Follow the whole semantic subject, including articulated children. A hull
   // crop alone hid both sails and made rig-action inspection meaningless.
   const subject=scene.subjects?.find(s=>s.root===object.id);
   const parts=scene.objects.filter(o=>subject?subject.parts.includes(o.id):o.id===object.id||o.follows?.actor===object.id);
   const bounds=[Infinity,Infinity,-Infinity,-Infinity];
   for(const part of parts){
    if(part.clipPolygon){
     // Inspect the housing and its opening, not an already hidden shutter's
     // off-screen coordinates. The latter showed only sky at full retraction.
     for(const [x,y] of part.clipPolygon){bounds[0]=Math.min(bounds[0],x-12);bounds[1]=Math.min(bounds[1],y-12);bounds[2]=Math.max(bounds[2],x+12);bounds[3]=Math.max(bounds[3],y+12);}
     continue;
    }
    const p=poses.get(part.id),c=Math.cos(p.rotation),s=Math.sin(p.rotation),pad=12+rigPadding(part);
    for(const [xx,yy] of part.outline){
     const dx=(xx-part.pivot[0])*p.scaleX,dy=(yy-part.pivot[1])*p.scaleY;
     const x=p.x+dx*c-dy*s,y=p.y+dx*s+dy*c;
     bounds[0]=Math.min(bounds[0],x-pad);bounds[1]=Math.min(bounds[1],y-pad);bounds[2]=Math.max(bounds[2],x+pad);bounds[3]=Math.max(bounds[3],y+pad);
    }
   }
   const [x,y]=bounds,w=Math.ceil(bounds[2]-x),h=Math.ceil(bounds[3]-y);
   const figure=document.createElement('figure'),canvas=document.createElement('canvas'),label=document.createElement('figcaption');
   canvas.width=w;canvas.height=h;canvas.style.cssText='width:100%;max-height:300px;object-fit:contain';
   const sx=player.app.canvas.width/scene.crop[2],sy=player.app.canvas.height/scene.crop[3];
   canvas.getContext('2d').drawImage(player.app.canvas,x*sx,y*sy,w*sx,h*sy,0,0,w,h);
   label.textContent=`${subject?.label||object.id} · ${t.toFixed(1)} 秒 · 实际合成局部`;
   figure.style.margin='0';figure.append(canvas,label);host.append(figure);
  }
 }
 player.seek(restore);
}
