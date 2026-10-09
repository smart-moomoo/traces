// Authored Seattle contract. Rejected POC feedback is preserved separately
// from the revised original-material passage reviewed on October 8.
export const seattleSpec={
  id:'Seattle',status:'reviewed',duration:36,
  source:{path:'assets/posters/Seattle.png',crop:[0,.5,1,.5]},
  representation:'2D material tableau; shared scale, light and spatial rules',
  tracks:{
    x:[{time:0,value:826},{time:5,value:826},{time:15,value:774,velocity:-6},{time:26,value:712},{time:36,value:712}],
    y:[{time:0,value:535},{time:5,value:535},{time:26,value:542},{time:36,value:542}],
    scale:[{time:0,value:1},{time:36,value:1}],
    wind:[{time:0,value:0},{time:4,value:0},{time:10,value:1},{time:22,value:0},{time:36,value:0}]
  },
  layers:[
    {id:'plate',role:'reconstructed background',material:'original shell artwork'},
    {id:'waterMask',role:'water coverage',material:'alpha'},
    {id:'ship',role:'original cargo vessel',material:'original shell artwork',motion:'cutout',anchor:[826,535],maxTransform:{scale:[.85,1.05],rotation:.005},cleanPlate:'plate',alphaReview:'pass'},
    {id:'water',role:'surface and city reflection',material:'original shell artwork',motion:'surface',anchor:[0,460],maxTransform:{displacement:4.5},mask:'waterMask'},
    {id:'reflection',role:'vessel reflection',material:'original authored reflection',motion:'surface',anchor:[0,0],maxTransform:{displacement:5},follows:'ship',mask:'waterMask'},
    {id:'light',role:'cloud-modulated illumination',material:'original pigment',motion:'light',anchor:[0,0],maxTransform:{gain:[.9,1.1]}},
    {id:'wake',role:'historical ship-water contact',material:'original shell texture',motion:'surface',anchor:[0,0],maxTransform:{displacement:100},follows:'ship',mask:'waterMask'}
  ],
  beats:[{role:'setup',start:0,end:5,description:'A composed harbor with readable material structure.'},{role:'change',start:5,end:25,description:'A passing breeze, vessel passage and interacting reflections.'},{role:'resolution',start:25,end:36,description:'Surface disturbance decays; evening color reforms on the water.'}],
  events:[
    {id:'breeze',start:4,end:22,targets:['water','light'],causes:[],effect:'A directed gust crosses the harbor.',resolution:'The gust envelope returns to zero.'},
    {id:'passage',start:5,end:26,targets:['ship'],causes:[],effect:'The original vessel traverses a bounded path within the material tableau.',resolution:'Vessel motion settles without a giant foreground cutout.'},
    {id:'contact',start:5,end:32,targets:['wake','water'],causes:['passage'],effect:'Water receives disturbances at historical contact positions.',resolution:'Wave energy dissipates after passage.'},
    {id:'reflected-light',start:5,end:36,targets:['reflection','water'],causes:['breeze','contact'],effect:'Reflections break and reform with the same surface field.',resolution:'Final reflections retain the warm palette and recognizable structure.'}
  ],
  historicalReview:{sourceFidelity:{verdict:'pending'},alphaEdges:{verdict:'fail',evidence:'User identified inaccurate ship/background separation.'},occlusion:{verdict:'pending'},materialScale:{verdict:'fail',evidence:'User rejected the enlarged foreground ship against the flat tableau.'},causalMotion:{verdict:'pending'},storyArc:{verdict:'fail',evidence:'User rejected object movement as a complete story.'},fullPlayback:{verdict:'pending'}},
  review:{
    sourceFidelity:{verdict:'pass',evidence:'24 playback observations retain approved harbor palette, shell relief and dispersed paper edges.'},
    alphaEdges:{verdict:'pass',evidence:'Rebuilt manifest preserves hull, cranes and rigging; original reflection is separate. Playback observation shows no carried background rectangle.'},
    occlusion:{verdict:'pass',evidence:'Vessel stays within open water; skyline remains behind it and source reflection stays below the hull.'},
    materialScale:{verdict:'pass',evidence:'All 24 playback observations and deterministic tracks preserve scale 1; the former giant approach is removed.'},
    causalMotion:{verdict:'pass',evidence:'Wind, ship-origin contact, historical wakes and reflection share timeline; disturbance fades after passage.'},
    storyArc:{verdict:'pass',evidence:'Resting harbor, bounded passage, broken warm reflection and settled ending are present in the 36-second demo.'},
    fullPlayback:{verdict:'pass',evidence:'animation/full-playback.json and art-direction/full-playback/Seattle: real-time run to end with 24 inspected observations.'}
  },
  performance:{frames:1000,newAssetRequests:0,evidence:'SEATTLE-REVIEW.md; engineering evidence only'}
};
