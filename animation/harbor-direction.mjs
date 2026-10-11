const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
const track=points=>points.map(([time,value],i)=>{const a=points[i-1],b=points[i+1],u=a?(value-a[1])/(time-a[0]):0,v=b?(b[1]-value)/(b[0]-time):0;return{time,value,velocity:u*v>0?2*u*v/(u+v):0};});
function cable(id,start,end,pivot,control){
 const w=1.8,dx=end[0]-start[0],dy=end[1]-start[1],length=Math.hypot(dx,dy),nx=-dy/length*w/2,ny=dx/length*w/2;
 const world=[[start[0]+nx,start[1]+ny],[end[0]+nx,end[1]+ny],[end[0]-nx,end[1]-ny],[start[0]-nx,start[1]-ny]];
 const x=Math.floor(Math.min(...world.map(p=>p[0]))),y=Math.floor(Math.min(...world.map(p=>p[1]))),width=Math.ceil(Math.max(...world.map(p=>p[0])))-x,height=Math.ceil(Math.max(...world.map(p=>p[1])))-y;
 return{id,crop:[x,y,width,height],outline:world.map(([a,b])=>[a-x,b-y]),anchor:[x,y],pivot:[0,0],tracks:{},materialClass:'flexible-cable',motionBounds:[x-1,y-1,x+1,y+1],rig:{kind:'tether',start:[start[0]-x,start[1]-y],end:[end[0]-x,end[1]-y],pivot:[pivot[0]-x,pivot[1]-y],channel:control,maxAngle:.3}};
}
export function directHarbor(scene){
 scene.title='渡轮经过，吊臂收稳';scene.repairPlate='assets/scenes/Seattle/harbor-mechanisms-clean-plate-v3.png';
 const ferry=scene.objects[0];
 ferry.tracks.rotation=track([[0,0],[4,0],[7,-.018],[11,.012],[16,-.012],[22,.018],[28,-.009],[31,0],[36,0]]);
 Object.assign(scene.expression.channels,{
  portHoist:channel([[3,0],[7,.12],[11,.28],[16,.28],[21,.11],[27,0],[36,0]]),
  aftHoist:channel([[7,0],[12,.1],[17,.26],[22,.26],[28,.1],[32,0],[36,0]])
 });
 const boom={id:'cargo-forward-boom',crop:[774,315,47,28],pivot:[40,22],anchor:[814,337],outline:[[0,0],[5,1],[40,17],[44,20],[43,25],[37,25],[0,10]],tracks:{},poseChannels:{rotation:'portHoist'},materialClass:'rigid-shell',motionBounds:[813,336,815,338]};
 const aft={id:'cargo-aft-boom',crop:[824,337,36,24],pivot:[32,20],anchor:[856,357],outline:[[0,0],[8,2],[34,17],[34,23],[27,24],[9,16],[0,11]],tracks:{},poseChannels:{rotation:'aftHoist'},materialClass:'rigid-shell',motionBounds:[855,356,857,358]};
 const firstCable=cable('forward-hoist-cable',[803,292],[778,317],boom.anchor,'portHoist');
 const secondCable=cable('aft-hoist-cable',[850,314],[827,339],aft.anchor,'aftHoist');
 scene.objects=[ferry,firstCable,secondCable,boom,aft];
 scene.subjects=[
  {id:'crossing-ferry',label:'港湾小渡轮',root:ferry.id,parts:[ferry.id],actions:['accelerate','cross-harbor','respond-to-swell','pass-behind-cargo','clear-frame']},
  {id:'cargo-vessel',label:'货轮装卸机构',root:boom.id,parts:[boom.id,aft.id,firstCable.id,secondCable.id],actions:['forward-boom-elevates','aft-boom-follows','hoist-cables-reel','hold','lower-and-stow']}
 ];
 scene.subjectBeats=[
  {from:0,to:4,label:'货轮保持停泊，前吊臂开始抬起；渡轮准备驶离。',subjects:['cargo-vessel','crossing-ferry']},
  {from:4,to:16,label:'渡轮穿过港湾，两根吊臂先后抬起，拉索随端点收放。',subjects:['cargo-vessel','crossing-ferry']},
  {from:16,to:27,label:'前吊臂先回位，后吊臂继续保持；渡轮接近货轮后方。',subjects:['cargo-vessel','crossing-ferry']},
  {from:27,to:36,label:'渡轮被货轮遮住并驶离，后吊臂放回原位，水面余波逐渐消退。',subjects:['cargo-vessel','crossing-ferry']}
 ];
 scene.remaining=['Original crane/rigging footprints and repair plate need source-edge and full-speed visual acceptance. Reflection fragment reassembly from the plan remains to strengthen; current historical ferry contacts drive the water receiver.'];
}
