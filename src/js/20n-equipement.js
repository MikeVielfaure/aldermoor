/* ================= PIÈCES D'OR, ÉCHOPPE ET ÉQUIPEMENT (baguettes, robes) =================
   - Pièces d'or (S.or) : créatures (+2 à 4), élites (+30), quêtes (+20 à 40), événements (+40), étoiles (+5),
     Ignivor (+200), vente d'ingrédients à l'Échoppe. Elles serviront aussi plus tard (terrain, maison).
   - Échoppe de l'Artisan, au Village de Brumepont : acheter baguettes et robes, vendre ses récoltes.
   - Équipement (S.equip = {wand, robe}, S.gear = objets possédés) : un bonus par objet, branché dans pow (gearMul),
     manaMax (gearMana), manaRegen (gearRegen), vitesse (gearSpeed, 21-boucle), critiques (gearCrit, 20d), vie (gearVie, 20e).
     La robe change la couleur de l'apprenti(e) ; le bout de la baguette brille de sa couleur.
   - Baguette du dragon : récompense d'Ignivor. Les élites lâchent parfois une pièce d'équipement (10 %). */
const WANDS={apprenti:{n:'Baguette d’apprenti',p:0,d:'Simple et fidèle.',tip:0xfff1d0},
 chene:{n:'Baguette de chêne runique',p:120,d:'+10 % de puissance à tous tes sorts.',tip:0xffd27a,all:0.10},
 braise:{n:'Baguette de braise',p:180,d:'+25 % de puissance de Feu.',tip:0xff7a2e,el:{feu:0.25}},
 givre:{n:'Baguette de givre',p:180,d:'+25 % de puissance de Glace et d’Eau.',tip:0x9ee8ff,el:{glace:0.25,eau:0.15}},
 lune:{n:'Baguette d’ombre-lune',p:220,d:'+25 % d’Ombre et d’Arcane, +8 % de coups critiques.',tip:0x8a3aff,el:{ombre:0.25,arcane:0.15},crit:0.08},
 celeste:{n:'Baguette céleste',p:220,d:'+25 % de Lumière et de Vent, +20 % de Nature.',tip:0xfff6a0,el:{lumiere:0.25,vent:0.25,nature:0.2}},
 dragon:{n:'Baguette du dragon',p:0,d:'Taillée dans une écaille d’Ignivor : +15 % à tous tes sorts, +10 % de coups critiques.',tip:0xff5a1e,all:0.15,crit:0.10,unique:true}};
const ROBES={apprenti:{n:'Robe d’apprenti',p:0,d:'La robe noire de l’académie.',col:0x1b1a22},
 mage:{n:'Robe du mage',p:150,d:'+30 de mana maximum.',col:0x1f2c5a,mana:30},
 eclaireur:{n:'Robe de l’éclaireur',p:150,d:'+10 % de vitesse à pied.',col:0x2a4a26,speed:0.10},
 arcaniste:{n:'Robe de l’arcaniste',p:200,d:'Ta magie revient 35 % plus vite.',col:0x4a1f4a,regen:0.35},
 etoiles:{n:'Robe des étoiles',p:260,d:'+20 % de puissance la nuit, +20 de vie.',col:0x101634,night:0.2,vie:20},
 vouivre:{n:'Robe de la vouivre',p:400,d:'+40 de vie, +15 % de Feu. Vendue une fois Ignivor vaincue.',col:0x5a1a10,vie:40,el:{feu:0.15},needDragon:true}};
