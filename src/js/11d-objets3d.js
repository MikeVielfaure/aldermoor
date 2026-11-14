/* ================= OBJETS 3D (Quaternius Fantasy Props, CC0) : intérieurs meublés =================
   Un seul fichier assets/objets/objets.glb (36 objets, textures partagées). Chaque lieu a une recette ;
   les exemplaires sont fusionnés par matériau et par lieu (peu d'appels de dessin). Les collisions ne sont
   ajoutées qu'une fois les objets affichés : si le fichier manque, les intérieurs restent comme avant.
   Objets à l'échelle réelle (mètres). Devant d'un objet = +z ; sinon voir O3FLIP. */
const O3={list:[],placed:[],ready:false,tpl:{},stats:null};
const O3FLIP={}; // objets dont le devant est tourné vers −z : on les retourne
function o3(zone,name,x,y,z,ry,o){o=o||{};O3.list.push({zone,name,x,y,z,ry:ry||0,s:o.s||1,col:o.col});O3.placed.push({x,z,r:o.r||0.4});}
function o3Free(zone,x,z,r){if(!isFree({x,z},r))return false;for(const p of O3.placed)if(Math.hypot(p.x-x,p.z-z)<p.r+r+0.15)return false;
 for(const s of STATIONS)if(Math.hypot(s.x-x,s.z-z)<r+1.6)return false;
 const Z=zone!=="monde"&&ZONES[zone];if(Z&&Z.ex&&Z.sp){const O=Z.O;if(Math.hypot(O.x+Z.ex.x-x,O.z+Z.ex.z-z)<r+2.6||Math.hypot(O.x+Z.sp.x-x,O.z+Z.sp.z-z)<r+1.8)return false;}return true;}
// le long des murs d'une pièce rectangulaire (coordonnées relatives à O), tourné vers l'intérieur
function o3Wall(zone,name,n,x1,z1,x2,z2,inset,r,y,o){const O=ZONES[zone].O;let k=0;
 for(let t=0;t<n*25&&k<n;t++){const side=Math.floor(Math.random()*4),u=rnd(0.1,0.9);let x,z,ry;
  if(side===0){x=x1+(x2-x1)*u;z=z1+inset;ry=0;}else if(side===1){x=x1+(x2-x1)*u;z=z2-inset;ry=Math.PI;}else if(side===2){x=x1+inset;z=z1+(z2-z1)*u;ry=Math.PI/2;}else{x=x2-inset;z=z1+(z2-z1)*u;ry=-Math.PI/2;}
  if(!o3Free(zone,O.x+x,O.z+z,r))continue;o3(zone,name,O.x+x,y||0,O.z+z,ry,Object.assign({r,col:r},o||{}));k++;}return k;}
// le long d'un mur rond (rayon R), tourné vers le centre, en évitant la porte
function o3Ring(zone,name,n,R,r,y,o){const Z=ZONES[zone],O=Z.O,door=Math.atan2(Z.ex.z,Z.ex.x);let k=0;
 for(let i=0;i<n;i++){const a=door+0.6+i*(TAU-1.2)/Math.max(1,n-1),x=O.x+Math.cos(a)*R,z=O.z+Math.sin(a)*R;if(STATIONS.some(st=>Math.hypot(st.x-x,st.z-z)<r+1.4))continue; /* contre le mur : pas de test de collision (le mur en a une) */
  o3(zone,name,x,y||0,z,Math.atan2(O.x-x,O.z-z),Object.assign({r,col:r},o||{}));k++;}return k;}
