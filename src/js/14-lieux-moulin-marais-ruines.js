/* ================= ÉTAPE 7 : NOUVEAUX LIEUX (MOULIN, MARAIS, RUINES) & OBJETS ================= */
const POOLS=[{x:51,z:57,r:3.4},{x:58,z:48.5,r:2.8},{x:63.5,z:50,r:2.4},{x:54.5,z:62.5,r:2.6},{x:48,z:51,r:2.0}];
function poolCarve(x,z){if(x<42||z<42||x>70||z>70)return 0;let m=0;for(const p of POOLS){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r)m=Math.max(m,0.55*smooth(p.r,p.r-1.3,d));}return m;}
const inPool=(x,z)=>x>42&&z>42&&x<70&&z<70&&POOLS.some(p=>Math.hypot(x-p.x,z-p.z)<p.r-0.6);
const BQC=new THREE.Color(0x4a3a6a),MARSHC=new THREE.Color(0x3a4f2c),MUDC=new THREE.Color(0x4a3f2a),RUINC=new THREE.Color(0x8a8a6a);
function paintW4(x,z,c){const md=Math.hypot(x-56,z-54);if(md<22){c.lerp(MARSHC,smooth(22,12,md)*0.65);for(const p of POOLS){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r+0.9)c.lerp(MUDC,smooth(p.r+0.9,p.r-0.4,d)*0.85);}}
 const rd=Math.hypot(x+66,z+24);if(rd<14)c.lerp(RUINC,smooth(14,9,rd)*0.3);const bq=Math.hypot(x+80,z-22);if(bq<14)c.lerp(BQC,smooth(14,7,bq)*0.6);}
const RIDDLE={cour:'là où l’eau chante au milieu des pierres',chateau:'au pied des murailles qui ont vu mille hivers',biblio:'là où le savoir dort en piles',observatoire:'sous l’œil qui regarde les étoiles',serre:'parmi les feuilles qui respirent sous le verre',lac:'là où l’eau dort et murmure',foret:'sous les grands sapins qui ne voient jamais le soleil',village:'là où l’on boit, où l’on rit et où l’on cuit le pain',cercle:'au milieu des pierres qui gardent le feu',arene:'là où les apprentis croisent leurs baguettes',hauteurs:'là où souffle le vent des cimes',moulin:'là où la roue boit la rivière',marais:'là où les lucioles dansent sur l’eau trouble',ruines:'ici même, entre les colonnes brisées'};
/* textures d'objets */
function makeTX2(){if(TX.crate)return;
 TX.crate=ctex(128,128,(q,w,h)=>{q.fillStyle='#9a6a3a';q.fillRect(0,0,w,h);for(let i=0;i<3;i++){const y=i*h/3;const g=q.createLinearGradient(0,y,0,y+h/3);g.addColorStop(0,'rgba(255,220,170,.12)');g.addColorStop(1,'rgba(40,20,0,.18)');q.fillStyle=g;q.fillRect(0,y,w,h/3);q.fillStyle='rgba(40,20,5,.55)';q.fillRect(0,y,w,2);}
  for(let i=0;i<60;i++){q.strokeStyle='rgba(60,30,10,'+(0.08+Math.random()*0.12)+')';q.beginPath();const y=Math.random()*h;q.moveTo(0,y);q.bezierCurveTo(w*0.3,y+rnd(-3,3),w*0.7,y+rnd(-3,3),w,y+rnd(-2,2));q.stroke();}
  q.strokeStyle='#5a3a1a';q.lineWidth=13;q.strokeRect(6,6,w-12,h-12);q.lineWidth=11;q.beginPath();q.moveTo(12,h-12);q.lineTo(w-12,12);q.stroke();
  q.strokeStyle='rgba(255,220,170,.18)';q.lineWidth=2;q.strokeRect(1,1,w-2,h-2);q.fillStyle='#2a2a2a';[[10,10],[w-10,10],[10,h-10],[w-10,h-10]].forEach(([x,y])=>{q.beginPath();q.arc(x,y,2.5,0,TAU);q.fill();});});
 TX.barrel=ctex(128,64,(q,w,h)=>{const n=10;for(let i=0;i<n;i++){const x=i*w/n,l=48+Math.random()*14;const g=q.createLinearGradient(x,0,x+w/n,0);g.addColorStop(0,'hsl(25,45%,'+(l-10)+'%)');g.addColorStop(0.5,'hsl(25,45%,'+l*0.62+'%)');g.addColorStop(1,'hsl(25,45%,'+(l-14)*0.6+'%)');q.fillStyle=g;q.fillRect(x,0,w/n,h);q.fillStyle='rgba(30,15,5,.6)';q.fillRect(x,0,1.5,h);}
  for(let i=0;i<40;i++){q.strokeStyle='rgba(50,25,8,.15)';q.beginPath();const x=Math.random()*w;q.moveTo(x,0);q.lineTo(x+rnd(-2,2),h);q.stroke();}});
 TX.crate.wrapS=TX.crate.wrapT=THREE.ClampToEdgeWrapping;}
