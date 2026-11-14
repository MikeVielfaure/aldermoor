/* ================= ÉTAPE 5 : FINITIONS, PERFORMANCES, SON, DUELS, CARTE ================= */
const deEl=el=>{const n=ELEM[el]?ELEM[el].n:String(el);return (/^[AEIOUYÉÈÊHaeiouyéèê]/.test(n)?'d’':'de ')+n;};
const ROOMS=[{x:360,z:700,r:14.1},{x:120,z:700,r:9.95}];
function roomClamp(o,rad){if(o.z<300)return;for(const R of ROOMS){const dx=o.x-R.x,dz=o.z-R.z,d=Math.hypot(dx,dz),m=R.r-rad;if(d<R.r+30&&d>m){o.x=R.x+dx/d*m;o.z=R.z+dz/d*m;}}}
/* matériaux triplanaires partagés (moins de programmes / regroupement possible) */
const TRIC={};
function triMat(color,top,side,scale,boost,opts){const k=[color,top&&top.uuid,side&&side.uuid,scale,boost,JSON.stringify(opts||{})].join('|');return TRIC[k]||(TRIC[k]=triMat0(color,top,side,scale,boost,opts));}

/* ---------- eau : vagues GPU, reflets, transparence selon l'angle, écume ---------- */
function waterMat(o){o=o||{};const m=new THREE.MeshStandardMaterial({color:o.color||0x1c5878,roughness:0.06,metalness:0.08,transparent:true,opacity:1,envMap:CUBE_RT.texture,envMapIntensity:o.env||1.15,depthWrite:o.dw!==false});
 const U={uAmp:{value:o.amp==null?1:o.amp},uOp:{value:o.op||0.62},uC:{value:new THREE.Vector2(o.cx||0,o.cz||0)},uR:{value:o.r||0},uN:{value:o.nk||0.075}};
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=WIND.uTime;Object.assign(sh.uniforms,U);
  sh.vertexShader='uniform float uTime;uniform float uAmp;varying vec3 vWP;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 w0=modelMatrix*vec4(transformed,1.0);transformed.y+=(sin(w0.x*0.7+uTime*1.6)*0.05+cos(w0.z*0.6+uTime*1.2)*0.05)*uAmp;}').replace('#include <project_vertex>','#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader='uniform float uTime;uniform float uAmp;uniform float uOp;uniform vec2 uC;uniform float uR;uniform float uN;varying vec3 vWP;\nfloat wvh(vec2 p){return sin(p.x*1.3+uTime*1.7)*0.5+sin(p.y*1.7-uTime*1.3)*0.5+sin((p.x+p.y)*2.9+uTime*2.3)*0.25+sin((p.x-p.y)*4.1-uTime*2.9)*0.16+sin(p.x*7.3+p.y*5.1+uTime*3.7)*0.08+sin(p.x*-6.1+p.y*8.3+uTime*4.3)*0.06;}\n'+sh.fragmentShader
   .replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\n{vec2 q=vWP.xz;float e=0.07;float h0=wvh(q);vec3 wn=normalize(vec3(-(wvh(q+vec2(e,0.0))-h0)/e*uN,1.0,-(wvh(q+vec2(0.0,e))-h0)/e*uN));normal=normalize((viewMatrix*vec4(wn,0.0)).xyz);}')
   .replace('#include <output_fragment>','{float fr=pow(1.0-clamp(dot(normalize(vViewPosition),normal),0.0,1.0),2.2);diffuseColor.a=mix(uOp,0.97,fr);\nif(uR>0.0){float sd=length(vWP.xz-uC);float fo=smoothstep(uR-1.1,uR-0.15,sd)*(0.55+0.45*sin(sd*9.0-uTime*2.2+vWP.x*0.7));outgoingLight=mix(outgoingLight,vec3(0.86,0.92,0.95)*(0.35+0.65*clamp(dot(outgoingLight,vec3(0.33))*2.0,0.25,1.0)),fo*0.55);diffuseColor.a=max(diffuseColor.a,fo*0.8);}}\n#include <output_fragment>');};
 m.customProgramCacheKey=()=>'water5';return m;}

/* ---------- rochers : blocs taillés plutôt qu'œufs ---------- */
function rockGeo(s){const g=new THREE.SphereGeometry(s,16,12);const p=g.attributes.position;const ph=Math.random()*10,ph2=Math.random()*10,ph3=Math.random()*10;
 const cuts=[];const nc=3+Math.floor(Math.random()*3);for(let i=0;i<nc;i++){const a=Math.random()*TAU,b=rnd(-0.35,0.9);const n=new THREE.Vector3(Math.cos(a)*Math.cos(b),Math.sin(b),Math.sin(a)*Math.cos(b));cuts.push({n,d:s*rnd(0.62,0.86)});}
 const v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.set(p.getX(i),p.getY(i),p.getZ(i));const x=v.x/s,y=v.y/s,z=v.z/s;
  const k=1+0.13*Math.sin(x*2.3+ph)*Math.cos(z*1.9-ph2)+0.07*Math.sin(y*3.1+ph2)+0.06*Math.sin((x+z)*5.3+ph3)+0.035*Math.sin(x*9.1-y*7.7+ph)*Math.cos(z*8.3+ph2);v.multiplyScalar(k);
  for(const c of cuts){const dd=v.dot(c.n);if(dd>c.d)v.addScaledVector(c.n,-(dd-c.d)*0.92);}
  if(v.y<-s*0.42)v.y=-s*0.42+(v.y+s*0.42)*0.25;v.y*=0.78;p.setXYZ(i,v.x,v.y,v.z);}
 g.computeVertexNormals();return g;}

/* ---------- regroupement des objets statiques (beaucoup moins d'appels de dessin) ---------- */
let STATIC_MARK=null;
function markStatic(){STATIC_MARK=new Set();scene.traverse(o=>STATIC_MARK.add(o));}
function concatGeos(parts){let nv=0,ni=0;parts.forEach(g=>{nv+=g.attributes.position.count;ni+=g.index.count;});
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),idx=nv>65000?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
 parts.forEach(g=>{const P=g.attributes.position,N=g.attributes.normal,T=g.attributes.uv,I=g.index;pos.set(P.array.subarray(0,P.count*3),vo*3);if(N)nor.set(N.array.subarray(0,P.count*3),vo*3);if(T)uv.set(T.array.subarray(0,P.count*2),vo*2);for(let k=0;k<I.count;k++)idx[io+k]=I.array[k]+vo;vo+=P.count;io+=I.count;});
 const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.BufferAttribute(pos,3));out.setAttribute('normal',new THREE.BufferAttribute(nor,3));out.setAttribute('uv',new THREE.BufferAttribute(uv,2));out.setIndex(new THREE.BufferAttribute(idx,1));out.computeBoundingSphere();out.computeBoundingBox();return out;}
function mergeStatic(){if(!STATIC_MARK)return [0,0];scene.updateMatrixWorld(true);const skip=new Set([water].concat(banners));const groups=new Map();const wp=new THREE.Vector3();
 scene.traverse(o=>{if(STATIC_MARK.has(o)||!o.isMesh||o.isInstancedMesh||skip.has(o)||!o.visible||o.userData.dyn)return;const m=o.material;if(!m||Array.isArray(m)||m.transparent||m.isShaderMaterial||m.vertexColors)return;
  let q=o.parent;while(q){if(!q.visible||q.userData.dyn)return;q=q.parent;}const g=o.geometry;if(!g||!g.attributes.position||g.attributes.color||g.attributes.position.count>20000)return;if(o.matrixWorld.determinant()<=0)return;
  o.getWorldPosition(wp);const k=m.uuid+'|'+(o.castShadow?1:0)+(o.receiveShadow?1:0)+'|'+Math.floor(wp.x/40)+','+Math.floor(wp.z/40)+'|'+(o.customDepthMaterial?o.customDepthMaterial.uuid:'');
  let G=groups.get(k);if(!G)groups.set(k,G={m,cast:o.castShadow,recv:o.receiveShadow,cdm:o.customDepthMaterial,list:[]});G.list.push(o);});
 let merged=0,made=0;
 groups.forEach(G=>{if(G.list.length<2)return;let batch=[],nv=0;const flush=()=>{if(batch.length<2){batch=[];nv=0;return;}const parts=batch.map(o=>{let g=o.geometry.clone();if(!g.index){const n=g.attributes.position.count,ia=new (n>65000?Uint32Array:Uint16Array)(n);for(let i=0;i<n;i++)ia[i]=i;g.setIndex(new THREE.BufferAttribute(ia,1));}if(!g.attributes.normal)g.computeVertexNormals();g.applyMatrix4(o.matrixWorld);return g;});
   const mm=new THREE.Mesh(concatGeos(parts),G.m);mm.castShadow=G.cast;mm.receiveShadow=G.recv;if(G.cdm)mm.customDepthMaterial=G.cdm;mm.matrixAutoUpdate=false;mm.updateMatrix();mm.userData.merged=true;scene.add(mm);
   batch.forEach(o=>{o.visible=false;});parts.forEach(g=>g.dispose());merged+=batch.length;made++;batch=[];nv=0;};
  G.list.forEach(o=>{const n=o.geometry.attributes.position.count;if(nv+n>60000)flush();batch.push(o);nv+=n;});flush();});
 STATIC_MARK=null;return [merged,made];}

/* ---------- culture des instances : on ne dessine que ce qui est devant la caméra ---------- */
const FRU=new THREE.Frustum(),PMX=new THREE.Matrix4(),SPH=new THREE.Sphere();
const CULL={dirty:true,x:1e9,z:1e9,y:0,yaw:9,pit:9,t:0,lists:[]};
const CROWN=[{y:4.3,r:2.5},{y:5.3,r:2.0},{y:5.6,r:1.7},{y:4.4,r:2.1},{y:5.6,r:1.5}];
const FIREC=new THREE.Color(2.5,1.05,0.22),EMBERC=new THREE.Color(1.25,0.22,0.05);
function treeLook(t){const V=TREEV[t.v];if(!V)return;if(!t.mt){t.mt=new Float32Array(16);t.ml=new Float32Array(16);t.ct=new THREE.Color();t.cl=new THREE.Color();}
 const burnt=t.st==='charred',burning=t.st==='burning',f=burning?clamp(1-t.burn/9,0,1):0;
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion().setFromAxisAngle(UPV,t.rot||0),p=new THREE.Vector3(t.x,(t.y||0)-0.08,t.z);
 m4.compose(p,q,new THREE.Vector3(t.s,t.s,t.s)).toArray(t.mt);
 const k=burnt?0.0001:burning?t.s*(1-0.6*f):t.s;m4.compose(p,q,new THREE.Vector3(k,k*(burning?1-0.25*f:1),k)).toArray(t.ml);
 t.ct.copy(WHITEC);if(burnt)t.ct.copy(CHARC);else if(burning)t.ct.lerp(CHARC,f*0.85);
 if(burnt)t.cl.copy(CHARC);else if(burning){if(f<0.3)t.cl.copy(t.c1).lerp(FIREC,f/0.3);else if(f<0.8)t.cl.copy(FIREC).lerp(EMBERC,(f-0.3)/0.5);else t.cl.copy(EMBERC).lerp(CHARC,(f-0.8)/0.2);}else t.cl.copy(t.c1);
 CULL.dirty=true;}
