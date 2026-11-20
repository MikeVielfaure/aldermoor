/* ================= LES ÎLES DU MIROIR-CIEL (Landes) ET SORTS PLUS VIFS =================
   - Trois îles flottent au-dessus du Lac Miroir-Ciel. On y monte en balai, ou SANS balai grâce aux courants
     ascendants (colonnes de vent tournoyant : on s'y laisse porter). Cristaux célestes à récolter (une fois par
     jour), et sur la plus haute île, l'Autel des Vents : « Élan céleste », le balai va 30 % plus vite.
   - Collision des îles : entrée COLS avec un dessous (c.bot) ; pushOut, flyPush, hitsSolid et la caméra
     l'ignorent quand on passe en dessous (03-rendu, 15-balai, 21-boucle). On marche dessus grâce à groundAt (c.h).
   - Sorts : chaque coup sur une créature se sent (petit arrêt, secousse, éclat). */
const ILES=[{dx:-16,dz:-38,R:6.5,up:27},{dx:9,dz:-63,R:5.5,up:34},{dx:31,dz:-47,R:7,up:41}];
const VENTS=[],CRIST=[];let ILES_OK=false;
function buildIles(){const C=LANDES.c;const grass=mat(0x3f7a2c,{flatShading:true,roughness:1}),rock=mat(0x6e6658,{flatShading:true,roughness:0.95}),dirt=mat(0x7a5a3a,{flatShading:true});
 const cone=new THREE.ConeGeometry(1,1,9),top=new THREE.CylinderGeometry(1,0.93,1,14),dode=new THREE.DodecahedronGeometry(1,0),tc=new THREE.ConeGeometry(0.9,2.6,6),tt=new THREE.CylinderGeometry(0.13,0.18,1,6),oct=new THREE.OctahedronGeometry(0.35,0);
 const crm=mat(0x9fe8ff,{emissive:0x3aa0d8,emissiveIntensity:0.9,roughness:0.2,metalness:0.3,flatShading:true});
 ILES.forEach((I,i)=>{const x=C.x+I.dx,z=C.z+I.dz,y=Math.max(gh(x,z),13)+I.up;I.x=x;I.z=z;I.top=y;const g=new THREE.Group();g.position.set(x,y,z);g.userData.dyn=true;scene.add(g);
  const t=new THREE.Mesh(top,grass);t.scale.set(I.R,1.2,I.R);t.position.y=-0.6;t.receiveShadow=true;g.add(t);
  const u=new THREE.Mesh(cone,rock);u.scale.set(I.R*0.95,I.R*1.7,I.R*0.95);u.rotation.x=Math.PI;u.position.y=-1.2-I.R*0.85;u.castShadow=true;g.add(u);
  const d=new THREE.Mesh(cone,dirt);d.scale.set(I.R*0.6,I.R*0.9,I.R*0.6);d.rotation.x=Math.PI;d.position.y=-1.2-I.R*1.9;g.add(d);
  for(let k=0;k<5;k++){const a=k/5*TAU+i,r=I.R*rnd(0.55,0.85),m=new THREE.Mesh(dode,rock);m.scale.setScalar(rnd(0.4,0.8));m.position.set(Math.cos(a)*r,0.1,Math.sin(a)*r);m.castShadow=true;g.add(m);}
  for(let k=0;k<3;k++){const a=k/3*TAU+i*1.3+0.5,r=I.R*rnd(0.3,0.6),tr=new THREE.Group();tr.position.set(Math.cos(a)*r,0,Math.sin(a)*r);const s=rnd(0.8,1.2);tr.scale.setScalar(s);
   const tk=new THREE.Mesh(tt,dirt);tk.position.y=0.5;tr.add(tk);const fo=new THREE.Mesh(tc,grass);fo.position.y=2.0;fo.castShadow=true;tr.add(fo);g.add(tr);}
  const gl=glow(0xbfe8ff,I.R*2.2,0.28);gl.position.y=2;g.add(gl); // lueur visible de loin
  COLS.push({x,z,r:I.R-0.25,h:y,bot:y-1.2-I.R*1.7,sky:true});
  // cristaux
  for(let k=0;k<2;k++){const a=k*Math.PI+i,r=I.R*0.45,cx=x+Math.cos(a)*r,cz=z+Math.sin(a)*r;const cg=new THREE.Group();cg.position.set(cx,y,cz);cg.userData.dyn=true;
   for(let j=0;j<4;j++){const m=new THREE.Mesh(oct,crm);m.scale.set(1,rnd(1.6,2.6),1);m.position.set(rnd(-.25,.25),0.4,rnd(-.25,.25));m.rotation.set(rnd(-.4,.4),rnd(0,3),rnd(-.4,.4));cg.add(m);}
   scene.add(cg);const id='c'+i+k;CRIST.push({id,g:cg,x:cx,z:cz,y});
   station({x:cx,z:cz,reach:1.8,hint:()=>Math.abs(player.y-y)<1.5&&cristOk(id)?'Ramasser les cristaux célestes':null,act:()=>{if(Math.abs(player.y-y)>1.5||!cristOk(id))return;S.celC=S.celC||{};S.celC[id]=S.day;addItem('cristal',2);gainXP(8);burst(cx,y+0.6,cz,0x9fe8ff,24,4);sfx('pick');say('💎 +2 Cristaux célestes (ils repoussent chaque jour).','sys');save();}});}});
 // courants ascendants : du lac à la 1re île, puis d'île en île
 const I0=ILES[0],I1=ILES[1],I2=ILES[2];
 const vent=(x,z,y0,y1)=>{VENTS.push({x,z,y0,y1,r:2.3,t:Math.random()*10});};
 {const a=Math.atan2(I0.z-(C.z-55),I0.x-C.x);vent(I0.x+Math.cos(a)*(I0.R+1.8),I0.z+Math.sin(a)*(I0.R+1.8),gh(I0.x,I0.z)-2,I0.top+3);}
 {const a=Math.atan2(I1.z-I0.z,I1.x-I0.x);vent(I0.x+Math.cos(a)*(I0.R+1.6),I0.z+Math.sin(a)*(I0.R+1.6),I0.top-1,I1.top+3);}
 {const a=Math.atan2(I2.z-I1.z,I2.x-I1.x);vent(I1.x+Math.cos(a)*(I1.R+1.6),I1.z+Math.sin(a)*(I1.R+1.6),I1.top-1,I2.top+3);}
 // l'Autel des Vents (île la plus haute)
 {const ax=I2.x,az=I2.z,y=I2.top;const g=new THREE.Group();g.position.set(ax,y,az);g.userData.dyn=true;scene.add(g);const st=mat(0xd8d2c4,{flatShading:true});
  const b=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.3,0.4,8),st);b.position.y=0.2;g.add(b);for(let k=0;k<4;k++){const a=k/4*TAU,p=new THREE.Mesh(new THREE.BoxGeometry(0.35,2.4,0.35),st);p.position.set(Math.cos(a)*1.6,1.2,Math.sin(a)*1.6);p.castShadow=true;g.add(p);}
  const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(0.4,1),mat(0xffffff,{emissive:0xbfe8ff,emissiveIntensity:1.2}));orb.position.y=1.5;g.add(orb);const og=glow(0xbfe8ff,3,0.7);og.position.y=1.5;g.add(og);ILES.orb=orb;
  COLS.push({x:ax,z:az,r:1.1,h:y+0.4,bot:y-0.5,sky:true});
  station({x:ax,z:az,reach:2.6,hint:()=>Math.abs(player.y-y-0.4)<2&&!S.elan?'Toucher l’Autel des Vents':null,act:()=>{if(S.elan||Math.abs(player.y-y-0.4)>2)return;S.elan=1;banner('Élan céleste !','Ton balai file 30 % plus vite');gainXP(120);chron('L’Autel des Vents a béni mon balai.');
   SHAKE=Math.max(SHAKE,0.4);for(let i=0;i<80;i++){const a=Math.random()*TAU;PA.emit(ax+Math.cos(a)*rnd(.5,2),y+rnd(0,3),az+Math.sin(a)*rnd(.5,2),0,rnd(1,4),0,i%2?0xbfe8ff:0xffffff,0.35,0.05,rnd(.8,1.6),0,0.5);}save();}});}
 ILES_OK=true;}
