/* ================= LES NUITS ÉTOILÉES =================
   - Plus de téléportation pour dormir : à minuit le jour change sur place (forêt qui repousse au loin, nouveaux
     coffres, énigmes, météo) ; au lever du jour (7 h) le Maître du Jeu prépare la journée. Pour sauter la nuit :
     fenêtre du personnage → « Dormir ici jusqu'au matin ».
   - La nuit devient un moment à vivre : aurores magiques (nuits claires), étoiles filantes, et jusqu'à 3 étoiles
     qui TOMBENT près du joueur (rayon de lumière). On les ramasse : essences, cristal, XP. Trois étoiles la même
     nuit = un vœu exaucé (+1 point de talent via S.relics, vie et mana au maximum). */
const NIGHT={stars:[],shoot:[],nextShoot:3,nextFall:20,aur:null};
const nightId=()=>S.time>=12*60?S.day:S.day-1; // une nuit = du soir au matin suivant
const isNight=()=>S.time>=21*60||S.time<5*60;
// ---------- minuit : nouveau jour sur place ----------
nightfall=function(){S.day++;S.time=0.05;planCourses();
 ENT.slice().forEach(e=>{const far=Math.hypot(e.x-player.x,e.z-player.z)>45;if(far&&(e.z<-300||e.z>300||(e.kind!=='item'&&e.kind!=='creature'&&!(e.kind==='chest'&&e.data.relic)&&Math.random()<0.6)))removeEnt(e);});
 if(typeof DUN!=='undefined'&&DUN&&S.zone!=='donjon')DUN.boss=null;newPuzzles();syncPuzzles();setWeather(pickWeather(),true);for(let i=0;i<2;i++)spawnChest(pick(LOCS).id);
 let n=0;TREES.forEach(t=>{if(t.st!=='ok'&&Math.hypot(t.x-player.x,t.z-player.z)>35){t.st='ok';t.burn=0;treeLook(t);n++;}});if(n)treesDirty();
 chron('Jour '+S.day+' : minuit sonne.');say('🌙 Minuit : le jour <b>'+S.day+'</b> commence. Les étoiles veillent… et parfois, elles tombent.','gm');save();};
function dawnTick(){if(S.time<7*60||S.time>12*60||S.dawnDay===S.day)return;S.dawnDay=S.day;
 say('☀ Jour '+S.day+(aiState==='on'?' — le MJ prépare la journée…':''),'gm');
 (async()=>{try{const res=await callGM('day',{});if(res&&res.narration)say('<b>MJ</b> : '+esc(res.narration),'gm');if(res)applyActions(res.actions,null);}catch(e){}save();})();}
function sleepHere(){if(!isNight()&&S.time<20*60){say('Tu n’as pas sommeil : il fait encore jour.','sys');return;}if(BOSS.on||DUEL||(typeof WAVE!=='undefined'&&WAVE)){say('Pas le moment de dormir !','sys');return;}
 $('#book').classList.add('hidden');if(FLY.on)dismount(true);
 fade(()=>{if(S.time>=12*60){S.time=24*60-0.02;nightfall();}S.time=7*60;mana=manaMax();if(typeof VIE!=='undefined'){VIE.hp=VIE.max;}say('💤 Tu dors à la belle étoile… et te réveilles reposé(e).','sys');});}
// ---------- aurores ----------
function makeAurora(){const c=document.createElement('canvas');c.width=4;c.height=128;const g=c.getContext('2d'),gr=g.createLinearGradient(0,128,0,0);
 gr.addColorStop(0,'rgba(80,255,170,0)');gr.addColorStop(0.15,'rgba(80,255,170,0.9)');gr.addColorStop(0.45,'rgba(90,220,255,0.55)');gr.addColorStop(0.8,'rgba(190,110,255,0.35)');gr.addColorStop(1,'rgba(190,110,255,0)');g.fillStyle=gr;g.fillRect(0,0,4,128);
 const tex=new THREE.CanvasTexture(c);const grp=new THREE.Group();grp.renderOrder=-5;
 for(let i=0;i<3;i++){const geo=new THREE.PlaneGeometry(320,34+i*8,80,1);const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  m.position.set(i*40-40,i*9,-150-i*35);m.userData.base=geo.attributes.position.array.slice();m.userData.ph=i*1.7;m.frustumCulled=false;grp.add(m);}
 grp.visible=false;scene.add(grp);NIGHT.aur=grp;}