let CRATEM=null,BARRELM=null,CHESTM=null;
function objMats(){if(CRATEM)return;makeTX2();CRATEM=new THREE.MeshStandardMaterial({map:TX.crate,roughness:0.85});BARRELM=new THREE.MeshStandardMaterial({map:TX.barrel,roughness:0.8});CHESTM=new THREE.MeshStandardMaterial({map:TX.crate,color:0xb07a52,roughness:0.75});}
/* fusionne des morceaux (géométrie + matrice) en un seul maillage */
function bakeParts(parts,m){const gs=parts.map(([g,mx])=>{const c=g.clone();if(!c.index){const n=c.attributes.position.count,ia=new Uint16Array(n);for(let i=0;i<n;i++)ia[i]=i;c.setIndex(new THREE.BufferAttribute(ia,1));}if(!c.attributes.uv){c.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(c.attributes.position.count*2),2));}c.applyMatrix4(mx);return c;});const out=new THREE.Mesh(concatGeos(gs),m);gs.forEach(g=>g.dispose());return out;}
const M4=(x,y,z,rx,ry,rz,sx,sy,sz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx||1,sy||1,sz||1));
let MILL=null,ORACLE=null,GUARD=[],CRYPT=null,W4T=0;
function buildWorld4(){makeTX2();objMats();
 const STONE4=triMat(0xa29d92,TX.stone,TX.stone,0.32,1.15),WOOD4=triMat(0x6e4a2c,TX.wood,TX.wood,0.7,1.15),BARK4=triMat(0x5e4e3e,TX.bark,TX.bark,0.55,1.0);
 /* ---- Moulin du Ru ---- */
 {const hx=41,hz=-19;house(hx,hz,-Math.PI/2);addCol({x:hx,z:hz,hw:2.75,hd:2.9});
  mesh(new THREE.BoxGeometry(5.6,0.6,5.8),STONE4,hx,0.25,hz);
  const wx=44.95,wz=-19.2,wy=gh(wx,wz)+1.25;const g=new THREE.Group();g.position.set(wx,wy,wz);g.userData.dyn=true;scene.add(g);
  const parts=[];const R=1.9;
  [-0.42,0.42].forEach(ox=>{parts.push([new THREE.TorusGeometry(R,0.07,6,30),M4(ox,0,0,0,Math.PI/2,0)]);parts.push([new THREE.TorusGeometry(0.35,0.06,6,14),M4(ox,0,0,0,Math.PI/2,0)]);for(let k=0;k<8;k++)parts.push([new THREE.BoxGeometry(0.07,R*2,0.09),M4(ox,0,0,k*Math.PI/8,0,0)]);});
  for(let k=0;k<14;k++){const a=k/14*TAU;parts.push([new THREE.BoxGeometry(0.95,0.06,0.5),M4(0,Math.cos(a)*(R-0.12),Math.sin(a)*(R-0.12),a,0,0)]);}
  parts.push([new THREE.CylinderGeometry(0.13,0.13,2.4,10),M4(-0.75,0,0,0,0,Math.PI/2)]);
  const wh=bakeParts(parts,WOOD4);wh.castShadow=true;g.add(wh);
  const ov=new THREE.Mesh(new THREE.CylinderGeometry(R+0.15,R+0.15,1.1,24,1),new THREE.MeshStandardMaterial({color:0xcff4ff,transparent:true,opacity:0.55,roughness:0.1,metalness:0.2,emissive:0x2a5a7a,emissiveIntensity:0.4}));ov.rotation.z=Math.PI/2;ov.visible=false;g.add(ov);
  addCol({x:wx,z:wz,r:1.2});
  mesh(new THREE.BoxGeometry(0.6,2.4,0.5),WOOD4,wx-0.45,wy-1.0,wz+1.2);mesh(new THREE.BoxGeometry(0.6,2.4,0.5),WOOD4,wx-0.45,wy-1.0,wz-1.2);
  const sack=mat(0xd8c8a0,{roughness:1});[[37.6,-21.4],[37.9,-22.2],[37.3,-16.6]].forEach(([x,z],i)=>{const m=mesh(new THREE.SphereGeometry(0.42,12,9),sack,x,gh(x,z)+0.36,z);m.scale.set(1,1.15,0.85);m.rotation.y=i;});
  const ms=mesh(new THREE.CylinderGeometry(0.85,0.85,0.28,20),STONE4,38.1,gh(38.1,-17.9)+0.85,-17.9);ms.rotation.x=Math.PI/2;ms.rotation.z=0.25;addCol({x:38.1,z:-17.9,r:0.5});
  mesh(new THREE.BoxGeometry(1.4,0.12,0.8),WOOD4,43.6,gh(43.6,-15.6)+0.45,-15.6);
  MILL={g,ov,spd:1,ang:0,ice:0,boost:0,x:wx,z:wz,y:wy};
  station({x:44.2,z:-16.4,reach:2.6,hint:()=>S.zone==='monde'?'Observer la grande roue':null,act:()=>{say(MILL.ice>0?'La roue est prise dans la glace. Gaspard ne va pas être content… Un peu de feu la libérerait.':MILL.boost>0?'La roue tourne à toute vitesse, la meule chante !':'La roue boit la rivière, lentement. Un coup de vent ou un jet d’eau la ferait s’emballer… et le froid la figerait.','sys');}});}
 /* ---- Marais des Lucioles ---- */
 {const wm=waterMat({color:0x23402c,op:0.84,amp:0.05,nk:0.04,env:0.55});const cg=[];POOLS.forEach(p=>{const c=new THREE.CircleGeometry(p.r-0.2,28).rotateX(-Math.PI/2);c.translate(p.x,-0.12,p.z);cg.push(c);});
  const pools=new THREE.Mesh(concatGeos(cg.map(c=>{if(!c.index){const n=c.attributes.position.count,ia=new Uint16Array(n);for(let i=0;i<n;i++)ia[i]=i;c.setIndex(new THREE.BufferAttribute(ia,1));}return c;})),wm);pools.receiveShadow=true;scene.add(pools);
  const pad=mat(0x3f7a34,{roughness:0.7}),pink=mat(0xff9ad0,{emissive:0x3a1020}),reed=mat(0x6a7a3a,{roughness:1}),reed2=mat(0x8a6a3a,{roughness:1});
  POOLS.forEach(p=>{const n=3+Math.floor(p.r);for(let i=0;i<n;i++){const a=Math.random()*TAU,r=Math.random()*(p.r-1.2);const m=mesh(new THREE.CylinderGeometry(0.34,0.34,0.02,12,1,false,0.4,TAU-0.4),pad,p.x+Math.cos(a)*r,-0.1,p.z+Math.sin(a)*r,null,false);m.rotation.y=Math.random()*TAU;if(Math.random()<0.35){mesh(new THREE.SphereGeometry(0.09,8,6),pink,m.position.x,-0.04,m.position.z,null,false);}}
   for(let i=0;i<Math.round(p.r*5);i++){const a=Math.random()*TAU,r=p.r-0.3+Math.random()*0.9;const x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;const h=0.8+Math.random()*1.2;const m=mesh(new THREE.ConeGeometry(0.03,h,4),Math.random()<0.7?reed:reed2,x,gh(x,z)+h/2,z,null,false);m.rotation.set(rnd(-.15,.15),0,rnd(-.15,.15));if(Math.random()<0.3)mesh(new THREE.CylinderGeometry(0.045,0.045,0.22,6),mat(0x5a3a1a),x,gh(x,z)+h*0.8,z,null,false);}});
  [[47,57,0.9],[60.5,44.5,1.1],[66,55,1],[52,65,0.85],[44.5,47,0.8]].forEach(([x,z,s])=>{const y=gh(x,z);const parts=[];const tl=rnd(-.15,.15);parts.push([new THREE.CylinderGeometry(0.16*s,0.36*s,4.6*s,9),M4(0,2.3*s,0,tl,0,rnd(-.12,.12))]);
   for(let k=0;k<4;k++){const a=k/4*TAU+rnd(0,1),hh=rnd(2.4,4)*s,L=rnd(1.2,2.2)*s;parts.push([new THREE.CylinderGeometry(0.05*s,0.11*s,L,6),M4(Math.cos(a)*L*0.42,hh+L*0.25,Math.sin(a)*L*0.42,Math.sin(a)*0.9,0,-Math.cos(a)*0.9)]);}
   parts.push([new THREE.CylinderGeometry(0.4*s,0.6*s,0.35,9),M4(0,0.1,0,0,0,0)]);const m=bakeParts(parts,BARK4);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);addCol({x,z,r:0.4*s});});
  const glowC=[0x7ad8ff,0xb48cff,0x7affc8];for(let i=0;i<12;i++){const a=Math.random()*TAU,r=rnd(3,13);const x=56+Math.cos(a)*r,z=54+Math.sin(a)*r;if(inPool(x,z))continue;const c=pick(glowC);const cm=mat(c,{emissive:c,emissiveIntensity:0.85});for(let k=0;k<3;k++){const ox=x+rnd(-.35,.35),oz=z+rnd(-.35,.35),s=rnd(0.6,1.2);const y=gh(ox,oz);mesh(new THREE.CylinderGeometry(0.04*s,0.05*s,0.25*s,6),mat(0xe8e0d0),ox,y+0.12*s,oz,null,false);const cap=mesh(new THREE.SphereGeometry(0.13*s,10,6,0,TAU,0,Math.PI/2),cm,ox,y+0.23*s,oz,null,false);cap.scale.y=0.7;}}
  // cabane sur pilotis de Brindille
  const hx=62.5,hz=57,dy=1.25;
  for(const [ox,oz] of [[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]])mesh(new THREE.CylinderGeometry(0.12,0.15,dy+0.4,7),WOOD4,hx+ox,dy/2-0.1,hz+oz);
  mesh(new THREE.BoxGeometry(4.3,0.18,4.3),WOOD4,hx,dy,hz);addCol({x:hx,z:hz,hw:2.15,hd:2.15,h:dy+0.09});
  mesh(new THREE.BoxGeometry(0.6,0.42,1.4),WOOD4,hx-2.75,0.21,hz);addCol({x:hx-2.75,z:hz,hw:0.3,hd:0.7,h:0.42});mesh(new THREE.BoxGeometry(0.6,0.84,1.4),WOOD4,hx-2.25,0.42,hz);addCol({x:hx-2.25,z:hz,hw:0.25,hd:0.7,h:0.84});
  const wall=mesh(new THREE.CylinderGeometry(1.55,1.65,2.1,18,1,true,Math.PI*1.5+0.42,TAU-0.84),triMat(0x9a8a6a,TX.wood,TX.wood,0.5,1.0,{side:THREE.DoubleSide}),hx+0.25,dy+1.1,hz);
  mesh(new THREE.PlaneGeometry(0.95,1.7),mat(0x1a120a),hx-1.15,dy+0.95,hz).rotation.y=-Math.PI/2;
  mesh(new THREE.ConeGeometry(2.3,2.0,12),triMat(0x8a7a4a,TX.roof,TX.roof,0.45,1.15),hx+0.25,dy+3.1,hz);addCol({x:hx+0.25,z:hz,r:1.6});
  for(let i=0;i<5;i++)mesh(new THREE.BoxGeometry(0.12,0.4,0.12),mat(pick([0x6a8a3a,0x8a5a3a,0xa08a4a])),hx-1.7,dy+1.75,hz-0.9+i*0.45,null,false);
  const lg=glow(0xffc870,1.6,0.5);lg.position.set(hx-1.6,dy+2.0,hz+1.0);scene.add(lg);LAMPS.push({s:lg,x:hx,z:hz,off:0});
  makeCauldron(57,59.5);const cs=scene.children[scene.children.length-1];if(cs)cs.userData.dyn=true;}
 /* ---- Ruines d'Ysmer ---- */
 {const cx=-66,cz=-24;const FLOOR=triMat(0x9a9484,TX.stone,TX.stone,0.5,1.0);mesh(new THREE.BoxGeometry(11.5,0.14,15.5),FLOOR,cx,0.03,cz,null,false).receiveShadow=true;
  for(let i=0;i<8;i++)mesh(new THREE.BoxGeometry(rnd(0.6,1.4),0.12,rnd(0.5,1.1)),FLOOR,cx+rnd(-6.5,6.5),0.06,cz+rnd(-9,9),null,false).rotation.y=rnd(0,3);
  const col=(x,z,h,cap)=>{mesh(new THREE.BoxGeometry(1.15,0.35,1.15),STONE4,x,0.17,z);const c=mesh(new THREE.CylinderGeometry(0.4,0.45,h,14),STONE4,x,0.35+h/2,z);if(cap)mesh(new THREE.BoxGeometry(1.1,0.35,1.1),STONE4,x,0.35+h+0.17,z);else{const t=mesh(new THREE.ConeGeometry(0.42,0.5,7),STONE4,x,0.35+h+0.1,z);t.rotation.set(rnd(-.4,.4),rnd(0,3),rnd(-.4,.4));}addCol({x,z,r:0.6});return c;};
  for(let i=0;i<6;i++){const z=cz-7+i*2.8;[cx-5,cx+5].forEach((x,s)=>{const r=Math.random();if(r<0.2&&!(i===0&&s===1))return;const full=r>0.55;col(x,z,full?4.3:rnd(1.2,2.8),full);if(Math.random()<0.35)hedge(x+rnd(-.6,.6),z+rnd(-.6,.6),0.55);});}
  [[cx+1.5,cz+10.6,0.4],[cx-2.6,cz+11.4,1.2]].forEach(([x,z,a])=>{for(let k=0;k<3;k++){const m=mesh(new THREE.CylinderGeometry(0.42,0.42,1.25,14),STONE4,x+Math.cos(a)*k*1.3,0.4,z+Math.sin(a)*k*1.3);m.rotation.set(0,-a,Math.PI/2);m.rotation.order='YXZ';}addCol({x:x+Math.cos(a)*1.3,z:z+Math.sin(a)*1.3,r:1.6,h:0.8});});
  mesh(new THREE.BoxGeometry(1.2,3.2,8),STONE4,cx-6.6,1.6,cz);addCol({x:cx-6.6,z:cz,hw:0.65,hd:4.05});mesh(new THREE.BoxGeometry(1.2,1.6,3),STONE4,cx-6.6,3.9,cz-2.5);
  [[cx+7,cz-2.2],[cx+7,cz+2.2]].forEach(([x,z])=>col(x,z,4.3,true));const ar=mesh(new THREE.TorusGeometry(2.2,0.32,8,18,Math.PI),STONE4,cx+7,4.98,cz);ar.rotation.y=Math.PI/2;
  // oracle
  const ox=cx-5.3,oz=cz;mesh(new THREE.BoxGeometry(1.5,1.3,1.5),STONE4,ox,0.65,oz);addCol({x:ox,z:oz,r:0.95});
  const head=new THREE.Group();head.position.set(ox,2.15,oz);head.rotation.y=Math.PI/2;scene.add(head);const HS=triMat(0x8f8a7c,TX.rock,TX.rock,0.6,1.0);
  const hm=new THREE.Mesh(new THREE.SphereGeometry(0.72,18,14),HS);hm.scale.set(0.95,1.25,0.92);hm.castShadow=true;head.add(hm);[[0,0.32,0.55,0.9,0.16,0.3],[0,-0.05,0.68,0.16,0.42,0.22],[0,-0.48,0.55,0.45,0.08,0.18]].forEach(([x,y,z,w,h,d],i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),i===2?mat(0x2a2620):HS);m.position.set(x,y,z);head.add(m);});
  const eyeM=new THREE.MeshStandardMaterial({color:0x9ad8ff,emissive:0x5ac8ff,emissiveIntensity:1.2});[-0.24,0.24].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(0.09,10,8),eyeM);e.position.set(x,0.16,0.62);head.add(e);});
  const eg=glow(0x9ad8ff,2.4,0.7);eg.position.set(0,0.16,0.9);head.add(eg);head.userData.dyn=true;
  ORACLE={x:ox,z:oz,eyeM,eg};
  station({x:ox+1.2,z:oz,reach:2.8,hint:()=>S.zone==='monde'?(darkAvail()?'Les yeux de l’oracle luisent de violet…':S.oracleDay===S.day?'L’oracle se tait (reviens demain)':'Consulter l’oracle'):null,act:consultOracle});
  // gardiens
  GUARD=[];[[cx+2.5,cz-5.5],[cx+2.5,cz+5.5],[cx-2.5,cz-5.5],[cx-2.5,cz+5.5]].forEach(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,0,z);g.userData.dyn=true;scene.add(g);mesh(new THREE.BoxGeometry(0.85,1.1,0.85),STONE4,0,0.55,0,g);
   const pm=new THREE.MeshStandardMaterial({color:0x666666,emissive:0x111111,roughness:0.6});const pl=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.5),pm);pl.position.set(i<2?-0.43:0.43,0.6,0);pl.rotation.y=i<2?-Math.PI/2:Math.PI/2;g.add(pl);
   const cm=new THREE.MeshStandardMaterial({color:0x888888,emissive:0x222222,emissiveIntensity:0.3,roughness:0.15,metalness:0.3,flatShading:true});const c=new THREE.Mesh(G.cry,cm);c.scale.set(0.7,1.4,0.7);c.position.y=1.65;c.castShadow=true;g.add(c);const gl=glow(0xffffff,2.6,0);gl.position.y=1.7;g.add(gl);
   addCol({x,z,r:0.6,h:1.1});GUARD.push({x,z,i,g,pm,cm,c,gl});
   station({x,z,reach:2.3,hint:()=>S.zone==='monde'&&S.puz&&S.puz.ruines&&!S.puz.ruines.on[i]?'Examiner le gardien':null,act:()=>{const R=S.puz.ruines;say('Une plaque usée porte le symbole '+deEl(R.els[i])+'. Le cristal attend cette magie.','sys');}});});
  const slab=mesh(new THREE.BoxGeometry(2.2,0.22,3.0),triMat(0x7d786c,TX.stone,TX.stone,0.5,1.0),cx,0.13,cz);slab.userData.dyn=true;const hole=mesh(new THREE.PlaneGeometry(2.0,2.8).rotateX(-Math.PI/2),basic(0x050404),cx,0.1,cz,null,false);hole.userData.dyn=true;hole.visible=false;
  CRYPT={slab,hole,x:cx,z:cz,t:0};}
}
function syncRuins(){const R=S.puz&&S.puz.ruines;if(!R||!GUARD.length)return;GUARD.forEach((g,i)=>{const c=ELEM[R.els[i]].c;g.pm.color.setHex(c).multiplyScalar(0.55);g.pm.emissive.setHex(c).multiplyScalar(0.15);const on=R.on[i];g.cm.color.setHex(on?c:0x888888);g.cm.emissive.setHex(on?c:0x222222);g.cm.emissiveIntensity=on?1.0:0.3;g.gl.material.color.setHex(c);g.gl.material.opacity=on?0.8:0;});
 if(CRYPT){CRYPT.slab.position.x=CRYPT.x+(R.open?2.4:0);CRYPT.slab.position.y=R.open?0.05:0.13;CRYPT.hole.visible=R.open;}}
