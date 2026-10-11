// Source silhouettes are repaired independently. The former all-in-one
// triangular erase footprint also erased intact hills/water between the sails.
export function refineBaySource(scene){
 const byId=id=>scene.objects.find(o=>o.id===id);
 const shape=(id,crop,outline)=>{const o=byId(id);o.crop=crop;o.outline=outline;o.pivot=[o.anchor[0]-crop[0],o.anchor[1]-crop[1]];delete o.eraseOutline;delete o.repair;o.eraseDilation=1.5;};
 shape('vessel-hull',[833,505,96,25],[[0,5],[23,5],[37,4],[48,4],[53,6],[61,6],[63,9],[76,9],[92,7],[90,12],[82,19],[66,21],[22,19],[8,18],[4,15]]);
 shape('main-sail',[878,411,45,95],[[6,0],[9,8],[18,29],[29,59],[44,94],[0,94],[3,82],[5,71],[4,64],[5,39],[5,18]]);
 shape('jib',[852,430,29,76],[[28,0],[26,11],[24,21],[23,48],[23,74],[1,74],[2,68],[9,52],[17,34],[23,20],[26,8]]);
 shape('mast',[881,403,4,112],[[1,0],[3,1],[2,50],[2,105],[0,112],[0,40]]);
 shape('far-hull',[112,480,50,14],[[0,1],[3,1],[5,4],[13,4],[13,2],[17,2],[18,0],[23,0],[23,2],[28,2],[31,4],[47,4],[48,5],[46,9],[41,12],[9,12],[3,9]]);
 shape('far-main-sail',[136,433,23,48],[[2,0],[23,47],[0,47]]);
 shape('far-jib',[117,440,19,41],[[18,0],[18,40],[0,40],[5,29],[12,13]]);
 shape('far-mast',[135,425,5,62],[[2,0],[4,0],[3,25],[2,61],[0,61],[1,18]]);
 const rigid=(id,owner,world)=>{
  const x=Math.floor(Math.min(...world.map(p=>p[0]))),y=Math.floor(Math.min(...world.map(p=>p[1]))),w=Math.ceil(Math.max(...world.map(p=>p[0])))-x,h=Math.ceil(Math.max(...world.map(p=>p[1])))-y,parent=byId(owner);
  return {id,eraseDilation:1.5,crop:[x,y,w,h],outline:world.map(([a,b])=>[a-x,b-y]),anchor:[...parent.anchor],pivot:[parent.anchor[0]-x,parent.anchor[1]-y],follows:{actor:owner,offset:[0,0]},tracks:{},materialClass:'rigid-shell',motionBounds:[...parent.motionBounds]};
 };
 const additions=[rigid('near-forestay','vessel-hull',[[879,428],[880,429],[848,510],[846,510]]),rigid('near-boom','vessel-hull',[[878,503],[923,504],[923,506],[878,506]]),rigid('far-forestay','far-hull',[[136,438],[137,438],[115,483],[113,483]])];
 scene.objects.push(...additions);
 for(const subject of scene.subjects)subject.parts.push(...additions.filter(o=>o.follows.actor===subject.root).map(o=>o.id));
 scene.remaining=['Independent hull/sail/mast/stay source masks replace broad triangle erasure. Review native rest reconstruction, sail/stay clearance, tight-alpha edges and complete playback before acceptance.'];
}
