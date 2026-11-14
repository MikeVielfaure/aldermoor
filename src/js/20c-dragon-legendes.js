/* ================= LE DRAGON IGNIVOR ET LES SORTS LÉGENDAIRES =================
   - Ignivor, la vouivre ancestrale, dort au Nid de la Vouivre (Landes). Combat de boss : barre de vie,
     points de vie du joueur le temps du combat, boules de feu, souffle de flammes, 2e phase avec diablotins.
     Insensible au feu, faible à la glace. Vaincue : sort légendaire « Souffle du dragon ». Revient 3 jours après.
   - 4 sorts légendaires (série rare) : Démantibulus (Plateau des Géants), Pluie d'étoiles (sommet du Pic de
     Givrecorne, seulement la nuit), Appel du gardien (Bosquet des Murmures), Souffle du dragon (Ignivor).
     Indices dans le Grimoire. Ils comptent comme des sorts spéciaux (pas de doublon, pas de rang). */
const LEG_SP={
 demantibulus:{name:'Démantibulus',inc:'Demantibula Corporis',el:'arcane',form:'trait',cost:30,cd:5,desc:'Un rayon qui démantibule la cible en mille morceaux. Rien ne lui résiste… sauf peut-être un dragon.',
  ou:'Plateau des Géants (Landes)',indice:'On dit que les Gardiens de pierre du Plateau des Géants veillent sur un grimoire doré.'},
 etoiles:{name:'Pluie d’étoiles',inc:'Stellarum Imber',el:'lumiere',form:'zone',cost:55,cd:14,desc:'Des météores s’abattent tout autour de toi.',
  ou:'Pic de Givrecorne (Landes), la nuit',indice:'Au sommet du Pic de Givrecorne, un grimoire n’apparaît que sous les étoiles.'},
 gardien:{name:'Appel du gardien',inc:'Custos Silvae',el:'nature',form:'util',cost:45,cd:25,desc:'Un arbre-gardien sort de terre et combat à tes côtés pendant 45 secondes.',
  ou:'Bosquet des Murmures (vallée)',indice:'Les arbres à l’envers du Bosquet des Murmures cachent un savoir très ancien.'},
 souffle:{name:'Souffle du dragon',inc:'Draconis Halitus',el:'feu',form:'trait',cost:30,cd:6,desc:'Un cône de flammes dévorantes, comme celui d’une vouivre.',
  ou:'Ignivor, au Nid de la Vouivre (Landes)',indice:'Seul qui vaincra Ignivor, la vouivre ancestrale, apprendra son souffle.'}};
const legSpell=k=>{const L=LEG_SP[k];return {name:L.name,inc:L.inc,el:L.el,form:L.form,desc:L.desc,special:k,legend:true,cost:L.cost,cd:L.cd,id:'leg-'+k};};
const legHas=k=>S&&S.spells&&S.spells.some(s=>s.special===k);
{const _c=spellCost;spellCost=function(sp){if(sp&&sp.legend)return Math.round(sp.cost*(1-0.15*tal('conc')));return _c.apply(this,arguments);};}
{const _d=spellCd;spellCd=function(sp){if(sp&&sp.legend)return sp.cd;return _d.apply(this,arguments);};}
function legLearn(k){if(legHas(k))return;const sp=legSpell(k);learnSpell(sp);banner('Sort légendaire !','✦ '+sp.name+' — '+sp.inc);SHAKE=Math.max(SHAKE,0.4);
 for(let i=0;i<80;i++){const a=Math.random()*TAU,r=rnd(.3,1.6);PA.emit(player.x+Math.cos(a)*r,player.y+rnd(0,2.5),player.z+Math.sin(a)*r,0,rnd(1,4),0,i%2?0xf3cf7a:ELEM[sp.el].c,0.4,0.05,rnd(.8,1.6),0,0.5);}
 const n=Object.keys(LEG_SP).filter(legHas).length;setTimeout(()=>say('✦ Sorts légendaires découverts : <b>'+n+'/4</b>. Place '+esc(sp.name)+' dans un emplacement depuis le Grimoire.','gm'),900);chron('Sort légendaire : '+sp.name);save();}
