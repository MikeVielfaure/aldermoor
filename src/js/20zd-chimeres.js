/* ================= CHIMÈRES : animaux réalistes + magie ajoutée par le jeu =================
   Modèles : Quaternius « Ultimate Animated Animal Pack » (CC0), préparés par `node tools/assets.mjs chimeres`
   (src/assets/creatures/licorne.glb…). Le jeu y accroche corne, ailes, queues de feu… sur les os (repère de l'os :
   Y = le long de l'os, vers le museau pour Head, vers l'avant pour Torso2, vers le bout pour Tail ; Z = vers le haut),
   et change couleur (userData.b) et lueur (userData.e, gardée par creaTick) des matériaux. Sans fichier : boule de lumière. */
const CHIM_VOL=['pegase'];CHIM_VOL.forEach(m=>{CREA_VOL[m]=1;});
Object.assign(MONS_TAILLE,{licorne:1.45,pegase:1.45,'cerf-etoiles':1.5,'loup-spectral':0.85,'renard-feu':0.62,'taureau-lave':1.4});
CREA_NOMS.unshift([/licorne/i,'licorne'],[/pégase|pegase|chevaux? ailés?|cheval ailé/i,'pegase'],[/cerfs? (des étoiles|de lumière|lumineux|d’étoiles|d'étoiles)/i,'cerf-etoiles'],
 [/\bloups?\b|lycan/i,'loup-spectral'],[/renard|kitsune/i,'renard-feu'],[/taureaux? de lave|taureaux? de feu|minotaure/i,'taureau-lave']);
const CHIMS=[],CHV=new THREE.Vector3(),CHV2=new THREE.Vector3();
/* accroche un objet à un os, en mètres (on annule l'échelle du modèle) */
function chimAt(M,bone,obj,x,y,z){const b=M.r.getObjectByName(bone);if(!b)return null;M.r.updateMatrixWorld(true);b.getWorldScale(CHV);const g=new THREE.Group();g.scale.setScalar(1/(CHV.x||1));g.add(obj);obj.position.set(x||0,y||0,z||0);b.add(g);return obj;}
const chimMat=(c,e,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,emissive:e||0,roughness:0.55,metalness:0,flatShading:true},o||{}));
function chimRecolor(M,re,base,glow){for(const m of M.mats)if(re.test(m.name||'')){if(base!=null)m.userData.b=new THREE.Color(base);if(glow!=null)m.userData.e=glow;}}
/* une aile : des plumes de plus en plus courtes vers l'arrière, dans le plan de l'os du torse */
function chimWing(side){const w=new THREE.Group(),m=chimMat(0xffffff,0x1c2236);for(let i=0;i<7;i++){const L=1.7-i*0.17,f=new THREE.Mesh(new THREE.BoxGeometry(L,0.34,0.05),m);f.position.set(side*L/2,-i*0.17+0.12,i*0.02);f.rotation.x=0.25;w.add(f);}return w;}
function chimDress(e,m){const M=e.data.M;if(!M||M.chim)return;M.chim={m,t:Math.random()*10,tips:[]};const C=M.chim;
 if(m==='licorne'||m==='pegase'){chimRecolor(M,/^Main$/i,0xf2f0fa,0x303038);chimRecolor(M,/^Main_Light$/i,0xffffff,0x34343c);chimRecolor(M,/Muzzle/i,0xe0c8d4,0x140c10);chimRecolor(M,/Hooves/i,m==='licorne'?0xe0b860:0xb8c4d8,m==='licorne'?0x3a2a08:0);
  chimRecolor(M,/Hair/i,m==='licorne'?0xe8ccff:0xcfe6ff,m==='licorne'?0x2a1640:0x12243a);}
 if(m==='licorne'){const g=new THREE.ConeGeometry(0.065,0.62,8,8).translate(0,0.31,0);const P=g.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i),a=y*9,x=P.getX(i),z=P.getZ(i);P.setXYZ(i,x*Math.cos(a)-z*Math.sin(a),y,x*Math.sin(a)+z*Math.cos(a));}g.computeVertexNormals();
  const h=chimAt(M,'Head',new THREE.Mesh(g,chimMat(0xfff4dc,0x8a6a30)),0,0.15,0.13);if(h){h.rotation.x=Math.PI/2+0.15;const tip=new THREE.Object3D();tip.position.y=0.62;h.add(tip);C.tips.push(tip);}}
 if(m==='pegase'){for(const s of [1,-1]){const w=chimAt(M,'Torso2',chimWing(s),s*0.16,0.28,0.42);if(w){w.userData.side=s;(C.wings=C.wings||[]).push(w);}}}
 if(m==='cerf-etoiles'){M.r.traverse(o=>{if(o.isMesh&&/Horn/i.test(o.name)){o.material.userData.b=new THREE.Color(0xc8f0ff);o.material.userData.e=0x2f86c8;C.horn=o;}});}
 if(m==='loup-spectral'){for(const mt of M.mats){mt.transparent=true;mt.opacity=0.58;mt.userData.b=(mt.userData.b||new THREE.Color(1,1,1)).clone().lerp(new THREE.Color(0x9fb4ff),0.55);mt.userData.e=0x1a2450;}}
 if(m==='renard-feu'){chimRecolor(M,/^Main$/i,0xff7a2a,0x3a0c00);const fm=chimMat(0xffa040,0xff5a00,{transparent:true,opacity:0.92});
  for(const s of [0.55,-0.55]){const t=chimAt(M,'Tail2',new THREE.Mesh(new THREE.ConeGeometry(0.1,0.7,6).translate(0,0.35,0),fm),0,0.05,0);if(t){t.rotation.z=s;const tip=new THREE.Object3D();tip.position.y=0.7;t.add(tip);C.tips.push(tip);}}
  const b=M.r.getObjectByName('Tail8');if(b)C.tips.push(b);}
 if(m==='taureau-lave'){chimRecolor(M,/^Main$/i,0x1e1715,0x220602);chimRecolor(M,/^Main_Light$/i,0xff7a2a,0xd04000);chimRecolor(M,/Horn/i,0xffb070,0xff6a10);}
 CHIMS.push(e);}
{const _d=creaDress;creaDress=function(e,m){const r=_d.apply(this,arguments);if(/^(licorne|pegase|cerf-etoiles|loup-spectral|renard-feu|taureau-lave)$/.test(m))chimDress(e,m);return r;};}
/* à chaque image : ailes qui battent, étincelles, flammes, braises, volutes (seulement près de la caméra) */
function chimTick(dt){const cam=camera.position;for(let i=CHIMS.length-1;i>=0;i--){const e=CHIMS[i],M=e.data.M;if(!ENT.includes(e)||!M){CHIMS.splice(i,1);continue;}
  const C=M.chim;C.t+=dt;if(Math.hypot(e.x-cam.x,e.z-cam.z)>45)continue;const y0=e.obj.position.y,m=C.m;
  if(C.wings)for(const w of C.wings)w.rotation.y=-w.userData.side*(0.15+Math.sin(C.t*6.5)*0.6);
  for(const tp of C.tips){if(Math.random()>dt*(m==='renard-feu'?22:7))continue;tp.getWorldPosition(CHV);
   if(m==='renard-feu')PA.emit(CHV.x,CHV.y,CHV.z,rnd(-.3,.3),rnd(.6,1.4),rnd(-.3,.3),Math.random()<0.5?0xff8a20:0xffd060,rnd(.18,.32),0.04,rnd(.35,.6),-1,1.2);
   else PA.emit(CHV.x,CHV.y,CHV.z,rnd(-.4,.4),rnd(.1,.6),rnd(-.4,.4),Math.random()<0.5?0xfff0b0:0xd8b8ff,rnd(.12,.22),0.02,rnd(.6,1.1),-0.3,1);}
  if(m==='cerf-etoiles'&&C.horn&&Math.random()<dt*9){C.horn.getWorldPosition(CHV);PA.emit(CHV.x+rnd(-.5,.5),CHV.y+rnd(.1,.7),CHV.z+rnd(-.5,.5),0,rnd(.1,.4),0,Math.random()<0.6?0xa8e4ff:0xffffff,rnd(.1,.2),0.02,rnd(.8,1.4),-0.2,1);}
  if(m==='loup-spectral'&&Math.random()<dt*10)PN.emit(e.x+rnd(-.5,.5),y0+rnd(.3,.9),e.z+rnd(-.5,.5),rnd(-.2,.2),rnd(.2,.5),rnd(-.2,.2),0x2a2048,rnd(.3,.55),0.1,rnd(.7,1.2),-0.2,1);
  if(m==='taureau-lave'&&Math.random()<dt*20)PA.emit(e.x+rnd(-.7,.7),y0+rnd(.6,1.6),e.z+rnd(-.9,.9),rnd(-.2,.2),rnd(.8,1.8),rnd(-.2,.2),Math.random()<0.5?0xff5a10:0xffa030,rnd(.1,.2),0.02,rnd(.5,1),-1,1);}}
{const _w=world4Tick;world4Tick=function(dt){chimTick(dt);return _w.apply(this,arguments);};}
/* où les croiser */
[[1,['Licornes','ombre','lumiere',6,1]],[1,['Cerfs des étoiles','ombre','lumiere',4,1]],[0,['Pégases','ombre','vent',5,1]],[2,['Renards de feu','eau','feu',3]],
 [3,['Loups spectraux','lumiere','ombre',4]],[5,['Taureaux de lave','eau','feu',7]],[5,['Loups spectraux','lumiere','ombre',4]]].forEach(([b,p])=>TER_POP[b].push(p));
LANDES_POP.push({n:'Loups spectraux',w:'lumiere',l:'ombre',c:[60,-20],r:20,k:3});
