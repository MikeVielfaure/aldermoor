/* ================= AVIS DE RECHERCHE : des méchants nommés, mis à prix =================
   Un tableau au Village de Brumepont liste les recherchés (RECH). Toucher un avis place un repère vers son repaire
   (le suivi passe par les portails). Le méchant apparaît quand on approche de son repaire (seulement après avoir lu le tableau, et à partir du niveau
   rechNiv : vallée 4, Landes 8, Grandes Terres 12) : une élite (20l) avec un vrai
   nom, plus grosse et plus coriace. Vaincu : la prime (or, XP, cristaux), une seule fois (S.rech[id] = jour).
   Le nom donné à la créature choisit son modèle (orc, bandit → ninja, roi champignon, grand démon, loup, taureau de lave). */
const RECH=[
 {id:'mirza',n:'Mirza l’Ombre-Lame',nom:'Mirza, bandit masquée',loc:'ruines',dx:9,dz:7,w:'lumiere',l:'ombre',hp:7,or:90,d:'Une bandit insaisissable qui détrousse les élèves près des Ruines d’Ysmer.'},
 {id:'champi',n:'Le Roi champignon fou',nom:'Roi champignon fou',loc:'foret',dx:-9,dz:11,w:'feu',l:'nature',hp:8,or:80,d:'Il fait pousser des champignons partout… même dans les chaussettes des villageois.'},
 {id:'brasier',n:'Brasier-Noir',nom:'Brasier-Noir, taureau de lave',loc:'landes_plateau',dx:14,dz:-10,w:'eau',l:'feu',hp:9,or:130,d:'Un taureau de lave qui piétine les menhirs du Plateau des Géants.'},
 {id:'grokk',n:'Grokk le Brise-Os',nom:'Grokk, chef des orcs',loc:'terres_dunes',dx:-30,dz:-22,w:'glace',l:'feu',hp:10,or:150,d:'Chef d’une bande d’orcs qui pille les caravanes des Grandes Terres.'},
 {id:'croc',n:'Croc-de-Givre',nom:'Croc-de-Givre, loup alpha',loc:'terres_pics',dx:20,dz:24,w:'feu',l:'glace',hp:10,or:160,d:'Le loup alpha des Pics de Givre-Haut. Sa meute le suit partout.'},
 {id:'vorgath',n:'Vorgath, démon des cendres',nom:'Vorgath, grand démon des cendres',loc:'terres_mines',dx:16,dz:12,w:'eau',l:'feu',hp:12,or:220,d:'Un grand démon réveillé par les mineurs de Brisefer. Le plus dangereux de tous.'}];
const RECH_ON={};let RECH_T=0;
const rechFait=id=>!!(S.rech&&S.rech[id]);
const rechNiv=R=>{const L=LOCBY[R.loc];return !L?99:L.x>4000?12:L.x>1500?8:4;}; /* niveau minimum pour croiser ce méchant */
const rechRegion=L=>L.x>4000?'Grandes Terres':L.x>1500?'Landes d’Ombrelune':'vallée';
function rechSpot(R){const L=LOCBY[R.loc];if(!L)return null;let x=L.x+R.dx,z=L.z+R.dz;for(let k=0;k<12;k++){if(gh(x,z)>0.4&&isFree({x,z},1.4))return {x,z};x+=rnd(-4,4);z+=rnd(-4,4);}return {x:L.spot.x,z:L.spot.z};}
/* le méchant apparaît quand on approche de son repaire (et revient s'il a été perdu de vue) */
function rechTick(dt){RECH_T-=dt;if(RECH_T>0||!started||S.zone!=='monde')return;RECH_T=1;
 if(!S.rechVu)return; /* rien avant d'avoir lu le tableau : la Forêt de Sombrebois reste un lieu pour débutants */
 for(const R of RECH){if(rechFait(R.id)||lvl()<rechNiv(R))continue;const e=RECH_ON[R.id];if(e&&ENT.includes(e))continue;const L=LOCBY[R.loc];if(!L||Math.hypot(player.x-L.x-R.dx,player.z-L.z-R.dz)>70)continue;
  const p=rechSpot(R);if(!p)continue;const c=spawnCreatureAt(p.x,p.z,R.nom,R.w,R.l,R.hp,{zfix:1});makeElite(c);c.data.name='☠ '+R.n;c.data.baseName=R.n;c.data.rech=R.id;c.data.loc=R.loc;RECH_ON[R.id]=c;
  burst(p.x,gh(p.x,p.z)+1.5,p.z,0x8a1a1a,26,4);say('☠ <b>'+esc(R.n)+'</b> est dans les parages… La prime : <b>'+R.or+' 💰</b>.','gm');}}
{const _w=world4Tick;world4Tick=function(dt){rechTick(dt);return _w.apply(this,arguments);};}
{const _k=killCreature;killCreature=function(e){const D=e&&e.data,R=D&&D.rech&&ENT.includes(e)&&RECH.find(r=>r.id===D.rech);const r=_k.apply(this,arguments);
  if(R&&!rechFait(R.id)){S.rech=S.rech||{};S.rech[R.id]=S.day||1;gainOr(R.or,1);gainXP(Math.round(R.or*0.8));addItem('cristal',2);
   banner('☠ Prime encaissée !',R.n+' : '+R.or+' pièces d’or');sfx('win');chron('Prime : '+R.n+' vaincu.');say('💰 <b>'+R.or+' pièces d’or</b> et 2 cristaux pour la capture de <b>'+esc(R.n)+'</b>.','gm');save();}return r;};}