/* ---------- débris, météores, gardien : petites choses animées ---------- */
const DEBRIS=[],METEORS=[];let ALLY=null;
const DBG=new THREE.BoxGeometry(0.28,0.28,0.28);
function debris(x,y,z,col,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(DBG,mat(col,{emissive:col,emissiveIntensity:0.25}));m.position.set(x+rnd(-.4,.4),y+rnd(-.3,.5),z+rnd(-.4,.4));m.scale.setScalar(rnd(0.5,1.4));m.castShadow=true;scene.add(m);
 const a=Math.random()*TAU,v=rnd(4,10);DEBRIS.push({m,vx:Math.cos(a)*v,vy:rnd(4,11),vz:Math.sin(a)*v,rx:rnd(-8,8),ry:rnd(-8,8),t:2.6});}}
function shockRing(x,z,col,size){ring(x,z,col,size||3,0.9);flash(x,gh(x,z)+1.5,z,col,4,0.6);}
/* ---------- les sorts ---------- */
function legTarget(el,range){const [dx,dz]=fwd();const T=castTarget(el,dx,dz,false);if(T&&T.ref&&T.kind==='crea')return T.ref;
 let best=null,bd=range||28;for(const e of ENT){if(e.kind!=='creature'||e.data.calme)continue;const vx=e.x-player.x,vz=e.z-player.z,d=Math.hypot(vx,vz);if(d>bd)continue;if((vx*dx+vz*dz)/d<0.35)continue;bd=d;best=e;}return best;}
function castDemanti(sp){const [dx,dz]=fwd(),e=legTarget('arcane',30),tp=new THREE.Vector3();player.H.p.tip.getWorldPosition(tp);
 const tx=e?e.x:player.x+dx*18,tz=e?e.z:player.z+dz*18,ty=e?gh(tx,tz)+(e.data.dragon?e.data.y:1.4):player.y+1.4;if(e)player.ry=Math.atan2(tx-player.x,tz-player.z);
 for(let i=0;i<=40;i++){const k=i/40;PA.emit(tp.x+(tx-tp.x)*k,tp.y+(ty-tp.y)*k,tp.z+(tz-tp.z)*k,rnd(-.3,.3),rnd(-.3,.3),rnd(-.3,.3),i%3?0xff7ae0:0xffffff,rnd(.3,.55),0.05,rnd(.25,.5),0,1);}
 flash(tp.x,tp.y,tp.z,0xff7ae0,3,0.4);sfx('cast','arcane','zone',player.x,player.z);
 setTimeout(()=>{SHAKE=Math.max(SHAKE,0.6);HITSTOP=Math.max(HITSTOP,0.08);shockRing(tx,tz,0xff7ae0,4);sfx('impact','arcane',tx,tz);
  for(let i=0;i<60;i++){const a=Math.random()*TAU,b=rnd(-0.4,1),v=rnd(3,9);PA.emit(tx,ty,tz,Math.cos(a)*v,b*v+2,Math.sin(a)*v,i%2?0xff7ae0:0xf3cf7a,rnd(.3,.6),0.05,rnd(.6,1.2),6,1);}
  if(e&&ENT.includes(e)){if(e.data.dragon)dragonHit(e,'arcane',14);else if(e.data.duel){demantiDuel(e,ty);}else{debris(e.x,ty,e.z,ELEM[e.data.look].c,14);floatAt(e.x,e.z,'DÉMANTIBULÉ !','#ff9ae8');killCreature(e);}}
  PROPS.forEach(p=>{const d=Math.hypot(p.x-tx,p.z-tz);if(p.dead<=0&&d<4.5){if(d<1.6&&p.type!=='rock'){debris(p.x,p.y,p.z,0x8a6a42,6);p.dead=40;p.g.visible=false;}else{p.vx+=(p.x-tx)/(d||1)*12;p.vz+=(p.z-tz)/(d||1)*12;p.vy=7;}}});},260);}
/* en duel, l'adversaire n'est pas détruit : le bouclier vole en éclats et il perd 30 % de ses PV (10 % les fois suivantes) */
function demantiDuel(e,ty){if(!DUEL||DUEL.e!==e||DUEL.phase!=='fight')return;if(DUEL.shield>0){DUEL.shield=0;floatAt(e.x,e.z,'Bouclier brisé !','#bfe8ff');}
 const first=!DUEL.demanti;DUEL.demanti=(DUEL.demanti||0)+1;const dmg=Math.round(Math.max(first?22:9,DUEL.omax*(first?0.3:0.1)));DUEL.ohp-=dmg;if(!first&&DUEL.demanti===2)say('🛡 '+esc(DUEL.d.name)+' a appris à parer le Démantibulus : il fait moins mal maintenant.','sys');debris(e.x,ty,e.z,ELEM[DUEL.d.el].c,10);floatAt(e.x,e.z,'DÉMANTIBULÉ ! -'+dmg,'#ff9ae8');
 const D=e.data;D.frozen=1.6;const d=Math.hypot(e.x-player.x,e.z-player.z)||1;D.kx+=(e.x-player.x)/d*9;D.kz+=(e.z-player.z)/d*9;if(D.H)D.H.cast=0;DUEL.wind=0;DUEL.wu=null;
 duelHUD();if(DUEL.ohp<=0)duelEnd(true);}