function ruinsDay(){if(!S.puz||!GUARD.length)return;const R=S.puz.ruines;if(R&&R.day===S.day)return;S.puz.ruines={day:S.day,els:ELS.slice().sort(()=>Math.random()-0.5).slice(0,4),on:[0,0,0,0],open:false};syncRuins();}
function ruinsHit(el,x,z,r){const R=S.puz&&S.puz.ruines;if(!R||R.open||S.zone!=='monde')return;GUARD.forEach((g,i)=>{if(R.on[i]||Math.hypot(g.x-x,g.z-z)>r+1.4)return;
  if(R.els[i]===el){R.on[i]=1;syncRuins();burst(g.x,1.7,g.z,ELEM[el].c,30,4);flash(g.x,2,g.z,ELEM[el].c,3,0.8);sfx('learn');const n=R.on.filter(Boolean).length;say('✦ Le gardien '+deEl(el)+' s’éveille ('+n+'/4).','sys');
   if(n===4){R.open=true;CRYPT.t=2;gainXP(70);say('🏛 Les quatre gardiens rayonnent ! La dalle de la crypte glisse dans un grondement…','gm');chron('Crypte des Ruines d’Ysmer ouverte.');setTimeout(()=>{syncRuins();const e=spawnChest(null,null,false,{x:CRYPT.x,z:CRYPT.z});burst(CRYPT.x,1,CRYPT.z,0xf3cf7a,40,5);void e;},1500);save();}}
  else if(!g.warn||performance.now()-g.warn>4000){g.warn=performance.now();say('Le gardien reste de marbre. Sa plaque montre le symbole '+deEl(R.els[i])+'.','sys');}});}