function treesDirty(){CULL.dirty=true;}
function burnFx(t,dt){const C=CROWN[t.v]||CROWN[0],f=clamp(1-t.burn/9,0,1),sh=1-0.6*f,y0=(t.y||0)+C.y*t.s*(1-0.12*f),R=C.r*t.s*sh;
 const n=Math.random()<0.5?3:2;for(let i=0;i<n;i++){const a=Math.random()*TAU,b=rnd(-0.6,1),rr=R*rnd(0.75,1.05);const x=t.x+Math.cos(a)*Math.cos(b)*rr,y=y0+Math.sin(b)*rr*(t.v>=3?1.4:0.8),z=t.z+Math.sin(a)*Math.cos(b)*rr;
  if(i===0)PN.emit(x,y,z,rnd(-.3,.3),rnd(1.4,3),rnd(-.3,.3),Math.random()<0.5?0xff5a14:0xff9a28,rnd(0.6,1.0)*t.s,0.15,rnd(.3,.55),-1,1,0.85);else PA.emit(x,y,z,rnd(-.3,.3),rnd(1.6,3.4),rnd(-.3,.3),Math.random()<0.5?0xff6a1e:0xffb43a,rnd(0.8,1.4)*t.s,0.1,rnd(.35,.7),-1,1);}
 if(Math.random()<dt*14)PA.emit(t.x+rnd(-R,R),y0+R*0.8,t.z+rnd(-R,R),rnd(-1,1),rnd(2,4),rnd(-1,1),0xffd27a,0.12,0.03,rnd(1,2),-0.4,0.3);
 if(Math.random()<dt*5)PN.emit(t.x+rnd(-1,1),y0+R+0.6,t.z+rnd(-1,1),rnd(-.3,.3),rnd(1.2,2),rnd(-.3,.3),0x2a2624,1.2*t.s,3.2*t.s,rnd(2,3),-0.25,0.35,0.5);}
function regInst(mesh,pos,rad,far,near){const n=mesh.count;const M=new Float32Array(mesh.instanceMatrix.array.subarray(0,n*16));const C=mesh.instanceColor?new Float32Array(mesh.instanceColor.array.subarray(0,n*3)):null;
 mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);CULL.lists.push({mesh,M,C,pos,n,rad,far,near:near||0});}
function cullAll(force){const cam=camera.position;camera.updateMatrixWorld();
 const yaw=Math.atan2(camera.matrixWorld.elements[8],camera.matrixWorld.elements[10]),pit=camera.matrixWorld.elements[9];CULL.t-=1;
 const moved=Math.hypot(cam.x-CULL.x,cam.z-CULL.z)>2||Math.abs(cam.y-CULL.y)>2||Math.abs(Math.atan2(Math.sin(yaw-CULL.yaw),Math.cos(yaw-CULL.yaw)))>0.1||Math.abs(pit-CULL.pit)>0.08;
 if(!force&&!CULL.dirty&&!moved&&CULL.t>0)return;CULL.x=cam.x;CULL.z=cam.z;CULL.y=cam.y;CULL.yaw=yaw;CULL.pit=pit;CULL.t=90;CULL.dirty=false;
 camera.matrixWorldInverse.copy(camera.matrixWorld).invert();PMX.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);FRU.setFromProjectionMatrix(PMX);
 const out=S&&S.zone&&S.zone!=='monde';const px=player.x||0,pz=player.z||0,FAR=(scene.fog?scene.fog.far:170)+12,FAR2=FAR*FAR;
 // arbres
 TREEV.forEach(V=>V.n=0);
 if(!out)for(const t of TREES){if(!t.mt)continue;const dx=t.x-cam.x,dz=t.z-cam.z,d2=dx*dx+dz*dz;if(d2>FAR2)continue;let vis=(t.x-px)*(t.x-px)+(t.z-pz)*(t.z-pz)<900;
  if(!vis){SPH.center.set(t.x,(t.y||0)+4*t.s,t.z);SPH.radius=7*t.s+5;vis=FRU.intersectsSphere(SPH);}if(!vis)continue;
  const V=TREEV[t.v];const k=V.n++;V.trunk.instanceMatrix.array.set(t.mt,k*16);V.leaf.instanceMatrix.array.set(t.ml,k*16);t.ct.toArray(V.trunk.instanceColor.array,k*3);t.cl.toArray(V.leaf.instanceColor.array,k*3);}
 TREEV.forEach(V=>{[V.trunk,V.leaf].forEach(m=>{m.count=V.n;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.visible=V.n>0;});});
 // herbe, fleurs
 for(const L of CULL.lists){const m=L.mesh;let k=0;if(!out){const far=L.far*(HQ?1:0.75),f2=far*far;for(let i=0;i<L.n;i++){const x=L.pos[i*3],y=L.pos[i*3+1],z=L.pos[i*3+2],dx=x-cam.x,dz=z-cam.z,d2=dx*dx+dz*dz;if(d2>f2)continue;if(d2>L.near*L.near){SPH.center.set(x,y,z);SPH.radius=L.rad;if(!FRU.intersectsSphere(SPH))continue;}
   if(k!==i){m.instanceMatrix.array.set(L.M.subarray(i*16,i*16+16),k*16);if(L.C)m.instanceColor.array.set(L.C.subarray(i*3,i*3+3),k*3);}k++;}}
  m.count=k;m.visible=k>0;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}}
function instPos(mesh){const n=mesh.count,P=new Float32Array(n*3),a=mesh.instanceMatrix.array;for(let i=0;i<n;i++){P[i*3]=a[i*16+12];P[i*3+1]=a[i*16+13];P[i*3+2]=a[i*16+14];}return P;}
const GRASS_FAR={value:60};
function grassFade(m){const ob=m.onBeforeCompile;m.onBeforeCompile=(sh,r)=>{ob(sh,r);sh.uniforms.uFar=GRASS_FAR;sh.vertexShader='uniform float uFar;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n{vec3 ip=(modelMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0)).xyz;float gd=distance(ip.xz,cameraPosition.xz);transformed*=smoothstep(uFar,uFar*0.7,gd);}\n#endif');};m.customProgramCacheKey=()=>'grass5';return m;}

/* ---------- caméra : évite le relief, cadre les dialogues ---------- */
let TALK=null;const TKV=new THREE.Vector3(),TKL=new THREE.Vector3();
function camClear(cp,dist){const sx=-Math.sin(camYaw)*Math.cos(cp),sz=-Math.cos(camYaw)*Math.cos(cp),sy=Math.sin(cp),hy=player.y+1.7;
 for(let d=0.5;d<=dist;d+=0.3){const x=player.x+sx*d,z=player.z+sz*d;if(gh(x,z)+0.55>hy+sy*d)return Math.max(0.9,d-0.6);}return dist;}
function talkCam(dt){const n=TALK.n;const mx=(player.x+n.x)/2,mz=(player.z+n.z)/2,dx=n.x-player.x,dz=n.z-player.z,d=Math.hypot(dx,dz)||1;
 const ux=dx/d,uz=dz/d;let sx=-uz,sz=ux;const cx0=player.x-Math.sin(camYaw)*5,cz0=player.z-Math.cos(camYaw)*5;if((cx0-mx)*sx+(cz0-mz)*sz<0){sx=-sx;sz=-sz;}
 const D=Math.max(5.2,d*1.3+3);let x=mx+sx*D-ux*1.7,z=mz+sz*D-uz*1.7;const g0=S.zone==='monde'?gh(mx,mz):0,gy=Math.max(S.zone==='monde'?gh(x,z):0,g0);
 TKV.set(x,gy+1.8,z);camera.position.lerp(TKV,Math.min(1,dt*5));TKL.set(mx-ux*0.2,g0+1.0,mz-uz*0.2);camera.lookAt(TKL);}
function setTalk(n){if(TALK&&TALK.n!==n)TALK.n.obj.children.forEach(o=>{if(o.isSprite)o.visible=true;});if(n)n.obj.children.forEach(o=>{if(o.isSprite)o.visible=false;});TALK=n?{n}:null;const w=window.innerWidth,h=window.innerHeight;if(n)camera.setViewOffset(w,h,0,Math.round(h*0.13),w,h);else camera.clearViewOffset();camera.updateProjectionMatrix();}

/* ---------- SON : moteur audio procédural (aucun fichier à télécharger) ---------- */
const AU={ctx:null,ready:false,music:0.55,sfx:0.8,mute:false,master:null,mus:null,fx:null,amb:null,rev:null,nb:null,beat:0,next:0,mood:'jour',want:'jour',bar:0,chord:0,stepT:0,ambN:{},last:{},cool:{}};
try{const a=JSON.parse(localStorage.getItem('aldermoor-audio')||'null');if(a){AU.music=a.music!=null?a.music:AU.music;AU.sfx=a.sfx!=null?a.sfx:AU.sfx;AU.mute=!!a.mute;}}catch(e){}
function auSave(){try{localStorage.setItem('aldermoor-audio',JSON.stringify({music:AU.music,sfx:AU.sfx,mute:AU.mute}));}catch(e){}}
function auInit(){if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
 let ctx;try{ctx=new C();}catch(e){return;}AU.ctx=ctx;
 const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=12;comp.ratio.value=4;comp.connect(ctx.destination);
 AU.master=ctx.createGain();AU.master.connect(comp);AU.mus=ctx.createGain();AU.fx=ctx.createGain();AU.amb=ctx.createGain();[AU.mus,AU.fx,AU.amb].forEach(g=>g.connect(AU.master));
 const len=Math.floor(ctx.sampleRate*2.6),ir=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2);}
 const cv=ctx.createConvolver();cv.buffer=ir;AU.rev=ctx.createGain();AU.rev.gain.value=0.8;AU.rev.connect(cv);cv.connect(AU.master);
 const nl=ctx.sampleRate*2,nb=ctx.createBuffer(1,nl,ctx.sampleRate),nd=nb.getChannelData(0);let b0=0,b1=0,b2=0;for(let i=0;i<nl;i++){const w=Math.random()*2-1;b0=0.99765*b0+w*0.099;b1=0.963*b1+w*0.2965;b2=0.57*b2+w*1.0526;nd[i]=(b0+b1+b2+w*0.1848)*0.22;}AU.nb=nb;
 const wl=ctx.sampleRate,wb=ctx.createBuffer(1,wl,ctx.sampleRate),wd=wb.getChannelData(0);for(let i=0;i<wl;i++)wd[i]=Math.random()*2-1;AU.wb=wb;
 auVol();AU.next=ctx.currentTime+0.3;AU.ready=true;ambBuild();}
function auVol(){if(!AU.ctx)return;const t=AU.ctx.currentTime;AU.mus.gain.setTargetAtTime(AU.mute?0:AU.music*0.5,t,0.3);AU.fx.gain.setTargetAtTime(AU.mute?0:AU.sfx,t,0.05);AU.amb.gain.setTargetAtTime(AU.mute?0:AU.sfx*0.8,t,0.3);}
['pointerdown','keydown','touchstart','touchend','click'].forEach(ev=>window.addEventListener(ev,()=>{auInit();},{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden)AU.ctx.suspend();else AU.ctx.resume();});
const mf=m=>440*Math.pow(2,(m-69)/12);
function spat(x,z,range){if(x==null)return {g:1,p:0};const dx=x-camera.position.x,dz=z-camera.position.z,d=Math.hypot(dx,dz);const g=clamp(1-d/(range||45),0,1);const rx=Math.cos(camYaw),rz=-Math.sin(camYaw);return {g:g*g,p:clamp((dx*rx+dz*rz)/(d+3),-0.8,0.8)};}
function outNode(pan,dest,rev){const ctx=AU.ctx;const p=ctx.createStereoPanner?ctx.createStereoPanner():null;const o=p||ctx.createGain();if(p)p.pan.value=pan||0;o.connect(dest||AU.fx);if(rev){const s=ctx.createGain();s.gain.value=rev;o.connect(s);s.connect(AU.rev);}return o;}
function tone(o){const ctx=AU.ctx;if(!ctx||!AU.ready)return;const t=o.t||ctx.currentTime,dur=o.dur||0.3,at=o.a==null?0.005:o.a;
 const osc=ctx.createOscillator();osc.type=o.type||'sine';osc.frequency.setValueAtTime(o.f,t);if(o.f2)osc.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+(o.glide||dur));if(o.det)osc.detune.value=o.det;
 const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,o.v||0.2),t+at);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 let n=osc;if(o.fm){const m=ctx.createOscillator(),mg=ctx.createGain();m.frequency.value=o.f*o.fm;mg.gain.setValueAtTime(o.f*(o.fmi||2),t);mg.gain.exponentialRampToValueAtTime(1,t+dur);m.connect(mg);mg.connect(osc.frequency);m.start(t);m.stop(t+dur+0.05);}
 if(o.lp){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(o.lp,t);if(o.lp2)f.frequency.exponentialRampToValueAtTime(o.lp2,t+dur);f.Q.value=o.q||0.7;n.connect(f);n=f;}
 n.connect(g);g.connect(outNode(o.pan,o.dest,o.rev));osc.start(t);osc.stop(t+dur+0.05);}
