const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
// One swell approaches a traced shoreline, breaks, then withdraws. Frame count
// is unrelated to the authored timing; seeking does not accumulate simulation.
export function surfAt(scene,time){
 const s=scene.surf;if(!s)return {front:0,width:1,energy:0,foam:0};
 const t=Math.max(0,Math.min(scene.duration,time));
 const incoming=smooth((t-s.start)/(s.break-s.start));
 const outgoing=smooth((t-s.hold)/(s.end-s.hold));
 const energy=smooth((t-s.start)/3)*(1-smooth((t-s.end+4)/4));
 return {front:s.reach*(1-incoming)+s.reach*.7*outgoing,width:s.width,
  energy,foam:energy*smooth((t-s.break+3)/3)*(1-outgoing)};
}
export function shorelineSegments(scene){
 const points=scene.surf?.shore||[],[,,w,h]=scene.crop;
 return points.slice(1).map((p,i)=>[points[i][0]*w,points[i][1]*h,p[0]*w,p[1]*h]);
}
