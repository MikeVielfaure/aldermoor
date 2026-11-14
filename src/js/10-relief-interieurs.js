/* ================= ÉTAPE 3 : RELIEF, INTÉRIEURS, GRAPHISMES ================= */
const PC={x:52,z:-56},RAMP={x:0.45,z:0.893};
const RIVER=[[50,-51],[46.5,-47.6],[43.6,-44.8],[41.4,-41.8],[42.5,-36],[44,-30],[46.5,-22],[47,-14],[46,-6],[44.5,3],[43,13]];
let HF=null,HN=0,riverMat=null,composer=null,cubeT=0;
let GCRY=[],GCAGE=null,CANDLES=[],BOOKS=[],FIRES=[],CRYS=[];
const T3={};
function segDist(x,z,x1,z1,x2,z2){const dx=x2-x1,dz=z2-z1,L2=dx*dx+dz*dz||1;const t=clamp(((x-x1)*dx+(z-z1)*dz)/L2,0,1);return Math.hypot(x-(x1+dx*t),z-(z1+dz*t));}
function riverDist(x,z){if(x<36||x>55||z<-56||z>18)return 99;let m=99;for(let i=0;i<RIVER.length-1;i++){const d=segDist(x,z,RIVER[i][0],RIVER[i][1],RIVER[i+1][0],RIVER[i+1][1]);if(d<m)m=d;}return m;}
function flatPathDist(x,z){let m=1e9;for(const [x1,z1,x2,z2] of PATHS){const d=segDist(x,z,x1,z1,x2,z2);if(d<m)m=d;}return m;}
function plateauH(x,z){const dx=x-PC.x,dz=z-PC.z,r=Math.hypot(dx,dz);if(r<14)return 8;const c=(dx*RAMP.x+dz*RAMP.z)/r;const w=3.5+30*Math.pow(Math.max(0,c),6);if(r>14+w)return -99;const t=(r-14)/w;return 8*(1-t*t*(3-2*t));}
function terrainH(x,z){const r=Math.hypot(x,z);let flat=0;
 for(const l of LOCS){if(l.id==='hauteurs')continue;const d=Math.hypot(x-l.x,z-l.z);if(d<l.r+14)flat=Math.max(flat,smooth(l.r+14,l.r+4,d));}
 flat=Math.max(flat,smooth(7,3,flatPathDist(x,z)),smooth(26,15,Math.hypot(x,z-2)),smooth(24,16,Math.hypot(x-LAKE.x,z-LAKE.z)));
 const bdx=Math.max(0,Math.abs(x)-16),bdz=Math.max(0,-60-z,z+34);flat=Math.max(flat,smooth(10,2,Math.hypot(bdx,bdz)));
 let h=(noise(x*0.7,z*0.7)*0.9+noise(x*0.21+5,z*0.21-3)*1.3)*(1-flat);
 h=Math.max(h,plateauH(x,z));
 if(r>96){const k=r-96;h=Math.max(h,k*0.55+Math.max(0,noise(x*0.6,z*0.6))*Math.min(1,k/8)*5);}
 const rd=riverDist(x,z);if(rd<3.4)h-=0.7*smooth(3.4,1.3,rd);
 h-=poolCarve(x,z);
 return h;}
function gh(x,z){if(!HF||z<-200||z>200)return 0;const s=260/HN;let fx=(x+130)/s,fz=(z+130)/s;if(fx<0||fz<0||fx>=HN||fz>=HN)return 0;const ix=Math.floor(fx),iz=Math.floor(fz);fx-=ix;fz-=iz;const W=HN+1;const a=HF[iz*W+ix],b=HF[(iz+1)*W+ix],c=HF[(iz+1)*W+ix+1],d=HF[iz*W+ix+1];return fx+fz<=1?a+(d-a)*fx+(b-a)*fz:c+(b-c)*(1-fx)+(d-c)*(1-fz);}
const slopeAt=(x,z)=>Math.abs(gh(x+1,z)-gh(x-1,z))+Math.abs(gh(x,z+1)-gh(x,z-1));
/* vent dans l'herbe et les arbres */
const WIND={uTime:{value:0},uWind:{value:1}};
function swayMat(m,amp,base){m.onBeforeCompile=sh=>{sh.uniforms.uTime=WIND.uTime;sh.uniforms.uWind=WIND.uWind;sh.vertexShader='uniform float uTime;\nuniform float uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvec4 swp=instanceMatrix*vec4(0.0,0.0,0.0,1.0);\n#else\nvec4 swp=vec4(0.0);\n#endif\nfloat swk=max(0.0,position.y+'+base.toFixed(2)+')*'+amp.toFixed(3)+'*uWind;\ntransformed.x+=sin(uTime*2.1+swp.x*0.35+swp.z*0.2)*swk;\ntransformed.z+=cos(uTime*1.7+swp.z*0.3+swp.x*0.1)*swk*0.7;');};m.customProgramCacheKey=()=>'sway'+amp+'_'+base;return m;}
const CROWN_MAT=swayMat(new THREE.MeshStandardMaterial({color:0xffffff,roughness:0.85,flatShading:true}),0.04,2.0);
/* reflets */
const CUBE_RT=new THREE.WebGLCubeRenderTarget(128,{generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});
const cubeCam=new THREE.CubeCamera(0.5,420,CUBE_RT);
let cubeFace=-1;
function updReflect(dt){if(!water||(S.zone&&S.zone!=='monde'))return;if(cubeFace<0){cubeT-=dt;if(cubeT>0)return;cubeT=QL>=2?3:QL>=1?8:1e9;cubeFace=0;}
 const au=renderer.shadowMap.autoUpdate;renderer.shadowMap.autoUpdate=false;water.visible=false;PS_ALL.forEach(p=>p.pts.visible=false);const prev=renderer.getRenderTarget();const tx=CUBE_RT.texture;tx.generateMipmaps=cubeFace===5;cubeCam.updateMatrixWorld(true);renderer.setRenderTarget(CUBE_RT,cubeFace);renderer.render(scene,cubeCam.children[cubeFace]);renderer.setRenderTarget(prev);tx.generateMipmaps=true;
 water.visible=true;PS_ALL.forEach(p=>p.pts.visible=true);renderer.shadowMap.autoUpdate=au;cubeFace=cubeFace>=5?-1:cubeFace+1;}
/* halo lumineux */
function setupBloom(){if(composer)return true;if(!(THREE.EffectComposer&&THREE.RenderPass&&THREE.UnrealBloomPass&&THREE.ShaderPass&&THREE.CopyShader&&THREE.LuminosityHighPassShader))return false;
 try{composer=new THREE.EffectComposer(renderer);composer.addPass(new THREE.RenderPass(scene,camera));composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.7,0.45,0.83));composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(window.innerWidth,window.innerHeight);return true;}catch(e){console.warn(e);composer=null;return false;}}

