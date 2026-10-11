const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
// Three original crowns, with preserved trunk pixels and a pinned crown heart.
// The two existing flags share the episode but retain their own surface score.
export function directBeachCanopy(scene){
 scene.title='风经过树冠，再展开两面旗';
 scene.repairPlate='assets/scenes/Santa-Monica/crowns-flags-clean-plate-v2.png';
 scene.regions=scene.regions.filter(r=>r.id!=='palm-crowns');
 const specs=[
  {id:'cafe-west-palm',crop:[337,116,109,138],anchor:[393,177],radius:66,
   outline:[[48,0],[64,6],[65,18],[80,9],[88,23],[81,33],[98,37],[109,59],[97,67],[104,87],[99,111],[88,117],[82,135],[66,138],[56,125],[42,136],[34,125],[27,108],[12,117],[4,99],[8,87],[0,80],[4,66],[0,51],[8,43],[4,32],[20,29],[16,16],[35,22],[35,7]],
   trunk:[[393,196],[402,194],[412,254],[400,254]]},
  {id:'cafe-middle-palm',crop:[431,126,97,108],anchor:[480,173],radius:52,
   outline:[[42,0],[55,5],[61,0],[70,9],[66,20],[83,17],[88,25],[97,38],[91,53],[79,54],[88,65],[88,80],[78,87],[67,79],[62,100],[53,108],[40,108],[36,88],[27,99],[20,85],[11,91],[5,76],[9,61],[0,57],[3,43],[9,31],[19,32],[14,23],[23,17],[33,21],[27,10],[36,11]],
   trunk:[[477,185],[487,185],[480,234],[470,234]]},
  {id:'cafe-east-palm',crop:[696,51,134,137],anchor:[761,115],radius:69,
   outline:[[68,0],[77,8],[88,5],[95,16],[89,28],[112,31],[119,43],[111,48],[129,58],[134,81],[124,83],[126,109],[115,122],[105,108],[102,133],[86,133],[79,112],[78,137],[61,136],[54,117],[42,124],[34,108],[24,118],[16,103],[13,89],[0,92],[0,72],[9,59],[5,45],[23,40],[19,30],[31,29],[25,20],[39,18],[51,31],[48,9],[56,13]],
   trunk:[[754,143],[765,142],[767,189],[754,189]]}
 ];
 const palms=specs.map((s,i)=>{
  const pivot=[s.anchor[0]-s.crop[0],s.anchor[1]-s.crop[1]],delay=[0,1.1,2.3][i];
  scene.expression.channels[s.id+'Pressure']=channel([[1+delay,0],[4+delay,1],[7+delay,.3],[10+delay,-.22],[14+delay,.68],[18+delay,.12],[22+delay,-.08],[27+delay,0],[30,0]]);
  scene.expression.channels[s.id+'Curl']=channel([[2+delay,0],[5+delay,.9],[8+delay,-.6],[11+delay,.25],[15+delay,.6],[19+delay,-.25],[24+delay,.1],[27.5+delay,0],[30,0]]);
  return {id:s.id,crop:s.crop,anchor:s.anchor,pivot,outline:s.outline,sourceExclusions:[s.trunk],matte:'vegetation',matteDark:85,matteClose:1,
   materialClass:'pinned-cloth',motionBounds:[s.anchor[0]-.01,s.anchor[1]-.01,s.anchor[0]+.01,s.anchor[1]+.01],tracks:{},
   rig:{kind:'radial-fronds',center:pivot,radius:s.radius,amplitude:3.8-i*.25,lift:1.1,curl:1.3,channel:s.id+'Pressure',secondaryChannel:s.id+'Curl',columns:25,rows:29}};
 });
 scene.objects.push(...palms);
 scene.subjects.push(...palms.map((p,i)=>({id:p.id,label:['西侧棕榈','邻侧棕榈','东侧棕榈'][i],root:p.id,parts:[p.id],actions:['open-fronds-from-fixed-heart','lagging-tip-curl','counter-recover','settle']})));
 const ids=scene.subjects.map(s=>s.id);
 scene.subjectBeats=[
  {from:0,to:7,label:'西侧树冠先舒展，邻侧与东侧随后响应；两面旗开始迎风。',subjects:ids},
  {from:7,to:14,label:'风缓下来，叶尖迟一些卷回，旗面短暂垂落。',subjects:ids},
  {from:14,to:23,label:'第二阵风再次打开叶簇，旗的折纹随后走过自由边。',subjects:ids},
  {from:23,to:30,label:'树冠从叶心向叶尖收稳，两面旗依次回垂。',subjects:ids}
 ];
 scene.inspectionTimes=[0,4,6.3,9,16.3,23,30];
 scene.remaining=['Three source crowns plus two flags. Verify fine frond alpha, unchanged trunks, bounded material strain, source registration and full-speed/mobile action readability before artistic acceptance.'];
}
