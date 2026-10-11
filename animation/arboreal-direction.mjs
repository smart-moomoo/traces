const track=points=>points.map(([time,value],i)=>{
 const a=points[i-1],b=points[i+1],u=a?(value-a[1])/(time-a[0]):0,v=b?(b[1]-value)/(b[0]-time):0;
 return {time,value,velocity:u*v>0?2*u*v/(u+v):0};
});
const part=(id,crop,anchor,outline,rotation)=>({id,crop,anchor,pivot:[anchor[0]-crop[0],anchor[1]-crop[1]],outline,
 matte:'vegetation',tracks:{rotation:track(rotation)},materialClass:'rigid-shell',motionBounds:[anchor[0]-.01,anchor[1]-.01,anchor[0]+.01,anchor[1]+.01]});
const worldOutline=o=>o.outline.map(([x,y])=>[x+o.crop[0],y+o.crop[1]]);
// Convert the original rigid swing score into local cantilever articulation.
// The root stays fixed while the tip yields; leaves use the deformed surface.
function articulate(scene,object,pin='bottom'){
 const name=`${object.id}-bend`,sign=pin==='top'?-1:1;
 scene.expression.channels[name]={initial:0,keys:object.tracks.rotation.filter(k=>k.time>0).map(k=>({time:k.time,value:k.value*sign/.055}))};
 object.tracks={};object.materialClass='articulated-shell';object.matteClose=1;
 object.rig={kind:'stem',pin,center:object.pivot[0],angle:.11,channel:name};
}


