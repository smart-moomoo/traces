import {directStoneWater} from './material-swell.mjs?v=2-stone-protection';
import {directRiver} from './river-direction.mjs?v=2-truss-matte';
import {directHarbor} from './harbor-direction.mjs?v=3-complete-arms';
import {directObservatory} from './observatory-direction.mjs?v=2-gold-matte';
import {directPoolLeaf} from './pool-direction.mjs';
import {directSaltAssembly} from './salt-direction.mjs';
import {directParkCanopy,directStreetCanopy} from './park-street-direction.mjs';
import {catalog} from './catalog.mjs';
import {directBayDuet,directLakeTrio,directParkPair} from './subject-direction.mjs';
import {directCoastalFlags} from './cloth-direction.mjs';
import {directWetland} from './wetland-direction.mjs';
import {directArboreal,directAutumn} from './arboreal-direction.mjs?v=2-surface-release';
import {directCoastalPalms,directChannelPassage} from './coastal-subjects.mjs';
import {directReeds} from './reed-direction.mjs';
import {directMoss,directGateCanopy} from './canopy-direction.mjs';

// Version 2 is explicit and local until all production gates have passed.
// Previous demo acceptance is never inherited by the new scene definitions.
export const expressiveCatalog=structuredClone(catalog).map(scene=>({
 ...scene,version:2,status:'source-audit',visualReview:'pending',
 remaining:['Source reconstruction, rig, interaction and full-speed visual review pending.'],
 gates:{source:'pending',rig:'pending',interaction:'pending',artwork:'pending',runtime:'pending'}
}));
const keyframes=points=>points.map(([time,value],i)=>{
 const a=points[i-1],b=points[i+1],v0=a?(value-a[1])/(time-a[0]):0,v1=b?(b[1]-value)/(b[0]-time):0;
 return {time,value,velocity:v0*v1>0?2*v0*v1/(v0+v1):0};
});
const seattle=expressiveCatalog.find(s=>s.id==='Seattle');
seattle.mode='ripple';
seattle.repairPlate='assets/scenes/Seattle/ferry-clean-plate-v2.png';
seattle.regions=[{id:'harbor',kind:'water',gain:1,anchor:[.5,.69],points:[[.05,.612],[.94,.61],[.94,.77],[.81,.87],[.55,.86],[.31,.80],[.08,.75]],exclusions:[[[.63,.60],[.95,.60],[.945,.69],[.645,.695]]]}];
seattle.objects=[{
 id:'harbor-ferry',crop:[106,439,109,34],anchor:[160,470],pivot:[54,31],
 outline:[[1,19],[7,16],[7,12],[18,10],[18,2],[21,2],[21,10],[31,9],[32,3],[35,1],[38,4],[36,9],[51,10],[55,7],[59,8],[61,12],[68,9],[75,8],[78,11],[95,12],[100,16],[108,20],[106,27],[102,32],[19,33],[12,30],[7,26],[1,26]],
 repairSample:[260,439,109,34],
 occluders:[[[640,395],[675,378],[738,377],[820,393],[891,415],[974,449],[964,514],[860,535],[685,535],[657,527],[650,451]]],
 tracks:{x:keyframes([[0,160],[4,160],[11,285],[24,575],[31,721],[36,721]]),y:keyframes([[0,470],[4,470],[11,475],[24,484],[31,487],[36,487]])}
}];
seattle.contacts=[{object:'harbor-ferry',time:13,offset:[-35,0],strength:.65},{object:'harbor-ferry',time:20,offset:[-35,0],strength:1},{object:'harbor-ferry',time:26,offset:[-35,0],strength:.85}];
const chicago=expressiveCatalog.find(s=>s.id==='Chicago');
chicago.objects[0].tracks={
 x:keyframes([[0,451],[4,451],[13,449],[25,443],[30,440],[34,440]]),
 y:keyframes([[0,553],[4,553],[13,570],[25,600],[30,612],[34,612]])
};
chicago.contacts=[{object:'river-launch',time:10,offset:[0,-20],strength:.6},{object:'river-launch',time:18,offset:[0,-20],strength:.9},{object:'river-launch',time:25,offset:[0,-20],strength:.6}];
const bellevue=expressiveCatalog.find(s=>s.id==='Bellevue');
bellevue.repairPlate='assets/scenes/Bellevue/duck-clean-plate-v2.png';
bellevue.contacts=[10,15,20].map(time=>({object:'pool-duck',time,offset:[12,2],strength:.7}));
const duck=bellevue.objects.find(o=>o.id==='pool-duck');
duck.outline=[[14,9],[23,7],[32,10],[37,8],[39,3],[43,1],[46,1],[48,3],[45,5],[43,10],[39,15],[29,18],[13,18],[9,15],[8,11]];
bellevue.objects.find(o=>o.id==='duck-reflection').matte='warm-reflection';
duck.tracks={x:keyframes([[0,505],[8,505],[14,483],[22,445],[28,438]]),y:keyframes([[0,565],[8,565],[14,576],[22,584],[28,584]])};
bellevue.objects.push({
 id:'duck-head',crop:[479,548,18,17],anchor:[492,560],pivot:[13,12],
 outline:[[0,7],[3,5],[6,0],[12,0],[17,4],[16,10],[13,14],[11,17],[7,16],[7,10],[3,9],[0,9]],
 repairSample:[430,548,18,17],follows:{kind:'joint',actor:'pool-duck',offset:[-13,-5]},
 motionBounds:[420,548,495,587],
 tracks:{rotation:keyframes([[0,0],[3,0],[5,-.55],[6,-.55],[8,0],[13,-.1],[17,0],[28,0]])}
});
const sf=expressiveCatalog.find(s=>s.id==='San-Francisco');
sf.expression={duration:sf.duration,channels:{
 sailPressure:{initial:0,keys:[{time:4,value:0},{time:8,value:.85},{time:11,value:.5},{time:15,value:1},{time:21,value:.65},{time:27,value:0},{time:32,value:0}]},
 jibPressure:{initial:0,keys:[{time:4.7,value:0},{time:8.7,value:.7},{time:11.7,value:.4},{time:15.7,value:.9},{time:21.7,value:.5},{time:27.7,value:0},{time:32,value:0}]}
}};
for(const object of sf.objects){
 delete object.tracks.scaleX;
 // Traced against the source crop, not the old approximate sail polygons.
 // The previous jib/mast masks included visible background strips.
 if(object.id==='main-sail'){
  object.crop=[879,411,43,94];object.outline=[[5,0],[42,93],[0,93]];
  object.rig={kind:'cloth',pin:'left',amplitude:7,lift:-1,channel:'sailPressure'};
 }
 if(object.id==='jib'){
  object.crop=[850,434,30,69];object.outline=[[29,0],[25,12],[24,68],[4,66]];
  object.rig={kind:'cloth',pin:'right',amplitude:-4,lift:-.5,channel:'jibPressure'};
 }
 if(object.id==='mast'){object.crop=[879,400,7,115];object.outline=[[4,0],[6,0],[3,114],[0,114]];}
 object.pivot=[object.anchor[0]-object.crop[0],object.anchor[1]-object.crop[1]];
}

