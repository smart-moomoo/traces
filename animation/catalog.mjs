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

// Explicit photo/art boundaries verified against each original source. Remap
// existing authored regions in source space; never stretch the artwork.
const sourceStarts={'Charleston':841,'Santa-Cruz':771,'Everglades':776,'Mountain-View':735,'Los-Gatos':737,'Sunnyvale':742,'Santa-Monica':738,'Chicago':769,'Los-Angeles':769,'San-Diego':769,'San-Francisco':769,'Stanford':769};
for(const scene of catalog){
 const start=sourceStarts[scene.id];if(!start)continue;
 const height=1536-start,remap=([x,y])=>[x,(768+y*768-start)/height];
 scene.crop=[0,start,1024,height];
 for(const r of scene.regions){r.points=r.points.map(remap);r.anchor=remap(r.anchor);if(r.exclusions)r.exclusions=r.exclusions.map(p=>p.map(remap));}
}
