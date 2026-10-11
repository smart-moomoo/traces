// Two independent sheet adjustments. Each boom and its sail foot use the same
// angular channel; no background effect or frame sequence supplies the action.
export function directSailTrim(scene){
 const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
 Object.assign(scene.expression.channels,{
  nearSheet:channel([[3,0],[5,-.22],[7,-.06],[12,-.06],[15,-.28],[18,-.1],[23,-.1],[27,0],[32,0]]),
  farSheet:channel([[1,0],[3,-.25],[5,-.08],[10,-.08],[13,-.28],[16,-.1],[22,-.1],[27,0],[32,0]])
 });
 for(const [id,trim,foot] of [['main-sail','nearSheet',94],['far-main-sail','farSheet',47]]){
  const sail=scene.objects.find(o=>o.id===id);
  sail.rig={...sail.rig,kind:'sail',foot,secondaryChannel:trim,maxTrim:.28,amplitude:id==='main-sail'?4:2};
 }
 const nearBoom=scene.objects.find(o=>o.id==='near-boom');
 Object.assign(nearBoom,{anchor:[878,505],pivot:[878-nearBoom.crop[0],505-nearBoom.crop[1]],
  follows:{kind:'joint',actor:'vessel-hull',offset:[-2,-18]},poseChannels:{rotation:'nearSheet'},motionBounds:[489,500,881,516]});
 const farBoom={id:'far-boom',crop:[136,479,23,2],outline:[[0,0],[22,0],[22,1],[0,1]],anchor:[136,480],pivot:[0,1],
  eraseDilation:1.5,tracks:{},follows:{kind:'joint',actor:'far-hull',offset:[-1,-9]},poseChannels:{rotation:'farSheet'},
  materialClass:'rigid-shell',motionBounds:[134,479,636,494]};
 scene.objects.push(farBoom);scene.subjects.find(s=>s.root==='far-hull').parts.push('far-boom');
 for(const subject of scene.subjects)subject.actions.push('trim-sheet-and-boom','hold-trim','ease-sheet');
 scene.subjectBeats[1].label='两船先后收紧帆角，横杆随帆脚转动；帆面受风后船身回正、起航。';
 scene.subjectBeats[2].label='两船在不同水道相向航行，第二次收帆各自发生，短暂停留后逐渐松开。';
 scene.remaining=['Two original vessels now articulate both pressure and shared boom/sail trim. Source edges, rigging clearance and complete exhibition-scale action readability remain under review.'];
}
