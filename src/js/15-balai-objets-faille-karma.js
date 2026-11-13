/* ================= ÉTAPE 8 : BALAI, OBJETS MAGIQUES, FAILLE, KARMA & OUBLI ================= */
const OBJS={balai:{n:'Balai de l’académie',ic:'🧹',d:'Vole librement : Saut = monter, ⬇ = descendre. Touche le sol pour te poser.'},
 rappel:{n:'Pierre de rappel',ic:'🪨',d:'Te ramène instantanément à la Grande Cour.',cd:60},
 boussole:{n:'Boussole des arcanes',ic:'🧭',d:'Un rayon de lumière désigne le parchemin le plus proche.',cd:40},
 sablier:{n:'Sablier d’ambre',ic:'⏳',d:'Ralentit ennemis et projectiles pendant 8 s.',cd:90},
 lanterne:{n:'Lanterne-follet',ic:'🏮',d:'Une petite lueur te suit et éclaire la nuit (allumer / éteindre).'}};
const OCD={};let SLOWT=0,HITSTOP=0,SLOMO=0,SHAKE=0;const SHV=new THREE.Vector3();
const ef=()=>SLOWT>0?0.3:1;
function tScale(){return HITSTOP>0?0.08:SLOMO>0?0.35:1;}
const hasObj=k=>!!(S.objs&&S.objs[k]);
function giveObj(k){S.objs=S.objs||{};if(S.objs[k])return false;S.objs[k]=1;sfx('chest');banner('Objet magique',OBJS[k].ic+' '+OBJS[k].n);say('✨ Nouvel objet magique : <b>'+OBJS[k].ic+' '+OBJS[k].n+'</b> — '+OBJS[k].d+' (bouton 🎒)','gm');chron('Objet obtenu : '+OBJS[k].n);updObjBtns();save();return true;}
const missingObj=()=>['rappel','boussole','sablier','lanterne'].filter(k=>!hasObj(k));
function updObjBtns(){$('#b-obj').classList.toggle('hidden',!S.objs||!Object.keys(S.objs).length);$('#b-broom').classList.toggle('hidden',!hasObj('balai'));$('#b-broom').classList.toggle('on',FLY.on);}
function useObj(k){const O=OBJS[k],now=performance.now()/1000;if(O.cd&&(OCD[k]||0)>now){say(O.ic+' '+O.n+' : encore '+Math.ceil(OCD[k]-now)+' s.','sys');return;}
 if(k==='balai'){toggleBroom();return;}
 if(k==='lanterne'){S.lantern=!S.lantern;sfx('click');say(S.lantern?'🏮 La lanterne-follet s’éveille et virevolte autour de toi.':'🏮 La lueur s’endort dans sa lanterne.','sys');return;}
 if(k==='rappel'){if(DUEL||WAVE||RACE.on){say('Impossible pendant un défi.','sys');return;}OCD[k]=now+O.cd;if(FLY.on)dismount(true);const go=()=>{player.x=3;player.z=8;player.y=0;player.vx=player.vz=player.vy=0;camYaw=Math.PI;burst(3,1,8,0xb48cff,40,4);sfx('learn');};if(S.zone!=='monde'){fade(()=>{S.zone='monde';go();});}else fade(go);say('🪨 La pierre chauffe dans ta main… et te voilà à la Grande Cour.','sys');return;}
 if(k==='boussole'){let best=null,bd=1e9;ENT.forEach(e=>{if(e.kind!=='scroll')return;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;best=e;}});OCD[k]=now+O.cd;
  if(!best){say('🧭 L’aiguille tourne dans le vide : aucun parchemin dans les parages.','sys');return;}best.data.beam=30;const a=Math.atan2(best.x-player.x,-(best.z-player.z));const dirs=['au nord','au nord-est','à l’est','au sud-est','au sud','au sud-ouest','à l’ouest','au nord-ouest'];const di=dirs[(Math.round(a/(Math.PI/4))+8)%8];
  say('🧭 L’aiguille se fige : un parchemin'+(best.data.hidden?' caché':'')+' à '+Math.round(bd)+' m, '+di+' (vers '+esc((LOCBY[best.data.loc]||{name:'?'}).name)+'). Cherche le rayon de lumière !','sys');sfx('lock');return;}
 if(k==='sablier'){OCD[k]=now+O.cd;SLOWT=8;sfx('gong');for(let i=0;i<60;i++){const a=Math.random()*TAU,r=rnd(1,8);PA.emit(player.x+Math.cos(a)*r,rnd(0.3,3),player.z+Math.sin(a)*r,0,rnd(-.2,.2),0,0xffc870,0.3,0.05,rnd(1.5,3),0,0);}say('⏳ Le sable s’écoule à l’envers : tout ralentit autour de toi (8 s).','sys');}}
function objMenu(){const ks=Object.keys(OBJS).filter(hasObj);const now=performance.now()/1000;
 openPick('🎒 Objets magiques','Les objets se trouvent dans les coffres, la crypte des ruines, la Faille… Touche-en un pour l’utiliser.',ks.map(k=>{const O=OBJS[k],r=O.cd?Math.max(0,Math.ceil((OCD[k]||0)-now)):0;
  return {t:O.ic+' '+O.n,s:O.d+(r?' · prêt dans '+r+' s':'')+(k==='lanterne'?(S.lantern?' · allumée':' · éteinte'):'')+(k==='balai'?(FLY.on?' · en vol':''):''),fn:()=>{closePick();useObj(k);}};}));}
/* ---------- balai ---------- */
const FLY={on:false,t:0,down:false,bank:0,mesh:null};
function makeBroomMesh(){const g=new THREE.Group();const wood=mat(0x6a4424,{roughness:0.8});const st=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.045,2.1,8),wood);st.rotation.x=Math.PI/2;st.position.z=0.15;g.add(st);
 const br=new THREE.Mesh(new THREE.ConeGeometry(0.24,0.85,14,1,true),mat(0xc8a050,{roughness:1,side:THREE.DoubleSide}));br.rotation.x=Math.PI/2;br.position.z=-1.2;g.add(br);
 [-0.82,-0.95].forEach(z=>{const b=new THREE.Mesh(new THREE.TorusGeometry(0.075,0.022,6,12),mat(0xd4af37,{metalness:0.6,roughness:0.4}));b.position.z=z;g.add(b);});g.traverse(o=>{if(o.isMesh)o.castShadow=true;});return g;}
function toggleBroom(){if(FLY.on){if(player.y-gh(player.x,player.z)>3){say('Pose-toi d’abord (⬇) avant de descendre du balai.','sys');return;}dismount();return;}
 if(S.zone!=='monde'){say('Pas de balai à l’intérieur !','sys');return;}if(DUEL||WAVE){say('Pas de balai pendant un combat.','sys');return;}if(player.swim){say('Sors de l’eau d’abord.','sys');return;}
 FLY.on=true;FLY.t=0;player.vy=6;player.grounded=false;if(!FLY.mesh){FLY.mesh=makeBroomMesh();FLY.mesh.position.set(0,0.82,0);player.H.root.add(FLY.mesh);}FLY.mesh.visible=true;player.H.root.children.forEach(o=>{if(o.geometry&&o.geometry.type==='RingGeometry')o.visible=false;});sfx('whoosh',player.x,player.z);
 for(let i=0;i<30;i++){const a=Math.random()*TAU;PA.emit(player.x+Math.cos(a)*0.6,player.y+0.3,player.z+Math.sin(a)*0.6,Math.cos(a)*3,rnd(0.5,2),Math.sin(a)*3,0xf3cf7a,0.25,0.05,0.7,0,1.5);}
 $('#b-act').classList.add('hidden');$('#b-down').classList.remove('hidden');$('#b-jump').innerHTML='<span style="font-size:20px">⤒</span>Monter';updObjBtns();
 if(!S.seenFly){S.seenFly=1;say('🧹 <b>En vol !</b> Joystick pour avancer, <b>Monter</b> (ou Espace) pour prendre de l’altitude, <b>⬇</b> (ou X) pour descendre. Touche le sol pour te poser.','gm');}}