const gearW=()=>WANDS[(S&&S.equip&&S.equip.wand)||'apprenti']||WANDS.apprenti;
const gearR=()=>ROBES[(S&&S.equip&&S.equip.robe)||'apprenti']||ROBES.apprenti;
function gearMul(el){if(!S||!S.equip)return 1;const W=gearW(),R=gearR();let k=1+(W.all||0)+((W.el&&W.el[el])||0)+((R.el&&R.el[el])||0);if(R.night&&typeof nightK!=='undefined'&&nightK>0.5)k+=R.night;return k;}
function gearMana(){return S&&S.equip?(gearR().mana||0):0;}
function gearRegen(){return S&&S.equip?1+(gearR().regen||0):1;}
function gearSpeed(){return S&&S.equip?1+(gearR().speed||0):1;}
function gearCrit(){return S&&S.equip?(gearW().crit||0):0;}
function gearVie(){return S&&S.equip?(gearR().vie||0):0;}
function gearInit(){if(!S.equip)S.equip={wand:'apprenti',robe:'apprenti'};if(!S.gear)S.gear=['w:apprenti','r:apprenti'];if(S.or===undefined)S.or=0;}
const hasGear=(t,k)=>(S.gear||[]).includes(t+':'+k);
function giveGear(t,k,why){gearInit();if(hasGear(t,k))return false;S.gear.push(t+':'+k);const G=t==='w'?WANDS[k]:ROBES[k];banner((t==='w'?'🪄 ':'🧥 ')+G.n,why||G.d);sfx('learn');chron('Nouvel équipement : '+G.n+'.');save();return true;}
function equip(t,k){gearInit();if(!hasGear(t,k))return;if(t==='w')S.equip.wand=k;else S.equip.robe=k;mana=Math.min(mana,manaMax());sfx('click');GEARV.want=null;save();}
function gainOr(n,why){gearInit();S.or+=n;if(why)floatAt(player.x,player.z,'+'+n+' 🪙','#ffd24a');}
// ---------- gains de pièces d'or ----------
{const _k=killCreature;killCreature=function(e){const D=e&&e.data,was=D&&ENT.includes(e)&&!D.calme&&!D.pet&&!D.duel;const elite=D&&D.elite;const r=_k.apply(this,arguments);
  if(was&&!ENT.includes(e)){if(D.dragon){gainOr(200,1);if(giveGear('w','dragon','Taillée dans une écaille d’Ignivor'))setTimeout(()=>say('🪄 Dans les restes d’Ignivor, une écaille luit encore : tu en tailles la <b>Baguette du dragon</b> (Grimoire › Perso pour l’équiper).','gm'),3500);}
   else if(elite){gainOr(30,1);if(Math.random()<0.10){const opts=[...Object.keys(WANDS).filter(k=>!WANDS[k].unique&&k!=='apprenti').map(k=>['w',k]),...Object.keys(ROBES).filter(k=>!ROBES[k].needDragon&&k!=='apprenti').map(k=>['r',k])].filter(([t,k])=>!hasGear(t,k));if(opts.length){const [t,k]=pick(opts);giveGear(t,k,'Trouvé sur une créature élite');}}}
   else gainOr(2+Math.floor(Math.random()*3));}return r;};}
{const _f=finishQuest;finishQuest=function(q){const r=_f.apply(this,arguments);const n=Math.round(20+Math.min(20,((q.reward&&q.reward.xp)||0)/10));gainOr(n);say('🪙 +'+n+' pièces d’or.','sys');return r;};}
{const _st=starTake;starTake=function(T){const was=!T.got;const r=_st.apply(this,arguments);if(was&&T.got)gainOr(5);return r;};}
// événements réussis : on regarde la bannière de victoire (caravane, brèche)
{const _b=banner;banner=function(t){if(/^(Caravane sauvée|La brèche se referme)/.test(t||''))gainOr(40,1);return _b.apply(this,arguments);};}
// ---------- l'Échoppe de l'Artisan (Village de Brumepont) ----------
const SHOPG={x:null,z:null,y:0};
const SELL={essence:8,cristal:6};const sellPrice=k=>SELL[k]||3;
function goldTxt(){return '🪙 '+(S.or||0)+' pièces d’or';}
function shopRoot(){gearInit();openPick('🛠 L’Échoppe de l’Artisan','« Baguettes taillées main, robes cousues sur mesure ! Et je rachète tes récoltes. » — '+goldTxt(),[
 {t:'🪄 Baguettes',s:'Plus de puissance, des coups critiques…',fn:()=>shopList('w')},{t:'🧥 Robes',s:'Mana, vitesse, vie…',fn:()=>shopList('r')},{t:'🌿 Vendre mes récoltes',s:'Ingrédients, essences, cristaux',fn:()=>shopSell()}]);}
