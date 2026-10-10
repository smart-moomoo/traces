const channel=points=>({initial:0,keys:points.map(([time,value])=>({time,value}))});
const part=(id,crop,anchor,outline,rig)=>({id,crop,anchor,pivot:[anchor[0]-crop[0],anchor[1]-crop[1]],outline,rig,tracks:{},materialClass:'articulated-shell',motionBounds:[anchor[0]-.01,anchor[1]-.01,anchor[0]+.01,anchor[1]+.01]});

export function directWetland(scene){
 scene.title='岸边的一次舒展';
 scene.repairPlate='assets/scenes/Everglades/animal-leaves-clean-plate-v3.png';
 scene.regions=scene.regions.filter(r=>r.kind!=='body');
 scene.objects=[
  part('alligator-head',[208,330,139,80],[347,377],[[139,13],[126,11],[111,10],[99,4],[76,2],[69,0],[59,3],[56,10],[43,9],[30,10],[13,10],[3,14],[0,23],[4,34],[17,42],[31,48],[43,57],[64,65],[90,74],[114,71],[135,60]],
   {kind:'spine',pin:'right',channel:'headLift',angle:-.15,center:.59}),
  part('alligator-tail',[683,357,180,103],[683,387],[[0,16],[22,14],[45,11],[68,10],[91,11],[119,18],[135,28],[149,41],[163,55],[173,72],[176,87],[171,101],[160,99],[151,89],[149,78],[140,66],[125,60],[106,55],[90,53],[66,51],[43,52],[23,53],[0,60]],
   {kind:'spine',pin:'left',channel:'tailSweep',angle:.18,center:.3}),
  part('near-lotus-leaf',[470,505,92,38],[515,538],[[0,18],[12,15],[15,7],[29,4],[40,10],[47,1],[54,6],[67,5],[74,13],[90,14],[88,23],[75,28],[59,30],[45,32],[28,28],[13,27],[3,22]],
   {kind:'blade',pin:'bottom',channel:'nearLeafCup',amplitude:-12,lift:5}),
  part('far-lotus-leaf',[573,534,81,39],[615,569],[[0,18],[10,15],[17,10],[29,8],[37,1],[49,7],[58,14],[77,17],[79,23],[68,30],[48,34],[29,32],[15,27],[3,23]],
   {kind:'blade',pin:'bottom',channel:'farLeafCup',amplitude:-10,lift:6})
 ];
 const tail=scene.objects.find(o=>o.id==='alligator-tail');
 tail.outline=[[683,373],[706,370],[709,367],[714,366],[718,370],[725,367],[731,364],[735,365],[737,368],[742,364],[750,362],[754,366],[759,367],[763,363],[771,362],[775,364],[775,368],[781,365],[788,362],[795,364],[796,368],[801,365],[807,365],[813,369],[815,374],[820,373],[826,378],[829,384],[836,383],[842,392],[842,397],[848,405],[851,410],[854,416],[854,424],[861,431],[862,443],[855,450],[849,451],[844,451],[835,451],[815,446],[807,439],[800,427],[786,421],[770,420],[755,424],[741,417],[710,421],[683,430]].map(([x,y])=>[x-683,y-357]);
 tail.sourceExclusions=[[[733,429],[741,424],[752,428],[763,433],[777,434],[783,439],[777,445],[761,448],[745,446],[736,441]]];
 tail.occluders=tail.sourceExclusions;
 // Each root seam is kept fixed by the deformation, not hidden by a moving
 // rectangle. The source body, planted feet and stems are never extracted.
 scene.subjects=[
  {id:'resting-alligator',label:'岸边鳄鱼',root:'alligator-head',parts:['alligator-head','alligator-tail'],actions:['raise-head','hold-attention','sweep-tail','lower-head','rest']},
  {id:'near-lotus',label:'近处莲叶',root:'near-lotus-leaf',parts:['near-lotus-leaf'],actions:['cup-blade','unfurl','settle']},
  {id:'far-lotus',label:'远处莲叶',root:'far-lotus-leaf',parts:['far-lotus-leaf'],actions:['delayed-cup','unfurl','settle']}
 ];
 Object.assign(scene.expression.channels,{
  headLift:channel([[3,0],[7,1],[12,1],[16,.65],[23,0],[32,0]]),
  tailSweep:channel([[5,0],[10,.9],[14,-.45],[18,.35],[24,0],[32,0]]),
  nearLeafCup:channel([[3,0],[7,.8],[11,.2],[16,1],[20,.3],[26,0],[32,0]]),
  farLeafCup:channel([[4.5,0],[8.5,.65],[12.5,.2],[17.5,.85],[21.5,.2],[28,0],[32,0]])
 });
 scene.subjectBeats=[
  {from:0,to:7,label:'莲叶从茎端卷起，岸边鳄鱼缓缓抬头。',subjects:['near-lotus','resting-alligator']},
  {from:7,to:14,label:'鳄鱼保持抬头，尾端扫过后回收；另一片莲叶随后舒展。',subjects:['resting-alligator','far-lotus']},
  {from:14,to:23,label:'尾巴回稳，头部逐渐放低，两片莲叶错开收拢。',subjects:['resting-alligator','near-lotus','far-lotus']},
  {from:23,to:32,label:'鳄鱼重新伏在岸边，叶面放平，回到安静。',subjects:['resting-alligator','near-lotus','far-lotus']}
 ];
 // The tail remains on the bank: no invented splash or impact event.
 scene.contacts=[];
 scene.remaining=['New head/tail source seams and leaf stem attachments need full visual review; this is not a passed scene.'];
}