function noiz(o){const ctx=AU.ctx;if(!ctx||!AU.ready)return;const t=o.t||ctx.currentTime,dur=o.dur||0.3;const s=ctx.createBufferSource();s.buffer=o.white?AU.wb:AU.nb;s.loop=true;s.playbackRate.value=o.rate||1;
 const f=ctx.createBiquadFilter();f.type=o.ft||'bandpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+(o.glide||dur));f.Q.value=o.q||1;
 const g=ctx.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,o.v||0.2),t+(o.a||0.01));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 s.connect(f);f.connect(g);g.connect(outNode(o.pan,o.dest,o.rev));s.start(t,Math.random()*1.5);s.stop(t+dur+0.05);}
function sfxOK(k,gap){const now=performance.now();if(AU.cool[k]&&now-AU.cool[k]<(gap||40))return false;AU.cool[k]=now;return true;}
/* ---- effets ---- */
const SFX={
 click(){tone({f:880,f2:1320,dur:0.07,v:0.08,type:'triangle'});},
 step(surf,x,z){const s=spat(x,z,30);if(s.g<0.01)return;const v=0.16*s.g;
  if(surf==='eau'){noiz({f:900,f2:300,q:0.8,dur:0.22,v:v*1.2,pan:s.p,ft:'lowpass'});}
  else if(surf==='pierre'){noiz({f:2400,q:1.2,dur:0.06,v:v*0.9,pan:s.p,white:true});tone({f:180,f2:90,dur:0.06,v:v*0.4,pan:s.p});}
  else if(surf==='bois'){tone({f:220,f2:140,dur:0.08,v:v*0.8,type:'triangle',pan:s.p});noiz({f:900,q:2,dur:0.05,v:v*0.4,pan:s.p});}
  else{noiz({f:1500+Math.random()*500,q:0.7,dur:0.09,v:v*0.75,pan:s.p,ft:'lowpass'});}},
 jump(){noiz({f:500,f2:1400,q:0.8,dur:0.22,v:0.07});},
 land(k){tone({f:120,f2:50,dur:0.16,v:0.12*k});noiz({f:600,q:0.6,dur:0.14,v:0.08*k,ft:'lowpass'});},
 cast(el,form,x,z){const s=spat(x,z);if(s.g<0.01)return;const v=(form==='zone'?0.26:0.18)*s.g,p=s.p,R=0.25;const c=AU.ctx.currentTime;
  switch(el){
   case 'feu':noiz({f:300,f2:2200,q:0.7,dur:0.45,v:v*1.4,pan:p,rev:R,glide:0.3});noiz({f:180,q:0.5,dur:0.6,v:v*0.8,pan:p,ft:'lowpass',a:0.05});break;
   case 'glace':for(let i=0;i<4;i++)tone({t:c+i*0.035,f:mf(88+[0,4,7,12][i]+Math.floor(Math.random()*2)),dur:0.5,v:v*0.45,fm:3.5,fmi:1.5,pan:p,rev:0.5});noiz({f:6000,q:2,dur:0.25,v:v*0.4,pan:p,white:true});break;
   case 'eau':noiz({f:1400,f2:400,q:1.5,dur:0.4,v:v*1.1,pan:p,rev:R});tone({f:500,f2:900,dur:0.18,v:v*0.4,pan:p});tone({t:c+0.08,f:700,f2:1200,dur:0.12,v:v*0.3,pan:p});break;
   case 'vent':noiz({f:400,f2:1800,q:1.6,dur:0.6,v:v*1.6,pan:p,a:0.08,glide:0.45});break;
   case 'nature':noiz({f:2200,q:0.9,dur:0.3,v:v*0.7,pan:p});tone({f:196,f2:240,dur:0.25,v:v*0.6,type:'triangle',pan:p});tone({t:c+0.06,f:294,dur:0.3,v:v*0.4,type:'triangle',pan:p,rev:R});break;
   case 'lumiere':[0,4,7,12,16].forEach((n,i)=>tone({t:c+i*0.045,f:mf(81+n),dur:0.9,v:v*0.32,fm:2.76,fmi:0.6,pan:p,rev:0.7}));break;
   case 'ombre':tone({f:110,f2:55,dur:0.8,v:v*0.9,type:'sawtooth',lp:900,lp2:150,pan:p,rev:0.5,det:-12});tone({f:112,f2:56,dur:0.8,v:v*0.6,type:'sawtooth',lp:700,lp2:120,pan:p,det:15});break;
   default:for(let i=0;i<5;i++)tone({t:c+i*0.03,f:mf(84+Math.floor(Math.random()*12)),dur:0.25,v:v*0.3,type:'triangle',pan:p,rev:0.4});tone({f:1800,f2:400,dur:0.2,v:v*0.4,type:'square',lp:3000,pan:p});}},
 impact(el,x,z){if(!sfxOK('imp'+el,60))return;const s=spat(x,z);if(s.g<0.01)return;const v=0.24*s.g,p=s.p;
  if(el==='feu'){noiz({f:800,f2:200,q:0.6,dur:0.7,v:v*1.5,pan:p,ft:'lowpass',rev:0.3});tone({f:90,f2:40,dur:0.35,v:v,pan:p});}
  else if(el==='glace'){noiz({f:5000,q:1,dur:0.3,v:v*0.8,pan:p,white:true});for(let i=0;i<3;i++)tone({t:AU.ctx.currentTime+i*0.05,f:mf(90+Math.floor(Math.random()*8)),dur:0.4,v:v*0.3,fm:4.1,fmi:1,pan:p,rev:0.4});}
  else if(el==='eau'){noiz({f:1200,f2:300,q:0.7,dur:0.5,v:v*1.4,pan:p,ft:'lowpass'});tone({f:400,f2:1100,dur:0.12,v:v*0.3,pan:p});}
  else if(el==='nature'){noiz({f:700,q:1.2,dur:0.5,v:v*0.9,pan:p});tone({f:150,f2:110,dur:0.3,v:v*0.6,type:'triangle',pan:p});}
  else if(el==='lumiere'){tone({f:mf(88),dur:1.2,v:v*0.4,fm:2.76,fmi:0.5,pan:p,rev:0.8});}
  else if(el==='ombre'){tone({f:70,f2:40,dur:0.9,v:v*0.9,type:'sawtooth',lp:500,lp2:80,pan:p});}
  else{tone({f:1200,f2:200,dur:0.25,v:v*0.5,type:'triangle',pan:p});noiz({f:2500,q:2,dur:0.15,v:v*0.4,pan:p});}},
 learn(){const c=AU.ctx.currentTime;[0,4,7,11,14,19].forEach((n,i)=>tone({t:c+i*0.07,f:mf(74+n),dur:1.4,v:0.11,fm:2,fmi:0.3,rev:0.7}));},
 level(){const c=AU.ctx.currentTime;[0,4,7,12,16,19,24].forEach((n,i)=>{tone({t:c+i*0.08,f:mf(67+n),dur:1.6,v:0.12,type:'triangle',rev:0.6});tone({t:c+i*0.08,f:mf(79+n),dur:1.2,v:0.05,rev:0.6});});noiz({t:c+0.5,f:6000,q:0.5,dur:1.5,v:0.04,a:0.4,white:true});},
 quest(){const c=AU.ctx.currentTime;[[0,0],[4,0.14],[7,0.28],[12,0.42]].forEach(([n,d])=>{tone({t:c+d,f:mf(72+n),dur:0.9,v:0.13,type:'triangle',rev:0.5});tone({t:c+d,f:mf(60+n),dur:0.9,v:0.07,rev:0.4});});},
 newq(){const c=AU.ctx.currentTime;tone({t:c,f:mf(79),dur:0.5,v:0.08,type:'triangle',rev:0.4});tone({t:c+0.12,f:mf(86),dur:0.7,v:0.08,type:'triangle',rev:0.4});},
 pick(){const c=AU.ctx.currentTime;tone({t:c,f:mf(84),dur:0.25,v:0.09,type:'triangle'});tone({t:c+0.07,f:mf(91),dur:0.35,v:0.08,type:'triangle',rev:0.3});},
 chest(){const c=AU.ctx.currentTime;tone({f:140,f2:260,dur:0.5,v:0.08,type:'sawtooth',lp:900,q:4});[0,7,12,16].forEach((n,i)=>tone({t:c+0.35+i*0.06,f:mf(84+n),dur:0.8,v:0.08,fm:3,fmi:0.4,rev:0.6}));},
 brew(){const c=AU.ctx.currentTime;for(let i=0;i<9;i++)tone({t:c+i*0.11+Math.random()*0.05,f:300+Math.random()*400,f2:700+Math.random()*500,dur:0.09,v:0.06});tone({t:c+1.1,f:mf(84),dur:0.9,v:0.08,fm:2.76,fmi:0.4,rev:0.6});},
 drink(){for(let i=0;i<4;i++)tone({t:AU.ctx.currentTime+i*0.16,f:240,f2:160,dur:0.12,v:0.08,lp:900});},
 thunder(x,z){const s=spat(x,z,140);const c=AU.ctx.currentTime;noiz({t:c+0.25,f:300,f2:60,q:0.4,dur:3.2,v:0.5*Math.max(0.3,s.g),a:0.05,ft:'lowpass',pan:s.p,rev:0.6,glide:2.5});noiz({t:c+0.25,f:2500,q:0.5,dur:0.2,v:0.2*Math.max(0.3,s.g),white:true,pan:s.p});},
 poof(x,z){const s=spat(x,z);noiz({f:1600,f2:300,q:0.8,dur:0.35,v:0.18*s.g,pan:s.p});tone({f:600,f2:150,dur:0.3,v:0.08*s.g,type:'triangle',pan:s.p});},
 hitC(x,z){if(!sfxOK('hitc',70))return;const s=spat(x,z);tone({f:300,f2:120,dur:0.12,v:0.12*s.g,type:'square',lp:1400,pan:s.p});},
 hurt(){tone({f:220,f2:90,dur:0.25,v:0.18,type:'sawtooth',lp:1200});noiz({f:800,q:0.8,dur:0.2,v:0.12});},
 gong(){const c=AU.ctx.currentTime;[1,2.41,3.9,5.3].forEach((r,i)=>tone({t:c,f:98*r,dur:3.2-i*0.5,v:0.16/(i+1),rev:0.7}));},
 win(){const c=AU.ctx.currentTime;[[0,0],[4,0.16],[7,0.32],[12,0.5],[7,0.66],[12,0.82]].forEach(([n,d],i)=>{tone({t:c+d,f:mf(67+n),dur:i==5?1.6:0.5,v:0.14,type:'sawtooth',lp:2400,rev:0.4});tone({t:c+d,f:mf(55+n),dur:i==5?1.6:0.5,v:0.08,type:'triangle'});});},
 lose(){const c=AU.ctx.currentTime;[[7,0],[6,0.3],[5,0.6],[0,0.9]].forEach(([n,d])=>tone({t:c+d,f:mf(60+n),dur:0.7,v:0.12,type:'triangle',rev:0.5}));},
 shield(){tone({f:300,f2:900,dur:0.5,v:0.1,fm:1.5,fmi:1,rev:0.5});},
 whoosh(x,z){const s=spat(x,z);noiz({f:500,f2:2500,q:2,dur:0.25,v:0.12*s.g,pan:s.p});},
 door(){tone({f:90,f2:70,dur:0.4,v:0.14,type:'triangle'});noiz({f:300,q:0.8,dur:0.35,v:0.1,ft:'lowpass'});}
};
function sfx(name,...a){if(!AU.ready||AU.mute)return;try{SFX[name](...a);}catch(e){}}
/* ---- ambiances continues (vent, pluie, eau, feu, grillons) ---- */
function ambBuild(){const ctx=AU.ctx;const mk=(ft,f,q,white)=>{const s=ctx.createBufferSource();s.buffer=white?AU.wb:AU.nb;s.loop=true;const fl=ctx.createBiquadFilter();fl.type=ft;fl.frequency.value=f;fl.Q.value=q;const g=ctx.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(AU.amb);s.start(0,Math.random());return {s,fl,g};};
 AU.ambN={wind:mk('bandpass',500,0.6),rain:mk('highpass',1200,0.5,true),water:mk('lowpass',650,0.7),fall:mk('bandpass',900,0.4),fire:mk('bandpass',1800,0.8),room:mk('lowpass',180,0.8)};}
