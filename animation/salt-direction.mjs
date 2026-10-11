import {evaluateTrack} from './scene-contract.mjs';
const keys=points=>points.map(([time,value])=>({time,value,velocity:0}));
// A bounded material assembly is authored in source-pixel space. Each group
// conserves its original pieces: nothing is spawned, enlarged or dissolved.
export function directSaltAssembly(scene){
 scene.duration=36;scene.expression.duration=36;scene.title='盐片相遇，在水边停稳';
 scene.mode='assembly';scene.regions=[];scene.shadows=[];
 scene.expression.channels.wind={initial:0,keys:[{time:36,value:0}]};
 scene.repairPlate='assets/scenes/San-Jose/rafts-clean-plate-v2.png';
 const specs=[
  ['west-wide',[258,386,62,20],[337,434],0],['west-small',[367,378,33,15],[382.5,434],0],['west-tip',[443,394,45,20],[419.5,434],0],
  ['middle-wide',[492,393,40,22],[524,449],1],['middle-small',[535,382,34,20],[559,449],1],['middle-tip',[567,403,35,16],[591.5,449],1],
  ['east-wide',[613,390,48,22],[693,462],2],['east-small',[668,411,49,14],[739.5,462],2],['east-tip',[824,409,49,19],[786.5,462],2]
 ];
 scene.objects=specs.map(([id,crop,target,group],i)=>{
  const [x,y,w,h]=crop,anchor=[x+w/2,y+h/2],start=2+group*2.5+(i%3)*.65,contact=17+group*3+(i%3)*.8;
  const dockingEdges=[[-30,29],[-15.5,14.5],[-21.5,20.5],[-19,18],[-16,15],[-16.5,15.5],[-23,22],[-23.5,22.5],[-23.5,21.5]][i];
  const dx=target[0]-anchor[0],dy=target[1]-anchor[1],turn=(i%3-1)*.11;
  return {id,crop,anchor,pivot:[w/2,h/2],outline:[[1,1],[w-1,1],[w-1,h-1],[1,h-1]],matte:'salt',matteClose:1,tracks:{
   x:keys([[0,anchor[0]],[start,anchor[0]],[start+5,anchor[0]+dx*.3],[contact,target[0]],[contact+1.2,target[0]+(i%3===0?-.45:.45)],[contact+3,target[0]],[36,target[0]]]),
   y:keys([[0,anchor[1]],[start,anchor[1]],[start+5,anchor[1]+dy*.35],[contact,target[1]],[contact+1.2,target[1]+.8],[contact+3,target[1]],[36,target[1]]]),
   rotation:keys([[0,0],[start,0],[start+5,turn],[contact,0],[contact+1.2,turn*.07],[contact+3,0],[36,0]])
  },materialClass:'rigid-shell',motionBounds:[Math.min(anchor[0],target[0])-2,Math.min(anchor[1],target[1])-2,Math.max(anchor[0],target[0])+2,Math.max(anchor[1],target[1])+2],
  assembly:{group,target,contact,dockingEdges,domain:[[100,377],[925,377],[925,495],[100,495]]}};
 });
 // Keep the long western salt tip's reflected streaks in the water plane;
 // they are not fingers hanging from the moving crystal.
 const westTip=scene.objects.find(o=>o.id==='west-tip');
 westTip.outline=[[1,4],[6,4],[10,1],[15,4],[28,3],[31,1],[34,5],[44,7],[44,11],[35,10],[31,11],[19,11],[13,11],[2,11]];
 scene.subjects=[0,1,2].map((group)=>{
  const parts=scene.objects.filter(o=>o.assembly.group===group).map(o=>o.id);
  return {id:['west-salt-raft','middle-salt-raft','east-salt-raft'][group],label:['左侧结晶群','中央结晶群','右侧结晶群'][group],root:parts[0],parts,actions:['separate-source-pieces','drift-with-turn','approach-neighbours','edge-contact','settle-in-new-arrangement']};
 });
 scene.subjectBeats=[
  {from:0,to:10,label:'三组原有盐片依次离开旧位置，在同一层卤水中缓慢转向。',subjects:scene.subjects.map(s=>s.id)},
  {from:10,to:20,label:'左侧碎片先靠拢，中央和右侧仍在移动，各自沿池边成列。',subjects:scene.subjects.map(s=>s.id)},
  {from:20,to:29,label:'三组盐片分别接触、轻微回让，停成新的结晶带。',subjects:scene.subjects.map(s=>s.id)},
  {from:29,to:36,label:'结晶带保持新位置；远岸、山脉和纸面始终固定。',subjects:scene.subjects.map(s=>s.id)}
 ];
 scene.contacts=[];
 scene.remaining=['Nine source salt cutouts, exposed-water repair, pairwise material contact and full-scale assembly readability require visual acceptance. This is material redistribution, not literal time-lapse crystal growth.'];
}
export function assemblyPose(object,time){
 const read=name=>evaluateTrack(object.tracks[name],time);
 return {x:read('x'),y:read('y'),rotation:read('rotation')};
}
export function insideAssemblyDomain(point,polygon){
 let sign=0;
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],cross=(b[0]-a[0])*(point[1]-a[1])-(b[1]-a[1])*(point[0]-a[0]);
  if(Math.abs(cross)<1e-7)continue;
  if(sign&&Math.sign(cross)!==sign)return false;sign=Math.sign(cross);
 }
 return true;
}