function o3Plan(){O3.list=[];O3.placed=[];
 // --- Grande Salle : tables du festin garnies, chandeliers, coffres, tonneaux, armoires ---
 {const z='salle',O=ZONES[z].O;
  [-5,0,5].forEach(tx=>{[-6,0,6].forEach(tz=>o3(z,'CandleStick_Triple',O.x+tx,0.86,O.z+tz,Math.PI/2));
   for(let i=0;i<7;i++){const tz=rnd(-7.4,7.4);if([-6,0,6].some(c=>Math.abs(c-tz)<0.6))continue;o3(z,pick(['Mug','Mug','Chalice','Bottle_1']),O.x+tx+pick([-0.5,0.5]),0.86,O.z+tz,rnd(0,TAU));}});
  [-7,0,7].forEach(cz=>o3(z,'Chandelier',O.x,6.2,O.z+cz,0));
  o3Wall(z,'Cabinet',2,-9,-17,9,17,0.35,0.8);o3Wall(z,'Chest_Wood',2,-9,-17,9,17,0.6,0.8);o3Wall(z,'Barrel',3,-9,-17,9,17,0.55,0.5);
  o3Wall(z,'WeaponStand',1,-9,-17,9,17,0.6,0.8);o3Wall(z,'Lantern_Wall',4,-9,-17,9,17,0.05,0.2,2.6,{col:0});}
 // --- Bibliothèque : bibliothèques tout autour, lutrins, piles de livres, parchemins sur la grande table ---
 {const z='biblio_int',O=ZONES[z].O;
  o3Ring(z,'Bookcase_2',12,8.85,0.75);
  o3(z,'Chandelier',O.x,6.6,O.z,0);
  o3(z,'Scroll_1',O.x+0.6,0.95,O.z+0.2,0.4);o3(z,'Book_5',O.x-0.4,0.95,O.z-0.5,1.2);o3(z,'Potion_2',O.x-0.8,0.95,O.z+0.4,0);o3(z,'Book_Stack_1',O.x+0.3,0.95,O.z-0.9,0.3);o3(z,'CandleStick',O.x+0.9,0.95,O.z-0.4,0);
  [-5.5,5.5].forEach(lx=>{o3(z,'Book_Stack_2',O.x+lx+0.15,0.78,O.z-4.2,rnd(0,TAU));o3(z,'Scroll_2',O.x+lx-0.2,0.78,O.z-3.8,rnd(0,TAU));});
  for(let i=0;i<8;i++){const a=rnd(0,TAU),r=rnd(7.6,8.2),x=O.x+Math.cos(a)*r,zz=O.z+Math.sin(a)*r;if(o3Free(z,x,zz,0.35))o3(z,pick(['Book_Stack_1','Book_Stack_2','BookGroup_Small_1']),x,0,zz,rnd(0,TAU),{r:0.35});}
  for(let i=0;i<2;i++){const a=rnd(0,TAU),r=rnd(5.5,6.5),x=O.x+Math.cos(a)*r,zz=O.z+Math.sin(a)*r;if(o3Free(z,x,zz,0.5))o3(z,'BookStand',x,0,zz,Math.atan2(O.x-x,O.z-zz),{r:0.5,col:0.35});}}
 // --- Auberge : bouteilles et tonneaux derrière le comptoir, chopes, bougies, caisses ---
 {const z='auberge',O=ZONES[z].O;
  [-3.4,0,3.4].forEach(sx=>{o3(z,'Shelf_Small_Bottles',O.x+sx,1.55,O.z-5.82,0);o3(z,'Shelf_Small_Bottles',O.x+sx,2.35,O.z-5.82,0);});
  [-6.6,-5.7,5.7,6.6].forEach((bx,i)=>o3(z,i%2?'Barrel':'Barrel_Apples',O.x+bx,0,O.z-5.2,rnd(0,TAU),{r:0.4,col:0.4}));
  for(let i=0;i<6;i++)o3(z,pick(['Mug','Mug','Bottle_1','Chalice']),O.x+rnd(-4.6,4.6),1.19,O.z-3.4+rnd(-0.25,0.25),rnd(0,TAU));
  [[-5,1.6],[5,1.6],[-0.5,-0.6]].forEach(([tx,tz])=>{o3(z,'CandleStick',O.x+tx,0.82,O.z+tz,rnd(0,TAU));o3(z,'Mug',O.x+tx+0.4,0.82,O.z+tz+0.2,rnd(0,TAU));o3(z,'Mug',O.x+tx-0.35,0.82,O.z+tz-0.3,rnd(0,TAU));});
  o3Wall(z,'Lantern_Wall',3,-8,-6,8,6,0.05,0.2,2.5,{col:0});o3Wall(z,'Crate_Wooden',2,-8,-6,8,6,0.65,0.65);}
 // --- Grotte : un petit campement d'explorateurs près de l'entrée ---
 {const z='grotte',O=ZONES[z].O;[['Crate_Wooden',-3.2,9.6],['Barrel',-4.3,8.6],['Chest_Wood',3.6,9.2],['CandleStick',-3.2,9.6]].forEach(([n,x,zz],i)=>{if(i===3)o3(z,n,O.x+x,1.19,O.z+zz,0);else if(o3Free(z,O.x+x,O.z+zz,0.6))o3(z,n,O.x+x,0,O.z+zz,rnd(-0.4,0.4),{r:0.6,col:0.55});});}
 // --- Dehors : mannequins et râtelier près de l'arène, chaudron et tonneaux au marché ---
 {const A=ARENA;[[-2.3,-11.2],[2.3,-11.2]].forEach(([dx,dz],i)=>{const x=A.x+dx,z=A.z+dz;if(o3Free('monde',x,z,0.6))o3('monde','Dummy',x,gh(x,z),z,0,{r:0.6,col:0.4});});
  {const x=A.x+5.8,z=A.z-9.6;if(o3Free('monde',x,z,0.8))o3('monde','WeaponStand',x,gh(x,z),z,Math.atan2(A.x-x,A.z-z),{r:0.8,col:0.6});}
  [['Barrel_Apples',16.6,55.4],['Crate_Wooden',8.2,57.3],['Anvil',37.8,-11.6]].forEach(([n,x,z])=>{if(o3Free('monde',x,z,0.6))o3('monde',n,x,gh(x,z),z,rnd(0,TAU),{r:0.6,col:0.5});});}
}
// fusion : tous les exemplaires d'un même matériau, dans un même lieu, deviennent un seul maillage
function o3Build(gltf){gltf.scene.updateMatrixWorld(true);const T={};gltf.scene.children.forEach(c=>{T[c.name]=c;});O3.tpl=T;
 o3Plan();const groups=new Map(),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),SC=new THREE.Vector3();let nObj=0;
 for(const p of O3.list){const t=T[p.name];if(!t)continue;nObj++;Q.setFromAxisAngle(UPV,p.ry+(O3FLIP[p.name]?Math.PI:0));M.compose(V.set(p.x,p.y,p.z),Q,SC.set(p.s,p.s,p.s));
  t.traverse(o=>{if(!o.isMesh)return;const m=o.material;const k=m.uuid+'|'+p.zone;let G=groups.get(k);if(!G)groups.set(k,G={m,zone:p.zone,parts:[]});
   const g=o.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(M,o.matrixWorld));G.parts.push(g);});
  if(p.col)addCol({x:p.x,z:p.z,r:p.col,h:p.zone==='monde'?p.y+1.2:1.2});}
 let calls=0;groups.forEach(G=>{const geo=o3Merge(G.parts);G.parts.forEach(g=>g.dispose());const m=G.m;
  if(m.map&&m.map.encoding!==THREE.LinearEncoding){m.map.encoding=THREE.LinearEncoding;m.map.needsUpdate=true;}m.needsUpdate=true;
  const mesh=new THREE.Mesh(geo,m);mesh.castShadow=true;mesh.receiveShadow=true;mesh.matrixAutoUpdate=false;mesh.userData.objets3d=true;
  (G.zone!=='monde'&&ZG[G.zone]?ZG[G.zone]:scene).add(mesh);calls++;});
 O3.ready=true;O3.stats={objets:nObj,maillages:calls};}