/* le tableau d'avis de recherche, au village */
function rechBoard(){S.rechVu=1;const left=RECH.filter(R=>!rechFait(R.id)).length;
 const it=RECH.map(R=>{const L=LOCBY[R.loc],f=rechFait(R.id);const bas=!f&&lvl()<rechNiv(R);return {t:(f?'✔ ':'☠ ')+R.n+(f?' — prime payée':' — '+R.or+' 💰'),s:f?'Capturé. Le village respire.':R.d+' Vu vers '+(L?L.name:'?')+' ('+rechRegion(L)+').'+(bas?' Trop dangereux avant le niveau '+rechNiv(R)+'.':''),off:f||bas,
   fn:()=>{S.wp=R.loc;say('📍 Repère placé : <b>'+esc(L.name)+'</b> — '+esc(R.n)+' rôde par là.','sys');save();}};});
 openPick('📜 Avis de recherche',left?left+' recherché'+(left>1?'s':'')+'. Touche un avis pour placer un repère vers son repaire.':'Plus aucune prime… pour l’instant. Bravo, chasseur !',it);}
{const _d=buildDecor;buildDecor=function(){const r=_d.apply(this,arguments);const V=LOCBY.village;if(!V)return r;
  let p=null;for(let k=0;k<60&&!p;k++){const a=k*2.4,rr=5+(k%6)*1.5,x=V.spot.x+Math.cos(a)*rr,z=V.spot.z+Math.sin(a)*rr;if(isFree({x,z},1.6)&&(typeof dkFree!=='function'||dkFree(x,z,1.4)))p={x,z};}
  if(!p)p={x:V.spot.x+3,z:V.spot.z+3};const ry=Math.atan2(V.spot.x-p.x,V.spot.z-p.z),g=new THREE.Group();g.position.set(p.x,gh(p.x,p.z),p.z);g.rotation.y=ry;
  const bois=mat(0x7a5232,{flatShading:true}),papier=mat(0xf0e4c4),rouge=mat(0x8a1a1a);
  for(const s of [-0.9,0.9]){const m=new THREE.Mesh(new THREE.BoxGeometry(0.14,2.2,0.14),bois);m.position.set(s,1.1,0);g.add(m);}
  const pan=new THREE.Mesh(new THREE.BoxGeometry(2.1,1.2,0.08),bois);pan.position.set(0,1.55,0);g.add(pan);
  const tit=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.22,0.1),rouge);tit.position.set(0,2.3,0);g.add(tit);
  [[-0.6,1.6],[0,1.5],[0.6,1.62]].forEach(([x,y])=>{const f=new THREE.Mesh(new THREE.PlaneGeometry(0.46,0.6),papier);f.position.set(x,y,0.05);f.rotation.z=rnd(-0.08,0.08);g.add(f);});
  scene.add(g);COLS.push({x:p.x,z:p.z,r:0.9});
  station({x:p.x+Math.sin(ry)*1.2,z:p.z+Math.cos(ry)*1.2,reach:2.4,hint:()=>'📜 Avis de recherche',act:()=>rechBoard()});return r;};}