/* ---------- zones intérieures ---------- */
const ZONES={monde:{n:null},donjon:{n:'Souterrains',hemi:0.1,amb:0.06,fogC:0x05040a,fogN:4,fogF:36,pl:1.2},
 salle:{n:'Grande Salle',ic:'🏰',O:{x:0,z:700},sp:{x:0,z:12.3},ex:{x:0,z:16},door:{x:0,z:-35.9},st:{x:0,z:-37.4},yaw:0,hemi:0.4,hc:0xffe2b8,gc:0x3a2a1a,amb:0.12,fogC:0x140e08,fogN:18,fogF:80,pl:0.3,lights:[]},
 biblio_int:{n:'Bibliothèque',ic:'📚',O:{x:120,z:700},sp:{x:0,z:5.0},ex:{x:0,z:8.3},door:{x:-28.2,z:-25.9},st:{x:-28.9,z:-27},yaw:0.56,hemi:0.45,hc:0xffe0c0,gc:0x2a2018,amb:0.1,fogC:0x120c08,fogN:14,fogF:60,pl:0.4,lights:[]},
 auberge:{n:'Auberge de la Lanterne Ivre',ic:'🏮',O:{x:240,z:700},sp:{x:0,z:1.8},ex:{x:0,z:5.3},door:{x:4.8,z:49.4},st:{x:5.3,z:50.2},yaw:-2.62,hemi:0.36,hc:0xffd8a8,gc:0x3a2414,amb:0.1,fogC:0x140c06,fogN:12,fogF:50,pl:0.35,lights:[]},
 grotte:{n:'Grotte aux Cristaux',ic:'💎',O:{x:360,z:700},sp:{x:0,z:7},ex:{x:0,z:12.6},door:{x:27.8,z:-58.5},st:{x:32.4,z:-58},yaw:-1.67,hemi:0.18,hc:0x80a8ff,gc:0x101828,amb:0.06,fogC:0x040810,fogN:5,fogF:38,pl:1.0,lights:[]}};
const INLOCS=[{id:'salle',name:'Grande Salle',x:0,z:700,r:18,spot:{x:0,z:689.5}},{id:'biblio_int',name:'Bibliothèque (intérieur)',x:120,z:700,r:10,spot:{x:120,z:704.3}},{id:'auberge',name:'Auberge de la Lanterne Ivre',x:240,z:700,r:9,spot:{x:240,z:701.6}},{id:'grotte',name:'Grotte aux Cristaux',x:360,z:700,r:14,spot:{x:360,z:706}}];
INLOCS.forEach(l=>LOCBY[l.id]=l);
function zoneAt(x,z){if(z<-300)return 'donjon';if(z>300){for(const k of ['salle','biblio_int','auberge','grotte'])if(Math.abs(x-ZONES[k].O.x)<60)return k;}return 'monde';}
function nav(t){if(!t)return t;const zt=zoneAt(t.x,t.z);if(zt===S.zone)return t;if(S.zone==='donjon')return dpos(3,3);if(S.zone!=='monde'){const Z=ZONES[S.zone];return {x:Z.O.x+Z.ex.x,z:Z.O.z+Z.ex.z};}if(zt==='donjon')return {x:GRATE.x,z:GRATE.z};return ZONES[zt].st;}
function enterZone(id){const Z=ZONES[id];fade(()=>{S.zone=id;player.x=Z.O.x+Z.sp.x;player.z=Z.O.z+Z.sp.z;player.y=0;player.vx=player.vz=player.vy=0;player.ry=Math.PI;camYaw=Math.PI;camera.position.set(player.x,6,player.z+5);populateZone(id);say(Z.ic+' <b>'+Z.n+'</b>','sys');});}
function exitZone(){const Z=ZONES[S.zone];if(!Z||!Z.door)return;fade(()=>{S.zone='monde';player.x=Z.door.x;player.z=Z.door.z;player.y=gh(player.x,player.z);player.vx=player.vz=player.vy=0;player.ry=Z.yaw;camYaw=Z.yaw;camera.position.set(player.x-Math.sin(Z.yaw)*7,player.y+5,player.z-Math.cos(Z.yaw)*7);});}
function zoneLights(t){const Z=ZONES[S.zone]||{};PLight.position.set(player.x,player.y+2.2,player.z);PLight.intensity=Z.pl||0.5;
 if(!Z.lights||!Z.lights.length){TL.forEach(l=>l.intensity=0);return;}
 const ls=Z.lights.slice().sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z));
 TL.forEach((l,i)=>{const L=ls[i%ls.length];l.position.set(L.x,L.y,L.z);l.color.setHex(L.c);l.distance=L.d||18;l.intensity=(L.i||1.6)*(L.f?1+Math.sin(t*9+i*2)*0.14:1);});}

/* ---------- textures & aides ---------- */
function makeTextures(){
 T3.stone=tex(q=>{q.fillStyle='#6e675c';q.fillRect(0,0,128,128);q.strokeStyle='#3e3a34';q.lineWidth=3;for(let r=0;r<4;r++){q.beginPath();q.moveTo(0,r*32);q.lineTo(128,r*32);q.stroke();for(let c=0;c<2;c++){const x=(c*64+(r%2)*32)%128;q.beginPath();q.moveTo(x,r*32);q.lineTo(x,r*32+32);q.stroke();}}for(let i=0;i<80;i++){q.fillStyle='rgba(0,0,0,'+Math.random()*0.12+')';q.fillRect(Math.random()*128,Math.random()*128,5,5);}});
 T3.wood=tex(q=>{q.fillStyle='#7a5230';q.fillRect(0,0,128,128);for(let i=0;i<8;i++){q.fillStyle='rgba(0,0,0,'+(0.04+Math.random()*0.14)+')';q.fillRect(0,i*16,128,15);q.fillStyle='rgba(30,15,5,.65)';q.fillRect(0,i*16+15,128,1);}for(let i=0;i<40;i++){q.strokeStyle='rgba(40,20,5,.22)';q.beginPath();const y=Math.random()*128;q.moveTo(0,y);q.bezierCurveTo(40,y+4,80,y-4,128,y);q.stroke();}});
 T3.tiles=tex(q=>{for(let i=0;i<4;i++)for(let j=0;j<4;j++){q.fillStyle=(i+j)%2?'#8a7c68':'#5a5046';q.fillRect(i*32,j*32,32,32);}q.strokeStyle='#2e2a24';q.lineWidth=2;for(let i=0;i<=4;i++){q.beginPath();q.moveTo(i*32,0);q.lineTo(i*32,128);q.stroke();q.beginPath();q.moveTo(0,i*32);q.lineTo(128,i*32);q.stroke();}});
 T3.books=tex(q=>{q.fillStyle='#3a2414';q.fillRect(0,0,128,128);for(let r=0;r<4;r++){let x=2;while(x<126){const w=4+Math.random()*7;q.fillStyle='hsl('+Math.floor(Math.random()*360)+',45%,'+(22+Math.random()*25)+'%)';q.fillRect(x,r*32+3+Math.random()*6,w-1,27);x+=w;}q.fillStyle='#24160c';q.fillRect(0,r*32+29,128,4);}});
 T3.rock=tex(q=>{q.fillStyle='#2c2c36';q.fillRect(0,0,128,128);for(let i=0;i<300;i++){q.fillStyle='rgba('+(Math.random()<0.5?'255,255,255':'0,0,0')+','+Math.random()*0.08+')';q.fillRect(Math.random()*128,Math.random()*128,3+Math.random()*6,3+Math.random()*6);}});
 T3.flow=tex(q=>{q.fillStyle='#3a86c8';q.fillRect(0,0,128,128);for(let i=0;i<70;i++){q.strokeStyle='rgba(255,255,255,'+(0.08+Math.random()*0.3)+')';q.lineWidth=1+Math.random()*2;const x=Math.random()*128,y=Math.random()*128;q.beginPath();q.moveTo(x,y);q.lineTo(x+rnd(-3,3),y+10+Math.random()*20);q.stroke();}});
 T3.glass=tex(q=>{const cols=['#c03040','#3050c0','#d0a020','#30a050','#8040c0','#20a0b0'];for(let i=0;i<6;i++)for(let j=0;j<10;j++){q.fillStyle=pick(cols);q.fillRect(i*21.3,j*12.8,21.3,12.8);}q.strokeStyle='#1a1410';q.lineWidth=3;for(let i=0;i<=6;i++){q.beginPath();q.moveTo(i*21.3,0);q.lineTo(i*21.3,128);q.stroke();}for(let j=0;j<=10;j++){q.beginPath();q.moveTo(0,j*12.8);q.lineTo(128,j*12.8);q.stroke();}});
}
function tmat(t,rx,ry,o){const c=t.clone();c.needsUpdate=true;c.repeat.set(rx,ry);return new THREE.MeshStandardMaterial(Object.assign({map:c,roughness:0.9},o||{}));}
function boxAt(w,h,d,m,x,y,z,ry){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;o.receiveShadow=true;scene.add(o);return o;}
function roomRect(O,x1,z1,x2,z2,H,floorM,wallT){const W=x2-x1,D=z2-z1,cx=O.x+(x1+x2)/2,cz=O.z+(z1+z2)/2;
 const f=new THREE.Mesh(new THREE.PlaneGeometry(W,D).rotateX(-Math.PI/2),floorM);f.position.set(cx,0.01,cz);f.receiveShadow=true;scene.add(f);
 const wx=tmat(wallT,W/3,H/3),wz=tmat(wallT,D/3,H/3);
 const wp=(w,m,x,z,ry)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(w,H),m);o.position.set(x,H/2,z);o.rotation.y=ry;o.receiveShadow=true;scene.add(o);};wp(W,wx,cx,O.z+z1,0);wp(W,wx,cx,O.z+z2,Math.PI);wp(D,wz,O.x+x1,cz,Math.PI/2);wp(D,wz,O.x+x2,cz,-Math.PI/2);
 addCol({x:cx,z:O.z+z1-0.5,hw:W/2+1,hd:0.5});addCol({x:cx,z:O.z+z2+0.5,hw:W/2+1,hd:0.5});addCol({x:O.x+x1-0.5,z:cz,hw:0.5,hd:D/2+1});addCol({x:O.x+x2+0.5,z:cz,hw:0.5,hd:D/2+1});}
