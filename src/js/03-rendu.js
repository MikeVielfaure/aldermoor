/* ================= RENDU ================= */
const canvas=$('#c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.shadowMap.enabled=HQ;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0x8fb3d9,50,170);
const camera=new THREE.PerspectiveCamera(58,1,0.1,600);
const hemi=new THREE.HemisphereLight(0xd8e8ff,0x40562c,0.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,0.95);sun.castShadow=HQ;
sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-38;sc.right=38;sc.top=38;sc.bottom=-38;sc.near=1;sc.far=180;sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;
scene.add(sun);scene.add(sun.target);
const amb=new THREE.AmbientLight(0x6070a0,0.15);scene.add(amb);
let pScale=400;
function resize(){const w=window.innerWidth,h=window.innerHeight;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,QL>=2?2:QL>=1?1.6:1.15));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const v=new THREE.Vector2();renderer.getDrawingBufferSize(v);pScale=v.y/(2*Math.tan(camera.fov*Math.PI/360));/* le champ de vision peut changer en intérieur (13b) */PS_ALL.forEach(p=>p.mat.uniforms.scale.value=pScale);if(composer){composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h);}if(TALK)setTalk(TALK.n);}
window.addEventListener('resize',resize);

const matCache={};
function mat(c,o){o=o||{};const k=c+'|'+JSON.stringify(o);if(!matCache[k]){matCache[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.85,metalness:0,flatShading:o.flatShading!==undefined?o.flatShading:false},o));}return matCache[k];}
function basic(c,o){return new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));}
function mesh(geo,m,x,y,z,parent,shadow){const o=new THREE.Mesh(geo,typeof m==='number'?mat(m):m);o.position.set(x,y,z);if(shadow!==false){o.castShadow=true;o.receiveShadow=true;}(parent||scene).add(o);return o;}

const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
function glow(color,size,opacity){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:opacity==null?1:opacity}));s.scale.set(size,size,1);return s;}
function label(text,color,w){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.font='600 40px Inter, sans-serif';const tw=Math.min(500,g.measureText(text).width+40);g.fillStyle='rgba(16,12,36,.75)';const x=(512-tw)/2;g.beginPath();if(g.roundRect)g.roundRect(x,14,tw,66,33);else g.rect(x,14,tw,66);g.fill();g.fillStyle=color||'#f3cf7a';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,48);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));const k=w||3.6;s.scale.set(k,k*0.1875,1);return s;}