let auT=0,birdT=3,critT=0,dripT=2,crackT=0;
function ambTick(dt){if(!AU.ready||!started)return;const N=AU.ambN,c=AU.ctx.currentTime,z=S.zone||'monde',W=(S.weather&&S.weather.w)||'clair',night=nightK>0.55;
 const set=(n,v,tc)=>N[n].g.gain.setTargetAtTime(v,c,tc||0.6);
 if(z==='monde'){const alt=clamp((player.y-3)/6,0,1);let wv=(FLY.on?Math.min(0.22,Math.hypot(player.vx,player.vy,player.vz)*0.012):0)+0.035+alt*0.05+(W==='orage'?0.12:W==='neige'?0.06:W==='brume'?0.01:0)+(W==='pluie'?0.03:0);N.wind.fl.frequency.setTargetAtTime(380+Math.sin(c*0.3)*160+alt*200,c,1);set('wind',wv*(0.7+0.3*Math.sin(c*0.23)));
  set('rain',W==='pluie'?0.16:W==='orage'?0.24:0);
  const dl=Math.hypot(player.x-LAKE.x,player.z-LAKE.z)-LAKE.r,dr=riverDist(player.x,player.z);set('water',clamp(1-Math.min(dl,dr+2)/16,0,1)*0.12+(player.swim?0.08:0));
  const dw=Math.hypot(player.x-50,player.z+51);set('fall',clamp(1-dw/30,0,1)*0.22);
  let fb=0;for(const t of TREES){if(t.st==='burning'){const d=Math.hypot(t.x-player.x,t.z-player.z);fb+=clamp(1-d/35,0,1);}}set('fire',Math.min(0.2,fb*0.07),0.3);set('room',0);
  if(fb>0.05){crackT-=dt;if(crackT<=0){crackT=rnd(0.03,0.15)/Math.min(3,fb);noiz({f:rnd(1500,4000),q:3,dur:0.03,v:Math.min(0.12,0.04*fb),white:true,dest:AU.amb});}}
  if(!night&&W!=='pluie'&&W!=='orage'){birdT-=dt;if(birdT<=0){birdT=rnd(1.5,6);const a=Math.random()*TAU,r=rnd(10,35);bird(player.x+Math.cos(a)*r,player.z+Math.sin(a)*r);}}
  if(night&&W!=='orage'){critT-=dt;if(critT<=0){critT=rnd(0.4,1.4);cricket();}}}
 else{set('wind',z==='grotte'||z==='donjon'?0.02:0);set('rain',0);set('water',z==='grotte'?0.05:0);set('fall',0);
  const fireRoom=z==='auberge'||z==='salle';set('fire',fireRoom?0.05:0);set('room',z==='donjon'||z==='grotte'?0.12:0.05);
  if(fireRoom){crackT-=dt;if(crackT<=0){crackT=rnd(0.08,0.5);noiz({f:rnd(1500,4000),q:3,dur:0.03,v:0.05,white:true,dest:AU.amb});}}
  if(z==='grotte'||z==='donjon'){dripT-=dt;if(dripT<=0){dripT=rnd(0.6,2.8);tone({f:rnd(900,1700),f2:rnd(1800,2600),dur:0.12,v:0.05,dest:AU.amb,rev:0.9,pan:rnd(-0.7,0.7)});}}}}
function bird(x,z){const s=spat(x,z,50);if(s.g<0.02)return;const c=AU.ctx.currentTime;const base=rnd(2200,3600),n=2+Math.floor(Math.random()*4),kind=Math.random();
 for(let i=0;i<n;i++){const t=c+i*rnd(0.09,0.16);if(kind<0.5)tone({t,f:base,f2:base*rnd(1.2,1.5),dur:0.07,v:0.05*s.g,pan:s.p,dest:AU.amb,rev:0.3});else tone({t,f:base*1.3,f2:base*0.8,dur:0.1,v:0.045*s.g,pan:s.p,dest:AU.amb,fm:0.5,fmi:0.3,rev:0.3});}}
function cricket(){const c=AU.ctx.currentTime,f=rnd(4200,4800),p=rnd(-0.8,0.8);for(let i=0;i<3;i++)tone({t:c+i*0.06,f,dur:0.04,v:0.018,pan:p,dest:AU.amb});}
/* ---- musique générative selon l'heure, le lieu et l'action ---- */
const MOODS={
 jour:{bpm:76,root:62,prog:[[0,4,7],[-3,0,4],[5,9,12],[7,11,14]],scale:[0,2,4,7,9,12,14,16],pad:0.05,arp:0.06,mel:0.07,bass:0.07,bell:0.03,dens:0.55},
 nuit:{bpm:58,root:62,prog:[[0,3,7],[-2,2,5],[3,7,10],[-2,1,5]],scale:[0,2,3,7,9,12,14,15],pad:0.06,arp:0.04,mel:0.05,bass:0.05,bell:0.04,dens:0.35},
 grotte:{bpm:52,root:57,prog:[[0,3,7],[1,5,8],[0,3,7],[-2,2,5]],scale:[0,1,3,7,8,12,13,15],pad:0.06,arp:0.0,mel:0.0,bass:0.06,bell:0.06,dens:0.25},
 auberge:{bpm:104,root:62,prog:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],scale:[0,2,4,5,7,9,11,12],pad:0.02,arp:0.07,mel:0.06,bass:0.08,bell:0,dens:0.7,lute:1},
 salle:{bpm:70,root:60,prog:[[0,4,7],[5,9,12],[-3,0,4],[7,11,14]],scale:[0,2,4,7,9,12,14,16],pad:0.05,arp:0.05,mel:0.06,bass:0.06,bell:0.02,dens:0.5},
 duel:{bpm:112,root:57,prog:[[0,3,7],[-4,0,3],[-2,2,5],[-5,-1,2]],scale:[0,2,3,5,7,8,11,12],pad:0.04,arp:0.07,mel:0.05,bass:0.1,bell:0,dens:0.75,perc:1}};
function moodNow(){if(typeof DUEL!=='undefined'&&DUEL)return 'duel';const z=S.zone||'monde';if(z==='donjon'||z==='grotte')return 'grotte';if(z==='auberge')return 'auberge';if(z==='salle'||z==='biblio_int')return 'salle';return nightK>0.55?'nuit':'jour';}
function musTick(){if(!AU.ready||AU.mute||AU.music<=0.001)return;const ctx=AU.ctx;AU.want=started?moodNow():'nuit';
 while(AU.next<ctx.currentTime+0.25){const M=MOODS[AU.mood],spb=60/M.bpm/2,t=AU.next,s=AU.beat%16;
  if(s===0){if(AU.want!==AU.mood){AU.mood=AU.want;}AU.chord=(AU.chord+1)%4;const MM=MOODS[AU.mood],ch=MM.prog[AU.chord];
   if(MM.pad)ch.forEach((n,i)=>{tone({t,f:mf(MM.root+n-12),dur:spb*16.5,a:spb*4,v:MM.pad*0.5,type:'sawtooth',lp:700,det:i*7-7,dest:AU.mus,rev:0.5});});
   if(MM.bass)tone({t,f:mf(MM.root+ch[0]-24),dur:spb*7,a:0.02,v:MM.bass,type:'triangle',dest:AU.mus});}
  const MM=MOODS[AU.mood],ch=MM.prog[AU.chord];
  if(MM.bass&&s===8)tone({t,f:mf(MM.root+ch[0]-24+(Math.random()<0.5?7:0)),dur:spb*7,a:0.02,v:MM.bass*0.8,type:'triangle',dest:AU.mus});
  if(MM.arp&&(MM.lute?true:s%2===0)&&Math.random()<MM.dens+0.25){const n=ch[(s>>(MM.lute?0:1))%3]+(s%8>=4?12:0);tone({t,f:mf(MM.root+n),dur:MM.lute?0.5:1.4,a:0.004,v:MM.arp*(MM.lute?0.8:1),type:'triangle',lp:MM.lute?2200:3200,dest:AU.mus,rev:0.35});}
  if(MM.mel&&s%4===0&&Math.random()<MM.dens){AU.mi=clamp((AU.mi||3)+Math.floor(rnd(-2,3)),0,MM.scale.length-1);tone({t,f:mf(MM.root+12+MM.scale[AU.mi]),dur:spb*(Math.random()<0.4?6:3),a:0.02,v:MM.mel,type:'sine',fm:2,fmi:0.25,dest:AU.mus,rev:0.6});}
  if(MM.bell&&s%8===4&&Math.random()<0.4){const n=MM.scale[Math.floor(Math.random()*MM.scale.length)];tone({t,f:mf(MM.root+24+n),dur:2.2,v:MM.bell,fm:2.76,fmi:0.5,dest:AU.mus,rev:0.8});}
  if(MM.perc){if(s%4===0)tone({t,f:120,f2:45,dur:0.18,v:0.16,dest:AU.mus});if(s%8===4)noiz({t,f:1800,q:0.7,dur:0.12,v:0.07,dest:AU.mus,white:true});if(s%2===1&&Math.random()<0.6)noiz({t,f:7000,q:1,dur:0.03,v:0.025,dest:AU.mus,white:true});}
  AU.beat++;AU.next+=spb;}}
/* ---- pas, sauts, atterrissages ---- */
let stepAcc=0,wasGround=true,lastVy=0;
function surfAt(){const z=S.zone||'monde';if(player.swim||player.wade)return 'eau';if(z==='auberge'||z==='biblio_int')return 'bois';if(z!=='monde')return 'pierre';
 if(Math.hypot(player.x,player.z-2)<11.5||Math.hypot(player.x,player.z+46)<16||player.y>gh(player.x,player.z)+0.2)return 'pierre';if(pathDist(player.x,player.z)<1.8)return 'chemin';return 'herbe';}
function moveSnd(dt){if(!AU.ready||!player.H)return;const sp=Math.hypot(player.vx,player.vz);
 if(player.grounded&&sp>0.6){stepAcc+=dt*sp/(sp>6?2.6:1.9);if(stepAcc>=1){stepAcc=0;sfx('step',surfAt(),player.x,player.z);}}
 if(!wasGround&&player.grounded&&lastVy<-6)sfx('land',clamp(-lastVy/16,0.3,1));wasGround=player.grounded;lastVy=player.vy;}
function audioTick(dt){if(!AU.ctx)return;musTick();auT-=dt;if(auT<=0){auT=0.25;ambTick(0.25);}moveSnd(dt);}