function castEtoiles(sp){const pts=[];ENT.forEach(e=>{if(e.kind==='creature'&&!e.data.calme&&Math.hypot(e.x-player.x,e.z-player.z)<18)pts.push([e.x,e.z]);});
 while(pts.length<10){const a=Math.random()*TAU,r=rnd(3,13);pts.push([player.x+Math.cos(a)*r,player.z+Math.sin(a)*r]);}
 pts.slice(0,12).forEach(([x,z],i)=>METEORS.push({x:x+rnd(-1,1),z:z+rnd(-1,1),t:-i*0.28,y0:28,o:null}));flash(player.x,player.y+3,player.z,0xfff1a0,3,1);say('🌠 Le ciel répond à ton appel…','sys');}
function castSouffle(sp){const [dx,dz]=fwd();const e=legTarget('feu',17);if(e)player.ry=Math.atan2(e.x-player.x,e.z-player.z);SHAKE=Math.max(SHAKE,0.25);BREATH.push({t:1.3,hit:{}});}
const BREATH=[];
function castGardien(sp){if(ALLY){ALLY.t=45;say('🌳 Ton gardien reprend des forces.','sys');return;}
 const [dx,dz]=fwd(),x=player.x+dx*2.2,z=player.z+dz*2.2;const g=new THREE.Group();g.position.set(x,gh(x,z),z);scene.add(g);const gl=glow(0x9cff8a,2.4,0.4);gl.position.y=1.2;g.add(gl);
 ALLY={g,x,z,t:45,atk:0,M:null,tgt:null};shockRing(x,z,0x6fe36f,3);for(let i=0;i<40;i++)PN.emit(x+rnd(-1,1),gh(x,z)+0.2,z+rnd(-1,1),rnd(-1,1),rnd(1,3),rnd(-1,1),0x4a3a22,0.3,0.6,rnd(.8,1.4),6,0.5,0.9);
 say('🌳 Un <b>arbre-gardien</b> sort de terre pour combattre à tes côtés !','gm');
 if(typeof creaTpl==='function'&&!MDL.failed)creaTpl('arbre').then(T=>{if(!ALLY||ALLY.g!==g)return;const r=THREE.SkeletonUtils.clone(T.scene);r.traverse(o=>{if(o.isMesh){o.material=o.material.clone();if(o.material.map){o.material.map.encoding=THREE.LinearEncoding;}o.material.color.setHex(0xc8ffb8);o.castShadow=true;o.frustumCulled=false;}});
  r.scale.setScalar(1.9/T.h);g.add(r);const mx=new THREE.AnimationMixer(r),A={};for(const n in T.clips)A[n]=mx.clipAction(T.clips[n]);ALLY.M={r,mx,A,cur:null};allyPlay('Idle');}).catch(()=>{});}
