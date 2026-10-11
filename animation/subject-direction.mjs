// Subjects are semantic entities, not rendering layers. A hull, two sails and
// mast are ONE boat. Environmental shader channels do not qualify as actions.
const track=points=>points.map(([time,value],i)=>{
 const a=points[i-1],b=points[i+1],u=a?(value-a[1])/(time-a[0]):0,v=b?(b[1]-value)/(b[0]-time):0;
 return {time,value,velocity:u*v>0?2*u*v/(u+v):0};
});
const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});

export function directBayDuet(scene){
 scene.title='同一阵风，两艘帆船';
 scene.repairPlate='assets/scenes/San-Francisco/two-vessels-clean-plate-v2.png';
 const near=scene.objects.find(o=>o.id==='vessel-hull');
 // Final source silhouettes and their individual repair footprints are applied
 // by refineBaySource after this motion score has established parent relations.
 near.tracks={
  x:track([[0,880],[6,880],[12,830],[18,710],[25,546],[30,494],[32,494]]),
  y:track([[0,523],[6,523],[12,524],[18,528],[25,530],[30,531],[32,531]]),
  rotation:track([[0,0],[3,0],[5,-.045],[7,-.025],[11,-.045],[15,-.065],[19,-.025],[24,-.035],[29,0],[32,0]])
 };
 for(const o of scene.objects){
  o.motionBounds=[490,520,882,534];
  if(o===near)continue;
  o.follows={actor:near.id,offset:[0,0]};o.tracks={};o.repair=false;
 }
 // Distant vessel is extracted independently from the original painting. It
 // keeps its own source scale and water lane; no cloned near boat or 3-D zoom.
 const anchor=[137,489];
 const part=(id,crop,outline,rig)=>({id,crop,outline,anchor,pivot:[anchor[0]-crop[0],anchor[1]-crop[1]],
  repairSample:[200,crop[1],crop[2],crop[3]],tracks:{},
  follows:{actor:'far-hull',offset:[0,0]},rig,
  materialClass:rig?'pinned-cloth':'rigid-shell',motionBounds:[135,487,638,503]});
 const far=part('far-hull',[112,480,50,14],[[1,3],[16,4],[25,2],[30,4],[49,4],[47,8],[40,12],[9,12],[4,9]]);
 delete far.follows;
 far.tracks={
  x:track([[0,137],[3,137],[8,185],[15,326],[22,495],[29,635],[32,635]]),
  y:track([[0,489],[3,489],[8,490],[15,493],[22,497],[29,501],[32,501]]),
  rotation:track([[0,0],[1,0],[3,-.045],[5,-.025],[8,-.065],[12,-.035],[16,-.05],[22,-.025],[28,0],[32,0]])
 };
 scene.objects.unshift(far,
  part('far-main-sail',[138,435,21,47],[[0,0],[20,46],[0,46]],{kind:'cloth',pin:'left',amplitude:3,lift:-.35,channel:'farMainPressure'}),
  part('far-jib',[116,445,20,37],[[19,0],[18,36],[0,36]],{kind:'cloth',pin:'right',amplitude:-2,lift:-.2,channel:'farJibPressure'}),
  part('far-mast',[135,424,5,62],[[2,0],[4,0],[3,61],[0,61]])
 );
 for(const o of scene.objects.filter(o=>o.id.startsWith('far-')&&o!==far))o.repair=false;
 Object.assign(scene.expression.channels,{
  sailPressure:channel([[2,0],[5,.8],[7,.2],[11,.8],[15,1],[19,.35],[24,.7],[29,0],[32,0]]),
  jibPressure:channel([[2.5,0],[5.5,.65],[7.5,.1],[11.5,.65],[15.5,.8],[19.5,.2],[24.5,.5],[29.5,0],[32,0]]),
  farMainPressure:channel([[1,0],[3,.8],[5,.3],[8,1],[12,.4],[16,.8],[22,.25],[28,0],[32,0]]),
  farJibPressure:channel([[1.4,0],[3.4,.65],[5.4,.15],[8.4,.8],[12.4,.3],[16.4,.65],[22.4,.15],[28.4,0],[32,0]])
 });
 scene.subjects=[
  {id:'distant-sailboat',label:'远船',root:'far-hull',parts:['far-hull','far-mast','far-main-sail','far-jib'],actions:['catch-gust','heel-and-recover','cross-bay','ease-sails']},
  {id:'near-sailboat',label:'近船',root:'vessel-hull',parts:['vessel-hull','mast','main-sail','jib'],actions:['catch-gust','heel-and-recover','cross-bay','ease-sails']}
 ];
 scene.subjectBeats=[
  {from:0,to:3,label:'远船先吃到风，帆先鼓起，船身开始侧倾。',subjects:['distant-sailboat']},
  {from:3,to:8,label:'近船随后受风，两船分别调整帆形、回正并起航。',subjects:['distant-sailboat','near-sailboat']},
  {from:8,to:24,label:'两船在不同水道相向航行，第二阵风使两组帆先后受力。',subjects:['distant-sailboat','near-sailboat']},
  {from:24,to:29,label:'两船错身，各自卸去帆上的风压并放缓。',subjects:['distant-sailboat','near-sailboat']},
  {from:29,to:32,label:'船身回正，停在各自新的位置。',subjects:['distant-sailboat','near-sailboat']}
 ];
 scene.contacts=[{object:'far-hull',time:9,offset:[-19,0],strength:.5},{object:'vessel-hull',time:14,offset:[31,0],strength:.8},{object:'far-hull',time:23,offset:[-19,0],strength:.5}];
 scene.probes.fixed=[[.55,.61],[.34,.4]];
 scene.remaining=['Two original vessels have independent sail/heel/travel/recovery choreography. Full-speed silhouette, clean-plate and material review remains pending; multiple layers are not multiple subjects.'];
}

