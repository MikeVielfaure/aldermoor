/* ================= LES LANDES D'OMBRELUNE : une grande région sauvage au-delà des montagnes =================
   Environ 3,5 fois la surface de la vallée. Elle est placée loin (x ≈ 2000) mais fait partie du même monde
   extérieur (S.zone reste « monde ») : météo, vol en balai, créatures, sorts et caméra marchent tels quels.
   On y va par la Pierre-Portail (bord ouest de la vallée) ou en franchissant les crêtes en balai.
   Relief : landH() ; gh() est redirigé ici quand x > 1500. Créatures : peuplement entretenu (LANDES_POP),
   certaines paisibles (calme:true, elles ne chargent pas le joueur ; les blesser assombrit l'âme). */
const LANDES={c:{x:2000,z:0},R:168,built:false,t:0,popT:0,swirl:[],flyOut:0,vp:null,lp:{x:1850,z:0},seen:false};
// lieux (coordonnées locales au centre de la région) : [id, nom, x, z, rayon, hauteur d'aplat ou null, style de décor]
const LANDES_LIEUX=[['landes_portail','Pierre-Portail des Landes',-150,0,8,0,null],['landes_camp','Campement des Voyageurs',-95,-48,11,0,'ferme'],
 ['landes_prairie','Prairie aux Lucioles',-58,20,22,null,'campagne'],['landes_lac','Lac Miroir-Ciel',5,-55,26,null,null],['landes_foret','Forêt des Murmures-Anciens',55,70,40,null,'foret'],
 ['landes_pic','Pic de Givrecorne',85,-105,20,null,'montagne'],['landes_plateau','Plateau des Géants',-50,95,16,3.5,'ruines'],['landes_nid','Nid de la Vouivre',120,15,13,2,'montagne']]; // 6e valeur : surélévation de l'aplat (null = pas d'aplat)
