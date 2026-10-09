// Regions authored against the approved poster lower halves, not six-frame films.
// Coordinates are normalized to that art. These are working scene scores, never
// automatically accepted merely because they load or have a performance result.
const poly=(...points)=>points;
const region=(id,kind,points,anchor=[.5,.5],gain=1)=>({id,kind,points,anchor,gain});
const water=(id,points,anchor,gain=1)=>region(id,'water',points,anchor,gain);
const leaves=(id,points,anchor,gain=1)=>region(id,'foliage',points,anchor,gain);
const light=(id,points,gain=1)=>region(id,'light',points,[.5,.5],gain);
const rect=(x,y,w,h)=>poly([x,y],[x+w,y],[x+w,y+h],[x,y+h]);
const definitions=[
 ['Seattle','港湾的风与余波',36,[],['Material vessel passage, water response and reforming reflections.'],'seattle'],
 ['Bellevue','公园水面的相遇',28,[water('pool',poly([.09,.64],[.91,.7],[.65,.84],[.1,.8]),[.48,.73]),leaves('park-trees',rect(.08,.35,.82,.29),[.5,.63],.5)],['Duck passage must be extracted and connected to a water-contact event.'],'ripple'],
 ['San-Francisco','海峡里的阵风',32,[water('bay',poly([.07,.6],[.91,.62],[.86,.82],[.2,.85]),[.78,.66]),region('sail','cloth',poly([.84,.5],[.88,.65],[.81,.64]),[.85,.64],.65)],['Sail fills before vessel advances; original rigging and hull need layer extraction.'],'gust'],
 ['Stanford','树荫里的落叶',30,[leaves('left-canopy',poly([.05,.43],[.14,.38],[.33,.61],[.31,.75],[.08,.72]),[.16,.73]),leaves('right-canopy',poly([.83,.47],[.92,.45],[.93,.73],[.82,.73]),[.87,.73]),light('courtyard',rect(.14,.7,.73,.14),.8)],['A source leaf must detach, pass behind a branch and persist at rest.'],'leaf'],
 ['Mountain-View','风穿过潮汐',30,[water('tidal-channels',poly([.12,.54],[.91,.55],[.86,.68],[.46,.71],[.28,.65]),[.65,.62],.7),leaves('reeds',poly([.08,.48],[.2,.5],[.25,.64],[.76,.72],[.83,.82],[.12,.8]),[.46,.81],1.2)],['Gust reaches foreground reeds first, then the channels and distant grass.'],'gust'],
 ['Sunnyvale','云影经过长椅',32,[leaves('right-tree',poly([.57,.07],[.88,.05],[.93,.45],[.65,.5]),[.78,.56],.6),leaves('left-tree',rect(.1,.3,.16,.29),[.18,.61],.5),light('lawn',poly([.08,.6],[.9,.58],[.92,.84],[.12,.83]),1.2)],['Tree shadow crosses the grass and bench; trunks and bench remain immobile.'],'shadow'],
 ['San-Jose','盐与天光',30,[light('salt-pond',poly([.1,.42],[.9,.43],[.92,.73],[.51,.88],[.15,.7]),1.35)],['A light band traverses the salt colors and resolves; levees remain fixed.'],'glint'],
 ['Los-Gatos','湖心的一圈水纹',28,[water('lake',poly([.24,.42],[.86,.42],[.8,.78],[.35,.77]),[.56,.73]),leaves('left-branches',poly([.06,.08],[.37,.1],[.29,.68],[.12,.76]),[.12,.6],.45),leaves('right-branches',rect(.82,.17,.13,.58),[.87,.72],.4)],['Existing duck makes a contact; contact and concentric wave must share origin.'],'ripple'],
 ['Santa-Cruz','灯塔与海风',30,[region('flag','cloth',rect(.704,.235,.038,.135),[.705,.24],1.1),leaves('tree',poly([.12,.4],[.29,.32],[.33,.63],[.18,.67]),[.24,.69],.6),water('sea',rect(.8,.53,.13,.11),[.85,.6],.35)],['Flag gust and tree response share a directed wind envelope.'],'gust'],
 ['Los-Angeles','窗灯入夜',34,[light('windows',poly([.08,.41],[.91,.42],[.93,.67],[.09,.76]),1.1)],['Sky exposure falls gradually while existing window lights intensify sequentially.'],'dusk'],
 ['Santa-Monica','海风穿过街角',30,[leaves('palm-crowns',poly([.28,.08],[.43,.07],[.44,.23],[.61,.18],[.69,.02],[.84,.07],[.83,.28],[.61,.36],[.34,.31]),[.56,.4],.9),region('west-flag','cloth',rect(.257,.417,.046,.047),[.299,.436],.55),region('east-flag','cloth',rect(.53,.438,.042,.046),[.569,.457],.55),water('ocean',rect(.08,.433,.85,.076),[.48,.48],.4)],['One gust travels through flags, fronds and distant water; fixed trunks.'],'gust'],
 ['San-Diego','潮水写下弧线',32,[water('surf',poly([.08,.27],[.75,.32],[.58,.49],[.77,.69],[.59,.85],[.31,.76],[.08,.49]),[.66,.56],1.3)],['Crest follows the shore, breaks into material foam, then retreats.'],'surf'],
 ['Dallas','高楼上的一束光',30,[light('facades',poly([.09,.2],[.84,.22],[.91,.71],[.79,.84],[.13,.8]),1.15)],['Cloud shade traverses facades in one direction, catching warm edges in sequence.'],'shadow'],
 ['Fort-Worth','静水的一次回声',28,[water('pool',poly([.43,.46],[.9,.4],[.91,.81],[.49,.82]),[.68,.59]),leaves('garden',poly([.1,.16],[.4,.19],[.45,.37],[.8,.24],[.86,.39],[.29,.44]),[.49,.42],.35)],['Existing sculpture is immobile; a source leaf/water contact triggers a fixed ripple.'],'ripple'],
 ['Chicago','桥下的航迹',34,[water('river',poly([.1,.64],[.91,.64],[.91,.83],[.1,.81]),[.57,.7])],['Original river vessel needs clean separation and bridge occlusion, with trailing wake.'],'passage'],
 ['Champaign-Urbana','雪地上的树影',30,[leaves('autumn-left',poly([.06,.31],[.28,.36],[.31,.65],[.08,.68]),[.2,.67],.4),leaves('autumn-right',poly([.72,.21],[.92,.14],[.94,.62],[.73,.66]),[.83,.68],.6),light('snow',poly([.09,.64],[.9,.64],[.91,.84],[.13,.85]),.8)],['Existing autumn foliage and snow coexist; moving branches cast a continuous shadow.'],'shadow'],
 ['New-Orleans','橡树留下的叶子',34,[leaves('oak-crown',poly([.1,.19],[.23,.11],[.5,.06],[.73,.13],[.91,.3],[.87,.54],[.66,.6],[.42,.47],[.18,.56]),[.51,.63],.7),light('grass',rect(.14,.65,.74,.16),.8)],['Detached source leaf, branch/trunk occlusion, and final resting leaf are required.'],'leaf'],
 ['Wallace','围栏上的光',30,[leaves('oak-left',poly([.1,.14],[.41,.12],[.38,.36],[.12,.45]),[.24,.45],.4),leaves('oak-right',poly([.7,.08],[.92,.18],[.89,.48],[.76,.36]),[.83,.47],.4),light('gate-ground',poly([.12,.47],[.88,.46],[.9,.82],[.14,.86]),.9)],['Gate/fence remain rigid; tree shadows travel across their actual surfaces.'],'shadow'],
 ['Charleston','街道的斑驳午后',30,[leaves('canopy',poly([.14,.12],[.86,.15],[.94,.34],[.9,.49],[.48,.29],[.2,.33]),[.9,.43],.5),light('house-fronts',poly([.13,.35],[.82,.48],[.86,.82],[.15,.81]),1)],['Dappled light follows overhead leaves; no new foliage appears.'],'shadow'],
 ['Savannah','苔藓间的风',34,[leaves('moss-left',poly([.12,.12],[.4,.18],[.44,.44],[.2,.54]),[.29,.15],.8),leaves('moss-right',poly([.59,.1],[.9,.1],[.87,.55],[.6,.41]),[.73,.12],.9),light('avenue',poly([.45,.49],[.58,.49],[.84,.84],[.18,.84]),.9)],['Hanging moss needs attached mesh groups; its lower ends lag and settle.'],'gust'],
 ['Miami','石舟的倒影',30,[water('reflected-stone',poly([.06,.52],[.93,.52],[.9,.78],[.15,.83]),[.55,.61],1.1)],['Stone vessel stays anchored while a passing gust disturbs its reflected columns.'],'ripple'],
 ['Miami-Beach','堤岸旁的潮汐',32,[water('right-sea',poly([.7,.37],[.93,.39],[.94,.8],[.45,.83],[.34,.65]),[.48,.59],1.2),water('left-sea',poly([.09,.4],[.61,.4],[.3,.62],[.13,.78]),[.3,.57],.7)],['Two water regions share a swell; jetty occludes foam as the crest passes.'],'surf'],
 ['Everglades','水草之间',32,[water('pond',poly([.14,.63],[.89,.66],[.9,.84],[.15,.84]),[.43,.7],.75),leaves('reeds-left',poly([.08,.18],[.24,.1],[.29,.64],[.13,.67]),[.19,.64],.65),leaves('reeds-right',poly([.75,.17],[.88,.16],[.94,.68],[.79,.66]),[.86,.66],.55)],['Original alligator micro-motion needs a body rig/contact mask; no replacement animal.'],'ripple']
];