// Bounds are scene-space anchor limits, distinct from the full swept silhouette.
const bounds={
 Seattle:[159,469,722,489],
 'San-Francisco':[795,520,882,536],Bellevue:[435,560,508,587],
 'Los-Gatos':[282,540,327,548],Stanford:[265,502,503,629],
 'New-Orleans':[250,46,585,640],'Fort-Worth':[654,308,688,466],
 Chicago:[438,552,453,613]
};
for(const scene of expressiveCatalog)for(const actor of scene.objects||[]){
 actor.materialClass=actor.rig?'pinned-cloth':actor.id.includes('reflection')?'receiver-texture':'rigid-shell';
 actor.motionBounds||=bounds[scene.id];
}
for(const [id,reflection,actor] of [['Bellevue','duck-reflection','pool-duck'],['Los-Gatos','lake-duck-reflection','lake-duck']]){
 const scene=expressiveCatalog.find(s=>s.id===id);
 scene.objects.find(o=>o.id===reflection).follows={actor,offset:[0,0]};
}

// Authored forcing scores: secondary motion follows a changing wind pressure,
// with a recovery interval instead of an uninterrupted oscillator. Timings are
// scene-specific; this does not imply the corresponding visual gates have passed.
const forcing={
 Seattle:[[4,0],[10,.25],[18,.8],[25,.5],[32,0]],
 Bellevue:[[4,0],[9,.4],[16,.65],[22,.15],[27,0]],
 'San-Francisco':[[4,0],[8,.85],[11,.45],[15,1],[22,.6],[28,0]],
 Stanford:[[3,0],[5,.65],[8,.15],[11,.5],[18,.1],[26,0]],
 'Mountain-View':[[3,0],[8,.9],[12,.5],[17,1],[24,.1],[29,0]],
 Sunnyvale:[[3,0],[9,.65],[14,.2],[19,.8],[26,.15],[31,0]],
 'San-Jose':[[3,0],[9,.3],[15,.8],[22,.3],[28,0]],
 'Los-Gatos':[[4,0],[9,.45],[16,.7],[22,.2],[27,0]],
 'Santa-Cruz':[[3,0],[8,1],[11,.3],[16,.8],[23,.15],[29,0]],
 'Los-Angeles':[[3,0],[11,.3],[21,.55],[30,0]],
 'Santa-Monica':[[3,0],[7,.8],[12,.3],[17,1],[24,.15],[29,0]],
 'San-Diego':[[3,0],[10,.8],[15,1],[23,.3],[31,0]],
 Dallas:[[3,0],[9,.35],[17,.9],[24,.2],[29,0]],
 'Fort-Worth':[[3,0],[6,.6],[10,.2],[15,.5],[23,0]],
 Chicago:[[4,0],[12,.3],[21,.6],[29,.1],[33,0]],
 'Champaign-Urbana':[[3,0],[7,.7],[11,.15],[16,.8],[23,.1],[29,0]],
 'New-Orleans':[[3,0],[5,.7],[9,.2],[13,.85],[19,.25],[29,0]],
 Wallace:[[3,0],[8,.7],[13,.2],[19,.6],[25,.1],[29,0]],
 Charleston:[[3,0],[8,.4],[14,.85],[20,.3],[26,.1],[29,0]],
 Savannah:[[3,0],[9,.9],[13,.3],[18,.75],[25,.2],[33,0]],
 Miami:[[3,0],[10,.8],[16,.35],[21,.6],[29,0]],
 'Miami-Beach':[[3,0],[10,.7],[16,1],[23,.3],[31,0]],
 Everglades:[[3,0],[8,.6],[12,.15],[18,.55],[25,.1],[31,0]]
};
for(const scene of expressiveCatalog){
 const keys=forcing[scene.id].map(([time,value])=>({time,value}));
 if(keys.at(-1).time<scene.duration)keys.push({time:scene.duration,value:0});
 scene.expression||={duration:scene.duration,channels:{}};
 scene.expression.channels.wind={initial:0,keys};
 scene.expression.channels.lightPosition={initial:-.3,keys:[{time:3,value:-.3},{time:scene.duration*.42,value:.35},{time:scene.duration*.77,value:.8},{time:scene.duration,value:1.3}]};
}