function allyPlay(n,once){const M=ALLY&&ALLY.M;if(!M||!M.A[n])return;if(M.cur===n&&!once)return;const a=M.A[n],o=M.cur&&M.A[M.cur];a.reset();if(once){a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=false;}a.play();if(o&&o!==a)o.crossFadeTo(a,0.15,false);M.cur=n;}
{const _t=doTrait;doTrait=function(sp){if(sp&&sp.special==='demantibulus')return castDemanti(sp);if(sp&&sp.special==='souffle')return castSouffle(sp);return _t.apply(this,arguments);};}
{const _z=doZone;doZone=function(sp){if(sp&&sp.special==='etoiles')return castEtoiles(sp);return _z.apply(this,arguments);};}
{const _u=doUtil;doUtil=function(sp){if(sp&&sp.special==='gardien')return castGardien(sp);return _u.apply(this,arguments);};}
/* ---------- grimoires légendaires (pupitres) ---------- */
const LEG_PUP=[];
function buildLegendes(){const C=LANDES.c,P=[['demantibulus',C.x-50,C.z+95],['etoiles',C.x+85,C.z-105],['gardien',BQ.x+3,BQ.z-3]];dkMats();
 P.forEach(([k,x,z])=>{const y=gh(x,z);dkAt(x,z,0);dCyl('stone',0x8f8a80,0.45,0.55,0.25,0,0.12,0,10);dCyl('stone',0xa7a297,0.22,0.3,1.0,0,0.75,0,10);dBox('stone',0x8f8a80,0.8,0.12,0.6,0,1.3,0,0,-0.35);
  const book=new THREE.Group();book.position.set(x,y+1.75,z);const cov=mat(0xd8a830,{emissive:0x8a5a10,emissiveIntensity:0.6,metalness:0.4,roughness:0.4});
  [-1,1].forEach(s=>{const c=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.04,0.46),cov);c.position.x=s*0.17;c.rotation.z=-s*0.18;book.add(c);});const pg=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.05,0.42),mat(0xfff4d8,{emissive:0xffe8a0,emissiveIntensity:0.5}));pg.position.y=0.03;book.add(pg);
  const gl=glow(0xffd27a,2.6,0.8);book.add(gl);book.userData.dyn=true;scene.add(book);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,60,10,1,true),basic(0xffd27a,{transparent:true,opacity:0.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));beam.position.set(x,y+30,z);scene.add(beam);
  const vis=()=>k!=='etoiles'||nightK>0.55;
  LEG_PUP.push({k,x,z,y,book,beam,vis});
  station({x,z,reach:2.4,hint:()=>legHas(k)?null:vis()?'Ouvrir le grimoire légendaire':(k==='etoiles'&&Math.hypot(player.x-x,player.z-z)<4?'Le pupitre est vide… reviens sous les étoiles':null),act:()=>{if(legHas(k)||!vis())return;legLearn(k);}});});}
{const _b=buildLandes;buildLandes=function(){const r=_b.apply(this,arguments);buildLegendes();return r;};}
// le Grimoire montre la série
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);if(bookTab!=='sorts')return;const n=Object.keys(LEG_SP).filter(legHas).length;
  let h='<div class="it" style="border-color:rgba(243,207,122,.6)"><h4>✦ Sorts légendaires<span class="badge" style="color:var(--gold)">'+n+'/4</span></h4>';
  for(const k in LEG_SP){const L=LEG_SP[k],ok=legHas(k);h+='<div style="margin:5px 0;'+(ok?'':'opacity:.75')+'">'+(ok?'✦ <b>'+esc(L.name)+'</b> <span class="mu">— '+esc(L.desc)+'</span>':'❔ <span class="mu">'+esc(L.indice)+'</span>')+'</div>';}
  const b=$('#book-body'),d=document.createElement('div');d.innerHTML=h+'</div>';b.insertBefore(d.firstChild,b.firstChild);};}
/* ================= IGNIVOR, LA VOUIVRE ANCESTRALE ================= */
const BOSS={on:false,e:null,php:100,pmax:100,at:0,n:0,fb:[],phase:1,calmT:0,minions:false,hurtT:0};
const nidXZ=()=>({x:LANDES.c.x+120,z:LANDES.c.z+15});
function dragonSpawn(){if(BOSS.e&&ENT.includes(BOSS.e))return;if(S.dragonMort&&S.day<S.dragonMort+3)return;const N=nidXZ();
 const e=spawnCreatureAt(N.x,N.z,'Ignivor, la vouivre ancestrale','glace','feu',128,{dragon:true,scale:3.2,hpMax:128});e.ttl=Infinity;e.data.loc='landes_nid';BOSS.e=e;}
function bossHud(show){let d=$('#bossbar');if(!d){d=document.createElement('div');d.id='bossbar';
  d.innerHTML='<div>🐉 Ignivor, la vouivre ancestrale</div><div style="height:9px;background:rgba(0,0,0,.5);border-radius:5px;overflow:hidden;margin:3px 0 6px"><i id="bb-d" style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#ff5a1e,#ffb43a)"></i></div><div style="height:7px;background:rgba(0,0,0,.5);border-radius:4px;overflow:hidden;width:70%;margin:0 auto"><i id="bb-p" style="display:block;height:100%;width:100%;background:linear-gradient(90deg,#4ad06a,#b8ff8a)"></i></div><div id="bb-t" style="margin-top:2px;font-size:11px"></div>';document.body.appendChild(d);}
 d.style.display=show?'block':'none';document.body.classList.toggle('boss',!!show);}
