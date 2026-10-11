const keys=points=>points.map(([time,value])=>({time,value,velocity:0}));
function panel(id,world,group,row,column){
 const x=Math.floor(Math.min(...world.map(p=>p[0]))),w=Math.ceil(Math.max(...world.map(p=>p[0])))-x;
 const minY=Math.floor(Math.min(...world.map(p=>p[1]))),maxY=Math.ceil(Math.max(...world.map(p=>p[1])));
 const crop=[x,minY,w,maxY-minY],anchor=[x+w/2,(minY+maxY)/2],side=column===0?-1:1;
 const start=2+group*3.5+row*.7+column*.35,spread=start+4,hold=start+7,dock=start+12,rest=start+15;
 const dx=side*(13+row*2),dy=(row-1)*12-4;
 return {id,crop,anchor,pivot:[anchor[0]-x,anchor[1]-minY],outline:world.map(([a,b])=>[a-x,b-minY]),
  materialClass:'rigid-shell',underlayMaterial:'source-paper',repairSample:[12,12,w,maxY-minY],liftShadow:true,
  motionBounds:[anchor[0]+Math.min(0,dx)-1,anchor[1]+Math.min(0,dy)-1,anchor[0]+Math.max(0,dx)+1,anchor[1]+Math.max(1,dy)+1],
  tracks:{
   x:keys([[0,anchor[0]],[start,anchor[0]],[start+1,anchor[0]+side*2],[spread,anchor[0]+dx],[hold,anchor[0]+dx],[dock,anchor[0]+side*.5],[rest,anchor[0]],[34,anchor[0]]]),
   y:keys([[0,anchor[1]],[start,anchor[1]],[start+1,anchor[1]-1],[spread,anchor[1]+dy],[hold,anchor[1]+dy],[dock,anchor[1]+.6],[rest,anchor[1]],[34,anchor[1]]]),
   rotation:keys([[0,0],[start,0],[start+1,side*.01],[spread,side*.065],[hold,side*.065],[dock,side*.005],[rest,0],[34,0]]),
   lift:keys([[0,0],[start,0],[start+1,.25],[spread,1],[hold,1],[dock,.1],[rest,0],[34,0]])
  },assembly:{group,start,spread,hold,dock,rest,sourcePolygon:world}};
}
export function directCityAssembly(scene){
 scene.duration=34;scene.expression.duration=34;scene.title='纸上楼体，展开再归位';
 scene.regions=[];scene.shadows=[];scene.contacts=[];scene.mode='assembly';delete scene.repairPlate;
 // Vertices follow the visible seams of the original shell pieces, not a
 // regular rectangular crop over unrelated fragments. All units are source pixels.
 const specs=[
  {id:'ivory-facade',label:'暖白楼体材料组',columns:[192,212,233],edges:[[434,440,446],[450,456,462],[461,468,474],[476,483,490]]},
  {id:'blue-facade',label:'蓝灰楼体材料组',columns:[388,417,435],edges:[[379,369,365],[394,382,376],[406,394,387],[422,407,400]]},
  {id:'green-facade',label:'青绿楼体材料组',columns:[789,806,828],edges:[[419,421,426],[436,440,445],[453,458,463],[468,471,475]]}
 ];
 scene.objects=specs.flatMap((spec,group)=>[0,1,2].flatMap(row=>[0,1].map(column=>{
  const x=spec.columns[column],r=spec.columns[column+1],top=spec.edges[row],bottom=spec.edges[row+1];
  const world=[[x,top[column]],[r-1,top[column+1]],[r,top[column+1]+1],[r,bottom[column+1]-1],[r-1,bottom[column+1]],[x+1,bottom[column]],[x,bottom[column]-1]];
  return panel(`${spec.id}-${row}-${column}`,world,group,row,column);
 })));
 scene.subjects=specs.map((spec,group)=>{const parts=scene.objects.filter(o=>o.assembly.group===group).map(o=>o.id);return {id:spec.id,label:spec.label,root:parts[0],parts,subjectClass:'material-assembly',actions:['release-from-paper','spread-as-rigid-pieces','suspend-in-order','dock-to-original-seams','rest']};});
 scene.castNote='Material-art reconstruction of three existing facade groups, not literal buildings bending or new physical actors. Eighteen source panels reveal the original paper substrate and return to their exact positions.';
 scene.subjectBeats=[
  {from:0,to:6,label:'暖白楼体上的原有材料片先离开纸面，蓝灰与青绿两组随后响应。',subjects:specs.map(s=>s.id)},
  {from:6,to:14,label:'三组材料错时向两侧展开，保持尺寸与纹理，露出下面的原纸底。',subjects:specs.map(s=>s.id)},
  {from:14,to:24,label:'暖白一组先归位，其余材料片依次对准原来的楼体接缝。',subjects:specs.map(s=>s.id)},
  {from:24,to:34,label:'最后一组落回纸面，影子收回，楼体恢复为原画。',subjects:specs.map(s=>s.id)}
 ];
 scene.probes={fixed:[[.372,.15],[.705,.22],[.54,.64]],moving:[[.2,.57],[.8,.54]]};
 scene.visualReview='failed';scene.gates.artwork='failed';
 scene.remaining=['Observed at 11 seconds: exposed paper cells read as facade holes, and floating pieces do not yet read as coherent material reconstruction. Revise staging/backing before release. Material-reconstruction interpretation, not a literal architectural event. Source panel boundaries, paper-stock underlay, shadows, simultaneous focus and full-size choreography require visual acceptance.'];
}
