/* ================= COUPS CRITIQUES ET SORTS DE GARDE =================
   Critiques : environ 1 sort d'attaque ou de zone sur 10 (un peu plus avec la maîtrise de l'élément) part sous
   sa « forme majeure » : projectile énorme, doré et guidé, zone 40 % plus large (CRITNOW dans pow(), 02-etat),
   dégâts doublés (×1,5 contre Ignivor et en duel). Créature achevée par un critique : une prime (XP, parfois un ingrédient).
   Sorts de garde (série de 4, un appris à chaque duel gagné à l'Arène) : Rempart de pierre, Égide miroir,
   Haie de ronces, Mur d'eau. Les murs sont des collisions temporaires (COLS) : ils bloquent le joueur,
   les créatures et les projectiles (hitsSolid). L'égide renvoie les projectiles des duellistes et de la Faille. */
const critChance=sp=>0.1+0.005*mLvl(sp.el);
function critFx(e,txt){const y=gh(e.x,e.z)+(e.data.dragon?e.data.y:1.2);floatAt(e.x,e.z,'✦ CRITIQUE'+(txt?' '+txt:'')+' ✦','#ffd27a');
 HITSTOP=Math.max(HITSTOP,0.07);SHAKE=Math.max(SHAKE,0.35);flash(e.x,y,e.z,0xffd27a,3.5,0.35);
 for(let i=0;i<36;i++){const a=Math.random()*TAU,b=rnd(-0.3,1),v=rnd(3,8);PA.emit(e.x,y,e.z,Math.cos(a)*v,b*v+1,Math.sin(a)*v,i%3?0xffd27a:0xffffff,rnd(.3,.55),0.05,rnd(.4,.8),5,1);}}
function prime(e){const xp=10+Math.floor(rnd(0,7));gainXP(xp);S.primes=(S.primes||0)+1;floatAt(e.x,e.z,'💰 PRIME +'+xp+' XP','#ffe08a');
 if(Math.random()<0.35){const k=pick(Object.keys(INGR));addItem(k,1);say('💰 Prime de coup critique : +'+xp+' XP et 1 '+esc(INGR[k].n)+'.','sys');}else say('💰 Prime de coup critique : +'+xp+' XP.','sys');}
// au lancement : on tire le critique et on habille le sort
{const _cs=castSpell;castSpell=function(sp){if(!sp||sp.form==='util'||sp.special)return _cs.apply(this,arguments);
  const now=performance.now()/1000,ready=!((CD[sp.id]||0)>now||player.cd>0)&&mana>=spellCost(sp);
  if(!ready||Math.random()>=critChance(sp))return _cs.apply(this,arguments);
  const n0=PROJ.length;CRITNOW=true;let r;try{r=_cs.apply(this,arguments);}finally{CRITNOW=false;}
  S.crits=(S.crits||0)+1;const c=ELEM[sp.el].c;
  PROJ.slice(n0).forEach(p=>{p.crit=true;p.o.scale.multiplyScalar(1.6);p.o.add(glow(0xffd27a,2.4,0.85));p.life+=0.4;
   if(!p.ht){const L=Math.hypot(p.vx,p.vz)||1,T=castTarget(sp.el,p.vx/L,p.vz/L,false);if(T&&T.ref&&T.kind==='crea')p.ht={kind:'crea',ref:T.ref};}});
  floatAt(player.x,player.z,'✦ CRITIQUE ✦','#ffd27a');ring(player.x,player.z,0xffd27a,sp.form==='zone'?6:2.2,0.7);flash(player.x,player.y+1.4,player.z,0xffd27a,3,0.4);SHAKE=Math.max(SHAKE,0.2);
  if(sp.form==='zone'){shockRing(player.x,player.z,c,7);for(let i=0;i<50;i++){const a=Math.random()*TAU,v=rnd(4,9);PA.emit(player.x,player.y+0.5,player.z,Math.cos(a)*v,rnd(0.5,2),Math.sin(a)*v,i%2?0xffd27a:c,rnd(.4,.7),0.05,rnd(.5,.9),1,1);}}
  sfx('impact','lumiere',player.x,player.z);return r;};}