function doorMesh(x,z,ry,w,h){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);const wd=tmat(T3.wood,1,2,{color:0x9a6a3a});
 const pl=(pw,ph,m,px,py,pz)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(pw,ph),m);o.position.set(px,py,pz);g.add(o);return o;};
 pl(w,h,wd,0,h/2,0.02);const fr=mat(0x5a544c);pl(w+0.5,0.3,fr,0,h+0.15,0.03);pl(0.25,h,fr,-(w/2+0.12),h/2,0.03);pl(0.25,h,fr,w/2+0.12,h/2,0.03);pl(0.05,h,mat(0x3a2414),0,h/2,0.035);
 mesh(new THREE.SphereGeometry(0.07,8,6),mat(0xd4af37,{metalness:0.7,roughness:0.3}),w*0.32,h*0.48,0.1,g,false);return g;}
function candle(x,y,z,list,zone){const m=mesh(new THREE.CylinderGeometry(0.045,0.05,0.32,6),mat(0xf4ecd8,{emissive:0x403020,flatShading:false}),x,y-0.25,z,null,false);const s=glow(0xffc870,0.6,0.95);s.position.set(x,y,z);scene.add(s);if(list)list.push({m,s,y,p:Math.random()*6});return s;}

/* ---------- Grande Salle ---------- */
function buildSalle(){const Z=ZONES.salle,O=Z.O;roomRect(O,-9,-17,9,17,8,tmat(T3.tiles,6,11),T3.stone);
 const wood=tmat(T3.wood,1,4),wood2=tmat(T3.wood,1,1),dark=mat(0x2a1c10);
 const plates=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2,0.2,0.03,12),mat(0xf0ece4,{flatShading:false}),60);const food=new THREE.InstancedMesh(new THREE.SphereGeometry(0.12,8,6),mat(0xffffff),60);const m4=new THREE.Matrix4();let pi=0;
 [-5,0,5].forEach(tx=>{boxAt(1.7,0.12,16,wood,O.x+tx,0.8,O.z);[-7.5,7.5].forEach(lz=>[-0.65,0.65].forEach(lx=>boxAt(0.12,0.8,0.12,wood2,O.x+tx+lx,0.4,O.z+lz)));addCol({x:O.x+tx,z:O.z,hw:0.85,hd:8,h:0.86});
  [-1.35,1.35].forEach(bx=>{boxAt(0.5,0.45,16,wood2,O.x+tx+bx,0.225,O.z);addCol({x:O.x+tx+bx,z:O.z,hw:0.25,hd:8,h:0.45});});
  for(let zz=-7;zz<=7;zz+=1.75)[-0.42,0.42].forEach(lx=>{if(pi>=60)return;m4.makeTranslation(O.x+tx+lx,0.88,O.z+zz);plates.setMatrixAt(pi,m4);m4.makeScale(1,0.7,1).setPosition(O.x+tx+lx,0.96,O.z+zz);food.setMatrixAt(pi,m4);food.setColorAt(pi,new THREE.Color(pick([0xc8742a,0xe0a030,0x7a3a1a,0xd04040,0x8ac040,0xf0d080])));pi++;});});
 plates.count=food.count=pi;scene.add(plates,food);
 boxAt(15,0.4,4,tmat(T3.wood,4,1),O.x,0.2,O.z-14.8);addCol({x:O.x,z:O.z-14.8,hw:7.5,hd:2,h:0.4});
 boxAt(9,0.12,1.4,wood,O.x,1.2,O.z-15.1);addCol({x:O.x,z:O.z-15.1,hw:4.5,hd:0.7,h:1.26});for(let i=-2;i<=2;i++){boxAt(0.7,1.8,0.12,dark,O.x+i*1.8,1.3,O.z-16.3);boxAt(0.7,0.1,0.7,dark,O.x+i*1.8,0.85,O.z-15.95);}
 boxAt(1.2,3.4,3.8,tmat(T3.stone,1,1),O.x-8.5,1.7,O.z);boxAt(0.4,1.7,2.2,basic(0x0a0604),O.x-7.95,0.85,O.z);addCol({x:O.x-8.4,z:O.z,hw:0.65,hd:1.9});FIRES.push({x:O.x-7.8,y:0.25,z:O.z,s:0.7,zone:'salle'});
 Z.lights.push({x:O.x-7.3,y:1.6,z:O.z,c:0xff8a30,i:2.2,f:1});
 [-11,-4,3,10].forEach(wz=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(2,4.6),new THREE.MeshBasicMaterial({map:T3.glass}));w.position.set(O.x+8.47,4.2,O.z+wz);w.rotation.y=-Math.PI/2;scene.add(w);const g=glow(0xbfd0ff,4,0.25);g.position.set(O.x+7.6,4.2,O.z+wz);scene.add(g);});
 Z.lights.push({x:O.x+6.5,y:4,z:O.z-7,c:0xc8d8ff,i:1.0},{x:O.x+6.5,y:4,z:O.z+7,c:0xc8d8ff,i:1.0},{x:O.x,y:5.5,z:O.z-6,c:0xffc870,i:1.1},{x:O.x,y:5.5,z:O.z+6,c:0xffc870,i:1.1});
 [[-12,0x5a2a8a],[-6,0x2f6b3a],[6,0x1f3f8b],[12,0x8a2a3a]].forEach(([bz,c])=>{const b=new THREE.Mesh(new THREE.PlaneGeometry(1.6,5),new THREE.MeshStandardMaterial({color:c,side:THREE.DoubleSide,roughness:0.9}));b.position.set(O.x-8.45,5,O.z+bz);b.rotation.y=Math.PI/2;scene.add(b);const e=new THREE.Mesh(new THREE.CircleGeometry(0.4,16),mat(0xd4af37,{metalness:0.6,roughness:0.4,side:THREE.DoubleSide}));e.position.set(O.x-8.42,5.6,O.z+bz);e.rotation.y=Math.PI/2;scene.add(e);});
 for(let i=0;i<46;i++)candle(O.x+rnd(-7.5,7.5),rnd(4.6,6.4),O.z+rnd(-15,14),CANDLES);
 boxAt(2.2,1.4,0.1,wood2,O.x+5.5,1.9,O.z+16.45);for(let i=0;i<5;i++){const n=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.5),mat(0xf2ead8,{side:THREE.DoubleSide}));n.position.set(O.x+4.7+i*0.4,1.75+(i%2)*0.3,O.z+16.39);n.rotation.y=Math.PI;n.rotation.z=rnd(-.1,.1);scene.add(n);}
 doorMesh(O.x,O.z+16.9,Math.PI,3,4.2);
 station({x:O.x+5.5,z:O.z+15.4,reach:2.2,hint:()=>S.zone==='salle'?'Lire le tableau d’affichage':null,act:board});
 station({x:O.x,z:O.z-12.3,reach:2.4,hint:()=>S.zone==='salle'?'Se servir au festin':null,act:feast});
 station({x:O.x+Z.ex.x,z:O.z+Z.ex.z,reach:2.2,hint:()=>S.zone==='salle'?'Sortir dans la cour':null,act:exitZone});
 station({x:Z.st.x,z:Z.st.z,reach:2.6,hint:()=>S.zone==='monde'?'Entrer dans la Grande Salle':null,act:()=>enterZone('salle')});}
