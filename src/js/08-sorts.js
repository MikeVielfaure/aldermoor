/* ================= SORTS : PROJECTILES & EFFETS ================= */
let PROJ=[];
const PDEF={
 arcane:{spd:24,life:1.0,grav:0,vy:0,core:'ball',sz:1.0},
 feu:{spd:22,life:1.1,grav:0,vy:0,core:'ball',sz:1.4},
 glace:{spd:34,life:0.8,grav:0,vy:0,core:'shard',sz:1},
 eau:{spd:16,life:1.8,grav:13,vy:5.5,core:'ball',sz:1.1},
 nature:{spd:14,life:1.8,grav:15,vy:6.5,core:'ball',sz:0.7},
 lumiere:{spd:13,life:0.85,grav:0,vy:0.6,core:'ball',sz:1.6},
 ombre:{spd:15,life:1.0,grav:0,vy:0,core:'ball',sz:1.3}
};
const coreMats={};const coreMat=el=>coreMats[el]||(coreMats[el]=basic(el==='ombre'?0x2a1040:ELEM[el].c));
const CD={};let mana=100,waterWalk=0,stealth=0,jumpHeld=false;
let RECENT=[],SLICK=[],RAIN=[],TORN=[],RAINBOWS=[],eclipseT=0;
function spellCost(sp){let c=FORMS[sp.form].cost*(1-0.15*tal('conc'))*(1-0.2*tal(sp.el+'_eco'));if(sp.el==='ombre'&&sp.form==='util'&&tal('ombre_u'))c=0;return Math.round(c);}
function spellCd(sp){const f=sp.form;if(f==='trait')return sp.el==='vent'?0.8:0.45;if(f==='zone')return 4;return {feu:2.5,ombre:2.5,glace:4,eau:15,vent:5,nature:6,lumiere:8,arcane:3}[sp.el]||5;}
function manaFlash(){const b=$('#mana-bar');b.classList.add('err');setTimeout(()=>b.classList.remove('err'),450);}
function castSlot(i){const n=rankOf(lvl()).slots;if(i>=n){say('Emplacement verrouillé : atteins le rang '+RANKS.find(r=>r.slots>i).n+'.','sys');return;}const sp=S.spells.find(s=>s.id===S.slots[i]);if(!sp){openBook('sorts');return;}castSpell(sp);}
function castSpell(sp){const now=performance.now()/1000;if((CD[sp.id]||0)>now||player.cd>0)return;const cost=spellCost(sp);
 if(mana<cost){say('Pas assez de mana ('+Math.floor(mana)+'/'+cost+').','sys');manaFlash();return;}
 mana-=cost;CD[sp.id]=now+spellCd(sp);player.cd=0.25;player.H.cast=0.45;S.lastEl=sp.el;
 const el=sp.el,b=mLvl(el);S.mastery[el]=(S.mastery[el]||0)+(sp.form==='trait'?1:2);const a=mLvl(el);
 if(a>b){say('✦ Maîtrise '+ELEM[el].n+' : niveau '+a+(a%3===0?' — +1 point de talent !':''),'gm');}
 floatText(sp.inc,hex(ELEM[el].c));
 if(sp.form==='zone')doZone(sp);else if(sp.form==='util')doUtil(sp);else doTrait(sp);
 if(el==='eau'&&tal('eau_u'))mana=Math.min(manaMax(),mana+12);
 castAt(el);
}
function fwd(){return [Math.sin(player.ry),Math.cos(player.ry)];}
function doTrait(sp){const el=sp.el;
 let [dx,dz]=fwd();
 const T=castTarget(el,dx,dz,false),best=T;
 if(best){const d=Math.hypot(best.x-player.x,best.z-player.z)||1;dx=(best.x-player.x)/d;dz=(best.z-player.z)/d;player.ry=Math.atan2(dx,dz);}
 const ox=player.x+dx*0.7+Math.cos(player.ry)*0.25,oz=player.z+dz*0.7-Math.sin(player.ry)*0.25,oy=player.y+1.5*player.H.h;
 const c=ELEM[el].c;for(let i=0;i<8;i++)PA.emit(ox,oy,oz,rnd(-1,1),rnd(-1,1),rnd(-1,1),c,0.35,0.05,0.4,0,2);
 flash(ox,oy,oz,c,1.6,0.35);
 if(el==='vent'){gust(dx,dz);return;}
 const D=PDEF[el];const g=new THREE.Group();const m=new THREE.Mesh(G[D.core],coreMat(el));g.add(m);if(el!=='ombre')g.add(glow(c,D.sz*1.2,0.9));g.position.set(ox,oy,oz);if(D.core==='shard')g.lookAt(ox+dx,oy,oz+dz);
 const k=Math.min(1.6,pow(el));g.scale.setScalar(k);scene.add(g);
 const SH=aimShot(T,D,ox,oy,oz,dx,dz);PROJ.push({o:g,el,vx:SH.vx,vy:SH.vy,vz:SH.vz,life:SH.life,grav:D.grav,c,light:el==='feu'||el==='lumiere'||el==='arcane'?flash(ox,oy,oz,c,1.8,SH.life,false,10):null,t:0,ht:SH.ht,tp:SH.tp});
}
/* ---------- combos ---------- */
function mark(el,x,z,r){RECENT.push({el,x,z,r:r||3,t:7});}
function recentNear(el,x,z,r){return RECENT.some(e=>e.el===el&&Math.hypot(e.x-x,e.z-z)<r+e.r);}
function combo(id){const C=COMBOS.find(c=>c.id===id);const first=!S.combos.includes(id);if(first){S.combos.push(id);gainXP(30);chron('Combo découvert : '+C.n);}say('⚡ Combo '+(first?'découvert ':'')+': <b>'+C.n+'</b>'+(first?' (+30 XP)':''),'gm');}
function makeSlick(x,z,r,comboId){if(comboId)combo(comboId);const m=new THREE.Mesh(new THREE.CircleGeometry(r,28).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xdff6ff,roughness:0.05,metalness:0.35,transparent:true,opacity:0.6,depthWrite:false}));m.position.set(x,0.04+Math.random()*0.01,z);m.receiveShadow=true;scene.add(m);SLICK.push({x,z,r,life:25,m});if(comboId)hint('slick','⛸ Le sol gelé est une patinoire : tu glisses !');}
const onSlick=p=>p.y<0.3&&SLICK.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<s.r);
function revealScrolls(x,z,R){let n=0;ENT.forEach(e=>{if(e.kind==='scroll'&&e.data.hidden&&Math.hypot(e.x-x,e.z-z)<R){e.data.hidden=false;e.obj.visible=true;n++;burst(e.x,1.2,e.z,ELEM[e.data.spell.el].c,24,3);}});return n;}
function regrow(x,z,R){let re=0;near(TREES,x,z,R).forEach(t=>{if(t.st!=='ok'){t.st='ok';t.burn=0;treeLook(t);re++;for(let i=0;i<20;i++)PA.emit(t.x+rnd(-1.5,1.5),rnd(1,5),t.z+rnd(-1.5,1.5),0,rnd(.3,1),0,0x9aff7a,0.3,0.05,1,0,0);}});if(re){npcReact(x,z,'help');treesDirty();say('🌳 '+re+' arbre'+(re>1?'s':'')+' reverdi'+(re>1?'ssent':'t')+' !','sys');gainXP(3*re);}return re;}
function rainbow(x,z){if(RAINBOWS.length)return;combo('arc');const g=new THREE.Group();const cols=[0xff4040,0xff9a30,0xffe040,0x50e050,0x40a0ff,0x5050ff,0xb050ff];
 cols.forEach((c,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(10-i*0.42,0.22,6,60,Math.PI),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));g.add(m);});
 const [dx,dz]=fwd();g.position.set(x+dx*10,0,z+dz*10);g.rotation.y=camYaw;scene.add(g);RAINBOWS.push({g,life:14,t:0});
 const n=revealScrolls(x,z,45);gainXP(10);if(n)say('🌈 L’arc-en-ciel révèle '+n+' parchemin'+(n>1?'s':'')+' caché'+(n>1?'s':'')+' !','gm');
 if(Math.random()<0.5){let best=LOCS[0],bd=1e9;LOCS.forEach(l=>{const d=Math.hypot(l.x-(x+dx*20),l.z-(z+dz*20));if(d<bd){bd=d;best=l;}});spawnScroll(best.id,genSpell(),400);say('On dit qu’au pied de l’arc-en-ciel, vers '+esc(best.name)+', un parchemin vient d’apparaître…','sys');}}