export const catalog=definitions.map(([id,title,duration,regions,remaining,mode])=>({
  id,title,duration,regions,mode,status:'authoring',source:`assets/posters/${id}.png`,
  crop:[0,768,1024,768],remaining,
  beats:[{role:'setup',start:0,end:4},{role:'change',start:4,end:duration-7},{role:'resolution',start:duration-7,end:duration}],
  score:{onset:4,peak:duration*.4,decay:duration-7,settle:duration,direction:[1,.15]},
  visualReview:'pending',memory:null,emotion:null,personalStory:null
}));

// A square leaf fragment from the original collage, with a declared paper
// repair and branch/trunk occlusion. These are authored source coordinates.
const oak=catalog.find(s=>s.id==='New-Orleans');
const keys=points=>points.map(([time,value],i)=>{
 const before=points[i-1],after=points[i+1];
 const a=before?(value-before[1])/(time-before[0]):0,b=after?(after[1]-value)/(after[0]-time):0;
 return {time,value,velocity:a*b>0?2*a*b/(a+b):0};
});
oak.objects=[{
 id:'falling-shell-leaf',crop:[242,38,22,23],pivot:[11,11],anchor:[253,49],
 outline:[[1,3],[18,0],[22,18],[18,22],[0,21]],repairSample:[208,32,30,31],repairPadding:4,
 occluders:[[[450,403],[468,405],[495,438],[518,397],[535,368],[551,358],[538,419],[527,461],[522,560],[542,603],[570,623],[537,628],[508,606],[479,619],[460,620],[487,583],[478,477]]],
 tracks:{x:keys([[0,253],[5,253],[9,305],[15,430],[20,501],[24,475],[29,582],[34,582]]),y:keys([[0,49],[5,49],[9,103],[15,270],[20,422],[24,526],[29,637],[34,637]]),rotation:keys([[0,0],[5,0],[9,.35],[15,-.45],[20,.3],[24,-.2],[29,.16],[34,.16]])}
}];
oak.remaining=['Review the source-fragment repair, branch occlusion and landing against the full playback; validate the leaf reads as part of the material tableau.'];