function dismount(silent){if(!FLY.on)return;FLY.on=false;FLY.down=false;if(FLY.mesh)FLY.mesh.visible=false;player.H.root.children.forEach(o=>{if(o.geometry&&o.geometry.type==='RingGeometry')o.visible=true;});player.H.root.rotation.z=0;player.H.root.rotation.x=0;$('#b-act').classList.remove('hidden');$('#b-down').classList.add('hidden');$('#b-jump').innerHTML='<span style="font-size:20px">⤒</span>Saut';updObjBtns();if(!silent)sfx('land',0.4);}
function flyPush(o,prev){const py=player.y;for(const c of COLS){if(c.lake||c.off)continue;const top=c.h!==undefined?c.h:(c.fh||(c.tree?7.6*c.tree.s:6.5));if(py>top-0.3)continue;
  if(c.r!==undefined){const dx=o.x-c.x,dz=o.z-c.z,m=c.r+0.45;if(Math.abs(dx)>m||Math.abs(dz)>m)continue;const d=Math.hypot(dx,dz);if(d<m){if(d<1e-4)o.x+=m;else{o.x=c.x+dx/d*m;o.z=c.z+dz/d*m;}}}
  else{const dx=o.x-c.x,dz=o.z-c.z,px=c.hw+0.45-Math.abs(dx),pz=c.hd+0.45-Math.abs(dz);if(px>0&&pz>0){if(px<pz)o.x+=(dx>=0?1:-1)*px;else o.z+=(dz>=0?1:-1)*pz;}}}
 const d=Math.hypot(o.x,o.z);if(d>90){o.x*=90/d;o.z*=90/d;}if(gh(o.x,o.z)+0.25>py){o.x=prev.x;o.z=prev.z;}}
function flyVert(dt){const up=jumpHeld||keys.Space,down=FLY.down||keys.KeyX||keys.ControlLeft;let tv=up?7.5:down?-8.5:Math.sin(performance.now()/450)*0.3;if(player.y>46&&tv>0)tv=0;player.vy+=(tv-player.vy)*Math.min(1,dt*4);}
function flyPose(dt){const P=player.H.p,sp=Math.hypot(player.vx,player.vz);
 P.lL.g.rotation.x=-1.25;P.lR.g.rotation.x=-1.25;P.lL.k.rotation.x=1.45;P.lR.k.rotation.x=1.45;P.lL.g.rotation.z=-0.12;P.lR.g.rotation.z=0.12;P.hips.position.y=0.86;P.spine.rotation.x=0.18+Math.min(0.25,sp*0.015);
 P.aL.g.rotation.x=-0.85;P.aL.e.rotation.x=-0.5;P.aL.g.rotation.z=-0.1;if(player.H.cast<=0){P.aR.g.rotation.x=-0.8;P.aR.e.rotation.x=-0.5;P.aR.g.rotation.z=0.1;}P.cape.rotation.x=0.5+Math.min(1.1,sp*0.08)+Math.sin(performance.now()/90)*0.08;
 let d=Math.atan2(Math.sin(player.ry-(FLY.lry||player.ry)),Math.cos(player.ry-(FLY.lry||player.ry)));FLY.lry=player.ry;FLY.bank+=(clamp(-d/Math.max(dt,1e-3)*0.12,-0.5,0.5)-FLY.bank)*Math.min(1,dt*4);player.H.root.rotation.z=FLY.bank;player.H.root.rotation.x=clamp(-player.vy*0.03,-0.25,0.25);
 if(sp>3&&Math.random()<dt*30)PA.emit(player.x-Math.sin(player.ry)*1.2,player.y+0.8,player.z-Math.cos(player.ry)*1.2,rnd(-.3,.3),rnd(-.2,.2),rnd(-.3,.3),Math.random()<0.5?0xf3cf7a:0xffffff,0.22,0.03,rnd(.5,1),0,0.5);}