function shopList(t){const L=t==='w'?WANDS:ROBES;const items=Object.entries(L).filter(([k,G])=>k!=='apprenti'&&!G.unique).map(([k,G])=>{const own=hasGear(t,k),lock=G.needDragon&&!S.dragonMort;
  return {t:(own?'✔ ':'')+G.n+(own?'':' — '+G.p+' 🪙'),s:lock?'Vendue une fois Ignivor vaincue.':G.d+(own?' (tu l’as déjà : équipe-la dans la fenêtre du personnage)':''),off:own||lock||(S.or||0)<G.p,
   fn:()=>{if((S.or||0)<G.p)return;S.or-=G.p;S.gear.push(t+':'+k);equip(t,k);banner((t==='w'?'🪄 ':'🧥 ')+G.n,'Achetée et équipée');sfx('win');chron('Acheté : '+G.n+'.');save();shopList(t);}};});
 items.push({t:'← Retour',fn:()=>shopRoot()});openPick(t==='w'?'🪄 Baguettes':'🧥 Robes',goldTxt(),items);}
function shopSell(){const ks=Object.keys(S.inv||{}).filter(k=>INGR[k]&&(S.inv[k]||0)>0);
 const items=ks.map(k=>({t:INGR[k].n+' ×'+S.inv[k],s:'Vendre 1 : '+sellPrice(k)+' 🪙 · tout : '+sellPrice(k)*S.inv[k]+' 🪙',fn:()=>{const n=S.inv[k];S.or=(S.or||0)+sellPrice(k)*n;S.inv[k]=0;sfx('pick');say('🪙 Tu vends '+n+' '+esc(INGR[k].n)+' (+'+sellPrice(k)*n+').','sys');save();shopSell();}}));
 if(!items.length)items.push({t:'Rien à vendre',s:'Cueille des ingrédients ou bats des créatures.',off:true});items.push({t:'← Retour',fn:()=>shopRoot()});openPick('🌿 Vendre mes récoltes',goldTxt()+' · un clic vend tout le lot',items);}
