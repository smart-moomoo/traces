// Native-resolution source diagnostics. Counts locate defects; they do not
// accept artwork, alpha quality, motion or hidden-area plausibility.
export function compareSourcePixels(source,rebuilt,coverage,{threshold=6}={}){
 if(source.length!==rebuilt.length||source.length!==coverage.length||source.length%4)throw new Error('Matching RGBA planes required');
 let changedPixels=0,outsidePixels=0,maxDelta=0,totalDelta=0,edgePixels=0;
 const heat=new Uint8ClampedArray(source.length);
 for(let i=0;i<source.length;i+=4){
  let delta=0;for(let c=0;c<3;c++){const d=Math.abs(source[i+c]-rebuilt[i+c]);delta=Math.max(delta,d);totalDelta+=d;heat[i+c]=Math.min(255,d*4);}heat[i+3]=255;
  maxDelta=Math.max(maxDelta,delta);if(delta>threshold){changedPixels++;if(coverage[i+3]===0)outsidePixels++;else if(coverage[i+3]<255)edgePixels++;}
 }
 return {metrics:{pixels:source.length/4,threshold,changedPixels,outsideDeclaredPixels:outsidePixels,edgePixels,maxDelta,meanChannelDelta:totalDelta/(source.length/4*3)},heat};
}
export function reconstructionAudit(player){
 const {source,cleanPlate,objects}=player.auditAssets,[sx,sy,w,h]=player.scene.crop;
 const make=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const original=make(),rebuilt=make(),coverage=make(),difference=make();
 original.getContext('2d').drawImage(source,sx,sy,w,h,0,0,w,h);
 const rc=rebuilt.getContext('2d');rc.drawImage(cleanPlate,0,0);
 const mask=coverage.getContext('2d');mask.fillStyle=mask.strokeStyle='white';mask.lineWidth=2;mask.lineJoin='round';
 for(const {definition:o,cutout} of objects){
  rc.drawImage(cutout,o.crop[0],o.crop[1]);
  const polygons=[(o.eraseOutline||o.outline).map(([x,y])=>[x+o.crop[0],y+o.crop[1]]),...(o.sourceHoles||[])];
  mask.lineWidth=2*((o.eraseDilation||0)+1);
  for(const polygon of polygons){mask.beginPath();polygon.forEach(([x,y],i)=>i?mask.lineTo(x,y):mask.moveTo(x,y));mask.closePath();mask.fill();mask.stroke();}
 }
 const a=original.getContext('2d').getImageData(0,0,w,h),b=rc.getImageData(0,0,w,h),m=mask.getImageData(0,0,w,h),{metrics,heat}=compareSourcePixels(a.data,b.data,m.data);
 const diff=difference.getContext('2d'),data=diff.createImageData(w,h);data.data.set(heat);diff.putImageData(data,0,0);
 const perObject=objects.map(({definition:o,cutout})=>{
  const [x,y,cw,ch]=o.crop;let changed=0,max=0,total=0,alphaPixels=0,partialAlphaPixels=0;
  const alpha=cutout.getContext('2d').getImageData(0,0,cw,ch).data;
  for(let yy=0;yy<ch;yy++)for(let xx=0;xx<cw;xx++){
   const local=(yy*cw+xx)*4;if(alpha[local+3]>0)alphaPixels++;if(alpha[local+3]>0&&alpha[local+3]<255)partialAlphaPixels++;
   const gx=x+xx,gy=y+yy;if(gx<0||gx>=w||gy<0||gy>=h)continue;
   const i=(gy*w+gx)*4,delta=Math.max(...[0,1,2].map(c=>Math.abs(a.data[i+c]-b.data[i+c])));if(delta>metrics.threshold)changed++;max=Math.max(max,delta);total+=delta;
  }
  return {id:o.id,crop:o.crop,alphaPixels,partialAlphaPixels,changedPixels:changed,maxDelta:max,meanMaxDelta:total/(cw*ch)};
 }).sort((a,b)=>b.changedPixels-a.changedPixels);
 return {report:{id:player.scene.id,width:w,height:h,...metrics,objects:perObject,scope:'Source-placement CPU composite, not animated GPU frame. Coverage includes a one-pixel seam allowance. Counts identify review targets, not artistic acceptance.'},views:{original,rebuilt,cleanPlate,difference}};
}
export function appendReconstructionViews(host,audit,{compact=false}={}){
 for(const [key,label] of [['original','原画'],['rebuilt','静止重建'],['cleanPlate','完整露出底图'],['difference','差异 ×4']]){
  const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');figure.style.margin='0';
  const source=audit.views[key],canvas=document.createElement('canvas');canvas.width=compact?360:source.width;canvas.height=Math.round(canvas.width*source.height/source.width);canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height);image.src=canvas.toDataURL('image/png');image.alt=`${audit.report.id} · ${label}`;image.style.width='100%';caption.textContent=image.alt;figure.append(image,caption);host.append(figure);
 }
}