function eclipse(x,z){const now=performance.now()/1000;if(now<eclipseT)return;eclipseT=now+6;combo('eclipse');
 flash(x,6,z,0xffffff,6,0.4,false,40);for(let i=0;i<90;i++){const a=Math.random()*TAU,v=rnd(4,12);(i%2?PA:PN).emit(x,2,z,Math.cos(a)*v,rnd(-1,3),Math.sin(a)*v,i%2?0xfff1a0:0x150a24,rnd(.5,.9),0.2,rnd(.6,1.1),0,1.5,0.9);}
 ENT.slice().forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<15){e.data.hp-=2;e.data.confused=4;burst(e.x,e.data.y,e.z,0xffffff,12,4);if(e.data.hp<=0)killCreature(e);}});}
function manaFlower(x,z){if(ENT.filter(e=>e.kind==='mana').length>=2)return;combo('floraison');const p=isFree({x,z},0.5)?{x,z}:{x:player.x+1,z:player.z+1};
 const g=new THREE.Group();mesh(new THREE.CylinderGeometry(0.05,0.07,1,6),0x3a8a2a,0,0.5,0,g);for(let i=0;i<6;i++){const a=i/6*TAU;const pt=mesh(new THREE.SphereGeometry(0.22,10,8),mat(0x6ab4ff,{emissive:0x2060ff,emissiveIntensity:0.8,flatShading:false}),Math.cos(a)*0.25,1.05,Math.sin(a)*0.25,g);pt.scale.set(1,0.4,1.6);pt.rotation.y=-a;}
 mesh(new THREE.SphereGeometry(0.14,10,8),mat(0xffffff,{emissive:0xbfe6ff,emissiveIntensity:1}),0,1.1,0,g);const gl=glow(0x6ab4ff,2.4,0.8);gl.position.y=1.1;g.add(gl);
 addEnt('mana',p.x,p.z,g,{},120);hint('mana','💧 Une fleur de mana ! Cueille-la (Agir) pour recharger toute ta magie.');}
function meteorize(p){p.meteor=true;p.lev=Math.min(p.lev,0.01);p.vy=Math.min(p.vy,-2);}
function meteorBoom(p){combo('meteore');const x=p.x,z=p.z,R=4*pow('feu');flash(x,1,z,0xff7a2e,5,0.8,false,30);
 for(let i=0;i<70;i++){const a=Math.random()*TAU,v=rnd(2,9);PA.emit(x,0.5,z,Math.cos(a)*v,rnd(2,7),Math.sin(a)*v,pick([0xff5a10,0xff9a30,0xffd060]),rnd(.5,1),0.05,rnd(.6,1.1),6,1);}
 for(let i=0;i<16;i++)PN.emit(x,0.5,z,rnd(-2,2),rnd(1,4),rnd(-2,2),0x2a2624,0.8,2.6,rnd(1.5,2.5),-0.3,0.6,0.55);
 ring(x,z,0xff7a2e,R,0.7);decal(x,z,0x1a1612,R*0.8,30,0.6);near(TREES,x,z,R).forEach(igniteTree);near(PROPS,x,z,R,q=>q!==p&&q.burnable&&q.dead<=0).forEach(q=>{q.burn=6;q.vy+=5;});
 ENT.slice().forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<R){e.data.hp-=2;e.data.burn=3;if(e.data.hp<=0)killCreature(e);}});p.burn=0.01;}
function blizzard(x,z,dx,dz,R){combo('blizzard');
 for(let i=0;i<140;i++){let vx,vz;if(dx!=null){const a=rnd(-0.6,0.6),ca=Math.cos(a),sa=Math.sin(a);vx=(dx*ca-dz*sa)*rnd(8,16);vz=(dx*sa+dz*ca)*rnd(8,16);}else{const a=Math.random()*TAU;vx=Math.cos(a)*rnd(5,12);vz=Math.sin(a)*rnd(5,12);}PA.emit(x+rnd(-1,1),rnd(0.3,3),z+rnd(-1,1),vx,rnd(-1,1),vz,Math.random()<0.6?0xffffff:0xcff4ff,rnd(.12,.3),0.05,rnd(.6,1.2),1,1);}
 const inA=(px,pz)=>{const vx=px-x,vz=pz-z,d=Math.hypot(vx,vz);if(d>R)return false;if(dx==null)return true;return d<1||(vx*dx+vz*dz)/d>0.55;};
 ENT.forEach(e=>{if(e.kind==='creature'&&inA(e.x,e.z)){e.data.frozen=6;e.data.burn=0;}});
 TREES.forEach(t=>{if(t.st==='burning'&&inA(t.x,t.z)){t.st='charred';treeLook(t);treesDirty();}});PROPS.forEach(p=>{if(p.burn>0&&inA(p.x,p.z))p.burn=0;});
 let f=0;if(dx!=null){for(let d=3;d<=R&&f<4;d+=2.6){const px=x+dx*d,pz=z+dz*d;if(inLake({x:px,z:pz})&&!onIce({x:px,z:pz})){freeze(px,pz,2.6);f++;}}}else{for(let i=0;i<6&&f<3;i++){const a=i/6*TAU,px=x+Math.cos(a)*R*0.7,pz=z+Math.sin(a)*R*0.7;if(inLake({x:px,z:pz})&&!onIce({x:px,z:pz})){freeze(px,pz,2.6);f++;}}}}
