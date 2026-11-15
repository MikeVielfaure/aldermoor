/* ================= SORTS CHARGÉS, ENCHANTEMENTS, COURSE CÉLESTE =================
   - Sort chargé : doigt appuyé sur un sort (attaque ou zone). Un tapotement le lance tout de suite (au relâché) ;
     au-delà de 0,25 s il se charge (lueur sur la baguette, bouton qui s'allume) jusqu'à 1,15 s : plus gros, plus fort
     (CHGNOW dans pow()), coup double probable, mana ×1,6 au maximum ; charge pleine = forme critique garantie.
     Les sorts spéciaux (légendaires, garde) et utilitaires ne se chargent pas.
   - Enchantements : Table d'enchantement près de la Tour-Bibliothèque. Un enchantement par sort de garde
     (2 essences + 2 cristaux) : durée +50 %, Épines, Égide renforcée, Ronces ignifuges, Cœur de givre. S.ench.
   - Course céleste : anneaux entre les Îles du Miroir-Ciel (départ sur la première île), record S.craceBest. */
const CHG={id:null,i:-1,t0:0,b:null,full:false};let CHARGE_K=0;
const chargeable=sp=>!!sp&&!sp.special&&sp.form!=='util';
function chgK(){return CHG.id===null?0:clamp((performance.now()/1000-CHG.t0-0.25)/0.9,0,1);}
function chgStyle(b,k,col){if(!b)return;if(k<=0){b.style.transform='';b.style.filter='';return;}b.style.transform='scale('+(1+0.14*k).toFixed(3)+')';b.style.filter='brightness('+(1+0.8*k).toFixed(2)+') drop-shadow(0 0 '+Math.round(4+14*k)+'px '+col+')';}
// on intercepte le toucher des boutons de sort avant leur propre écouteur (phase de capture)
$('#ctrls').addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.slot');if(!b)return;e.preventDefault();e.stopPropagation();if(!started||anyModal()||CHG.id!==null)return;
 CHG.id=e.pointerId;CHG.i=+b.dataset.s;CHG.t0=performance.now()/1000;CHG.b=b;CHG.full=false;},true);
function chgRelease(e){if(CHG.id===null||e.pointerId!==CHG.id)return;const k0=chgK(),i=CHG.i,b=CHG.b;CHG.id=null;chgStyle(b,0);if(!started||anyModal())return;
 const sp=S.spells.find(s=>s.id===S.slots[i]);const k=chargeable(sp)?k0:0;
 if(k<=0.05){castSlot(i);S.tapN=(S.tapN||0)+1;if(S.tapN===8&&!S.seenChg)say('💫 Astuce : garde le doigt <b>appuyé</b> sur un sort pour le <b>charger</b> : il part plus gros et plus fort. Chargé à fond, c’est un coup critique !','gm');return;}
 S.seenChg=1;CHARGE_K=k;CHGNOW=k;CRIT_FORCE=k>=0.98;const n0=PROJ.length;
 try{castSlot(i);}finally{CHGNOW=0;CRIT_FORCE=false;CHARGE_K=0;}
 PROJ.slice(n0).forEach(p=>{p.chg=k;if(!p.crit)p.o.scale.multiplyScalar(1+0.7*k);});
 if(k>0.3){SHAKE=Math.max(SHAKE,0.15+0.25*k);if(sp.form==='zone')shockRing(player.x,player.z,ELEM[sp.el].c,4+4*k);}}
window.addEventListener('pointerup',chgRelease);window.addEventListener('pointercancel',chgRelease);
{const _c=spellCost;spellCost=function(sp){const c=_c.apply(this,arguments);return CHARGE_K>0?Math.round(c*(1+0.6*CHARGE_K)):c;};}
// un sort chargé à moitié ou plus frappe souvent deux fois (la charge pleine passe par le critique, 20d)
{const _h=hurtCreature;hurtCreature=function(e,el,x,z){if(!(CHGNOW>=0.5)||CRITNOW||!e||!e.data||e.data.calme)return _h.apply(this,arguments);const D=e.data;
  if(D.dragon){if(el==='feu')return _h.apply(this,arguments);return dragonHit(e,el,(el==='glace'?9:4.5)*(1+0.4*CHGNOW));}
  if(D.duel){const b0=DUEL?DUEL.ohp:0;_h.apply(this,arguments);if(DUEL&&DUEL.e===e&&DUEL.phase==='fight'){const lost=b0-DUEL.ohp;if(lost>0){const x2=Math.round(lost*0.35*CHGNOW);DUEL.ohp-=x2;duelHUD();if(DUEL.ohp<=0)duelEnd(true);}}return;}
  _h.apply(this,arguments);if(ENT.includes(e)&&Math.random()<CHGNOW)_h.apply(this,arguments);};}