// traînée dorée des projectiles critiques
{const _u=updProj;updProj=function(dt){for(const p of PROJ)if(p.crit){const o=p.o.position;for(let j=0;j<2;j++)PA.emit(o.x+rnd(-.2,.2),o.y+rnd(-.2,.2),o.z+rnd(-.2,.2),rnd(-.5,.5),rnd(-.2,.6),rnd(-.5,.5),j?0xffd27a:0xffffff,rnd(.25,.45),0.05,rnd(.3,.5),0,1);}return _u.apply(this,arguments);};}
{const _im=impact;impact=function(el,x,y,z){if(CRITNOW){shockRing(x,z,0xffd27a,3.2);SHAKE=Math.max(SHAKE,0.4);}return _im.apply(this,arguments);};}
// dégâts
{const _h=hurtCreature;hurtCreature=function(e,el,x,z){if(!CRITNOW||!e||!e.data)return _h.apply(this,arguments);const D=e.data,was=ENT.includes(e);
  if(D.dragon){if(el==='feu')return _h.apply(this,arguments);critFx(e);return dragonHit(e,el,(el==='glace'?9:4.5)*1.5);}
  if(D.duel){const b=DUEL?DUEL.ohp:0;_h.apply(this,arguments);if(DUEL&&DUEL.e===e&&DUEL.phase==='fight'){const lost=b-DUEL.ohp;if(lost>0){const x2=Math.round(lost*0.5);DUEL.ohp-=x2;critFx(e,'-'+x2);duelHUD();if(DUEL.ohp<=0)duelEnd(true);}}return;}
  if(D.calme)return _h.apply(this,arguments);
  critFx(e);_h.apply(this,arguments);if(ENT.includes(e))_h.apply(this,arguments);if(was&&!ENT.includes(e)&&!D.wave)prime(e);};}

/* ================= SORTS DE GARDE ================= */
const GARDE_SP={
 rempart:{name:'Rempart de pierre',inc:'Murus Saxeus',el:'nature',cost:28,cd:12,desc:'Des rochers jaillissent du sol devant toi et bouchent le passage pendant 12 s. Ils arrêtent créatures et projectiles.'},
 egide:{name:'Égide miroir',inc:'Speculum Aegis',el:'arcane',cost:35,cd:18,desc:'Une bulle miroitante t’entoure 5 s : elle arrête les projectiles et renvoie ceux des duellistes vers leur lanceur.'},
 ronces:{name:'Haie de ronces',inc:'Saepes Spinarum',el:'nature',cost:30,cd:16,desc:'Des arbres épineux poussent en cercle autour de toi (une sortie dans ton dos) pendant 12 s. Qui s’y frotte est blessé et entravé.'},
 maree:{name:'Mur d’eau',inc:'Murus Aquae',el:'eau',cost:26,cd:12,desc:'Une vague se dresse devant toi pendant 8 s : elle éteint les flammes, arrête les projectiles et repousse les créatures.'}};
const GARDE_ORD=['rempart','egide','ronces','maree'];
const gardeSpell=k=>{const G=GARDE_SP[k];return {name:G.name,inc:G.inc,el:G.el,form:'util',desc:G.desc,special:'g-'+k,legend:true,garde:true,cost:G.cost,cd:G.cd,id:'garde-'+k};};
const gardeHas=k=>S&&S.spells&&S.spells.some(s=>s.special==='g-'+k);
function gardeLearn(k){if(gardeHas(k))return;const sp=gardeSpell(k);learnSpell(sp);banner('Sort de garde !','🛡 '+sp.name+' — '+sp.inc);
 const n=GARDE_ORD.filter(gardeHas).length;setTimeout(()=>say('🛡 Sorts de garde : <b>'+n+'/4</b>. '+esc(sp.desc)+' Place-le dans un emplacement depuis le Grimoire.','gm'),900);chron('Sort de garde : '+sp.name);save();}