// Foreground silhouettes occlude the distant sea; the sea must not bend trunks,
// flags or the lifeguard tower merely because they overlap its rectangle.
const santa=catalog.find(s=>s.id==='Santa-Monica');
santa.regions.find(r=>r.id==='ocean').exclusions=[
 rect(.073,.433,.082,.076),rect(.397,.433,.018,.076),rect(.456,.433,.019,.076),
 rect(.602,.433,.024,.076),rect(.637,.433,.024,.076),rect(.731,.433,.027,.076),
 rect(.257,.433,.046,.031),rect(.53,.438,.042,.046)
];

// Region audit corrections: masks follow physical contact boundaries, and
// foreground structures are holes in water coverage, not water-coloured actors.
const normalize=points=>points.map(([x,y])=>[x/1024,y/768]);
const miami=catalog.find(s=>s.id==='Miami').regions[0];
miami.points=poly([.05,.552],[.18,.562],[.36,.571],[.60,.586],[.85,.59],[.91,.575],[.94,.61],[.9,.78],[.15,.83]);
miami.exclusions=[rect(.922,.43,.033,.18),rect(.121,.49,.026,.085),rect(.238,.49,.024,.09)];
const jetty=normalize([[570,275],[500,309],[458,329],[404,371],[339,423],[284,472],[229,515],[193,550],[135,594],[53,607],[44,540],[65,465],[110,422],[165,384],[229,361],[309,330],[385,310],[469,292]]);
for(const r of catalog.find(s=>s.id==='Miami-Beach').regions)r.exclusions=[jetty];
const sf=catalog.find(s=>s.id==='San-Francisco');
sf.regions[0].points=poly([.05,.636],[.94,.636],[.86,.82],[.2,.85]);
sf.regions[0].exclusions=[normalize([[836,511],[850,506],[880,406],[923,508],[927,520],[911,528],[852,527],[837,521]]),rect(.105,.615,.058,.032)];
sf.regions[1].points=poly([.861,.535],[.897,.662],[.855,.66]);sf.regions[1].anchor=[.86,.66];
sf.regions.push(region('jib','cloth',poly([.856,.565],[.853,.661],[.831,.661]),[.855,.66],.5));
const pool=catalog.find(s=>s.id==='Bellevue').regions[0];
pool.points=normalize([[90,505],[176,505],[263,528],[456,535],[638,567],[895,541],[893,566],[725,604],[530,644],[391,660],[230,620],[91,578]]);
pool.exclusions=[normalize([[480,548],[495,548],[508,557],[519,551],[529,551],[527,561],[518,568],[487,569],[481,563]])];
oak.regions.find(r=>r.id==='grass').points=rect(.14,.775,.74,.12);