const TIPV=new THREE.Vector3();
function chgTick(dt){if(CHG.id===null)return;const sp=S.spells.find(s=>s.id===S.slots[CHG.i]);if(!chargeable(sp))return;const k=chgK();if(k<=0)return;const c=ELEM[sp.el].c;chgStyle(CHG.b,k,hex(c));
 player.H.cast=Math.max(player.H.cast||0,0.3);player.H.p.tip.getWorldPosition(TIPV);
 for(let j=0;j<1+Math.round(k*4);j++){const a=Math.random()*TAU,r=rnd(0.4,1.2)*(1.2-k*0.6);PA.emit(TIPV.x+Math.cos(a)*r,TIPV.y+rnd(-.4,.4),TIPV.z+Math.sin(a)*r,-Math.cos(a)*r*3,rnd(-.3,.3),-Math.sin(a)*r*3,j%2?c:0xffffff,rnd(.2,.35)+0.2*k,0.05,0.3,0,1);}
 if(k>=0.98&&!CHG.full){CHG.full=true;sfx('lock');flash(TIPV.x,TIPV.y,TIPV.z,0xffd27a,2.5,0.3);floatAt(player.x,player.z,'✦ Chargé ✦','#ffd27a');}}
/* ================= ENCHANTEMENTS ================= */
const ENCH={rempart:[['duree','Durée','le rempart tient 50 % plus longtemps'],['epines','Épines','il blesse les créatures qui s’y frottent']],
 egide:[['duree','Durée','la bulle dure 8 s au lieu de 5'],['renforce','Égide renforcée','elle encaisse 3 boules de feu d’Ignivor au lieu de 2']],
 ronces:[['duree','Durée','la haie tient 50 % plus longtemps'],['ignifuge','Ignifuge','le feu ne la brûle plus']],
 maree:[['duree','Durée','le mur tient 50 % plus longtemps'],['givre','Cœur de givre','le mur naît déjà gelé (mur de glace solide)']]};
const ENCH_COST={essence:2,cristal:2};
const enchOf=k=>(S.ench||{})[k]||null;
const enchName=(k,o)=>{const E=(ENCH[k]||[]).find(e=>e[0]===o);return E?E[1]:'';};
const canPay=()=>Object.keys(ENCH_COST).every(i=>(S.inv[i]||0)>=ENCH_COST[i]);
function enchMenu(){const items=GARDE_ORD.map(k=>{const G=GARDE_SP[k],has=gardeHas(k),cur=enchOf(k);return {t:'🛡 '+G.name+(cur?' · ✨ '+enchName(k,cur):''),s:has?(cur?'Changer d’enchantement':'Pas encore enchanté'):'Sort pas encore appris (gagne des duels à l’Arène)',off:!has,fn:()=>enchChoose(k)};});
 openPick('Table d’enchantement','Un enchantement par sort de garde. Coût : <b>2 essences élémentaires</b> et <b>2 cristaux</b> (tu as '+(S.inv.essence||0)+' essences, '+(S.inv.cristal||0)+' cristaux). Les essences tombent des créatures, les cristaux poussent sur les Îles du Miroir-Ciel.',items);}
function enchChoose(k){const G=GARDE_SP[k],cur=enchOf(k);openPick('✨ '+G.name,canPay()?'Choisis l’enchantement.':'Il te manque des ingrédients (2 essences, 2 cristaux).',
 ENCH[k].map(([id,n,d])=>({t:(cur===id?'✔ ':'')+n,s:d,off:cur===id||!canPay(),fn:()=>{for(const i in ENCH_COST)S.inv[i]-=ENCH_COST[i];S.ench=S.ench||{};S.ench[k]=id;$('#pick').classList.add('hidden');
  banner('Enchantement !',G.name+' · '+n);sfx('learn');SHAKE=Math.max(SHAKE,0.3);if(ENCHT.x!=null)for(let i=0;i<60;i++){const a=Math.random()*TAU;PA.emit(ENCHT.x+Math.cos(a)*0.6,ENCHT.y+1.2+rnd(0,1.5),ENCHT.z+Math.sin(a)*0.6,0,rnd(1,3),0,i%2?0xd8b8ff:0xffffff,0.3,0.05,rnd(.8,1.4),0,0.5);}
  chron('Enchantement : '+G.name+' ('+n+').');save();}})));}
