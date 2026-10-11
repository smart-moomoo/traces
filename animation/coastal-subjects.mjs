const track=points=>points.map(([time,value],i)=>{
 const a=points[i-1],b=points[i+1],u=a?(value-a[1])/(time-a[0]):0,v=b?(b[1]-value)/(b[0]-time):0;
 return {time,value,velocity:u*v>0?2*u*v/(u+v):0};
});
const channel=points=>({initial:0,keys:points.filter(([time])=>time>0).map(([time,value])=>({time,value}))});
const object=(id,crop,anchor,outline)=>({id,crop,anchor,pivot:[anchor[0]-crop[0],anchor[1]-crop[1]],outline,tracks:{},materialClass:'rigid-shell',motionBounds:[anchor[0]-.01,anchor[1]-.01,anchor[0]+.01,anchor[1]+.01]});

export function directCoastalPalms(scene){
 scene.title='风先经过一棵棕榈';
 scene.repairPlate='assets/scenes/San-Diego/palm-crowns-clean-plate-v2.png';
 const specs=[
  ['west-palm',[750,121,46,44],[772,143],[[21,0],[25,1],[24,10],[31,3],[35,3],[31,14],[41,8],[43,13],[35,20],[44,23],[46,30],[35,27],[41,36],[37,43],[28,29],[26,41],[20,40],[20,29],[13,42],[9,40],[13,28],[4,36],[0,35],[3,26],[12,21],[2,23],[2,17],[15,18],[9,8],[12,6],[20,16]]],
  ['middle-palm',[788,146,39,41],[806,165],[[16,0],[22,0],[22,8],[28,3],[33,5],[26,13],[37,10],[39,15],[29,18],[37,23],[37,28],[27,24],[31,36],[27,40],[22,27],[20,37],[14,37],[16,27],[8,35],[4,32],[12,23],[0,28],[0,21],[10,17],[2,14],[5,9],[14,13],[9,3],[13,1],[17,10]]],
  ['east-palm',[845,142,36,40],[862,159],[[16,0],[21,1],[20,8],[28,2],[30,6],[24,12],[34,9],[36,14],[26,17],[34,23],[30,29],[24,23],[24,36],[19,39],[17,27],[13,32],[9,29],[12,21],[4,27],[1,22],[9,16],[0,16],[2,10],[10,11],[8,4],[12,4],[16,11]]]
 ];
 scene.objects=specs.map(([id,crop,anchor,outline],i)=>{
  const o=object(id,crop,anchor,outline);o.matte='vegetation';o.materialClass='pinned-cloth';
  o.rig={kind:'radial-fronds',center:o.pivot,radius:22-i*2,amplitude:2.1-i*.15,lift:.7,curl:.65,channel:`palm${i}Pressure`,secondaryChannel:`palm${i}Curl`,columns:17,rows:17};
  const delay=i*1.15;
  scene.expression.channels[`palm${i}Pressure`]=channel([[0,0],[2+delay,0],[6+delay,1],[9+delay,.35],[12+delay,-.2],[16+delay,.8],[20+delay,.15],[24+delay,-.1],[29+delay,0],[32,0]]);
  scene.expression.channels[`palm${i}Curl`]=channel([[0,0],[3+delay,0],[7+delay,.8],[10+delay,-.65],[14+delay,.3],[18+delay,-.5],[22+delay,.2],[28+delay,0],[32,0]]);
  return o;
 });
 scene.subjects=scene.objects.map((o,i)=>({id:o.id,label:['西侧棕榈','中间棕榈','东侧棕榈'][i],root:o.id,parts:[o.id],actions:['fronds-open','tips-curl','opposed-fronds-recover','settle-at-trunk']}));
 scene.subjectBeats=[
  {from:0,to:8,label:'西侧叶簇先展开，风再到达相邻两棵棕榈。',subjects:scene.subjects.map(s=>s.id)},
  {from:8,to:15,label:'自由叶尖回卷，两侧叶片以不同幅度收回；树心与树干固定。',subjects:scene.subjects.map(s=>s.id)},
  {from:15,to:24,label:'第二阵风较弱，三处叶簇依次展开和回弹。',subjects:scene.subjects.map(s=>s.id)},
  {from:24,to:32,label:'叶尖最后收稳，海岸保持原画的轮廓。',subjects:scene.subjects.map(s=>s.id)}
 ];
 scene.remaining=['Crown alpha, fixed trunk connection, opposing frond motion and scene-scale readability need visual acceptance.'];
}