const probes={
 'Miami':{fixed:[[.6,.56],[.94,.55]],moving:[[.55,.71],[.72,.73]]},
 'Miami-Beach':{fixed:[[.2,.6],[.3,.5]],moving:[[.7,.65],[.8,.72]]},
 'San-Francisco':{fixed:[[.55,.61],[.86,.68]],moving:[[.45,.74],[.6,.75]]},
 'Bellevue':{fixed:[[.62,.7],[.49,.73]],moving:[[.35,.78],[.51,.8]]}
};
for(const scene of catalog)if(probes[scene.id])scene.probes=probes[scene.id];

// Explicit photo/art boundaries verified against each original source. Remap
// existing authored regions in source space; never stretch the artwork.
const sourceStarts={'Charleston':841,'Santa-Cruz':771,'Everglades':776,'Mountain-View':735,'Los-Gatos':737,'Sunnyvale':742,'Santa-Monica':738,'Chicago':769,'Los-Angeles':769,'San-Diego':769,'San-Francisco':769,'Stanford':769};
for(const scene of catalog){
 const start=sourceStarts[scene.id];if(!start)continue;
 const height=1536-start,remap=([x,y])=>[x,(768+y*768-start)/height];
 scene.crop=[0,start,1024,height];
 if(scene.probes){scene.probes.fixed=scene.probes.fixed.map(remap);scene.probes.moving=scene.probes.moving.map(remap);}
 for(const r of scene.regions){r.points=r.points.map(remap);r.anchor=remap(r.anchor);if(r.exclusions)r.exclusions=r.exclusions.map(p=>p.map(remap));}
}

const directions={'Mountain-View':[0,-1],'Sunnyvale':[-1,.15],'Santa-Cruz':[-1,.5],'Santa-Monica':[1,-.3],'San-Jose':[1,.05],'Dallas':[1,.5],'Champaign-Urbana':[-1,-.2],'Charleston':[-.5,1],'Savannah':[0,-1]};
for(const scene of catalog)if(directions[scene.id])scene.score.direction=directions[scene.id];

const bellevue=catalog.find(s=>s.id==='Bellevue');
bellevue.title='离开池沿';
const duckTracks={x:keys([[0,505],[5,505],[12,480],[21,443],[28,443]]),y:keys([[0,565],[5,565],[12,576],[21,584],[28,584]])};
bellevue.objects=[
 {id:'duck-reflection',crop:[483,565,47,17],anchor:[505,565],pivot:[22,0],outline:[[3,0],[42,0],[44,6],[37,14],[8,16],[0,9]],repairSample:[430,565,47,17],tracks:duckTracks},
 {id:'pool-duck',crop:[478,548,53,19],anchor:[505,565],pivot:[27,17],outline:[[0,7],[4,5],[7,0],[13,0],[20,4],[19,11],[31,10],[38,9],[40,3],[45,0],[49,0],[53,3],[49,6],[47,13],[38,17],[27,19],[12,18],[8,15],[8,10]],repairSample:[425,548,53,19],tracks:duckTracks}
];
bellevue.contacts=[8,13,18].map((time,i)=>({object:'pool-duck',time,offset:[-5,3],strength:1-i*.15}));
bellevue.regions[0].exclusions=[];
bellevue.remaining=['Review the original duck and reflection cutouts, clean water repair and historical contact ripples in full playback.'];