function spawnTornado(x,z,dx,dz){if(TORN.length>=2)return;TORN.push({x,z,dx,dz,life:7*Math.min(1.5,pow('vent')),t:0,ht:0});combo('tornade');}
/* ---------- zones ---------- */
function doZone(sp){const el=sp.el,k=pow(el),x=player.x,z=player.z,R=(el==='lumiere'||el==='vent'||el==='ombre'?7:5)*k;const c=ELEM[el].c;
 ring(x,z,c,R*0.9,0.7);flash(x,1.5,z,c,3,0.6,false,R*3);
 for(let i=0;i<60;i++){const a=i/60*TAU;(el==='ombre'?PN:PA).emit(x+Math.cos(a)*0.8,player.y+0.4,z+Math.sin(a)*0.8,Math.cos(a)*R*1.6,rnd(0,1),Math.sin(a)*R*1.6,el==='ombre'?0x1a0a2a:c,0.45,0.1,0.6,0,2.2,0.9);}
 ENT.slice().forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<R)hurtCreature(e,el,x,z);});
 if(el==='feu'){for(let i=0;i<50;i++){const a=Math.random()*TAU,r=rnd(1.5,R);fireAt(x+Math.cos(a)*r,0.3,z+Math.sin(a)*r,0.6,1);}near(TREES,x,z,R+0.5).forEach(igniteTree);near(PROPS,x,z,R,p=>p.burnable&&p.dead<=0).forEach(p=>{p.burn=6;if(p.lev>0)meteorize(p);});near(PLANTS,x,z,R).forEach(p=>{if(p.type!=='lily')p.burn=2;});ICE.filter(i=>Math.hypot(i.x-x,i.z-z)<R+i.r).forEach(i=>i.life=Math.min(i.life,0.6));SLICK.forEach(s=>{if(Math.hypot(s.x-x,s.z-z)<R+s.r)s.life=Math.min(s.life,0.5);});decal(x,z,0x1a1612,R*0.8,25,0.5);ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<R)e.data.burn=3;});}
 else if(el==='glace'){extinguish(x,z,R);ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<R){e.data.frozen=5*k;e.data.burn=0;}});
  for(let i=0;i<50;i++){const a=Math.random()*TAU,r=rnd(.5,R);PA.emit(x+Math.cos(a)*r,0.2,z+Math.sin(a)*r,0,rnd(.5,1.5),0,0xe8fbff,0.25,0.05,rnd(.6,1.2),0,1);}
  if(Math.hypot(x-LAKE.x,z-LAKE.z)<LAKE.r+R){let f=0;for(let i=0;i<8&&f<3;i++){const a=i/8*TAU,px=x+Math.cos(a)*R*0.6,pz=z+Math.sin(a)*R*0.6;if(inLake({x:px,z:pz})&&!onIce({x:px,z:pz})){freeze(px,pz,2.8);f++;}}}
  if(!inLake({x,z})){if(recentNear('eau',x,z,R))makeSlick(x,z,R*0.9,'patinoire');else decal(x,z,0xdff4ff,R*0.9,12,0.6);}
  if(recentNear('vent',x,z,R))blizzard(x,z,null,null,R*1.4);}
 else if(el==='eau'){RAIN.push({x,z,r:R+2,life:4});const n=extinguish(x,z,R+2);if(n)hint('ext','💧 Le feu s’éteint.');
  for(let i=0;i<6;i++){const a=Math.random()*TAU,r=rnd(1,R);const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(isFree({x:px,z:pz},0.2)&&!inLake({x:px,z:pz}))growPlant(px,pz,'flower');}
  ENT.forEach(e=>{if(e.kind==='creature'){const d=Math.hypot(e.x-x,e.z-z);if(d<R&&d>0.01){e.data.kx+=(e.x-x)/d*8;e.data.kz+=(e.z-z)/d*8;}}});decal(x,z,0x2a3a4a,R,10,0.3);
  if(recentNear('nature',x,z,R))manaFlower(x+1.5,z+1.5);if(recentNear('lumiere',x,z,R+3)||ORBS.some(o=>Math.hypot(o.x-x,o.z-z)<R+6))rainbow(x,z);}
 else if(el==='vent'){PROPS.forEach(p=>{if(p.dead>0)return;const d=Math.hypot(p.x-x,p.z-z);if(d<R&&d>0.1){p.vx+=(p.x-x)/d*12;p.vz+=(p.z-z)/d*12;p.vy+=6;if(p.lev>0)p.lev=0;}});
  ENT.forEach(e=>{if(e.kind==='creature'){const d=Math.hypot(e.x-x,e.z-z);if(d<R&&d>0.01){e.data.kx+=(e.x-x)/d*14;e.data.kz+=(e.z-z)/d*14;}}});
  for(let i=0;i<90;i++){const a=Math.random()*TAU,r=rnd(.5,R);PN.emit(x+Math.cos(a)*r,rnd(.2,3.5),z+Math.sin(a)*r,-Math.sin(a)*9,rnd(1,3),Math.cos(a)*9,Math.random()<0.8?0xe8fff0:0x8ad04a,0.2,0.5,0.8,0,1,0.6);}
  const burning=TREES.filter(t=>t.st==='burning'&&Math.hypot(t.x-x,t.z-z)<R+3).concat(PROPS.filter(p=>p.burn>0&&p.dead<=0&&Math.hypot(p.x-x,p.z-z)<R+3));
  if(burning.length){const b=burning[0];const d=Math.hypot(b.x-x,b.z-z)||1;spawnTornado(b.x,b.z,(b.x-x)/d,(b.z-z)/d);}
  if(recentNear('glace',x,z,R))blizzard(x,z,null,null,R*1.4);}
 else if(el==='nature'){for(let i=0;i<14;i++){const a=i/14*TAU+rnd(-.2,.2),r=rnd(R*0.5,R);const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;if(isFree({x:px,z:pz},0.3)&&!inLake({x:px,z:pz}))growPlant(px,pz,pick(['flower','flower','bush','mush']));}
  regrow(x,z,R*1.6);ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<R)e.data.rooted=5*k;});if(recentNear('eau',x,z,R))manaFlower(x+1.5,z+1.5);}
 else if(el==='lumiere'){flash(x,4,z,0xfff6d0,5,1.2,false,40);const rev=revealScrolls(x,z,25*k);if(rev)say('✨ L’aube révèle '+rev+' parchemin'+(rev>1?'s':'')+' caché'+(rev>1?'s':'')+' !','gm');
  ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<R)e.data.confused=3;});if(recentNear('eau',x,z,R+3))rainbow(x,z);if(recentNear('ombre',x,z,R))eclipse(x,z);}
 else if(el==='ombre'){CLOUDS.push({x,y:1.2,z,life:6});for(let i=0;i<5;i++)CLOUDS.push({x:x+rnd(-R,R)*0.6,y:1,z:z+rnd(-R,R)*0.6,life:5});LAMPS.forEach(l=>{if(Math.hypot(l.x-x,l.z-z)<R*2.5)l.off=40;});
  ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<R+2)e.data.confused=6;});stealth=10*k;say('🌑 Tu te fonds dans l’ombre : les créatures perdent ta trace.','sys');if(recentNear('lumiere',x,z,R)||ORBS.some(o=>Math.hypot(o.x-x,o.z-z)<R))eclipse(x,z);}
 else if(el==='arcane'){let n=0;PROPS.forEach(p=>{if(p.dead<=0&&Math.hypot(p.x-x,p.z-z)<R+1){p.lev=4.5*k*(tal('arcane_u')?2:1);p.vy=4;n++;}});ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<R)e.data.frozen=Math.max(e.data.frozen,2);});if(n)hint('lev','🪄 Tout ce qui t’entoure se met à léviter !');}
 elemHit(el,x,z,R);if(el==='vent')fogClear=25;mark(el,x,z,R);
}
/* ---------- utilitaires ---------- */
function doUtil(sp){const el=sp.el,k=pow(el),[dx,dz]=fwd(),c=ELEM[el].c;
 if(el==='feu'){player.vx=dx*20*Math.min(1.4,k);player.vz=dz*20*Math.min(1.4,k);player.dash=0.35;player.vy=Math.max(player.vy,3.5);player.grounded=false;flash(player.x,1,player.z,0xff7a2e,3,0.5);for(let i=0;i<30;i++)PA.emit(player.x,player.y+0.5,player.z,-dx*rnd(3,8)+rnd(-1,1),rnd(0,2),-dz*rnd(3,8)+rnd(-1,1),pick([0xff5a10,0xffc040]),0.5,0.05,0.5,0,2);}
 else if(el==='glace'){let lake=0;for(let d=2.2;d<=14*Math.min(1.5,k);d+=2.4){const px=player.x+dx*d,pz=player.z+dz*d;if(inWater({x:px,z:pz})||Math.hypot(px-LAKE.x,pz-LAKE.z)<LAKE.r+0.5){if(!onIce({x:px,z:pz})){freeze(px,pz,1.9);lake++;}}else if(!hitsSolid(px,pz)){makeSlick(px,pz,1.5);}}
  for(let i=0;i<40;i++){const d=rnd(1,12);PA.emit(player.x+dx*d,0.3,player.z+dz*d,rnd(-.5,.5),rnd(.5,2),rnd(-.5,.5),0xe8fbff,0.3,0.05,rnd(.5,1),0,1);}
  hint('pont',lake?'❄ Un pont de glace s’étend sur le lac !':'❄ Une piste de glace glissante se forme devant toi.');}
 else if(el==='eau'){waterWalk=12*k;hint('ww','💧 Tu peux marcher sur l’eau pendant '+Math.round(12*k)+' s !');ring(player.x,player.z,0x6ab4ff,2,0.8);}
 else if(el==='vent'){player.vy=15;player.glide=4*k;player.grounded=false;player.jumps=2;for(let i=0;i<50;i++){const a=Math.random()*TAU;PN.emit(player.x+Math.cos(a)*0.6,player.y+0.2,player.z+Math.sin(a)*0.6,Math.cos(a)*5,rnd(-1,2),Math.sin(a)*5,0xe8fff0,0.25,0.6,0.7,0,1.5,0.7);}hint('fly','🌬 Le vent te porte : tu planes doucement.');}
 else if(el==='nature'){const UP=utilPt(10),x=UP?UP.x:player.x+dx*2.6,z=UP?UP.z:player.z+dz*2.6;ENT.filter(e=>e.kind==='bounce').slice(0,-1).forEach(removeEnt);
  const g=new THREE.Group();mesh(new THREE.CylinderGeometry(0.35,0.45,0.9,10),mat(0xf0e8d8,{flatShading:false}),0,0.45,0,g);const cap=mesh(new THREE.SphereGeometry(1.35,18,10,0,TAU,0,Math.PI/2),mat(0xd03a3a,{flatShading:false,roughness:0.6}),0,0.85,0,g);cap.scale.y=0.55;
  for(let i=0;i<7;i++){const a=i/7*TAU,r=rnd(.4,1);mesh(new THREE.SphereGeometry(0.14,8,6),mat(0xffffff,{flatShading:false}),Math.cos(a)*r,0.85+Math.sqrt(Math.max(0,1.35*1.35-r*r))*0.55-0.03,Math.sin(a)*r,g);}
  g.scale.setScalar(0.01);const e=addEnt('bounce',x,z,g,{grow:0,sq:0},45*k);for(let i=0;i<20;i++)PN.emit(x,0.3,z,rnd(-2,2),rnd(1,3),rnd(-2,2),0x4fbf3a,0.22,0.12,1,3,1.5,1);hint('mush','🍄 Saute sur le champignon pour rebondir très haut !');void e;}
 else if(el==='lumiere'){let best=null,bd=150;ENT.forEach(e=>{if(e.kind!=='scroll')return;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;best=e;}});
  if(!best){ENT.forEach(e=>{if(e.kind!=='item'&&e.kind!=='event')return;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;best=e;}});}
  if(!best){say('La lueur tournoie, perplexe : rien à guider dans les environs.','sys');return;}
  const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.SphereGeometry(0.13,10,8),basic(0xfff6c8)));g.add(glow(0xfff1a0,1.4,0.9));g.position.y=1.8;
  addEnt('guide',player.x,player.z,g,{target:best,y:1.8},60);say('✨ Une lueur s’élance vers '+(best.kind==='scroll'?'un parchemin':best.kind==='item'?'un objet de quête':'un événement')+' à '+Math.round(bd)+' m. Suis-la !','sys');}
 else if(el==='ombre'){const D=utilDist(9*Math.min(1.5,k));let tx=player.x,tz=player.z;for(let d=D;d>0.5;d-=0.5){const px=player.x+dx*d,pz=player.z+dz*d;if(isFree({x:px,z:pz},0.4)&&(!inLake({x:px,z:pz})||walkable({x:px,z:pz}))&&Math.hypot(px,pz)<92){tx=px;tz=pz;break;}}
  for(let i=0;i<30;i++){PN.emit(player.x+rnd(-.4,.4),player.y+rnd(0,2),player.z+rnd(-.4,.4),rnd(-1,1),rnd(0,1),rnd(-1,1),0x150a24,0.6,1.2,0.8,0,1,0.85);PN.emit(tx+rnd(-.4,.4),player.y+rnd(0,2),tz+rnd(-.4,.4),rnd(-1,1),rnd(0,1),rnd(-1,1),0x2a1048,0.6,0.1,0.6,0,1,0.85);}
  player.x=tx;player.z=tz;stealth=Math.max(stealth,2);}
 else if(el==='arcane'){let best=null,bd=20*Math.min(1.5,k);ENT.forEach(e=>{if((e.kind==='scroll'&&!e.data.hidden)||e.kind==='item'){const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;best=e;}}});
  if(best&&!lockedProp()){best.data.pull=true;say('🪄 Tu attires '+(best.kind==='scroll'?'le parchemin':esc(best.data.item))+' à toi…','sys');}
  else{let bp=lockedProp(),bpd=bp?Math.max(1.6,Math.hypot(bp.x-player.x,bp.z-player.z)):15;if(!bp)PROPS.forEach(p=>{if(p.dead>0)return;const d=Math.hypot(p.x-player.x,p.z-player.z);if(d<bpd&&d>1.5){bpd=d;bp=p;}});if(bp){bp.lev=3*(tal('arcane_u')?2:1);bp.vy=4;bp.vx=(player.x-bp.x)/bpd*5;bp.vz=(player.z-bp.z)/bpd*5;}else say('Rien à attirer à portée.','sys');}}
 mark(el,player.x,player.z,2);
}
/* ---------- saut & sol ---------- */
const walkable=p=>onIce(p)||waterWalk>0;
function groundAt(x,z,y){let g=gh(x,z);if(inWater({x,z})){g=walkable({x,z})?(onIce({x,z})?0.14:0.05):(inLake({x,z})?-0.8:0);}
 for(const c of COLS){if(c.h===undefined||c.h>y+0.45)continue;if(c.r!==undefined){if(Math.abs(x-c.x)<c.r+0.2&&Math.abs(z-c.z)<c.r+0.2&&Math.hypot(x-c.x,z-c.z)<c.r+0.15)g=Math.max(g,c.h);}else if(Math.abs(x-c.x)<c.hw&&Math.abs(z-c.z)<c.hd)g=Math.max(g,c.h);}
 for(const p of PROPS){if(p.dead>0)continue;const top=p.y+p.h;if(top>y+0.45)continue;if(Math.hypot(x-p.x,z-p.z)<p.r+0.15)g=Math.max(g,top);}
 for(const e of ENT){if(e.kind==='bounce'&&e.data.grow>=1){const b0=gh(e.x,e.z);if(y>=b0+0.6&&Math.hypot(x-e.x,z-e.z)<1.35)g=Math.max(g,b0+1.05);}}
 return g;}
