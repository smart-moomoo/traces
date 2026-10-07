// Procedural light and surface response, sampled from the original material.
// Only the authored water mask permits displacement. Paper and architecture
// retain their original geometry, and no new raster frames are produced.
const vertex=`
precision highp float;
in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vSceneCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;
void main(){
 vec2 p=aPosition*uOutputFrame.zw+uOutputFrame.xy;
 vSceneCoord=p;
 p.x=p.x*(2.0/uOutputTexture.x)-1.0;
 p.y=p.y*(2.0*uOutputTexture.z/uOutputTexture.y)-uOutputTexture.z;
 gl_Position=vec4(p,0.0,1.0);
 vTextureCoord=aPosition*(uOutputFrame.zw*uInputSize.zw);
}`;
const fragment=`
precision highp float;
in vec2 vTextureCoord;
in vec2 vSceneCoord;
uniform sampler2D uTexture;
uniform sampler2D uWaterMask;
uniform vec4 uInputSize;
uniform vec4 uInputClamp;
uniform float uTime;
uniform vec4 uWave0;
uniform vec4 uWave1;
uniform vec4 uWave2;
out vec4 finalColor;
float wave(vec2 p,vec4 event){
 if(event.z<0.0)return 0.0;
 vec2 delta=(p-event.xy)*vec2(1.0,2.6);
 float distance=length(delta),front=event.z*36.0;
 float envelope=exp(-pow((distance-front)/68.0,2.0))*exp(-event.z*.07);
 return sin((distance-front)*.085)*envelope*event.w;
}
void main(){
 vec2 p=vSceneCoord,uv=vTextureCoord;
 vec4 original=texture(uTexture,uv);
 float water=texture(uWaterMask,p/vec2(1024.0,768.0)).a;
 float sourceChroma=max(original.r,max(original.g,original.b))-min(original.r,min(original.g,original.b));
 water*=smoothstep(.02,.08,sourceChroma);
 // Keep each material patch nearly rigid; broad illumination is continuous.
 vec2 patch=floor(p/vec2(18.0,12.0))*vec2(18.0,12.0)+vec2(9.0,6.0);
 float swell=wave(patch,uWave0)+wave(patch,uWave1)+wave(patch,uWave2);
 float breeze=sin(patch.y*.11+patch.x*.012-uTime*1.1);
 vec2 offset=vec2(breeze*1.6+swell*4.3,sin(patch.x*.04-uTime*.8)*.45+swell*.9)*water;
 vec4 material=texture(uTexture,clamp(uv+offset*uInputSize.zw,uInputClamp.xy,uInputClamp.zw));
 float chroma=max(original.r,max(original.g,original.b))-min(original.r,min(original.g,original.b));
 float pigment=smoothstep(.035,.13,chroma);
 float cloud=sin(p.x*.004+p.y*.002-uTime*.19);
 float sky=(1.0-smoothstep(280.0,450.0,p.y));
 float daylight=(cloud*.055+sin(p.x*.009-uTime*.33)*.018)*pigment;
 float sheen=(breeze*.033+swell*.065)*water;
 material.rgb*=1.0+daylight+sheen;
 material.rgb+=vec3(.009,.006,.001)*max(cloud,0.0)*pigment*sky;
 finalColor=material;
}`;

export function createEnvironment(waterTexture){
  return new PIXI.Filter({glProgram:PIXI.GlProgram.from({vertex,fragment}),resources:{
    uWaterMask:waterTexture.source,
    environmentUniforms:{uTime:{value:0,type:'f32'},uWave0:{value:new Float32Array(4),type:'vec4<f32>'},uWave1:{value:new Float32Array(4),type:'vec4<f32>'},uWave2:{value:new Float32Array(4),type:'vec4<f32>'}}
  }});
}

export function updateEnvironment(filter,time,events){
  const u=filter.resources.environmentUniforms.uniforms;u.uTime=time;
  events.forEach((e,i)=>{u['uWave'+i].set([e.x,e.y,time-e.born,e.strength]);});
}