// Separate sails, mast and hull share a world-space contact pivot. A small
// authored sail deformation precedes translation; no added character or zoom.
const sailboatTracks={x:keys([[0,880],[8,880],[16,848],[27,801],[32,801]]),y:keys([[0,523],[8,523],[16,528],[27,534],[32,534]])};
const part=(id,crop,outline,repairSample,tracks=sailboatTracks)=>({id,crop,outline,repairSample,anchor:[880,523],pivot:[880-crop[0],523-crop[1]],tracks});
sf.objects=[
 part('vessel-hull',[833,505,96,25],[[0,5],[16,6],[27,7],[48,8],[72,8],[94,6],[92,16],[81,21],[41,23],[14,18],[6,15]], [722,505,96,25]),
 part('main-sail',[879,406,44,102],[[1,0],[43,101],[0,98]],[728,406,44,102],{...sailboatTracks,scaleX:keys([[0,1],[5,1],[10,1.06],[17,1.035],[27,1],[32,1]])}),
 part('jib',[846,429,32,80],[[31,0],[29,78],[1,75]],[724,429,32,80],{...sailboatTracks,scaleX:keys([[0,1],[5,1],[11,1.07],[18,1.03],[27,1],[32,1]])}),
 part('mast',[878,405,3,113],[[0,0],[2,0],[3,112],[0,112]],[736,405,3,113])
];
sf.contacts=[10,16,22].map((time,i)=>({object:'vessel-hull',time,offset:[-31,2],strength:1-i*.1}));
sf.regions=sf.regions.filter(r=>r.kind!=='cloth');
sf.regions[0].exclusions=sf.regions[0].exclusions.slice(1);
sf.remaining=['Review separated sail edges and repaired shoreline, sail-fill timing, hull contact and final reflection/water consistency.'];
bellevue.probes.fixed=[[.62,.7],[.5,.66]];
// A vessel is now intentionally moving; protect the bridge and second vessel.
sf.probes.fixed=[[.55,(768+.61*768-sf.crop[1])/sf.crop[3]],[.13,(768+.64*768-sf.crop[1])/sf.crop[3]]];

sf.repairPlate='assets/scenes/San-Francisco/clean-plate-v1.png';

// Shore curves are traced in the final source crop. Water-only masks protect
// the rock faces; the wave measures distance from the actual coast, not screen y.
const sanDiego=catalog.find(s=>s.id==='San-Diego');
sanDiego.regions[0].points=poly([.08,.34],[.5,.34],[.56,.38],[.52,.43],[.57,.49],[.61,.55],[.7,.65],[.67,.7],[.6,.73],[.57,.8],[.34,.76],[.08,.49]);
sanDiego.surf={shore:[[.56,.38],[.52,.45],[.61,.55],[.7,.65],[.57,.8]],start:3,break:13,hold:17,end:30,reach:130,width:24};
sanDiego.probes={fixed:[[.83,.56],[.68,.5]],moving:[[.46,.51],[.55,.67]]};
sanDiego.remaining=['Review shore-following approach, textured break and withdrawal in full playback; confirm all rock silhouettes remain fixed.'];
const beach=catalog.find(s=>s.id==='Miami-Beach');
beach.surf={shore:[[.53,.38],[.38,.47],[.29,.56],[.21,.64],[.13,.77]],start:3,break:14,hold:18,end:31,reach:150,width:26};
beach.remaining=['Review incoming swell and withdrawal along the jetty, with source-texture highlights restricted to the water masks.'];