directBayDuet(sf);
directLakeTrio(expressiveCatalog.find(s=>s.id==='Los-Gatos'));
directParkPair(bellevue);
for(const id of ['Santa-Monica','Santa-Cruz'])directCoastalFlags(expressiveCatalog.find(s=>s.id===id));
directWetland(expressiveCatalog.find(s=>s.id==='Everglades'));
for(const id of ['New-Orleans','Stanford'])directArboreal(expressiveCatalog.find(s=>s.id===id));
directAutumn(expressiveCatalog.find(s=>s.id==='Champaign-Urbana'));
directCoastalPalms(expressiveCatalog.find(s=>s.id==='San-Diego'));
directChannelPassage(expressiveCatalog.find(s=>s.id==='Miami-Beach'));
directReeds(expressiveCatalog.find(s=>s.id==='Mountain-View'));
directMoss(expressiveCatalog.find(s=>s.id==='Savannah'));
directGateCanopy(expressiveCatalog.find(s=>s.id==='Wallace'));

directParkCanopy(expressiveCatalog.find(s=>s.id==='Sunnyvale'));
directStreetCanopy(expressiveCatalog.find(s=>s.id==='Charleston'));

directSaltAssembly(expressiveCatalog.find(s=>s.id==='San-Jose'));

directPoolLeaf(expressiveCatalog.find(s=>s.id==='Fort-Worth'));

directObservatory(expressiveCatalog.find(s=>s.id==='Los-Angeles'));

directHarbor(expressiveCatalog.find(s=>s.id==='Seattle'));

directRiver(expressiveCatalog.find(s=>s.id==='Chicago'));

directStoneWater(expressiveCatalog.find(s=>s.id==='Miami'));