const bounceAt=(x,z)=>ENT.find(e=>e.kind==='bounce'&&e.data.grow>=1&&Math.hypot(x-e.x,z-e.z)<1.35);
function jump(){if(player.swim)return;const jb=BUFF.bond?1.35:1;if(player.grounded){player.vy=8.6*jb;player.grounded=false;player.jumps=1;for(let i=0;i<8;i++)PN.emit(player.x,player.y+0.05,player.z,rnd(-1,1),rnd(.2,.8),rnd(-1,1),0xbba888,0.25,0.5,0.5,1,2,0.5);}
 else if(tal('agil')>=2&&player.jumps<2){player.vy=8.2*jb;player.jumps=2;for(let i=0;i<16;i++){const a=i/16*TAU;PA.emit(player.x,player.y+0.2,player.z,Math.cos(a)*3,0,Math.sin(a)*3,0xc9ffe0,0.3,0.05,0.4,0,3);}}}
/* ---------- mises à jour des effets spéciaux ---------- */
function updSpecial(dt){
 mana=Math.min(manaMax(),mana+manaRegen()*dt);
 if(waterWalk>0){waterWalk-=dt;if(inLake(player)&&Math.random()<dt*8)ring(player.x,player.z,0xbfe6ff,1,0.6);if(waterWalk>0&&waterWalk<2&&inLake(player))hint('wwend','💧 Le sortilège s’estompe… regagne la rive !');}
 if(stealth>0)stealth-=dt;
 RECENT=RECENT.filter(e=>(e.t-=dt)>0);
 SLICK=SLICK.filter(s=>{s.life-=dt;if(s.life<3)s.m.material.opacity=0.6*Math.max(0,s.life/3);if(s.life<=0){scene.remove(s.m);s.m.geometry.dispose();s.m.material.dispose();return false;}return true;});
 RAIN=RAIN.filter(r=>{r.life-=dt;for(let i=0;i<12;i++){const a=Math.random()*TAU,d=Math.sqrt(Math.random())*r.r;PN.emit(r.x+Math.cos(a)*d,7,r.z+Math.sin(a)*d,0,-16,0,0x9ad0ff,0.08,0.08,0.45,0,0,0.8);}if(Math.random()<dt*10){const a=Math.random()*TAU,d=Math.random()*r.r;ring(r.x+Math.cos(a)*d,r.z+Math.sin(a)*d,0xbfe6ff,0.6,0.4);}extinguish(r.x,r.z,r.r);return r.life>0;});
 TORN=TORN.filter(T=>{T.life-=dt;T.t+=dt;T.x+=T.dx*3.5*dt;T.z+=T.dz*3.5*dt;T.ht-=dt;
  for(let i=0;i<7;i++){const h=Math.random()*6.5,a=T.t*9+h*1.3+Math.random()*0.4,r=0.3+h*0.28;PA.emit(T.x+Math.cos(a)*r,h,T.z+Math.sin(a)*r,-Math.sin(a)*5,1.5,Math.cos(a)*5,h<2?0xffd060:pick([0xff5a10,0xff8a30]),rnd(.4,.7),0.1,rnd(.3,.5),-1,1);}
  if(Math.random()<0.3)PN.emit(T.x,6.5,T.z,rnd(-1,1),1.5,rnd(-1,1),0x2a2624,1,2.5,1.5,-0.2,0.4,0.5);
  if(Math.random()<dt*4)flash(T.x,3,T.z,0xff7a2e,2.5,0.4,false,14);
  near(TREES,T.x,T.z,2.6).forEach(igniteTree);if(Math.random()<dt*3)elemHit('feu',T.x,T.z,2.5);near(PROPS,T.x,T.z,2.2,p=>p.dead<=0).forEach(p=>{if(p.burnable)p.burn=6;p.vy+=dt*20;p.vx+=(Math.random()-0.5)*dt*30;p.vz+=(Math.random()-0.5)*dt*30;});
  if(T.ht<=0){ENT.slice().forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-T.x,e.z-T.z)<2.4){hurtCreature(e,'feu',T.x,T.z);T.ht=0.6;}});}
  if(Math.hypot(T.x-player.x,T.z-player.z)<1.6&&player.y<3){const d=Math.hypot(player.x-T.x,player.z-T.z)||1;player.vx+=(player.x-T.x)/d*8;player.vz+=(player.z-T.z)/d*8;hint('tornhot','Attention, la tornade de feu ne fait pas la différence entre amis et ennemis !');}
  if(hitsSolid(T.x,T.z)&&!near(TREES,T.x,T.z,1).length)T.life=Math.min(T.life,0.3);
  return T.life>0;});
 RAINBOWS=RAINBOWS.filter(r=>{r.life-=dt;r.t+=dt;const o=Math.min(1,r.t/1.5)*Math.min(1,r.life/2)*0.4;r.g.children.forEach(m=>m.material.opacity=o);if(r.life<=0){scene.remove(r.g);r.g.children.forEach(m=>{m.geometry.dispose();m.material.dispose();});return false;}return true;});
 if(lvl()>=15&&Math.random()<dt*6)PA.emit(player.x+rnd(-.5,.5),player.y+rnd(0,1.8),player.z+rnd(-.5,.5),0,rnd(.3,.8),0,0xf3cf7a,0.2,0.03,1,0,0);
 ENT.slice().forEach(e=>{
  if(e.kind==='bounce'){const D=e.data;if(D.grow<1){D.grow=Math.min(1,D.grow+dt*2.5);e.obj.scale.setScalar(Math.max(0.01,D.grow<0.8?D.grow/0.8*1.15:1.15-(D.grow-0.8)*0.75));}if(D.sq>0){D.sq-=dt;e.obj.scale.set(1+D.sq*0.6,1-D.sq*1.2,1+D.sq*0.6);}}
  else if(e.kind==='mana'){e.obj.rotation.y+=dt*0.8;if(Math.random()<dt*8)PA.emit(e.x+rnd(-.3,.3),1.1,e.z+rnd(-.3,.3),0,rnd(.4,1),0,0x6ab4ff,0.2,0.03,1,0,0);}
  else if(e.kind==='guide'){const T=e.data.target;if(!ENT.includes(T)){removeEnt(e);return;}const dxp=e.x-player.x,dzp=e.z-player.z,dp=Math.hypot(dxp,dzp);const tx=T.x-e.x,tz=T.z-e.z,dt2=Math.hypot(tx,tz);
   if(dt2<1.2){if(T.kind==='scroll'&&T.data.hidden){T.data.hidden=false;T.obj.visible=true;}burst(T.x,1.5,T.z,0xfff1a0,30,4);say('✨ La lueur tournoie au-dessus de sa trouvaille !','sys');removeEnt(e);return;}
   if(dp<7){e.x+=tx/dt2*6.5*dt;e.z+=tz/dt2*6.5*dt;}e.data.y=1.8+Math.sin(e.t*4)*0.3;e.obj.position.set(e.x,e.data.y+gh(e.x,e.z),e.z);e.obj.children[0].position.y=0;e.t+=0;
   PA.emit(e.x,e.data.y,e.z,rnd(-.2,.2),rnd(-.2,.2),rnd(-.2,.2),0xfff1a0,0.25,0.03,0.9,0,0);}
  else if((e.kind==='scroll'||e.kind==='item')&&e.data.pull){const dx=player.x-e.x,dz=player.z-e.z,d=Math.hypot(dx,dz);if(d<1.3){e.data.pull=false;focus={t:'ent',e};interact();return;}e.x+=dx/d*Math.min(d,10*dt);e.z+=dz/d*Math.min(d,10*dt);e.obj.position.x=e.x;e.obj.position.z=e.z;e.obj.position.y=gh(e.x,e.z);if(Math.random()<0.6)PA.emit(e.x,1.2,e.z,0,0,0,0xff7ae0,0.3,0.05,0.5,0,0);}
  else if(e.kind==='scroll'&&e.data.hidden&&tal('lumiere_u')&&Math.random()<dt*5)PA.emit(e.x+rnd(-.3,.3),rnd(0.5,4),e.z+rnd(-.3,.3),0,0.6,0,ELEM[e.data.spell.el].c,0.35,0.05,1.2,0,0,0.9);
 });
}
function trail(p,dt){const x=p.o.position.x,y=p.o.position.y,z=p.o.position.z,el=p.el,c=p.c;
 if(el==='feu'){for(let i=0;i<3;i++)PA.emit(x,y,z,rnd(-.6,.6),rnd(0,1.2),rnd(-.6,.6),Math.random()<0.5?0xff6a1e:0xffc040,rnd(.35,.6),0.05,rnd(.25,.45),-1,1);if(Math.random()<0.4)PN.emit(x,y,z,0,0.6,0,0x2a2420,0.3,0.9,0.8,-0.5,0.5,0.35);}
 else if(el==='glace'){for(let i=0;i<2;i++)PA.emit(x+rnd(-.1,.1),y+rnd(-.1,.1),z+rnd(-.1,.1),rnd(-.3,.3),rnd(-.3,.3),rnd(-.3,.3),Math.random()<0.5?0xffffff:0x9ee8ff,rnd(.12,.22),0.02,rnd(.4,.7),1,1);}
 else if(el==='eau'){for(let i=0;i<2;i++)PN.emit(x,y,z,rnd(-.4,.4),rnd(-.2,.4),rnd(-.4,.4),0x6ab4ff,rnd(.15,.25),0.05,0.5,9,0.3,0.85);}
 else if(el==='nature'){if(Math.random()<0.6)PN.emit(x,y,z,rnd(-.5,.5),rnd(0,.5),rnd(-.5,.5),pick([0x4fbf3a,0x8ad04a,0x2f8a2a]),0.18,0.12,1,2,1.5,1);PA.emit(x,y,z,0,0,0,0x9aff7a,0.25,0.05,0.3,0,0);}
 else if(el==='lumiere'){PA.emit(x,y,z,rnd(-.3,.3),rnd(-.3,.3),rnd(-.3,.3),0xfff6c0,rnd(.3,.5),0.05,0.5,0,1);}
 else if(el==='ombre'){for(let i=0;i<3;i++)PN.emit(x+rnd(-.15,.15),y+rnd(-.15,.15),z+rnd(-.15,.15),rnd(-.3,.3),rnd(-.1,.3),rnd(-.3,.3),Math.random()<0.6?0x150a24:0x3a1a5a,rnd(.4,.6),rnd(.8,1.1),rnd(.5,.8),-0.2,1,0.75);}
 else if(el==='arcane'){const a=p.t*22;for(let k=0;k<2;k++){const aa=a+k*Math.PI;PA.emit(x+Math.cos(aa)*0.25,y+Math.sin(aa)*0.25,z,0,0,0,k?0xff7ae0:0xb48cff,0.28,0.05,0.4,0,0);}}
}
function updProj(dt){PROJ=PROJ.filter(p=>{if(p.ht)homeProj(p,dt);p.life-=dt;p.t+=dt;p.vy-=p.grav*dt;const o=p.o.position;o.x+=p.vx*dt;o.y+=p.vy*dt;o.z+=p.vz*dt;if(p.light)p.light.l.position.copy(o);trail(p,dt);
 if(p.el==='lumiere'&&p.life<=0){o.y=Math.max(o.y,2.2);}
 let hit=false,hitC=null;
 for(const e of ENT){if(e.kind!=='creature')continue;if(Math.hypot(e.x-o.x,e.z-o.z)<(e.data.rad||1.2)&&Math.abs(e.data.y+gh(e.x,e.z)-o.y)<1.3*(e.data.scale||1)){hit=true;hitC=e;break;}}
 if(!hit)for(const pr of PROPS){if(pr.dead>0)continue;if(Math.hypot(pr.x-o.x,pr.z-o.z)<pr.r+0.25&&Math.abs(pr.y-o.y)<pr.h+0.4){hit=true;break;}}
 if(!hit&&o.y<=gh(o.x,o.z)+0.12)hit=true;
 if(!hit&&hitsSolid(o.x,o.z))hit=true;
 if(!hit&&o.y<1.6&&['glace','eau','nature','feu'].includes(p.el)&&inWater({x:o.x,z:o.z})&&!onIce({x:o.x,z:o.z})&&(!p.tp||Math.hypot(o.x-p.tp.x,o.z-p.tp.z)<1.3||o.y<0.15))hit=true;
 if(hit||p.life<=0){scene.remove(p.o);impact(p.el,o.x,Math.max(0.1,o.y),o.z,hitC);return false;}return true;});}