export function directChannelPassage(scene){
 scene.inspectionTimes=[0,5,13,20,22,29,31,36];
 scene.title='小船经过，两座航标随后回正';scene.duration=36;scene.expression.duration=36;
 scene.repairPlate='assets/scenes/Miami-Beach/boat-buoys-clean-plate-v2.png';
 // The stone jetty is a fixed foreground plane, never a moving water subject.
 const jetty=[[.53,.36],[.56,.366],[.36,.52],[.25,.65],[.15,.80],[.07,.79],[.08,.63],[.19,.51],[.36,.405]].map(([x,y])=>[x*1024,y*768]);
 const boat=object('channel-launch',[302,267,31,20],[317,285],[[0,10],[9,10],[8,4],[11,4],[11,0],[13,0],[15,7],[20,7],[23,11],[29,11],[30,15],[26,19],[2,18],[0,16]]);
 boat.tracks={x:track([[0,317],[3,317],[10,447],[18,649],[27,868],[32,915],[36,924]]),
  y:track([[0,285],[3,285],[10,280],[18,279],[27,278],[32,278],[36,278]]),
  rotation:track([[0,0],[3,0],[5,-.035],[8,.025],[10,0],[13,-.04],[16,.025],[19,0],[23,-.03],[26,.02],[29,0],[36,0]])};
 boat.occluders=[jetty];boat.motionBounds=[316,277,925,286];
 const red=object('red-channel-buoy',[659,259,13,22],[665,279],[[5,0],[8,0],[8,5],[10,7],[9,15],[12,19],[11,21],[0,21],[1,18],[4,15],[4,7],[3,5]]);
 const dark=object('outer-channel-buoy',[862,260,14,26],[869,284],[[5,0],[9,0],[9,5],[8,9],[10,15],[10,20],[13,24],[12,26],[0,26],[1,24],[4,20],[5,13],[4,8]]);
 // Arrival times derive from the boat's actual track, then a short delay for
 // its wake. One shared event list owns both the body reaction and contact.
 scene.subjectEvents=[{id:'red-wake-arrival',actor:red.id,time:20,source:boat.id,emittedAt:18.7},
  {id:'outer-wake-arrival',actor:dark.id,time:29,source:boat.id,emittedAt:27}];
 for(const [i,buoy] of [red,dark].entries()){
  const t=scene.subjectEvents[i].time;
  buoy.tracks.rotation=track([[0,0],[t-1,0],[t,.18],[t+1.3,-.13],[t+2.7,.075],[t+4,-.03],[t+5.8,0],[36,0]]);
 }
 scene.objects=[boat,red,dark];
 scene.contacts=[{object:boat.id,time:10,offset:[-12,0],strength:.35},...scene.subjectEvents.map(e=>({object:boat.id,time:e.emittedAt,offset:[-12,0],strength:.55}))];
 scene.subjects=[
  {id:'launch',label:'原画远处小船',root:boat.id,parts:[boat.id],actions:['accelerate','pitch-over-chop','pass-behind-jetty','coast']},
  {id:'red-marker',label:'红色航标',root:red.id,parts:[red.id],actions:['wait-for-passage','lean-at-wake','counter-roll','settle']},
  {id:'outer-marker',label:'外侧航标',root:dark.id,parts:[dark.id],actions:['wait-longer','lean-at-wake','counter-roll','settle']}
 ];
 scene.subjectBeats=[
  {from:0,to:12,label:'小船启程，船首略抬后越过碎浪，经过石堤后方。',subjects:['launch']},
  {from:12,to:23,label:'小船经过红色航标；尾波随后抵达，航标侧倾再回摆。',subjects:['launch','red-marker']},
  {from:23,to:32,label:'小船继续经过外侧航标；第二座航标迟一些迎浪和回正。',subjects:['launch','outer-marker']},
  {from:32,to:36,label:'小船缓缓远离，两个航标回到稳定的竖立姿态。',subjects:['launch','red-marker','outer-marker']}
 ];
 scene.remaining=['Small source subjects retain original scale. Validate hull matte, jetty depth, buoy water contacts and reaction timing in full playback.'];
}