function bossHudUpd(){const e=BOSS.e;if(!e)return;$('#bb-d').style.width=Math.max(0,e.data.hp/e.data.hpMax*100)+'%';$('#bb-p').style.width=Math.max(0,BOSS.php/BOSS.pmax*100)+'%';$('#bb-t').textContent='Toi : '+Math.ceil(BOSS.php)+' PV · insensible au Feu, craint la Glace';}
function dragonStart(){if(BOSS.on)return;BOSS.on=true;BOSS.pmax=100+2*Math.min(50,lvl());BOSS.php=BOSS.pmax;BOSS.at=2;BOSS.n=0;BOSS.phase=1;BOSS.minions=false;
 if(FLY.on)dismount(true);banner('Ignivor s’éveille !','La vouivre ancestrale défend son nid');sfx('gong');SHAKE=Math.max(SHAKE,0.8);bossHud(true);bossHudUpd();
 say('🐉 <b>Ignivor</b> déploie ses ailes ! Elle est <b>insensible au Feu</b> et craint la <b>Glace</b>. Esquive ses boules de feu en bougeant.','gm');}
function dragonReset(){BOSS.on=false;bossHud(false);BOSS.fb.forEach(f=>scene.remove(f.o));BOSS.fb=[];const e=BOSS.e;if(e&&ENT.includes(e)){e.data.hp=e.data.hpMax;}}
function hurtPlayer(n){if(!BOSS.on)return;if(BUFF.invis)n*=0.5;BOSS.php-=n;BOSS.hurtT=4;sfx('hurt');SHAKE=Math.max(SHAKE,0.35);const hv=$('#hurt');hv.style.opacity=0.85;setTimeout(()=>hv.style.opacity=0,200);bossHudUpd();
 if(BOSS.php<=0){dragonReset();fade(()=>{const L=LOCBY.landes_camp;player.x=L.spot.x;player.z=L.spot.z;player.y=gh(player.x,player.z);player.vx=player.vz=player.vy=0;
  say('🔥 Tu te réveilles au Campement des Voyageurs, un peu roussi. Ignivor a repris des forces… Prépare des sorts de Glace et retente ta chance !','gm');});}}
function dragonHit(e,el,amount){if(!BOSS.on)dragonStart();const D=e.data;if(el==='feu'){if(!D.wm||performance.now()-D.wm>2500){D.wm=performance.now();say('🔥 Ignivor absorbe le feu ! Essaie la <b>Glace</b>.','sys');}burst(e.x,gh(e.x,e.z)+D.y,e.z,0xff7a2e,8,3);return;}
 const dmg=amount||(el==='glace'?9:4.5);D.hp-=dmg;floatAt(e.x,e.z,(el==='glace'?'❄ ':'')+'-'+Math.round(dmg),el==='glace'?'#bfefff':'#ffffff');burst(e.x,gh(e.x,e.z)+D.y,e.z,ELEM[el].c,16,5);HITSTOP=Math.max(HITSTOP,0.03);
 bossHudUpd();if(D.hp<=0)dragonEnd(e);}
