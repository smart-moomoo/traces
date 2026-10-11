const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
export function directReeds(scene){
 scene.duration=32;scene.expression.duration=32;
 scene.title='三株草茎，先弯下再抬起';
 scene.repairPlate='assets/scenes/Mountain-View/reeds-clean-plate-v3.png';
 scene.regions=scene.regions.filter(r=>r.kind!=='foliage');
 const specs=[
  ['west-seed-stalk',[98,347,46,262],[120,609],[[2,6],[8,3],[16,6],[23,2],[27,5],[37,3],[45,7],[41,15],[30,20],[24,18],[24,34],[29,43],[39,43],[44,48],[42,57],[30,60],[26,65],[29,97],[30,143],[32,186],[32,222],[34,262],[21,262],[21,225],[20,184],[19,142],[18,99],[19,68],[15,62],[7,60],[1,55],[4,47],[15,43],[20,42],[20,19],[11,20],[8,15],[1,16]]],
  ['middle-seed-stalk',[151,348,43,281],[155,629],[[2,0],[15,2],[21,0],[26,3],[34,1],[38,5],[38,13],[31,18],[23,18],[20,37],[22,48],[28,40],[33,36],[37,39],[34,45],[30,44],[23,53],[21,88],[17,127],[14,164],[12,201],[10,240],[10,281],[0,281],[1,240],[4,200],[7,163],[10,127],[14,90],[16,56],[9,46],[6,33],[1,29],[0,25],[8,23],[13,28],[11,33],[12,44],[17,49],[18,20],[10,19],[2,15],[0,7]]],
  ['east-seed-stalk',[184,366,57,262],[193,628],[[29,0],[34,3],[42,0],[45,4],[51,4],[52,8],[48,13],[57,16],[55,22],[47,23],[44,19],[41,26],[33,44],[28,61],[24,84],[21,111],[18,145],[15,180],[12,215],[11,245],[10,262],[1,262],[2,242],[4,213],[7,178],[10,144],[13,110],[17,82],[22,59],[27,40],[33,24],[29,20],[24,20],[22,14],[27,11],[24,6]]]
 ];
 scene.objects=specs.map(([id,crop,anchor,outline],i)=>{
  const pivot=[anchor[0]-crop[0],anchor[1]-crop[1]],delay=i*1.25;
  scene.expression.channels[`stem${i}Load`]=channel([[2+delay,0],[6+delay,.9],[10+delay,.3],[14+delay,-.3],[18+delay,.65],[23+delay,-.12],[28+delay,0],[32,0]]);
  scene.expression.channels[`stem${i}Tip`]=channel([[3+delay,0],[7+delay,.7],[11+delay,-.8],[15+delay,.45],[19+delay,-.5],[24+delay,.2],[28+delay,0],[32,0]]);
  return {id,crop,anchor,pivot,outline,matte:'vegetation',tracks:{},materialClass:'pinned-cloth',motionBounds:[anchor[0]-.01,anchor[1]-.01,anchor[0]+.01,anchor[1]+.01],
   rig:{kind:'stem',pin:'bottom',center:pivot[0],angle:.075+i*.01,tipAngle:.045,channel:`stem${i}Load`,secondaryChannel:`stem${i}Tip`,columns:9,rows:25}};
 });
 // The low ends stay in the original foreground grass plane, so all three
 // stems bend out of rooted attachments instead of carrying a carpet patch.
 scene.subjects=scene.objects.map((o,i)=>({id:o.id,label:['左侧草茎','中央草茎','右侧草茎'][i],root:o.id,parts:[o.id],actions:['rooted-bend','seed-head-lag','elastic-rebound','second-yield','settle']}));
 const ids=scene.subjects.map(s=>s.id);
 scene.subjectBeats=[
  {from:0,to:8,label:'左侧草茎先弯下，风依次传到中央和右侧。',subjects:ids},
  {from:8,to:16,label:'茎身回弹，较重的穗头稍迟跟随并越过静止位置。',subjects:ids},
  {from:16,to:25,label:'第二阵风更弱，三株草茎再次弯曲，回摆逐渐收小。',subjects:ids},
  {from:25,to:32,label:'穗头最后收稳，根部始终留在原画的草丛里。',subjects:ids}
 ];
 scene.remaining=['Thin stalk extraction, source gaps after bending, material strain and full-scale action clarity need visual review.'];
}