LANDES_LIEUX.forEach(([id,name,x,z,r,fh,st])=>{const L={id,name,x:LANDES.c.x+x,z:LANDES.c.z+z,r,spot:{x:LANDES.c.x+x+(id==='landes_lac'?-r-3:2),z:LANDES.c.z+z+2},hidden:true,region:'landes'};LOCS.push(L);LOCBY[id]=L;if(st)LOC_STYLE[id]=st;else LOC_STYLE[id]=null;});
const landBase=(u,v)=>noise(u*0.045,v*0.045)*1.6+noise(u*0.017+7,v*0.017-3)*4.5+noise(u*0.008-2,v*0.008+5)*4+3;
function landH(x,z){const u=x-LANDES.c.x,v=z-LANDES.c.z,r=Math.hypot(u,v);
 let h=landBase(u,v);
 {const d=Math.hypot(u-85,v+105);h+=30*Math.exp(-d*d/(2*20*20));} // Pic de Givrecorne
 {const d=Math.hypot(u-5,v+55);if(d<38)h=lerp(h,-3.2,smooth(38,22,d));} // cuvette du lac
 for(const [,,px,pz,pr,fh] of LANDES_LIEUX){if(fh==null)continue;const d=Math.hypot(u-px,v-pz);if(d<pr+14)h=lerp(h,landBase(px,pz)+fh,smooth(pr+14,pr,d));}
 if(r>140)h+=(r-140)*1.15+Math.max(0,noise(u*0.1,v*0.1))*Math.min(1,(r-140)/10)*6; // crêtes en bordure
 return h;}
{const _gh=gh;gh=function(x,z){return x>1500?landH(x,z):_gh(x,z);};}
const inLandes=()=>player.x>1500;
/* ---------- construction (appelée avant buildDecor : le décor automatique habille aussi les lieux d'ici) ---------- */
function buildLandes(){if(LANDES.built)return;LANDES.built=true;const C=LANDES.c,N=HQ?150:110,S2=380;
 const geo=new THREE.PlaneGeometry(S2,S2,N,N);geo.rotateX(-Math.PI/2);const P=geo.attributes.position,cols=new Float32Array(P.count*3),c=new THREE.Color();
 const G1=new THREE.Color(0x58823a),G2=new THREE.Color(0x76a04a),FOR=new THREE.Color(0x355a2a),ROCK=new THREE.Color(0x7a7566),SNOW=new THREE.Color(0xf0f4fa),SAND=new THREE.Color(0xc9b47e),DRY=new THREE.Color(0xa49a5a),ASH=new THREE.Color(0x4a3c34);
 for(let i=0;i<P.count;i++){const x=P.getX(i)+C.x,z=P.getZ(i)+C.z,u=x-C.x,v=z-C.z,y=landH(x,z);P.setX(i,x);P.setZ(i,z);P.setY(i,y);
  c.copy(G1).lerp(G2,clamp(noise(u*0.3,v*0.3)*0.5+0.5,0,1)*0.7);
  {const d=Math.hypot(u-55,v-70);if(d<46)c.lerp(FOR,smooth(46,30,d)*0.7);}
  {const d=Math.hypot(u+50,v-95);if(d<26)c.lerp(DRY,smooth(26,14,d)*0.7);}
  {const d=Math.hypot(u-120,v-15);if(d<20)c.lerp(ASH,smooth(20,9,d)*0.75);}
  {const d=Math.hypot(u-5,v+55);if(d<31)c.lerp(SAND,smooth(31,26,d));}
  if(y>16)c.lerp(ROCK,smooth(16,22,y)*0.8);if(y>24)c.lerp(SNOW,smooth(24,29,y));
  cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
 geo.setAttribute('color',new THREE.BufferAttribute(cols,3));geo.computeVertexNormals();
 {const Nn=geo.attributes.normal;for(let i=0;i<P.count;i++){const ny=Nn.getY(i);if(ny<0.86){c.setRGB(cols[i*3],cols[i*3+1],cols[i*3+2]).lerp(ROCK,clamp((0.86-ny)*3,0,0.85));cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}}geo.attributes.color.needsUpdate=true;}
 const ground=new THREE.Mesh(geo,triMat(0xffffff,TX.grass,TX.rock,0.3,1.06,{vertexColors:true,roughness:1}));ground.receiveShadow=true;ground.userData.landes=true;scene.add(ground);
 // lac
 {const lx=C.x+5,lz=C.z-55,w=new THREE.Mesh(new THREE.CircleGeometry(30,56).rotateX(-Math.PI/2),waterMat({cx:lx,cz:lz,r:30,op:0.62}));w.position.set(lx,0.25,lz);scene.add(w);addCol({x:lx,z:lz,r:25.5,lake:true});}
 // arbres (mêmes modèles que la vallée, instanciés et triés par la caméra)
 const T=[];const okTree=(x,z)=>{const u=x-C.x,v=z-C.z,y=landH(x,z);if(Math.hypot(u,v)>150||y>22||y<0.6||slopeAt(x,z)>1.6)return false;
  for(const [,,px,pz,pr] of LANDES_LIEUX)if(Math.hypot(u-px,v-pz)<pr*0.55+3)return false;for(const t of T)if(Math.hypot(t.x-x,t.z-z)<2.4)return false;return true;};
 for(let i=0;i<2200&&T.length<(HQ?440:300);i++){const forest=Math.random()<0.55;let x,z;if(forest){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*44;x=C.x+55+Math.cos(a)*r;z=C.z+70+Math.sin(a)*r;}else{const a=Math.random()*TAU,r=20+Math.random()*125;x=C.x+Math.cos(a)*r;z=C.z+Math.sin(a)*r;}
  if(!okTree(x,z))continue;const y=landH(x,z);T.push({x,z,y,s:0.85+Math.random()*0.6,v:y>14?3+(Math.random()<0.5?1:0):forest?(Math.random()<0.5?3:Math.floor(Math.random()*3)):Math.floor(Math.random()*5)});}
 const byV=[[],[],[],[],[]];T.forEach(t=>byV[t.v].push(t));const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),p3=new THREE.Vector3(),s3=new THREE.Vector3();
 byV.forEach((L,v)=>{if(!L.length||!TREEV[v])return;const V=TREEV[v],tm=new THREE.InstancedMesh(V.trunk.geometry,V.trunk.material,L.length),lf=new THREE.InstancedMesh(V.leaf.geometry,V.leaf.material,L.length);
  L.forEach((t,i)=>{q.setFromAxisAngle(UPV,Math.random()*TAU);m4.compose(p3.set(t.x,t.y-0.08,t.z),q,s3.set(t.s,t.s,t.s));tm.setMatrixAt(i,m4);lf.setMatrixAt(i,m4);tm.setColorAt(i,WHITEC);
   lf.setColorAt(i,V.t==='c'?c.setHSL(0.29+Math.random()*0.06,0.25+Math.random()*0.15,0.6+Math.random()*0.12):c.setHSL(0.2+Math.random()*0.09,0.3+Math.random()*0.25,0.6+Math.random()*0.16));addCol({x:t.x,z:t.z,r:0.45*t.s});});
  [tm,lf].forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;m.userData.landes=true;scene.add(m);regInst(m,instPos(m),6,175,25);});lf.customDepthMaterial=V.leaf.customDepthMaterial;});
 // herbe
 if(typeof grassMesh!=='undefined'&&grassMesh){const GN=HQ?3200:1400,gm=new THREE.InstancedMesh(grassMesh.geometry,grassMesh.material,GN);let k=0;
  for(let i=0;i<GN*4&&k<GN;i++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*140,x=C.x+Math.cos(a)*r,z=C.z+Math.sin(a)*r,y=landH(x,z);if(y<0.6||y>15||slopeAt(x,z)>1.4)continue;
   const sc=0.5+Math.random()*0.6;q.setFromAxisAngle(UPV,Math.random()*TAU);m4.compose(p3.set(x,y,z),q,s3.set(sc,sc*(0.7+Math.random()*0.8),sc));gm.setMatrixAt(k,m4);gm.setColorAt(k,c.setHSL(0.19+Math.random()*0.09,0.3,0.5+Math.random()*0.16));k++;}
  gm.count=k;gm.frustumCulled=false;gm.receiveShadow=true;scene.add(gm);regInst(gm,instPos(gm),1,60,6);}
 // décor : rochers, souches, champignons, fleurs ; roseaux du lac ; tentes du campement ; portails
 dkMats();const free=(x,z,r)=>{const y=landH(x,z);if(y<0.5||slopeAt(x,z)>1.2||!isFree({x,z},r))return false;for(const [,,px,pz,pr] of LANDES_LIEUX)if(Math.hypot(x-C.x-px,z-C.z-pz)<4)return false;return true;};
 [['bigboulders',22],['boulders',45],['stump',14],['log',12],['mushrooms',40],['flowers',55],['bush',40]].forEach(([k,n])=>{const K=DECOR_KIT[k];let m=0;
  for(let i=0;i<n*12&&m<n;i++){const forest=(k==='mushrooms'||k==='stump'||k==='log')&&Math.random()<0.7,a=Math.random()*TAU,r=forest?Math.sqrt(Math.random())*42:Math.sqrt(Math.random())*135;
   const x=forest?C.x+55+Math.cos(a)*r:C.x+Math.cos(a)*r,z=forest?C.z+70+Math.sin(a)*r:C.z+Math.sin(a)*r;if(!free(x,z,K.r))continue;K.put(x,z,Math.random()*TAU);m++;}});
 for(let i=0;i<46;i++){const a=i/46*TAU+Math.random()*0.1,r=24.5+Math.random()*1.6;dReeds(C.x+5+Math.cos(a)*r,C.z-55+Math.sin(a)*r);}
 [[-99,-44,0.4],[-91,-53,2.2],[-102,-54,-0.8]].forEach(([x,z,ry])=>dTent(C.x+x,C.z+z,ry));dFirebowl(C.x-95,C.z-48);
 LANDES.vp=landesPortalSpot();{const V=LANDES.vp;TREES=TREES.filter(t=>{if(Math.hypot(t.x-V.x,t.z-V.z)<6.5){COLS.forEach(c=>{if(c.tree===t)c.off=true;});return false;}return true;});treesDirty();}
 portal(LANDES.vp.x,LANDES.vp.z,LANDES.vp.ry);portal(LANDES.lp.x,LANDES.lp.z,-Math.PI/2);
 station({x:LANDES.vp.x+Math.sin(LANDES.vp.ry)*1.6,z:LANDES.vp.z+Math.cos(LANDES.vp.ry)*1.6,reach:2.8,hint:()=>inLandes()?null:'Traverser le portail vers les Landes d’Ombrelune',act:()=>landesGo(false)});
 station({x:LANDES.lp.x+1.6,z:LANDES.lp.z,reach:2.8,hint:()=>inLandes()?'Traverser le portail : retour à Aldermoor':null,act:()=>landesBack(false)});}
