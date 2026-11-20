/* ================= ÉVÉNEMENTS SURPRISES =================
   Toutes les 3 à 5 minutes (dans le monde, hors combat spécial), un événement peut surgir près du joueur :
   - le jour : la Caravane attaquée (défendre une charrette contre des pillards) ou, dans la vallée, l'Invasion de la
     Faille à Brumepont (3 vagues de rôdeurs autour d'un portail) ;
   - la nuit : le Marchand de la nuit (échange essences et cristaux contre potions, parchemins, carte au trésor).
   Un rayon de lumière coloré signale l'endroit. Bandeau (#wave) pendant les défenses. */
const SURP={cur:null,next:120};
function evtBeam(x,z,col){const y=gh(x,z),m=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,80,10,1,true),basic(col,{transparent:true,opacity:0.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));m.position.set(x,y+40,z);scene.add(m);return m;}
function evtSpot(minD,maxD){const L=LOCS.filter(l=>regionOf(l.x)===regionOf(player.x)&&Math.hypot(l.x-player.x,l.z-player.z)>minD&&Math.hypot(l.x-player.x,l.z-player.z)<maxD&&l.id!=='lac'&&l.id!=='landes_lac');
 if(L.length){const l=pick(L);const p=freePoint(l,7);return {x:p.x,z:p.z,name:l.name};}
 for(let k=0;k<30;k++){const a=Math.random()*TAU,r=rnd(minD,maxD),x=player.x+Math.cos(a)*r,z=player.z+Math.sin(a)*r;if((x>4000?terIn(x,z)&&gh(x,z)>0.6:x>1500?Math.hypot(x-2000,z)<150:Math.hypot(x,z)<84)&&!inWater({x,z})&&isFree({x,z},1.5))return {x,z,name:'non loin d’ici'};}return null;}
const evtFoes=()=>SURP.cur?SURP.cur.foes.filter(e=>ENT.includes(e)):[];
function evtFoe(x,z,name,look,weak,hp){const e=spawnCreatureAt(x,z,name,weak,look,hp);e.ttl=Infinity;e.data.evt=1;return e;}
function evtEnd(){const E=SURP.cur;if(!E)return;if(E.beam)scene.remove(E.beam);if(E.o)scene.remove(E.o);if(E.st){const j=STATIONS.indexOf(E.st);if(j>=0)STATIONS.splice(j,1);}if(E.col){const j=COLS.indexOf(E.col);if(j>=0)COLS.splice(j,1);}if(E.hud)hud8(false);SURP.cur=null;}
/* ---------- la caravane attaquée ---------- */
function evCaravane(){const p=evtSpot(28,75);if(!p)return false;const y=gh(p.x,p.z),g=new THREE.Group();g.position.set(p.x,y,p.z);g.rotation.y=Math.random()*TAU;const wd=mat(0x7a5232),cl=mat(0xe8dcc0,{side:THREE.DoubleSide});
 const body=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.8,1.4),wd);body.position.y=0.9;body.castShadow=true;g.add(body);const cov=new THREE.Mesh(new THREE.CylinderGeometry(0.85,0.85,2.4,12,1,true,0,Math.PI),cl);cov.rotation.z=Math.PI/2;cov.position.y=1.3;g.add(cov);
 for(const [wx,wz] of [[-0.8,0.75],[0.8,0.75],[-0.8,-0.75],[0.8,-0.75]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.12,12),wd);w.rotation.x=Math.PI/2;w.position.set(wx,0.45,wz);g.add(w);}
 const lan=glow(0xffc070,1.6,0.8);lan.position.set(1.3,1.6,0);g.add(lan);scene.add(g);
 const col={x:p.x,z:p.z,r:1.4,h:y+1.7};COLS.push(col);const lv=lvl(),n=4+(lv>10?2:0)+(p.x>1500?1:0),looks=['ombre','feu','vent','arcane'],look=pick(looks),weak={ombre:'lumiere',feu:'eau',vent:'glace',arcane:'ombre'}[look];
 const foes=[];for(let i=0;i<n;i++){const a=i/n*TAU,x=p.x+Math.cos(a)*9,z=p.z+Math.sin(a)*9;foes.push(evtFoe(x,z,'Pillards '+(look==='ombre'?'de l’ombre':look==='feu'?'des braises':look==='vent'?'des bourrasques':'des arcanes'),look,weak,p.x>1500?3:2));}
 SURP.cur={k:'caravane',x:p.x,z:p.z,o:g,col,foes,hp:100,t:120,beam:evtBeam(p.x,p.z,0xffc070),hud:true};hud8(true,true);
 banner('Une caravane est attaquée !','Défends-la, '+p.name);say('🛒 Des pillards attaquent une <b>caravane</b> '+(p.name==='non loin d’ici'?'non loin d’ici':'près de '+esc(p.name))+' ! Suis le rayon orangé. Ils craignent '+deEl(weak)+'.','gm');sfx('gong');return true;}