function o3Merge(parts){let nv=0,ni=0;parts.forEach(g=>{nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;});
 const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2),col=new Float32Array(nv*3).fill(1),idx=new Uint32Array(ni);let vo=0,io=0,hasCol=false;
 for(const g of parts){const P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,C=g.attributes.color;
  const cs=C&&C.normalized?(C.array instanceof Uint16Array?65535:C.array instanceof Uint8Array?255:1):1; // r128 : getX() ne ramène pas les entiers normalisés entre 0 et 1
  for(let i=0;i<P.count;i++){const k=vo+i;pos[k*3]=P.getX(i);pos[k*3+1]=P.getY(i);pos[k*3+2]=P.getZ(i);if(N){nor[k*3]=N.getX(i);nor[k*3+1]=N.getY(i);nor[k*3+2]=N.getZ(i);}if(U){uv[k*2]=U.getX(i);uv[k*2+1]=U.getY(i);}if(C){hasCol=true;col[k*3]=C.getX(i)/cs;col[k*3+1]=C.getY(i)/cs;col[k*3+2]=C.getZ(i)/cs;}}
  if(g.index){for(let i=0;i<g.index.count;i++)idx[io+i]=g.index.getX(i)+vo;io+=g.index.count;}else{for(let i=0;i<P.count;i++)idx[io+i]=vo+i;io+=P.count;}vo+=P.count;}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 if(hasCol)geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(new THREE.BufferAttribute(idx,1));geo.computeBoundingSphere();return geo;}
function o3Start(){if(typeof THREE.GLTFLoader!=='function')return;const go=()=>{if(!ZG.salle||!STATIONS.length){setTimeout(go,300);return;}
  mdlLoad('objets/objets.glb').then(g=>{o3Build(g);if(typeof CULL!=='undefined')CULL.dirty=true;}).catch(e=>console.warn('Objets 3D indisponibles.',e&&e.message||e));};go();}
setTimeout(o3Start,0); // après le chargement de tout le script (ZG, ZONES, STATIONS sont définis plus loin)