function floatText(t,color){const l=label('« '+t+' »',color,3.2);l.position.set(player.x,player.y+2.6,player.z);scene.add(l);FT.push({l,t:0});}
let FT=[];function updFT(dt){FT=FT.filter(f=>{f.t+=dt;f.l.position.y+=dt*0.6;f.l.material.opacity=Math.max(0,1-f.t/1.4);if(f.t>1.4){scene.remove(f.l);f.l.material.map.dispose();f.l.material.dispose();return false;}return true;});}

function near(list,x,z,r,f){return list.filter(o=>(!f||f(o))&&Math.hypot(o.x-x,o.z-z)<r);}
function igniteTree(t){if(t.st!=='ok')return false;t.st='burning';t.burn=9;npcReact(t.x,t.z,'fire');return true;}
let burnMsg=0,iceMsg=0,growMsg=0,levMsg=0,darkMsg=0,lightMsg=0,gustMsg=0;
function hint(key,txt){if(window['_h_'+key])return;window['_h_'+key]=1;say(txt,'sys');}
function impact(el,x,y,z,hitC){const c=ELEM[el].c,k=pow(el);
 const targets=hitC?[hitC]:[];ENT.forEach(e=>{if(e.kind==='creature'&&e!==hitC&&Math.hypot(e.x-x,e.z-z)<1.8*k)targets.push(e);});
 targets.forEach(e=>hurtCreature(e,el,x,z));
 const gx=x,gz=z;
 if(el==='feu'){const R=(tal('feu_u')?1.7:1)*k;
  for(let i=0;i<34*R;i++){const a=Math.random()*TAU,v=rnd(1,5)*R;PA.emit(x,y,z,Math.cos(a)*v,rnd(0,4),Math.sin(a)*v,pick([0xff5a10,0xff9a30,0xffd060]),rnd(.4,.8),0.05,rnd(.4,.8),2,2);}for(let i=0;i<8;i++)PN.emit(x,y,z,rnd(-1,1),rnd(1,2.5),rnd(-1,1),0x2a2624,0.6,1.8,rnd(1,1.8),-0.4,0.6,0.5);flash(x,y+0.5,z,0xff7a2e,3,0.6);
  let any=false;near(TREES,gx,gz,3.2*R).forEach(t=>{if(igniteTree(t))any=true;});
  near(PROPS,gx,gz,2.6*R,p=>p.burnable&&p.dead<=0).forEach(p=>{p.burn=6;any=true;if(p.lev>0)meteorize(p);});
  near(PLANTS,gx,gz,2.6*R).forEach(p=>{if(p.type!=='lily'){p.burn=2;}});
  if(tal('feu_u'))ENT.slice().forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-gx,e.z-gz)<3*R){e.data.burn=3;if(!targets.includes(e))hurtCreature(e,'feu',gx,gz);}});
  ICE.filter(i=>Math.hypot(i.x-gx,i.z-gz)<i.r+1.5*R).forEach(i=>{i.life=Math.min(i.life,0.6);for(let q=0;q<20;q++)PN.emit(i.x+rnd(-i.r,i.r)*0.6,0.3,i.z+rnd(-i.r,i.r)*0.6,0,rnd(1,2.5),0,0xe8eef5,0.6,1.8,rnd(1,2),-0.3,0.5,0.5);hint('melt','La glace fond dans un nuage de vapeur !');});
  SLICK.forEach(s=>{if(Math.hypot(s.x-gx,s.z-gz)<s.r+2*R)s.life=Math.min(s.life,0.5);});
  if(R>1.3)ring(gx,gz,0xff7a2e,R*1.5,0.6);
  decal(gx,gz,0x1a1612,1.3*R,25,0.55);if(any)hint('burn','🔥 Ça brûle ! L’eau ou la glace éteignent les flammes… et le vent les attise.');}
 else if(el==='glace'){for(let i=0;i<30;i++){const a=Math.random()*TAU,v=rnd(1,4);PA.emit(x,y,z,Math.cos(a)*v,rnd(0,3),Math.sin(a)*v,Math.random()<0.5?0xffffff:0x9ee8ff,rnd(.2,.35),0.03,rnd(.5,.9),4,1);}flash(x,y,z,0x9ee8ff,2,0.5);
  if(inWater({x:gx,z:gz})||Math.hypot(gx-LAKE.x,gz-LAKE.z)<LAKE.r+0.8){freeze(gx,gz);}
  else if(recentNear('eau',gx,gz,3))makeSlick(gx,gz,3.2*k,'patinoire');
  else decal(gx,gz,0xdff4ff,1.6*k,12,0.7);
  extinguish(gx,gz,4*k);
  ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-gx,e.z-gz)<3*k){e.data.frozen=4*k;e.data.burn=0;}});}
 else if(el==='eau'){splash(gx,gz);for(let i=0;i<18;i++){const a=Math.random()*TAU,v=rnd(1,3);PN.emit(x,y,z,Math.cos(a)*v,rnd(1,4),Math.sin(a)*v,0x6ab4ff,0.3,0.1,0.8,10,0.5,0.85);}
  const n=extinguish(gx,gz,4.5*k);if(n)hint('ext','💧 Le feu s’éteint dans un sifflement.');
  ENT.forEach(e=>{if(e.kind==='creature'){const d=Math.hypot(e.x-gx,e.z-gz);if(d<3.5*k&&d>0.01){e.data.kx+=(e.x-gx)/d*7;e.data.kz+=(e.z-gz)/d*7;}}});
  PROPS.forEach(p=>{const d=Math.hypot(p.x-gx,p.z-gz);if(d<2.5*k&&p.dead<=0&&d>0.01){p.vx+=(p.x-gx)/d*3;p.vz+=(p.z-gz)/d*3;}});
  if(!inLake({x:gx,z:gz})&&Math.random()<0.6){const q=1+Math.floor(Math.random()*3);for(let i=0;i<q;i++){const a=Math.random()*TAU,r=rnd(.5,1.8);const px=gx+Math.cos(a)*r,pz=gz+Math.sin(a)*r;if(isFree({x:px,z:pz},0.2))growPlant(px,pz,'flower');}}
  decal(gx,gz,0x2a3a4a,1.4*k,10,0.35);
  if(recentNear('nature',gx,gz,3))manaFlower(gx,gz);
  if(recentNear('lumiere',gx,gz,5)||ORBS.some(o=>Math.hypot(o.x-gx,o.z-gz)<9))rainbow(gx,gz);}
 else if(el==='nature'){for(let i=0;i<24;i++){const a=Math.random()*TAU,v=rnd(.5,2.5);PN.emit(x,y,z,Math.cos(a)*v,rnd(1,3),Math.sin(a)*v,pick([0x4fbf3a,0x8ad04a,0x2f8a2a,0xc8e86a]),0.22,0.15,rnd(1,1.6),3,1.5,1);}flash(x,y,z,0x6fe36f,1.6,0.6);
  if(inLake({x:gx,z:gz})){for(let i=0;i<4;i++)growPlant(gx+rnd(-1.5,1.5),gz+rnd(-1.5,1.5),'lily');hint('lily','Des nénuphars fleurissent à la surface du lac.');}
  else{const q=Math.round((4+Math.random()*4)*k);for(let i=0;i<q;i++){const a=Math.random()*TAU,r=rnd(.3,2.6*k);const px=gx+Math.cos(a)*r,pz=gz+Math.sin(a)*r;if(isFree({x:px,z:pz},0.3)&&!inLake({x:px,z:pz}))growPlant(px,pz,pick(['flower','flower','flower','bush','mush']));}hint('grow','🌱 La végétation jaillit du sol !');}
  regrow(gx,gz,6*k);
  ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-gx,e.z-gz)<3.5*k){e.data.rooted=5*k;}});
  if(recentNear('eau',gx,gz,3))manaFlower(gx,gz);}
 else if(el==='lumiere'){const oy=Math.max(2.4,y);const g=new THREE.Group();g.add(new THREE.Mesh(G.orb,basic(0xfff6c8)));g.add(glow(0xfff1a0,5,0.9));g.position.set(x,oy,z);scene.add(g);
  ORBS.push({g,x,z,y:oy,life:25*k,light:flash(x,oy,z,0xfff0c0,3.2,25*k,true,22)});
  const rev=revealScrolls(x,z,14*k);
  if(rev)say('✨ La lumière révèle un parchemin caché !','gm');else hint('orb','✨ L’orbe flotte et éclaire les environs (pratique la nuit). Elle révèle aussi les parchemins cachés.');
  ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<6*k)e.data.confused=Math.max(e.data.confused,2);});
  if(recentNear('eau',gx,gz,5))rainbow(gx,gz);if(recentNear('ombre',gx,gz,4))eclipse(gx,gz);}
 else if(el==='ombre'){CLOUDS.push({x,y:Math.max(1,y),z,life:6*k});let off=0;LAMPS.forEach(l=>{if(Math.hypot(l.x-x,l.z-z)<15*k){l.off=40;off++;}});
  ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<5*k)e.data.confused=5*k;});
  if(off)hint('dark','🌑 Les lanternes alentour s’éteignent…');
  if(recentNear('lumiere',gx,gz,4)||ORBS.some(o=>Math.hypot(o.x-gx,o.z-gz)<6))eclipse(gx,gz);}
 else if(el==='arcane'){for(let i=0;i<26;i++){const a=Math.random()*TAU,v=rnd(1,4);PA.emit(x,y,z,Math.cos(a)*v,rnd(-1,2),Math.sin(a)*v,Math.random()<0.5?0xff7ae0:0xb48cff,rnd(.25,.4),0.03,rnd(.4,.8),0,2);}ring(gx,gz,0xff7ae0,1.5,0.6);
  let n=0;PROPS.forEach(p=>{if(p.dead<=0&&Math.hypot(p.x-gx,p.z-gz)<2.8*k){p.lev=4.5*k*(tal('arcane_u')?2:1);p.vy=3;n++;if(p.burn>0)meteorize(p);}});
  if(n)hint('lev','🪄 L’objet lévite ! Une bourrasque pendant qu’il flotte l’enverra valser… et le feu en fera un météore.');}
 elemHit(el,gx,gz,2.5*k);mark(el,gx,gz,2.5*k);
}
function extinguish(x,z,r){let n=0;near(TREES,x,z,r+1).forEach(t=>{if(t.st==='burning'){t.st='charred';t.burn=0;treeLook(t);treesDirty();n++;for(let i=0;i<12;i++)PN.emit(t.x+rnd(-1,1),rnd(1,4),t.z+rnd(-1,1),0,rnd(1,2),0,0xdde4ea,0.6,1.8,rnd(1,2),-0.3,0.5,0.5);}});
 PROPS.forEach(p=>{if(p.burn>0&&Math.hypot(p.x-x,p.z-z)<r){p.burn=0;p.bn=0;n++;}});PLANTS.forEach(p=>{if(p.burn>0&&Math.hypot(p.x-x,p.z-z)<r){p.burn=0;n++;}});
 ENT.forEach(e=>{if(e.kind==='creature'&&e.data.burn>0&&Math.hypot(e.x-x,e.z-z)<r)e.data.burn=0;});if(n)npcReact(x,z,'help');return n;}