function consultOracle(){if(S.oracleDay===S.day){say('Les yeux de pierre sont éteints. L’oracle ne parle qu’une fois par jour.','sys');return;}S.oracleDay=S.day;
 const bl=pick([['puissance','ta magie est plus forte'],['celerite','tes pas sont plus légers'],['voyance','tes yeux percent l’invisible'],['bond','tes sauts défient le ciel']]);BUFF[bl[0]]=150;
 const l=pick(LOCS.filter(x=>x.id!=='ruines'));spawnScroll(l.id,genSpell(),720,false);sfx('learn');flash(ORACLE.x+1,2.4,ORACLE.z,0x9ad8ff,4,1.2);burst(ORACLE.x+0.8,2.2,ORACLE.z,0x9ad8ff,40,3);gainXP(10);
 say('👁 L’oracle murmure : « Un savoir t’attend <b>'+esc(RIDDLE[l.id]||l.name)+'</b>… » Il te bénit : '+bl[1]+' (150 s).','gm');chron('L’oracle d’Ysmer a parlé.');save();}
function millHit(el,x,z,r){if(!MILL||S.zone!=='monde')return;if(Math.hypot(x-MILL.x,z-MILL.z)>r+2.6)return;const gp=NPCOBJ('gaspard');
 if(el==='glace'&&MILL.ice<=0){MILL.ice=45;MILL.ov.visible=true;burst(MILL.x,MILL.y,MILL.z,0xcff4ff,30,3);if(gp&&!gp.sleep&&Math.hypot(gp.x-MILL.x,gp.z-MILL.z)<25){bubble(gp,'Ma roue ! Qui a gelé ma roue ?!');S.rep.gaspard=clamp((S.rep.gaspard||0)-1,-10,10);karma(-1);}hint('millice','❄ La grande roue est prise dans la glace et s’arrête.');}
 else if(el==='feu'&&MILL.ice>0){MILL.ice=0;MILL.ov.visible=false;for(let i=0;i<30;i++)PN.emit(MILL.x+rnd(-1,1),MILL.y+rnd(-1,1.5),MILL.z+rnd(-1.5,1.5),0,rnd(1,2),0,0xe8eef5,0.6,1.8,rnd(1,2),-0.3,0.5,0.5);say('La glace fond : la roue repart en grinçant.','sys');}
 else if((el==='vent'||el==='eau')&&MILL.ice<=0){MILL.boost=9;if(S.millDay!==S.day){S.millDay=S.day;gainXP(15);addItem(pick(['soleil','plume','lune']),1);say((gp&&!gp.sleep?'<b>Gaspard</b> : « Ho ho ! La meule s’emballe ! Tiens, pour la peine. »':'La meule s’emballe et crache un nuage de farine… et un petit trésor oublié.')+' (+15 XP, +1 ingrédient)','gm');if(gp&&!gp.sleep)S.rep.gaspard=clamp((S.rep.gaspard||0)+1,-10,10);}}}
{const _eh=elemHit;elemHit=function(el,x,z,r){_eh.apply(this,arguments);ruinsHit(el,x,z,r);millHit(el,x,z,r);};}
function world4Tick(dt){if(!started||!MILL)return;const t=performance.now()/1000;ruinsDay();if(!world4Tick.s){world4Tick.s=1;syncRuins();}
 // moulin
 if(MILL.ice>0){MILL.ice-=dt;if(MILL.ice<=0)MILL.ov.visible=false;}if(MILL.boost>0)MILL.boost-=dt;
 const want=MILL.ice>0?0:MILL.boost>0?3.2:0.9;MILL.spd+=(want-MILL.spd)*Math.min(1,dt*1.5);MILL.ang+=MILL.spd*dt;MILL.g.rotation.x=MILL.ang;
 const dm=Math.hypot(player.x-MILL.x,player.z-MILL.z);
 if(dm<40&&S.zone==='monde'){if(MILL.spd>0.2&&Math.random()<dt*14*MILL.spd)PN.emit(MILL.x+rnd(-.4,.4),MILL.y-1.5,MILL.z+rnd(-1,1),rnd(-.5,.5),rnd(1,2.5),rnd(-1,1),0xcfe8ff,0.18,0.08,0.6,9,0.5,0.85);
  if(MILL.boost>0&&Math.random()<dt*10)PN.emit(37.8+rnd(-.3,.3),1.2,-19+rnd(-.5,.5),rnd(-1,-0.2),rnd(.3,1),rnd(-.5,.5),0xf4ecd8,0.4,1.2,rnd(1,2),-0.1,0.6,0.6);
  if(AU.ready&&MILL.spd>0.3){W4T-=dt;if(W4T<=0){W4T=rnd(1.6,2.6)/MILL.spd;const s=spat(MILL.x,MILL.z,30);if(s.g>0.02)tone({f:rnd(70,95),f2:rnd(55,70),dur:0.5,v:0.07*s.g,type:'sawtooth',lp:500,q:3,pan:s.p,dest:AU.amb});}}}
 // marais : brume, lucioles, grenouilles
 const ds=Math.hypot(player.x-56,player.z-54);
 if(ds<35&&S.zone==='monde'){const n=nightK>0.5?14:3;if(Math.random()<dt*n){const a=Math.random()*TAU,r=Math.random()*14;PA.emit(56+Math.cos(a)*r,rnd(0.4,2.2),54+Math.sin(a)*r,rnd(-.3,.3),rnd(-.1,.2),rnd(-.3,.3),Math.random()<0.7?0xd8ff70:0x9affd0,0.2,0.18,rnd(2,4),0,0,0.5+nightK*0.5);}
  if(Math.random()<dt*3){const p=pick(POOLS);const a=Math.random()*TAU,r=Math.random()*p.r;PN.emit(p.x+Math.cos(a)*r,0.15,p.z+Math.sin(a)*r,rnd(-.2,.2),rnd(0,.1),rnd(-.2,.2),0xc8d8c0,1.6,2.8,rnd(3,5),0,0.2,0.22);}
  if(AU.ready&&Math.random()<dt*(nightK>0.5?0.9:0.35)){const p=pick(POOLS);const s=spat(p.x,p.z,35);if(s.g>0.02){const c=AU.ctx.currentTime,f=rnd(140,230);for(let i=0;i<2;i++)tone({t:c+i*0.16,f,f2:f*0.8,dur:0.13,v:0.06*s.g,type:'square',lp:700,pan:s.p,dest:AU.amb});}}}
 // ruines : oracle, crypte, carillon
 if(ORACLE){const on=S.oracleDay!==S.day;ORACLE.eyeM.emissiveIntensity=on?1.1+Math.sin(t*2)*0.3:0.05;ORACLE.eg.material.opacity=on?0.55+Math.sin(t*2)*0.15:0;}
 if(CRYPT&&CRYPT.t>0){CRYPT.t-=dt;for(let i=0;i<3;i++)PN.emit(CRYPT.x+rnd(-1.2,1.2),0.3,CRYPT.z+rnd(-1.6,1.6),rnd(-.5,.5),rnd(.5,1.5),rnd(-.5,.5),0xb8b0a0,0.5,1.4,1.2,-0.2,0.6,0.5);}
 const dr=Math.hypot(player.x+66,player.z+24);if(AU.ready&&dr<30&&Math.random()<dt*0.25){const s=spat(-66,-24,40);tone({f:mf(pick([79,83,86,88,91])),dur:2.2,v:0.03*s.g,fm:2.76,fmi:0.4,pan:s.p,dest:AU.amb,rev:0.8});}}

