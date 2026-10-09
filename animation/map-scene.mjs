import {MaterialScene} from './material-scene.mjs';
// Every polygon is in the approved map's native 1448 × 1086 coordinates.
// Only small patches of existing water are displaced. Landmarks, vessels,
// detached shell edges and the surrounding paper remain the source pixels.
const patch=(id,kind,points,gain=.3)=>({id,kind,points:points.map(([x,y])=>[x/1448,y/1086]),anchor:[points[0][0]/1448,points[0][1]/1086],gain});
export const mapScene={
 id:'Atlas',source:'assets/quiet-shell-archipelago.png',crop:[0,0,1448,1086],duration:48,
 mode:'wind',score:{onset:2,peak:12,decay:36,settle:48,direction:[1,.2]},
 regions:[
  patch('northwest-water','water',[[120,280],[282,280],[320,303],[260,317],[140,307]]),
  patch('bay-water','water',[[275,470],[320,471],[320,525],[294,526],[275,500]]),
  patch('coast-water','water',[[115,928],[204,935],[233,963],[181,972],[104,948]]),
  patch('texas-pool','water',[[637,784],[712,786],[755,800],[694,815],[642,802]]),
  patch('river-water','water',[[790,340],[833,351],[863,380],[844,388],[797,367]]),
  patch('atlantic-water','water',[[1052,602],[1120,610],[1201,640],[1234,669],[1156,657],[1080,630]]),
  patch('wetland-water','water',[[1202,939],[1308,939],[1315,965],[1254,972],[1218,964]]),
  patch('oak-clearing','light',[[848,902],[929,900],[969,934],[908,951],[847,933]],.45)
 ]
};
export async function mountMap(host){return MaterialScene.mount(host,{scene:mapScene});}
