/* ================= MODÈLES 3D EXTERNES (personnages Quaternius « RPG Character Pack », CC0) =================
   Fichiers dans assets/persos (préparés par tools/assets.mjs). Chargés en arrière-plan : tant qu'ils ne
   sont pas là, ou s'ils manquent (artifact claude.ai, fichier ouvert en local), les personnages faits
   par le code restent affichés. Quand un modèle arrive, il « habille » le personnage : le corps fait par
   le code est caché mais continue d'exister (le jeu s'en sert encore pour quelques repères).
   6 modèles peints (sorcier, clerc, moine, rôdeuse, voleur, guerrier) pour 10 rôles : ceux qui partagent un
   modèle sont distingués par une teinte. Morceaux fusionnés par texture : 1 à 2 appels de dessin par personnage.
   Options ⚙ → « Personnages » permet de revenir aux personnages d'origine (réglage mémorisé). */
const MDL={base:'assets/',ready:false,tpl:{},clips:{},failed:false,loading:false};
const MDL_PERSO={orvane:['sorcier',0xd2bcff],cassius:['clerc'],mirelle:['rodeuse'],lila:['rodeuse',0xffc0c8],ysolde:['voleur',0xd8c8ff,'sansArme'],
 bram:['guerrier'],tobias:['moine'],gaspard:['moine',0xffe6c0],brindille:['clerc',0xc8f0b8]};
let MDL_ON=true;try{MDL_ON=localStorage.getItem('aldermoor-persos')!=='simple';}catch(e){}
// apparence du joueur (Options ⚙) : un des six modèles
const MDL_LOOKS=[['sorcier','sorcier'],['rodeuse','rôdeuse'],['voleur','voleur·se'],['guerrier','guerrier'],['moine','moine'],['clerc','clerc']];
let MDL_LOOK='sorcier';try{const v=localStorage.getItem('aldermoor-look');if(MDL_LOOKS.some(l=>l[0]===v))MDL_LOOK=v;}catch(e){}
const HUMS=[]; // tous les personnages créés (joueur, PNJ, duellistes) : habillés dès que les modèles sont prêts
function mdlLoad(url){return new Promise((res,rej)=>{try{new THREE.GLTFLoader().load(MDL.base+url,res,undefined,rej);}catch(e){rej(e);}});}
// fusionne des morceaux animés qui partagent la même texture (même squelette) en un seul maillage
function mdlMerge(parts){let nv=0,ni=0;parts.forEach(p=>{nv+=p.geometry.attributes.position.count;ni+=p.geometry.index?p.geometry.index.count:p.geometry.attributes.position.count;});
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),si=new Uint16Array(nv*4),sw=new Float32Array(nv*4),idx=new Uint32Array(ni);let vo=0,io=0;
 for(const p of parts){const g=p.geometry,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,J=g.attributes.skinIndex,W=g.attributes.skinWeight;
  for(let i=0;i<P.count;i++){const k=vo+i;pos[k*3]=P.getX(i);pos[k*3+1]=P.getY(i);pos[k*3+2]=P.getZ(i);if(N){nor[k*3]=N.getX(i);nor[k*3+1]=N.getY(i);nor[k*3+2]=N.getZ(i);}if(U){uv[k*2]=U.getX(i);uv[k*2+1]=U.getY(i);}
   si[k*4]=J.getX(i);si[k*4+1]=J.getY(i);si[k*4+2]=J.getZ(i);si[k*4+3]=J.getW(i);sw[k*4]=W.getX(i);sw[k*4+1]=W.getY(i);sw[k*4+2]=W.getZ(i);sw[k*4+3]=W.getW(i);}
  if(g.index){for(let i=0;i<g.index.count;i++)idx[io+i]=g.index.getX(i)+vo;io+=g.index.count;}else{for(let i=0;i<P.count;i++)idx[io+i]=vo+i;io+=P.count;}vo+=P.count;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 geo.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));geo.setIndex(new THREE.BufferAttribute(idx,1));geo.computeBoundingSphere();return geo;}