function dragonEnd(e){if(!ENT.includes(e))return;BOSS.on=false;bossHud(false);BOSS.fb.forEach(f=>scene.remove(f.o));BOSS.fb=[];const p={x:e.x,y:gh(e.x,e.z)+e.data.y-2,z:e.z};S.dragonMort=S.day;
 SHAKE=Math.max(SHAKE,1.2);SLOMO=1.6;debris(p.x,p.y+2,p.z,0xc84a1a,26);shockRing(e.x,e.z,0xffb43a,6);for(let i=0;i<120;i++){const a=Math.random()*TAU,b=rnd(-0.3,1),v=rnd(3,12);PA.emit(p.x,p.y+2,p.z,Math.cos(a)*v,b*v+3,Math.sin(a)*v,i%2?0xffb43a:0xff5a1e,rnd(.4,.8),0.05,rnd(1,2),4,0.8);}
 removeEnt(e);BOSS.e=null;sfx('win');banner('Ignivor est vaincue !','La vouivre ancestrale s’effondre dans un dernier grondement');gainXP(400);addItem('essence',5);chron('Ignivor, la vouivre ancestrale, vaincue.');karma(3);
 setTimeout(()=>legLearn('souffle'),2200);save();}
{const _h=hurtCreature;hurtCreature=function(e,el,x,z){if(e&&e.data&&e.data.dragon)return dragonHit(e,el);return _h.apply(this,arguments);};}
{const _k=killCreature;killCreature=function(e){if(e&&e.data&&e.data.dragon)return dragonEnd(e);return _k.apply(this,arguments);};}
// comportement : vole en cercle au-dessus du nid ; en combat, boules de feu, souffle, diablotins
function dragonAI(e,dt){const D=e.data,N=nidXZ(),t=(e.t||0);const dp=Math.hypot(player.x-N.x,player.z-N.z);
 if(!BOSS.on&&dp<24&&!FLY.on)dragonStart();if(BOSS.on&&dp>48){dragonReset();say('🐉 Ignivor regagne son nid. Elle t’attendra…','sys');}
 const a=t*(BOSS.on?0.55:0.25),R=BOSS.on?11:7,x=N.x+Math.cos(a)*R,z=N.z+Math.sin(a)*R;e.x+=(x-e.x)*Math.min(1,dt*2);e.z+=(z-e.z)*Math.min(1,dt*2);
 const gy=gh(e.x,e.z),cy=(BOSS.on?6.5:4.5)+Math.sin(t*1.7)*0.6;D.y=cy;e.obj.position.set(e.x,gy+cy-4.6,e.z);const hy=gy+cy; /* centre du corps = cible des sorts */e.obj.rotation.y=BOSS.on?Math.atan2(player.x-e.x,player.z-e.z):a+Math.PI/2;
 if(!BOSS.on){if(BOSS.php<BOSS.pmax)BOSS.php=Math.min(BOSS.pmax,BOSS.php+dt*10);return;}
 if(D.hp<D.hpMax*0.5&&BOSS.phase===1){BOSS.phase=2;say('🐉 Ignivor rugit et appelle ses diablotins !','gm');sfx('gong');for(let i=0;i<3;i++){const b=Math.random()*TAU;spawnCreatureAt(N.x+Math.cos(b)*6,N.z+Math.sin(b)*6,'Diablotins verts','eau','feu',2);}}
 BOSS.hurtT-=dt;if(BOSS.hurtT<0)BOSS.php=Math.min(BOSS.pmax,BOSS.php+dt*2);
 BOSS.at-=dt;if(BOSS.at<=0){BOSS.n++;BOSS.at=BOSS.phase===2?1.9:2.6;
  if(BOSS.n%4===0){BREATH.push({t:1.4,hit:{},dragon:e});say('🔥 Ignivor prend son souffle… écarte-toi !','sys');}
  else{const k=BOSS.phase===2?5:3;for(let i=0;i<k;i++){const lead=0.5,px=player.x+player.vx*lead+rnd(-1.6,1.6)*(i?1:0),pz=player.z+player.vz*lead+rnd(-1.6,1.6)*(i?1:0),py=player.y+1;
    const ox=e.x,oy=hy+0.5,oz=e.z,L=Math.hypot(px-ox,pz-oz,py-oy)||1,sp=15;const o=glow(0xff7a2e,2.2,0.9);o.position.set(ox,oy,oz);scene.add(o);
    BOSS.fb.push({o,x:ox,y:oy,z:oz,vx:(px-ox)/L*sp,vy:(py-oy)/L*sp,vz:(pz-oz)/L*sp,life:3,dl:i*0.12});}sfx('cast','feu','trait',e.x,e.z);}}}
