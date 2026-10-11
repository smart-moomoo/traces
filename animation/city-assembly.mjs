const keys=points=>points.map(([time,value])=>({time,value,velocity:0}));
function panel(id,world,group,row,column){
 const x=Math.floor(Math.min(...world.map(p=>p[0]))),w=Math.ceil(Math.max(...world.map(p=>p[0])))-x;
 const minY=Math.floor(Math.min(...world.map(p=>p[1]))),maxY=Math.ceil(Math.max(...world.map(p=>p[1])));
 const crop=[x,minY,w,maxY-minY],anchor=[column===0?x:x+w,(minY+maxY)/2];
 const start=2+group*3.5+row*.7+column*.35,spread=start+4,hold=start+7,dock=start+12,rest=start+15;
 const pitch=.92+row*.05;
 return {id,crop,anchor,pivot:[anchor[0]-x,anchor[1]-minY],outline:world.map(([a,b])=>[a-x,b-minY]),
  materialClass:'projected-shell',projection:{axis:'y',shadowFromPitch:true},underlayMaterial:'matched-mineral-backing',liftShadow:true,
  motionBounds:[anchor[0]-.01,anchor[1]-.01,anchor[0]+.01,anchor[1]+.01],
  tracks:{pitch:keys([[0,0],[start,0],[start+1,.1],[spread,pitch],[hold,pitch],[dock,.04],[rest,0],[34,0]])
  },assembly:{group,start,spread,hold,dock,rest,sourcePolygon:world}};
}
export function directCityAssembly(scene){
 scene.duration=34;scene.expression.duration=34;scene.title='楼面的材料折页，逐排展开再合回';
 scene.regions=[];scene.shadows=[];scene.contacts=[];scene.mode='assembly';scene.repairPlate='assets/scenes/Dallas/facade-backing-v2.png';
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
 scene.subjects=specs.map((spec,group)=>{const parts=scene.objects.filter(o=>o.assembly.group===group).map(o=>o.id);return {id:spec.id,label:spec.label,root:parts[0],parts,subjectClass:'material-assembly',actions:['hinge-open-from-seam','hold-folded-face','close-in-sequence','dock-to-source-seam','rest']};});
 scene.castNote='Material relief: three source facade groups contain eighteen original shell panels that hinge from fixed seams, expose matched mineral backing, and close. Planar rigid foreshortening, not building bending or newly invented actors.';
 scene.subjectBeats=[
  {from:0,to:6,label:'暖白楼面上的贝壳片沿竖向接缝翻起，蓝灰与青绿两组随后响应。',subjects:specs.map(s=>s.id)},
  {from:6,to:14,label:'三组折页错时展开，保留原有材质，露出同色的矿物底层。',subjects:specs.map(s=>s.id)},
  {from:14,to:24,label:'暖白折页先合回，其余两组逐排对准原来的楼面接缝。',subjects:specs.map(s=>s.id)},
  {from:24,to:34,label:'最后一组折页合拢，接缝影子收回，楼面恢复为原画。',subjects:specs.map(s=>s.id)}
 ];
 scene.probes={fixed:[[.372,.15],[.705,.22],[.54,.64]],moving:[[.2,.57],[.8,.54]]};
 scene.visualReview='pending';scene.gates.artwork='pending';
 scene.remaining=['Previous floating-panel version failed. Replacement uses fixed hinges and matched facade backing; inspect source seams, foreshortened silhouettes, contact shadows and full-speed composition before acceptance.'];
}