function mdlPrep(gltf){const parts=[];gltf.scene.traverse(o=>{if(o.isSkinnedMesh)parts.push(o);});if(!parts.length)return null;
 gltf.scene.updateMatrixWorld(true);const groups=new Map();parts.forEach(p=>{const m=p.material;if(!groups.has(m))groups.set(m,[]);groups.get(m).push(p);});
 // le bout de l'arme (bâton du sorcier, du clerc) : d'où partent les particules des sorts
 let tipW=null;for(const p of parts){if(!/Staff/i.test(p.material.name||''))continue;const P=p.geometry.attributes.position,v=new THREE.Vector3();p.updateMatrixWorld();
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i);p.boneTransform?p.boneTransform(i,v):0;v.applyMatrix4(p.matrixWorld);if(!tipW||v.y>tipW.y)tipW=v.clone();}}
 const f=parts[0];groups.forEach((list,m)=>{if(m.map&&m.map.encoding!==THREE.LinearEncoding){m.map.encoding=THREE.LinearEncoding;m.map.needsUpdate=true;}m.needsUpdate=true;
  const mesh=new THREE.SkinnedMesh(mdlMerge(list),m);mesh.name=/Staff|Sword|Dagger|Bow/i.test(m.name||'')?'arme':'corps';mesh.position.copy(f.position);mesh.quaternion.copy(f.quaternion);mesh.scale.copy(f.scale);
  f.parent.add(mesh);mesh.bind(f.skeleton,f.bindMatrix);});
 parts.forEach(p=>p.parent.remove(p));
 gltf.scene.updateMatrixWorld(true);let headY=0,hand=null;gltf.scene.traverse(o=>{if(o.isBone&&/^Head/.test(o.name)){const v=new THREE.Vector3();o.getWorldPosition(v);headY=v.y;}if(o.isBone&&/^Fist\.?R$/.test(o.name))hand=o;});
 let tip=null;if(hand){tip={bone:hand.name,p:tipW?hand.worldToLocal(tipW.clone()):new THREE.Vector3(0,0,0)};}
 return {scene:gltf.scene,headY:headY||3,tip,tint:{}};}
function persoFor(H){if(H===player.H)return [MDL_LOOK];const n=NPCS.find(x=>x.look===H.L);if(n&&MDL_PERSO[n.id])return MDL_PERSO[n.id];
 const L=H.L||{};const t=new THREE.Color(0xffffff).lerp(new THREE.Color(L.robe||0xffffff),0.45).getHex(); // duellistes : teinte de leur robe
 return [L.hat?'sorcier':L.w>1.1?'guerrier':'voleur',t];}
// matériau teinté (mis en cache : tous les personnages de même modèle et même teinte le partagent)
function mdlTint(T,m,tint){if(!tint)return m;const k=m.uuid+'|'+tint;if(!T.tint[k]){const c=m.clone();c.color.setHex(tint);T.tint[k]=c;}return T.tint[k];}
// habille un personnage avec son modèle
function mdlDress(H){if(H.M||!MDL.ready||!MDL_ON)return;const [nom,tint,opt]=persoFor(H),T=MDL.tpl[nom];if(!T)return;const L=H.L||{h:1};
 const r=THREE.SkeletonUtils.clone(T.scene);let hand=null;
 r.traverse(o=>{if(o.isSkinnedMesh){o.material=mdlTint(T,o.material,tint);o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(o.name==='arme'&&(opt==='sansArme'||H===player.H&&!['sorcier','clerc'].includes(nom)))o.visible=false; /* un apprenti mage n'a que son bâton */}if(T.tip&&o.isBone&&o.name===T.tip.bone)hand=o;});
 const k=1.5*(L.h||1)/T.headY;r.scale.set(k*(L.w||1),k,k*(L.w||1)*0.95);H.root.add(r);H.body.visible=false;
 H.tip0=H.tip0||H.p.tip;if(hand){const tp=new THREE.Object3D();tp.position.copy(T.tip.p);hand.add(tp);H.p.tip=tp;} // particules des sorts au bout du bâton
 const mx=new THREE.AnimationMixer(r),A={};for(const n in MDL.clips)A[n]=mx.clipAction(MDL.clips[n]);
 H.M={r,mx,A,cur:null,cast:0};mdlPlay(H,'Idle',0);}