/* ---------- course des anneaux ---------- */
const RACE={on:false,i:0,t:0,rings:[],built:false};const RINGP=[[2,-10,4],[-14,-20,7],[-30,-10,9],[-42,8,8],[-30,30,12],[-8,46,9],[16,42,8],[34,36,11],[47,12,14],[38,-10,9],[20,-18,12],[4,-4,6]];
function buildRace(){if(RACE.built)return;RACE.built=true;RINGP.forEach(([x,z,h],i)=>{const y=gh(x,z)+h;const m=new THREE.Mesh(new THREE.TorusGeometry(2.5,0.16,8,36),new THREE.MeshBasicMaterial({color:0xf3cf7a,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(x,y,z);const n=RINGP[(i+1)%RINGP.length];m.lookAt(n[0],gh(n[0],n[1])+n[2],n[1]);m.visible=false;m.frustumCulled=false;scene.add(m);RACE.rings.push({m,x,y,z});});}
function startRace(){if(!hasObj('balai'))return;buildRace();if(!FLY.on)toggleBroom();RACE.on=true;RACE.i=0;RACE.t=0;RACE.rings.forEach(r=>r.m.visible=true);hud8(true);banner('Course des anneaux',RINGP.length+' anneaux · record : '+(S.raceBest?S.raceBest.toFixed(1)+' s':'aucun'));sfx('gong');}
function endRace(ok){RACE.on=false;RACE.rings.forEach(r=>r.m.visible=false);hud8(false);if(!ok){say('La course est annulée.','sys');return;}const t=RACE.t,first=!S.raceBest,rec=first||t<S.raceBest;if(rec)S.raceBest=t;const xp=30+(first?30:0)+(rec&&!first?20:0);gainXP(xp);sfx('win');banner(rec?'Nouveau record !':'Course terminée',t.toFixed(1)+' s'+(rec?'':' · record '+S.raceBest.toFixed(1)+' s'));say('🏁 Course des anneaux : <b>'+t.toFixed(1)+' s</b> (+'+xp+' XP)','gm');save();}
function raceTick(dt){if(!RACE.on)return;RACE.t+=dt;const T=performance.now()/1000;RACE.rings.forEach((r,i)=>{const cur=i===RACE.i,nx=i===(RACE.i+1)%RACE.rings.length;r.m.material.opacity=cur?0.95:nx?0.4:0.12;r.m.material.color.setHex(cur?0xffd27a:0xb48cff);r.m.scale.setScalar(cur?1+0.05*Math.sin(T*6):1);});
 const r=RACE.rings[RACE.i];if(Math.hypot(player.x-r.x,player.y+0.9-r.y,player.z-r.z)<2.7){burst(r.x,r.y,r.z,0xffd27a,40,6);sfx('pick');RACE.i++;if(RACE.i>=RACE.rings.length){endRace(true);return;}}
 if(!FLY.on||RACE.t>150||S.zone!=='monde'){endRace(false);return;}const nr=RACE.rings[RACE.i];if(nr&&!AIM.lock){beacon.visible=true;beacon.position.set(nr.x,gh(nr.x,nr.z),nr.z);}
 $('#w-t').textContent='🧹 Anneau '+(RACE.i+1)+'/'+RACE.rings.length+' · '+RACE.t.toFixed(1)+' s';}
/* ---------- la Faille : vagues d'ennemis ---------- */
const RIFT={x:46.5,z:-61,cx:49,cz:-57};let WAVE=null,WPROJ=[],RIFTV=null;
function buildRift(){const y=gh(RIFT.x,RIFT.z);const c=document.createElement('canvas');c.width=64;c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(32,64,2,32,64,60);gr.addColorStop(0,'rgba(255,240,255,1)');gr.addColorStop(0.25,'rgba(200,120,255,.9)');gr.addColorStop(0.6,'rgba(90,20,160,.6)');gr.addColorStop(1,'rgba(20,0,40,0)');g.fillStyle=gr;g.beginPath();g.ellipse(32,64,30,62,0,0,TAU);g.fill();
 const tex=new THREE.CanvasTexture(c);const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,3.4),new THREE.MeshBasicMaterial({map:tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.set(RIFT.x,y+2.1,RIFT.z);m.userData.dyn=true;scene.add(m);const m2=m.clone();m2.rotation.y=Math.PI/2;scene.add(m2);
 for(let i=0;i<7;i++){const a=i/7*TAU;const s=rnd(0.4,0.8);const r=mesh(rockGeo(s),ROCKM,RIFT.x+Math.cos(a)*1.8,y+s*0.3,RIFT.z+Math.sin(a)*1.8);r.rotation.set(rnd(0,3),rnd(0,3),0);}
 addCol({x:RIFT.x,z:RIFT.z,r:1.1});RIFTV={m,m2,y};
 station({x:RIFT.x+1.6,z:RIFT.z+1.6,reach:2.8,hint:()=>S.zone==='monde'&&!WAVE?'Ouvrir la Faille'+(S.waveBest?' (record : vague '+S.waveBest+')':''):null,act:waveMenu});}
function waveMenu(){if(lvl()<2){say('La Faille gronde, menaçante. Reviens quand tu seras au moins niveau 2.','sys');return;}
 openPick('🌀 La Faille des Hauteurs','Cinq vagues de créatures jaillissent de la Faille. Chaque élimination te rend du mana. Vise leurs faiblesses, enchaîne les éliminations pour faire grimper le combo, et tiens bon ! Récompenses : XP, essences, et un objet magique à la fin.',[{t:'⚔ Ouvrir la Faille',s:'Record : '+(S.waveBest?'vague '+S.waveBest+'/5':'aucun')+(S.waveWins?' · refermée '+S.waveWins+' fois':''),fn:()=>{closePick();startWave();}},{t:'Pas maintenant',s:'',fn:closePick}]);}
const WCOUNT=[4,6,7,9,10];
function startWave(){if(WAVE)return;if(FLY.on)dismount(true);if(RACE.on)endRace(false);WAVE={n:0,max:5,hp:100,hpMax:100+8*Math.min(10,lvl()),combo:0,comboT:0,phase:'pause',next:2.2,spawnQ:0,spawnT:0,kills:0,out:0,xp:0};WAVE.hp=WAVE.hpMax;hud8(true,true);banner('La Faille s’ouvre !','Vague 1 / 5');sfx('gong');SHAKE=0.5;}
function spawnWaveEnemy(){const W=WAVE,n=W.n;const c=pick(CREA);const elite=n>=2&&Math.random()<0.18+n*0.04;const boss=n===4&&!W.bossOut&&W.spawnQ===1;const a=Math.random()*TAU;
 const x=RIFT.x+Math.cos(a)*1.6,z=RIFT.z+Math.sin(a)*1.6;const sc=boss?2.3:elite?1.5:1;const hp=boss?18:elite?6:2+(n>=2?1:0);
 const e=spawnCreatureAt(x,z,boss?'Gueule de la Faille':elite?c.name+' (élite)':c.name,c.weak,c.look,hp,{scale:sc,wave:true,hinted:true,sc,pop:0,spd:(boss?2.3:elite?3.0:3.5)+n*0.2,dmg:boss?12:elite?10:7,atk:0.8,shooter:!boss&&Math.random()<(n>=1?0.35:0.15),sh:rnd(1.5,3),boss,elite,hpMax:hp});e.ttl=Infinity;e.obj.scale.setScalar(0.01);if(boss){W.bossOut=true;banner('Gueule de la Faille','faiblesse : '+ELEM[c.weak].n);}
 for(let i=0;i<20;i++)PA.emit(RIFT.x,RIFTV.y+2,RIFT.z,rnd(-3,3),rnd(-1,3),rnd(-3,3),0xb48cff,0.4,0.05,0.6,0,1.5);}
function waveAI(e,dt){if(!WAVE){removeEnt(e);return;}const D=e.data,t=performance.now()/1000;dt*=ef();e.t+=dt;if(D.pop<1){D.pop=Math.min(1,D.pop+dt*2.2);e.obj.scale.setScalar(D.sc*(0.2+0.8*D.pop));}
 if(D.hitF>0){D.hitF-=dt;D.core.material.color.setHex(0xffffff);}else if(D.frozen>0){D.frozen-=dt;D.core.material.color.setHex(0xcff4ff);}else D.core.material.color.setHex(ELEM[D.look].c);
 if(D.burn>0){D.burn-=dt;fireAt(e.x,gh(e.x,e.z)+D.y*D.sc,e.z,0.4*D.sc,1);D.bt=(D.bt||0)+dt;if(D.bt>1){D.bt=0;waveDmg(e,1,'feu',false);if(!ENT.includes(e))return;}}
 if(D.rooted>0){D.rooted-=dt;if(Math.random()<dt*5)PN.emit(e.x+rnd(-.4,.4),gh(e.x,e.z)+0.2,e.z+rnd(-.4,.4),0,rnd(.2,.6),0,0x3f8f2a,0.2,0.15,0.8,0,0,1);}
 if(D.confused>0)D.confused-=dt;if(D.forgot>0)D.forgot-=dt;D.atk-=dt;
 const stuck=D.frozen>0||D.rooted>0||D.pop<1;const dp=Math.hypot(player.x-e.x,player.z-e.z);const px0=e.x,pz0=e.z;
 if(!stuck){let tx=player.x,tz=player.z;if(D.confused>0||D.forgot>0||BUFF.invis){tx=e.x+Math.sin(t*1.7+e.id)*3;tz=e.z+Math.cos(t*1.3+e.id)*3;}else if(D.shooter&&dp<7){tx=e.x-(player.x-e.x);tz=e.z-(player.z-e.z);}
  let dx=tx-e.x,dz=tz-e.z;const d=Math.hypot(dx,dz)||1;dx/=d;dz/=d;for(const o of ENT){if(o===e||o.kind!=='creature'||!o.data.wave)continue;const ox=e.x-o.x,oz=e.z-o.z,od=Math.hypot(ox,oz);if(od<1.6&&od>0.01){dx+=ox/od*(1.6-od);dz+=oz/od*(1.6-od);}}
  const L=Math.hypot(dx,dz)||1;D.dash=(D.dash||0)-dt;if(!D.shooter&&!D.boss&&!(D.confused>0)&&dp<4.5&&dp>1.6&&D.dash<-2.2&&Math.random()<dt*1.5){D.dash=0.35;for(let i=0;i<10;i++)PA.emit(e.x,gh(e.x,e.z)+0.5,e.z,rnd(-1,1),rnd(0,1),rnd(-1,1),ELEM[D.look].c,0.3,0.05,0.4,0,1);}const sp=D.spd*dt*(D.confused>0?0.6:1)*(D.dash>0?3.2:1);if(d>0.9||D.confused>0){e.x+=dx/L*sp;e.z+=dz/L*sp;}
  if(dp<1.0+0.35*D.sc&&player.y-gh(player.x,player.z)<1.6&&D.atk<=0&&!(D.confused>0)&&!(D.forgot>0)){D.atk=1.2;D.lunge=0.25;waveHurt(D.dmg,e.x,e.z,D.look);}
  if(D.shooter&&D.confused<=0){D.sh-=dt;if(D.sh<=0&&dp<16&&dp>3){D.sh=rnd(2.6,3.6);wShoot(e);}}}
 e.x+=D.kx*dt;e.z+=D.kz*dt;D.kx*=Math.max(0,1-5*dt);D.kz*=Math.max(0,1-5*dt);const o={x:e.x,z:e.z};pushOut(o,0.4*D.sc);const rd=Math.hypot(o.x-PC.x,o.z-PC.z);if(rd>12.5){o.x=PC.x+(o.x-PC.x)/rd*12.5;o.z=PC.z+(o.z-PC.z)/rd*12.5;}if(gh(o.x,o.z)<RIFTV.y-0.8){o.x=px0;o.z=pz0;D.kx=D.kz=0;}e.x=o.x;e.z=o.z;
 if(D.lunge>0)D.lunge-=dt;const bob=stuck?0:Math.sin(e.t*4)*0.25;e.obj.position.set(e.x+(D.lunge>0?(player.x-e.x)*0.15:0),gh(e.x,e.z)+bob,e.z+(D.lunge>0?(player.z-e.z)*0.15:0));e.obj.rotation.y=Math.atan2(player.x-e.x,player.z-e.z);
 if(!stuck&&Math.random()<dt*8)PA.emit(e.x,gh(e.x,e.z)+D.y*D.sc,e.z,rnd(-.2,.2),rnd(0,.4),rnd(-.2,.2),ELEM[D.look].c,0.3*D.sc,0.05,0.5,0,0);}
function wShoot(e){const D=e.data,c=ELEM[D.look].c,y=gh(e.x,e.z)+D.y*D.sc;const g=new THREE.Group();g.add(new THREE.Mesh(G.ball||new THREE.SphereGeometry(0.2,10,8),coreMat(D.look)));g.add(glow(c,1.2,0.9));g.position.set(e.x,y,e.z);scene.add(g);
 const lead=WAVE&&WAVE.n>=2?0.45:0;let dx=player.x+player.vx*lead-e.x,dz=player.z+player.vz*lead-e.z;const L=Math.hypot(dx,dz)||1;const sp=11;WPROJ.push({o:g,vx:dx/L*sp,vz:dz/L*sp,vy:(player.y+1.1-y)/(L/sp),life:2.6,el:D.look});sfx('cast',D.look,'trait',e.x,e.z);}
function waveHurt(dmg,x,z,el){const W=WAVE;if(!W||W.phase==='end')return;if(BUFF.invis)dmg=Math.round(dmg*0.5);W.hp-=dmg;sfx('hurt');SHAKE=Math.max(SHAKE,0.35);const hv=$('#hurt');hv.style.opacity=0.85;setTimeout(()=>hv.style.opacity=0,180);burst(player.x,1.2,player.z,ELEM[el].c,12,3);
 const d=Math.hypot(player.x-x,player.z-z)||1;player.vx+=(player.x-x)/d*7;player.vz+=(player.z-z)/d*7;floatAt(player.x,player.z,'-'+dmg,'#ff8080');W.combo=0;hud8(true,true);if(W.hp<=0)waveEnd(false);}
function waveHit(e,el,x,z){const D=e.data;if(!WAVE||D.pop<1)return;const weak=D.weak===el;let dmg=(weak?2:1)*(BUFF.puissance?1.5:1)*(D.boss&&!weak?0.5:1);
 if(el==='feu')D.burn=3;if(el==='glace')D.frozen=D.boss?1.2:3;if(el==='nature')D.rooted=D.boss?1:3;const d=Math.hypot(e.x-x,e.z-z)||1;const kb=(D.boss?1.5:5)*(el==='vent'||el==='eau'?2:1);D.kx+=(e.x-x)/d*kb;D.kz+=(e.z-z)/d*kb;waveDmg(e,dmg,el,weak);}
function waveDmg(e,dmg,el,weak){const D=e.data;D.hp-=dmg;D.hitF=0.08;sfx('hitC',e.x,e.z);floatAt(e.x,e.z,(weak?'💥 ':'')+'-'+(Math.round(dmg*10)/10),weak?'#ffd27a':'#ffffff');burst(e.x,gh(e.x,e.z)+D.y*D.sc,e.z,ELEM[el].c,weak?18:10,weak?5:3);
 if(weak){HITSTOP=Math.max(HITSTOP,0.035);SHAKE=Math.max(SHAKE,0.08);}if(D.hp<=0)waveKill(e);}
function waveKill(e){const D=e.data,W=WAVE;if(!ENT.includes(e))return;const y=gh(e.x,e.z)+D.y*D.sc;removeEnt(e);W.kills++;W.combo++;W.comboT=3.2;
 const c=ELEM[D.look].c;for(let i=0;i<40*D.sc;i++){const a=Math.random()*TAU,b=rnd(-0.5,1),v=rnd(2,8);PA.emit(e.x,y,e.z,Math.cos(a)*v,b*v+2,Math.sin(a)*v,i%3?c:0xffffff,rnd(.3,.6)*D.sc,0.05,rnd(.4,.9),4,1.5);}
 ring(e.x,e.z,c,2.2*D.sc,0.5);flash(e.x,y,e.z,c,3,0.4);for(let i=0;i<8;i++){const dx=player.x-e.x,dz=player.z-e.z;PA.emit(e.x+rnd(-.5,.5),y,e.z+rnd(-.5,.5),dx*1.4+rnd(-2,2),rnd(2,4),dz*1.4+rnd(-2,2),0xf3cf7a,0.25,0.08,0.7,6,0.2);}
 HITSTOP=Math.max(HITSTOP,D.boss?0.25:D.elite?0.1:0.05);SHAKE=Math.max(SHAKE,D.boss?0.8:D.elite?0.35:0.18);sfx('poof',e.x,e.z);if(AU.ready&&!AU.mute)tone({f:mf(72+Math.min(W.combo,14)*2),dur:0.35,v:0.09,type:'triangle',rev:0.4});
 const xp=D.boss?40:D.elite?8:3;W.xp+=xp;mana=Math.min(manaMax(),mana+(D.boss?40:D.elite?15:7));gainXP(xp);if(W.combo>=3)floatAt(player.x,player.z,'Combo x'+W.combo+' !','#ff9ae0');if(D.boss){addItem('essence',2);say('💀 La Gueule de la Faille s’effondre !','gm');}
 if(Math.random()<(D.elite||D.boss?0.5:0.06))addItem(pick(['essence','soleil','lune','givre','braise','plume','ombre']),1);hud8(true,true);}
function waveEnd(won){const W=WAVE;if(!W||W.phase==='end')return;W.phase='end';W.endT=2.8;ENT.filter(e=>e.kind==='creature'&&e.data.wave).forEach(e=>{burst(e.x,1.4,e.z,0xb48cff,20,4);removeEnt(e);});WPROJ.forEach(p=>scene.remove(p.o));WPROJ=[];
 const reached=won?5:W.n;S.waveBest=Math.max(S.waveBest||0,reached);
 if(won){S.waveWins=(S.waveWins||0)+1;SLOMO=1.4;sfx('win');banner('Faille refermée !',W.kills+' créatures · +'+W.xp+' XP');gainXP(60);addItem('essence',2);const m=missingObj();if(m.length)setTimeout(()=>giveObj(pick(m)),1800);else{addItem('p_'+pick(Object.keys(POTIONS)),1);say('Tu trouves une potion dans les débris de la Faille.','sys');}chron('La Faille des Hauteurs a été refermée.');karma(2);}
 else{sfx('lose');banner('Repoussé !','Vague '+(W.n+1)+' · '+W.kills+' créatures');say('La Faille te recrache, sonné. Tu gardes l’XP gagnée (+'+W.xp+').','sys');const a=Math.atan2(player.x-RIFT.cx,player.z-RIFT.cz);player.vx=Math.sin(a)*8;player.vz=Math.cos(a)*8;player.vy=5;player.grounded=false;}
 save();}
function waveTick(dt){if(RIFTV){const t=performance.now()/1000;const s=WAVE?1.25+0.1*Math.sin(t*8):1+0.06*Math.sin(t*2);RIFTV.m.scale.set(s,s,1);RIFTV.m2.scale.set(s,s,1);if(Math.hypot(player.x-RIFT.x,player.z-RIFT.z)<45&&S.zone==='monde'&&Math.random()<dt*(WAVE?25:8))PA.emit(RIFT.x+rnd(-.5,.5),RIFTV.y+rnd(0.5,3.6),RIFT.z+rnd(-.5,.5),rnd(-1,1),rnd(-.5,1),rnd(-1,1),Math.random()<0.6?0xb48cff:0xff7ae0,rnd(.2,.45),0.05,rnd(.6,1.2),0,0.5);}
 if(!WAVE)return;const W=WAVE,e8=dt*ef();
 WPROJ=WPROJ.filter(p=>{p.life-=e8;const o=p.o.position;o.x+=p.vx*e8;o.y+=p.vy*e8;o.z+=p.vz*e8;if(Math.random()<0.5)PA.emit(o.x,o.y,o.z,rnd(-.3,.3),rnd(-.3,.3),rnd(-.3,.3),ELEM[p.el].c,0.3,0.05,0.35,0,1);let hit=false;
  if(W.phase!=='end'&&Math.hypot(player.x-o.x,player.z-o.z)<0.75&&Math.abs(player.y+1-o.y)<1.05){hit=true;waveHurt(7,o.x,o.z,p.el);}if(!hit&&(p.life<=0||o.y<gh(o.x,o.z)||hitsSolid(o.x,o.z))){burst(o.x,o.y,o.z,ELEM[p.el].c,8,2);hit=true;}if(hit){scene.remove(p.o);return false;}return true;});
 if(W.comboT>0){W.comboT-=dt;if(W.comboT<=0){W.combo=0;hud8(true,true);}}
 if(W.phase==='end'){W.endT-=dt;if(W.endT<=0){WAVE=null;hud8(false);}return;}
 const alive=ENT.filter(e=>e.kind==='creature'&&e.data.wave).length;
 if(W.phase==='pause'){W.next-=dt;if(W.next<=0){W.phase='fight';W.spawnQ=WCOUNT[W.n];W.spawnT=0;sfx('whoosh',RIFT.x,RIFT.z);}}
 else if(W.phase==='fight'){if(W.spawnQ>0){W.spawnT-=dt;if(W.spawnT<=0&&alive<7){W.spawnT=rnd(0.35,0.8);spawnWaveEnemy();W.spawnQ--;}}
  else if(alive===0){W.n++;if(W.n>=W.max){waveEnd(true);return;}W.phase='pause';W.next=4;W.hp=Math.min(W.hpMax,W.hp+30);SLOMO=0.7;sfx('quest');banner('Vague '+W.n+' repoussée !','Vague '+(W.n+1)+' / 5 dans 4 s · +30 PV');}}
 const dr=Math.hypot(player.x-RIFT.cx,player.z-RIFT.cz);if(dr>19){if(W.out===0)say('⚠ Reviens près de la Faille ou le combat s’arrête !','sys');W.out+=dt;if(W.out>5)waveEnd(false);}else W.out=0;
 if(S.zone!=='monde')waveEnd(false);
 $('#w-t').textContent='🌀 Vague '+Math.min(W.n+1,5)+'/5 · '+(alive+W.spawnQ)+' ennemi'+(alive+W.spawnQ>1?'s':'')+(W.combo>=2?' · combo x'+W.combo:'');$('#w-hpw i').style.width=clamp(W.hp/W.hpMax*100,0,100)+'%';}
function hud8(on,bar){$('#wave').classList.toggle('hidden',!on);$('#w-hpw').classList.toggle('hidden',!bar);document.body.classList.toggle('inwave',!!on);if(on&&WAVE)$('#w-hpw i').style.width=clamp(WAVE.hp/WAVE.hpMax*100,0,100)+'%';}
/* ---------- karma : lumière & ombre ---------- */
function karma(n){const k0=S.karma||0;S.karma=clamp(k0+n,-100,100);const a0=alignOf(k0),a1=alignOf(S.karma);if(a0!==a1)say((S.karma>k0?'☀':'🌑')+' Ton âme change : te voilà <b>'+a1+'</b>.','gm');}
function alignOf(k){if(k==null)k=S.karma||0;return k>=60?'Âme lumineuse':k>=25?'Cœur loyal':k<=-60?'Cœur d’ombre':k<=-25?'Âme trouble':'en équilibre';}
function karmaMul(el){const k=(S&&S.karma)||0;if(el==='lumiere'&&k>=40)return 1.2;if(el==='ombre'&&k<=-40)return 1.25;return 1;}
{const _ig=igniteTree;igniteTree=function(t){const r=_ig.apply(this,arguments);if(r&&!igniteTree.storm&&Math.hypot(t.x-player.x,t.z-player.z)<30){S.kburn=(S.kburn||0)+1;if(S.kburn%3===1)karma(-1);}return r;};}
{const _st=strike;strike=function(){igniteTree.storm=true;try{return _st.apply(this,arguments);}finally{igniteTree.storm=false;}};}
{const _re=resolveEvent;resolveEvent=function(e){karma(2);return _re.apply(this,arguments);};}
{const _fq=finishQuest;finishQuest=function(q){karma(q.dark?-8:2);return _fq.apply(this,arguments);};}
{const _rg=regrow;regrow=function(){const n0=TREES.filter(t=>t.st!=='ok').length;const r=_rg.apply(this,arguments);if(TREES.filter(t=>t.st!=='ok').length<n0)karma(1);return r;};}
/* ---------- quête obscure : le Murmure de l'Oubli ---------- */
const OUBLI_SP={name:'Oubli',inc:'Lethe Memoria',el:'ombre',form:'util',desc:'Efface la mémoire récente d’une personne ou d’une créature. Nul ne sait vraiment ce que cela entraîne…',id:'oubli',special:'oubli',dark:true};
const darkAvail=()=>!S.darkQ&&lvl()>=3&&(S.time>=20*60||S.time<6*60);
function darkQuest(){S.darkQ=1;sfx('gong');flash(ORACLE.x+1,2.4,ORACLE.z,0x8a3aff,4,1.5);for(let i=0;i<60;i++)PN.emit(ORACLE.x+rnd(-1,1),rnd(1,3),ORACLE.z+rnd(-1,1),rnd(-1,1),rnd(0,1),rnd(-1,1),0x2a1048,0.7,1.6,rnd(1,2),0,0.6,0.8);
 say('👁 Les yeux de l’oracle virent au violet. Une autre voix, plus ancienne, chuchote : « Il existe un sort que les maîtres ont <b>effacé des livres</b>… Celui qui l’apprend peut vider un esprit comme on vide une coupe. Va voir la sorcière du marais. Parle-lui de la <b>Fleur-de-Léthé</b>. »','gm');
 addQuest({title:'Le Murmure de l’Oubli',desc:'La voix nocturne de l’oracle t’a parlé d’un sort interdit, capable d’effacer les souvenirs.',giver:'brindille',dark:true,steps:[{kind:'talk',npc:'brindille',text:'Interroger Mère Brindille sur la Fleur-de-Léthé'},{kind:'collect',loc:'grotte',item:'une Fleur-de-Léthé',text:'Cueillir la Fleur-de-Léthé dans la Grotte aux Cristaux'},{kind:'cast',loc:'cercle',el:'ombre',text:'Offrir un sort d’Ombre au Cercle de pierres'},{kind:'collect',loc:'bosquet',item:'le Parchemin de l’Oubli',text:'Trouver le Bosquet des Murmures (à l’ouest, au-delà de la Forêt)'}],reward:{xp:150,spell:Object.assign({},OUBLI_SP)}});chron('L’oracle a parlé d’un sort interdit.');}
{const _co=consultOracle;consultOracle=function(){if(darkAvail())return darkQuest();return _co.apply(this,arguments);};}
{const _ct=checkTalk;checkTalk=function(id){const q=S.quests.find(q=>q.dark&&curStep(q)&&curStep(q).kind==='talk'&&curStep(q).npc===id);const r=_ct.apply(this,arguments);
 if(q&&id==='brindille')r.unshift('« La Fleur-de-Léthé… Tu joues avec des choses qui mordent, petit. Elle pousse dans le noir, là où les cristaux chantent. Et quand tu l’auras, offre de l’ombre aux vieilles pierres : le chemin du Bosquet s’ouvrira. Je ne veux pas savoir pourquoi tu cherches ça. »');return r;};}
{const _fq2=finishQuest;finishQuest=function(q){const r=_fq2.apply(this,arguments);if(q.dark)setTimeout(()=>say('🌑 Le parchemin se consume dans tes mains, mais les mots restent gravés dans ta tête. <b>Oubli</b> rejoint ton grimoire. Utilise-le sur quelqu’un… si tu l’oses.','gm'),900);return r;};}
function castOubli(sp){let tg=null,bd=7;npcs.forEach(n=>{if(n.sleep||n.inDuel)return;const d=Math.hypot(n.x-player.x,n.z-player.z);if(d<bd){bd=d;tg={npc:n,x:n.x,z:n.z};}});
 if(AIM.lock&&AIM.lock.kind==='crea'&&tgAlive(AIM.lock))tg={crea:AIM.lock.ref,x:AIM.lock.ref.x,z:AIM.lock.ref.z};
 if(!tg){let bc=10;ENT.forEach(e=>{if(e.kind!=='creature')return;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bc){bc=d;tg={crea:e,x:e.x,z:e.z};}});}
 for(let i=0;i<50;i++)PN.emit(player.x+rnd(-.5,.5),player.y+rnd(.5,2),player.z+rnd(-.5,.5),rnd(-2,2),rnd(0,1),rnd(-2,2),0x2a1048,0.5,1.4,1,0,1,0.8);
 if(!tg){say('Le sort se dissout dans l’air : il lui faut un esprit à vider.','sys');return;}
 const gy=gh(tg.x,tg.z);for(let i=0;i<40;i++){const k=i/40;PA.emit(player.x+(tg.x-player.x)*k,player.y+1.4+Math.sin(k*Math.PI)*1.2,player.z+(tg.z-player.z)*k,rnd(-.3,.3),rnd(-.3,.3),rnd(-.3,.3),0x8a3aff,0.35,0.05,0.8,0,0);}
 for(let i=0;i<30;i++){const a=i/30*TAU;PA.emit(tg.x+Math.cos(a)*0.6,gy+2.1,tg.z+Math.sin(a)*0.6,Math.cos(a)*1.5,rnd(0,1),Math.sin(a)*1.5,0xc89aff,0.3,0.05,1,0,0.5);}sfx('cast','ombre','zone',tg.x,tg.z);
 if(tg.crea){const D=tg.crea.data;if(D.duel&&DUEL){DUEL.cd=4;DUEL.wu=null;D.confused=5;say('🌀 '+esc(D.name)+' a oublié le sort qu’il préparait !','sys');}else{D.confused=10;D.forgot=10;D.tx=D.hx;D.tz=D.hz;say('🌀 '+esc(D.name)+' oublie jusqu’à ta présence.','sys');}karma(-1);return;}
 const n=tg.npc,id=n.d.id,rep=S.rep[id]||0;S.rep[id]=0;CHATS[id]=[];S.forgot=S.forgot||{};S.forgot[id]=(S.forgot[id]||0)+1;n.forgetT=45;
 const lost=S.quests.filter(q=>q.giver===id&&!q.dark);lost.forEach(q=>{S.quests=S.quests.filter(x=>x!==q);if(S.track===q.id)S.track=S.quests[0]?S.quests[0].id:null;});
 bubble(n,pick(['Euh… on se connaît ?','Qu’est-ce que je faisais, déjà ?','Tiens… j’ai un trou.','Pardon… vous êtes ?']));karma(rep<=-4?-4:-12);
 S.darkLog=(S.darkLog||[]).concat(['Jour '+S.day+' : Oubli lancé sur '+n.d.name+(rep<=-4?' (pour effacer sa rancune)':rep>0?' (alors qu’il/elle t’appréciait)':'')]).slice(-8);
 say('🌀 <b>'+esc(n.d.name)+'</b> te regarde sans te reconnaître.'+(rep<0?' Sa rancune envers toi s’est envolée.':rep>0?' Son amitié pour toi aussi…':'')+(lost.length?' La quête « '+esc(lost[0].title)+' »'+(lost.length>1?' et '+(lost.length-1)+' autre(s)':'')+' est oubliée elle aussi.':''),'gm');chron('Oubli lancé sur '+n.d.name+'.');save();}
{const _du=doUtil;doUtil=function(sp){if(sp.special==='oubli')return castOubli(sp);return _du.apply(this,arguments);};}
{const _od2=openDlg;openDlg=function(ctx){const r=_od2.apply(this,arguments);if(ctx&&ctx.mode==='talk'){const n=npcs.find(x=>x.d.id===ctx.npc.id);if(n&&n.forgetT>0){line('n',pick(['Je… je ne sais plus très bien qui tu es.','On s’est déjà parlé ? J’ai la tête comme du coton.','Bizarre… j’ai l’impression d’avoir oublié quelque chose d’important.']));}
  if((S.karma||0)<=-40)$('#dlg-sub').textContent+=' · te regarde avec méfiance';else if((S.karma||0)>=40)$('#dlg-sub').textContent+=' · te sourit';}return r;};}
/* ---------- le Bosquet des Murmures (lieu étrange) ---------- */
const BQ={x:-80,z:22};let BQV=null;
function buildBosquet(){TREES=TREES.filter(t=>{if(Math.hypot(t.x-BQ.x,t.z-BQ.z)<12){COLS.forEach(c=>{if(c.tree===t)c.off=true;});return false;}return true;});CULL.dirty=true;
 const y0=gh(BQ.x,BQ.z);const g=new THREE.Group();g.position.set(BQ.x,y0,BQ.z);g.userData.dyn=true;scene.add(g);const rocks=[];
 for(let i=0;i<9;i++){const s=rnd(0.4,1.1);const m=new THREE.Mesh(rockGeo(s),ROCKM);const a=i/9*TAU,r=rnd(5,8);m.position.set(Math.cos(a)*r,rnd(2.5,6),Math.sin(a)*r);m.castShadow=true;g.add(m);rocks.push({m,y:m.position.y,p:Math.random()*6});}
 const V=TREEV[3]||TREEV[0];const inv=[];for(let i=0;i<5;i++){const a=i/5*TAU+0.3,r=rnd(6.5,9);const tg=new THREE.Group();tg.position.set(BQ.x+Math.cos(a)*r,y0+rnd(9,11),BQ.z+Math.sin(a)*r);tg.rotation.set(Math.PI+rnd(-.2,.2),rnd(0,3),rnd(-.2,.2));tg.userData.dyn=true;
  const tm=new THREE.Mesh(V.trunk.geometry,V.trunk.material);const lm=new THREE.Mesh(V.leaf.geometry,V.leaf.material);tm.castShadow=lm.castShadow=true;lm.customDepthMaterial=V.leaf.customDepthMaterial;tg.add(tm,lm);tg.scale.setScalar(rnd(0.7,1));scene.add(tg);inv.push({g:tg,y:tg.position.y,p:Math.random()*6});}
 const st=triMat(0x6a5a7a,TX.stone,TX.stone,0.45,1.0);for(let i=0;i<6;i++){const a=i/6*TAU;const h=rnd(1.8,3.2);const m=mesh(new THREE.BoxGeometry(0.7,h,0.5),st,BQ.x+Math.cos(a)*4.2,y0+h/2-0.1,BQ.z+Math.sin(a)*4.2);m.rotation.set(rnd(-.2,.2),-a,rnd(-.25,.25));addCol({x:m.position.x,z:m.position.z,r:0.5});}
 mesh(new THREE.CylinderGeometry(0.45,0.6,1.1,8),st,BQ.x+2,y0+0.55,BQ.z);addCol({x:BQ.x+2,z:BQ.z,r:0.6,h:1.1});const cg=glow(0xc89aff,2.5,0.6);cg.position.set(BQ.x+2,y0+1.5,BQ.z);scene.add(cg);
 BQV={g,rocks,inv,y0};}
function bosquetTick(dt){if(!BQV)return;const d=Math.hypot(player.x-BQ.x,player.z-BQ.z);if(d>70||S.zone!=='monde')return;const t=performance.now()/1000;BQV.g.rotation.y=t*0.08;BQV.rocks.forEach(r=>{r.m.position.y=r.y+Math.sin(t*0.8+r.p)*0.5;r.m.rotation.x+=dt*0.2;});BQV.inv.forEach(r=>{r.g.position.y=r.y+Math.sin(t*0.5+r.p)*0.35;});
 if(Math.random()<dt*14){const a=Math.random()*TAU,r=Math.random()*11;PA.emit(BQ.x+Math.cos(a)*r,BQV.y0+rnd(0.2,4),BQ.z+Math.sin(a)*r,rnd(-.2,.2),rnd(0.1,0.5),rnd(-.2,.2),Math.random()<0.7?0xc89aff:0x7affc8,0.2,0.1,rnd(2,4),-0.05,0,0.8);}
 if(Math.random()<dt*2)PN.emit(BQ.x+rnd(-9,9),BQV.y0+0.3,BQ.z+rnd(-9,9),rnd(-.2,.2),rnd(0,.1),rnd(-.2,.2),0x5a3a8a,2,3.5,rnd(3,5),0,0.2,0.25);
 if(d<12){if(!(S.found||{}).bosquet){S.found=S.found||{};S.found.bosquet=1;sfx('learn');banner('Lieu découvert','Bosquet des Murmures');say('🌀 Tu pénètres dans un lieu qui ne devrait pas exister : des arbres flottent à l’envers, les pierres oublient de tomber… et ton corps semble plus léger.','gm');chron('Découverte du Bosquet des Murmures.');save();}
  if(!player.grounded&&!FLY.on)player.vy+=15*dt;
  if(AU.ready&&Math.random()<dt*0.6){const p=rnd(-0.8,0.8),c=AU.ctx.currentTime;noiz({f:rnd(500,1100),f2:rnd(300,700),q:6,dur:rnd(0.6,1.2),v:0.035,pan:p,dest:AU.amb,rev:0.8});tone({t:c+0.1,f:rnd(180,260),f2:rnd(150,200),dur:1.2,v:0.02,type:'sine',pan:-p,dest:AU.amb,rev:0.9});}}}
/* ---------- remise à balais ---------- */
const RACK={x:-8.5,z:-18};
function buildRack(){const y=gh(RACK.x,RACK.z),wd=triMat(0x6e4a2c,TX.wood,TX.wood,0.7,1.15);mesh(new THREE.BoxGeometry(0.18,2.2,0.18),wd,RACK.x-1.2,y+1.1,RACK.z);mesh(new THREE.BoxGeometry(0.18,2.2,0.18),wd,RACK.x+1.2,y+1.1,RACK.z);mesh(new THREE.BoxGeometry(2.7,0.14,0.22),wd,RACK.x,y+2.1,RACK.z);
 const roof=mesh(new THREE.BoxGeometry(3.0,0.1,1.2),triMat(0x8a5a3a,TX.roof,TX.roof,0.5,1.3),RACK.x,y+2.4,RACK.z);roof.rotation.x=0.18;
 for(let i=0;i<3;i++){const b=makeBroomMesh();b.rotation.x=-Math.PI/2+0.08;b.position.set(RACK.x-0.75+i*0.75,y+1.1,RACK.z+0.15);scene.add(b);}addCol({x:RACK.x,z:RACK.z,hw:1.4,hd:0.35});
 station({x:RACK.x,z:RACK.z+1.2,reach:2.4,hint:()=>S.zone!=='monde'?null:!hasObj('balai')?'Prendre un balai':'Course des anneaux',act:()=>{if(!hasObj('balai')){if(lvl()<3){say('Une étiquette : « Balais réservés aux apprentis de niveau 3 ». Encore un peu de patience !','sys');return;}giveObj('balai');return;}
  openPick('🏁 Course des anneaux',RINGP.length+' anneaux dorés autour de l’académie. Traverse-les dans l’ordre, le plus vite possible !',[{t:'🧹 Prendre le départ',s:'Record : '+(S.raceBest?S.raceBest.toFixed(1)+' s':'aucun'),fn:()=>{closePick();startRace();}},{t:'Pas maintenant',s:'',fn:closePick}]);}});}
/* ---------- boucle ---------- */
let lantG=null;
function tick8(dt){if(!started)return;if(WAVE&&WAVE.phase!=='end')mana=Math.min(manaMax(),mana+manaRegen()*0.6*dt);if(HITSTOP>0)HITSTOP-=dt;if(SLOMO>0)SLOMO-=dt;if(SLOWT>0)SLOWT-=dt;
 if(FLY.on){FLY.t+=dt;flyPose(dt);if(S.zone!=='monde'||DUEL)dismount(true);else if(player.grounded&&FLY.t>0.8){dismount();say('Tu te poses en douceur.','sys');}}
 raceTick(dt);waveTick(dt);bosquetTick(dt);
 if(S.lantern&&S.zone==='monde'){const t=performance.now()/1000;const lx=player.x+Math.cos(t*1.3)*1.1,lz=player.z+Math.sin(t*1.3)*1.1,ly=player.y+2.2+Math.sin(t*2.1)*0.25;PLight.position.set(lx,ly,lz);PLight.color.setHex(0xffd890);PLight.distance=16;PLight.intensity=nightK>0.3?1.6:0.5;
  if(!lantG){lantG=glow(0xffe0a0,0.9,0.95);scene.add(lantG);}lantG.visible=true;lantG.position.set(lx,ly,lz);if(Math.random()<dt*10)PA.emit(lx,ly,lz,rnd(-.2,.2),rnd(-.4,0),rnd(-.2,.2),0xffd27a,0.12,0.02,0.6,0,0);}else if(lantG)lantG.visible=false;
 npcs.forEach(n=>{if(n.forgetT>0){n.forgetT-=dt;if(Math.random()<dt*3)PA.emit(n.x+rnd(-.3,.3),gh(n.x,n.z)+2.2,n.z+rnd(-.3,.3),0,0.3,0,0xc89aff,0.18,0.03,1,0,0);}});
 if(ORACLE&&darkAvail()){ORACLE.eyeM.color.setHex(0xb070ff);ORACLE.eyeM.emissive.setHex(0x8a3aff);ORACLE.eyeM.emissiveIntensity=1.4;ORACLE.eg.material.color.setHex(0xb070ff);ORACLE.eg.material.opacity=0.7;}else if(ORACLE){ORACLE.eyeM.color.setHex(0x9ad8ff);ORACLE.eyeM.emissive.setHex(0x5ac8ff);ORACLE.eg.material.color.setHex(0x9ad8ff);}
 if(lvl()>=2&&!S.seenRift){S.seenRift=1;say('🌀 On raconte qu’une <b>Faille</b> s’est ouverte sur les Hauteurs de Brisevent. Des créatures en sortent par vagues…','gm');}
 if(lvl()>=3&&!S.seenBroom){S.seenBroom=1;say('🧹 Niveau 3 : tu as le droit de voler ! Une <b>remise à balais</b> t’attend entre la Grande Cour et le château.','gm');}}
function preRender(){if(SHAKE>0&&started){SHAKE=Math.max(0,SHAKE-0.016*2.2);const k=SHAKE*0.35;SHV.set(rnd(-k,k),rnd(-k,k),rnd(-k,k));camera.position.add(SHV);}else SHV.set(0,0,0);}
function postRender(){camera.position.sub(SHV);SHV.set(0,0,0);}
$('#b-obj').onclick=()=>{if(started&&!anyModal()){sfx('click');objMenu();}};$('#b-broom').onclick=()=>{if(started&&!anyModal())toggleBroom();};
$('#b-down').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();FLY.down=true;});['pointerup','pointercancel','pointerleave'].forEach(ev=>$('#b-down').addEventListener(ev,()=>{FLY.down=false;}));
window.addEventListener('keydown',e=>{if(!started||anyModal()||e.target.tagName==='INPUT')return;if(e.code==='KeyB'&&hasObj('balai'))toggleBroom();if(e.code==='KeyI'&&S.objs&&Object.keys(S.objs).length)objMenu();});
{const _j8=jump;jump=function(){if(FLY.on)return;return _j8.apply(this,arguments);};}
{const _ff=findFocus;findFocus=function(){if(FLY.on&&player.y-gh(player.x,player.z)>2.2){focus=null;$('#hint').classList.add('hidden');$('#b-act').classList.remove('ready');return;}return _ff.apply(this,arguments);};}
{const _ez8=enterZone;enterZone=function(){if(FLY.on)dismount(true);if(WAVE)waveEnd(false);if(RACE.on)endRace(false);return _ez8.apply(this,arguments);};}
{const _ed8=enterDungeon;enterDungeon=function(){if(FLY.on)dismount(true);if(WAVE)waveEnd(false);if(RACE.on)endRace(false);return _ed8.apply(this,arguments);};}
{const _sd8=startDuel;startDuel=function(){if(WAVE||RACE.on)return;if(FLY.on)dismount(true);return _sd8.apply(this,arguments);};}
{const _nf8=nightfall;nightfall=function(){if(FLY.on)dismount(true);if(WAVE){waveEnd(false);WAVE=null;hud8(false);}if(RACE.on)endRace(false);return _nf8.apply(this,arguments);};}
{const _oc8=openChest;openChest=function(e){const was=e.data.open;const crypt=CRYPT&&Math.hypot(e.x-CRYPT.x,e.z-CRYPT.z)<2;const r=_oc8.apply(this,arguments);if(!was&&e.data.open){const m=missingObj();if(m.length&&(crypt||e.data.relic||Math.random()<0.22))setTimeout(()=>giveObj(pick(m)),1200);}return r;};}
{const _gu8=gust;gust=function(dx,dz){const r=_gu8.apply(this,arguments);ENT.slice().forEach(e=>{if(e.kind!=='creature'||!(e.data.wave||e.data.duel))return;const vx=e.x-player.x,vz=e.z-player.z,d=Math.hypot(vx,vz);if(d<8*Math.min(1.5,pow('vent'))&&d>0.01&&(vx*dx+vz*dz)/d>0.5)hurtCreature(e,'vent',player.x,player.z);});return r;};}
{const _kc8=killCreature;killCreature=function(e){if(e&&e.data&&e.data.wave)return waveKill(e);return _kc8.apply(this,arguments);};}
{const _hc8=hurtCreature;hurtCreature=function(e,el,x,z){if(e&&e.data&&e.data.wave)return waveHit(e,el,x,z);return _hc8.apply(this,arguments);};}