function legTick(dt){if(!started)return;
 for(let i=DEBRIS.length-1;i>=0;i--){const d=DEBRIS[i];d.t-=dt;d.vy-=18*dt;d.m.position.x+=d.vx*dt;d.m.position.y+=d.vy*dt;d.m.position.z+=d.vz*dt;d.m.rotation.x+=d.rx*dt;d.m.rotation.y+=d.ry*dt;
  const g=gh(d.m.position.x,d.m.position.z);if(d.m.position.y<g+0.1){d.m.position.y=g+0.1;d.vy*=-0.35;d.vx*=0.6;d.vz*=0.6;}if(d.t<0.6)d.m.scale.multiplyScalar(1-dt*3);if(d.t<=0){scene.remove(d.m);DEBRIS.splice(i,1);}}
 for(let i=METEORS.length-1;i>=0;i--){const M=METEORS[i];M.t+=dt;if(M.t<0)continue;const k=Math.min(1,M.t/0.9),gy=gh(M.x,M.z),y=gy+M.y0*(1-k);
  if(!M.o){M.o=glow(0xfff1a0,3,1);scene.add(M.o);}M.o.position.set(M.x+(1-k)*6,y,M.z-(1-k)*3);for(let j=0;j<3;j++)PA.emit(M.o.position.x,M.o.position.y,M.o.position.z,rnd(-.4,.4),rnd(.5,1.5),rnd(-.4,.4),j?0xffd27a:0xffffff,rnd(.5,.9),0.05,rnd(.3,.6),0,1);
  if(k>=1){scene.remove(M.o);METEORS.splice(i,1);shockRing(M.x,M.z,0xfff1a0,2.6);SHAKE=Math.max(SHAKE,0.25);sfx('impact','lumiere',M.x,M.z);for(let j=0;j<30;j++){const a=Math.random()*TAU,v=rnd(2,7);PA.emit(M.x,gy+0.4,M.z,Math.cos(a)*v,rnd(2,6),Math.sin(a)*v,j%2?0xfff1a0:0xffb43a,rnd(.3,.6),0.05,rnd(.5,1),8,1);}
   ENT.slice().forEach(e=>{if(e.kind!=='creature'||e.data.calme)return;const d=Math.hypot(e.x-M.x,e.z-M.z);if(e.data.dragon){if(d<6)dragonHit(e,'lumiere',6);}else if(d<3.4){hurtCreature(e,'lumiere',M.x,M.z);if(ENT.includes(e))hurtCreature(e,'lumiere',M.x,M.z);}});
   if(typeof elemHit==='function')elemHit('lumiere',M.x,M.z,3);}}
 // souffles de feu (le joueur ou Ignivor)
 for(let i=BREATH.length-1;i>=0;i--){const B=BREATH[i];B.t-=dt;const src=B.dragon&&ENT.includes(B.dragon)?B.dragon:null;
  const ox=src?src.x:player.x,oz=src?src.z:player.z,oy=src?gh(src.x,src.z)+src.data.y-0.6:player.y+1.4,yaw=src?Math.atan2(player.x-ox,player.z-oz):player.ry,dx=Math.sin(yaw),dz=Math.cos(yaw),len=src?13:17,spr=src?0.32:0.6;
  for(let j=0;j<(src?6:11);j++){const s=rnd(0.5,1),sp=rnd(-spr,spr),vx=(dx*Math.cos(sp)-dz*Math.sin(sp))*len*1.6,vz=(dz*Math.cos(sp)+dx*Math.sin(sp))*len*1.6;PA.emit(ox+dx,oy,oz+dz,vx*s,src?-3:rnd(-0.5,1),vz*s,Math.random()<0.5?0xff6a1e:0xffc040,rnd(.5,1),0.2,rnd(.4,.65),-1,0.6);}
  if(src){const vx=player.x-ox,vz=player.z-oz,d=Math.hypot(vx,vz),c=(vx*dx+vz*dz)/(d||1);if(d<len&&c>0.88)hurtPlayer(16*dt);}
  else ENT.slice().forEach(e=>{if(e.kind!=='creature'||B.hit[e.id]>=2)return;const vx=e.x-ox,vz=e.z-oz,d=Math.hypot(vx,vz),c=(vx*dx+vz*dz)/(d||1);if(d<len&&(c>0.6||d<2.5)&&Math.random()<dt*4){B.hit[e.id]=(B.hit[e.id]||0)+1;hurtCreature(e,'feu',ox,oz);}});
  if(!src&&Math.random()<dt*3&&typeof elemHit==='function')elemHit('feu',ox+dx*rnd(3,len),oz+dz*rnd(3,len),2);
  if(B.t<=0)BREATH.splice(i,1);}
 // boules de feu d'Ignivor
 for(let i=BOSS.fb.length-1;i>=0;i--){const f=BOSS.fb[i];if(f.dl>0){f.dl-=dt;continue;}f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.o.position.set(f.x,f.y,f.z);fireAt(f.x,f.y,f.z,0.45,1);
  const hitP=Math.hypot(f.x-player.x,f.z-player.z)<1.2&&Math.abs(f.y-(player.y+1))<1.4,g=gh(f.x,f.z);
  if(hitP||f.y<g+0.2||f.life<=0){if(hitP)hurtPlayer(11);else if(Math.hypot(f.x-player.x,f.z-player.z)<2.4)hurtPlayer(5);burst(f.x,Math.max(g,f.y),f.z,0xff7a2e,14,4);ring(f.x,f.z,0xff7a2e,1.6,0.5);scene.remove(f.o);BOSS.fb.splice(i,1);}}
 // l'arbre-gardien
 if(ALLY){const A=ALLY;A.t-=dt;if(A.t<=0||S.zone!=='monde'){shockRing(A.x,A.z,0x6fe36f,2);scene.remove(A.g);ALLY=null;say('🌳 Ton gardien retourne sous la terre.','sys');}
  else{A.atk-=dt;if(!A.tgt||!ENT.includes(A.tgt)||Math.hypot(A.tgt.x-A.x,A.tgt.z-A.z)>16){A.tgt=null;let bd=12;for(const e of ENT){if(e.kind!=='creature'||e.data.calme||e.data.duel)continue;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;A.tgt=e;}}}
   const T=A.tgt,gx=T?T.x:player.x-Math.sin(player.ry)*2.2+Math.cos(player.ry)*1.5,gz=T?T.z:player.z-Math.cos(player.ry)*2.2-Math.sin(player.ry)*1.5,dx=gx-A.x,dz=gz-A.z,d=Math.hypot(dx,dz),stop=T?(T.data.dragon?6:1.6):0.6;
   if(d>stop){const sp=Math.min(d-stop,(T?5.5:6.5)*dt);A.x+=dx/d*sp;A.z+=dz/d*sp;allyPlay('Walk');}else if(!T)allyPlay('Idle');
   if(d>0.1)A.g.rotation.y=Math.atan2(dx,dz);A.g.position.set(A.x,gh(A.x,A.z),A.z);
   if(T&&d<=stop+0.4&&A.atk<=0){A.atk=1.1;allyPlay('Bite_Front',true);setTimeout(()=>{if(ALLY&&ALLY.M)allyPlay('Walk');},600);
    if(T.data.dragon)dragonHit(T,'nature',4);else hurtCreature(T,'nature',A.x,A.z);for(let j=0;j<12;j++)PN.emit(T.x+rnd(-.5,.5),gh(T.x,T.z)+0.3,T.z+rnd(-.5,.5),rnd(-1,1),rnd(1,3),rnd(-1,1),0x3f8f2a,0.25,0.15,0.7,6,0.5,1);}
   if(A.M)A.M.mx.update(dt);if(Math.random()<dt*4)PA.emit(A.x+rnd(-.6,.6),gh(A.x,A.z)+rnd(0.5,2),A.z+rnd(-.6,.6),0,0.5,0,0x9cff8a,0.2,0.03,0.8,0,0);}}
 // pupitres légendaires : livre qui flotte, rayon visible de loin
 for(const P of LEG_PUP){const v=!legHas(P.k)&&P.vis();P.book.visible=v;P.beam.visible=v;if(v){P.book.rotation.y+=dt*0.8;P.book.position.y=P.y+1.75+Math.sin(performance.now()/500)*0.08;if(Math.random()<dt*6)PA.emit(P.x+rnd(-.3,.3),P.y+1.8,P.z+rnd(-.3,.3),0,rnd(.4,1),0,0xffd27a,0.2,0.03,1,0,0);}}
 // Ignivor vit au nid quand le joueur est dans les Landes
 if(inLandes()&&(!BOSS.e||!ENT.includes(BOSS.e)))dragonSpawn();
 if(BOSS.on&&(!BOSS.e||!ENT.includes(BOSS.e)))dragonReset();}
{const _w=world4Tick;world4Tick=function(dt){try{legTick(dt);}catch(err){console.warn(err);}return _w.apply(this,arguments);};}
// la petite vouivre ordinaire du nid laisse la place à Ignivor
{const i=LANDES_POP.findIndex(g=>/Vouivre/.test(g.n));if(i>=0)LANDES_POP.splice(i,1,{n:'Diablotins verts',w:'eau',l:'feu',c:[104,40],r:8,k:2});}
// musique de combat pendant le boss
{const _m=smpMood;smpMood=function(){if(BOSS.on)return 'duel';return _m.apply(this,arguments);};}
// le MJ connaît la série légendaire et le dragon
{const _bp=buildPrompt;buildPrompt=function(){return _bp.apply(this,arguments).replace(RULES,RULES+'\nSorts légendaires (série rare, 4) : Démantibulus (Plateau des Géants), Pluie d’étoiles (sommet du Pic de Givrecorne, la nuit), Appel du gardien (Bosquet des Murmures), Souffle du dragon (en battant Ignivor). Ignivor, la vouivre ancestrale, est un dragon qui dort au Nid de la Vouivre (insensible au feu, craint la glace). Tu peux y faire allusion par des rumeurs et des indices.');};}
