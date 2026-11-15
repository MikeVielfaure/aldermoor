/* ================= VIE DU JOUEUR, CRÉATURES PLUS VIVANTES, PNJ QUI TE REGARDENT =================
   - Vie (PV) dans le monde : une créature hostile qui te mord fait mal (plus dans les Landes). La vie revient
     après 5 s sans coup (plus vite immobile au sol). À 0 : tu t'évanouis et tu te réveilles en lieu sûr
     (Grande Cour, ou Campement dans les Landes), sans autre perte. Barre rouge au-dessus du mana, visible
     seulement quand tu es blessé. Boss, duel et Faille gardent leurs propres barres (VIE ne bouge pas alors).
   - Potion de soin (Pétale enchanté + Champignon lunaire).
   - Créatures : petite barre de vie au-dessus d'elles une fois touchées ; animation de mort (elles s'effondrent
     puis s'enfoncent) au lieu de disparaître d'un coup.
   - PNJ : quand tu t'approches, ils s'arrêtent et se tournent vers toi. */
const VIE={hp:100,max:100,calm:0,faint:false};
const vieMax=()=>100+2*Math.min(50,lvl());
const vieBusy=()=>!started||BOSS.on||!!DUEL||(typeof WAVE!=='undefined'&&!!WAVE)||VIE.faint;
function vieHud(){const b=$('#viebox');if(!b)return;const hurt=VIE.hp<VIE.max-0.5&&!vieBusy();b.classList.toggle('hidden',!hurt);if(hurt){$('#vie-bar i').style.width=clamp(VIE.hp/VIE.max*100,0,100)+'%';$('#vie-n').textContent=Math.ceil(VIE.hp);}}
function vieHurt(n){if(vieBusy())return;if(BUFF.invis)n*=0.5;VIE.hp-=n;VIE.calm=5;sfx('hurt');SHAKE=Math.max(SHAKE,0.25);const hv=$('#hurt');hv.style.opacity=0.7;setTimeout(()=>hv.style.opacity=0,180);
 if(!S.seenVie){S.seenVie=1;say('❤ Les créatures te blessent ! Ta <b>vie</b> revient si tu t’éloignes ou te reposes. Une <b>potion de soin</b> la rend d’un coup.','gm');}
 if(VIE.hp<=0)vieFaint();vieHud();}
function vieFaint(){VIE.faint=true;VIE.hp=0;sfx('poof');
 fade(()=>{const L=player.x>1500&&LOCBY.landes_camp?LOCBY.landes_camp:LOCBY.cour;if(S.zone==='monde'){player.x=L.spot.x;player.z=L.spot.z;player.y=gh(player.x,player.z);}player.vx=player.vz=player.vy=0;
  VIE.max=vieMax();VIE.hp=VIE.max;VIE.faint=false;mana=Math.max(mana,manaMax()*0.5);vieHud();
  say('💫 Tout devient noir… Tu te réveilles '+(S.zone==='monde'?'à <b>'+esc(L.name)+'</b>':'un peu plus tard')+', soigné(e) par quelqu’un de bienveillant.','gm');chron('Évanoui(e) face aux créatures.');});}
// potion de soin
POTIONS.soin={n:'Potion de soin',c:0xff5a6a,need:{petale:1,lune:1},d:'Rend toute ta vie.'};
{const _d=drink;drink=function(pid){if(pid!=='soin')return _d.apply(this,arguments);if(!((S.inv.p_soin||0)>0))return;S.inv.p_soin--;VIE.max=vieMax();VIE.hp=VIE.max;vieHud();
  sfx('learn');for(let i=0;i<30;i++){const a=Math.random()*TAU;PA.emit(player.x+Math.cos(a)*0.5,player.y+rnd(0,2),player.z+Math.sin(a)*0.5,0,rnd(1,2.5),0,i%2?0xff5a6a:0xffc0c8,0.3,0.05,rnd(.6,1),0,0.5);}
  say('❤ Tu bois la potion de soin : te voilà en pleine forme.','sys');save();if(!$('#book').classList.contains('hidden'))renderBook();};}
/* ---------- créatures : barre de vie et mort animée ---------- */
const CBAR=new Map(),CORPSES=[];
function cbarDraw(B,k){const g=B.c.getContext('2d');g.clearRect(0,0,64,10);g.fillStyle='rgba(10,8,20,.75)';g.fillRect(0,0,64,10);g.fillStyle=k>0.5?'#7be36b':k>0.25?'#f3cf7a':'#ff5a5a';g.fillRect(2,2,Math.max(0,60*k),6);B.t.needsUpdate=true;}
function cbarFor(e){let B=CBAR.get(e);if(B)return B;const c=document.createElement('canvas');c.width=64;c.height=10;const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(1.3,0.2,1);s.renderOrder=5;scene.add(s);B={s,c,t,hp:-1};CBAR.set(e,B);return B;}
{const _r=removeEnt;removeEnt=function(e){const D=e&&e.data;
  if(e&&e.kind==='creature'&&D&&D.M&&D.M.A.Death&&D.hp<=0&&!D.nocorpse&&!D.duel&&!D.dragon&&ENT.includes(e)&&S.zone==='monde'){
   const M=D.M,obj=e.obj;e.obj=new THREE.Group();scene.add(e.obj);const a=M.A.Death;a.reset();a.setLoop(THREE.LoopOnce,1);a.clampWhenFinished=true;a.play();if(M.cur&&M.A[M.cur]&&M.A[M.cur]!==a)M.A[M.cur].crossFadeTo(a,0.1,false);M.cur='Death';
   if(D.gl)D.gl.visible=false;obj.children.forEach(o=>{if(o.isSprite)o.visible=false;});CORPSES.push({obj,M,t:0,y0:obj.position.y});}
  return _r.apply(this,arguments);};}