function caravaneTick(E,dt){E.t-=dt;const foes=evtFoes();
 for(const e of foes){const dp=Math.hypot(player.x-e.x,player.z-e.z);if(dp>6&&!(e.data.frozen>0)&&!(e.data.charmed>0)){e.data.tx=E.x+rnd(-1,1);e.data.tz=E.z+rnd(-1,1);e.data.hx=E.x;e.data.hz=E.z;}if(Math.hypot(e.x-E.x,e.z-E.z)<3&&!(e.data.frozen>0)&&!(e.data.charmed>0)){E.hp-=3*dt;if(Math.random()<dt*4)burst(E.x,gh(E.x,E.z)+1,E.z,0xff9a5a,6,2);}}
 $('#w-t').textContent='🛒 Caravane : '+foes.length+' pillard'+(foes.length>1?'s':'')+' · '+Math.ceil(E.t)+' s';$('#w-hpw i').style.width=clamp(E.hp,0,100)+'%';
 if(!foes.length){evtEnd();const xp=80;gainXP(xp);addItem('essence',3);const pk=pick(['soin','puissance','mana','celerite']);S.inv['p_'+pk]=(S.inv['p_'+pk]||0)+1;karma(3);S.evts=(S.evts||0)+1;sfx('win');
  banner('Caravane sauvée !','+'+xp+' XP · 3 essences · '+POTIONS[pk].n);say('🛒 Les voyageurs te remercient et t’offrent une <b>'+esc(POTIONS[pk].n)+'</b> et 3 essences.','gm');chron('J’ai sauvé une caravane attaquée.');save();return;}
 if(E.hp<=0||E.t<=0){const x=E.x,z=E.z;evtEnd();for(let i=0;i<40;i++)fireAt(x+rnd(-1,1),gh(x,z)+rnd(0.5,1.5),z+rnd(-1,1),0.8,1);say('🛒 La caravane est '+(E.hp<=0?'pillée':'partie sans toi')+'… Les pillards rôdent encore.','sys');}}
/* ---------- l'invasion de la Faille à Brumepont ---------- */
function evInvasion(){const L=LOCBY.village;if(player.x>1500||lvl()<3||Math.hypot(L.x-player.x,L.z-player.z)>110)return false;const p=freePoint(L,4),y=gh(p.x,p.z);
 const g=new THREE.Group();g.position.set(p.x,y+2.2,p.z);const ring1=new THREE.Mesh(new THREE.TorusGeometry(1.8,0.18,10,40),basic(0xb48cff,{transparent:true,opacity:0.9}));g.add(ring1);const core=new THREE.Mesh(new THREE.CircleGeometry(1.7,32),basic(0x1a0830,{side:THREE.DoubleSide}));g.add(core);const gl=glow(0xb48cff,6,0.7);g.add(gl);scene.add(g);
 SURP.cur={k:'invasion',x:p.x,z:p.z,o:g,ring:ring1,foes:[],wave:0,waves:3,wt:2,t:200,beam:evtBeam(p.x,p.z,0xb48cff),hud:true};hud8(true,false);
 banner('Invasion de la Faille !','Une brèche s’ouvre à Brumepont');say('🌀 Une <b>brèche de la Faille</b> s’est ouverte au Village de Brumepont ! Trois vagues de rôdeurs vont en sortir : repousse-les.','gm');sfx('gong');SHAKE=Math.max(SHAKE,0.5);return true;}
