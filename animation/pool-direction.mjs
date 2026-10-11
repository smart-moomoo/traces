const track=points=>points.map(([time,value],i)=>{
 const a=points[i-1],b=points[i+1],u=a?(value-a[1])/(time-a[0]):0,v=b?(b[1]-value)/(b[0]-time):0;
 return {time,value,velocity:u*v>0?2*u*v/(u+v):0};
});
const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
export function directPoolLeaf(scene){
 scene.duration=34;scene.expression.duration=34;scene.title='枝头松开，静水接住一片叶子';
 scene.repairPlate='assets/scenes/Fort-Worth/crowns-clean-plate-v2.png';
 scene.regions=scene.regions.filter(r=>r.kind!=='foliage');
 Object.assign(scene.expression.channels,{
  wind:channel([[8,0],[13,.5],[18,.6],[24,.3],[30,0],[34,0]]),
  poolWest:channel([[2,0],[6,.9],[8,.4],[11,-.3],[16,.25],[23,0],[34,0]]),
  poolWestTip:channel([[3,0],[7,.7],[10,-.5],[14,.3],[20,0],[34,0]]),
  poolEast:channel([[4,0],[8,.8],[12,-.2],[17,.2],[24,0],[34,0]])
 });
 const first={id:'pool-west-crown',crop:[626,258,77,86],pivot:[40,86],anchor:[666,344],outline:[[9,2],[26,0],[28,12],[37,11],[42,0],[51,7],[63,4],[69,17],[76,27],[72,40],[77,52],[67,59],[63,75],[53,78],[47,86],[30,84],[21,77],[8,75],[2,63],[0,44],[5,29],[0,18]],matte:'vegetation',matteClose:1,tracks:{},materialClass:'articulated-shell',motionBounds:[665,343,667,345],rig:{kind:'stem',pin:'bottom',center:40,angle:.13,tipAngle:.065,channel:'poolWest',secondaryChannel:'poolWestTip'}};
 const second={id:'pool-east-crown',crop:[760,274,92,75],pivot:[41,75],anchor:[801,349],outline:[[8,7],[18,1],[29,5],[40,0],[47,9],[59,3],[68,8],[69,17],[84,19],[91,30],[85,45],[91,58],[81,65],[61,63],[50,74],[35,73],[25,64],[14,65],[4,56],[0,40],[6,30],[0,20]],matte:'vegetation',matteClose:1,tracks:{},materialClass:'articulated-shell',motionBounds:[800,348,802,350],rig:{kind:'stem',pin:'bottom',center:41,angle:-.14,channel:'poolEast'}};
 const leaf={id:'pool-falling-leaf',crop:[651,304,13,15],pivot:[6,7],anchor:[657,311],outline:[[1,4],[5,1],[9,0],[12,4],[11,10],[7,14],[3,11],[0,7]],repair:false,matte:'vegetation',materialClass:'projected-shell',projection:{axis:'x'},follows:{kind:'joint',actor:first.id,offset:[-9,-33],surface:true,releaseAt:7},motionBounds:[645,299,763,484],
 tracks:{x:track([[0,657],[7,657],[10,683],[13,666],[16,691],[20,710],[26,737],[34,756]]),y:track([[0,311],[7,311],[10,345],[13,388],[16,446],[20,450],[26,463],[34,478]]),rotation:track([[0,0],[7,0],[10,.75],[13,-.55],[16,.14],[20,-.12],[26,.08],[34,.08]]),pitch:track([[0,0],[7,0],[10,.75],[13,.2],[16,1.08],[18,1.18],[26,1.18],[34,1.18]])}};
 first.sourceHoles=[leaf.outline.map(([x,y])=>[x+leaf.crop[0],y+leaf.crop[1]])];
 scene.objects=[first,second,leaf];
 scene.contacts=[{object:leaf.id,time:16,offset:[0,0],strength:.75},{object:leaf.id,time:21,offset:[-3,0],strength:.23},{object:leaf.id,time:26,offset:[-3,0],strength:.12}];
 scene.subjects=[{id:'west-pool-tree',label:'池边左侧树冠',root:first.id,parts:[first.id],actions:['rooted-bend','release-leaf','rebound','settle']},{id:'east-pool-tree',label:'池边右侧树冠',root:second.id,parts:[second.id],actions:['delayed-bend','rebound','settle']},{id:'floating-leaf',label:'离枝落水叶片',root:leaf.id,parts:[leaf.id],actions:['follow-deformed-surface','release','tumble','land-on-water','flatten','drift-with-trailing-contact']}];
 scene.subjectBeats=[{from:0,to:7,label:'两处树冠先后弯下，叶片仍贴在弯曲的枝头。',subjects:scene.subjects.map(s=>s.id)},{from:7,to:16,label:'叶片离枝，在空中翻转；两处树冠回弹。',subjects:scene.subjects.map(s=>s.id)},{from:16,to:24,label:'叶片接触水面后展平，水纹从落点扩散，叶片继续漂移。',subjects:['floating-leaf']},{from:24,to:34,label:'叶片缓缓漂远，后续水纹减弱；雕塑与池岸始终固定。',subjects:['floating-leaf']}];
 scene.remaining=['Two source crown mattes and small leaf require source/material visual acceptance; verify continuous surface release, pool contact, later drift and whole-scene depth at display size.'];
}