/* ---------- DUELS DANS L'ARÈNE ---------- */
const ARENA={x:-12,z:30,r:8.3};
const WEAKOF={feu:'eau',glace:'feu',ombre:'lumiere',nature:'vent',arcane:'ombre',vent:'nature',eau:'glace',lumiere:'ombre'};
const DUELISTS=[
 {id:'golem',name:'Mannequin enchanté',el:'arcane',lvl:1,hp:60,dmg:7,rate:3.0,spd:1.7,shield:0,wave:0,multi:0,dodge:0,look:{skin:0xb8a07a,hair:0x6a5a3a,style:'bald',robe:0x8a7a5a,trim:0x5a4a2a,h:1.05,w:1.15},line:'Le mannequin grince et lève un bras de bois.'},
 {id:'lila',name:'Lila Brisevent',el:'vent',lvl:2,npc:'lila',hp:90,dmg:9,rate:2.4,spd:3.2,shield:0.12,wave:0.12,multi:0,dodge:0.15,line:'« Prépare-toi à mordre la poussière ! »'},
 {id:'corentin',name:'Corentin Ardent',el:'feu',lvl:5,hp:110,dmg:11,rate:2.1,spd:3.4,shield:0.18,wave:0.2,multi:0.15,dodge:0.2,look:{skin:0xe8b890,hair:0xc84a1a,style:'short',hat:0x7a1a0a,robe:0xa83a1a,trim:0xffb040,h:1.02},line:'« Tu vas avoir chaud ! »'},
 {id:'selene',name:'Sélène Givrecœur',el:'glace',lvl:9,hp:130,dmg:12,rate:1.9,spd:3.6,shield:0.25,wave:0.25,multi:0.25,dodge:0.25,look:{skin:0xf4e4dc,hair:0xe0f0ff,style:'long',hat:0x2a4a7a,robe:0x4a7ab8,trim:0xcff4ff,h:0.98},line:'« Ne bouge pas. Ce sera rapide. »'},
 {id:'mael',name:'Maël Sombrelune',el:'ombre',lvl:13,hp:150,dmg:14,rate:1.7,spd:3.9,shield:0.3,wave:0.3,multi:0.35,dodge:0.32,look:{skin:0xc89a7a,hair:0x0a0a12,style:'long',hat:0x0d0a1a,robe:0x241838,trim:0x8a6ac8,h:1.04},line:'« L’ombre ne pardonne pas. »'},
 {id:'orvane',name:'Pr. Orvane',el:'arcane',lvl:16,npc:'orvane',hp:200,dmg:15,rate:1.5,spd:3.6,shield:0.35,wave:0.35,multi:0.4,dodge:0.35,line:'« Montrez-moi ce que vous avez appris. »'}];
let DUEL=null,DPROJ=[],DWAVES=[],DUEL_INV=null;
const duelRec=()=>S.duels||(S.duels={w:0,l:0,best:{}});
function duelOpen(d){const n=d.npc?NPCOBJ(d.npc):null;if(d.npc&&(!n||n.sleep))return 'absent';if(lvl()<d.lvl)return 'niv';if(d.id==='orvane'&&duelRec().w<3)return 'wins';return 'ok';}
function duelMenu(){const R=duelRec();const items=DUELISTS.map(d=>{const st=duelOpen(d),b=R.best[d.id];const why=st==='niv'?'niveau '+d.lvl+' requis':st==='absent'?'absent pour le moment':st==='wins'?'3 victoires requises':'';
 return {t:esc(d.name)+' <small style="color:'+hex(ELEM[d.el].c)+'">'+ELEM[d.el].n+'</small>',s:(b?'✓ battu · ':'')+(why||'niveau conseillé '+d.lvl),off:st!=='ok',fn:()=>{closePick();startDuel(d);}};});
 openPick('⚔ Arène des duels','Victoires '+R.w+' · Défaites '+R.l+'. Esquive les sorts adverses en te déplaçant, saute par-dessus les ondes au sol, et vise leur faiblesse.',items);}
function makeDuelist(d){const look=d.look||NPCBY[d.npc].look;const H=makeHuman(look);const l=nearFade(label(d.name,'#ffb0b0'));l.position.y=2.35*look.h;H.root.add(l);return H;}
function startDuel(d){if(DUEL||S.zone!=='monde')return;fade(()=>{
 const n=d.npc?NPCOBJ(d.npc):null;if(n){n.obj.visible=false;n.inDuel=true;}
 player.x=ARENA.x;player.z=ARENA.z+5.2;player.y=gh(player.x,player.z);player.vx=player.vz=player.vy=0;player.ry=Math.PI;camYaw=Math.PI;camPitch=0.32;
 const H=makeDuelist(d);const ox=ARENA.x,oz=ARENA.z-5.2;
 const e=addEnt('creature',ox,oz,H.root,{duel:true,name:d.name,hp:d.hp,weak:WEAKOF[d.el],look:d.el,y:1.15,rad:0.85,scale:1,kx:0,kz:0,frozen:0,burn:0,rooted:0,confused:0,H},Infinity);
 const sh=new THREE.Mesh(new THREE.SphereGeometry(1.2,20,14),basic(ELEM[d.el].c,{transparent:true,opacity:0.0,blending:THREE.AdditiveBlending,depthWrite:false}));sh.position.y=1.1;H.root.add(sh);
 const hpx=Math.round(d.hp*(1+0.1*Math.max(0,lvl()-d.lvl)));DUEL={d,e,H,n,sh,php:100,pmax:100,ohp:hpx,omax:hpx,t:0,phase:'intro',cd:2.2,waveCd:5+Math.random()*3,shCd:4,shield:0,wind:0,ang:-Math.PI/2,dir:Math.random()<0.5?1:-1,out:0,wu:null,hitT:0};
 DPROJ=[];DWAVES=[];if(AIMO.duelLock){AIM.lock={kind:'crea',ref:e};AIM.lockZone='monde';AIM.pt=null;}document.body.classList.add('induel');$('#duel').classList.remove('hidden');duelHUD();banner('Duel !',d.name+' · faiblesse : ?');setTimeout(()=>{if(DUEL&&DUEL.d===d){DUEL.phase='fight';}},1600);
 say('⚔ <b>'+esc(d.name)+'</b> : '+esc(d.line),'gm');sfx('gong');});}
function banner(t,s){const b=$('#banner');b.innerHTML='<b>'+esc(t)+'</b>'+(s?'<small>'+esc(s)+'</small>':'');b.classList.remove('hidden');b.style.animation='none';void b.offsetWidth;b.style.animation='';clearTimeout(banner.t);banner.t=setTimeout(()=>b.classList.add('hidden'),2300);}
function duelHUD(){if(!DUEL)return;$('#du-pn').textContent=S.name;$('#du-on').textContent=DUEL.d.name;$('#du-p i').style.width=clamp(DUEL.php/DUEL.pmax*100,0,100)+'%';$('#du-o i').style.width=clamp(DUEL.ohp/DUEL.omax*100,0,100)+'%';$('#du-o i').style.background=hex(ELEM[DUEL.d.el].c);
 $('#du-w').innerHTML=DUEL.known?'faiblesse : <b style="color:'+hex(ELEM[WEAKOF[DUEL.d.el]].c)+'">'+ELEM[WEAKOF[DUEL.d.el]].n+'</b>':'';}
function duelHurt(e,el,x,z){const D=e.data;if(!DUEL||DUEL.e!==e||DUEL.phase!=='fight')return;
 if(DUEL.shield>0){DUEL.shield=0;burst(e.x,1.4,e.z,ELEM[DUEL.d.el].c,20,4);sfx('shield');floatAt(e.x,e.z,'Bouclier !','#bfe8ff');return;}
 const weak=WEAKOF[DUEL.d.el]===el;const big=DUEL.lastForm==='zone';let dmg=(big?(weak?24:14):(weak?13:7))*Math.min(1.5,pow(el));if(!weak&&el===DUEL.d.el)dmg*=0.5;dmg=Math.round(dmg);DUEL.ohp-=dmg;
 if(weak&&!DUEL.known){DUEL.known=true;say('💥 Point faible trouvé : <b>'+ELEM[el].n+'</b> !','gm');}
 floatAt(e.x,e.z,'-'+dmg,weak?'#ffd27a':'#ffffff');burst(e.x,1.3,e.z,ELEM[el].c,14,4);sfx('hitC',e.x,e.z);e.data.H.cast=0;DUEL.wind=0;DUEL.wu=null;
 if(el==='feu')D.burn=2;if(el==='glace')D.frozen=1.4;if(el==='nature')D.rooted=1.8;const d=Math.hypot(e.x-x,e.z-z)||1;D.kx+=(e.x-x)/d*5;D.kz+=(e.z-z)/d*5;
 duelHUD();if(DUEL.ohp<=0)duelEnd(true);}
function floatAt(x,z,t,col){const l=label(t,col,2.2);l.position.set(x,gh(x,z)+2.6,z);scene.add(l);FT.push({l,t:0});}
function duelCast(multi){const D=DUEL,e=D.e,el=D.d.el,c=ELEM[el].c;const tp=new THREE.Vector3();D.H.p.tip.getWorldPosition(tp);
 const shots=multi?3:1;for(let i=0;i<shots;i++){const tx=player.x+player.vx*0.18*(D.d.lvl>8?1:0),tz=player.z+player.vz*0.18*(D.d.lvl>8?1:0);let dx=tx-tp.x,dz=tz-tp.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const a=(i-(shots-1)/2)*0.22;const ca=Math.cos(a),sa=Math.sin(a);const vx=dx*ca-dz*sa,vz=dx*sa+dz*ca;
  const g=new THREE.Group();g.add(new THREE.Mesh(G.ball||new THREE.SphereGeometry(0.2,10,8),coreMat(el)));g.add(glow(c,1.3,0.9));g.position.copy(tp);scene.add(g);
  const sp=13+D.d.lvl*0.25;DPROJ.push({o:g,vx:vx*sp,vz:vz*sp,vy:(player.y+1.1-tp.y)/ (L/sp),life:2.2,el});}
 sfx('cast',el,e.x,e.z);flash(tp.x,tp.y,tp.z,c,1.6,0.3);}