function invasionTick(E,dt){E.t-=dt;E.o.rotation.y+=dt*0.6;E.ring.rotation.z+=dt*2;if(Math.random()<dt*20)PN.emit(E.x+rnd(-1.5,1.5),gh(E.x,E.z)+rnd(1,3.5),E.z+rnd(-1.5,1.5),rnd(-1,1),rnd(0,1),rnd(-1,1),0x3a1a6a,0.5,0.6,0.8,0,1,0.85);
 const foes=evtFoes();if(!foes.length){E.wt-=dt;if(E.wt<=0){if(E.wave>=E.waves){const x=E.x,z=E.z;evtEnd();shockRing(x,z,0xb48cff,6);const xp=120;gainXP(xp);addItem('cristal',3);karma(5);S.evts=(S.evts||0)+1;const rel=Math.random()<0.35;if(rel)S.relics=(S.relics||0)+1;sfx('win');
    banner('La brèche se referme !','+'+xp+' XP · 3 cristaux'+(rel?' · +1 point de talent':''));say('🌀 Brumepont est sauvé ! Les villageois sortent de chez eux pour t’acclamer.'+(rel?' Un <b>fragment de Faille</b> t’offre un point de talent.':''),'gm');chron('J’ai repoussé une invasion de la Faille à Brumepont.');save();return;}
   E.wave++;E.wt=3;const n=2+E.wave+(lvl()>12?1:0),looks=['arcane','ombre'];for(let i=0;i<n;i++){const a=Math.random()*TAU,look=pick(looks);E.foes.push(evtFoe(E.x+Math.cos(a)*2.5,E.z+Math.sin(a)*2.5,'Rôdeurs de la Faille',look==='arcane'?'ombre':'lumiere',look,2+(E.wave>=3?1:0)));}
   shockRing(E.x,E.z,0xb48cff,4);sfx('cast','arcane','zone',E.x,E.z);say('🌀 Vague '+E.wave+'/'+E.waves+' !','sys');}}
 $('#w-t').textContent='🌀 Invasion : vague '+Math.max(1,E.wave)+'/'+E.waves+' · '+foes.length+' rôdeur'+(foes.length>1?'s':'')+' · '+Math.ceil(E.t)+' s';
 if(E.t<=0){evtEnd();say('🌀 La brèche se referme d’elle-même… mais les villageois ont dû fuir.','sys');}}
/* ---------- le marchand de la nuit ---------- */
const SHOP=[['p_soin','🧪 Potion de soin',{essence:1,cristal:1}],['p_puissance','🔥 Élixir de puissance',{essence:2}],['p_invis','🌑 Philtre d’invisibilité',{essence:1,cristal:1}],['p_mana','💧 Potion de mana',{cristal:1}],
 ['parchemin','📜 Parchemin mystère (sort nouveau ou rang en plus)',{essence:3,cristal:2}],['tresor','🗺 Carte au trésor (coffre ancien, +1 point de talent)',{essence:4,cristal:3}]];
