import {seattleAt,wakeAt,SEATTLE_DURATION,StoryClock} from './timeline.mjs';
import {createEnvironment,updateEnvironment} from './environment.mjs';

export class SeattleScene{
  static async mount(host,{onTime=()=>{}}={}){
    const scene=new SeattleScene();scene.host=host;scene.onTime=onTime;
    scene.app=new PIXI.Application();
    await scene.app.init({width:1024,height:768,resolution:Math.min(devicePixelRatio,2),autoDensity:true,antialias:true,autoStart:false,preference:'webgl',background:0xf8f6f1});
    scene.app.canvas.style.cssText='width:100%;height:100%;display:block;object-fit:contain';host.append(scene.app.canvas);
    const base=new URL('../assets/scenes/Seattle/',import.meta.url);
    scene.urls=['background.png','ship.png','water-mask.png','wake-shell.png','reflection.png'].map(s=>new URL(s,base).href);
    const [bg,ship,water,foam,reflectedArt]=await Promise.all(scene.urls.map(s=>PIXI.Assets.load(s)));
    const manifest=await fetch(new URL('layers.json',base)).then(r=>{if(!r.ok)throw new Error('Layer manifest unavailable');return r.json();});
    const definition=manifest.layers.find(l=>l.id==='ship'),[left,top,right,bottom]=definition.bounds;
    const shipWidth=right-left,shipHeight=bottom-top;
    scene.shipPivot=[definition.anchor[0]-left,definition.anchor[1]-top];
    const stage=scene.app.stage;const background=new PIXI.Sprite(bg);stage.addChild(background);
    scene.environment=createEnvironment(water);background.filters=[scene.environment];
    background.filterArea=new PIXI.Rectangle(0,0,1024,768);
    scene.waveEvents=[8,14,20].map(born=>{const s=seattleAt(born);return {born,x:s.x-110*s.scale,y:s.y,strength:1};});
    scene.water=new PIXI.Container();stage.addChild(scene.water);
    const mask=new PIXI.Sprite(water);stage.addChild(mask);scene.water.mask=mask;
    // Preserve the authored reflection: its shell fragments are artwork,
    // not a photorealistic mirror synthesized by flipping the vessel.
    const reflectionDefinition=manifest.layers.find(l=>l.id==='reflection');
    const [rx,ry,rr,rb]=reflectionDefinition.bounds;
    const [ax,ay]=reflectionDefinition.anchor;
    scene.reflection=new PIXI.Container();scene.water.addChild(scene.reflection);
    scene.bands=[];
    for(let y=0;y<rb-ry;y+=8){
      const texture=new PIXI.Texture({source:reflectedArt.source,frame:new PIXI.Rectangle(0,y,rr-rx,Math.min(8,rb-ry-y))});
      const sprite=new PIXI.Sprite(texture);sprite.pivot.set(ax-rx,0);sprite.y=ry+y-ay;
      scene.reflection.addChild(sprite);scene.bands.push({sprite,y});
    }
    scene.wakes=[];
    for(let i=0;i<64;i++){
      const pair=[new PIXI.Sprite(foam),new PIXI.Sprite(foam)];
      pair.forEach(s=>{s.anchor.set(.5);scene.water.addChild(s);});scene.wakes.push(pair);
    }
    scene.ship=new PIXI.Sprite(ship);scene.ship.pivot.set(...scene.shipPivot);stage.addChild(scene.ship);
    // Thin shell-textured contact line stays attached to the hull, not the sky.
    scene.contact=new PIXI.Sprite(foam);scene.contact.anchor.set(.5);scene.water.addChild(scene.contact);
    scene.clock=new StoryClock(SEATTLE_DURATION);scene.render(0);
    scene.tick=()=>{if(!document.hidden&&!scene.clock.paused)scene.render(scene.clock.tick(performance.now()));scene.raf=requestAnimationFrame(scene.tick);};
    scene.visibility=()=>scene.clock.suspend();document.addEventListener('visibilitychange',scene.visibility);
    scene.raf=requestAnimationFrame(scene.tick);return scene;
  }
  render(t){
    const s=seattleAt(t);
    updateEnvironment(this.environment,t,this.waveEvents,s);
    this.ship.position.set(s.x,s.y);this.ship.scale.set(s.scale);this.ship.rotation=s.roll;
    this.reflection.position.set(s.x,s.y);this.reflection.scale.set(s.scale);
    for(const b of this.bands)b.sprite.x=Math.sin(t*1.3+b.y*.09)*(1+b.y*.006)*s.surfaceEnergy;
    this.wakes.forEach((pair,i)=>{const w=wakeAt(t,i);pair.forEach((p,side)=>{p.visible=w.visible;if(!w.visible)return;p.position.set(w.x+(side?1:-1)*w.spread,w.y+Math.abs(w.spread)*.14);p.width=w.width;p.height=Math.max(1,s.scale*1.7);p.alpha=w.alpha;p.rotation=side?.12:-.12;});});
    this.contact.position.set(s.x-16*s.scale,s.y-1);this.contact.width=245*s.scale;this.contact.height=2.2*s.scale;this.contact.alpha=.12+.22*Math.min(1,s.speed/6);
    if(this.environmentOnly){this.ship.visible=false;this.reflection.visible=false;this.contact.visible=false;this.wakes.flat().forEach(p=>p.visible=false);}
    else {this.ship.visible=true;this.reflection.visible=true;this.contact.visible=true;}
    this.app.render();this.onTime(t,s);this.frames=(this.frames||0)+1;
  }
  seek(t){this.clock.seek(t);this.render(this.clock.time);}
  play(){this.clock.play();}
  pause(){this.clock.pause();}
  async auditEnvironment(){
    this.pause();const time=this.clock.time,previous=this.environmentOnly;this.environmentOnly=true;
    const gl=this.app.renderer.gl;
    const capture=t=>{this.render(t);gl.finish();const [,,w,h]=gl.getParameter(gl.VIEWPORT),pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return {pixels,w,h};};
    const a=capture(0),b=capture(12);
    const difference=(x,y)=>{const i=(Math.min(a.h-1,Math.floor((768-y)/768*a.h))*a.w+Math.floor(x/1024*a.w))*4;return Math.max(...[0,1,2].map(c=>Math.abs(a.pixels[i+c]-b.pixels[i+c])));};
    let changed=0,total=0;
    for(let y=480;y<570;y+=3)for(let x=200;x<610;x+=3){total++;if(difference(x,y)>2)changed++;}
    const paperDifference=Math.max(...[[8,8],[1015,12],[12,740],[1000,740]].map(([x,y])=>difference(x,y)));
    this.environmentOnly=previous;this.seek(time);
    return {subjectHidden:true,waterChangedPercent:+(100*changed/total).toFixed(1),paperCornerDifference:paperDifference,comparisonSeconds:[0,12]};
  }
  async benchmark(count=1000){
    this.pause();const previous=this.clock.time,begin=performance.now();let max=0;
    const requestsBefore=performance.getEntriesByType("resource").filter(e=>this.urls.includes(e.name)).length;
    for(let i=0;i<count;i++){const start=performance.now();this.render(i/(count-1)*SEATTLE_DURATION);max=Math.max(max,performance.now()-start);if(i%25===24){this.app.renderer.gl?.finish();await new Promise(requestAnimationFrame);}}
    const elapsed=performance.now()-begin;this.seek(previous);return {frames:count,elapsedMs:Math.round(elapsed),maxSubmissionMs:+max.toFixed(2),assets:this.urls.length,newAssetRequests:performance.getEntriesByType("resource").filter(e=>this.urls.includes(e.name)).length-requestsBefore,generatedFrames:0};
  }
  async destroy(){cancelAnimationFrame(this.raf);document.removeEventListener('visibilitychange',this.visibility);this.app.destroy(true,{children:true,texture:false});await Promise.all(this.urls.map(s=>PIXI.Assets.unload(s)));}
}