function duelWave(){const D=DUEL,e=D.e;const m=new THREE.Mesh(new THREE.RingGeometry(0.85,1,48).rotateX(-Math.PI/2),basic(ELEM[D.d.el].c,{transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.set(e.x,gh(e.x,e.z)+0.15,e.z);scene.add(m);
 DWAVES.push({m,x:e.x,z:e.z,r:0.6,hit:false});sfx('whoosh',e.x,e.z);flash(e.x,0.5,e.z,ELEM[D.d.el].c,2.5,0.5);}
function duelAI(e,dt){const D=DUEL;if(!D||D.e!==e){removeEnt(e);return;}const Dd=e.data,H=Dd.H,t=performance.now()/1000;e.t+=dt;
 let spd=0;const stuck=Dd.frozen>0||Dd.rooted>0;
 if(Dd.frozen>0){Dd.frozen-=dt;if(Math.random()<dt*8)PA.emit(e.x,1.2,e.z,rnd(-.4,.4),rnd(0,.5),rnd(-.4,.4),0xffffff,0.2,0.03,0.6,0,0);}
 if(Dd.rooted>0){Dd.rooted-=dt;if(Math.random()<dt*6)PN.emit(e.x+rnd(-.4,.4),0.2,e.z+rnd(-.4,.4),0,rnd(.2,.6),0,0x3f8f2a,0.2,0.15,0.8,0,0,1);}
 if(Dd.burn>0){Dd.burn-=dt;fireAt(e.x,gh(e.x,e.z)+0.6,e.z,0.4,1);Dd.bt=(Dd.bt||0)+dt;if(Dd.bt>0.5){Dd.bt=0;if(D.phase==='fight'){D.ohp-=2;duelHUD();if(D.ohp<=0){duelEnd(true);return;}}}}
 if(Dd.confused>0)Dd.confused-=dt;
 if(D.phase==='fight'&&!stuck){D.ang+=D.dir*dt*(D.d.spd/6);if(Math.random()<dt*0.25)D.dir*=-1;const rr=5.2+Math.sin(t*0.7)*1.2;let tx=ARENA.x+Math.cos(D.ang)*rr,tz=ARENA.z+Math.sin(D.ang)*rr;
  if(Dd.confused>0){tx=e.x+Math.sin(t*3)*2;tz=e.z+Math.cos(t*2.3)*2;}
  for(const p of PROJ){const dx=p.o.position.x-e.x,dz=p.o.position.z-e.z,dd=Math.hypot(dx,dz);if(dd<5&&dd>1&&(p.vx*dx+p.vz*dz)<0&&!p.dodged){p.dodged=1;if(Math.random()<D.d.dodge){const sx=-p.vz,sz=p.vx,sl=Math.hypot(sx,sz)||1,s=Math.random()<0.5?1:-1;Dd.kx+=sx/sl*7*s;Dd.kz+=sz/sl*7*s;sfx('whoosh',e.x,e.z);}}}
  const dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz);if(d>0.2){const s=Math.min(d,D.d.spd*dt);e.x+=dx/d*s;e.z+=dz/d*s;spd=D.d.spd/6;}
  if(Dd.confused<=0){D.cd-=dt;D.waveCd-=dt;D.shCd-=dt;
   if(D.wu){D.wu.t-=dt;H.cast=0.3;if(Math.random()<dt*20){const tp=new THREE.Vector3();H.p.tip.getWorldPosition(tp);PA.emit(tp.x,tp.y,tp.z,rnd(-.5,.5),rnd(-.5,.5),rnd(-.5,.5),ELEM[D.d.el].c,0.35,0.05,0.3,0,1);}
    if(D.wu.k==='wave'&&Math.random()<dt*30){const a=Math.random()*TAU;PA.emit(e.x+Math.cos(a)*0.9,gh(e.x,e.z)+0.1,e.z+Math.sin(a)*0.9,0,rnd(.5,1.5),0,ELEM[D.d.el].c,0.3,0.05,0.4,0,0);}
    if(D.wu.t<=0){const k=D.wu.k;D.wu=null;if(k==='wave')duelWave();else duelCast(k==='multi');}}
   else if(D.shCd<=0&&D.shield<=0&&Math.random()<D.d.shield){D.shCd=9;D.shield=6;sfx('shield');}
   else if(D.waveCd<=0&&Math.random()<D.d.wave*3){D.waveCd=6+Math.random()*4;D.wu={k:'wave',t:0.75};}
   else if(D.cd<=0){D.cd=D.d.rate*rnd(0.8,1.25);D.wu={k:Math.random()<D.d.multi?'multi':'one',t:0.45};}}}
 e.x+=Dd.kx*dt;e.z+=Dd.kz*dt;Dd.kx*=Math.max(0,1-4*dt);Dd.kz*=Math.max(0,1-4*dt);
 const o={x:e.x,z:e.z};pushOut(o,0.4);const ad=Math.hypot(o.x-ARENA.x,o.z-ARENA.z);if(ad>ARENA.r-0.5){o.x=ARENA.x+(o.x-ARENA.x)/ad*(ARENA.r-0.5);o.z=ARENA.z+(o.z-ARENA.z)/ad*(ARENA.r-0.5);}e.x=o.x;e.z=o.z;
 if(D.shield>0){D.shield-=dt;D.sh.material.opacity=0.22+Math.sin(t*8)*0.06;}else D.sh.material.opacity=0;
 H.root.position.set(e.x,gh(e.x,e.z),e.z);if(D.phase!=='end')H.root.rotation.y=Math.atan2(player.x-e.x,player.z-e.z);animHuman(H,dt,stuck?0:spd,t,false);
 if(D.phase==='end'&&D.won){H.root.rotation.x=Math.min(1.45,(H.root.rotation.x||0)+dt*3);}}
function duelTick(dt){if(!DUEL)return;const D=DUEL;D.t+=dt;
 DPROJ=DPROJ.filter(p=>{p.life-=dt;const o=p.o.position;o.x+=p.vx*dt;o.y+=p.vy*dt;o.z+=p.vz*dt;if(Math.random()<0.6)PA.emit(o.x,o.y,o.z,rnd(-.3,.3),rnd(-.3,.3),rnd(-.3,.3),ELEM[p.el].c,0.3,0.05,0.35,0,1);
  const dx=player.x-o.x,dz=player.z-o.z,dy=player.y+1.0-o.y;let hit=false;
  if(D.phase==='fight'&&dx*dx+dz*dz<0.55&&Math.abs(dy)<1.05){hit=true;duelPlayerHit(D.d.dmg,o.x,o.z,p.el);}
  if(!hit&&(p.life<=0||hitsSolid(o.x,o.z)||o.y<gh(o.x,o.z))){burst(o.x,o.y,o.z,ELEM[p.el].c,8,2);hit=true;}
  if(hit){scene.remove(p.o);return false;}return true;});
 DWAVES=DWAVES.filter(w=>{w.r+=dt*7.5;w.m.scale.setScalar(w.r);w.m.material.opacity=0.85*clamp(1-w.r/12,0,1);const pd=Math.hypot(player.x-w.x,player.z-w.z);
  if(!w.hit&&D.phase==='fight'&&Math.abs(pd-w.r)<0.55&&player.y-gh(player.x,player.z)<0.45){w.hit=true;duelPlayerHit(Math.round(D.d.dmg*1.2),player.x,player.z,D.d.el,true);}
  if(w.r>12){scene.remove(w.m);w.m.geometry.dispose();return false;}return true;});
 if(D.phase==='fight'){const ad=Math.hypot(player.x-ARENA.x,player.z-ARENA.z);if(ad>ARENA.r+2){if(D.out===0)say('⚠ Reviens dans l’arène ou tu abandonnes le duel !','sys');D.out+=dt;if(D.out>4){duelEnd(false,true);}}else D.out=0;
  if(D.hitT>0){D.hitT-=dt;}}
 if(D.phase==='end'){D.endT-=dt;if(D.endT<=0)duelClean();}}
function duelPlayerHit(dmg,x,z,el,wave){const D=DUEL;if(!D)return;if(BUFF.invis)dmg=Math.round(dmg*0.5);D.php-=dmg;D.hitT=0.4;sfx('hurt');
 const hv=$('#hurt');hv.style.opacity=0.85;setTimeout(()=>hv.style.opacity=0,180);burst(player.x,1.2,player.z,ELEM[el].c,14,3);
 const d=Math.hypot(player.x-x,player.z-z)||1;if(!wave){player.vx+=(player.x-x)/d*6;player.vz+=(player.z-z)/d*6;}else{player.vy=Math.max(player.vy,4);player.grounded=false;}
 floatAt(player.x,player.z,'-'+dmg,'#ff8080');duelHUD();if(D.php<=0)duelEnd(false);}
function duelEnd(won,forfeit){const D=DUEL;if(!D||D.phase==='end')return;D.phase='end';D.won=won;D.endT=2.6;DPROJ.forEach(p=>scene.remove(p.o));DPROJ=[];
 const R=duelRec();const d=D.d;
 if(won){R.w++;const first=!R.best[d.id];R.best[d.id]=(R.best[d.id]||0)+1;const xp=25+d.lvl*6+(first?20:0);sfx('win');banner('Victoire !',d.name+' est à terre');gainXP(xp);
  say('🏆 Tu remportes le duel contre <b>'+esc(d.name)+'</b> (+'+xp+' XP)','gm');chron('Duel gagné contre '+d.name+'.');if(d.npc)S.rep[d.npc]=clamp((S.rep[d.npc]||0)+1,-10,10);
  if(first&&Math.random()<0.8){const sp=genSpell(d.el);learnSpell(sp);}else if(Math.random()<0.4){addItem('essence',1);say('Tu récupères une <b>essence élémentaire</b>.','sys');}
  if(R.w===5)say('🎖 Titre obtenu : <b>Champion de l’arène</b> !','gm');}
 else{R.l++;sfx('lose');banner(forfeit?'Abandon':'Défaite',forfeit?'Tu as quitté l’arène':d.name+' l’emporte');gainXP(8);say((forfeit?'Tu abandonnes le duel.':'Tu es à terre ! <b>'+esc(d.name)+'</b> remporte le duel.')+' (+8 XP pour l’effort)','gm');chron('Duel perdu contre '+d.name+'.');
  if(!forfeit){player.vy=3;}}
 save();}
function duelClean(){const D=DUEL;if(!D)return;removeEnt(D.e);DWAVES.forEach(w=>scene.remove(w.m));DWAVES=[];if(D.n){D.n.inDuel=false;D.n.obj.visible=!D.n.sleep;D.n.x=D.e.x;D.n.z=D.e.z;D.n.tx=D.n.x;D.n.tz=D.n.z;}
 DUEL=null;document.body.classList.remove('induel');$('#duel').classList.add('hidden');if(!D.won)mana=Math.max(mana,manaMax()*0.5);}
function duelAbort(){if(!DUEL)return;DUEL.phase='end';DUEL.endT=0;duelClean();}
function duelInvite(id){const d=DUELISTS.find(x=>x.npc===id);if(!d)return false;const st=duelOpen(d);
 if(st==='niv'){return '« Reviens quand tu seras niveau '+d.lvl+'. »';}if(st==='wins'){return '« Gagnez d’abord trois duels dans l’arène, ensuite on en reparlera. »';}
 if(inLoc('arene',1)){setTimeout(()=>{closeDlg();startDuel(d);},700);return '« Très bien. En garde ! »';}
 DUEL_INV={d,until:S.time+150};S.npcLoc[id]='arene';setTimeout(()=>{if(S.npcLoc[id]==='arene'&&!DUEL)delete S.npcLoc[id];},120000);S.wp='arene';
 return '« Un duel ? Avec plaisir ! Retrouve-moi à l’Arène des duels. »';}
function duelInvTick(){if(!DUEL_INV||DUEL)return;if(S.time>DUEL_INV.until){DUEL_INV=null;return;}if(S.zone==='monde'&&inLoc('arene',-2)&&!anyModal()){const d=DUEL_INV.d;DUEL_INV=null;if(S.wp==='arene')S.wp=null;startDuel(d);}}

/* ---------- fenêtre de choix générique ---------- */
function openPick(title,sub,items){$('#pick-t').textContent=title;$('#pick-s').innerHTML=sub||'';const L=$('#pick-l');L.innerHTML='';
 items.forEach(it=>{const b=document.createElement('button');b.className='pk'+(it.off?' off':'');b.innerHTML='<span>'+it.t+'</span>'+(it.s?'<small>'+it.s+'</small>':'');if(!it.off)b.onclick=()=>{sfx('click');it.fn();};L.appendChild(b);});
 $('#pick').classList.remove('hidden');}
function closePick(){$('#pick').classList.add('hidden');}
$('#pick-x').onclick=closePick;

/* ---------- carte du monde ---------- */
let MAPBASE=null;const MAPW=200;
function mapXY(x,z,W){return [(x+MAPW/2)/MAPW*W,(z+MAPW/2)/MAPW*W];}
function buildMapBase(){const N=360,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),img=g.createImageData(N,N),d=img.data;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=i/N*MAPW-MAPW/2,z=j/N*MAPW-MAPW/2,h=gh(x,z),r=Math.hypot(x,z);let R=78,Gc=112,B=58;
  const sh=clamp((gh(x-0.8,z-0.8)-h)*0.9,-0.6,0.6);if(r>96){R=110;Gc=106;B=92;}
  if(Math.hypot(x+48,z-52)<22){R-=18;Gc-=16;B-=12;}if(h>6.5){R+=14;Gc+=14;B+=6;}
  if(pathDist(x,z)<1.7){R=170;Gc=150;B=110;}if(Math.hypot(x,z-2)<11.5){R=165;Gc=160;B=148;}if(Math.hypot(x+12,z-30)<8.6){R=206;Gc=184;B=132;}
  if(inLake({x,z})||riverDist(x,z)<1.6){R=52;Gc=110;B=168;}else if(inPool(x,z)){R=48;Gc=78;B=58;}
  const k=1+sh;const o=(j*N+i)*4;d[o]=clamp(R*k,0,255);d[o+1]=clamp(Gc*k,0,255);d[o+2]=clamp(B*k,0,255);d[o+3]=255;}
 g.putImageData(img,0,0);const s=N/MAPW;
 g.fillStyle='rgba(28,52,26,0.75)';for(const t of TREES){g.beginPath();g.arc((t.x+MAPW/2)*s,(t.z+MAPW/2)*s,1.3*t.s*s,0,TAU);g.fill();}
 g.fillStyle='rgba(70,62,58,0.9)';for(const c of COLS){if(c.tree||c.lake||c.off||c.z<-150||c.z>150)continue;if(c.r!==undefined){if(c.r<1.2)continue;g.beginPath();g.arc((c.x+MAPW/2)*s,(c.z+MAPW/2)*s,c.r*s,0,TAU);g.fill();}else g.fillRect((c.x-c.hw+MAPW/2)*s,(c.z-c.hd+MAPW/2)*s,c.hw*2*s,c.hd*2*s);}
 MAPBASE=c;}