const costTxt=c=>Object.entries(c).map(([k,n])=>n+' '+(k==='essence'?'essence'+(n>1?'s':''):'cristal'+(n>1?'ux':''))).join(' + ');
const canBuy=c=>Object.entries(c).every(([k,n])=>(S.inv[k]||0)>=n);
function shopMenu(){openPick('🏮 Le Marchand de la nuit','« Des choses rares, pour qui paie en essences et en cristaux… Je pars avant l’aube. » (Tu as '+(S.inv.essence||0)+' essences, '+(S.inv.cristal||0)+' cristaux.)',
 SHOP.filter(([id])=>id!=='tresor'||!S.trCarte||S.trCarte<S.day).map(([id,n,c])=>({t:n,s:costTxt(c),off:!canBuy(c),fn:()=>{for(const k in c)S.inv[k]-=c[k];sfx('pick');
  if(id.startsWith('p_'))S.inv[id]=(S.inv[id]||0)+1;else if(id==='parchemin'){$('#pick').classList.add('hidden');learnSpell(genSpell());}
  else if(id==='tresor'){S.trCarte=S.day;const L=pick(LOCS.filter(l=>regionOf(l.x)===regionOf(player.x)&&l.id!=='lac'&&l.id!=='landes_lac'));spawnChest(L.id,null,true);say('🗺 La carte montre un coffre ancien près de <b>'+esc(L.name)+'</b>.','gm');}
  say('🏮 Marché conclu.','sys');save();if(!$('#pick').classList.contains('hidden'))shopMenu();}})));}
function evMarchand(){if(S.marchand===nightId())return false;const p=evtSpot(14,38);if(!p)return false;S.marchand=nightId();const y=gh(p.x,p.z),g=new THREE.Group();g.position.set(p.x,y,p.z);
 const tent=new THREE.Mesh(new THREE.ConeGeometry(1.8,2.6,8),mat(0x5a2a6a,{flatShading:true}));tent.position.y=1.3;tent.castShadow=true;g.add(tent);const tb=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.8,0.8),mat(0x6a4a2a));tb.position.set(0,0.4,1.8);g.add(tb);
 for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),mat([0xff5a6a,0x4a7dff,0x8a5ad0][i],{emissive:[0xff5a6a,0x4a7dff,0x8a5ad0][i],emissiveIntensity:0.6}));b.position.set(-0.5+i*0.5,0.9,1.8);g.add(b);}
 const lan=glow(0xffb050,2.4,0.9);lan.position.set(1.2,2.2,1.4);g.add(lan);scene.add(g);
 const st=station({x:p.x,z:p.z+1.8,reach:2.6,hint:()=>'Marchander',act:()=>shopMenu()});SURP.cur={k:'marchand',x:p.x,z:p.z,o:g,st,beam:evtBeam(p.x,p.z,0xffb050)};
 say('🏮 Une lanterne s’allume '+(p.name==='non loin d’ici'?'non loin d’ici':'près de '+esc(p.name))+' : un <b>Marchand de la nuit</b> a planté sa tente. Il accepte essences et cristaux.','gm');sfx('learn');return true;}
function marchandTick(E){if(S.time>4.5*60&&S.time<20*60){evtEnd();say('🏮 Le Marchand de la nuit a replié sa tente.','sys');}}
/* ---------- chef d'orchestre ---------- */
function evtTick(dt){if(!started)return;const E=SURP.cur;
 if(E){if(S.zone!=='monde'){evtEnd();return;}if(E.k==='caravane')caravaneTick(E,dt);else if(E.k==='invasion')invasionTick(E,dt);else marchandTick(E);return;}
 if(S.zone!=='monde'||BOSS.on||DUEL||WAVE||RACE.on||CRACE.on||lvl()<2)return;SURP.next-=dt;if(SURP.next>0)return;SURP.next=rnd(180,300);
 const night=S.time>=20*60||S.time<4*60;if(night){evMarchand();return;}if(S.time<8*60||S.time>19*60)return;
 const opts=[evCaravane,evInvasion].sort(()=>Math.random()-0.5);for(const f of opts)if(f())return;}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{evtTick(dt);}catch(e){console.error(e);}return r;};}
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object')r.evenement_en_cours=SURP.cur?({caravane:'une caravane attaquée par des pillards',invasion:'une invasion de la Faille à Brumepont',marchand:'le Marchand de la nuit a planté sa tente'})[SURP.cur.k]:'aucun';}catch(e){}return r;};}