/* ---------- particules (GPU, un seul draw call) ---------- */
const PS_ALL=[];
class PS{
 constructor(n,additive){this.n=n;this.i=0;const g=new THREE.BufferGeometry();
  this.pos=new Float32Array(n*3);this.col=new Float32Array(n*3);this.sz=new Float32Array(n);this.al=new Float32Array(n);
  this.v=new Float32Array(n*3);this.life=new Float32Array(n);this.max=new Float32Array(n);this.s0=new Float32Array(n);this.s1=new Float32Array(n);this.gr=new Float32Array(n);this.dr=new Float32Array(n);this.a0=new Float32Array(n);
  for(let k=0;k<n;k++)this.pos[k*3+1]=-999;
  this.pa=new THREE.BufferAttribute(this.pos,3);this.ca=new THREE.BufferAttribute(this.col,3);this.sa=new THREE.BufferAttribute(this.sz,1);this.aa=new THREE.BufferAttribute(this.al,1);
  [this.pa,this.ca,this.sa,this.aa].forEach(a=>a.setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('position',this.pa);g.setAttribute('pcol',this.ca);g.setAttribute('psize',this.sa);g.setAttribute('palpha',this.aa);
  this.mat=new THREE.ShaderMaterial({uniforms:{map:{value:glowTex},scale:{value:pScale}},
   vertexShader:'attribute vec3 pcol;attribute float psize;attribute float palpha;uniform float scale;varying vec3 vC;varying float vA;void main(){vC=pcol;vA=palpha;vec4 mv=modelViewMatrix*vec4(position,1.0);vA*=clamp((-mv.z-0.6)/1.6,0.0,1.0);gl_PointSize=min(psize*scale/max(0.1,-mv.z),90.0);gl_Position=projectionMatrix*mv;}',
   fragmentShader:'uniform sampler2D map;varying vec3 vC;varying float vA;void main(){float a=texture2D(map,gl_PointCoord).a*vA;if(a<0.01)discard;gl_FragColor=vec4(vC,a);}',
   transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending});
  this.pts=new THREE.Points(g,this.mat);this.pts.frustumCulled=false;this.pts.renderOrder=5;scene.add(this.pts);PS_ALL.push(this);this.live=0;this.elo=n;this.ehi=-1;}
 emit(x,y,z,vx,vy,vz,color,s0,s1,life,grav,drag,alpha){const k=this.i;this.i=(this.i+1)%this.n;const k3=k*3;if(k<this.elo)this.elo=k;if(k>this.ehi)this.ehi=k;
  this.pos[k3]=x;this.pos[k3+1]=y;this.pos[k3+2]=z;this.v[k3]=vx;this.v[k3+1]=vy;this.v[k3+2]=vz;
  TMPC.set(color);this.col[k3]=TMPC.r;this.col[k3+1]=TMPC.g;this.col[k3+2]=TMPC.b;
  this.s0[k]=s0;this.s1[k]=s1;this.life[k]=life;this.max[k]=life;this.gr[k]=grav||0;this.dr[k]=drag||0;this.a0[k]=alpha==null?1:alpha;this.sz[k]=s0;this.al[k]=this.a0[k];}
 update(dt){const P=this.pos,V=this.v;let lo=this.elo,hi=this.ehi;for(let k=0;k<this.n;k++){if(this.life[k]<=0)continue;if(k<lo)lo=k;if(k>hi)hi=k;this.life[k]-=dt;const k3=k*3;
   if(this.life[k]<=0){this.al[k]=0;P[k3+1]=-999;continue;}
   const t=1-this.life[k]/this.max[k];V[k3+1]-=this.gr[k]*dt;const d=Math.max(0,1-this.dr[k]*dt);V[k3]*=d;V[k3+1]*=d;V[k3+2]*=d;
   P[k3]+=V[k3]*dt;P[k3+1]+=V[k3+1]*dt;P[k3+2]+=V[k3+2]*dt;
   this.sz[k]=this.s0[k]+(this.s1[k]-this.s0[k])*t;this.al[k]=this.a0[k]*(t<0.15?t/0.15:1-(t-0.15)/0.85);}
  this.elo=this.n;this.ehi=-1;if(hi<0)return;const o=lo,c=hi-lo+1;this.pa.updateRange.offset=o*3;this.pa.updateRange.count=c*3;this.ca.updateRange.offset=o*3;this.ca.updateRange.count=c*3;this.sa.updateRange.offset=o;this.sa.updateRange.count=c;this.aa.updateRange.offset=o;this.aa.updateRange.count=c;
  this.pa.needsUpdate=this.ca.needsUpdate=this.sa.needsUpdate=this.aa.needsUpdate=true;}
}
const TMPC=new THREE.Color();
const PA=new PS(3000,true);   // lueurs, feu, étincelles
const PN=new PS(1800,false);const PW=new PS(2600,false);
function burst(x,y,z,color,n,spd){for(let i=0;i<(n||14);i++){const a=Math.random()*TAU,b=rnd(-0.6,1),v=rnd(1,spd||5);PA.emit(x,y,z,Math.cos(a)*v,b*v+1,Math.sin(a)*v,color,rnd(.25,.5),0.05,rnd(.5,1),3,1.5);}}

/* ---------- lumières dynamiques (pool fixe) ---------- */
const LP=[];for(let i=0;i<4;i++){const l=new THREE.PointLight(0xffffff,0,16,2);l.position.y=-50;scene.add(l);LP.push({l,life:0,max:1,i0:0,hold:false});}
const PLight=new THREE.PointLight(0xffd8a0,0,14,2);PLight.position.y=-50;scene.add(PLight);const TL=[0,1].map(()=>{const l=new THREE.PointLight(0xff9a40,0,14,2);l.position.y=-50;scene.add(l);return l;});
function flash(x,y,z,color,inten,life,hold,dist){let s=LP.find(p=>p.life<=0)||LP.slice().sort((a,b)=>(a.hold-b.hold)||(a.life-b.life))[0];s.l.position.set(x,y,z);s.l.color.set(color);s.l.distance=dist||16;s.i0=inten;s.life=s.max=life;s.hold=!!hold;s.l.intensity=inten;return s;}
function updLights(dt){LP.forEach(p=>{if(p.life<=0){p.l.intensity=0;return;}p.life-=dt;p.l.intensity=p.hold?p.i0*Math.min(1,p.life/1.5)*(0.9+Math.sin(performance.now()/90)*0.1):p.i0*Math.max(0,p.life/p.max);});}

/* ---------- collisions ---------- */
const COLS=[];
const addCol=c=>COLS.push(c);
let ICE=[];
const onIce=p=>ICE.some(i=>Math.hypot(p.x-i.x,p.z-i.z)<i.r-0.15);
const inLake=p=>Math.hypot(p.x-LAKE.x,p.z-LAKE.z)<LAKE.r;
function pushOut(o,rad,allowIce,py){
 for(const c of COLS){
  if(c.off||(py!==undefined&&c.h!==undefined&&py>=c.h-0.46))continue;
  if(c.r!==undefined){if(c.off)continue;if(c.lake&&allowIce===2)continue;const dx=o.x-c.x,dz=o.z-c.z;if(Math.abs(dx)>c.r+rad||Math.abs(dz)>c.r+rad)continue;if(c.lake&&allowIce&&onIce(o))continue;const d=Math.hypot(dx,dz),m=c.r+rad;if(d<m){if(d<1e-4)o.x+=m;else{o.x=c.x+dx/d*m;o.z=c.z+dz/d*m;}}}
  else{const dx=o.x-c.x,dz=o.z-c.z,px=c.hw+rad-Math.abs(dx),pz=c.hd+rad-Math.abs(dz);if(px>0&&pz>0){if(px<pz)o.x+=(dx>=0?1:-1)*px;else o.z+=(dz>=0?1:-1)*pz;}}
 }
 if(o.z>-300&&o.z<300){const d=Math.hypot(o.x,o.z);if(d>92){o.x*=92/d;o.z*=92/d;}}roomClamp(o,rad);
}
function isFree(p,rad){const q={x:p.x,z:p.z};pushOut(q,rad);return Math.hypot(q.x-p.x,q.z-p.z)<0.01;}
function hitsSolid(x,z){for(const c of COLS){if(c.lake||c.off)continue;if(c.r!==undefined){if(Math.hypot(x-c.x,z-c.z)<c.r)return true;}else if(Math.abs(x-c.x)<c.hw&&Math.abs(z-c.z)<c.hd)return true;}return false;}
function freePoint(loc,spread){spread=spread||5;for(let i=0;i<16;i++){const a=Math.random()*TAU,r=Math.random()*spread;const p={x:loc.spot.x+Math.cos(a)*r,z:loc.spot.z+Math.sin(a)*r};if(isFree(p,1))return p;}return {x:loc.spot.x,z:loc.spot.z};}

