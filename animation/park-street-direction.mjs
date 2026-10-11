const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
function subjectPart(id,crop,pivot,outline,rig){
 const anchor=[crop[0]+pivot[0],crop[1]+pivot[1]];
 return {id,crop,pivot,anchor,outline,rig,matte:'vegetation',matteClose:1,tracks:{},materialClass:'articulated-shell',motionBounds:[anchor[0]-.01,anchor[1]-.01,anchor[0]+.01,anchor[1]+.01]};
}
function score(scene,names,duration){
 scene.duration=duration;scene.expression.duration=duration;
 scene.expression.channels.wind=channel([[duration,0]]);
 names.forEach((name,i)=>{
  const d=i*1.4;
  scene.expression.channels[name]=channel([[2+d,0],[7+d,1],[11+d,.6],[15+d,-.25],[20+d,.45],[26+d,0],[duration,0]]);
  scene.expression.channels[name+'Tip']=channel([[3+d,0],[9+d,.8],[13+d,-.6],[17+d,.4],[22+d,-.2],[27+d,0],[duration,0]]);
 });
 scene.lightReceiver={sources:names.map(channel=>({channel,weight:1/names.length})),gain:.12};
 scene.regions=scene.regions.filter(r=>r.kind!=='foliage');
}
export function directParkCanopy(scene){
 scene.title='树梢让开，草地接住一阵阳光';scene.repairPlate='assets/scenes/Sunnyvale/canopy-clean-plate-v4.png';
 score(scene,['nearUpper','nearLower','farCrown'],32);
 delete scene.lightReceiver;
 scene.shadowPlanes=[
  {channel:'nearUpper',travel:[-.035,.012],strength:.19,points:[[.48,.60],[.81,.62],[.79,.84],[.42,.84]],exclusions:[]},
  {channel:'nearLower',travel:[-.025,.008],strength:.15,points:[[.81,.62],[.95,.62],[.94,.76],[.79,.84]],exclusions:[[[.83,.65],[.97,.65],[.97,.80],[.83,.80]]]},
  {channel:'farCrown',travel:[-.018,.006],strength:.13,points:[[.10,.61],[.48,.60],[.42,.84],[.10,.80]],exclusions:[]}
 ];
 scene.objects=[
  subjectPart('near-upper-bough',[551,197,125,102],[125,72],[[125,57],[107,52],[99,39],[89,35],[84,20],[75,17],[75,6],[62,0],[52,6],[53,16],[44,18],[35,13],[25,22],[24,30],[13,33],[9,41],[3,42],[0,54],[8,61],[17,55],[24,61],[21,70],[9,73],[7,86],[17,95],[25,94],[30,82],[42,79],[48,89],[58,100],[65,102],[72,91],[72,82],[84,80],[93,82],[107,79],[125,79]],{kind:'spine',pin:'right',angle:-.18,center:72/102,channel:'nearUpper'}),
  subjectPart('near-lower-bough',[588,297,118,74],[118,22],[[118,15],[99,10],[84,16],[76,5],[65,0],[57,8],[53,17],[40,18],[30,15],[19,26],[21,39],[8,39],[0,47],[4,60],[16,67],[27,64],[32,74],[43,73],[45,60],[55,58],[64,63],[70,51],[80,45],[94,42],[108,30],[118,30]],{kind:'spine',pin:'right',angle:.22,center:22/74,channel:'nearLower'}),
  subjectPart('far-tree-crown',[135,227,135,113],[58,113],[[38,113],[34,95],[21,89],[20,77],[8,69],[0,60],[7,48],[18,40],[16,28],[27,20],[34,21],[36,10],[47,0],[57,4],[62,14],[75,6],[82,13],[82,22],[98,20],[105,32],[103,41],[119,45],[126,58],[118,70],[135,77],[130,86],[112,91],[105,101],[87,99],[70,113]],{kind:'stem',pin:'bottom',center:58,angle:.11,tipAngle:.055,channel:'farCrown',secondaryChannel:'farCrownTip'})
 ];
 for(const o of scene.objects)o.matteDark=o.id==='far-tree-crown'?145:125;
 scene.subjects=scene.objects.map((o,i)=>({id:o.id,label:['近处上层枝梢','近处下层枝梢','远处树冠'][i],root:o.id,parts:[o.id],actions:['yield-at-fixed-root','open-canopy','elastic-rebound','weaker-second-bend','return-to-rest']}));
 const subjects=scene.subjects.map(s=>s.id);
 scene.subjectBeats=[{from:0,to:10,label:'近处两组枝梢先后弯起，远处树冠稍迟回应。',subjects},{from:10,to:18,label:'枝梢回摆，树冠之间的缝隙收窄，草地光斑随之变暗。',subjects},{from:18,to:27,label:'较弱的第二阵风穿过，两组近枝再让开一次。',subjects},{from:27,to:32,label:'树梢归位；长椅、树干和远山始终固定。',subjects}];
 scene.remaining=['Source-mask, root connections and foreground depth need full visual acceptance. Three lawn receiving planes read the same rig controls; their projection quality still requires visual acceptance.'];
}
export function directStreetCanopy(scene){
 scene.title='叶簇垂下，又向街道让开';scene.repairPlate='assets/scenes/Charleston/canopy-clean-plate-v2.png';
 score(scene,['blueTwig','pinkTwig','streetPalm'],32);
 delete scene.lightReceiver;
 scene.shadowPlanes=[
  {channel:'blueTwig',travel:[-.025,.02],strength:.19,points:[[.15,.32],[.39,.42],[.39,.82],[.15,.82]],exclusions:[]},
  {channel:'pinkTwig',travel:[.021,.015],strength:.17,points:[[.39,.42],[.52,.46],[.52,.82],[.39,.82]],exclusions:[]},
  {channel:'streetPalm',travel:[.012,.013],strength:.13,points:[[.52,.46],[.64,.49],[.64,.82],[.52,.82]],exclusions:[]}
 ];
 scene.objects=[
  subjectPart('blue-roof-twig',[191,147,107,102],[42,0],[[34,0],[45,0],[49,17],[60,22],[70,20],[77,28],[88,32],[90,40],[106,46],[107,58],[96,64],[87,62],[84,74],[75,80],[66,73],[60,89],[49,95],[38,91],[30,102],[21,95],[20,83],[7,83],[0,74],[6,64],[20,63],[25,53],[14,43],[16,32],[29,28],[39,29],[36,16]],{kind:'stem',pin:'top',center:42,angle:-.17,tipAngle:.08,channel:'blueTwig',secondaryChannel:'blueTwigTip'}),
  subjectPart('pink-roof-twig',[392,226,116,99],[61,0],[[56,0],[65,0],[61,17],[72,19],[80,12],[90,18],[88,29],[103,31],[112,42],[110,51],[99,55],[106,63],[116,71],[110,82],[97,86],[89,76],[77,83],[72,95],[62,99],[54,86],[44,89],[35,78],[22,79],[16,68],[4,66],[0,53],[13,45],[26,47],[33,36],[47,37],[50,23]],{kind:'stem',pin:'top',center:61,angle:.18,tipAngle:.075,channel:'pinkTwig',secondaryChannel:'pinkTwigTip'}),
  subjectPart('street-palm',[818,365,100,97],[55,78],[[8,43],[17,33],[14,22],[26,16],[32,4],[44,8],[52,0],[62,9],[73,5],[77,17],[89,23],[86,33],[97,40],[100,52],[89,57],[93,70],[82,76],[76,90],[64,97],[55,89],[45,94],[35,81],[23,86],[18,73],[7,71],[0,61]],{kind:'radial-fronds',center:[55,78],radius:72,amplitude:5,lift:2,curl:1.8,channel:'streetPalm',secondaryChannel:'streetPalmTip'})
 ];
 scene.subjects=scene.objects.map((o,i)=>({id:o.id,label:['蓝屋上方叶簇','粉屋上方叶簇','远处棕榈冠'][i],root:o.id,parts:[o.id],actions:i===2?['crown-root-fixed','frond-pressure','tip-curl','unfurl','settle']:['branch-attachment-fixed','lower-and-bend','tip-lag','lift-and-release','settle']}));
 const subjects=scene.subjects.map(s=>s.id);
 scene.subjectBeats=[{from:0,to:10,label:'蓝屋上方叶簇先垂下，粉屋上方随后回应，远处棕榈叶展开。',subjects},{from:10,to:18,label:'两簇叶子回抬，叶尖稍迟跟随；粗主枝和屋顶不动。',subjects},{from:18,to:27,label:'余风让叶簇再次轻垂，棕榈叶逐渐松开。',subjects},{from:27,to:32,label:'三处主体归位，街道回到原来的光影。',subjects}];
 scene.remaining=['Source-matte and roof occlusion review; three per-facade shadow planes are implemented and need complete visual acceptance.'];
}