const stanford=catalog.find(s=>s.id==='Stanford');
stanford.objects=[{
 id:'courtyard-leaf',crop:[256,494,24,23],pivot:[12,11],anchor:[268,505],
 outline:[[1,6],[5,2],[10,5],[12,0],[17,3],[19,1],[23,7],[21,14],[17,16],[15,22],[9,20],[6,15],[2,13]],
 repairSample:[235,516,24,23],
 occluders:[[[461,427],[466,427],[468,571],[473,579],[470,587],[457,587],[455,580],[461,571]]],
 tracks:{x:keys([[0,268],[5,268],[10,319],[15,392],[19,464],[24,500],[30,500]]),
 y:keys([[0,505],[5,505],[10,526],[15,549],[19,577],[24,626],[30,626]]),
 rotation:keys([[0,0],[5,0],[10,.4],[15,-.35],[19,.25],[24,.12],[30,.12]])}
}];
stanford.remaining=['Review the source leaf removal, lamp-post occlusion and persistent landing through complete playback.'];
// The reflecting pool starts at the far bank, below the lawn and white tree.
const fort=catalog.find(s=>s.id==='Fort-Worth');
fort.regions.find(r=>r.id==='pool').points=poly([.45,.55],[.9,.50],[.91,.81],[.49,.82]);
fort.probes={fixed:[[.52,.46],[.32,.7]],moving:[[.65,.65],[.81,.72]]};

// Moss is hung from individual branches. Narrow strand groups replace broad
// canopy displacement; their attachment remains fixed while the tips lag.
const savannah=catalog.find(s=>s.id==='Savannah');
savannah.regions=savannah.regions.filter(r=>r.kind!=='foliage');
savannah.regions.push(
 region('left-high-moss','moss',poly([.286,.25],[.333,.257],[.332,.352],[.292,.35]),[.31,.25],.85),
 region('left-low-moss','moss',poly([.324,.384],[.372,.393],[.367,.501],[.335,.492]),[.346,.385],.9),
 region('right-high-moss','moss',poly([.665,.168],[.698,.177],[.7,.292],[.671,.287]),[.681,.168],.8),
 region('right-low-moss','moss',poly([.638,.358],[.681,.364],[.686,.46],[.647,.456]),[.66,.358],.8)
);
savannah.remaining=['Review four attached moss groups at source scale; pale-strand masking and tip lag now replace whole-canopy movement.'];

const autumn=catalog.find(s=>s.id==='Champaign-Urbana');
for(const r of autumn.regions.filter(r=>r.kind==='foliage'))r.palette='warm';
autumn.regions.find(r=>r.id==='autumn-left').exclusions=[poly([.116,.56],[.138,.555],[.153,.669],[.116,.674])];
autumn.regions.find(r=>r.id==='autumn-right').exclusions=[poly([.801,.48],[.829,.48],[.841,.69],[.804,.69])];
autumn.remaining=['Warm leaf selection now includes orange material and excludes the two foreground trunks; review shadow movement and whole-scene pacing.'];
const reeds=catalog.find(s=>s.id==='Mountain-View');
reeds.regions.find(r=>r.id==='reeds').palette='warm';

const chicago=catalog.find(s=>s.id==='Chicago');
chicago.objects=[{
 id:'river-launch',crop:[426,505,50,51],pivot:[25,48],anchor:[451,553],
 outline:[[22,0],[25,0],[26,8],[33,9],[38,14],[39,26],[46,27],[49,44],[42,48],[24,51],[2,45],[0,32],[4,27],[11,27],[12,13],[18,9],[21,8]],
 repairSample:[497,571,50,51],
 occluders:[[[364,450],[568,450],[568,514],[364,514]]],
 tracks:{x:keys([[0,451],[4,451],[12,451],[24,449],[34,449]]),y:keys([[0,498],[4,498],[12,523],[24,568],[34,568]])}
}];
chicago.contacts=[{object:'river-launch',time:12,offset:[0,0],strength:.7},{object:'river-launch',time:17,offset:[0,0],strength:.9},{object:'river-launch',time:22,offset:[0,0],strength:.7}];
chicago.regions[0].exclusions=[rect(.06,.64,.105,.085),rect(.18,.62,.135,.105),rect(.645,.655,.19,.088),rect(.47,.655,.032,.03),rect(.359,.64,.22,.033)];
chicago.remaining=['Review the launch emerging below the bridge, original-water repair and unchanged moored vessels; confirm the bounded constant-scale passage remains natural.'];