function openMap(){if(!MAPBASE)buildMapBase();$('#map').classList.remove('hidden');drawMap();}
function drawMap(){const cv=$('#map-c'),W=Math.min(window.innerWidth-24,560);cv.width=W*2;cv.height=W*2;cv.style.width=cv.style.height=W+'px';const g=cv.getContext('2d');g.setTransform(2,0,0,2,0,0);
 g.drawImage(MAPBASE,0,0,W,W);g.strokeStyle='rgba(243,207,122,.5)';g.lineWidth=1;g.strokeRect(0.5,0.5,W-1,W-1);
 const P=(x,z)=>mapXY(x,z,W);const inside=S.zone!=='monde';let px=player.x,pz=player.z;if(inside){const Z=ZONES[S.zone];if(Z&&Z.door){px=Z.door.x;pz=Z.door.z;}else if(GRATE){px=GRATE.x;pz=GRATE.z;}}
 g.font='600 11px Inter, sans-serif';g.textAlign='center';
 ENT.forEach(e=>{if(e.z<-150||e.z>150)return;const [x,y]=P(e.x,e.z);if(e.kind==='event'){g.fillStyle='#ffd27a';g.font='800 14px Inter';g.fillText('!',x,y+5);g.font='600 11px Inter, sans-serif';}else if(e.kind==='creature'&&!e.data.duel){g.fillStyle='#ff6a6a';g.beginPath();g.arc(x,y,2.4,0,TAU);g.fill();}});
 npcs.forEach(n=>{if(n.sleep||n.z>150||n.z<-150||n.inDuel)return;const [x,y]=P(n.x,n.z);g.fillStyle='#ffc6ef';g.beginPath();g.arc(x,y,3.2,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.font='600 9px Inter, sans-serif';g.fillText(n.d.name.replace(/^(Pr\.|Mère) /,'').split(' ')[0],x,y-5);g.font='600 11px Inter, sans-serif';});
 const q=trackedQuest();if(q){const t=stepTarget(q);if(t&&t.z>-150&&t.z<150){const [x,y]=P(t.x,t.z);star(g,x,y,7,'#f3cf7a');}}
 LOCS.forEach(L=>{if(L.hidden&&!(S.found||{})[L.id])return;const [x,y]=P(L.x,L.z);const on=S.wp===L.id;g.fillStyle=on?'rgba(255,122,224,.95)':'rgba(16,12,36,.72)';const tw=g.measureText(L.name).width+12;g.beginPath();if(g.roundRect)g.roundRect(x-tw/2,y-9,tw,17,8);else g.rect(x-tw/2,y-9,tw,17);g.fill();g.fillStyle=on?'#fff':'#f3e9d0';g.fillText((on?'📍 ':'')+L.name,x,y+4);});
 const [x,y]=P(px,pz);g.save();g.translate(x,y);g.rotate(-player.ry+Math.PI);g.fillStyle='#fff';g.strokeStyle='#23305e';g.lineWidth=2;g.beginPath();g.moveTo(0,-8);g.lineTo(6,6);g.lineTo(0,3);g.lineTo(-6,6);g.closePath();g.stroke();g.fill();g.restore();
 const cy=Math.cos(camYaw),sy=Math.sin(camYaw);g.strokeStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(x,y);g.lineTo(x+sy*22,y+cy*22);g.stroke();
 $('#map-s').innerHTML=(inside?'Tu es à l’intérieur : <b>'+esc(ZONES[S.zone].n)+'</b>. ':'')+'Touche un lieu pour y placer un repère'+(S.wp?' (touche-le à nouveau pour l’enlever)':'')+'.';
 cv.onclick=ev=>{const r=cv.getBoundingClientRect(),mx=ev.clientX-r.left,my=ev.clientY-r.top;let best=null,bd=26;LOCS.forEach(L=>{const [lx,ly]=P(L.x,L.z);const d=Math.hypot(lx-mx,ly-my);if(d<bd){bd=d;best=L;}});
  if(best){S.wp=S.wp===best.id?null:best.id;sfx('click');if(S.wp)say('📍 Repère placé : <b>'+esc(best.name)+'</b>','sys');drawMap();save();}};}
function star(g,x,y,r,c){g.fillStyle=c;g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-Math.PI/2,rr=i%2?r*0.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fill();}
$('#map-x').onclick=()=>$('#map').classList.add('hidden');

/* ---------- options ---------- */
function openOpts(){$('#opts').classList.remove('hidden');renderOpts();}
function renderOpts(){const q=['légers (plus fluide)','élevés','ultra (halo lumineux)'][QL];
 $('#opts-b').innerHTML='<div class="op"><span>Graphismes</span><button class="ghost sm" id="o-q">'+q+'</button></div>'+
 '<div class="op"><span>Personnages</span><button class="ghost sm" id="o-pe">'+(MDL_ON?'3D peints':'d’origine')+'</button></div>'+
 (MDL_ON?'<div class="op"><span>Ton apparence</span><button class="ghost sm" id="o-lk">'+(MDL_LOOKS.find(l=>l[0]===MDL_LOOK)||MDL_LOOKS[0])[1]+'</button></div>':'')+
 '<div class="op"><span>Maître du Jeu IA</span><button class="ghost sm" id="o-mj">'+(aiState==='on'?'✦ actif':'brancher ma clé')+'</button></div>'+
 '<div class="op"><span>Musique</span><input type="range" min="0" max="100" id="o-mu" value="'+Math.round(AU.music*100)+'"></div>'+
 '<div class="op"><span>Effets & ambiance</span><input type="range" min="0" max="100" id="o-fx" value="'+Math.round(AU.sfx*100)+'"></div>'+
 '<div class="op"><span>Son</span><button class="ghost sm" id="o-m">'+(AU.mute?'🔇 coupé':'🔊 activé')+'</button></div>'+
 '<div class="op"><span>Plein écran</span><button class="ghost sm" id="o-fs">'+(document.fullscreenElement?'activé':'activer')+'</button></div>'+
 '<div class="op"><span>Compteur d’images</span><button class="ghost sm" id="o-f">'+(FPSV.on?'affiché':'masqué')+'</button></div>'+
 '<div class="op"><span>Caméra</span><button class="ghost sm" id="o-cam">'+CAM_MODES[CAMA.mode]+'</button></div>'+
 '<div class="op"><span>Visée des sorts</span><button class="ghost sm" id="o-am">'+({camera:'là où je regarde',libre:'viseur libre (haut/bas)',perso:'devant mon perso'}[AIMO.mode]||'là où je regarde')+'</button></div>'+
 '<div class="op"><span>Aide à la visée</span><button class="ghost sm" id="o-as">'+(AIMO.assist?'activée':'désactivée')+'</button></div>'+
 '<div class="op"><span>Cible auto en duel</span><button class="ghost sm" id="o-dl">'+(AIMO.duelLock?'oui':'non')+'</button></div>'+
 '<div class="op"><span>Toucher pour viser</span><button class="ghost sm" id="o-tp">'+(AIMO.tap?'activé':'désactivé')+'</button></div>'+
 '<div class="op"><span>Caméra suit la cible</span><button class="ghost sm" id="o-fo">'+(AIMO.follow?'oui':'non')+'</button></div>'+
 '<div class="op"><span>Sensibilité caméra</span><input type="range" min="40" max="200" id="o-se" value="'+Math.round(AIMO.sens*100)+'"></div>'+
 '<div class="op"><span>Distance caméra</span><input type="range" min="50" max="180" id="o-zo" value="'+Math.round(CAMZ*100)+'"></div>'+
 '<p class="note">Aide à la visée : petit cercle sur la créature la plus proche et sorts qui corrigent un peu leur trajectoire. Désactive-la pour viser toi-même. Viseur libre : le sort part vers le cercle au centre de l’écran, en haut comme en bas.</p>'+
 '<p class="note">Visée : touche une créature ou un objet pour le cibler, touche le sol pour viser un point, touche deux fois pour recentrer la caméra. Pince avec deux doigts pour zoomer. Glisse vers le bas pour regarder le ciel.</p>'+
 '<p class="note">Si le jeu saccade, passe en « légers ». Le réglage est mémorisé.</p>';
 $('#o-q').onclick=()=>{QL=(QL+1)%3;try{localStorage.setItem('aldermoor-q',['lq','hq','uq'][QL]);localStorage.setItem('aldermoor-qman','1');}catch(e){}applyQuality();renderOpts();};
 $('#o-cam').onclick=()=>{camModeNext();renderOpts();};$('#o-pe').onclick=()=>{mdlStyle(!MDL_ON);renderOpts();};{const lk=$('#o-lk');if(lk)lk.onclick=()=>{mdlNextLook();renderOpts();};}$('#o-fs').onclick=()=>{fullScreen(!document.fullscreenElement);setTimeout(renderOpts,400);};$('#o-mj').onclick=()=>{$('#opts').classList.add('hidden');openMjk();};$('#o-mu').oninput=e=>{AU.music=e.target.value/100;auVol();auSave();};$('#o-fx').oninput=e=>{AU.sfx=e.target.value/100;auVol();auSave();};
 $('#o-m').onclick=()=>{AU.mute=!AU.mute;auInit();auVol();auSave();renderOpts();};$('#o-f').onclick=()=>{FPSV.on=!FPSV.on;$('#fps').classList.toggle('hidden',!FPSV.on);renderOpts();};
 $('#o-am').onclick=()=>{AIMO.mode={camera:'libre',libre:'perso',perso:'camera'}[AIMO.mode]||'camera';aimSave();renderOpts();if(AIMO.mode==='libre'&&!S.seenLibre){S.seenLibre=1;say('🎯 <b>Viseur libre</b> : tes sorts partent vers le cercle au centre de l’écran. Lève ou baisse la caméra pour viser haut ou bas.','sys');}};$('#o-as').onclick=()=>{AIMO.assist=!AIMO.assist;aimSave();renderOpts();};$('#o-dl').onclick=()=>{AIMO.duelLock=!AIMO.duelLock;aimSave();renderOpts();if(DUEL&&!AIMO.duelLock&&AIM.lock&&AIM.lock.ref===DUEL.e)AIM.lock=null;};$('#o-tp').onclick=()=>{AIMO.tap=!AIMO.tap;aimSave();renderOpts();};$('#o-fo').onclick=()=>{AIMO.follow=!AIMO.follow;aimSave();renderOpts();};
 $('#o-se').oninput=e=>{AIMO.sens=e.target.value/100;aimSave();};$('#o-zo').oninput=e=>{CAMZ=e.target.value/100;try{localStorage.setItem('aldermoor-zoom',CAMZ.toFixed(2));}catch(er){}};}
$('#opts-x').onclick=()=>$('#opts').classList.add('hidden');
$('#b-map').onclick=()=>{if(started&&!anyModal()){sfx('click');openMap();}};$('#b-opt').onclick=()=>{if(started&&!anyModal()){sfx('click');openOpts();}};
$('#b-q').addEventListener('click',()=>{try{localStorage.setItem('aldermoor-qman','1');}catch(e){}});
document.addEventListener('pointerdown',e=>{const t=e.target.closest&&e.target.closest('.rbtn,.chip,.tab,.gold,.ghost');if(t&&t.id!=='o-q')sfx('click');},true);

/* ---------- qualité automatique & compteur d'images ---------- */
const FPSV={on:false,acc:0,n:0,t:0};const AQ={t:0,acc:0,n:0,done:false,slow:0};
function fpsTick(dt){FPSV.acc+=dt;FPSV.n++;FPSV.t+=dt;if(FPSV.t>0.5){if(FPSV.on)$('#fps').textContent=Math.round(FPSV.n/FPSV.acc)+' i/s · '+renderer.info.render.calls+' appels';FPSV.acc=0;FPSV.n=0;FPSV.t=0;}}
function autoQ(dt){if(window.__noAutoQ)return;let man=false;try{man=!!localStorage.getItem('aldermoor-qman');}catch(e){}if(man)return;
 if(!AQ.done){AQ.t+=dt;if(AQ.t<2.5)return;AQ.acc+=dt;AQ.n++;if(AQ.acc<5)return;const fps=AQ.n/AQ.acc;AQ.done=true;
  if(fps<33&&QL>=1){QL=0;applyQuality();try{localStorage.setItem('aldermoor-q','lq');}catch(e){}say('⚙ Graphismes passés en « légers » automatiquement pour plus de fluidité (Options ⚙).','sys');}
  else if(fps<45&&QL===2){QL=1;applyQuality();try{localStorage.setItem('aldermoor-q','hq');}catch(e){}say('⚙ Graphismes passés en « élevés » pour plus de fluidité.','sys');}return;}
 if(QL>=1){AQ.slow=dt>1/24?AQ.slow+dt:Math.max(0,AQ.slow-dt*0.5);if(AQ.slow>8){AQ.slow=0;QL=0;applyQuality();try{localStorage.setItem('aldermoor-q','lq');}catch(e){}say('⚙ Le jeu ralentissait : graphismes passés en « légers » (Options ⚙).','sys');}}}

/* ---------- repère personnel (placé depuis la carte) ---------- */
const _updateTracker=updateTracker;
updateTracker=function(){if(DUEL){$('#tracker').classList.add('hidden');beacon.visible=false;return;}
 const L=S.wp&&LOCBY[S.wp];if(!L)return _updateTracker();
 if(S.zone==='monde'&&inLoc(S.wp,-2)){say('📍 Tu es arrivé : <b>'+esc(L.name)+'</b>','sys');S.wp=null;return _updateTracker();}
 const t=nav({x:L.spot.x,z:L.spot.z});const el=$('#tracker');el.classList.remove('hidden');$('#tr-q').textContent='📍 Repère';
 const dist=Math.hypot(t.x-player.x,t.z-player.z);const tx=t.x-player.x,tz=t.z-player.z,fx=Math.sin(camYaw),fz=Math.cos(camYaw);$('#arrow').style.transform='rotate('+Math.atan2(tx*(-fz)+tz*fx,tx*fx+tz*fz)+'rad)';
 beacon.visible=S.zone==='monde';beacon.position.set(t.x,gh(t.x,t.z),t.z);$('#tr-s').textContent=L.name+' · '+Math.round(dist)+' m';};

/* ---------- branchements : son, duels, caméra de dialogue ---------- */
{const _cs=castSpell;castSpell=function(sp){const c0=CD[sp.id];const r=_cs.apply(this,arguments);if(CD[sp.id]!==c0)sfx('cast',sp.el,sp.form,player.x,player.z);return r;};}
{const _im=impact;impact=function(el,x,y,z,h){sfx('impact',el,x,z);return _im.apply(this,arguments);};}
{const _j=jump;jump=function(){const v0=player.vy;const r=_j.apply(this,arguments);if(player.vy>v0+3)sfx('jump');return r;};}
{const _l=learnSpell;learnSpell=function(sp){const r=_l.apply(this,arguments);if(r)sfx('learn');else sfx('pick');return r;};}
{const _f=finishQuest;finishQuest=function(q){sfx('quest');return _f.apply(this,arguments);};}
{const _a=addQuest;addQuest=function(q){const n=S.quests.length;const r=_a.apply(this,arguments);if(S.quests.length>n)sfx('newq');return r;};}
{const _lv=levelFx;levelFx=function(){sfx('level');return _lv.apply(this,arguments);};}
{const _oc=openChest;openChest=function(e){const o=e.data.open;const r=_oc.apply(this,arguments);if(!o&&e.data.open)sfx('chest');return r;};}
{const _b=brew;brew=function(pid){const n=S.inv['p_'+pid]||0;const r=_b.apply(this,arguments);if((S.inv['p_'+pid]||0)>n)sfx('brew');return r;};}
{const _d=drink;drink=function(pid){const n=S.inv['p_'+pid]||0;const r=_d.apply(this,arguments);if((S.inv['p_'+pid]||0)<n)sfx('drink');return r;};}
{const _st=strike;strike=function(){const r=_st.apply(this,arguments);sfx('thunder',player.x+rnd(-20,20),player.z+rnd(-20,20));return r;};}
{const _ai=addItem;addItem=function(id,n){const r=_ai.apply(this,arguments);if(started&&!/^p_/.test(id))sfx('pick');return r;};}
{const _k=killCreature;killCreature=function(e){if(e&&e.data&&e.data.duel)return;sfx('poof',e.x,e.z);return _k.apply(this,arguments);};}
{const _h=hurtCreature;hurtCreature=function(e,el,x,z){if(e&&e.data&&e.data.duel)return duelHurt(e,el,x,z);sfx('hitC',e.x,e.z);return _h.apply(this,arguments);};}
{const _ez=enterZone;enterZone=function(id){sfx('door');if(DUEL)duelAbort();return _ez.apply(this,arguments);};}
{const _xz=exitZone;exitZone=function(){sfx('door');return _xz.apply(this,arguments);};}
{const _ed=enterDungeon;enterDungeon=function(){sfx('door');if(DUEL)duelAbort();return _ed.apply(this,arguments);};}
{const _xd=exitDungeon;exitDungeon=function(){sfx('door');return _xd.apply(this,arguments);};}
{const _nf=nightfall;nightfall=function(){if(DUEL)duelAbort();DUEL_INV=null;return _nf.apply(this,arguments);};}
{const _od=openDlg;openDlg=function(ctx){const r=_od.apply(this,arguments);if(ctx&&ctx.mode==='talk'&&DUELISTS.some(d=>d.npc===ctx.npc.id)){const b=document.createElement('button');b.className='chip duel';b.textContent='⚔ Un duel ?';b.onclick=()=>send('Je te défie en duel !');$('#chips').appendChild(b);}return r;};}
{const _sd=send;send=async function(text){const t=String(text||'').trim();if(dlgCtx&&dlgCtx.mode==='talk'&&!busy&&/duel|d[ée]fi|affront|bats?[- ]toi|combat/i.test(t)&&DUELISTS.some(d=>d.npc===dlgCtx.npc.id)){$('#dlg-in').value='';line('p',t);const ans=duelInvite(dlgCtx.npc.id);line('n',ans||'« Pas maintenant. »');const h=CHATS[dlgCtx.npc.id];if(h){h.push({w:'p',t});h.push({w:'n',t:ans});}return;}return _sd.apply(this,arguments);};}
station({x:ARENA.x-7.3,z:ARENA.z+0.2,reach:2.4,hint:()=>S.zone==='monde'&&!DUEL?'Défier un duelliste':null,act:duelMenu});
function buildArenaStone(){const x=ARENA.x-7.3,z=ARENA.z+0.2,y=gh(x,z);mesh(new THREE.CylinderGeometry(0.45,0.6,1.1,10),ROCKM,x,y+0.55,z);const c=mesh(G.cry,mat(0xff7a7a,{emissive:0xff3a3a,emissiveIntensity:0.8}),x,y+1.45,z,null,false);c.scale.set(0.8,1.3,0.8);const gl=glow(0xff6a6a,2.2,0.6);gl.position.set(x,y+1.45,z);scene.add(gl);addCol({x,z,r:0.55});}

const CAMFADE=[];function camFade(){const c=camera.position;for(const f of CAMFADE){const v=f.m.position.distanceTo(c)>f.r;if(f.m.visible!==v)f.m.visible=v;}}
const HUMAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.82,metalness:0.04});
function bakeHuman(H){const keep=new Set([H.p.cape,H.p.skirt]);const groups=new Set();H.root.traverse(o=>{if(o.isMesh&&!keep.has(o)&&o.parent)groups.add(o.parent);});
 groups.forEach(g=>{const ms=g.children.filter(o=>o.isMesh&&!keep.has(o)&&o.material&&o.material.color&&!o.material.transparent&&o.material.side!==THREE.DoubleSide);if(ms.length<2)return;
  const parts=[],cols=[];ms.forEach(o=>{o.updateMatrix();const ge=o.geometry.clone();if(!ge.index){const n=ge.attributes.position.count,ia=new Uint16Array(n);for(let i=0;i<n;i++)ia[i]=i;ge.setIndex(new THREE.BufferAttribute(ia,1));}ge.applyMatrix4(o.matrix);parts.push(ge);cols.push(o.material.color);});
  const geo=concatGeos(parts);const n=geo.attributes.position.count,ca=new Float32Array(n*3);let off=0;parts.forEach((pg,i)=>{const c=cols[i],m=pg.attributes.position.count;for(let k=0;k<m;k++){ca[(off+k)*3]=c.r;ca[(off+k)*3+1]=c.g;ca[(off+k)*3+2]=c.b;}off+=m;});
  geo.setAttribute('color',new THREE.BufferAttribute(ca,3));const mm=new THREE.Mesh(geo,HUMAT);mm.castShadow=true;g.add(mm);ms.forEach(o=>g.remove(o));parts.forEach(q=>q.dispose());});
 H.small=[];}
