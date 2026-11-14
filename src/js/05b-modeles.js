/* ================= MODÈLES 3D EXTERNES (personnages Quaternius, CC0) =================
   Fichiers dans assets/persos (préparés par tools/assets.mjs). Chargés en arrière-plan : tant qu'ils ne
   sont pas là, ou s'ils manquent (artifact claude.ai, fichier ouvert en local), les personnages faits
   par le code restent affichés. Quand un modèle arrive, il « habille » le personnage : le corps fait par
   le code est caché mais continue d'exister (le jeu s'en sert encore pour quelques repères).
   Les 7 matériaux d'un modèle sont fusionnés en un seul (couleurs par sommet) : 1 appel de dessin par
   personnage, et chaque PNJ garde ses couleurs (robe, peau, cheveux, chapeau…) définies dans 01-donnees. */
const MDL={base:'assets/',ready:false,tpl:{},clips:{},failed:false};
const MDL_PERSO={orvane:'sorcier',cassius:'sorcier',mirelle:'sorciere',lila:'sorciere',brindille:'sorciere',ysolde:'elfe',bram:'forestier',tobias:'aubergiste',gaspard:'meunier'};
const PERSO_MAT=new THREE.MeshStandardMaterial({vertexColors:true,skinning:true,roughness:0.78,metalness:0});
const HUMS=[]; // tous les personnages créés (joueur, PNJ, duellistes) : habillés dès que les modèles sont prêts
function mdlLoad(url){return new Promise((res,rej)=>{try{new THREE.GLTFLoader().load(MDL.base+url,res,undefined,rej);}catch(e){rej(e);}});}
// fusionne les sous-maillages d'un modèle en un seul, avec un attribut « slot » = numéro du matériau d'origine
function mdlPrep(gltf){const parts=[];gltf.scene.traverse(o=>{if(o.isSkinnedMesh)parts.push(o);});if(!parts.length)return null;
 const slots=[],orig=[];let nv=0,ni=0;parts.forEach(p=>{nv+=p.geometry.attributes.position.count;ni+=p.geometry.index?p.geometry.index.count:p.geometry.attributes.position.count;});
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),si=new Uint16Array(nv*4),sw=new Float32Array(nv*4),sl=new Float32Array(nv),idx=new Uint32Array(ni);let vo=0,io=0;
 for(const p of parts){const g=p.geometry,P=g.attributes.position,N=g.attributes.normal,J=g.attributes.skinIndex,W=g.attributes.skinWeight;const nm=(p.material&&p.material.name)||'?';let s=slots.indexOf(nm);if(s<0){s=slots.length;slots.push(nm);orig.push(p.material&&p.material.color?p.material.color.getHex():0xffffff);}
  for(let i=0;i<P.count;i++){const k=vo+i;pos[k*3]=P.getX(i);pos[k*3+1]=P.getY(i);pos[k*3+2]=P.getZ(i);if(N){nor[k*3]=N.getX(i);nor[k*3+1]=N.getY(i);nor[k*3+2]=N.getZ(i);}
   si[k*4]=J.getX(i);si[k*4+1]=J.getY(i);si[k*4+2]=J.getZ(i);si[k*4+3]=J.getW(i);sw[k*4]=W.getX(i);sw[k*4+1]=W.getY(i);sw[k*4+2]=W.getZ(i);sw[k*4+3]=W.getW(i);sl[k]=s;}
  if(g.index){for(let i=0;i<g.index.count;i++)idx[io+i]=g.index.getX(i)+vo;io+=g.index.count;}else{for(let i=0;i<P.count;i++)idx[io+i]=vo+i;io+=P.count;}vo+=P.count;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));
 geo.setAttribute('skinIndex',new THREE.BufferAttribute(si,4));geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));geo.setAttribute('slot',new THREE.BufferAttribute(sl,1));geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(nv*3),3));
 geo.setIndex(new THREE.BufferAttribute(idx,1));geo.computeBoundingSphere();geo.userData={slots,orig};
 const f=parts[0],m=new THREE.SkinnedMesh(geo,PERSO_MAT);m.position.copy(f.position);m.quaternion.copy(f.quaternion);m.scale.copy(f.scale);f.parent.add(m);m.bind(f.skeleton,f.bindMatrix);
 parts.forEach(p=>p.parent.remove(p));
 // hauteur de la tête (repère pour mettre chaque modèle à la taille du personnage)
 gltf.scene.updateMatrixWorld(true);let headY=0;gltf.scene.traverse(o=>{if(o.isBone&&/^Head/.test(o.name)){const v=new THREE.Vector3();o.getWorldPosition(v);headY=v.y;}});
 return {scene:gltf.scene,headY:headY||3};}
