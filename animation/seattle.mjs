import {seattleAt,wakeAt,SEATTLE_DURATION,StoryClock} from './timeline.mjs';

export class SeattleScene{
  static async mount(host,{onTime=()=>{}}={}){
    const scene=new SeattleScene();scene.host=host;scene.onTime=onTime;
    scene.app=new PIXI.Application();
    await scene.app.init({width:1024,height:768,resolution:Math.min(devicePixelRatio,2),autoDensity:true,antialias:true,autoStart:false,preference:'webgl',background:0xf8f6f1});
    scene.app.canvas.style.cssText='width:100%;height:100%;display:block;object-fit:contain';host.append(scene.app.canvas);
    const base=new URL('../assets/scenes/Seattle/',import.meta.url);
    scene.urls=['background.png','ship.png','water-mask.png','wake-shell.png'].map(s=>new URL(s,base).href);
    const [bg,ship,water,foam]=await Promise.all(scene.urls.map(s=>PIXI.Assets.load(s)));
    const stage=scene.app.stage;stage.addChild(new PIXI.Sprite(bg));
    scene.water=new PIXI.Container();stage.addChild(scene.water);
    const mask=new PIXI.Sprite(water);stage.addChild(mask);scene.water.mask=mask;
    // Reflection is the actual ship texture, upside down, split into bounded
    // bands so horizontal surface ripples never distort the fixed artwork.
    scene.reflection=new PIXI.Container();scene.water.addChild(scene.reflection);
    scene.bands=[];
    for(let y=0;y<300;y+=8){
      const texture=new PIXI.Texture({source:ship.source,frame:new PIXI.Rectangle(0,y,346,Math.min(8,300-y))});
      const s=new PIXI.Sprite(texture);s.pivot.set(190,0);s.y=(300-y)*.48;s.scale.y=-.48;s.alpha=.26*(y/300)**.7;
      scene.reflection.addChild(s);scene.bands.push({sprite:s,y});
    }
    scene.wakes=[];
    for(let i=0;i<64;i++){
      const pair=[new PIXI.Sprite(foam),new PIXI.Sprite(foam)];
      pair.forEach(s=>{s.anchor.set(.5);scene.water.addChild(s);});scene.wakes.push(pair);
    }
    scene.ship=new PIXI.Sprite(ship);scene.ship.pivot.set(190,296);stage.addChild(scene.ship);
    // Thin shell-textured contact line stays attached to the hull, not the sky.
    scene.contact=new PIXI.Sprite(foam);scene.contact.anchor.set(.5);scene.water.addChild(scene.contact);
    scene.clock=new StoryClock(SEATTLE_DURATION);scene.render(0);
    scene.tick=()=>{if(!document.hidden&&!scene.clock.paused)scene.render(scene.clock.tick(performance.now()));scene.raf=requestAnimationFrame(scene.tick);};
    scene.visibility=()=>scene.clock.suspend();document.addEventListener('visibilitychange',scene.visibility);
    scene.raf=requestAnimationFrame(scene.tick);return scene;
  }
  render(t){
    const s=seattleAt(t);this.ship.position.set(s.x,s.y);this.ship.scale.set(s.scale);this.ship.rotation=s.roll;
    this.reflection.position.set(s.x,s.y);this.reflection.scale.set(s.scale);
    for(const b of this.bands)b.sprite.x=Math.sin(t*1.3+b.y*.09)*(1+b.y*.006);
    this.wakes.forEach((pair,i)=>{const w=wakeAt(t,i);pair.forEach((p,side)=>{p.visible=w.visible;if(!w.visible)return;p.position.set(w.x+(side?1:-1)*w.spread,w.y+Math.abs(w.spread)*.14);p.width=w.width;p.height=Math.max(1,s.scale*1.7);p.alpha=w.alpha;p.rotation=side?.12:-.12;});});
    this.contact.position.set(s.x-16*s.scale,s.y-1);this.contact.width=245*s.scale;this.contact.height=2.2*s.scale;this.contact.alpha=.34;
    this.app.render();this.onTime(t,s);this.frames=(this.frames||0)+1;
  }
  seek(t){this.clock.seek(t);this.render(this.clock.time);}
  play(){this.clock.play();}
  pause(){this.clock.pause();}
  async benchmark(count=1000){
    this.pause();const previous=this.clock.time,begin=performance.now();let max=0;
    const requestsBefore=performance.getEntriesByType("resource").filter(e=>this.urls.includes(e.name)).length;
    for(let i=0;i<count;i++){const start=performance.now();this.render(i/(count-1)*SEATTLE_DURATION);max=Math.max(max,performance.now()-start);if(i%25===24){this.app.renderer.gl?.finish();await new Promise(requestAnimationFrame);}}
    const elapsed=performance.now()-begin;this.seek(previous);return {frames:count,elapsedMs:Math.round(elapsed),maxSubmissionMs:+max.toFixed(2),assets:this.urls.length,newAssetRequests:performance.getEntriesByType("resource").filter(e=>this.urls.includes(e.name)).length-requestsBefore,generatedFrames:0};
  }
  async destroy(){cancelAnimationFrame(this.raf);document.removeEventListener('visibilitychange',this.visibility);this.app.destroy(true,{children:true,texture:false});await Promise.all(this.urls.map(s=>PIXI.Assets.unload(s)));}
}