/* ---------- Bibliothèque ---------- */
function buildBiblio(){const Z=ZONES.biblio_int,O=Z.O,R=10;
 const fl=new THREE.Mesh(new THREE.CircleGeometry(R,40).rotateX(-Math.PI/2),tmat(T3.wood,6,6));fl.position.set(O.x,0.01,O.z);fl.receiveShadow=true;scene.add(fl);
 const wall=new THREE.Mesh(new THREE.CylinderGeometry(R+0.5,R+0.5,14,40,1,true),tmat(T3.stone,12,4,{side:THREE.BackSide}));wall.position.set(O.x,7,O.z);scene.add(wall);
 for(let a=0;a<TAU;a+=1.1/(R+0.6))addCol({x:O.x+Math.cos(a)*(R+0.6),z:O.z+Math.sin(a)*(R+0.6),r:1.2});
 const side=tmat(T3.wood,1,2),bk=tmat(T3.books,1,2);const mats=[side,side,side,side,bk,side];
 for(let i=0;i<18;i++){const a=i/18*TAU;let da=Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2));if(Math.abs(da)<0.3)continue;[[3.6,7],[10.6,6]].forEach(([y,h])=>{const b=new THREE.Mesh(new THREE.PlaneGeometry(3.3,h),bk);b.position.set(O.x+Math.cos(a)*9.75,y,O.z+Math.sin(a)*9.75);b.rotation.y=Math.atan2(-Math.cos(a),-Math.sin(a));scene.add(b);});}
 mesh(new THREE.CylinderGeometry(1.6,1.8,0.9,24),tmat(T3.wood,3,1),O.x,0.45,O.z);addCol({x:O.x,z:O.z,r:1.75,h:0.95});
 [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(0.7,0.9),mat(0xf4ecd0,{emissive:0x403820,side:THREE.DoubleSide,flatShading:false}));p.position.set(O.x+s*0.36,1.0,O.z);p.rotation.set(-Math.PI/2,0,s*0.18);scene.add(p);});const bg=glow(0x9ad8ff,1.8,0.6);bg.position.set(O.x,1.4,O.z);scene.add(bg);
 const cols=[0x8a2a2a,0x2a4a8a,0x2a6a3a,0x6a4a8a,0x8a6a2a];for(let i=0;i<12;i++){const m=mesh(new THREE.BoxGeometry(0.4,0.09,0.55),mat(pick(cols)),0,0,0,null,false);BOOKS.push({m,cx:O.x,cz:O.z,r:rnd(3.8,6.8),a:rnd(0,TAU),y:rnd(2.4,6.2),sp:rnd(0.12,0.3)*(Math.random()<0.5?-1:1)});}
 const ch=new THREE.Mesh(new THREE.TorusGeometry(1.6,0.06,6,32),mat(0xd4af37,{metalness:0.6,roughness:0.4}));ch.rotation.x=Math.PI/2;ch.position.set(O.x,9,O.z);scene.add(ch);for(let i=0;i<10;i++){const a=i/10*TAU;candle(O.x+Math.cos(a)*1.6,9.35,O.z+Math.sin(a)*1.6);}
 Z.lights.push({x:O.x,y:7,z:O.z,c:0xffc880,i:1.7},{x:O.x-5.5,y:1.8,z:O.z-4,c:0xffb060,i:1.3,f:1},{x:O.x+5.5,y:1.8,z:O.z-4,c:0xffb060,i:1.3,f:1},{x:O.x,y:1.6,z:O.z,c:0x9ad8ff,i:1.0});
 [-5.5,5.5].forEach(lx=>{mesh(new THREE.CylinderGeometry(0.5,0.5,0.75,12),tmat(T3.wood,1,1),O.x+lx,0.375,O.z-4);addCol({x:O.x+lx,z:O.z-4,r:0.55,h:0.78});candle(O.x+lx,1.15,O.z-4);});
 doorMesh(O.x,O.z+R-0.15,Math.PI,2.2,3.4);
 station({x:O.x,z:O.z+2.3,reach:2.2,hint:()=>S.zone==='biblio_int'?'Lire le grimoire ancien':null,act:grimoire});
 station({x:O.x+Z.ex.x,z:O.z+Z.ex.z,reach:2.2,hint:()=>S.zone==='biblio_int'?'Sortir':null,act:exitZone});
 const dg=new THREE.Group();dg.position.set(-29.5,0,-28.05);dg.rotation.y=Math.atan2(0.53,0.85);scene.add(dg);mesh(new THREE.BoxGeometry(1.8,2.6,0.2),mat(0x3a2414),0,1.3,0.05,dg,false);mesh(new THREE.BoxGeometry(2.2,0.25,0.3),mat(0x5a544c),0,2.7,0.05,dg,false);
 station({x:Z.st.x,z:Z.st.z,reach:2.6,hint:()=>S.zone==='monde'?'Entrer dans la Bibliothèque':null,act:()=>enterZone('biblio_int')});}
