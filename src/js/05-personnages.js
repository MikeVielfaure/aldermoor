/* ================= PERSONNAGES ARTICULÉS ================= */
const HG={thigh:new THREE.CylinderGeometry(0.085,0.072,0.44,8),shin:new THREE.CylinderGeometry(0.07,0.055,0.42,8),foot:new THREE.BoxGeometry(0.13,0.08,0.27),torso:new THREE.CylinderGeometry(0.22,0.19,0.58,12),
 skirt:new THREE.CylinderGeometry(0.23,0.44,0.78,16,1,true),uarm:new THREE.CylinderGeometry(0.075,0.065,0.32,8),farm:new THREE.CylinderGeometry(0.068,0.1,0.3,8,1,true),hand:new THREE.SphereGeometry(0.055,8,6),
 head:new THREE.SphereGeometry(0.165,18,14),eye:new THREE.SphereGeometry(0.022,6,4),nose:new THREE.ConeGeometry(0.025,0.07,6),cap:new THREE.SphereGeometry(0.178,16,10,0,TAU,0,Math.PI*0.55),
 long:new THREE.BoxGeometry(0.3,0.44,0.09),bun:new THREE.SphereGeometry(0.085,10,8),pony:new THREE.ConeGeometry(0.06,0.4,8),beard:new THREE.ConeGeometry(0.11,0.3,10),brim:new THREE.CylinderGeometry(0.36,0.36,0.025,22),
 hat1:new THREE.ConeGeometry(0.19,0.36,14),hat2:new THREE.ConeGeometry(0.11,0.3,12),neck:new THREE.CylinderGeometry(0.06,0.07,0.12,8),wand:new THREE.CylinderGeometry(0.011,0.017,0.36,6),
 cape:new THREE.PlaneGeometry(0.5,1.05,1,4).translate(0,-0.525,0),belt:new THREE.CylinderGeometry(0.205,0.205,0.07,14),sh:new THREE.SphereGeometry(0.085,10,8)};