// un duel gagné à l'Arène enseigne le sort de garde suivant
{const _de=duelEnd;duelEnd=function(won){const was=DUEL&&DUEL.phase!=='end';const r=_de.apply(this,arguments);if(won&&was){const k=GARDE_ORD.find(x=>!gardeHas(x));if(k)setTimeout(()=>{say('🛡 Ton adversaire salue ta victoire et t’enseigne une parade.','gm');gardeLearn(k);},2000);}return r;};}
{const _u=doUtil;doUtil=function(sp){if(sp&&sp.garde){const k=sp.special.slice(2);return castGarde(k);}return _u.apply(this,arguments);};}
const WALLS=[];let AEGIS=null;
const WGEO={rock:new THREE.DodecahedronGeometry(0.85,0),cone:new THREE.ConeGeometry(0.55,2.3,6),trunk:new THREE.CylinderGeometry(0.12,0.16,0.7,6),thorn:new THREE.ConeGeometry(0.06,0.4,4)};
function wallAdd(kind,pieces,life,extra){const W=Object.assign({kind,pieces,t:0,life},extra||{});pieces.forEach(P=>{P.col={x:P.x,z:P.z,r:P.r,h:P.h,garde:true};COLS.push(P.col);});WALLS.push(W);return W;}
function wallFree(W){W.pieces.forEach(P=>{const i=COLS.indexOf(P.col);if(i>=0)COLS.splice(i,1);if(P.o)scene.remove(P.o);});if(W.o)scene.remove(W.o);}
function wallLine(dist,n,gap){const [dx,dz]=fwd(),px=-dz,pz=dx,cx=player.x+dx*dist,cz=player.z+dz*dist,pts=[];for(let i=0;i<n;i++){const s=(i-(n-1)/2)*gap;pts.push({x:cx+px*s,z:cz+pz*s});}return {pts,cx,cz,yaw:Math.atan2(dx,dz)};}
function castGarde(k){
 if(k==='rempart'){const L=wallLine(3,7,1.15);const pieces=L.pts.map((p,i)=>{const o=new THREE.Mesh(WGEO.rock,mat(i%2?0x8a8478:0x777064,{flatShading:true,roughness:0.95}));const s=rnd(0.85,1.15);o.scale.set(s,rnd(1.3,1.7),s);o.rotation.set(rnd(-.3,.3),Math.random()*TAU,rnd(-.3,.3));o.castShadow=true;o.position.set(p.x,gh(p.x,p.z)-2,p.z);scene.add(o);
   for(let j=0;j<8;j++)PN.emit(p.x+rnd(-.6,.6),gh(p.x,p.z)+0.2,p.z+rnd(-.6,.6),rnd(-1.5,1.5),rnd(1,3),rnd(-1.5,1.5),0x6a5a44,0.4,0.7,rnd(.6,1.1),5,0.6,0.85);return {x:p.x,z:p.z,r:0.7,h:2.2,o,y0:gh(p.x,p.z)};});
  wallAdd('rempart',pieces,12);SHAKE=Math.max(SHAKE,0.45);sfx('impact','nature',L.cx,L.cz);say('🪨 Un <b>rempart de pierre</b> jaillit du sol !','sys');}
 else if(k==='ronces'){const pieces=[];const n=13,R=3.3;for(let i=0;i<n;i++){const a=player.ry+Math.PI*(-0.83+1.66*i/(n-1)),x=player.x+Math.sin(a)*R,z=player.z+Math.cos(a)*R;
   const g=new THREE.Group();const t=new THREE.Mesh(WGEO.trunk,mat(0x4a3424));t.position.y=0.35;g.add(t);const c=new THREE.Mesh(WGEO.cone,mat(i%2?0x2f5a2a:0x3a6a30,{flatShading:true}));c.position.y=1.6;c.castShadow=true;g.add(c);
   for(let j=0;j<5;j++){const th=new THREE.Mesh(WGEO.thorn,mat(0xd8c89a));const b=Math.random()*TAU;th.position.set(Math.cos(b)*0.42,rnd(0.9,2),Math.sin(b)*0.42);th.rotation.set(0,0,0);th.lookAt(Math.cos(b)*2,th.position.y,Math.sin(b)*2);th.rotateX(Math.PI/2);g.add(th);}
   g.position.set(x,gh(x,z),z);g.scale.setScalar(0.01);g.rotation.y=Math.random()*TAU;scene.add(g);pieces.push({x,z,r:0.62,h:2.6,o:g,y0:gh(x,z),grow:true});}
  wallAdd('ronces',pieces,12,{hurt:{}});ring(player.x,player.z,0x6fe36f,R+0.5,0.8);sfx('cast','nature','zone',player.x,player.z);say('🌲 Une <b>haie de ronces</b> pousse autour de toi.','sys');}
 else if(k==='maree'){const L=wallLine(2.6,7,1.1);const g=new THREE.Group();g.position.set(L.cx,gh(L.cx,L.cz),L.cz);g.rotation.y=L.yaw;
  const w=new THREE.Mesh(new THREE.PlaneGeometry(8,3.4,16,4),new THREE.MeshStandardMaterial({color:0x3a9ad8,emissive:0x0a3a6a,transparent:true,opacity:0.0,roughness:0.15,metalness:0.2,side:THREE.DoubleSide,depthWrite:false}));w.position.y=1.7;g.add(w);
  const top=glow(0xbfe8ff,3,0.5);top.position.y=3.3;g.add(top);scene.add(g);
  const pieces=L.pts.map(p=>({x:p.x,z:p.z,r:0.62,h:3.4}));wallAdd('maree',pieces,8,{o:g,w,yaw:L.yaw,cx:L.cx,cz:L.cz});
  if(typeof elemHit==='function')elemHit('eau',L.cx,L.cz,4.5);sfx('impact','eau',L.cx,L.cz);say('🌊 Un <b>mur d’eau</b> se dresse devant toi.','sys');}
 else if(k==='egide'){if(AEGIS){AEGIS.t=5;AEGIS.hits=0;return;}const g=new THREE.Group();const sph=new THREE.Mesh(new THREE.SphereGeometry(1.5,24,16),new THREE.MeshStandardMaterial({color:0xd8b8ff,emissive:0x8a4ad8,emissiveIntensity:0.6,transparent:true,opacity:0.22,roughness:0.05,metalness:0.8,side:THREE.DoubleSide,depthWrite:false}));g.add(sph);
  const gl=glow(0xff9ae8,3.4,0.35);g.add(gl);scene.add(g);AEGIS={g,sph,t:5,hits:0};sfx('shield');flash(player.x,player.y+1,player.z,0xff9ae8,3,0.4);say('🔮 L’<b>égide miroir</b> t’enveloppe.','sys');}}