/* ---------- Auberge ---------- */
function buildAuberge(){const Z=ZONES.auberge,O=Z.O;roomRect(O,-8,-6,8,6,4.6,tmat(T3.wood,5,4),T3.wood);
 const wood=tmat(T3.wood,4,1),dk=mat(0x3a2414);
 boxAt(10,1.1,0.9,wood,O.x,0.55,O.z-3.4);boxAt(10.3,0.1,1.15,dk,O.x,1.14,O.z-3.4);addCol({x:O.x,z:O.z-3.4,hw:5.15,hd:0.58,h:1.17});
 [1.8,2.7].forEach(y=>boxAt(10,0.08,0.45,dk,O.x,y,O.z-5.7));const bt=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07,0.09,0.32,8),mat(0xffffff,{roughness:0.2,metalness:0.1,flatShading:false}),36);const m4=new THREE.Matrix4();for(let i=0;i<36;i++){m4.makeTranslation(O.x-4.6+(i%18)*0.54,(i<18?1.8:2.7)+0.2,O.z-5.7);bt.setMatrixAt(i,m4);bt.setColorAt(i,new THREE.Color(pick([0x2a7a3a,0x8a2a2a,0x6a4a1a,0x3a5a9a,0xd0a040])));}scene.add(bt);
 [[-5,1.6],[5,1.6],[-0.5,-0.6]].forEach(([x,z])=>{mesh(new THREE.CylinderGeometry(0.85,0.85,0.08,18),tmat(T3.wood,1,1),O.x+x,0.78,O.z+z);mesh(new THREE.CylinderGeometry(0.1,0.15,0.75,8),dk,O.x+x,0.38,O.z+z);addCol({x:O.x+x,z:O.z+z,r:0.9,h:0.82});
  for(let k=0;k<3;k++){const a=k/3*TAU+0.5,sx=O.x+x+Math.cos(a)*1.3,sz=O.z+z+Math.sin(a)*1.3;mesh(new THREE.CylinderGeometry(0.25,0.22,0.45,10),tmat(T3.wood,1,1),sx,0.225,sz);addCol({x:sx,z:sz,r:0.28,h:0.45});}
  mesh(new THREE.CylinderGeometry(0.08,0.07,0.18,8),mat(0xc8a040,{metalness:0.6,flatShading:false}),O.x+x+0.2,0.91,O.z+z);});
 boxAt(1,2.6,2.8,tmat(T3.stone,1,1),O.x+7.6,1.3,O.z+0.8);boxAt(0.4,1.3,1.6,basic(0x0a0604),O.x+7.1,0.65,O.z+0.8);addCol({x:O.x+7.6,z:O.z+0.8,hw:0.55,hd:1.4});FIRES.push({x:O.x+7,y:0.2,z:O.z+0.8,s:0.55,zone:'auberge'});
 Z.lights.push({x:O.x+6.4,y:1.4,z:O.z+0.8,c:0xff8a30,i:2,f:1});
 [[-4,-0.5],[4,2.2],[0,2.8],[-1,-4.6]].forEach(([x,z])=>{mesh(new THREE.BoxGeometry(0.3,0.4,0.3),mat(0x332211,{emissive:0xffb050,emissiveIntensity:0.9}),O.x+x,3.4,O.z+z,null,false);mesh(new THREE.CylinderGeometry(0.01,0.01,1,4),dk,O.x+x,4.1,O.z+z,null,false);const g=glow(0xffc870,1.8,0.7);g.position.set(O.x+x,3.4,O.z+z);scene.add(g);Z.lights.push({x:O.x+x,y:3.2,z:O.z+z,c:0xffb860,i:1.3});});
 [[-7,-1.8,'barrel'],[-7,-0.9,'barrel'],[-6.9,0.1,'barrel'],[-7,4.6,'crate'],[-6,4.8,'crate']].forEach(([x,z,t])=>makeProp(t,O.x+x,O.z+z));
 boxAt(0.1,1.2,1.8,tmat(T3.wood,1,1),O.x-7.95,1.8,O.z+2.6);for(let i=0;i<4;i++){const n=new THREE.Mesh(new THREE.PlaneGeometry(0.36,0.42),mat(0xf2ead8,{side:THREE.DoubleSide}));n.position.set(O.x-7.88,1.65+(i%2)*0.35,O.z+2.0+i*0.38);n.rotation.y=Math.PI/2;scene.add(n);}
 doorMesh(O.x,O.z+5.92,Math.PI,1.6,2.8);
 station({x:O.x+1.5,z:O.z-2.4,reach:2.2,hint:()=>S.zone==='auberge'?'Commander un chocolat aux épices de comète':null,act:choco});
 station({x:O.x-7,z:O.z+2.6,reach:2.2,hint:()=>S.zone==='auberge'?'Lire le tableau des rumeurs':null,act:rumors});
 station({x:O.x+Z.ex.x,z:O.z+Z.ex.z,reach:2,hint:()=>S.zone==='auberge'?'Sortir':null,act:exitZone});
 const sg=label('Auberge de la Lanterne Ivre','#ffd27a',3.2);sg.position.set(5.2,4,50.6);scene.add(sg);
 station({x:Z.st.x,z:Z.st.z,reach:2.6,hint:()=>S.zone==='monde'?'Entrer dans l’auberge':null,act:()=>enterZone('auberge')});}