const cristOk=id=>!(S.celC&&S.celC[id]===S.day);
{const _b=buildLandes;buildLandes=function(){const r=_b.apply(this,arguments);try{buildIles();}catch(e){console.error(e);}return r;};}
function ilesTick(dt){if(!started||!ILES_OK||S.zone!=='monde'||player.x<1500||player.x>4000)return;const t=performance.now()/1000;
 if(ILES.orb)ILES.orb.rotation.y+=dt;
 CRIST.forEach(c=>{const v=cristOk(c.id);if(c.g.visible!==v)c.g.visible=v;});
 for(const V of VENTS){const dx=player.x-V.x,dz=player.z-V.z,d=Math.hypot(dx,dz);
  // tourbillon visible
  if(Math.hypot(V.x-camera.position.x,V.z-camera.position.z)<90){for(let k=0;k<3;k++){const h=rnd(V.y0,V.y1),a=t*3+h*0.7+k*2.1,r=V.r*rnd(0.4,1);PA.emit(V.x+Math.cos(a)*r,h,V.z+Math.sin(a)*r,-Math.sin(a)*2,rnd(2,5),Math.cos(a)*2,k?0xe8fbff:0xbfe8ff,rnd(.2,.35),0.05,rnd(.5,.9),0,1);}}
  if(d<V.r&&player.y>V.y0-1.5&&player.y<V.y1){if(FLY.on)player.vy=Math.max(player.vy,6);else{player.vy=Math.max(player.vy,player.y<V.y1-2?11:4);player.grounded=false;player.feather=1;}
   if(player.y<V.y1-3){const k=Math.min(1,dt*1.5);player.x-=dx*k*0.5;player.z-=dz*k*0.5;} // le courant recentre doucement
   if(!S.seenVent){S.seenVent=1;say('🌪 Un <b>courant ascendant</b> te soulève ! Laisse-toi porter jusqu’aux îles, puis saute dans le courant suivant.','gm');}}}
 // découverte
 if(!S.ilesVues&&ILES.some(I=>Math.hypot(player.x-I.x,player.z-I.z)<I.R+2&&player.y>I.top-2)){S.ilesVues=1;banner('Les Îles du Miroir-Ciel','Des terres flottent au-dessus du lac');gainXP(60);chron('Découverte des Îles du Miroir-Ciel.');save();}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{ilesTick(dt);}catch(e){console.error(e);}return r;};}