function makeHuman(L){
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);body.scale.set(L.h*(L.w||1),L.h,L.h*(L.w||1)*0.95);
 const sk=mat(L.skin,{flatShading:false,roughness:0.7}),rb=mat(L.robe,{flatShading:false,roughness:0.9}),tr=mat(L.trim,{flatShading:false,metalness:0.3,roughness:0.5}),hr=mat(L.hair,{flatShading:false,roughness:1});
 const rbD=mat(new THREE.Color(L.robe).multiplyScalar(0.7).getHex(),{flatShading:false,roughness:0.9,side:THREE.DoubleSide});
 const shoe=mat(0x2a1c12,{flatShading:false}),pants=mat(0x2a2630,{flatShading:false});
 const smalls=[];const add=(g,m,p,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);const sm=smallG().has(g);o.castShadow=!sm;if(sm)smalls.push(o);p.add(o);return o;};
 const hips=new THREE.Group();hips.position.y=0.92;body.add(hips);
 const leg=s=>{const g=new THREE.Group();g.position.x=0.1*s;hips.add(g);add(HG.thigh,pants,g,0,-0.22,0);const k=new THREE.Group();k.position.y=-0.44;g.add(k);add(HG.shin,pants,k,0,-0.21,0);add(HG.foot,shoe,k,0,-0.43,0.05);return {g,k};};
 const lL=leg(-1),lR=leg(1);
 const skirt=add(HG.skirt,mat(L.robe,{flatShading:false,roughness:0.9,side:THREE.DoubleSide}),hips,0,-0.27,0);
 const spine=new THREE.Group();hips.add(spine);
 add(HG.torso,rb,spine,0,0.29,0);add(HG.belt,tr,spine,0,0.03,0);add(HG.neck,sk,spine,0,0.62,0);
 const head=new THREE.Group();head.position.y=0.79;spine.add(head);
 add(HG.head,sk,head,0,0,0);const eyeM=mat(0x1a1420,{flatShading:false});add(HG.eye,eyeM,head,-0.058,0.025,0.148);add(HG.eye,eyeM,head,0.058,0.025,0.148);
 const n=add(HG.nose,sk,head,0,-0.01,0.17);n.rotation.x=Math.PI/2;
 if(L.style!=='bald'){add(HG.cap,hr,head,0,0.015,-0.01);}
 if(L.style==='long'){add(HG.long,hr,head,0,-0.17,-0.11);}
 if(L.style==='bun'){add(HG.bun,hr,head,0,0.13,-0.12);}
 if(L.style==='pony'){const p=add(HG.pony,hr,head,0,-0.08,-0.2);p.rotation.x=-2.6;}
 if(L.beard){const b=add(HG.beard,mat(L.beard,{flatShading:false,roughness:1}),head,0,-0.17,0.08);b.rotation.x=Math.PI+0.25;}
 if(L.hat){const hm=mat(L.hat,{flatShading:false,roughness:0.9});add(HG.brim,hm,head,0,0.13,0);const h1=add(HG.hat1,hm,head,0,0.31,-0.01);h1.rotation.x=-0.08;const h2=add(HG.hat2,hm,head,0,0.5,-0.06);h2.rotation.x=-0.5;add(HG.belt,tr,head,0,0.16,0).scale.set(0.85,0.6,0.85);}
 const arm=s=>{const g=new THREE.Group();g.position.set(0.27*s,0.53,0);spine.add(g);add(HG.sh,rb,g,0,0,0);add(HG.uarm,rb,g,0,-0.16,0);const e=new THREE.Group();e.position.y=-0.32;g.add(e);add(HG.farm,rb,e,0,-0.14,0);const h=add(HG.hand,sk,e,0,-0.31,0);g.rotation.z=0.12*s;return {g,e,h};};
 const aL=arm(-1),aR=arm(1);
 const wand=new THREE.Group();wand.position.set(0,-0.31,0.02);aR.e.add(wand);const wm=add(HG.wand,mat(0x4a2e14,{flatShading:false}),wand,0,0,0.14);wm.rotation.x=Math.PI/2;const tip=new THREE.Object3D();tip.position.set(0,0,0.33);wand.add(tip);
 const cape=new THREE.Mesh(HG.cape,rbD);cape.position.set(0,0.6,-0.2);cape.castShadow=true;spine.add(cape);
 const H={root,body,p:{hips,spine,head,lL,lR,aL,aR,cape,skirt,tip},ph:Math.random()*6,ck:0,cast:0,h:L.h,small:smalls};bakeHuman(H);
 return H;
}
const TV=new THREE.Vector3();
function animHuman(H,dt,spd,t,air){const P=H.p,s=Math.min(1,spd);H.ph+=dt*(3+spd*7);const sw=Math.sin(H.ph);
 P.lL.g.rotation.x=sw*0.7*s;P.lR.g.rotation.x=-sw*0.7*s;
 P.lL.k.rotation.x=Math.max(0,sw)*1.0*s+0.05;P.lR.k.rotation.x=Math.max(0,-sw)*1.0*s+0.05;
 P.hips.position.y=0.92+Math.abs(Math.cos(H.ph))*0.045*s+Math.sin(t*2)*0.006;
 P.spine.rotation.x=0.06*s;P.spine.rotation.y=sw*0.08*s;P.head.rotation.y=-sw*0.06*s;
 P.skirt.rotation.x=0;P.skirt.scale.set(1,1,1+0.08*s);
 P.cape.rotation.x=0.12+s*0.55+Math.sin(t*4+H.ph)*0.06*(0.3+s);
 H.ck+=((H.cast>0?1:0)-H.ck)*Math.min(1,dt*(H.cast>0?20:8));if(H.cast>0)H.cast-=dt;
 const armL=-sw*0.55*s,armR=sw*0.55*s;
 P.aL.g.rotation.x=armL;P.aL.e.rotation.x=-0.25-0.2*s;
 P.aR.g.rotation.x=lerp(armR,-1.45,H.ck);P.aR.e.rotation.x=lerp(-0.25-0.2*s,-0.05,H.ck);P.aR.g.rotation.z=lerp(0.12,-0.05,H.ck);
 P.spine.rotation.y+=H.ck*0.25;
 H.air=lerp(H.air||0,air?1:0,Math.min(1,dt*10));if(H.air>0.01){const a=H.air;P.lL.g.rotation.x=lerp(P.lL.g.rotation.x,-0.7,a);P.lR.g.rotation.x=lerp(P.lR.g.rotation.x,0.25,a);P.lL.k.rotation.x=lerp(P.lL.k.rotation.x,1.2,a);P.lR.k.rotation.x=lerp(P.lR.k.rotation.x,0.7,a);P.aL.g.rotation.z=lerp(-0.12,-0.9,a);P.aR.g.rotation.z=lerp(P.aR.g.rotation.z,0.9,a*(1-H.ck));P.cape.rotation.x+=a*0.5;}
}
const player={x:3,z:12,y:0,vx:0,vy:0,vz:0,grounded:true,jumps:0,dash:0,glide:0,ry:Math.PI,H:null,cd:0,spd:0};
const npcs=[];
function buildCharacters(){
 player.H=makeHuman({skin:0xf0c8a0,hair:0x5a3a20,style:'short',hat:0x161c3a,robe:0x23305e,trim:0xf3cf7a,h:1});scene.add(player.H.root);
 const ring=new THREE.Mesh(new THREE.RingGeometry(0.55,0.68,28).rotateX(-Math.PI/2),basic(0xf3cf7a,{transparent:true,opacity:0.45,depthWrite:false}));ring.position.y=0.04;player.H.root.add(ring);
 NPCS.forEach(n=>{const H=makeHuman(n.look);const l=label(n.name);l.position.y=2.35*n.look.h;H.root.add(l);const L=LOCBY[S.npcLoc[n.id]||n.home];const p=freePoint(L,3);H.root.position.set(p.x,0,p.z);scene.add(H.root);
  npcs.push({d:n,H,obj:H.root,x:p.x,z:p.z,tx:p.x,tz:p.z,wait:rnd(1,4),cur:L.id,spd:0});});
}
const NPCOBJ=id=>npcs.find(n=>n.d.id===id);

