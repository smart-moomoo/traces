// Derive projected leaf silhouettes from the original artwork once. These are
// lighting masks, not new visible objects or replacement artwork.
export function makeShadowMap(source,scene){
 const result=document.createElement('canvas');result.width=source.width;result.height=source.height;
 const out=result.getContext('2d');out.fillStyle='black';out.fillRect(0,0,result.width,result.height);
 for(const projection of scene.shadows||[]){
  const [sx,sy,sw,sh]=projection.source.map((v,i)=>v*(i%2?source.height:source.width));
  const [dx,dy,dw,dh]=projection.target.map((v,i)=>v*(i%2?source.height:source.width));
  const mask=document.createElement('canvas');mask.width=Math.ceil(sw);mask.height=Math.ceil(sh);
  const ctx=mask.getContext('2d');ctx.drawImage(source,sx,sy,sw,sh,0,0,mask.width,mask.height);
  const data=ctx.getImageData(0,0,mask.width,mask.height);
  for(let i=0;i<data.data.length;i+=4){
   const r=data.data[i]/255,g=data.data[i+1]/255,b=data.data[i+2]/255;
   const leafy=Math.max(0,Math.min(1,(g-b-.025)*9))*(1-Math.max(0,Math.min(1,(r-g-.12)*8)));
   const warm=projection.warm?Math.max(0,Math.min(1,(r-b-.05)*6)):0;
   data.data[i]=data.data[i+1]=data.data[i+2]=Math.round(Math.max(leafy,warm)*255);data.data[i+3]=255;
  }
  ctx.putImageData(data,0,0);out.save();out.globalCompositeOperation='screen';out.filter='blur(3px)';out.drawImage(mask,dx,dy,dw,dh);out.restore();
 }
 return result;
}

// Three static receiving planes packed in RGB. Their boundaries never move;
// only the source-derived shadow coordinates do. This prevents an entire
// facade, roof or paper margin being translated with its illumination.
export function makeReceiverPlanes(source,scene){
 const c=document.createElement('canvas');c.width=scene.shadowPlanes?.length?source.width:1;c.height=scene.shadowPlanes?.length?source.height:1;
 const ctx=c.getContext('2d');ctx.fillStyle='black';ctx.fillRect(0,0,c.width,c.height);
 for(const [i,p] of (scene.shadowPlanes||[]).entries()){
  if(i>=3)throw new Error('At most three independent receiving planes per scene');
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=['red','lime','blue'][i];ctx.beginPath();
  for(const poly of [p.points,...(p.exclusions||[])]){poly.forEach(([x,y],j)=>j?ctx.lineTo(x*c.width,y*c.height):ctx.moveTo(x*c.width,y*c.height));ctx.closePath();}
  ctx.fill('evenodd');ctx.restore();
 }
 return c;
}
export function shadowPlanesAt(scene,controls){
 return (scene.shadowPlanes||[]).map(p=>{
  const value=controls[p.channel];if(!Number.isFinite(value))throw new Error(`Missing shadow plane channel: ${p.channel}`);
  return [p.travel[0]*value,p.travel[1]*value,p.strength,1];
 });
}