// l'arrivée dans les Landes signale les îles
{const _lg=landesGo;landesGo=function(){const r=_lg.apply(this,arguments);if(!S.ilesIndice){S.ilesIndice=1;setTimeout(()=>say('✨ Au-dessus du Lac Miroir-Ciel, des îles flottent dans le ciel… on dit que les vents y portent les voyageurs.','gm'),6000);}return r;};}
// le MJ connaît les îles
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object')r.iles_celestes='Îles du Miroir-Ciel : 3 îles flottantes au-dessus du Lac Miroir-Ciel (Landes), courants ascendants, cristaux célestes, Autel des Vents (Élan céleste : balai +30 %). '+(S.elan?'Le joueur a reçu l’Élan céleste.':'');}catch(e){}return r;};}
/* ---------- sorts plus vifs : chaque coup se sent ---------- */
{const _h=hurtCreature;hurtCreature=function(e,el,x,z){const r=_h.apply(this,arguments);if(e&&e.data&&!e.data.duel){HITSTOP=Math.max(HITSTOP,0.025);SHAKE=Math.max(SHAKE,0.12);const y=gh(e.x,e.z)+1.1;flash(e.x,y,e.z,ELEM[el].c,2.2,0.18);
  for(let i=0;i<10;i++){const a=Math.random()*TAU,v=rnd(3,7);PA.emit(e.x,y,e.z,Math.cos(a)*v,rnd(1,4),Math.sin(a)*v,i%2?ELEM[el].c:0xffffff,rnd(.2,.35),0.05,rnd(.25,.45),4,1);}}return r;};}
