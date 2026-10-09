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