// Démantibulus réduit en miettes : pas de cadavre
{const _k=killCreature;killCreature=function(e){if(e&&e.data&&e.data.hp>0)e.data.nocorpse=true;return _k.apply(this,arguments);};}
function vieTick(dt){if(!started)return;
 /* chute plumée après un saut du balai en plein vol (15-balai : toggleBroom) */
 if(player.feather){if(player.grounded||FLY.on||player.swim)player.feather=0;else{if(player.vy<-6.5)player.vy=-6.5;if(Math.random()<dt*20)PA.emit(player.x+rnd(-.5,.5),player.y+rnd(0,1.5),player.z+rnd(-.5,.5),rnd(-.3,.3),rnd(.5,1.5),rnd(-.3,.3),0xfff4d8,0.22,0.05,0.7,0,1);}}if(!VIE.init){VIE.init=1;VIE.hp=vieMax();}
 // vie : morsures, retour au calme
 {const m=vieMax();if(m>VIE.max)VIE.hp+=m-VIE.max;VIE.max=m;}if(VIE.hp>VIE.max)VIE.hp=VIE.max;
 if(!vieBusy()&&S.zone==='monde'&&!FLY.on){for(const e of ENT){if(e.kind!=='creature')continue;const D=e.data;if(D.calme||D.duel||D.wave||D.dragon||D.frozen>0||D.confused>0)continue;
   D.biteT=(D.biteT||0)-dt;const dp=Math.hypot(player.x-e.x,player.z-e.z);if(dp<1.25&&player.y-gh(player.x,player.z)<1.5&&D.biteT<=0){D.biteT=1.1;vieHurt(e.x>1500?8:5);}}}
 VIE.calm-=dt;if(VIE.calm<=0&&VIE.hp<VIE.max&&!VIE.faint){const med=player.grounded&&player.spd<0.05;VIE.hp=Math.min(VIE.max,VIE.hp+dt*(med?14:6));}
 vieHud();
 // barres de vie des créatures
 for(const [e,B] of CBAR){if(!ENT.includes(e)){scene.remove(B.s);B.s.material.map.dispose();B.s.material.dispose();CBAR.delete(e);}}
 for(const e of ENT){if(e.kind!=='creature')continue;const D=e.data;if(D.duel||D.dragon||D.wave)continue;if(D.hp0===undefined)D.hp0=Math.max(1,D.hp);
  if(D.hp>=D.hp0&&!CBAR.has(e))continue;const B=cbarFor(e);if(B.hp!==D.hp){B.hp=D.hp;cbarDraw(B,clamp(D.hp/D.hp0,0,1));}
  const sc=e.obj.scale.x||1;B.s.position.set(e.x,e.obj.position.y+((D.M&&D.M.vol)?2.5:1.95)*sc,e.z);B.s.visible=Math.hypot(e.x-player.x,e.z-player.z)<30;}
 // cadavres : animation de mort, puis ils s'enfoncent dans le sol
 for(let i=CORPSES.length-1;i>=0;i--){const C=CORPSES[i];C.t+=dt;C.M.mx.update(dt);if(C.t>1.3){C.obj.position.y=C.y0-(C.t-1.3)*0.9;}if(C.t>2.6){scene.remove(C.obj);CORPSES.splice(i,1);}}
 // PNJ : ils s'arrêtent et se tournent vers toi
 for(const n of npcs){if(n.sleep||n.inDuel)continue;const dx=player.x-n.x,dz=player.z-n.z,d=Math.hypot(dx,dz);if(d>3.2||n.spd>0.15)continue;
  n.wait=Math.max(n.wait||0,1.5);let r=Math.atan2(dx,dz)-n.obj.rotation.y;r=Math.atan2(Math.sin(r),Math.cos(r));n.obj.rotation.y+=r*Math.min(1,dt*4);}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{vieTick(dt);}catch(e){console.error(e);}return r;};}
// changement de zone : les cadavres disparaissent
{const _ez=enterZone;enterZone=function(){CORPSES.splice(0).forEach(C=>scene.remove(C.obj));return _ez.apply(this,arguments);};}
// fenêtre du personnage : la vie
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);if(bookTab!=='perso')return;const it=$('#book-body').querySelectorAll('.it')[1];if(!it)return;const d=document.createElement('div');
  d.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span class="mu">Vie</span><b>'+Math.ceil(VIE.hp)+' / '+VIE.max+'</b></div>';it.insertBefore(d.firstChild,it.children[2]||null);};}