// effets
{const _wa=wallAdd;wallAdd=function(kind,pieces,life,extra){const W=_wa.apply(this,arguments);const e=enchOf(kind);if(e==='duree')W.life*=1.5;if(kind==='maree'&&e==='givre')wallFreeze(W);if(kind==='rempart'&&e==='epines')W.epines=1;return W;};}
{const _we=wallElem;wallElem=function(el,x,z,r){if(el==='feu'&&enchOf('ronces')==='ignifuge'){const R=WALLS.filter(W=>W.kind==='ronces');R.forEach(W=>W.kind='ronces_if');const res=_we.apply(this,arguments);R.forEach(W=>W.kind='ronces');if(R.some(W=>W.pieces.some(P=>Math.hypot(P.x-x,P.z-z)<r+1.2)))floatAt(player.x,player.z,'Ignifuge !','#d8b8ff');return res;}return _we.apply(this,arguments);};}
{const _cg=castGarde;castGarde=function(k){const r=_cg.apply(this,arguments);if(k==='egide'&&AEGIS){if(enchOf('egide')==='duree')AEGIS.t=Math.max(AEGIS.t,8);if(enchOf('egide')==='renforce')AEGIS.hits=Math.min(AEGIS.hits,-1);}return r;};}
function enchTick(dt){for(const W of WALLS){if(!W.epines||W.kind!=='rempart')continue;W.et=(W.et||0)-dt;if(W.et>0)continue;W.et=0.8;
 for(const e of ENT){if(e.kind!=='creature'||e.data.calme||e.data.duel||e.data.dragon)continue;if(W.pieces.some(P=>Math.hypot(e.x-P.x,e.z-P.z)<P.r+1.1)){hurtCreature(e,'nature',e.x,e.z);burst(e.x,1,e.z,0x8a7a5a,6,2);}}}}
// la table, près de la Tour-Bibliothèque
const ENCHT={x:null,y:0,z:null};
function buildEnchant(){const L=LOCBY.biblio;let p=null;for(const [ox,oz] of [[4,4],[5,1],[2,6],[-4,5],[6,-2]]){const q={x:L.spot.x+ox,z:L.spot.z+oz};if(isFree(q,1.2)){p=q;break;}}if(!p)p=freePoint(L,6);
 const y=gh(p.x,p.z);ENCHT.x=p.x;ENCHT.z=p.z;ENCHT.y=y;const g=new THREE.Group();g.position.set(p.x,y,p.z);scene.add(g);const st=mat(0x6a5a7a,{flatShading:true}),wd=mat(0x4a3424);
 const b=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.7,0.9,8),st);b.position.y=0.45;b.castShadow=true;g.add(b);const t=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.14,1.0),wd);t.position.y=0.97;g.add(t);
 const rune=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:runeTex(),color:0xd8b8ff,transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false}));rune.position.y=1.05;g.add(rune);ENCHT.rune=rune;
 const gl=glow(0xb48cff,2.2,0.6);gl.position.y=1.5;g.add(gl);addCol({x:p.x,z:p.z,r:0.75,h:y+1.05});
 station({x:p.x,z:p.z,reach:2.2,hint:()=>'Table d’enchantement',act:()=>enchMenu()});}
/* ================= COURSE CÉLESTE (entre les îles) ================= */
const CRACE={on:false,i:0,t:0,rings:[],built:false};
function buildCRace(){if(CRACE.built||!ILES_OK)return;CRACE.built=true;const [A,B,C]=ILES,mid=(P,Q,f,dy)=>({x:P.x+(Q.x-P.x)*f,y:(P.top+Q.top)/2+dy,z:P.z+(Q.z-P.z)*f});
 const L=LOCBY.landes_lac,pts=[{x:A.x+A.R+5,y:A.top+3,z:A.z},mid(A,B,0.5,-9),{x:B.x,y:B.top-B.R*1.7-5,z:B.z},{x:B.x+B.R+5,y:B.top+4,z:B.z+2},mid(B,C,0.5,9),
  {x:C.x+C.R+5,y:C.top+2,z:C.z},{x:C.x,y:C.top+3,z:C.z+C.R+5},{x:C.x-C.R-5,y:C.top-2,z:C.z},{x:L.x,y:gh(L.x,L.z)+6,z:L.z},{x:A.x-A.R-5,y:A.top-6,z:A.z+3},{x:A.x,y:A.top+10,z:A.z}];
 pts.forEach((p,i)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(2.8,0.18,8,36),new THREE.MeshBasicMaterial({color:0xbfe8ff,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(p.x,p.y,p.z);const n=pts[(i+1)%pts.length];m.lookAt(n.x,n.y,n.z);m.visible=false;m.frustumCulled=false;scene.add(m);CRACE.rings.push({m,x:p.x,y:p.y,z:p.z});});
 station({x:A.x-1.5,z:A.z+1.5,reach:2.2,hint:()=>Math.abs(player.y-A.top)<2&&!CRACE.on?'Lancer la Course céleste':null,act:()=>{if(Math.abs(player.y-A.top)<2)startCRace();}});
 const fl=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,2.4,6),mat(0xd8d2c4));fl.position.set(A.x-1.5,A.top+1.2,A.z+1.5);scene.add(fl);const fg=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.55),new THREE.MeshBasicMaterial({color:0x7ad8ff,side:THREE.DoubleSide}));fg.position.set(A.x-1.05,A.top+2.1,A.z+1.5);scene.add(fg);}