// couleur d'un matériau d'origine selon l'apparence du personnage (01-donnees : skin, hair, robe, trim, hat…)
function persoColor(nm,L,o){const dark=c=>new THREE.Color(c).multiplyScalar(0.6).getHex();
 if(/^Skin/.test(nm))return L.skin;if(/^Hair/.test(nm))return L.beard||L.hair;if(/^Hat/.test(nm))return L.hat||dark(L.robe);
 if(/^(Clothes|Vest|Detail|DarkClothes)/.test(nm))return L.robe;if(/^(Gold|Band|Shirt)/.test(nm))return L.trim;
 if(/^Face/.test(nm))return 0x221a1e; // yeux et sourcils
 if(/^Pants/.test(nm))return 0x2a2630;if(/^Belt/.test(nm))return 0x2a1c12;return o;}
function persoFor(H){if(H===player.H)return 'sorcier';const n=NPCS.find(x=>x.look===H.L);if(n&&MDL_PERSO[n.id])return MDL_PERSO[n.id];
 const L=H.L||{};return L.hat?(['bun','pony','long'].includes(L.style)?'sorciere':'sorcier'):'meunier';}
// habille un personnage avec son modèle
function mdlDress(H){if(H.M||!MDL.ready)return;const T=MDL.tpl[persoFor(H)];if(!T)return;const L=H.L||{h:1};
 const r=THREE.SkeletonUtils.clone(T.scene);let mesh=null,hand=null;r.traverse(o=>{if(o.isSkinnedMesh)mesh=o;if(o.isBone&&/^Fist\.?R/.test(o.name))hand=o;});if(!mesh)return;
 const g=mesh.geometry.clone(),S=g.attributes.slot,C=g.attributes.color,c=new THREE.Color(),cols=g.userData.slots.map((nm,i)=>persoColor(nm,L,g.userData.orig[i]));
 for(let i=0;i<S.count;i++){c.set(cols[S.getX(i)]);C.setXYZ(i,c.r,c.g,c.b);}mesh.geometry=g;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;
 const k=1.5*(L.h||1)/T.headY;r.scale.set(k*(L.w||1),k,k*(L.w||1)*0.95);H.root.add(r);H.body.visible=false;
 if(hand){const tip=new THREE.Object3D();tip.position.set(0,0.35,0.2);hand.add(tip);H.p.tip=tip;} // particules des sorts au bout de la main
 const mx=new THREE.AnimationMixer(r),A={};for(const n in MDL.clips)A[n]=mx.clipAction(MDL.clips[n]);
 H.M={r,mx,A,cur:null,cast:0};mdlPlay(H,'Idle',0);}
function mdlPlay(H,n,fade){const M=H.M,a=M.A[n];if(!a||M.cur===n)return;const old=M.cur&&M.A[M.cur];a.reset();a.enabled=true;a.setEffectiveWeight(1);a.play();
 if(old&&fade)old.crossFadeTo(a,fade,false);else if(old)old.stop();M.cur=n;}
function mdlAnim(H,dt,spd,air){const M=H.M;
 if(H.cast>0&&M.cast<=0&&M.A.Shoot_OneHanded){M.cast=0.55;const a=M.A.Shoot_OneHanded;a.setLoop(THREE.LoopOnce,1);a.timeScale=1.8;mdlPlay(H,'Shoot_OneHanded',0.08);}
 if(M.cast>0)M.cast-=dt;
 else{const want=air?'Jump':spd>0.75?'Run':spd>0.08?'Walk':'Idle';if(want==='Jump'&&M.A.Jump){M.A.Jump.setLoop(THREE.LoopOnce,1);M.A.Jump.clampWhenFinished=true;}mdlPlay(H,want,0.2);
  if(M.A.Walk)M.A.Walk.timeScale=clamp(spd/0.4,0.6,1.6);if(M.A.Run)M.A.Run.timeScale=clamp(spd/1.05,0.8,1.4);}
 M.mx.update(dt);}
{const _m=makeHuman;makeHuman=function(L){const H=_m.apply(this,arguments);H.L=L;HUMS.push(H);if(HUMS.length>60)HUMS.splice(0,HUMS.length-60);if(MDL.ready)mdlDress(H);return H;};}
{const _a=animHuman;animHuman=function(H,dt,spd,t,air){_a.apply(this,arguments);if(H.M)mdlAnim(H,dt,spd,air);};}
// chargement : animations partagées + un modèle par type de personnage
function mdlStart(){if(typeof THREE.GLTFLoader!=='function'||!THREE.SkeletonUtils||typeof THREE.SkeletonUtils.clone!=='function'){MDL.failed=true;return;}
 const noms=[...new Set(['sorcier'].concat(Object.values(MDL_PERSO)))];
 Promise.all([mdlLoad('persos/animations.glb')].concat(noms.map(n=>mdlLoad('persos/'+n+'.glb')))).then(([an,...ms])=>{
  an.animations.forEach(c=>{MDL.clips[c.name]=c;});ms.forEach((g,i)=>{const t=mdlPrep(g);if(t)MDL.tpl[noms[i]]=t;});
  MDL.ready=true;HUMS.forEach(mdlDress);}).catch(e=>{MDL.failed=true;console.warn('Modèles 3D indisponibles, personnages faits par le code.',e&&e.message||e);});}
mdlStart();
