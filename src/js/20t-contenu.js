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
