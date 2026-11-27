/* ================= VRAIS BÂTIMENTS : le kit modulaire « Medieval Village MegaKit » (Quaternius, CC0) =================
   src/assets/batiments/batiments.glb (préparé par `node tools/assets.mjs batiments`) contient les pièces : murs de 2 m × 3,12 m
   (dehors = +z de la pièce), portes, fenêtres, volets, coins, toits de tuiles WxD, pignons, cheminée, tour…
   Chaque bâtiment (BATI_PLANS : lieu + décalage + rotation par quart de tour + type BATI_TYPES) est assemblé pièce par pièce
   (batiPieces), posé sur un socle de pierre qui suit le terrain, puis tout est fusionné par matériau et par lieu (o3Merge).
   La collision (boîte) et la place libre (pas d'arbres : TER.block) sont réservées dès le chargement ; sans le fichier,
   pas de bâtiment (le jeu marche quand même). */
const BATI_TYPES={
 maison:{w:2,d:3,f:2,mur:'plaster',toit:'Roof_RoundTiles_4x6',pignon:'Roof_Front_Brick4'},
 maison2:{w:2,d:2,f:1,mur:'brick',toit:'Roof_RoundTiles_4x4',pignon:'Roof_Front_Brick4'},
 auberge:{w:3,d:4,f:2,mur:'plaster',toit:'Roof_RoundTiles_6x8',pignon:'Roof_Front_Brick6',chem:1},
 forge:{w:3,d:3,f:1,mur:'brick',toit:'Roof_RoundTiles_6x6',pignon:'Roof_Front_Brick6',chem:1},
 tour:{w:2,d:2,f:3,mur:'brick',toit:'Roof_Tower_RoundTiles'}};
const BATI_PLANS=[
 {id:'halte_auberge',lieu:'terres_halte',dx:17,dz:6,ry:-Math.PI/2,t:'auberge',nom:'Auberge de l’Aube'},
 {id:'halte_forge',lieu:'terres_halte',dx:-17,dz:4,ry:Math.PI/2,t:'forge',nom:'Forge de la Halte'},
 {id:'halte_m1',lieu:'terres_halte',dx:-7,dz:20,ry:Math.PI,t:'maison'},
 {id:'halte_m2',lieu:'terres_halte',dx:7,dz:21,ry:Math.PI,t:'maison2'},
 {id:'halte_tour',lieu:'terres_halte',dx:19,dz:-15,ry:0,t:'tour',nom:'Tour de guet'},
 {id:'mines_m1',lieu:'terres_mines',dx:-13,dz:6,ry:Math.PI/2,t:'maison'},
 {id:'mines_forge',lieu:'terres_mines',dx:11,dz:-8,ry:-Math.PI/2,t:'forge',nom:'Fonderie de Brisefer'},
 {id:'mines_tour',lieu:'terres_mines',dx:14,dz:11,ry:Math.PI,t:'tour'}];
const BATI={ready:false,stats:null};
/* les hameaux ont besoin de place : la Halte et les Mines sont aplanies sur 24 m (au lieu de 13 et 16) */
TER_LIEUX.forEach(L=>{if(L.id==='terres_halte'||L.id==='terres_mines')L.r=Math.max(L.r,24);});
/* place réservée dès le chargement (avant les Grandes Terres) : position, taille, collision, pas d'arbres */
function batiBox(P){const T=BATI_TYPES[P.t],W=T.w*2,D=T.d*2,q=Math.round(P.ry/(Math.PI/2))&1;return {hw:(q?D:W)/2+0.2,hd:(q?W:D)/2+0.2,W,D};}
BATI_PLANS.forEach(P=>{const L=LOCBY[P.lieu];if(!L)return;P.x=L.x+P.dx;P.z=L.z+P.dz;const B=batiBox(P);P.hw=B.hw;P.hd=B.hd;if(P.x>4000)TER.block.push({x:P.x,z:P.z,r:Math.hypot(B.hw,B.hd)+1.5});});
/* les pièces d'un bâtiment, dans son repère (centre au sol, façade vers +z) : [nom, x, y, z, rotation] */
function batiPieces(T){const out=[],W=T.w*2,D=T.d*2,H=3.12;
 const brick=f=>T.mur==='brick'&&(f===0||T.t==='tour');
 const mur=(f,k)=>{const b=brick(f);return k==='porte'?(b?'Wall_UnevenBrick_Door_Round':'Wall_Plaster_Door_Round'):k==='large'?(b?'Wall_UnevenBrick_Window_Wide_Round':'Wall_Plaster_Window_Wide_Round'):k==='fine'?(b?'Wall_UnevenBrick_Window_Thin_Round':'Wall_Plaster_Window_Thin_Round'):(b?'Wall_UnevenBrick_Straight':(f>0?'Wall_Plaster_WoodGrid':'Wall_Plaster_Straight'));};
 /* un côté : centre (cx,cz), rotation r, n modules ; la façade (côté 0) a la porte au rez-de-chaussée */
 const cote=(cx,cz,r,n,face)=>{const c=Math.cos(r),s=Math.sin(r);
  for(let f=0;f<T.f;f++)for(let i=0;i<n;i++){const u=-n+1+2*i,y=f*H,x=cx+c*u,z=cz-s*u;
   const k=face&&f===0&&i===Math.floor((n-1)/2)?'porte':(i+f)%2===0?(f===0?'large':'fine'):(T.t==='tour'?'fine':'plein');
   out.push([mur(f,k),x,y,z,r]);
   const ins=(nm,dx)=>out.push([nm,x+c*dx,y,z-s*dx,r]);
   if(k==='porte')ins('Door_1_Round',-0.53);else if(k==='large'){ins('Window_Wide_Round1',0);ins('WindowShutters_Wide_Round_Open',0);}else if(k==='fine'){ins('Window_Thin_Round1',0);ins('WindowShutters_Thin_Round_Open',0);}}};
 cote(0,D/2,0,T.w,true);cote(0,-D/2,Math.PI,T.w,false);cote(-W/2,0,-Math.PI/2,T.d,false);cote(W/2,0,Math.PI/2,T.d,false);
 for(let f=0;f<T.f;f++)for(const [x,z] of [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]])out.push(['Corner_Exterior_Wood',x,f*H,z,0]);
 const top=T.f*H;out.push([T.toit,0,top,0,0]);
 if(T.pignon){out.push([T.pignon,0,top,D/2,0]);out.push([T.pignon,0,top,-D/2,Math.PI]);}
 if(T.chem)out.push(['Prop_Chimney',W/2-1,top+0.6,-D/4,0]);
 if(T.t==='forge'||T.t==='auberge')out.push(['Prop_Crate',W/2+0.9,0,D/2-0.6,0.3]);
 if(T.t==='auberge')out.push(['Prop_Wagon',-W/2-2.6,0,D/2-1.5,Math.PI/2]);
 if(T.t==='maison'||T.t==='maison2')out.push(['Prop_Vine1',W/2-0.2,0,D/2+0.1,0]);
 return out;}