function freeze(x,z,rr){const d=Math.hypot(x-LAKE.x,z-LAKE.z);if(d>LAKE.r-0.5&&d<LAKE.r+6){x=LAKE.x+(x-LAKE.x)/d*(LAKE.r-0.6);z=LAKE.z+(z-LAKE.z)/d*(LAKE.r-0.6);}
 const r=(rr||3.4)*Math.min(1.5,pow('glace'));const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.05,0.14,10),new THREE.MeshStandardMaterial({color:0xcfefff,roughness:0.1,metalness:0.2,transparent:true,opacity:0.92,flatShading:true}));m.position.set(x,0.1,z);m.rotation.y=Math.random()*TAU;m.receiveShadow=true;m.scale.setScalar(0.1);scene.add(m);
 ICE.push({x,z,r,m,life:tal('glace_u')?180:60,t:0});
 for(let i=0;i<30;i++)PA.emit(x+rnd(-r,r)*0.7,0.3,z+rnd(-r,r)*0.7,0,rnd(.3,1.2),0,0xe8fbff,0.3,0.05,rnd(.6,1.2),0,1);
 hint('ice','❄ Le lac gèle ! Tu peux marcher sur la glace (elle fond au bout d’une minute). Gèle plus loin pour traverser.');return ICE[ICE.length-1];}