// emplacement du portail de la vallée : bord ouest, sur une place libre et plate
function landesPortalSpot(){for(let k=0;k<40;k++){const a=Math.PI+(k%2?1:-1)*Math.ceil(k/2)*0.05,r=86,x=Math.cos(a)*r,z=Math.sin(a)*r;if(isFree({x,z},2.2)&&slopeAt(x,z)<1.2&&pathDist(x,z)>2)return {x,z,ry:Math.atan2(-x,-z)};}return {x:-84,z:4,ry:Math.PI/2};}
// tente de voyageur (kit de décor)
function dTent(x,z,ry){dkAt(x,z,ry);const c=dkp([0xc8a46a,0xa86a44,0x8a9a5a]);dCyl('plain',c,0.06,1.25,2.3,0,1.15,0,9);dCyl('plain',new THREE.Color(c).multiplyScalar(0.7).getHex(),0.02,0.5,0.06,0,0.03,0,9);
 dTri('plain',0x2a1a10,0.04,1.1,0.8,0,0,1.06,Math.PI/2,-0.5,0);[0.5,-0.5,0].forEach((o,i)=>dCyl('wood',0x4a3018,0.03,0.03,0.7,o*0.2,2.5,i?0.05:-0.05,5,0,o,i*0.3));addCol({x,z,r:1.3});}
