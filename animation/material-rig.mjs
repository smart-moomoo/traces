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
export function deformGrid(grid,rig,amount,output=new Float32Array(grid.vertices.length)){
 const {width,height,vertices}=grid;
 for(let i=0;i<vertices.length;i+=2){
  const x=vertices[i],y=vertices[i+1],u=x/width,v=y/height;
  // Cloth is pinned along its mast edge and at both top/bottom boundaries.
  // Hanging forms are pinned across the top and bend progressively to the tip.
  const weight=rig.kind==='hanging'?v*v:(rig.pin==='right'?1-u:u)*Math.sin(Math.PI*v);
  output[i]=x+rig.amplitude*amount*weight;
  output[i+1]=y+(rig.lift||0)*amount*weight;
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
 deformGrid(mounted.grid,definition.rig,state[definition.rig.channel]||0,mounted.positions);
 mounted.geometry.getBuffer('aPosition').update();
}