// Project original canopy texture onto the authored receiver regions. The
// geometry/colour of buildings, benches and paving remains the source artwork.
const shadowStudies={
 Sunnyvale:[{source:[.58,.1,.29,.34],target:[.3,.59,.58,.24]}],
 Wallace:[{source:[.1,.14,.3,.3],target:[.12,.49,.43,.3]},{source:[.7,.1,.21,.32],target:[.56,.5,.32,.28]}],
 Charleston:[{source:[.15,.02,.68,.25],target:[.18,.36,.64,.43]}],
 'Champaign-Urbana':[{source:[.07,.34,.22,.27],target:[.13,.67,.31,.15],warm:true},{source:[.71,.23,.22,.38],target:[.52,.68,.37,.14],warm:true}],
 'New-Orleans':[{source:[.14,.1,.66,.36],target:[.22,.78,.59,.11]}],
 Stanford:[{source:[.07,.42,.27,.3],target:[.16,.73,.45,.09]}]
};
for(const [id,shadows] of Object.entries(shadowStudies))catalog.find(s=>s.id===id).shadows=shadows;

const gatos=catalog.find(s=>s.id==='Los-Gatos');
const duckPath={x:keys([[0,284],[5,284],[11,298],[19,324],[28,324]]),y:keys([[0,542],[5,542],[11,543],[19,545],[28,545]])};
gatos.objects=[
 {id:'lake-duck-reflection',crop:[256,542,54,25],pivot:[28,0],anchor:[284,542],outline:[[3,0],[47,0],[47,22],[32,25],[28,14],[10,10],[0,7]],repairSample:[330,550,54,25],tracks:duckPath},
 {id:'lake-duck',crop:[256,519,54,25],pivot:[28,23],anchor:[284,542],outline:[[0,11],[9,13],[20,10],[35,10],[35,4],[39,0],[46,0],[49,5],[54,7],[52,10],[47,9],[47,16],[44,22],[30,25],[12,22],[5,18]],repairSample:[330,522,54,25],tracks:duckPath}
];
gatos.contacts=[{object:'lake-duck',time:7,offset:[-13,0],strength:.65},{object:'lake-duck',time:12,offset:[-13,0],strength:.8},{object:'lake-duck',time:17,offset:[-13,0],strength:.6}];
gatos.regions.push(water('duck-channel',rect(.25,.64,.16,.1),[.28,.68],.7));
gatos.regions.find(r=>r.id==='lake').exclusions=[rect(.455,.72,.086,.06),rect(.712,.69,.038,.052)];
gatos.remaining=['Review the swimming duck and authored reflection together, repaired water and persistent shore duck; no new animal introduced.'];

fort.objects=[{
 id:'pond-leaf',crop:[651,304,13,15],pivot:[6,7],anchor:[657,311],
 outline:[[1,4],[5,1],[9,0],[12,4],[11,10],[7,14],[3,11],[0,7]],repairSample:[640,317,13,15],
 tracks:{x:keys([[0,657],[5,657],[9,666],[13,678],[19,685],[28,685]]),y:keys([[0,311],[5,311],[9,373],[13,460],[19,463],[28,463]]),rotation:keys([[0,0],[5,0],[9,.5],[13,-.2],[19,.05],[28,.05]])}
}];
fort.contacts=[{object:'pond-leaf',time:13,offset:[0,1],strength:1.2}];
fort.remaining=['Review the original leaf landing on the pool, its persistent floating position and one fixed impact ring; sculpture, far lawn and tree must stay stable.'];

const everglades=catalog.find(s=>s.id==='Everglades');
everglades.regions.push(region('resting-torso','body',poly([.32,.448],[.51,.467],[.61,.498],[.58,.54],[.47,.564],[.37,.546],[.31,.51]),[.45,.564],.8));
everglades.remaining=['Review two restrained torso breaths within the source silhouette; skull, feet and tail stay fixed while the reed breeze settles.'];

// Explicitly reviewed demo set. New scenes stay in authoring until separately reviewed.
const reviewedIds=new Set(["Seattle", "Bellevue", "San-Francisco", "Stanford", "Mountain-View", "Sunnyvale", "Los-Gatos", "Santa-Cruz", "Los-Angeles", "Santa-Monica", "San-Diego", "Dallas", "Fort-Worth", "Chicago", "Champaign-Urbana", "New-Orleans", "Wallace", "Charleston", "Savannah", "San-Jose", "Miami", "Miami-Beach", "Everglades"]);
for(const scene of catalog)if(reviewedIds.has(scene.id)){scene.status="reviewed";scene.visualReview="accepted-for-demo";scene.remaining=[];}