function batiBuild(gltf){gltf.scene.updateMatrixWorld(true);const TPL={};gltf.scene.children.forEach(c=>{TPL[c.name]=c;});
 const groups=new Map(),Mb=new THREE.Matrix4(),Mp=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),ONE=new THREE.Vector3(1,1,1);let n=0;
 const rock=mat(0x8a8276,{flatShading:true,roughness:1});
 for(const P of BATI_PLANS){if(P.x===undefined)continue;const T=Object.assign({t:P.t},BATI_TYPES[P.t]),B=batiBox(P);
  /* hauteur : le point le plus haut sous le bâtiment ; un socle de pierre descend jusqu'au plus bas */
  let hi=-1e9,lo=1e9;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const h=gh(P.x+a*B.hw,P.z+b*B.hd);hi=Math.max(hi,h);lo=Math.min(lo,h);}
  const y0=(hi+lo)/2+0.08;P.y=y0;const soc=new THREE.Mesh(new THREE.BoxGeometry(B.hw*2+0.5,y0-lo+1.2,B.hd*2+0.5),rock);soc.position.set(P.x,(y0+lo-1.2)/2,P.z);soc.receiveShadow=true;scene.add(soc);
  Mb.compose(V.set(P.x,y0,P.z),Q.setFromAxisAngle(UPV,P.ry),ONE);
  for(const [nm,x,y,z,r] of batiPieces(T)){const t=TPL[nm];if(!t)continue;n++;Mp.compose(V.set(x,y,z),Q.setFromAxisAngle(UPV,r),ONE).premultiply(Mb);
   t.traverse(o=>{if(!o.isMesh)return;const m=o.material,k=m.uuid+'|'+P.lieu;let G=groups.get(k);if(!G)groups.set(k,G={m,parts:[]});const g=o.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(Mp,o.matrixWorld));G.parts.push(g);});}
  COLS.push({x:P.x,z:P.z,hw:B.hw,hd:B.hd,h:y0+T.f*3.12,bati:P.id});}
 let calls=0;groups.forEach(G=>{const geo=o3Merge(G.parts);G.parts.forEach(g=>g.dispose());const m=G.m;if(m.map&&m.map.encoding!==THREE.LinearEncoding){m.map.encoding=THREE.LinearEncoding;m.map.needsUpdate=true;}m.needsUpdate=true;
  const mesh=new THREE.Mesh(geo,m);mesh.castShadow=true;mesh.receiveShadow=true;mesh.matrixAutoUpdate=false;mesh.userData.noCull=true;scene.add(mesh);calls++;});
 BATI.ready=true;BATI.stats={pieces:n,maillages:calls};}
function batiStart(){if(typeof THREE.GLTFLoader!=='function')return;const go=()=>{if(!TER.built){setTimeout(go,400);return;}
  mdlLoad('batiments/batiments.glb').then(g=>batiBuild(g)).catch(e=>console.warn('Bâtiments indisponibles.',e&&e.message||e));};go();}
setTimeout(batiStart,0);