const ZG={};
function groupZones(){const box=new THREE.Box3(),c=new THREE.Vector3();const kids=scene.children.slice();
 ['salle','biblio_int','auberge','grotte','donjon'].forEach(k=>{const g=new THREE.Group();g.visible=false;ZG[k]=g;scene.add(g);});
 kids.forEach(o=>{if(o.isLight||o.isCamera||o===skyMesh||o===cubeCam)return;let x=o.position.x,z=o.position.z;if(Math.abs(z)<1&&Math.abs(x)<1){box.setFromObject(o);if(box.isEmpty())return;box.getCenter(c);x=c.x;z=c.z;}
  let k=null;if(z<-300)k='donjon';else if(z>300){for(const q of ['salle','biblio_int','auberge','grotte'])if(Math.abs(x-ZONES[q].O.x)<60)k=q;}if(k)ZG[k].add(o);});}
function zoneVis(){const zk=S&&S.zone;for(const k in ZG){const v=zk===k;if(ZG[k].visible!==v)ZG[k].visible=v;}}
let SMALLG=null;function smallG(){return SMALLG||(SMALLG=new Set([HG.eye,HG.nose,HG.hand,HG.foot,HG.belt,HG.neck,HG.wand,HG.bun,HG.pony,HG.beard]));}
let lodT=0;function lodTick(dt){lodT-=dt;if(lodT>0)return;lodT=0.3;const c=camera.position;const hs=[];npcs.forEach(n=>hs.push([n.H,n.x,n.z]));if(DUEL)hs.push([DUEL.H,DUEL.e.x,DUEL.e.z]);
 hs.forEach(([H,x,z])=>{if(!H||!H.small)return;const v=Math.hypot(x-c.x,z-c.z)<24;if(H.lodV!==v){H.lodV=v;H.small.forEach(o=>o.visible=v);}});
 const bz=S.zone==='biblio_int';if(BOOKS.length&&BOOKS[0].m.visible!==bz)BOOKS.forEach(b=>b.m.visible=bz);}
/* ---------- boucle de l'étape 5 ---------- */
function tick5(dt){zoneVis();cullAll();audioTick(dt);if(!started)return;
 if(!tick5.h){tick5.h=1;['lila','orvane'].forEach(id=>{if(S.npcLoc&&S.npcLoc[id]==='arene')delete S.npcLoc[id];});if(S.wp==='arene'&&!DUEL_INV)S.wp=null;if(!S.seen5){S.seen5=1;setTimeout(()=>say('🗺 Nouveau : la <b>carte</b> (bouton 🗺, touche un lieu pour y placer un repère) et les <b>options</b> ⚙ (son, graphismes).','sys'),4000);}}
 if(S.locId==='arene'&&!DUEL&&!S.seenAr){S.seenAr=1;say('⚔ La <b>pierre rouge</b> de l’arène permet de défier un duelliste. Tu peux aussi proposer un duel à Lila.','sys');}
 if(TALK&&$('#dlg').classList.contains('hidden'))setTalk(null);
 if(!TALK&&dlgCtx&&dlgCtx.mode==='talk'&&!$('#dlg').classList.contains('hidden')){const n=npcs.find(n=>n.d.id===dlgCtx.npc.id);if(n)setTalk(n);}
 duelTick(dt*ef());duelInvTick();tick8(dt);autoQ(dt);fpsTick(dt);lodTick(dt);camFade();aimTick(dt);world4Tick(dt);}

