// Cloth surface controls live on the same deterministic score as actors. A
// pressure envelope and a short authored fold response replace texture sliding.
const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
const track=points=>points.map(([time,value])=>({time,value,velocity:0}));
const object=(id,crop,anchor,outline,rig)=>({id,crop,anchor,pivot:[anchor[0]-crop[0],anchor[1]-crop[1]],outline,rig,tracks:{},
 materialClass:rig?'pinned-cloth':'rigid-shell',motionBounds:[anchor[0]-.01,anchor[1]-.01,anchor[0]+.01,anchor[1]+.01]});
export function directCoastalFlags(scene){
 const santaMonica=scene.id==='Santa-Monica';
 scene.regions=scene.regions.filter(r=>r.kind!=='cloth');
 if(santaMonica){
  scene.title='两面旗，先后迎风';scene.repairPlate='assets/scenes/Santa-Monica/flags-clean-plate-v2.png';
  scene.objects=[
   object('california-flag',[264,345,44,47],[308,345],[[43,0],[43,37],[1,46],[1,32],[0,15],[18,10]],
    {kind:'flag',pin:'right',channel:'westPressure',secondaryChannel:'westFold',amplitude:-2.5,lift:-4,flutter:1.1}),
   object('us-flag',[545,360,37,38],[582,360],[[0,10],[16,6],[25,2],[37,0],[37,30],[24,28],[12,34],[0,37],[1,26]],
    {kind:'flag',pin:'right',channel:'eastPressure',secondaryChannel:'eastFold',amplitude:-2,lift:-4,flutter:.8})
  ];
  scene.objects[0].eraseOutline=[[-1,14],[18,8],[43,-1],[43,39],[0,48],[-1,31]];
  scene.objects[1].eraseOutline=[[-1,8],[16,4],[36,-1],[36,32],[24,31],[11,36],[-1,39]];
  const rect=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(([xx,yy])=>[xx/scene.crop[2],yy/scene.crop[3]]);
  for(const r of scene.regions.filter(r=>r.kind==='water'))r.exclusions=[...(r.exclusions||[]),rect(304,336,9,124),rect(579,350,10,113)];
  Object.assign(scene.expression.channels,{
   westPressure:channel([[2,0],[5,1],[8,.5],[11,.9],[15,.25],[19,.85],[23,.35],[28,0],[30,0]]),
   eastPressure:channel([[3.2,0],[6.2,.9],[9.2,.45],[12.2,1],[16.2,.3],[20.2,.8],[24.2,.25],[29,0],[30,0]]),
   westFold:channel([[2,0],[4,.8],[5,-.8],[6,.5],[8,-.3],[10,.8],[11,-.7],[13,.4],[15,0],[18,-.8],[20,.6],[22,-.3],[26,.1],[28,0],[30,0]]),
   eastFold:channel([[3.2,0],[5.2,-.6],[6.2,.8],[7.2,-.4],[9.2,.3],[11.2,-.8],[12.2,.7],[14.2,-.4],[16.2,0],[19.2,.8],[21.2,-.6],[23.2,.3],[27,.1],[29,0],[30,0]])
  });
  scene.subjects=[
   {id:'west-flag',label:'加州旗',root:'california-flag',parts:['california-flag'],actions:['free-edge-lift','fold-travel','tension','release']},
   {id:'east-flag',label:'美国旗',root:'us-flag',parts:['us-flag'],actions:['delayed-lift','fold-travel','tension','release']}
  ];
  scene.subjectBeats=[
   {from:0,to:5,label:'左侧旗面先抬起，自由边开始弯折。',subjects:['west-flag']},
   {from:5,to:12,label:'右侧旗面随后展开，两面旗的折纹错开。',subjects:['west-flag','east-flag']},
   {from:12,to:20,label:'风压短暂减弱，旗面回垂，再迎来第二阵风。',subjects:['west-flag','east-flag']},
   {from:20,to:30,label:'折纹逐渐收小，两面旗依次回到垂落的状态。',subjects:['west-flag','east-flag']}
  ];
 }else{
  scene.title='灯塔下，旗与树梢';scene.repairPlate='assets/scenes/Santa-Cruz/flag-twig-clean-plate-v2.png';
  scene.objects=[
   object('hanging-flag',[724,172,26,119],[724,172],[[0,0],[2,10],[10,46],[15,66],[22,85],[14,105],[6,119],[0,114],[0,102],[1,88],[0,68]],
    {kind:'hanging',pin:'top',channel:'hangingPressure',secondaryChannel:'hangingFold',amplitude:10,lift:-2,flutter:2}),
   object('tree-tip',[201,254,41,47],[221,299],[[10,3],[24,0],[29,9],[25,16],[36,14],[40,20],[28,30],[40,31],[38,43],[20,47],[3,44],[0,31],[8,28],[3,22],[7,13]],null)
  ];
  scene.objects[0].eraseOutline=[[-1,-1],[3,9],[12,45],[17,65],[24,85],[16,107],[7,121],[-1,116],[-1,101],[-1,87],[-1,68]];
  scene.objects[1].matte='foliage';
  scene.objects[1].tracks.rotation=track([[0,0],[3,0],[7,-.12],[10,.04],[14,-.08],[19,.025],[24,-.03],[28,0],[30,0]]);
  // The branch attaches to the original rigid tree. A second whole-tree shader
  // would move the support independently and detach it from this rooted joint.
  scene.regions=scene.regions.filter(r=>r.id!=='tree');
  Object.assign(scene.expression.channels,{
   hangingPressure:channel([[2,0],[6,1],[10,.35],[14,.85],[18,.4],[23,.6],[28,0],[30,0]]),
   hangingFold:channel([[2,0],[4,.8],[6,-.8],[8,.5],[10,-.3],[12,.7],[14,-.6],[16,.4],[20,-.3],[24,.2],[28,0],[30,0]])
  });
  scene.subjects=[
   {id:'lighthouse-flag',label:'悬挂旗帜',root:'hanging-flag',parts:['hanging-flag'],actions:['bend-from-hoist','fold','lag-and-recover']},
   {id:'cypress',label:'柏树梢',root:'tree-tip',parts:['tree-tip'],actions:['yield','overshoot','settle']}
  ];
  scene.subjectBeats=[
   {from:0,to:6,label:'旗帜从悬挂点向下弯起，树梢随后受风。',subjects:['lighthouse-flag','cypress']},
   {from:6,to:14,label:'旗端回摆，树梢弹回；第二阵风再次展开旗面。',subjects:['lighthouse-flag','cypress']},
   {from:14,to:24,label:'旗面的折纹与树梢回摆逐渐减弱。',subjects:['lighthouse-flag','cypress']},
   {from:24,to:30,label:'悬挂点和树枝连接处保持固定，自由端收稳。',subjects:['lighthouse-flag','cypress']}
  ];
 }
 scene.remaining=['Source flag extraction, fixed attachments, mesh extremes and complete performance need visual review. Background shader motion is not the subject action.'];
}
