// Local source-pixel geometry. Pinned deformation is deliberately separate from
// rigid actor pose: a sail changes shape without moving its mast attachment.
export function restGrid(width,height,columns=10,rows=14){
 const vertices=new Float32Array(columns*rows*2),uvs=new Float32Array(vertices.length),indices=[];
 for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
  const i=(y*columns+x)*2;vertices[i]=width*x/(columns-1);vertices[i+1]=height*y/(rows-1);uvs[i]=x/(columns-1);uvs[i+1]=y/(rows-1);
  if(x<columns-1&&y<rows-1){const a=y*columns+x;indices.push(a,a+1,a+columns,a+1,a+columns+1,a+columns);}
 }
 return {vertices,uvs,indices:new Uint32Array(indices),width,height};
}
export function deformGrid(grid,rig,amount,output=new Float32Array(grid.vertices.length),secondary=0){
 const {width,height,vertices}=grid;
 for(let i=0;i<vertices.length;i+=2){
  const x=vertices[i],y=vertices[i+1],u=x/width,v=y/height;
  if(rig.kind==='stem'){
   // Small-angle cantilever: integrate a root-to-tip angle field. The upper
   // stem's delayed response is its own channel, not translation of the head.
   // Cross sections rotate with the local tangent; root position/tangent stay fixed.
   const t=1-v,a=(rig.angle||0)*amount,b=(rig.tipAngle||0)*secondary;
   const theta=a*t+b*t*t*t,side=x-rig.center;
   const bend=height*(a*t*t/2+b*t*t*t*t/4);
   const along=height*(t-a*a*t*t*t/6-a*b*t**5/5-b*b*t**7/14);
   output[i]=rig.center+bend+side*Math.cos(theta);
   output[i+1]=height-along+side*Math.sin(theta);
   continue;
  }
  if(rig.kind==='radial-fronds'){
   // Each ray bends away from the crown's fixed heart. Opposing fronds have
   // different leverage; a secondary curl can recover after wind pressure.
   // The trunk attachment has zero displacement AND zero displacement slope.
   const [cx,cy]=rig.center,dx=x-cx,dy=y-cy,r=Math.hypot(dx,dy);
   const radius=rig.radius||Math.max(width,height)/2,q=Math.min(1.6,r/radius);
   const theta=Math.atan2(dy,dx),weight=q*q;
   const curl=(rig.curl||0)*secondary*Math.sin(theta*2)*weight;
   output[i]=x+rig.amplitude*amount*weight+curl*(-dy)/(radius||1);
   output[i+1]=y+(rig.lift||0)*amount*Math.sin(theta)*weight+curl*dx/(radius||1);
   continue;
  }
  if(rig.kind==='spine'){
   // Constant-curvature backbone with rigid cross sections. Its root has an
   // exact position and tangent, unlike translating or scaling a whole cutout.
   const right=rig.pin==='right',q=right?width-x:x,angle=(rig.angle||0)*amount;
   const center=height*(rig.center??.5),dy=y-center,k=angle/width,theta=k*q;
   const along=Math.abs(k)<1e-9?q:Math.sin(theta)/k;
   const bend=Math.abs(k)<1e-9?0:(1-Math.cos(theta))/k;
   output[i]=(right?width-along:along)+(right?1:-1)*dy*Math.sin(theta);
   output[i+1]=center+bend+dy*Math.cos(theta);
   continue;
  }
  if(rig.kind==='blade'){
   // A leaf cups around its stem; the attachment edge stays at rest.
   const free=1-v;
   output[i]=x+(u-.5)*rig.amplitude*amount*free;
   output[i+1]=y-(rig.lift||0)*amount*Math.sin(Math.PI*u)*free;
   continue;
  }
  // Cloth is pinned along its mast edge and at both top/bottom boundaries.
  // Hanging forms are pinned across the top and bend progressively to the tip.
  const free=rig.pin==='right'?1-u:u;
  const weight=rig.kind==='hanging'?v*v:rig.kind==='flag'?free:free*Math.sin(Math.PI*v);
  const fold=rig.kind==='hanging'?Math.sin(Math.PI*v)*v:Math.sin(2*Math.PI*free+v*Math.PI/2)*free;
  output[i]=x+rig.amplitude*amount*weight+(rig.flutter||0)*secondary*fold;
  output[i+1]=y+(rig.lift||0)*amount*weight+(rig.flutter||0)*secondary*fold*.35;
 }
 return output;
}
export function inspectGrid(grid,vertices){
 let minArea=Infinity,maxStretch=1;
 const source=grid.vertices;
 for(let i=0;i<grid.indices.length;i+=3){
  const [a,b,c]=Array.from(grid.indices.slice(i,i+3),n=>n*2);
  const cross=(p)=>(p[b]-p[a])*(p[c+1]-p[a+1])-(p[b+1]-p[a+1])*(p[c]-p[a]);
  minArea=Math.min(minArea,cross(vertices)/cross(source));
  for(const [j,k] of [[a,b],[b,c],[c,a]])maxStretch=Math.max(maxStretch,Math.hypot(vertices[j]-vertices[k],vertices[j+1]-vertices[k+1])/Math.hypot(source[j]-source[k],source[j+1]-source[k+1]));
 }
 return {valid:minArea>0&&Number.isFinite(maxStretch),minAreaRatio:minArea,maxStretch};
}
export function rigPadding(actor){
 const rig=actor.rig;if(!rig)return 0;
 if(rig.kind==='spine')return (actor.crop[2]+actor.crop[3])*Math.abs(rig.angle||0);
 if(rig.kind==='stem')return (actor.crop[2]+actor.crop[3])*(Math.abs(rig.angle||0)+Math.abs(rig.tipAngle||0));
 if(rig.kind==='radial-fronds')return (Math.abs(rig.amplitude||0)+Math.abs(rig.lift||0)+Math.abs(rig.curl||0)*1.6)*2.56;
 return Math.abs(rig.amplitude||0)+Math.abs(rig.lift||0)+Math.abs(rig.flutter||0)*1.35;
}
export function mountRig(texture,definition){
 const rig=definition.rig;
 if(!rig)return {display:new PIXI.Sprite(texture)};
 const grid=restGrid(definition.crop[2],definition.crop[3],rig.columns||10,rig.rows||14);
 const positions=new Float32Array(grid.vertices);
 const geometry=new PIXI.MeshGeometry({positions,uvs:grid.uvs,indices:grid.indices});
 return {display:new PIXI.Mesh({geometry,texture}),grid,geometry,positions};
}
export function sampleRig(mounted,definition,state){
 if(!mounted.grid)return;
 deformGrid(mounted.grid,definition.rig,state[definition.rig.channel]||0,mounted.positions,state[definition.rig.secondaryChannel]||0);
 mounted.geometry.getBuffer('aPosition').update();
}