/* ---------- Grotte aux Cristaux ---------- */
function buildGrotte(){const Z=ZONES.grotte,O=Z.O,R=14;
 const fl=new THREE.Mesh(new THREE.CircleGeometry(R+4,40).rotateX(-Math.PI/2),tmat(T3.rock,10,10));fl.position.set(O.x,0.01,O.z);fl.receiveShadow=true;scene.add(fl);
 const rm=tmat(T3.rock,1,1,{color:0x8a8aa0});
 {const cg=new THREE.CylinderGeometry(R+1,R+1.6,9,48,6,true);const pa=cg.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i),z=pa.getZ(i);const a=Math.atan2(z,x);const k=1+(Math.sin(a*5+y*0.7)*0.06+Math.sin(a*11-y)*0.04)+(Math.random()-0.5)*0.05;pa.setX(i,x*k);pa.setZ(i,z*k);}cg.computeVertexNormals();const wm=tmat(T3.rock,10,2,{color:0x8a8aa0,side:THREE.BackSide,flatShading:true});const w=new THREE.Mesh(cg,wm);w.position.set(O.x,4.5,O.z);scene.add(w);}
 for(let a=0;a<TAU;a+=0.26)addCol({x:O.x+Math.cos(a)*(R+0.6),z:O.z+Math.sin(a)*(R+0.6),r:1.6});
 for(let a=Math.PI*1.08;a<Math.PI*1.92;a+=0.22){const s=rnd(1.4,2.6);const x=O.x+Math.cos(a)*(R-0.6),z=O.z+Math.sin(a)*(R-0.6);const m=mesh(rockGeo(s),rm,x,s*0.5,z);m.scale.y=1.4;m.rotation.set(rnd(0,3),rnd(0,3),0);}
 const keep=[[-9,0],[9,0],[-5,-8],[5,-8],[0,-8.5],[-8,5],[0,11],[0,5]];
 for(let i=0;i<14;i++){let x,z,ok=false;for(let k=0;k<12&&!ok;k++){const a=Math.random()*TAU,r=rnd(3,11.5);x=Math.cos(a)*r;z=Math.sin(a)*r;ok=keep.every(([kx,kz])=>Math.hypot(kx-x,kz-z)>3.2);}if(!ok)continue;const s=rnd(0.35,0.75),h=rnd(1.6,3.6);mesh(new THREE.ConeGeometry(s,h,7),rm,O.x+x,h/2,O.z+z);addCol({x:O.x+x,z:O.z+z,r:s+0.1});}
 const ccols=[0x6ad8ff,0xff7ae0,0xb48cff,0x7aff9a,0xffd27a];
 for(let i=0;i<11;i++){const a=i/11*TAU+0.2,r=rnd(10.5,12);const x=O.x+Math.cos(a)*r,z=O.z+Math.sin(a)*r,c=pick(ccols);const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const cm=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:0.8,roughness:0.2,metalness:0.3,flatShading:true,transparent:true,opacity:0.92});
  for(let k=0;k<4;k++){const m=new THREE.Mesh(G.cry,cm);m.position.set(rnd(-.6,.6),0.6,rnd(-.6,.6));m.scale.set(rnd(.4,.7),rnd(1.4,2.6),rnd(.4,.7));m.rotation.set(rnd(-.5,.5),rnd(0,3),rnd(-.5,.5));g.add(m);}
  const gl=glow(c,3,0.5);gl.position.y=1.2;g.add(gl);CRYS.push({mat:cm,p:Math.random()*6});Z.lights.push({x,y:1.6,z,c,i:1.8,d:14});}
 const pool=new THREE.Mesh(new THREE.CircleGeometry(2.8,28).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x2ad8c8,emissive:0x0a6a68,emissiveIntensity:0.9,roughness:0.05,metalness:0.4}));pool.position.set(O.x-8,0.05,O.z+5);scene.add(pool);addCol({x:O.x-8,z:O.z+5,r:2.8});Z.lights.push({x:O.x-8,y:1,z:O.z+5,c:0x2ad8c8,i:1.4});
 [[-9,0],[9,0],[-5,-8],[5,-8]].forEach(([x,z],i)=>{const g=new THREE.Group();g.position.set(O.x+x,0,O.z+z);scene.add(g);mesh(new THREE.CylinderGeometry(0.6,0.8,0.8,8),rm,0,0.4,0,g);const cm=new THREE.MeshStandardMaterial({color:0x888888,emissive:0x888888,emissiveIntensity:0.15,roughness:0.15,metalness:0.3,flatShading:true});const m=new THREE.Mesh(G.cry,cm);m.scale.set(0.9,2.2,0.9);m.position.y=1.9;m.castShadow=true;g.add(m);const gl=glow(0xffffff,3.4,0);gl.position.y=1.9;g.add(gl);addCol({x:O.x+x,z:O.z+z,r:0.85});GCRY.push({x:O.x+x,z:O.z+z,mat:cm,gl,t:0,warn:0});});
 const cg=new THREE.Group();cg.position.set(O.x,0,O.z-8.5);scene.add(cg);const sm=new THREE.MeshStandardMaterial({color:0xbfe8ff,emissive:0x4a8aff,emissiveIntensity:0.5,roughness:0.1,transparent:true,opacity:0.85,flatShading:true});for(let i=0;i<10;i++){const a=i/10*TAU;const m=new THREE.Mesh(new THREE.ConeGeometry(0.28,rnd(2.2,3.2),6),sm);m.position.set(Math.cos(a)*1.9,1.3,Math.sin(a)*1.9);m.rotation.set(Math.sin(a)*0.15,0,-Math.cos(a)*0.15);cg.add(m);}
 const cc={x:O.x,z:O.z-8.5,r:2.2};addCol(cc);GCAGE={g:cg,c:cc,x:O.x,z:O.z-8.5};
 const ex=glow(0x9ad0ff,4,0.6);ex.position.set(O.x,1.5,O.z+13.2);scene.add(ex);
 station({x:O.x+Z.ex.x,z:O.z+Z.ex.z,reach:2.4,hint:()=>S.zone==='grotte'?'Ressortir à l’air libre':null,act:exitZone});
 // entrée dans la falaise
 const ex0=34.1,ez0=-57.8,ey0=gh(ex0,ez0);const arch=new THREE.Mesh(new THREE.CircleGeometry(2.4,24,0,Math.PI),basic(0x040508));arch.position.set(ex0-0.6,ey0-0.05,ez0);arch.rotation.y=Math.atan2(-0.995,-0.1);scene.add(arch);
 for(let i=0;i<6;i++){const a=i/5*Math.PI;const s=rnd(0.8,1.4);const m=mesh(rockGeo(s),ROCKM,ex0-0.7+Math.sin(Math.atan2(-0.995,-0.1)+Math.PI/2)*Math.cos(a)*2.7,ey0+Math.sin(a)*2.5,ez0+Math.cos(Math.atan2(-0.995,-0.1)+Math.PI/2)*Math.cos(a)*2.7);m.rotation.set(rnd(0,3),rnd(0,3),0);CAMFADE.push({m,r:s+1.3});}
 for(let i=0;i<4;i++){const c=pick(ccols);const m=mesh(G.cry,mat(c,{emissive:c,emissiveIntensity:0.9}),ex0-1.4+rnd(-0.6,0.6),ey0+0.4,ez0+rnd(-2.2,2.2),null,false);m.scale.set(0.4,1.2,0.4);m.rotation.z=rnd(-.5,.5);}
 station({x:Z.st.x,z:Z.st.z,reach:2.6,hint:()=>S.zone==='monde'?'Entrer dans la Grotte aux Cristaux':null,act:()=>enterZone('grotte')});}
function syncWorld3(){const G3=S.puz.grotte;if(!G3)return;GCRY.forEach((c,i)=>{const col=ELEM[G3.els[i]].c;c.mat.color.setHex(col);c.mat.emissive.setHex(col);c.t=0;c.mat.emissiveIntensity=0.15;c.gl.material.color.setHex(col);c.gl.material.opacity=0;c.warn=0;});if(GCAGE){GCAGE.g.visible=!G3.open;GCAGE.c.off=G3.open;}}
function grotteHit(el,x,z,r){const G3=S.puz.grotte;if(!G3||G3.open)return;
 GCRY.forEach((c,i)=>{if(Math.hypot(c.x-x,c.z-z)<r+1.8){if(G3.els[i]===el){if(c.t<=0)burst(c.x,2,c.z,ELEM[el].c,24,3);c.t=15;}else if(!c.warn){c.warn=1;say('Ce cristal reste muet : il vibre au rythme de la magie <b>'+ELEM[G3.els[i]].n+'</b>.','sys');}}});
 const n=GCRY.filter(c=>c.t>0).length;
 if(n===4){G3.open=true;GCAGE.g.visible=false;GCAGE.c.off=true;flash(GCAGE.x,3,GCAGE.z,0x9ad8ff,5,1.2,false,30);for(let i=0;i<60;i++)PA.emit(GCAGE.x+rnd(-2,2),rnd(0,3),GCAGE.z+rnd(-2,2),rnd(-2,2),rnd(1,4),rnd(-2,2),pick([0x9ad8ff,0xff7ae0,0xc8a0ff]),0.4,0.05,rnd(0.8,1.5),2,1);gainXP(60);say('🎶 Les quatre cristaux chantent en harmonie ! La cage de cristal se brise.','gm');chron('Cristaux de la grotte accordés.');save();}
 else if(n>0&&!G3.hinted){G3.hinted=1;say('🎵 Le cristal chante… Il faut que les quatre chantent en même temps (chacun pendant 15 s).','sys');}}
function populateZone(id){const F=S.puz.flags;
 if(id==='biblio_int'&&!F.bspawn){F.bspawn=true;const O=ZONES.biblio_int.O;spawnChest(null,'scelle',false,{x:O.x+6,z:O.z-5.4});}
 if(id==='grotte'&&!S.puz.grotte.spawned){S.puz.grotte.spawned=true;const O=ZONES.grotte.O;
  [[-4,2],[5,4]].forEach(([x,z])=>spawnCreatureAt(O.x+x,O.z+z,'Golems de cristal','feu','glace',3));[[3,-3],[-3,-4]].forEach(([x,z])=>spawnCreatureAt(O.x+x,O.z+z,'Chauves-souris de cristal','vent','arcane',2));
  for(let i=0;i<5;i++){const p=freePoint(LOCBY.grotte,10);addEnt('herb',p.x,p.z,makeHerbObj('cristal'),{ing:'cristal'},2000);}
  if(!S.puz.grotte.open)spawnChest(null,null,false,{x:GCAGE.x,z:GCAGE.z});}}
