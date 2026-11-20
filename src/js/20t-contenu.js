/* ================= CONTENU CRÉÉ DANS L'ATELIER (créatures) =================
   Sources : src/contenu/creatures.json (intégré au jeu par build.js → window.__CONTENU) + l'atelier de cet
   ordinateur (localStorage 'aldermoor-atelier-creatures', pour tester tout de suite sans reconstruire le jeu).
   Une fiche : {id, nom, modele, element, faiblesse, pv, nombre, taille, comportement:'hostile'|'calme', tireur:0-1,
   lieu (id d'un lieu), rayon, actif}. Quand le joueur approche du lieu, le groupe apparaît (jusqu'à « nombre »,
   une par seconde, et revient 60 s après la dernière perte) ; loin (> 150 m), il disparaît pour économiser.
   Adresse « ?test&voir=<id> » : la partie de test commence à côté du groupe (bouton « Tester » de l'Atelier). */
const CONT_KEY='aldermoor-atelier-creatures';
function contCreatures(){const base=((window.__CONTENU||{}).creatures||[]).slice();let loc=[];try{loc=JSON.parse(localStorage.getItem(CONT_KEY)||'[]');}catch(e){}
 const by={};base.concat(loc).forEach(c=>{if(c&&c.id)by[c.id]=c;});return Object.values(by);}
let CONTC=contCreatures();const CONTT={};
{const _m=creaModel;creaModel=function(name,look){const c=CONTC.find(c=>c.nom===name);if(c&&c.modele)return c.modele;return _m.apply(this,arguments);};}
function contTick(dt){if(!started||S.zone!=='monde')return;const now=performance.now()/1000;
 for(const c of CONTC){if(c.actif===false)continue;const L=LOCBY[c.lieu];if(!L)continue;const d=Math.hypot(player.x-L.x,player.z-L.z),mine=ENT.filter(e=>e.kind==='creature'&&e.data.cid===c.id);
  if(d>150){mine.forEach(removeEnt);continue;}if(d>95)continue;const T=CONTT[c.id]||(CONTT[c.id]={n:mine.length,t:0});
  if(mine.length<T.n)T.t=now+60;T.n=mine.length;if(mine.length>=(c.nombre||1)||now<T.t)continue;T.t=now+1;
  const p=freePoint(L,c.rayon||10),e=spawnCreatureAt(p.x,p.z,c.nom,c.faiblesse||'feu',c.element||'nature',c.pv||2,{cid:c.id,calme:c.comportement==='calme',scale:c.taille||1});
  e.data.ranged=c.comportement!=='calme'&&Math.random()<(c.tireur||0);T.n++;}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{CONTT.k=(CONTT.k||0)+dt;if(CONTT.k>0.5){CONTT.k=0;contTick(dt);}}catch(e){console.error(e);}return r;};}
// « Tester dans le jeu » : on arrive près du groupe
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);const m=/[?&]voir=([^&]+)/.exec(location.search);if(m){const c=CONTC.find(c=>c.id===decodeURIComponent(m[1]));const L=c&&LOCBY[c.lieu];
  if(L)setTimeout(()=>{const go=()=>{bot0(L.spot.x+6,L.spot.z+6);say('🛠 Test de l’Atelier : <b>'+esc(c.nom)+'</b> arrive près de '+esc(L.name)+'.','gm');};if(L.x>1500&&player.x<1500){landesGo(false);setTimeout(go,1600);}else go();},1800);}return r;};}