function auroraTick(t){if(!NIGHT.aur)makeAurora();const A=NIGHT.aur,w=(S.weather||{w:'clair'}).w,show=S.zone==='monde'&&nightK>0.35&&(w==='clair'||w==='nuages'||w==='neige');
 const op=show?Math.min(0.75,(nightK-0.35)*1.6)*(w==='nuages'?0.5:1):0;A.visible=op>0.01;if(!A.visible)return;A.position.set(camera.position.x,camera.position.y+62,camera.position.z);
 A.children.forEach(m=>{m.material.opacity=op*(0.75+0.25*Math.sin(t*0.4+m.userData.ph));const a=m.geometry.attributes.position,B=m.userData.base;
  for(let i=0;i<a.count;i++){const x=B[i*3],y=B[i*3+1];a.setZ(i,Math.sin(x*0.018+t*0.25+m.userData.ph)*24+Math.sin(x*0.05+t*0.7)*6);a.setY(i,y+Math.sin(x*0.03+t*0.45)*5);}a.needsUpdate=true;});}
// ---------- étoiles filantes (décor) ----------
function shootTick(dt){NIGHT.nextShoot-=dt;if(NIGHT.nextShoot<=0&&nightK>0.6&&S.zone==='monde'){NIGHT.nextShoot=rnd(4,11);const c=camera.position,a=Math.random()*TAU;
  NIGHT.shoot.push({x:c.x+Math.cos(a)*rnd(40,110),y:c.y+rnd(55,85),z:c.z+Math.sin(a)*rnd(40,110),vx:rnd(-1,1)*55,vy:-rnd(8,18),vz:rnd(-1,1)*55,t:0.9});}
 for(let i=NIGHT.shoot.length-1;i>=0;i--){const s=NIGHT.shoot[i];s.t-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;for(let k=0;k<3;k++)PA.emit(s.x-s.vx*dt*k/3,s.y-s.vy*dt*k/3,s.z-s.vz*dt*k/3,0,0,0,k?0xbfe8ff:0xffffff,1.6,0.05,0.5,0,0);if(s.t<=0)NIGHT.shoot.splice(i,1);}}
// ---------- étoiles qui tombent (à ramasser) ----------
const STARG=new THREE.OctahedronGeometry(0.42,0);
function starSpot(){for(let k=0;k<30;k++){const a=Math.random()*TAU,r=rnd(28,80),x=player.x+Math.cos(a)*r,z=player.z+Math.sin(a)*r;
  const ok=x>1500?Math.hypot(x-2000,z)<150:Math.hypot(x,z)<84;if(ok&&!inLake({x,z})&&!inWater({x,z})&&isFree({x,z},1))return {x,z};}return null;}
function starFall(){const p=starSpot();if(!p)return;const y=gh(p.x,p.z);const S0={x:p.x,z:p.z,y,fall:2.2,o:null,beam:null,got:false,head:glow(0xfff1a0,5,1)};S0.head.userData.noCull=true;S0.head.position.set(p.x+40,y+90,p.z-20);scene.add(S0.head);NIGHT.stars.push(S0);
 const d=Math.atan2(p.x-player.x,p.z-player.z)-camYaw,dd=Math.atan2(Math.sin(d),Math.cos(d)),dir=Math.abs(dd)<0.6?'droit devant toi':Math.abs(dd)>2.4?'derrière toi':dd>0?'sur ta gauche':'sur ta droite';
 say('🌠 Une <b>étoile</b> tombe du ciel, '+dir+' ! Va la chercher avant l’aube.','gm');sfx('gong');}
