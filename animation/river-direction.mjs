const track=points=>points.map(([time,value],i)=>{const a=points[i-1],b=points[i+1],u=a?(value-a[1])/(time-a[0]):0,v=b?(b[1]-value)/(b[0]-time):0;return {time,value,velocity:u*v>0?2*u*v/(u+v):0};});
const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
// A bridge is one semantic subject with two hinged leaves. The two existing
// small watercraft keep their own orientations and independent river lanes.
export function directRiver(scene){
 scene.duration=36;scene.expression.duration=36;scene.title='桥叶抬起，河道让行';
 scene.repairPlate='assets/scenes/Chicago/bridge-boats-clean-plate-v2.png';
 const launch=scene.objects[0];
 launch.tracks={x:track([[0,451],[4,451],[12,448],[23,439],[30,431],[36,431]]),y:track([[0,553],[4,553],[12,568],[23,599],[30,618],[36,618]]),rotation:track([[0,0],[4,0],[9,.025],[15,-.018],[22,.014],[30,0],[36,0]])};
 launch.motionBounds=[429,552,453,620];delete launch.occluders;
 const piers=[[[324,433],[369,433],[369,530],[324,530]],[[566,430],[628,430],[628,531],[566,531]]];
 const west={id:'bridge-west-leaf',matte:'rust-structure',crop:[368,461,101,57],anchor:[369,488],pivot:[1,27],outline:[[0,0],[101,3],[101,33],[67,33],[38,39],[7,56],[0,56]],tracks:{},poseChannels:{rotation:'westBridge'},occluders:piers,materialClass:'rigid-shell',motionBounds:[368,487,370,489]};
 const east={id:'bridge-east-leaf',matte:'rust-structure',crop:[469,461,99,57],anchor:[566,488],pivot:[97,27],outline:[[0,3],[99,4],[99,56],[92,56],[71,44],[39,34],[0,33]],tracks:{},poseChannels:{rotation:'eastBridge'},occluders:piers,materialClass:'rigid-shell',motionBounds:[565,487,567,489]};
 Object.assign(scene.expression.channels,{
  westBridge:channel([[3,0],[11,-.66],[22,-.66],[31,0],[36,0]]),
  eastBridge:channel([[3.7,0],[11.7,.66],[22.7,.66],[31.7,0],[36,0]])
 });
 const tender={id:'river-tender',crop:[768,510,74,54],anchor:[802,558],pivot:[34,48],
  outline:[[0,34],[7,31],[8,20],[16,20],[17,5],[16,4],[16,2],[45,2],[47,4],[43,5],[43,17],[51,21],[52,22],[58,23],[60,32],[65,33],[71,35],[73,46],[70,49],[64,51],[34,53],[3,49],[0,46]],
  materialClass:'rigid-shell',motionBounds:[801,557,860,618],tracks:{
   x:track([[0,802],[10,802],[15,808],[22,830],[29,853],[34,859],[36,859]]),
   y:track([[0,558],[10,558],[15,566],[22,589],[29,611],[34,616],[36,616]]),
   rotation:track([[0,0],[10,0],[13,-.025],[18,-.05],[24,-.02],[30,.015],[34,0],[36,0]])
  }};
 const mast=(id,crop,outline)=>({id,crop,outline,matte:'ivory-rigging',anchor:tender.anchor,pivot:[tender.anchor[0]-crop[0],tender.anchor[1]-crop[1]],tracks:{},follows:{actor:tender.id,offset:[0,0]},materialClass:'rigid-shell',motionBounds:tender.motionBounds});
 const forward=mast('tender-forward-antenna',[806,471,5,62],[[1,0],[2,0],[3,31],[5,35],[3,38],[3,62],[0,62],[1,38],[0,35],[1,31]]);
 const aft=mast('tender-aft-antenna',[778,502,5,33],[[2,0],[4,1],[3,33],[1,33],[1,5],[0,4],[1,2]]);
 tender.sourceHoles=[forward,aft].map(o=>o.outline.map(([x,y])=>[x+o.crop[0],y+o.crop[1]]));
 scene.objects=[west,east,launch,tender,forward,aft];
 scene.subjects=[
  {id:'opening-bridge',label:'双叶活动桥',root:west.id,parts:[west.id,east.id],actions:['unlock','raise-two-leaves','hold-open','lower-in-sequence','join-and-rest']},
  {id:'outbound-launch',label:'河道小艇',root:launch.id,parts:[launch.id],actions:['hold-course','accelerate','ride-swell','clear-bridge','settle']},
  {id:'departing-tender',label:'离岸小艇',root:tender.id,parts:[tender.id,forward.id,aft.id],actions:['wait-at-quay','ease-away','turn-into-river','recover-heading','slow']}
 ];
 scene.subjectBeats=[
  {from:0,to:5,label:'桥叶开始解锁，小艇保持原位置；桥墩、岸线与高楼固定。',subjects:['opening-bridge','outbound-launch','departing-tender']},
  {from:5,to:12,label:'两片桥叶依次抬起，中央小艇沿河道前行，岸边艇仍在等待。',subjects:['opening-bridge','outbound-launch','departing-tender']},
  {from:12,to:23,label:'桥叶保持打开，岸边小艇离泊；两艇以不同朝向驶入各自水道。',subjects:['opening-bridge','outbound-launch','departing-tender']},
  {from:23,to:32,label:'桥叶缓缓合拢，两艇驶离桥区，姿态随速度收稳。',subjects:['opening-bridge','outbound-launch','departing-tender']},
  {from:32,to:36,label:'桥面重新接合，两艇减速，航迹在经过的位置消退。',subjects:['opening-bridge','outbound-launch','departing-tender']}
 ];
 scene.contacts=[{object:launch.id,time:12,offset:[0,-17],strength:.6},{object:tender.id,time:20,offset:[-24,0],strength:.7},{object:tender.id,time:28,offset:[-24,0],strength:.45}];
 scene.probes={fixed:[[.34,.54],[.58,.56],[.3,.3]],moving:[[.44,.72],[.8,.74]]};
 scene.remaining=['Source truss holes, pier seam, antenna footprint and exposed riverbank require visual review. Three subject programmes do not constitute final acceptance.'];
}