function bot0(x,z){player.x=x;player.z=z;player.y=gh(x,z);player.vx=player.vz=player.vy=0;}
/* ---------- modèles importés : noms d'animation, orientation, vol ---------- */
// les modèles importés nomment leurs animations à leur façon : la fiche peut choisir, sinon on devine
function creaAlias(A,D){const c=D&&D.cid&&CONTC.find(c=>c.id===D.cid),map=(c&&c.anims)||{},names=Object.keys(A),g=re=>names.find(n=>re.test(n));
 const want={Idle:map.Idle||(!A.Idle&&g(/idle|stand|breath|rest/i)),Walk:map.Walk||(!A.Walk&&g(/walk|run|move|gallop/i)),Bite_InPlace:map.Bite_InPlace||(!A.Bite_InPlace&&!A.Bite_Front&&g(/attack|bite|punch|slash|strike/i)),
  Death:map.Death||(!A.Death&&g(/death|die|dead/i)),HitRecieve:map.HitRecieve||(!A.HitRecieve&&g(/hit|hurt|damage|recei?ve/i)),Flying:map.Flying||(!A.Flying&&g(/fly|flap|hover/i))};
 for(const k in want)if(want[k]&&A[want[k]])A[k]=A[want[k]];}
{const _d=creaDress;creaDress=function(e,m,T){const r=_d.apply(this,arguments);const c=e.data.cid&&CONTC.find(c=>c.id===e.data.cid);if(c&&e.data.M){if(c.rotY)e.data.M.r.rotation.y=c.rotY*Math.PI/180;}return r;};}
CONTC.forEach(c=>{if(c.vol)CREA_VOL[c.modele]=1;});
// attaques de la fiche → données de la créature (lues par 20e : morsure, tirs, effet)
{const _sp=spawnCreatureAt;spawnCreatureAt=function(x,z,name,weak,look,hp,extra){const e=_sp.apply(this,arguments);const c=extra&&extra.cid&&CONTC.find(c=>c.id===extra.cid);
  if(c&&c.attaque){const A=c.attaque,D=e.data;if(A.morsure)D.bite=A.morsure;if(A.tir)D.shotDmg=A.tir;if(A.cadence)D.shotRate=A.cadence;if(A.portee)D.shotRange=A.portee;if(A.vitesse)D.shotSpd=A.vitesse;if(A.effet&&A.effet!=='aucun')D.eff=A.effet;}return e;};}
/* ---------- effets sur le joueur : brûlure, poison, gel (ralenti), repousse ---------- */
const PEFF={burn:0,poison:0,slow:0,t:0};
function playerEff(eff,fx,fz){if(eff==='brulure'){PEFF.burn=3;floatAt(player.x,player.z,'🔥 Brûlure','#ffb070');}else if(eff==='poison'){PEFF.poison=6;floatAt(player.x,player.z,'☠ Poison','#a0ff7a');}
 else if(eff==='gel'){PEFF.slow=3;floatAt(player.x,player.z,'❄ Ralenti','#bfefff');}else if(eff==='repousse'&&fx!==undefined){const dx=player.x-fx,dz=player.z-fz,d=Math.hypot(dx,dz)||1;player.vx+=dx/d*10;player.vz+=dz/d*10;player.vy=Math.max(player.vy,4);}}
function peffTick(dt){if(!started)return;PEFF.slow=Math.max(0,PEFF.slow-dt);PEFF.t-=dt;
 if(PEFF.slow>0&&Math.random()<dt*10)PA.emit(player.x+rnd(-.4,.4),player.y+rnd(0,1.8),player.z+rnd(-.4,.4),0,0.3,0,0xcff4ff,0.2,0.05,0.5,0,1);
 if((PEFF.burn>0||PEFF.poison>0)&&PEFF.t<=0){PEFF.t=1;if(PEFF.burn>0){PEFF.burn--;vieHurt(3);fireAt(player.x,player.y+1,player.z,0.4,1);}if(PEFF.poison>0){PEFF.poison--;vieHurt(2);burst(player.x,player.y+1.2,player.z,0x7aff4a,8,2);}}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{peffTick(dt);}catch(e){}return r;};}
// modèles importés depuis l'Atelier (avant reconstruction du jeu) : ajoutés au catalogue
try{const imp=JSON.parse(localStorage.getItem('aldermoor-atelier-imports')||'[]');window.__CATALOGUE=window.__CATALOGUE||{creatures:[]};imp.forEach(m=>{if(!window.__CATALOGUE.creatures.includes(m))window.__CATALOGUE.creatures.push(m);});}catch(e){}