function starLand(T){scene.remove(T.head);T.head=null;SHAKE=Math.max(SHAKE,0.35);shockRing(T.x,T.z,0xfff1a0,4);sfx('impact','lumiere',T.x,T.z);
 for(let i=0;i<60;i++){const a=Math.random()*TAU,v=rnd(3,9);PA.emit(T.x,T.y+0.5,T.z,Math.cos(a)*v,rnd(2,7),Math.sin(a)*v,i%2?0xfff1a0:0xffffff,rnd(.3,.6),0.05,rnd(.6,1.2),6,1);}
 const g=new THREE.Group();g.position.set(T.x,T.y,T.z);const core=new THREE.Mesh(STARG,mat(0xfff4c0,{emissive:0xffd060,emissiveIntensity:1.3,flatShading:true}));core.position.y=1;g.add(core);const gl=glow(0xffe08a,3.2,0.9);gl.position.y=1;g.add(gl);
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.35,70,10,1,true),basic(0xfff1a0,{transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=35;g.add(beam);
 scene.add(g);T.o=g;T.core=core;
 T.st=station({x:T.x,z:T.z,reach:2.2,hint:()=>T.o&&!T.got?'Ramasser l’étoile tombée':null,act:()=>starTake(T)});}
function starTake(T){if(T.got||!T.o)return;T.got=true;scene.remove(T.o);T.o=null;addItem('essence',2);addItem('cristal',1);gainXP(25);sfx('learn');burst(T.x,T.y+1,T.z,0xfff1a0,30,5);
 const id=nightId();if(!S.wish||S.wish.n!==id)S.wish={n:id,c:0};S.wish.c++;S.stars=(S.stars||0)+1;
 if(S.wish.c===3){S.relics=(S.relics||0)+1;mana=manaMax();if(typeof VIE!=='undefined')VIE.hp=VIE.max;banner('Vœu exaucé !','Trois étoiles en une nuit : +1 point de talent');SHAKE=Math.max(SHAKE,0.5);chron('Vœu exaucé sous les étoiles (3 étoiles en une nuit).');
  for(let i=0;i<120;i++){const a=Math.random()*TAU;PA.emit(player.x+Math.cos(a)*rnd(.5,2),player.y+rnd(0,3),player.z+Math.sin(a)*rnd(.5,2),0,rnd(1,5),0,i%3?0xfff1a0:0xbfe8ff,0.35,0.05,rnd(1,2),0,0.5);}updateHUD();}
 else say('⭐ Étoile ramassée (+2 essences, +1 cristal)'+(S.wish.c<3?' · '+S.wish.c+'/3 cette nuit : à trois, fais un vœu !':'.'),'sys');save();}
function starsTick(dt){if(S.zone!=='monde')return;
 if(isNight()){NIGHT.nextFall-=dt;const id=nightId();if(NIGHT.fid!==id){NIGHT.fid=id;NIGHT.fc=0;}
  if(NIGHT.nextFall<=0){NIGHT.nextFall=rnd(45,85);if(NIGHT.fc<3&&!BOSS.on&&!DUEL){const n0=NIGHT.stars.length;starFall();if(NIGHT.stars.length>n0)NIGHT.fc++;}}}
 for(let i=NIGHT.stars.length-1;i>=0;i--){const T=NIGHT.stars[i];
  if(T.head){T.fall-=dt;const k=1-Math.max(0,T.fall)/2.2;T.head.position.set(T.x+40*(1-k),T.y+1+89*(1-k),T.z-20*(1-k));PA.emit(T.head.position.x,T.head.position.y,T.head.position.z,rnd(-1,1),rnd(0,2),rnd(-1,1),0xfff1a0,1.2,0.05,0.6,0,0);if(T.fall<=0)starLand(T);continue;}
  if(T.core){T.core.rotation.y+=dt*1.5;T.core.position.y=1+Math.sin(performance.now()/400)*0.15;}
  // au matin, les étoiles non ramassées s'éteignent
  if((T.got||(S.time>6.5*60&&S.time<20*60))){if(T.o){scene.remove(T.o);T.o=null;}const j=STATIONS.indexOf(T.st);if(j>=0)STATIONS.splice(j,1);NIGHT.stars.splice(i,1);}}}
function nightTick(dt){if(!started)return;const t=performance.now()/1000;dawnTick();auroraTick(t);shootTick(dt);starsTick(dt);}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{nightTick(dt);}catch(e){console.error(e);}return r;};}
// fenêtre du personnage : dormir sur place, étoiles ramassées
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);if(bookTab!=='perso')return;const b=$('#book-body'),d=document.createElement('div');d.className='it';
  const night=isNight()||S.time>=20*60;d.innerHTML='<div class="mu">⭐ Étoiles ramassées : '+(S.stars||0)+(S.wish&&S.wish.n===nightId()?' · cette nuit : '+S.wish.c+'/3':'')+'</div>'+(night?'<button class="tbtn" id="b-dort" style="margin-top:8px">💤 Dormir ici jusqu’au matin</button>':'<div class="mu" style="margin-top:4px">La nuit, tu pourras dormir ici, sans changer de lieu.</div>');
  b.appendChild(d);const bt=$('#b-dort');if(bt)bt.onclick=()=>sleepHere();};}
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object')r.nuits='La nuit, des étoiles tombent près du joueur (à ramasser ; 3 en une nuit = un vœu, +1 point de talent) ; aurores par nuit claire. Le joueur ne se téléporte plus pour dormir.';}catch(e){}return r;};}