// renvoi d'un projectile ennemi vers une créature (il devient un projectile du joueur)
function reflectTo(p,el,tgt){const o=p.o.position;if(!tgt||!ENT.includes(tgt)){burst(o.x,o.y,o.z,ELEM[el].c,10,3);scene.remove(p.o);return;}
 const ty=gh(tgt.x,tgt.z)+(tgt.data.y||1),dx=tgt.x-o.x,dy=ty-o.y,dz=tgt.z-o.z,L=Math.hypot(dx,dy,dz)||1,sp=18;
 PROJ.push({o:p.o,el,vx:dx/L*sp,vy:dy/L*sp,vz:dz/L*sp,life:2.5,grav:0,c:ELEM[el].c,light:null,t:0,ht:{kind:'crea',ref:tgt},tp:null});flash(o.x,o.y,o.z,0xff9ae8,2,0.25);floatAt(player.x,player.z,'Renvoyé !','#ff9ae8');}
function inWall(x,y,z,pad){for(const W of WALLS)for(const P of W.pieces){if(Math.hypot(x-P.x,z-P.z)<P.r+(pad||0)&&y<gh(P.x,P.z)+P.h+0.3)return W;}return null;}
function gardeTick(dt){if(!started)return;
 for(let i=WALLS.length-1;i>=0;i--){const W=WALLS[i];W.t+=dt;const end=W.life-W.t,rise=Math.min(1,W.t/0.35),sink=end<0.6?Math.max(0,end/0.6):1;
  W.pieces.forEach(P=>{if(!P.o)return;if(P.grow){P.o.scale.setScalar(Math.max(0.01,Math.min(1,W.t/0.5)*sink));}else P.o.position.y=P.y0-2+2.5*rise*sink;});
  if(W.kind==='maree'){W.w.material.opacity=0.55*rise*sink;const a=W.w.geometry.attributes.position;for(let j=0;j<a.count;j++){const x=a.getX(j),y=a.getY(j);a.setZ(j,Math.sin(x*1.3+W.t*4+y)*0.18);}a.needsUpdate=true;
   if(Math.random()<0.7){const s=rnd(-4,4),x=W.cx+Math.cos(W.yaw)*s,z=W.cz-Math.sin(W.yaw)*s;PA.emit(x,gh(x,z)+rnd(2.6,3.4),z,rnd(-.5,.5),rnd(0.5,2),rnd(-.5,.5),0xcfefff,rnd(.25,.45),0.05,rnd(.4,.8),6,1);}}
  // les créatures ne passent pas ; ronces : piquent ; eau : repousse
  for(const e of ENT){if(e.kind!=='creature'||e.data.dragon||e.data.duel)continue;for(const P of W.pieces){const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz),m=P.r+(e.data.rad||0.6)*0.8;if(d<m){const k=d>1e-3?m/d:1;e.x=P.x+dx*k;e.z=P.z+dz*k;
     if(W.kind==='ronces'&&!e.data.calme&&(W.hurt[e.id]||0)<W.t-1){W.hurt[e.id]=W.t;hurtCreature(e,'nature',P.x,P.z);if(ENT.includes(e))e.data.rooted=2;}
     if(W.kind==='maree'){e.data.kx=(e.data.kx||0)+dx/(d||1)*6;e.data.kz=(e.data.kz||0)+dz/(d||1)*6;}}}}
  if(end<=0){wallFree(W);WALLS.splice(i,1);}}
 // projectiles ennemis arrêtés par les murs (les boules de feu d'Ignivor passent au-dessus si elles arrivent de haut)
 if(WALLS.length)for(let i=BOSS.fb.length-1;i>=0;i--){const f=BOSS.fb[i];if(f.dl>0)continue;const W=inWall(f.x,f.y,f.z,0.3);if(W){burst(f.x,f.y,f.z,W.kind==='maree'?0xbfe8ff:0xff7a2e,14,4);if(W.kind==='maree')PN.emit(f.x,f.y,f.z,0,2,0,0xdddddd,0.6,1.5,1.2,-0.5,0.6,0.6);scene.remove(f.o);BOSS.fb.splice(i,1);}}
 // égide miroir
 if(AEGIS){const A=AEGIS;A.t-=dt;A.g.position.set(player.x,player.y+1,player.z);A.sph.rotation.y+=dt*1.5;const pulse=1+Math.sin(performance.now()/120)*0.03;A.g.scale.setScalar(pulse*(A.t<0.5?Math.max(0.05,A.t/0.5):1));
  const near=(o,r)=>Math.hypot(o.x-player.x,o.z-player.z)<(r||1.8)&&Math.abs(o.y-(player.y+1))<1.9;
  if(typeof DUEL!=='undefined'&&DUEL&&DPROJ.length)DPROJ=DPROJ.filter(p=>{if(!near(p.o.position))return true;reflectTo(p,p.el,DUEL.e);return false;});
  if(typeof WPROJ!=='undefined'&&WPROJ.length)WPROJ=WPROJ.filter(p=>{if(!near(p.o.position))return true;let best=null,bd=30;for(const e of ENT){if(e.kind!=='creature'||!e.data.wave)continue;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;best=e;}}reflectTo(p,p.el,best);return false;});
  for(let i=BOSS.fb.length-1;i>=0;i--){const f=BOSS.fb[i];if(f.dl>0||!near(f,2))continue;burst(f.x,f.y,f.z,0xff9ae8,16,4);scene.remove(f.o);BOSS.fb.splice(i,1);A.hits++;
   if(A.hits>=2){A.t=Math.min(A.t,0.3);say('🔮 L’égide se brise sous le feu d’Ignivor !','sys');}else floatAt(player.x,player.z,'Bloqué !','#ff9ae8');}
  if(A.t<=0){scene.remove(A.g);AEGIS=null;}}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{gardeTick(dt);}catch(e){console.error(e);}return r;};}