export function subjectInventory(scene){
 const ids=new Set((scene.objects||[]).map(o=>o.id)),owners=new Map(),errors=[];
 for(const subject of scene.subjects||[]){
  if(!subject.parts.includes(subject.root))errors.push(`${subject.id}: root absent from parts`);
  for(const id of subject.parts){
   if(!ids.has(id))errors.push(`${subject.id}: missing part ${id}`);
   if(owners.has(id))errors.push(`${id}: counted in two subjects`);
   owners.set(id,subject.id);
  }
 }
 return {subjects:scene.subjects?.length||0,renderParts:ids.size,actionNames:[...new Set((scene.subjects||[]).flatMap(s=>s.actions))],errors,
  visualAcceptance:'pending',scope:'Authored subject/action inventory, not a visual verdict.'};
}

export function directLakeTrio(scene){
 scene.title='岸边梳羽，湖上觅食';
 scene.repairPlate='assets/scenes/Los-Gatos/three-ducks-clean-plate-v2.png';
 const swimmer=scene.objects.find(o=>o.id==='lake-duck');
 swimmer.outline=[[0,11],[9,13],[20,10],[35,10],[41,9],[47,12],[47,16],[44,22],[30,25],[12,22],[5,18]];
 swimmer.eraseOutline=[[-1,10],[8,11],[20,9],[33,8],[34,3],[39,-1],[47,-1],[51,4],[56,7],[55,11],[49,12],[49,19],[44,25],[30,27],[12,24],[4,19]];
 swimmer.tracks={
  x:track([[0,284],[5,284],[10,329],[15,391],[19,420],[23,420],[28,435]]),
  y:track([[0,542],[5,542],[10,547],[15,554],[19,558],[23,558],[28,560]]),
  rotation:track([[0,0],[3,0],[4,.025],[6,0],[12,-.025],[16,0],[20,.035],[22,0],[28,0]])
 };
 swimmer.motionBounds=[282,539,438,563];
 const reflection=scene.objects.find(o=>o.id==='lake-duck-reflection');
 reflection.motionBounds=swimmer.motionBounds;reflection.matte='warm-reflection';
 const add=(id,crop,anchor,outline,tracks,extra={})=>scene.objects.push({id,crop,anchor,pivot:[anchor[0]-crop[0],anchor[1]-crop[1]],outline,tracks,
  materialClass:'rigid-shell',motionBounds:[0,0,1024,799],...extra});
 add('lake-duck-head',[289,518,22,21],[297,533],[[1,11],[2,5],[6,1],[12,1],[16,5],[21,8],[20,11],[14,10],[13,17],[8,20],[3,18]],
  {rotation:track([[0,0],[2,0],[3,.7],[4,.7],[5,0],[16,0],[18,.65],[19,.8],[21,.65],[23,0],[28,0]])},
  {follows:{kind:'joint',actor:'lake-duck',offset:[13,-9]},repair:false,motionBounds:[294,530,450,555]});
 // Feet stay planted in the original rock. The body pivots above them and the
 // head folds down toward its breast; there is no detached floating head.
 add('shore-duck-body',[472,590,66,29],[516,617],
  [[0,14],[16,11],[22,7],[37,0],[49,2],[58,5],[63,6],[64,13],[59,23],[49,27],[25,27],[12,22],[8,20],[0,18]],
  {rotation:track([[0,0],[2,0],[5,-.03],[9,-.03],[12,0],[16,0],[20,-.02],[24,0],[28,0]])},
  {eraseOutline:[[-1,12],[17,8],[31,-1],[49,-2],[51,-10],[57,-14],[63,-12],[67,-7],[74,-4],[75,0],[64,4],[66,12],[62,22],[52,28],[25,29],[10,23],[-1,19]],motionBounds:[515,616,517,618]});
 add('shore-duck-head',[521,577,27,26],[529,595],
  [[3,4],[8,0],[14,1],[17,5],[17,9],[26,12],[24,16],[15,12],[14,23],[8,26],[3,21],[1,14],[1,8]],
  {rotation:track([[0,0],[2,0],[4,.9],[5,1.05],[6,.8],[7,1.05],[8,.8],[9,1],[12,0],[17,0],[19,.55],[21,.7],[24,0],[28,0]])},
  {follows:{kind:'joint',actor:'shore-duck-body',offset:[13,-22]},repair:false,motionBounds:[527,591,531,598]});
 add('feeding-duck',[734,560,39,39],[750,587],
  [[6,0],[9,1],[11,12],[15,22],[23,26],[24,30],[38,34],[35,38],[21,35],[12,32],[4,25],[3,20],[3,13]],
  {x:track([[0,750],[8,750],[14,745],[20,735],[28,728]]),y:track([[0,587],[8,587],[14,589],[20,590],[28,590]]),
   rotation:track([[0,0],[5,0],[7,-.18],[9,.1],[11,-.16],[13,.08],[15,-.12],[17,0],[20,-.15],[23,.06],[26,0],[28,0]])},
  {eraseOutline:[[4,-2],[11,-2],[14,12],[18,22],[27,26],[40,33],[40,40],[23,39],[8,34],[1,24],[1,13]],motionBounds:[725,585,753,592]});
 add('feeding-duck-reflection',[735,596,36,27],[750,587],
  [[1,0],[34,0],[35,7],[25,10],[20,24],[13,26],[11,16],[6,10]],{},
  {matte:'warm-reflection',materialClass:'receiver-texture',follows:{actor:'feeding-duck',offset:[0,0],rotationFactor:-.35},motionBounds:[725,585,753,592]});
 scene.subjects=[
  {id:'shore-mallard',label:'岸边鸭子',root:'shore-duck-body',parts:['shore-duck-body','shore-duck-head'],actions:['brace','preen-breast','raise-head']},
  {id:'swimming-mallard',label:'游鸭',root:'lake-duck',parts:['lake-duck','lake-duck-head','lake-duck-reflection'],actions:['dip-bill','glide','pause-and-forage','resume']},
  {id:'feeding-mallard',label:'潜食鸭',root:'feeding-duck',parts:['feeding-duck','feeding-duck-reflection'],actions:['upend-balance','probe-underwater','recover-balance']}
 ];
 scene.subjectBeats=[
  {from:0,to:5,label:'岸边鸭子低头梳理胸羽，游鸭俯下嘴尖。',subjects:['shore-mallard','swimming-mallard']},
  {from:5,to:12,label:'游鸭向岸边靠近；右侧鸭子在水下觅食，尾部调整平衡。',subjects:['swimming-mallard','feeding-mallard']},
  {from:12,to:17,label:'岸边鸭子抬头停顿，游鸭继续接近。',subjects:['shore-mallard','swimming-mallard']},
  {from:17,to:24,label:'游鸭停下来俯嘴觅食，岸边鸭子再次整理羽毛。',subjects:['shore-mallard','swimming-mallard']},
  {from:24,to:28,label:'岸边鸭子抬头，游鸭重新前行，潜食鸭恢复平衡。',subjects:['shore-mallard','swimming-mallard','feeding-mallard']}
 ];
 scene.contacts=[{object:'lake-duck',time:8,offset:[-13,0],strength:.5},{object:'feeding-duck',time:11,offset:[5,4],strength:.5},{object:'lake-duck',time:19,offset:[16,0],strength:.5}];
 scene.remaining=['Three original ducks have distinct joint/feeding/travel actions; source mattes and full-speed joint continuity require visual review.'];
}

