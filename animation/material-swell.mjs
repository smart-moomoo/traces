// Authored material-wave clips. Rigid source highlights are displaced as pieces,
// with propagation and bank contact derived from one spatial event. No state is
// accumulated and no particles or bitmap frames are generated during playback.
const keys=points=>points.map(([time,value])=>({time,value,velocity:0}));
export function bankHeight(bank,x){
 if(x<=bank[0][0])return bank[0][1];
 for(let i=1;i<bank.length;i++){const a=bank[i-1],b=bank[i];if(x<=b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}
 return bank.at(-1)[1];
}
export function swellClip(crop,event,index){
 if(!(event.speed>0)||![-1,1].includes(event.side))throw new Error('Material swell requires positive propagation speed and a declared split side');
 const [x,y,w,h]=crop,anchor=[x+w/2,y+h/2];
 // Far rows respond first; the crest propagates toward the fixed structure.
 const onset=event.start+(event.farY-anchor[1])/event.speed;
 const turn=(index%2?1:-1)*.025;
 const splitX=anchor[0]+event.side*(10+(index%3)*3);
 // The rotating rectangle's highest corner must clear the bank throughout.
 const margin=h/2+Math.abs(w*Math.sin(turn))/2+2;
 const limit=Math.max(bankHeight(event.bank,splitX-w/2),bankHeight(event.bank,splitX+w/2))+margin;
 const nearY=Math.max(limit,anchor[1]-event.travel);
 const start=Math.max(.1,onset),contact=start+4,split=contact+2,retreat=split+4,rest=retreat+5;
 if(rest>=event.duration)throw new Error('Material swell must have room to recover before the episode ends');
 return {anchor,pivot:[w/2,h/2],tracks:{
  x:keys([[0,anchor[0]],[start,anchor[0]],[contact,anchor[0]+event.side*4],[split,splitX],[retreat,anchor[0]-event.side*3],[rest,anchor[0]],[event.duration,anchor[0]]]),
  y:keys([[0,anchor[1]],[start,anchor[1]],[contact,nearY],[split,nearY+1.5],[retreat,anchor[1]+3],[rest,anchor[1]],[event.duration,anchor[1]]]),
  rotation:keys([[0,0],[start,0],[contact,turn],[split,-turn*.7],[retreat,turn*.25],[rest,0],[event.duration,0]])
 },wave:{start,contact,split,retreat,rest,bank:event.bank,domain:event.domain},motionBounds:[Math.min(anchor[0]-event.side*3,splitX)-1,Math.min(nearY,anchor[1])-1,Math.max(anchor[0]-event.side*3,splitX)+1,Math.max(anchor[1]+3,nearY+1.5)+1]};
}
export function directStoneWater(scene){
 scene.duration=36;scene.expression.duration=36;scene.title='浪到石舟前，倒影散开又合回';
 scene.repairPlate='assets/scenes/Miami/water-clean-plate-v2.png';
 const bank=[[40,428],[160,431],[300,439],[510,445],[700,451],[930,456]];
 const domain=[[80,440],[145,431],[305,439],[510,445],[700,451],[938,458],[925,580],[700,598],[400,591],[95,549]];
 const groups=[
  {id:'west-column-reflection',label:'西侧立柱倒影',side:-1,start:2,crops:[[119,440,25,16],[116,465,29,14],[113,486,32,16],[198,446,43,16],[199,471,42,17],[198,495,46,18],[206,523,45,17]]},
  {id:'middle-column-reflection',label:'中段石栏倒影',side:-1,start:3,crops:[[295,446,33,16],[294,472,42,17],[300,505,46,17],[328,532,48,18],[445,468,44,15],[441,490,46,15]]},
  {id:'bow-reflection',label:'舟首倒影',side:1,start:3.8,crops:[[717,462,40,16],[762,467,52,18],[811,467,30,18],[713,492,51,18],[768,496,57,19],[716,520,51,17],[770,525,47,17],[728,546,48,17],[785,548,35,17]]}
 ];
 scene.objects=groups.flatMap(group=>group.crops.map((crop,i)=>{
  const event={start:group.start,farY:570,speed:24,travel:14,side:group.side,bank,domain,duration:36};
  return {id:`${group.id}-${i}`,crop,outline:[[0,0],[crop[2],0],[crop[2],crop[3]],[0,crop[3]]],matte:'gold-water',materialClass:'rigid-shell',...swellClip(crop,event,i),materialGroup:group.id};
 }));
 scene.subjects=groups.map(group=>{const parts=scene.objects.filter(o=>o.materialGroup===group.id).map(o=>o.id);return {id:group.id,label:group.label,root:parts[0],parts,subjectClass:'reflected-form',actions:['crest-arrives','fragments-approach-bank','spread-sideways','backwash','rejoin-original-reflection']};});
 scene.protectedRegions=[[[0,0],[1024,0],[1024,319],[978,319],[978,452],[953,452],[953,336],[934,336],[934,422],[926,441],[902,447],[861,448],[705,445],[520,438],[300,432],[201,427],[152,425],[152,415],[118,415],[118,425],[45,420],[45,319],[0,319]]];
 scene.castNote='Environmental material episode: three reflected source forms, not three independently moving physical vessels. Stone architecture and mooring poles stay fixed.';
 scene.subjectBeats=[
  {from:0,to:7,label:'波动从前方水面逐排传向石舟，先带动较远的倒影碎片。',subjects:groups.map(g=>g.id)},
  {from:7,to:14,label:'倒影接近固定石构边缘，西侧向左、舟首向右分开；石舟本身不动。',subjects:groups.map(g=>g.id)},
  {from:14,to:24,label:'碎片沿两侧退回，各排的回流有时间差。',subjects:groups.map(g=>g.id)},
  {from:24,to:36,label:'暖色倒影重新合回原位置，波动停止，纸面与石构仍保持原画。',subjects:groups.map(g=>g.id)}
 ];
 // These optional water responses use actual historical source-fragment poses.
 scene.contacts=groups.map(group=>{const object=scene.objects.find(o=>o.materialGroup===group.id);return {object:object.id,time:object.wave.contact,offset:[0,0],strength:.35};});
 scene.remaining=['Environmental episode preserves static stone architecture; it is not a claim of three physical moving subjects. Source-reflection matte, bank clearance, full-size material continuity and final playback acceptance remain pending.'];
}