function mdlPlay(H,n,fade){const M=H.M,a=M.A[n];if(!a||M.cur===n)return;const old=M.cur&&M.A[M.cur];a.reset();a.enabled=true;a.setEffectiveWeight(1);a.play();
 if(old&&fade)old.crossFadeTo(a,fade,false);else if(old)old.stop();M.cur=n;}
function mdlAnim(H,dt,spd,air){const M=H.M;if(!M.r.visible)return;
 const sp=M.A.Spell1?'Spell1':'Punch';if(H.cast>0&&M.cast<=0&&M.A[sp]){M.cast=0.6;const a=M.A[sp];a.setLoop(THREE.LoopOnce,1);a.timeScale=1.7;mdlPlay(H,sp,0.08);}
 if(M.cast>0)M.cast-=dt;
 else{const want=spd>0.75?'Run':spd>0.08?'Walk':'Idle';mdlPlay(H,want,0.2);
  if(M.A.Walk)M.A.Walk.timeScale=clamp(spd/0.4,0.6,1.6);if(M.A.Run)M.A.Run.timeScale=clamp(spd/1.05,0.8,1.4)*(air?0.4:1);}
 M.mx.update(dt);}
{const _m=makeHuman;makeHuman=function(L){const H=_m.apply(this,arguments);H.L=L;HUMS.push(H);if(HUMS.length>60)HUMS.splice(0,HUMS.length-60);if(MDL.ready)mdlDress(H);return H;};}
{const _a=animHuman;animHuman=function(H,dt,spd,t,air){_a.apply(this,arguments);if(H.M)mdlAnim(H,dt,spd,air);};}
// retire le modèle d'un personnage (pour en changer)
function mdlUndress(H){if(!H.M)return;H.root.remove(H.M.r);H.M.mx.stopAllAction();H.M=null;H.body.visible=true;if(H.tip0)H.p.tip=H.tip0;}
function mdlNextLook(){const i=MDL_LOOKS.findIndex(l=>l[0]===MDL_LOOK);MDL_LOOK=MDL_LOOKS[(i+1)%MDL_LOOKS.length][0];try{localStorage.setItem('aldermoor-look',MDL_LOOK);}catch(e){}
 if(player.H){mdlUndress(player.H);mdlDress(player.H);}}
// changer de style en cours de partie (Options ⚙)
function mdlStyle(on){MDL_ON=on;try{localStorage.setItem('aldermoor-persos',on?'3d':'simple');}catch(e){}
 if(on&&!MDL.ready){mdlStart();return;}
 HUMS.forEach(H=>{if(on)mdlDress(H);else mdlUndress(H);});}
// chargement : animations partagées + un modèle par type de personnage
function mdlStart(){if(MDL.loading||MDL.ready)return;if(typeof THREE.GLTFLoader!=='function'||!THREE.SkeletonUtils||typeof THREE.SkeletonUtils.clone!=='function'){MDL.failed=true;return;}
 MDL.loading=true;const noms=[...new Set(['sorcier',MDL_LOOK].concat(Object.values(MDL_PERSO).map(v=>v[0]),MDL_LOOKS.map(l=>l[0])))];
 Promise.all([mdlLoad('persos/animations.glb')].concat(noms.map(n=>mdlLoad('persos/'+n+'.glb')))).then(([an,...ms])=>{
  an.animations.forEach(c=>{MDL.clips[c.name]=c;});ms.forEach((g,i)=>{const t=mdlPrep(g);if(t)MDL.tpl[noms[i]]=t;});
  MDL.ready=true;HUMS.forEach(mdlDress);}).catch(e=>{MDL.failed=true;console.warn('Modèles 3D indisponibles, personnages faits par le code.',e&&e.message||e);});}
if(MDL_ON)mdlStart();else MDL.failed=false;