export function directArboreal(scene){
 const oak=scene.id==='New-Orleans',oldLeaf=scene.objects[0];
 scene.regions=scene.regions.filter(r=>r.kind!=='foliage');
 scene.repairPlate=`assets/scenes/${scene.id}/branches-clean-plate-v2.png`;
 let left,right,leaf;
 if(oak){
  scene.title='枝头松开以后';
  left=part('main-oak-twig',[486,12,89,202],[520,211],
   [[12,0],[50,0],[50,22],[73,24],[85,35],[78,49],[84,69],[75,80],[76,95],[63,101],[67,125],[56,135],[63,156],[46,173],[40,187],[35,200],[22,197],[19,171],[13,161],[19,145],[11,133],[12,117],[2,106],[6,83],[0,69],[7,51],[2,34],[12,27]],
   [[0,0],[2,0],[5,-.035],[6,-.05],[8,-.05],[11,.018],[15,-.025],[21,.012],[28,0],[34,0]]);
  right=part('neighbor-oak-twig',[73,335,132,129],[178,458],
   [[8,19],[24,8],[41,2],[61,8],[76,1],[93,12],[110,20],[128,40],[127,66],[115,79],[128,98],[114,114],[108,125],[96,123],[85,109],[61,105],[42,93],[18,91],[2,72],[12,54],[0,40]],
   [[0,0],[3,0],[6,.035],[9,.025],[13,-.012],[17,.03],[23,-.008],[30,0],[34,0]]);
  leaf=part('released-oak-leaf',[515,14,20,20],[525,26],[[1,3],[5,0],[15,0],[19,5],[18,13],[13,18],[5,18],[0,12]],[[0,0],[7,0],[11,.5],[16,-.4],[21,.55],[25,-.25],[29,.18],[34,.18]]);
  leaf.follows={kind:'joint',actor:left.id,offset:[5,-185],releaseAt:7};
  leaf.tracks.x=track([[0,525],[7,525],[11,558],[16,493],[21,520],[25,472],[29,452],[34,452]]);
  leaf.tracks.y=track([[0,26],[7,26],[11,135],[16,255],[21,411],[25,518],[29,638],[34,638]]);
  leaf.motionBounds=[435,10,590,650];leaf.occluders=oldLeaf.occluders;
 }else{
  scene.title='庭院里，一片叶子离开枝头';
  left=part('west-courtyard-crown',[137,433,104,102],[207,527],
   [[13,5],[37,0],[52,9],[74,3],[92,15],[102,30],[96,51],[103,69],[89,83],[74,94],[63,99],[48,87],[29,89],[12,73],[1,54],[7,38],[0,23]],
   [[0,0],[2,0],[5,.04],[8,.015],[12,-.025],[17,.035],[23,-.008],[28,0],[30,0]]);
  right=part('east-courtyard-crown',[242,438,114,99],[282,532],
   [[8,5],[22,0],[39,10],[51,5],[66,14],[86,8],[104,26],[111,46],[105,61],[113,72],[95,82],[71,81],[57,92],[42,97],[28,87],[11,84],[0,64],[7,46],[1,29]],
   [[0,0],[3,0],[6,.055],[8,.055],[11,-.02],[15,.025],[21,-.01],[27,0],[30,0]]);
  leaf={...oldLeaf,id:'released-courtyard-leaf',matte:'vegetation',repair:false,
   follows:{kind:'joint',actor:right.id,offset:[-14,-27],releaseAt:7},
   tracks:{x:track([[0,268],[7,268],[11,323],[16,405],[20,465],[25,505],[30,505]]),
    y:track([[0,505],[7,505],[11,526],[16,551],[20,578],[25,626],[30,626]]),
    rotation:track([[0,0],[7,0],[11,.6],[16,-.35],[20,.45],[25,.14],[30,.14]])},
   materialClass:'rigid-shell',motionBounds:[260,497,511,632]};
 }
 for(const branch of [left,right])articulate(scene,branch);
 leaf.follows.surface=true;
 const owner=oak?left:right;owner.sourceHoles=[worldOutline(leaf)];leaf.repair=false;
 leaf.materialClass='projected-shell';leaf.projection={axis:'x'};leaf.landingTime=oak?29:25;
 leaf.tracks.pitch=track(oak?[[0,0],[7,0],[11,.65],[16,.2],[21,.9],[25,.3],[29,1.18],[34,1.18]]:[[0,0],[7,0],[11,.7],[16,.15],[20,.8],[23,.3],[25,1.18],[30,1.18]]);
 scene.objects=[left,right,leaf];
 scene.contacts=[];
 scene.subjects=[
  {id:'first-tree',label:oak?'主橡树枝头':'西侧庭院树',root:left.id,parts:[left.id],actions:['load-in-wind','yield','rebound','settle']},
  {id:'second-tree',label:oak?'邻近橡树枝头':'东侧庭院树',root:right.id,parts:[right.id],actions:['delayed-yield','rebound','settle']},
  {id:'released-leaf',label:'离枝叶片',root:leaf.id,parts:[leaf.id],actions:['stay-attached','release','tumble','pass-behind-obstacle','land-and-remain']}
 ];
 scene.subjectBeats=[
  {from:0,to:7,label:'两处枝头先后弯下，叶片仍连接在枝上。',subjects:['first-tree','second-tree','released-leaf']},
  {from:7,to:16,label:'叶片离枝、翻转，枝条弹回。',subjects:['released-leaf','first-tree','second-tree']},
  {from:16,to:25,label:oak?'叶片被第二阵风带向树根，经过树干后方。':'叶片穿过庭院，经过灯杆后方。',subjects:['released-leaf','first-tree','second-tree']},
  {from:25,to:scene.duration,label:'叶片落定并留下，枝头逐渐收稳。',subjects:['released-leaf','first-tree','second-tree']}
 ];
 scene.remaining=['Source vegetation mattes, exact release seam, obstacle depth and full-speed story remain subject to visual review.'];
}