function buildShop(){const L=LOCBY.village;let p=null;for(const [ox,oz] of [[-5,4],[5,5],[-6,-3],[6,-4],[0,7]]){const q={x:L.spot.x+ox,z:L.spot.z+oz};if(isFree(q,1.6)){p=q;break;}}if(!p)p=freePoint(L,6);
 const y=gh(p.x,p.z);SHOPG.x=p.x;SHOPG.z=p.z;SHOPG.y=y;const g=new THREE.Group();g.position.set(p.x,y,p.z);g.rotation.y=Math.atan2(L.spot.x-p.x,L.spot.z-p.z);scene.add(g);
 const wd=mat(0x6a4a2a),cl=mat(0x2a5a8a,{side:THREE.DoubleSide});const t=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.9,0.8),wd);t.position.set(0,0.45,0.6);t.castShadow=true;g.add(t);
 for(const s of [-1,1]){const post=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.3,0.12),wd);post.position.set(s*1.1,1.15,0.95);g.add(post);const p2=post.clone();p2.position.z=-0.3;g.add(p2);}
 const aw=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.6),cl);aw.position.set(0,2.3,0.35);aw.rotation.x=-1.2;g.add(aw);
 Object.values(WANDS).slice(1,6).forEach((W,i)=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.03,0.5,6),mat(0x5a3416));w.rotation.z=Math.PI/2;w.position.set(-0.8+i*0.4,0.95,0.6);g.add(w);const tg=glow(W.tip,0.5,0.9);tg.position.set(-0.55+i*0.4,0.95,0.6);g.add(tg);});
 const sign=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.4,0.05),wd);sign.position.set(0,2.0,1.0);g.add(sign);addCol({x:p.x,z:p.z,r:1.2,h:y+0.9});
 station({x:p.x,z:p.z,reach:2.8,hint:()=>'L’Échoppe de l’Artisan',act:()=>shopRoot()});}
{const _b=buildLandes;buildLandes=function(){const r=_b.apply(this,arguments);try{buildShop();}catch(e){console.error(e);}return r;};}
// ---------- apparence : couleur de robe, lueur de baguette ----------
const GEARV={want:null,tip:null,t:0};
function gearVisTick(dt){GEARV.t-=dt;if(GEARV.t>0||!started)return;GEARV.t=0.5;gearInit();const H=player.H;if(!H)return;
 const R=gearR(),W=gearW(),key=R.col+'|'+W.tip;
 if(H.appr&&GEARV.want!==key){GEARV.want=key;if(H.appr.robe!==R.col){const lin=H.appr.lin;apprUndress(H);H.L=Object.assign({},H.L||{},{robe:R.col});apprDress(H,lin);if(H.appr){H.appr.robe=R.col;H.appr.lin=lin;}GEARV.tip=null;}}
 if(H.p&&H.p.tip&&(!GEARV.tip||GEARV.tip.parent!==H.p.tip||GEARV.tip.userData.c!==W.tip)){if(GEARV.tip&&GEARV.tip.parent)GEARV.tip.parent.remove(GEARV.tip);GEARV.tip=glow(W.tip,W===WANDS.apprenti?0.25:0.55,0.95);GEARV.tip.userData.c=W.tip;H.p.tip.add(GEARV.tip);}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{gearVisTick(dt);}catch(e){console.error(e);}return r;};}
// la doublure d'origine est gardée quand on rhabille (05b passe la teinte à apprDress)
{const _ad=apprDress;apprDress=function(H,lining){const r=_ad.apply(this,arguments);if(H.appr&&H.appr.lin===undefined)H.appr.lin=lining;return r;};}
// ---------- fenêtre du personnage : or et équipement ----------
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);if(bookTab!=='perso')return;gearInit();const b=$('#book-body'),d=document.createElement('div');d.className='it';
  const row=(t,k,G,on)=>'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:5px 0"><span>'+(on?'✔ ':'')+'<b>'+esc(G.n)+'</b> <span class="mu">'+esc(G.d)+'</span></span>'+(on?'':'<button class="tbtn" data-eq="'+t+':'+k+'">Équiper</button>')+'</div>';
  let h='<h4>🎒 Équipement<span class="badge" style="color:var(--gold)">'+goldTxt()+'</span></h4><div class="mu" style="margin:2px 0 4px">Baguettes et robes : Échoppe de l’Artisan (Village de Brumepont), créatures élites, Ignivor.</div>';
  h+='<div class="sec" style="margin:6px 0 2px">Baguettes</div>'+Object.entries(WANDS).filter(([k])=>hasGear('w',k)).map(([k,G])=>row('w',k,G,S.equip.wand===k)).join('');
  h+='<div class="sec" style="margin:6px 0 2px">Robes</div>'+Object.entries(ROBES).filter(([k])=>hasGear('r',k)).map(([k,G])=>row('r',k,G,S.equip.robe===k)).join('');
  d.innerHTML=h;b.insertBefore(d,b.children[1]||null);d.querySelectorAll('[data-eq]').forEach(x=>x.onclick=()=>{const [t,k]=x.dataset.eq.split(':');equip(t,k);renderBook();});};}
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object'){gearInit();r.equipement='Baguette : '+gearW().n+' ; robe : '+gearR().n+' ; '+(S.or||0)+' pièces d’or. Échoppe de l’Artisan à Brumepont (baguettes, robes, rachat des récoltes).';}}catch(e){}return r;};}