export function directParkPair(scene){
 scene.title='池沿与水面之间';
 scene.repairPlate='assets/scenes/Bellevue/two-ducks-clean-plate-v3.png';
 const swimmer=scene.objects.find(o=>o.id==='pool-duck');
 swimmer.eraseOutline=[[-1,6],[3,5],[7,-1],[12,-1],[17,3],[17,7],[23,6],[32,8],[37,6],[38,1],[42,-1],[47,-1],[51,2],[48,5],[47,10],[44,16],[31,20],[11,20],[5,15],[4,10]];
 swimmer.tracks={
  x:track([[0,505],[4,505],[9,483],[13,479],[17,479],[23,447],[28,438]]),
  y:track([[0,565],[4,565],[9,571],[13,573],[17,573],[23,583],[28,584]]),
  rotation:track([[0,0],[3,0],[5,-.025],[9,0],[12,-.02],[17,0],[22,.02],[26,0],[28,0]])
 };
 const head=scene.objects.find(o=>o.id==='duck-head');
 head.repair=false;
 head.tracks.rotation=track([[0,0],[2,0],[3,-.55],[4,0],[11,0],[13,-.65],[15,-.45],[17,0],[28,0]]);
 head.motionBounds=[421,548,495,587];
 const make=(id,crop,anchor,outline,tracks,extra={})=>({id,crop,anchor,pivot:[anchor[0]-crop[0],anchor[1]-crop[1]],outline,tracks,
  materialClass:'rigid-shell',...extra});
 scene.objects.push(
  make('ledge-duck-body',[504,504,29,16],[516,518],
   [[3,0],[10,1],[17,4],[22,8],[28,12],[28,15],[15,15],[7,12],[2,8],[0,4]],
   {rotation:track([[0,0],[2,0],[5,.035],[8,.035],[10,0],[17,0],[20,.025],[24,0],[28,0]])},
   {motionBounds:[515,517,517,519],eraseOutline:[[-5,-1],[-6,-4],[-1,-5],[0,-8],[7,-8],[11,-4],[11,0],[19,3],[23,7],[30,12],[29,16],[14,16],[5,12],[1,7],[0,2]]}),
  make('ledge-duck-head',[498,496,17,17],[508,508],
   [[0,7],[5,5],[7,1],[12,0],[16,3],[16,8],[13,11],[12,16],[7,17],[6,10],[1,10]],
   {rotation:track([[0,0],[2,0],[4,-.8],[5,-1],[6,-.75],[7,-1],[8,-.8],[10,0],[17,0],[19,-.5],[21,-.7],[24,0],[28,0]])},
   {follows:{kind:'joint',actor:'ledge-duck-body',offset:[-8,-10]},repair:false,motionBounds:[506,506,510,510]})
 );
 scene.subjects=[
  {id:'ledge-duck',label:'池沿鸭子',root:'ledge-duck-body',parts:['ledge-duck-body','ledge-duck-head'],actions:['brace-on-ledge','preen','look-up']},
  {id:'pool-swimmer',label:'池中游鸭',root:'pool-duck',parts:['pool-duck','duck-head','duck-reflection'],actions:['dip-bill','paddle-away','pause-and-feed','glide']}
 ];
 scene.subjectBeats=[
  {from:0,to:4,label:'池沿鸭子站稳后低头梳羽，游鸭俯嘴。',subjects:['ledge-duck','pool-swimmer']},
  {from:4,to:10,label:'游鸭离开池沿，岸边鸭子梳羽后抬头。',subjects:['ledge-duck','pool-swimmer']},
  {from:10,to:17,label:'游鸭放慢并低头觅食，池沿鸭子停下动作。',subjects:['pool-swimmer','ledge-duck']},
  {from:17,to:24,label:'游鸭继续游开，岸边鸭子再整理一次羽毛。',subjects:['pool-swimmer','ledge-duck']},
  {from:24,to:28,label:'游鸭滑行收稳，池沿鸭子抬头。',subjects:['pool-swimmer','ledge-duck']}
 ];
 scene.contacts=[{object:'pool-duck',time:7,offset:[12,2],strength:.65},{object:'pool-duck',time:14,offset:[-12,2],strength:.4},{object:'pool-duck',time:21,offset:[12,2],strength:.7}];
 scene.remaining=['Both original ducks now have independent body/neck actions. Verify planted feet, small neck mattes and shared water contact in full playback.'];
}