/* ---------- actions des intérieurs ---------- */
function board(){const P=S.puz,L=['📋 <b>Tableau d’affichage</b>'];S.courses.forEach(c=>L.push(fmtTime(c.h)+' — '+ELEM[c.el].n+' avec '+NPCBY[c.prof].name+' ('+LOCBY[c.loc].name+')'+({pending:'',live:' · en cours',done:' · suivi ✓',missed:' · terminé'})[c.state]));
 L.push('Météo : '+WEATHERS[(S.weather||{w:'clair'}).w].n);const tips=[];if(!P.braz.solved)tips.push('Les braseros du Cercle de pierres attendent d’être allumés dans le bon ordre.');if(!P.seals.open)tips.push('Les sceaux du château réclament : '+P.seals.els.map(e=>ELEM[e].n).join(', ')+'.');if(!P.glyph.open)tips.push('Un glyphe dort sur le flanc ouest de la tour-bibliothèque.');if(P.grotte&&!P.grotte.open)tips.push('Sous les Hauteurs, une grotte cache des cristaux qui chantent quand on les accorde ensemble.');if(!S.relicDone)tips.push('On dit qu’une relique dort au fond des Souterrains.');
 if(tips.length)L.push('📌 '+pick(tips));say(L.join('<br>'),'gm');}
function feast(){const F=S.puz.flags;if(F.feast!=null&&S.time-F.feast<90){say('Tu as déjà bien mangé. Reviens un peu plus tard.','sys');return;}F.feast=S.time;mana=manaMax();gainXP(5);burst(player.x,1.4,player.z,0xffd27a,20,2);say('🍗 Tourte aux champignons lunaires, jus de citrouille pétillant… Tu te régales. Mana au maximum !','sys');}
function grimoire(){const F=S.puz.flags;if(F.read){say('Les pages du grimoire restent blanches. Reviens demain.','sys');return;}F.read=true;gainXP(25);const sp=genSpell(null,pick(['zone','util']));
 say('📖 Les pages tournent d’elles-mêmes et une formule s’imprime dans ton esprit…','gm');learnSpell(sp);chron('Grimoire ancien consulté.');save();}
function choco(){const F=S.puz.flags;if(F.choco!=null&&S.time-F.choco<60){say('Encore ? Laisse refroidir la tasse d’abord !','sys');return;}F.choco=S.time;mana=manaMax();gainXP(5);const tob=npcs.find(n=>n.d.id==='tobias'&&!n.sleep&&zoneAt(n.x,n.z)==='auberge');
 if(tob)bubble(tob,'Et un chocolat de comète !');say('☕ Un chocolat brûlant aux épices de comète. Ta magie se ranime : mana au maximum !','sys');}
function rumors(){const F=S.puz.flags;if(F.rumor){say('Rien de neuf sur le tableau aujourd’hui.','sys');return;}F.rumor=true;const l=pick(LOCS),l2=pick(LOCS);spawnScroll(l.id,genSpell(),900,true);spawnChest(l2.id);gainXP(10);
 say('📜 Rumeurs du jour : « Un parchemin invisible dormirait vers <b>'+esc(l.name)+'</b>. » — « J’ai vu un coffre étrange près de <b>'+esc(l2.name)+'</b>. »','gm');chron('Rumeurs de l’auberge lues.');}
function telescope(){const F=S.puz.flags;const sc=ENT.filter(e=>e.kind==='scroll');sc.forEach(e=>e.data.beam=90);const hid=sc.filter(e=>e.data.hidden).length;
 say('🔭 Depuis les Hauteurs, tu repères <b>'+sc.length+' parchemin'+(sc.length>1?'s':'')+'</b>'+(hid?' (dont '+hid+' caché'+(hid>1?'s':'')+')':'')+'. Des colonnes de lumière les signalent pendant 90 s.','gm');if(!F.tele){F.tele=true;gainXP(20);chron('Vue panoramique depuis les Hauteurs.');}}

/* ---------- extérieur : rivière, pont, plateau ---------- */
function buildRiver(){const pts=[];for(let i=0;i<RIVER.length-1;i++){const [x1,z1]=RIVER[i],[x2,z2]=RIVER[i+1];const L=Math.hypot(x2-x1,z2-z1);const n=Math.max(1,Math.ceil(L/0.7));for(let k=0;k<n;k++){const t=k/n;pts.push([x1+(x2-x1)*t,z1+(z2-z1)*t]);}}pts.push(RIVER[RIVER.length-1]);
 const pos=[],uv=[],idx=[];let acc=0;const W=2.45;
 for(let i=0;i<pts.length;i++){const [x,z]=pts[i];const [xa,za]=pts[Math.max(0,i-1)],[xb,zb]=pts[Math.min(pts.length-1,i+1)];let dx=xb-xa,dz=zb-za;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const nx=-dz,nz=dx;if(i>0)acc+=Math.hypot(x-pts[i-1][0],z-pts[i-1][1]);const y=gh(x,z)+0.42;
  pos.push(x+nx*W,y,z+nz*W,x-nx*W,y,z-nz*W);uv.push(0,acc/4,1,acc/4);if(i>0){const a=(i-1)*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const map=T3.flow.clone();map.needsUpdate=true;riverMat=new THREE.MeshStandardMaterial({map,roughness:0.12,metalness:0.35,transparent:true,opacity:0.86,envMap:CUBE_RT.texture,envMapIntensity:0.8,side:THREE.DoubleSide});
 const m=new THREE.Mesh(g,riverMat);m.receiveShadow=true;scene.add(m);
 mesh(new THREE.CircleGeometry(1.7,20).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x3a8ad0,roughness:0.1,metalness:0.3,emissive:0x0a2a4a,envMap:CUBE_RT.texture}),50,gh(50,-51)+0.45,-51,null,false);
 for(let i=0;i<7;i++){const a=i/7*TAU,s=rnd(0.4,0.8);const x=50+Math.cos(a)*2,z=-51+Math.sin(a)*2;mesh(rockGeo(s),ROCKM,x,gh(x,z)+s*0.3,z).rotation.set(rnd(0,3),rnd(0,3),0);}}
function buildBridge(){const bx=45.7,bz=-4.3,ry=0.137;const g=new THREE.Group();g.position.set(bx,0,bz);g.rotation.y=ry;scene.add(g);const w=tmat(T3.wood,1,1);
 for(let i=-3.25;i<=3.3;i+=0.5)mesh(new THREE.BoxGeometry(0.46,0.12,2.6),w,i,0.36+0.1*Math.cos(i/3.4*Math.PI/2),0,g);
 [-1.25,1.25].forEach(z=>{mesh(new THREE.BoxGeometry(7,0.1,0.1),mat(0x5a3a1a),0,1.2,z,g);for(let i=-3;i<=3;i+=1.5)mesh(new THREE.BoxGeometry(0.12,1.05,0.12),mat(0x4a3018),i,0.75,z,g);});
 [-3.4,3.4].forEach(x=>[-1.1,1.1].forEach(z=>mesh(new THREE.BoxGeometry(0.25,1.2,0.25),mat(0x4a3018),x,-0.2,z,g)));
 addCol({x:bx,z:bz,hw:3.5,hd:1.35,h:0.45});}