export function directAutumn(scene){
 scene.title='初雪上的两片叶子';scene.repairPlate='assets/scenes/Champaign-Urbana/branches-clean-plate-v2.png';
 scene.regions=scene.regions.filter(r=>r.kind!=='foliage');
 const branch=part('overhead-twig',[143,88,275,208],[175,94],
  [[21,2],[40,2],[65,29],[98,1],[125,2],[148,13],[159,29],[194,34],[217,6],[230,2],[231,32],[261,32],[274,57],[264,95],[236,96],[221,77],[195,68],[167,62],[136,46],[110,42],[126,68],[155,89],[182,94],[185,109],[226,122],[232,164],[206,179],[170,172],[130,179],[127,204],[101,207],[73,198],[71,165],[56,150],[47,129],[47,110],[30,112],[0,124],[0,87],[23,62],[46,35]],
  [[0,0],[2,0],[5,.02],[7,.02],[10,-.012],[12,-.012],[15,.012],[20,-.006],[27,0],[30,0]]);
 const first=part('first-autumn-leaf',[220,266,26,29],[232,275],[[7,0],[12,3],[17,0],[20,7],[25,11],[22,17],[16,17],[17,26],[12,29],[8,23],[8,17],[1,15],[0,10],[6,7]],
  [[0,0],[7,0],[11,.7],[15,-.5],[20,.4],[24,.12],[30,.12]]);
 first.follows={kind:'joint',actor:branch.id,offset:[57,181],releaseAt:7};
 first.tracks.x=track([[0,232],[7,232],[11,277],[15,249],[20,316],[24,346],[30,346]]);
 first.tracks.y=track([[0,275],[7,275],[11,363],[15,433],[20,549],[24,606],[30,606]]);
 first.tracks.pitch=track([[0,0],[7,0],[11,.8],[15,.15],[20,.9],[22,.3],[24,1.18],[30,1.18]]);
 first.motionBounds=[223,270,355,613];first.landingTime=24;
 const second=part('second-autumn-leaf',[377,146,31,33],[393,161],[[9,0],[16,3],[20,0],[22,7],[30,8],[29,16],[22,20],[22,27],[16,31],[11,26],[9,19],[1,18],[0,11],[7,9]],
  [[0,0],[12,0],[16,-.6],[20,.45],[24,-.5],[28,-.1],[30,-.1]]);
 second.follows={kind:'joint',actor:branch.id,offset:[218,67],releaseAt:12};
 second.tracks.x=track([[0,393],[12,393],[16,433],[20,403],[24,518],[28,653],[30,653]]);
 second.tracks.y=track([[0,161],[12,161],[16,293],[20,404],[24,516],[28,605],[30,605]]);
 second.tracks.pitch=track([[0,0],[12,0],[16,.85],[20,.1],[24,.8],[26,.25],[28,1.18],[30,1.18]]);
 second.motionBounds=[388,155,663,610];second.landingTime=28;
 for(const leaf of [first,second]){leaf.materialClass='projected-shell';leaf.projection={axis:'x'};leaf.repair=false;}
 articulate(scene,branch,'top');
 first.follows.surface=true;second.follows.surface=true;
 branch.sourceHoles=[worldOutline(first),worldOutline(second)];
 scene.objects=[branch,first,second];scene.contacts=[];
 scene.subjects=[
  {id:'overhead-branch',label:'前景枝条',root:branch.id,parts:[branch.id],actions:['bend','first-release','rebound','second-release','settle']},
  {id:'first-leaf',label:'第一片秋叶',root:first.id,parts:[first.id],actions:['attach','release','turn-in-air','land-flat','remain']},
  {id:'second-leaf',label:'第二片秋叶',root:second.id,parts:[second.id],actions:['wait-on-branch','release-later','turn-in-air','land-flat','remain']}
 ];
 scene.subjectBeats=[
  {from:0,to:7,label:'前景枝条下压，两片叶子仍附着在枝上。',subjects:['overhead-branch','first-leaf','second-leaf']},
  {from:7,to:12,label:'第一片秋叶离枝，另一片在回摆的枝头等待。',subjects:['overhead-branch','first-leaf','second-leaf']},
  {from:12,to:24,label:'第二片叶子随后松开，两片叶子沿不同轨迹翻转下降。',subjects:['first-leaf','second-leaf']},
  {from:24,to:30,label:'两片叶子先后平落在雪面，成为留下的痕迹。',subjects:['first-leaf','second-leaf']}
 ];
 scene.remaining=['Foreground twig extraction, two release points, foreshortened landings and full playback need visual review.'];
}