function updIce(dt){ICE=ICE.filter(i=>{i.t+=dt;i.life-=dt;const s=Math.min(1,i.t*4);i.m.scale.setScalar(s);if(i.life<4)i.m.material.opacity=0.92*Math.max(0,i.life/4);
 if(i.life<=0){scene.remove(i.m);i.m.geometry.dispose();i.m.material.dispose();splash(i.x,i.z);return false;}return true;});}
function gust(dx,dz){const ox=player.x,oz=player.z,k=pow('vent'),R=10*k;
 for(let i=0;i<70*Math.min(1.5,k);i++){const a=rnd(-0.55,0.55),ca=Math.cos(a),sa=Math.sin(a);const vx=dx*ca-dz*sa,vz=dx*sa+dz*ca;const v=rnd(10,18)*Math.min(1.4,k);PN.emit(ox+dx*0.8,player.y+rnd(0.3,2.2),oz+dz*0.8,vx*v,rnd(-0.5,1),vz*v,Math.random()<0.7?0xe8fff0:pick([0x8ad04a,0xc8a050]),rnd(.12,.25),rnd(.3,.5),rnd(.5,.8),0,1.5,0.7);}
 const inCone=(x,z,RR)=>{const vx=x-ox,vz=z-oz,d=Math.hypot(vx,vz);return d<RR&&d>0.2&&(vx*dx+vz*dz)/d>0.62?d:0;};
 let pushed=0;PROPS.forEach(p=>{if(p.dead>0)return;const d=inCone(p.x,p.z,R);if(d){const q=(1.3-d/R)*(p.type==='rock'?0.6:1)*Math.min(1.5,k);p.vx+=dx*14*q;p.vz+=dz*14*q;p.vy+=(p.lev>0?2:5)*q;if(p.lev>0){p.lev=0;p.vx*=1.5;p.vz*=1.5;}pushed++;}});
 ENT.forEach(e=>{if(e.kind!=='creature')return;const d=inCone(e.x,e.z,R);if(d){e.data.kx+=dx*12*k;e.data.kz+=dz*12*k;}});
 let fan=0,src=null;TREES.forEach(t=>{if(t.st==='burning'&&inCone(t.x,t.z,R+2)){if(!src)src=t;near(TREES,t.x,t.z,4.5).forEach(n=>{if(igniteTree(n))fan++;});}});
 PROPS.forEach(p=>{if(p.burn>0&&p.dead<=0&&inCone(p.x,p.z,R+2)){if(!src)src=p;p.burn+=2;near(TREES,p.x,p.z,3.5).forEach(n=>{if(igniteTree(n))fan++;});}});
 if(src)spawnTornado(src.x,src.z,dx,dz);else if(fan)say('🌬🔥 Le vent attise l’incendie !','sys');else if(pushed)hint('gust','🌬 La bourrasque projette tout ce qui se trouve devant toi.');
 if(recentNear('glace',ox+dx*4,oz+dz*4,6))blizzard(ox,oz,dx,dz,R+2);
 elemHit('vent',ox+dx*4,oz+dz*4,4);fogClear=Math.max(fogClear,10);mark('vent',ox+dx*4,oz+dz*4,4);
}
function hurtCreature(e,el,x,z){const D=e.data;const dmg=D.boss?(D.weak===el?2:0):(D.weak===el?2:1);if(!dmg){if(!D.wm||performance.now()-D.wm>2500){D.wm=performance.now();say('Le Gardien absorbe ton sort ! Faiblesse actuelle : <b>'+ELEM[D.weak].n+'</b>','sys');}burst(e.x,D.y,e.z,ELEM[el].c,6,2);return;}D.hp-=dmg;burst(e.x,D.y,e.z,ELEM[el].c,10,4);
 if(el==='feu')D.burn=3;if(el==='glace')D.frozen=4;if(el==='nature')D.rooted=4;
 const d=Math.hypot(e.x-x,e.z-z)||1;D.kx+=(e.x-x)/d*4;D.kz+=(e.z-z)/d*4;
 if(D.hp<=0){killCreature(e);}
 else if(D.weak!==el&&!D.hinted){D.hinted=true;say('Ils résistent… peut-être sensibles à la magie de type <b>'+ELEM[D.weak].n+'</b> ?','sys');}}
function killCreature(e){const D=e.data;if(!ENT.includes(e))return;if(D.boss)setTimeout(bossDefeated,10);else if(Math.random()<0.45){addItem('essence',1);setTimeout(()=>say('Tu récupères une <b>essence élémentaire</b>.','sys'),50);}gainXP(D.weak?10:8);burst(e.x,D.y,e.z,ELEM[D.look].c,30,6);flash(e.x,D.y,e.z,ELEM[D.look].c,2,0.5);removeEnt(e);say(esc(D.name)+' : un de moins ! (+XP)','sys');
 if(!ENT.some(x=>x.kind==='creature'&&x.data.name===D.name)){chron(D.name+' dispersés.');gainXP(15);say('✦ Tous les '+esc(D.name.toLowerCase())+' sont dispersés !','gm');if(Math.random()<0.5){spawnScroll(D.loc,genSpell(),300);say('Ils laissent derrière eux un parchemin scintillant…','sys');}}}

