const track=points=>points.map(([time,value],i)=>{
 const a=points[i-1],b=points[i+1],u=a?(value-a[1])/(time-a[0]):0,v=b?(b[1]-value)/(b[0]-time):0;
 return {time,value,velocity:u*v>0?2*u*v/(u+v):0};
});
export function directObservatory(scene){
 scene.title='穹顶打开，望远镜停稳';
 scene.duration=34;scene.expression.duration=34;
 scene.repairPlate='assets/scenes/Los-Angeles/interiors-clean-plate-v2.png';
 const shutter={id:'east-observatory-shutter',crop:[784,179,34,79],pivot:[17,79],anchor:[801,258],
  outline:[[16,0],[33,0],[34,26],[34,79],[0,79],[0,34],[5,17]],
  tracks:{y:track([[0,258],[3,258],[6,244],[10,203],[13,183],[21,183],[25,204],[30,253],[32,258],[34,258]])},
  materialClass:'rigid-shell',motionBounds:[800,182,802,259]};
 shutter.clipPolygon=shutter.outline.map(([x,y])=>[x+shutter.crop[0],y+shutter.crop[1]]);
 const telescope={id:'west-telescope-truss',crop:[198,295,36,51],pivot:[16,39],anchor:[214,334],
  outline:[[0,0],[18,2],[30,11],[35,33],[34,49],[8,51],[0,43],[4,31],[7,17]],matte:'mechanical-gold',
  clipPolygon:[[197,294],[215,294],[231,306],[234,347],[199,347]],
  tracks:{rotation:track([[0,0],[9,0],[13,-.14],[16,-.22],[20,-.22],[23,-.12],[26,.05],[29,0],[34,0]])},
  materialClass:'rigid-shell',motionBounds:[213,333,215,335]};
 scene.objects=[shutter,telescope];scene.contacts=[];
 scene.subjects=[
  {id:'east-dome-shutter',label:'东穹顶活动盖板',root:shutter.id,parts:[shutter.id],actions:['unlock-hold','retract-into-housing','open-hold','return-to-seal']},
  {id:'west-telescope',label:'西穹顶望远镜机构',root:telescope.id,parts:[telescope.id],actions:['wait','elevate-about-mount','hold-observing-angle','lower','settle']}
 ];
 scene.subjectBeats=[
  {from:0,to:3,label:'盖板和望远镜保持原画位置。',subjects:scene.subjects.map(s=>s.id)},
  {from:3,to:13,label:'东穹顶盖板逐渐退入外壳，露出观测口；西侧望远镜开始调整。',subjects:scene.subjects.map(s=>s.id)},
  {from:13,to:21,label:'观测口保持打开，望远镜抬起后停稳。',subjects:scene.subjects.map(s=>s.id)},
  {from:21,to:32,label:'望远镜缓缓回位，盖板沿原来的导轨闭合。',subjects:scene.subjects.map(s=>s.id)},
  {from:32,to:34,label:'机械部件停稳，建筑和原有访客保持不动。',subjects:scene.subjects.map(s=>s.id)}
 ];
 scene.probes={fixed:[[.56,.36],[.73,.65]],moving:[[.785,.27],[.209,.42]]};
 scene.remaining=['Fixed aperture geometry, telescope extraction, hidden interior repair and full-speed mechanical staging require visual acceptance. No dome or building is deformed; original visitors stay fixed.'];
}