function startCRace(){if(!hasObj('balai')){say('Il te faut un balai pour la Course céleste.','sys');return;}if(RACE.on||WAVE)return;if(!FLY.on)toggleBroom();CRACE.on=true;CRACE.i=0;CRACE.t=0;CRACE.rings.forEach(r=>r.m.visible=true);hud8(true);
 banner('Course céleste',CRACE.rings.length+' anneaux entre les îles · record : '+(S.craceBest?S.craceBest.toFixed(1)+' s':'aucun'));sfx('gong');}
function endCRace(ok){CRACE.on=false;CRACE.rings.forEach(r=>r.m.visible=false);hud8(false);if(!ok){say('La Course céleste est annulée.','sys');return;}
 const t=CRACE.t,first=!S.craceBest,rec=first||t<S.craceBest;if(rec)S.craceBest=t;const xp=50+(first?60:0)+(rec&&!first?30:0);gainXP(xp);if(first){addItem('cristal',4);addItem('essence',2);}sfx('win');
 banner(rec?'Nouveau record céleste !':'Course céleste terminée',t.toFixed(1)+' s'+(rec?'':' · record '+S.craceBest.toFixed(1)+' s'));say('🏁 Course céleste : <b>'+t.toFixed(1)+' s</b> (+'+xp+' XP'+(first?', 4 cristaux, 2 essences':'')+')','gm');chron('Course céleste en '+t.toFixed(1)+' s.');save();}
function cRaceTick(dt){if(!CRACE.on)return;CRACE.t+=dt;const T=performance.now()/1000;CRACE.rings.forEach((r,i)=>{const cur=i===CRACE.i,nx=i===CRACE.i+1;r.m.material.opacity=cur?0.95:nx?0.45:0.12;r.m.material.color.setHex(cur?0x9fe8ff:0xb48cff);r.m.scale.setScalar(cur?1+0.06*Math.sin(T*6):1);});
 const r=CRACE.rings[CRACE.i];if(Math.hypot(player.x-r.x,player.y+0.9-r.y,player.z-r.z)<3){burst(r.x,r.y,r.z,0x9fe8ff,40,6);sfx('pick');CRACE.i++;if(CRACE.i>=CRACE.rings.length){endCRace(true);return;}}
 if(!FLY.on||CRACE.t>180||S.zone!=='monde'||player.x<1500){endCRace(false);return;}const nr=CRACE.rings[CRACE.i];if(nr&&!AIM.lock){beacon.visible=true;beacon.position.set(nr.x,gh(nr.x,nr.z),nr.z);}
 $('#w-t').textContent='☁ Anneau '+(CRACE.i+1)+'/'+CRACE.rings.length+' · '+CRACE.t.toFixed(1)+' s';}
{const _b=buildLandes;buildLandes=function(){const r=_b.apply(this,arguments);try{buildCRace();buildEnchant();}catch(e){console.error(e);}return r;};}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{chgTick(dt);enchTick(dt);cRaceTick(dt);if(ENCHT.rune)ENCHT.rune.rotation.y+=dt*0.5;}catch(e){console.error(e);}return r;};}
{const _ez=enterZone;enterZone=function(){if(CRACE.on)endCRace(false);return _ez.apply(this,arguments);};}
// Grimoire : enchantements à côté des sorts de garde ; MJ : il connaît la table
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);if(bookTab!=='sorts')return;const L=GARDE_ORD.filter(k=>enchOf(k));const d=document.createElement('div');d.className='mu';d.style.margin='-4px 0 8px';
  d.innerHTML='✨ Enchantements : '+(L.length?L.map(k=>esc(GARDE_SP[k].name)+' · '+esc(enchName(k,enchOf(k)))).join(' — '):'aucun (Table d’enchantement, près de la Tour-Bibliothèque)')+'<br>💫 Garde le doigt appuyé sur un sort pour le charger.';const b=$('#book-body');b.insertBefore(d,b.children[2]||null);};}
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object')r.enchantements='Table d’enchantement près de la Tour-Bibliothèque (sorts de garde : durée, épines, égide renforcée, ignifuge, cœur de givre ; coût 2 essences + 2 cristaux). Course céleste entre les îles.';}catch(e){}return r;};}
