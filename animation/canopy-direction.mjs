const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
const part=(id,crop,anchor,outline,rig,matte)=>({id,crop,anchor,pivot:[anchor[0]-crop[0],anchor[1]-crop[1]],outline,rig,matte,tracks:{},materialClass:'articulated-shell',motionBounds:[anchor[0]-.01,anchor[1]-.01,anchor[0]+.01,anchor[1]+.01]});

export function directMoss(scene){
 scene.title='苔藓下端迟一些回到树枝下';scene.repairPlate='assets/scenes/Savannah/moss-clean-plate-v2.png';
 scene.regions=scene.regions.filter(r=>!['foliage','moss'].includes(r.kind));
 const specs=[
  ['left-high-tuft',[313,192,27,79],[326,192],[[4,0],[13,1],[18,0],[22,5],[22,20],[27,32],[25,43],[23,50],[25,65],[20,78],[16,75],[15,58],[12,52],[11,71],[6,77],[4,63],[5,45],[1,31],[0,19],[3,8]]],
  ['left-low-tuft',[349,303,29,65],[363,303],[[2,0],[9,0],[14,3],[21,0],[26,2],[25,16],[29,22],[28,39],[24,49],[24,62],[20,64],[17,49],[15,35],[12,45],[11,61],[7,64],[5,52],[7,37],[4,24],[0,19]]],
  ['right-high-tuft',[683,151,30,76],[696,151],[[2,0],[11,0],[15,3],[22,0],[27,4],[26,14],[30,24],[28,35],[23,43],[23,62],[21,74],[17,76],[15,61],[16,46],[13,36],[10,49],[10,65],[6,73],[2,65],[4,49],[1,35],[0,23],[3,10]]],
  ['right-low-tuft',[651,276,31,70],[665,276],[[3,0],[9,2],[13,0],[19,3],[27,4],[29,13],[27,24],[31,39],[28,48],[25,61],[20,70],[17,63],[18,49],[14,41],[12,53],[11,66],[7,69],[5,55],[6,43],[1,28],[0,14]]]
 ];
 scene.objects=specs.map(([id,crop,anchor,outline],i)=>{
  const delay=[0,1.7,3.1,4.4][i],sign=i<2?1:-1;
  scene.expression.channels[`moss${i}Pull`]=channel([[2+delay,0],[6+delay,1],[10+delay,.35],[13+delay,-.4],[17+delay,.6],[22+delay,-.15],[28+delay,0],[34,0]]);
  scene.expression.channels[`moss${i}Tip`]=channel([[3+delay,0],[8+delay,.9],[11+delay,-.75],[15+delay,.4],[19+delay,-.4],[24+delay,.15],[28+delay,0],[34,0]]);
  return part(id,crop,anchor,outline,{kind:'stem',pin:'top',center:anchor[0]-crop[0],angle:sign*.22,tipAngle:sign*.11,channel:`moss${i}Pull`,secondaryChannel:`moss${i}Tip`,columns:11,rows:19},'moss');
 });
 scene.subjects=scene.objects.map((o,i)=>({id:o.id,label:['左侧高处苔藓','左侧低处苔藓','右侧高处苔藓','右侧低处苔藓'][i],root:o.id,parts:[o.id],actions:['hold-at-branch','bend-down-strand','tip-lag','counter-swing','hang-at-rest']}));
 const ids=scene.subjects.map(s=>s.id);
 scene.subjectBeats=[
  {from:0,to:9,label:'风先带起左侧两簇苔藓，下端稍迟弯起，枝上连接点不动。',subjects:ids.slice(0,2)},
  {from:9,to:16,label:'右侧苔藓随后响应，左侧已经回摆；各簇下端有自己的滞后。',subjects:ids},
  {from:16,to:26,label:'第二阵风较弱，苔藓再次分开，再慢慢垂回树枝下。',subjects:ids},
  {from:26,to:34,label:'余下摆动从上到下收住，所有苔藓仍连接在原来的树枝上。',subjects:ids}
 ];
 scene.remaining=['Four extracted pale tufts need source/branch occlusion and complete exhibit-size visual acceptance; no whole-canopy shader counts as subject movement.'];
}

export function directGateCanopy(scene){
 scene.title='树梢抬起，门前短暂亮起来';scene.repairPlate='assets/scenes/Wallace/two-limbs-clean-plate-v2.png';
 scene.regions=scene.regions.filter(r=>r.kind!=='foliage');
 scene.objects=[
  part('west-inner-limb',[347,137,116,124],[347,179],[[0,16],[10,11],[19,1],[29,5],[33,15],[47,11],[51,2],[65,0],[77,8],[88,19],[82,30],[97,37],[110,44],[110,52],[101,57],[109,63],[116,69],[113,78],[106,82],[106,100],[99,117],[92,117],[91,98],[85,91],[81,110],[74,124],[70,118],[72,97],[67,85],[59,78],[55,90],[48,97],[41,108],[36,104],[39,86],[34,76],[27,75],[23,64],[16,71],[8,69],[4,57],[0,53]],
   {kind:'spine',pin:'left',angle:-.18,center:42/124,channel:'westCanopyLift'},'vegetation'),
  part('east-inner-limb',[684,147,99,98],[783,203],[[99,42],[85,33],[87,24],[80,16],[70,16],[68,4],[58,0],[48,5],[46,17],[36,14],[26,19],[23,29],[14,27],[4,33],[0,41],[6,52],[14,50],[17,63],[20,87],[26,93],[32,80],[33,61],[39,59],[43,80],[46,95],[51,98],[55,84],[57,72],[63,75],[65,95],[71,96],[73,78],[78,67],[89,69],[99,63]],
   {kind:'spine',pin:'right',angle:-.2,center:56/98,channel:'eastCanopyLift'},'vegetation')
 ];
 for(const o of scene.objects)o.matteClose=1;
 Object.assign(scene.expression.channels,{
  wind:channel([[30,0]]),
  westCanopyLift:channel([[2,0],[7,1],[12,.85],[17,.3],[21,-.12],[26,0],[30,0]]),
  eastCanopyLift:channel([[4,0],[9,.9],[13,1],[18,.35],[22,-.1],[27,0],[30,0]])
 });
 // Lighting reads these exact rig channels; it does not run a second wind
 // oscillator or an unrelated cloud sweep behind the actors.
 scene.lightReceiver={sources:[{channel:'westCanopyLift',weight:.5},{channel:'eastCanopyLift',weight:.5}],gain:.16};
 scene.subjects=[
  {id:'west-oak',label:'左侧橡树枝梢',root:'west-inner-limb',parts:['west-inner-limb'],actions:['lift-inner-tip','open-canopy','hold','lower-tip','settle']},
  {id:'east-oak',label:'右侧橡树枝梢',root:'east-inner-limb',parts:['east-inner-limb'],actions:['delayed-lift','open-canopy','hold','lower-tip','settle']}
 ];
 scene.subjectBeats=[
  {from:0,to:8,label:'左侧枝梢先抬起，右侧随后让开，树冠之间的空隙变大。',subjects:['west-oak','east-oak']},
  {from:8,to:14,label:'两处枝梢短暂停住，门前同一片树影随开口变浅。',subjects:['west-oak','east-oak']},
  {from:14,to:23,label:'枝梢依次放低，门前恢复树荫，叶簇还有一次小幅回弹。',subjects:['west-oak','east-oak']},
  {from:23,to:30,label:'树梢收稳；铁门、围墙和父枝始终固定。',subjects:['west-oak','east-oak']}
 ];
 scene.remaining=['Review source branches, fixed root seams, restrained opening and source-derived light receivers at exhibition size.'];
}