function buildPlateau(){const rockM=mat(0x7a7468);
 for(let a=0;a<TAU;a+=0.16){const dx=Math.cos(a),dz=Math.sin(a);const c=dx*RAMP.x+dz*RAMP.z;if(c>0.55)continue;const w=3.5+30*Math.pow(Math.max(0,c),6);if(Math.hypot(dx+0.6,dz-0.8)<0.22||Math.hypot(dx+0.995,dz+0.1)<0.28)continue;
  for(let k=0;k<2;k++){const rr=14+w*(k?0.5:1.0)+rnd(0,0.8);const x=PC.x+dx*rr,z=PC.z+dz*rr;if(Math.hypot(x,z)>91)continue;const s=rnd(0.9,2.1);const m=mesh(rockGeo(s),ROCKM,x,gh(x,z)+s*0.25,z);m.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3));m.scale.y=rnd(0.7,1.3);}}
 const tx=56,tz=-61,ty=gh(tx,tz);const st=triMat(0x8a857a,TX.stone,TX.stone,0.4,1.15);mesh(new THREE.CylinderGeometry(2.6,2.9,5.5,28,1,true),triMat(0x8a857a,TX.stone,TX.stone,0.4,1.15,{side:THREE.DoubleSide}),tx,ty+2.75,tz);
 for(let i=0;i<10;i++){const a=i/10*TAU;mesh(new THREE.BoxGeometry(1,rnd(0.4,1.8),0.8),st,tx+Math.cos(a)*2.7,ty+5.6,tz+Math.sin(a)*2.7).rotation.y=-a;}
 for(let i=0;i<6;i++){const x=tx+rnd(-5,5),z=tz+rnd(3.5,6);mesh(new THREE.BoxGeometry(rnd(.6,1.2),rnd(.4,.8),rnd(.6,1.2)),st,x,gh(x,z)+0.3,z).rotation.y=rnd(0,3);}
 addCol({x:tx,z:tz,r:3});const fl=glow(0xc9ffe0,3,0.5);fl.position.set(tx,ty+6.5,tz);scene.add(fl);
 const lx=42.3,lz=-58.3,ly=gh(lx,lz);const tel=new THREE.Group();tel.position.set(lx,ly,lz);scene.add(tel);const brass=mat(0xc8a040,{metalness:0.7,roughness:0.3,flatShading:false});
 for(let i=0;i<3;i++){const a=i/3*TAU;const leg=mesh(new THREE.CylinderGeometry(0.04,0.04,1.4,5),mat(0x4a3018),Math.cos(a)*0.35,0.65,Math.sin(a)*0.35,tel);leg.rotation.set(Math.sin(a)*0.25,0,-Math.cos(a)*0.25);}
 const tube=mesh(new THREE.CylinderGeometry(0.09,0.15,1.3,10),brass,0,1.45,0,tel);tube.rotation.z=Math.PI/2.3;tube.rotation.y=0.5;addCol({x:lx,z:lz,r:0.5});
 station({x:lx,z:lz,reach:2.3,hint:()=>S.zone==='monde'?'Regarder dans la longue-vue':null,act:telescope});}
function buildWorld3(){makeTextures();cubeCam.position.set(LAKE.x,1.4,LAKE.z);scene.add(cubeCam);
 
 buildRiver();buildBridge();buildPlateau();buildSalle();buildBiblio();buildAuberge();buildGrotte();}
function updWorld3(dt){const t=performance.now()/1000;
 const w=(S.weather||{}).w;const wt=w==='orage'?2.4:w==='pluie'?1.5:w==='brume'?0.5:1;WIND.uWind.value+=(wt-WIND.uWind.value)*Math.min(1,dt);
 if(riverMat)riverMat.map.offset.y-=dt*0.45;
 const z=S.zone;
 if(z==='monde'){
  if(Math.hypot(player.x-42,player.z+43)<70){const by=gh(41.4,-41.8);for(let i=0;i<2;i++)PN.emit(41.4+rnd(-1.6,1.6),by+0.5,-41.8+rnd(-1.2,1.2),rnd(-1.5,1.5),rnd(1,3),rnd(-1.5,1.5),0xeaf4ff,0.35,0.9,rnd(.6,1.1),3,1,0.7);if(Math.random()<dt*20)PN.emit(42.5+rnd(-1.2,1.2),by+rnd(1,7.5),-43.3+rnd(-1,1),rnd(-.5,.5),rnd(-2.5,-1),rnd(-.5,.5),0xffffff,0.25,0.5,0.7,4,1,0.55);}
  player.wade=(riverDist(player.x,player.z)<1.9||inPool(player.x,player.z))&&player.y<gh(player.x,player.z)+0.3;
  if(player.wade&&Math.hypot(player.vx,player.vz)>1&&Math.random()<dt*12)PN.emit(player.x,player.y+0.4,player.z,rnd(-1,1),rnd(1,2),rnd(-1,1),0xcfe8ff,0.18,0.08,0.5,9,0.5,0.85);
  ENT.forEach(e=>{if(e.kind==='scroll'&&e.data.beam>0){e.data.beam-=dt;if(Math.random()<dt*30)PA.emit(e.x+rnd(-.2,.2),gh(e.x,e.z)+rnd(0,16),e.z+rnd(-.2,.2),0,1.5,0,ELEM[e.data.spell.el].c,0.7,0.4,1.0,0,0,0.8);}});
 }else player.wade=false;
 if(z==='salle')CANDLES.forEach(c=>{c.s.position.y=c.y+Math.sin(t*1.3+c.p)*0.12;c.m.position.y=c.s.position.y-0.25;});
 if(z==='biblio_int'){BOOKS.forEach(b=>{b.a+=dt*b.sp;b.m.position.set(b.cx+Math.cos(b.a)*b.r,b.y+Math.sin(t+b.a*2)*0.25,b.cz+Math.sin(b.a)*b.r);b.m.rotation.y=-b.a;b.m.rotation.z=Math.sin(t*2+b.a)*0.3;});if(Math.random()<dt*6){const O=ZONES.biblio_int.O;PA.emit(O.x+rnd(-7,7),rnd(0.5,6),O.z+rnd(-7,7),rnd(-.1,.1),rnd(-.05,.1),rnd(-.1,.1),0xfff0c0,0.08,0.08,4,0,0,0.6);}}
 FIRES.forEach(f=>{if(f.zone===z&&Math.random()<dt*25)fireAt(f.x,f.y,f.z,f.s,1);});
 if(z==='grotte'){GCRY.forEach(c=>{if(c.t>0){c.t-=dt;c.mat.emissiveIntensity=1.1+Math.sin(t*8)*0.3;c.gl.material.opacity=0.9;if(Math.random()<dt*8)PA.emit(c.x,2.4,c.z,rnd(-.5,.5),rnd(.5,1.5),rnd(-.5,.5),c.mat.color.getHex(),0.3,0.05,0.8,0,0);}else{c.mat.emissiveIntensity=0.15;c.gl.material.opacity=0;}});CRYS.forEach(c=>{c.mat.emissiveIntensity=0.7+Math.sin(t*1.5+c.p)*0.3;});
  if(Math.random()<dt*4){const O=ZONES.grotte.O;PA.emit(O.x+rnd(-10,10),rnd(0.3,3),O.z+rnd(-10,10),0,rnd(.1,.3),0,pick([0x6ad8ff,0xff7ae0,0xb48cff]),0.1,0.1,3,0,0,0.8);}}
}

