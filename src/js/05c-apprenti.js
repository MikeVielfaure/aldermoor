/* ================= L'APPRENTI(E) : élève de l'académie, baguette à la main =================
   Aucun pack libre ne propose d'élève sorcier : il est construit par le jeu, sur la base du personnage
   articulé (05-personnages) qui a déjà une baguette et l'animation de lancer. Ajouts : robe d'école noire
   doublée de couleur, capuche dans le dos, manches évasées, col blanc et cravate, écharpe rayée aux
   couleurs d'Aldermoor (violet et or), yeux expressifs, cheveux en bataille, vraie baguette.
   Univers original : pas de maisons, de blasons ni de personnages d'une autre œuvre. */
const APPR={violet:0x4a2370,or:0xd8b24a,noir:0x1b1a22,blanc:0xf2efe8,bois:0x5a3416};
let APPR_NOBAKE=false;
{const _b=bakeHuman;bakeHuman=function(H){if(APPR_NOBAKE)return;return _b.apply(this,arguments);};}
const AG={ring:new THREE.TorusGeometry(0.135,0.042,8,20),tail:new THREE.BoxGeometry(0.1,0.085,0.035),sclera:new THREE.SphereGeometry(0.031,12,10),brow:new THREE.BoxGeometry(0.062,0.013,0.018),
 tuft:new THREE.SphereGeometry(0.068,8,6),hood:new THREE.SphereGeometry(0.2,14,10,0,TAU,0,Math.PI/2),cuff:new THREE.CylinderGeometry(0.12,0.075,0.17,12,1,true),collar:new THREE.ConeGeometry(0.05,0.09,3),
 tie:new THREE.BoxGeometry(0.055,0.06,0.02),lining:new THREE.BoxGeometry(0.035,0.56,0.02),liningS:new THREE.BoxGeometry(0.035,0.72,0.02),handle:new THREE.CylinderGeometry(0.02,0.024,0.13,8),knob:new THREE.SphereGeometry(0.026,8,6)};
function apprLook(L){return {skin:L.skin||0xf0c8a0,hair:L.hair||0x3a2414,style:L.style==='pony'||L.style==='bun'||L.style==='long'?L.style:'short',robe:APPR.noir,trim:L.trim||APPR.violet,h:(L.h||1)*0.93,w:L.w||1};}
// construit le corps d'un(e) apprenti(e) : même squelette que les autres personnages (animHuman marche tel quel)
function makeApprenti(L,lining){APPR_NOBAKE=true;let H;try{H=makeHuman0(apprLook(L));}finally{APPR_NOBAKE=false;}
 const P=H.p,M=c=>mat(c,{flatShading:false,roughness:0.85}),add=(g,m,p,x,y,z)=>{const o=new THREE.Mesh(g,typeof m==='number'?M(m):m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o;};
 const lin=lining||APPR.violet;
 // tête un peu plus grande (plus jeune), yeux avec le blanc, sourcils, mèches en bataille
 P.head.scale.setScalar(1.13);
 // yeux : blanc aplati derrière la pupille (les pupilles d'origine sont avancées pour rester visibles)
 P.head.children.forEach(o=>{if(o.isMesh&&o.geometry===HG.eye){o.position.z=0.162;o.position.y=0.028;o.scale.setScalar(1.2);}
  if(o.isMesh&&o.geometry===HG.cap){o.rotation.x=-0.62;o.position.set(0,0.04,-0.035);}}); // calotte de cheveux basculée : front dégagé
 [-1,1].forEach(s=>{add(AG.sclera,APPR.blanc,P.head,s*0.058,0.028,0.141).scale.set(1,1.1,0.5);add(AG.brow,L.hair||0x3a2414,P.head,s*0.06,0.083,0.155).rotation.z=-s*0.18;});
 // mèches en bataille sur le dessus et l'arrière (le front reste dégagé)
 if(apprLook(L).style==='short')[[0,0.175,-0.02],[0.075,0.16,0.01],[-0.075,0.16,0.01],[0.055,0.15,0.075],[-0.045,0.155,0.08],[0.11,0.1,-0.06],[-0.11,0.1,-0.06],[0,0.12,-0.13],[0.08,0.06,-0.11],[-0.08,0.06,-0.11]].forEach(([x,y,z])=>add(AG.tuft,L.hair||0x3a2414,P.head,x,y,z));
 // col blanc et cravate rayée
 [-1,1].forEach(s=>{const c=add(AG.collar,APPR.blanc,P.spine,s*0.055,0.55,0.16);c.rotation.set(Math.PI/2+0.4,0,s*0.6);});
 for(let i=0;i<5;i++)add(AG.tie,i%2?APPR.or:APPR.violet,P.spine,0,0.5-i*0.06,0.205);
 // écharpe rayée : deux anneaux autour du cou et deux pans qui tombent devant
 add(AG.ring,APPR.violet,P.spine,0,0.6,0).rotation.x=Math.PI/2;add(AG.ring,APPR.or,P.spine,0,0.64,0).rotation.x=Math.PI/2+0.05;
 [[-0.08,0.04],[0.09,-0.06]].forEach(([x,rz],k)=>{for(let i=0;i<6;i++){const t=add(AG.tail,i%2?APPR.or:APPR.violet,P.spine,x+rz*i*0.15,0.54-i*0.083,0.2+i*0.006);t.rotation.z=rz;t.rotation.x=-0.08;}void k;});
 // robe ouverte : doublure colorée sur les bords, capuche dans le dos, manches évasées
 [-1,1].forEach(s=>{add(AG.lining,lin,P.spine,s*0.1,0.27,0.2);const ls=add(AG.liningS,lin,P.hips,s*0.13,-0.27,0.3);ls.rotation.x=-0.28;});
 const hood=add(AG.hood,APPR.noir,P.spine,0,0.5,-0.17);hood.rotation.x=-1.7;hood.scale.set(1.15,0.55,0.9);add(AG.hood,lin,P.spine,0,0.52,-0.15).scale.set(0.95,0.42,0.7);
 [P.aL,P.aR].forEach(a=>add(AG.cuff,APPR.noir,a.e,0,-0.25,0));
 // baguette : manche sombre, pommeau, bois clair ; le bout reste le repère des sorts (P.tip)
 const w=P.tip.parent;add(AG.handle,0x2a1608,w,0,0,0.03).rotation.x=Math.PI/2;add(AG.knob,0x2a1608,w,0,0,-0.04);
 w.children.forEach(o=>{if(o.isMesh&&o.geometry===HG.wand){o.scale.set(1.2,1.25,1.2);o.material=M(APPR.bois);}});P.tip.position.z=0.38;
 bakeHuman(H);return H;}
// habille un personnage en apprenti(e) : le corps d'origine est caché, celui-ci prend sa place (et ses animations)
function apprDress(H,lining){if(H.appr)return;const A=makeApprenti(H.L||{},lining);
 H.appr={old:{body:H.body,p:H.p,small:H.small},body:A.body};H.body.visible=false;H.root.add(A.body);H.body=A.body;H.p=A.p;H.small=A.small;}
function apprUndress(H){if(!H.appr)return;const o=H.appr.old;H.root.remove(H.appr.body);H.body=o.body;H.p=o.p;H.small=o.small;H.body.visible=true;H.appr=null;}