// portail : arche de pierre + voile tourbillonnant
function portal(x,z,ry){dkAt(x,z,ry);const S1=0x8f8a80,S2=0x6f6a62;[-1,1].forEach(s=>{dBox('stone',S2,0.9,0.4,0.9,s*1.75,0.2,0);dBox('stone',S1,0.7,3.6,0.7,s*1.75,2.2,0);dBox('stone',S2,0.85,0.3,0.85,s*1.75,4.1,0);});
 for(let i=0;i<=8;i++){const a=i/8*Math.PI;dBox('stone',i%2?S1:S2,0.75,0.5,0.7,Math.cos(a)*1.75,4.25+Math.sin(a)*1.1,0,0,0,a-Math.PI/2);}
 addCol({x:x+Math.cos(ry)*1.75,z:z-Math.sin(ry)*1.75,r:0.55});addCol({x:x-Math.cos(ry)*1.75,z:z+Math.sin(ry)*1.75,r:0.55});
 const y=gh(x,z),m=new THREE.Mesh(new THREE.CircleGeometry(1.45,40),new THREE.MeshBasicMaterial({map:glowTex,color:0xb488ff,transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 m.position.set(x,y+2.35,z);m.rotation.y=ry;m.scale.y=1.45;m.userData.dyn=true;scene.add(m);const g=glow(0xb488ff,6,0.35);g.position.set(x,y+2.4,z);scene.add(g);LANDES.swirl.push({m,x,y:y+2.4,z});}
/* ---------- voyages ---------- */
function landesGo(byAir){fade(()=>{const L=LANDES.lp;player.x=L.x+3;player.z=L.z+(byAir?rnd(-6,6):0);player.y=gh(player.x,player.z)+(byAir?7:0);player.vx=player.vz=player.vy=0;player.ry=Math.PI/2;camYaw=Math.PI/2;
  sfx('door');if(!LANDES.seen&&!S.landesVu){S.landesVu=1;chron('Découverte des Landes d’Ombrelune.');gainXP(25);
   setTimeout(()=>say('🌄 Les <b>Landes d’Ombrelune</b> s’étendent à perte de vue : un lac, une vieille forêt, un pic enneigé, un plateau de pierres géantes… et le nid d’une vouivre. La carte 🗺 montre la région. (+25 XP)','gm'),600);}
  else say('🌄 Les Landes d’Ombrelune.','sys');LANDES.seen=true;save();});}
function landesBack(byAir){fade(()=>{const V=LANDES.vp;player.x=V.x+Math.sin(V.ry)*3;player.z=V.z+Math.cos(V.ry)*3;player.y=gh(player.x,player.z)+(byAir?6:0);player.vx=player.vz=player.vy=0;player.ry=V.ry;camYaw=V.ry;sfx('door');say('🏰 Retour dans la vallée d’Aldermoor.','sys');save();});}
/* ---------- peuplement : chaque groupe garde son effectif quand le joueur est dans la région ---------- */
const LANDES_POP=[
 {n:'Cerfs des landes',w:'feu',l:'nature',c:[-58,20],r:20,k:4,calme:true},{n:'Poules des bruyères',w:'eau',l:'lumiere',c:[-88,-30],r:12,k:4,calme:true},
 {n:'Pandas des brumes',w:'feu',l:'ombre',c:[30,95],r:14,k:2,calme:true},{n:'Pingouins de Givrecorne',w:'feu',l:'glace',c:[72,-88],r:14,k:4,calme:true},
 {n:'Sangliers grogneurs',w:'glace',l:'nature',c:[10,30],r:18,k:3},{n:'Farfadets tapageurs',w:'vent',l:'nature',c:[55,70],r:32,k:4},{n:'Arbres errants',w:'feu',l:'nature',c:[70,92],r:16,k:2,hp:4},
 {n:'Lutins de givre',w:'feu',l:'glace',c:[92,-112],r:12,k:3},{n:'Poulpes volants du lac',w:'lumiere',l:'eau',c:[5,-24],r:9,k:2},{n:'Cactus grincheux',w:'eau',l:'nature',c:[-45,88],r:10,k:2},
 {n:'Gardiens de pierre',w:'glace',l:'arcane',c:[-50,95],r:10,k:2,hp:4},{n:'Diablotins verts',w:'eau',l:'feu',c:[110,28],r:12,k:3},{n:'Vouivre de braise',w:'glace',l:'feu',c:[120,15],r:5,k:1,hp:12,sc:1.7}];
CREA_NOMS.unshift([/cerf/i,'cerf'],[/poule/i,'poule'],[/panda/i,'panda'],[/pingouin|manchot/i,'pingouin'],[/sanglier|groin|cochon/i,'cochon'],[/poulpe|pieuvre/i,'poulpe'],[/cactus/i,'cactus'],[/diablotin/i,'diablotin'],[/vouivre/i,'dragon']);
CREA_VOL.poulpe=1;
function landesPop(){const C=LANDES.c;LANDES_POP.forEach((g,i)=>{const alive=ENT.filter(e=>e.kind==='creature'&&e.data.pop===i).length;
 for(let k=alive;k<g.k;k++){let x,z,ok=false;for(let t=0;t<12&&!ok;t++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*g.r;x=C.x+g.c[0]+Math.cos(a)*r;z=C.z+g.c[1]+Math.sin(a)*r;ok=landH(x,z)>0.4&&isFree({x,z},1)&&Math.hypot(x-player.x,z-player.z)>14;}
  if(!ok)continue;const e=spawnCreatureAt(x,z,g.n,g.w,g.l,g.hp||2,{pop:i,calme:!!g.calme,scale:g.sc||1});e.data.loc=pick(LANDES_LIEUX)[0];}});}
// blesser un animal paisible assombrit l'âme
{const _k=killCreature;killCreature=function(e){const D=e&&e.data;const r=_k.apply(this,arguments);if(D&&D.calme&&typeof karma==='function'){karma(-2);if(!LANDES.warned){LANDES.warned=1;say('🌑 Cet animal ne t’avait rien fait… Ton âme s’assombrit un peu.','sys');}}return r;};}
/* ---------- à chaque image : ciel qui suit la caméra, portails, vol au-delà des crêtes, peuplement ---------- */
function landesTick(dt){if(!started)return;skyMesh.position.copy(camera.position);stars.position.copy(camera.position);
 LANDES.t+=dt;LANDES.swirl.forEach(s=>{s.m.rotation.z+=dt*0.8;s.m.material.opacity=0.7+Math.sin(LANDES.t*2)*0.15;if(Math.random()<dt*8)PA.emit(s.x+rnd(-1,1),s.y+rnd(-1.4,1.4),s.z+rnd(-1,1),0,rnd(0.2,0.8),0,0xc8a0ff,0.25,0.03,rnd(.6,1.2),0,0);});
 // en balai : franchir les crêtes fait passer d'une région à l'autre
 if(FLY.on&&S.zone==='monde'){const L=inLandes(),dx=L?player.x-LANDES.c.x:player.x,dz=L?player.z-LANDES.c.z:player.z,d=Math.hypot(dx,dz),out=(dx*player.vx+dz*player.vz)>0;
  if(d>(L?149:88.5)&&out){LANDES.flyOut+=dt;if(LANDES.flyOut>0.7){LANDES.flyOut=0;if(L)landesBack(true);else landesGo(true);}}else LANDES.flyOut=0;}
 if(inLandes()){LANDES.popT-=dt;if(LANDES.popT<=0){LANDES.popT=2.5;landesPop();}}}
{const _w=world4Tick;world4Tick=function(dt){landesTick(dt);return _w.apply(this,arguments);};}
/* ---------- carte de la région ---------- */
{const _d=drawMap;drawMap=function(){if(!inLandes())return _d.apply(this,arguments);const cv=$('#map-c'),W=Math.min(window.innerWidth-24,560);cv.width=W*2;cv.height=W*2;cv.style.width=cv.style.height=W+'px';const g=cv.getContext('2d');g.setTransform(2,0,0,2,0,0);
 const C=LANDES.c,k=W/2/175,P=(x,z)=>[W/2+(x-C.x)*k,W/2+(z-C.z)*k];
 g.fillStyle='#2a2438';g.fillRect(0,0,W,W);const gr=g.createRadialGradient(W/2,W/2,0,W/2,W/2,W/2);gr.addColorStop(0,'#5d8a44');gr.addColorStop(0.78,'#4d7a3a');gr.addColorStop(0.86,'#7a7566');gr.addColorStop(1,'#3a3644');g.fillStyle=gr;g.beginPath();g.arc(W/2,W/2,W/2-2,0,TAU);g.fill();
 const blob=(x,z,r,col)=>{const [a,b]=P(C.x+x,C.z+z);g.fillStyle=col;g.beginPath();g.arc(a,b,r*k,0,TAU);g.fill();};
 blob(55,70,42,'rgba(40,80,36,.85)');blob(85,-105,24,'rgba(235,240,248,.9)');blob(-50,95,18,'rgba(170,160,95,.8)');blob(120,15,14,'rgba(80,60,52,.9)');blob(5,-55,26,'#3a7fb0');
 g.font='600 11px Inter,sans-serif';g.textAlign='center';LANDES_LIEUX.forEach(([id,name,x,z])=>{const [a,b]=P(C.x+x,C.z+z);g.fillStyle='#f3cf7a';g.beginPath();g.arc(a,b,3.5,0,TAU);g.fill();g.fillStyle='#fff';g.fillText(name,a,b-7);});
 const [px,pz]=P(player.x,player.z);g.save();g.translate(px,pz);g.rotate(-player.ry+Math.PI);g.fillStyle='#ff7ae0';g.beginPath();g.moveTo(0,-8);g.lineTo(5,6);g.lineTo(-5,6);g.closePath();g.fill();g.restore();
 $('#map-s').innerHTML='Tu es dans les <b>Landes d’Ombrelune</b>. Retour à Aldermoor : la Pierre-Portail à l’ouest, ou les crêtes en balai.';cv.onclick=null;};}
// le MJ connaît la région
{const _bp=buildPrompt;buildPrompt=function(){return _bp.apply(this,arguments).replace(RULES,RULES+'\nRégion des Landes d’Ombrelune (lieux landes_*) : grande région sauvage au-delà des montagnes, atteinte par la Pierre-Portail ou en balai. Lac Miroir-Ciel, Forêt des Murmures-Anciens, Pic de Givrecorne enneigé, Plateau des Géants, Nid d’une vouivre de braise, Campement des Voyageurs. Animaux paisibles (cerfs, poules, pandas, pingouins) et créatures hostiles. Tu peux y envoyer le joueur en quête.');};}
/* ---------- quêtes des Landes (MJ classique) : proposées une fois la région découverte ---------- */
const LANDES_QUETES=[
 g=>({title:'La colère de la vouivre',desc:'Bram a vu des fumées au-dessus du Nid de la Vouivre, dans les Landes. Il faut apaiser les braises avant qu’elles n’embrasent la forêt.',giver:'bram',
  steps:[{kind:'goto',loc:'landes_nid',text:'Rejoindre le Nid de la Vouivre (Landes)'},{kind:'cast',loc:'landes_nid',el:'glace',text:'Apaiser les braises du nid avec un sort de Glace'},{kind:'talk',npc:'bram',text:'Rassurer Bram'}],reward:{xp:120,spell:null}}),
 g=>({title:'Les pierres qui chantent',desc:'Ysolde a lu qu’au Plateau des Géants, les pierres répondent à la magie pure.',giver:'ysolde',
  steps:[{kind:'goto',loc:'landes_plateau',text:'Gravir le Plateau des Géants (Landes)'},{kind:'cast',loc:'landes_plateau',el:'arcane',text:'Faire chanter les pierres avec un sort d’Arcane'},{kind:'collect',loc:'landes_plateau',item:'un éclat de pierre chantante',text:'Ramasser un éclat de pierre chantante'},{kind:'talk',npc:'ysolde',text:'Rapporter l’éclat à Ysolde'}],reward:{xp:110,spell:genSpell()}}),
 g=>({title:'Le reflet du lac',desc:'Cassius jure que le Lac Miroir-Ciel garde les reflets des étoiles même en plein jour.',giver:'cassius',
  steps:[{kind:'goto',loc:'landes_lac',text:'Aller au Lac Miroir-Ciel (Landes)'},{kind:'cast',loc:'landes_lac',el:'lumiere',text:'Éclairer le lac avec un sort de Lumière'},{kind:'collect',loc:'landes_lac',item:'une écaille de lune',text:'Trouver l’écaille de lune sur la rive'},{kind:'talk',npc:'cassius',text:'Montrer l’écaille à Cassius'}],reward:{xp:100,spell:null}}),
 g=>({title:'La fleur de givre',desc:'Mère Brindille a besoin d’une fleur qui ne pousse que sur les pentes du Pic de Givrecorne.',giver:'brindille',
  steps:[{kind:'goto',loc:'landes_pic',text:'Monter au Pic de Givrecorne (Landes)'},{kind:'collect',loc:'landes_pic',item:'une fleur de givre',text:'Cueillir une fleur de givre'},{kind:'talk',npc:'brindille',text:'Apporter la fleur à Mère Brindille'}],reward:{xp:90,spell:null}}),
 g=>({title:'Les cerfs effrayés',desc:'Mirelle s’inquiète : les cerfs de la Prairie aux Lucioles ne broutent plus. La terre aurait besoin d’un peu de magie.',giver:'mirelle',
  steps:[{kind:'goto',loc:'landes_prairie',text:'Aller à la Prairie aux Lucioles (Landes)'},{kind:'cast',loc:'landes_prairie',el:'nature',text:'Ranimer la prairie avec un sort de Nature'},{kind:'talk',npc:'mirelle',text:'Prévenir Mirelle'}],reward:{xp:80,spell:null}})];
{const _gq=genQuest;genQuest=function(giverId){if(S&&S.landesVu&&Math.random()<0.4){const q=pick(LANDES_QUETES)(giverId);if(!S.quests.some(x=>x.title===q.title)&&!(S.done||[]).includes(q.title))return q;}return _gq.apply(this,arguments);};}