// changement de lieu : les murs disparaissent
{const _ez=enterZone;enterZone=function(){WALLS.splice(0).forEach(wallFree);if(AEGIS){scene.remove(AEGIS.g);AEGIS=null;}return _ez.apply(this,arguments);};}
// le Grimoire montre la série
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);if(bookTab!=='sorts')return;const n=GARDE_ORD.filter(gardeHas).length;
  let h='<div class="it" style="border-color:rgba(143,208,255,.55)"><h4>🛡 Sorts de garde<span class="badge" style="color:#bfe8ff">'+n+'/4</span></h4>';
  GARDE_ORD.forEach(k=>{const G=GARDE_SP[k],ok=gardeHas(k);h+='<div style="margin:5px 0;'+(ok?'':'opacity:.7')+'">'+(ok?'🛡 <b>'+esc(G.name)+'</b> <span class="mu">— '+esc(G.desc)+'</span>':'❔ <span class="mu">Gagne un duel à l’Arène pour apprendre une nouvelle parade.</span>')+'</div>';});
  h+='<div class="mu" style="margin-top:6px">✦ Coups critiques : '+(S.crits||0)+' · primes : '+(S.primes||0)+'</div>';
  const b=$('#book-body'),d=document.createElement('div');d.innerHTML=h+'</div>';b.insertBefore(d.firstChild,b.children[1]||null);};}
