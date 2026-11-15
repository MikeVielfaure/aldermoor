/* ================= CRÉATURES ÉLITES =================
   Environ 1 créature hostile sur 14 (dès le niveau 3, hors duels, Faille, dragon et événements) devient une ÉLITE :
   plus grosse, couronnée, 3 fois plus de vie, et un pouvoir :
   - bouclier : une bulle absorbe le prochain coup (se recharge toutes les 7 s) ;
   - régénérante : reprend 1 PV toutes les 3 s si on ne la touche pas ;
   - meneuse : sous la moitié de sa vie, appelle deux renforts (une fois) ;
   - enragée : sous la moitié de sa vie, elle fonce et mord plus fort.
   Butin : essences, cristaux, XP, parfois une potion ou un point de talent. */
const ELITE_POW={bouclier:'au bouclier',regen:'régénérante',meneuse:'meneuse de meute',rage:'enragée'};
const CROWNG=new THREE.ConeGeometry(0.07,0.22,4),CROWNR=new THREE.TorusGeometry(0.22,0.05,6,16);
function makeElite(e){const D=e.data,pw=pick(Object.keys(ELITE_POW));D.elite=pw;D.hp=Math.max(3,D.hp*3);D.hp0=D.hp;D.scale=(D.scale||1)*1.35;D.rad=(D.rad||1.2)*1.35;e.obj.scale.multiplyScalar(1.35);
 D.baseName=D.name;D.name='★ '+D.name+' ('+ELITE_POW[pw]+')';D.eT=0;D.shieldOn=pw==='bouclier';D.shT=0;
 const cr=new THREE.Group(),gold=mat(0xffd24a,{emissive:0xa07010,emissiveIntensity:0.6,metalness:0.6,roughness:0.3});const r=new THREE.Mesh(CROWNR,gold);r.rotation.x=Math.PI/2;cr.add(r);
 for(let i=0;i<5;i++){const a=i/5*TAU,c=new THREE.Mesh(CROWNG,gold);c.position.set(Math.cos(a)*0.22,0.12,Math.sin(a)*0.22);cr.add(c);}cr.position.y=2.0;e.obj.add(cr);D.crown=cr;
 if(pw==='bouclier'){const b=new THREE.Mesh(new THREE.SphereGeometry(1.1,16,12),new THREE.MeshBasicMaterial({color:0x9ad8ff,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false}));b.position.y=0.9;e.obj.add(b);D.bubble=b;}}
// un coup sur le bouclier est absorbé
{const _h=hurtCreature;hurtCreature=function(e,el,x,z){const D=e&&e.data;if(D&&D.elite){D.hitT=performance.now()/1000;if(D.shieldOn){D.shieldOn=false;D.shT=7;if(D.bubble)D.bubble.visible=false;burst(e.x,gh(e.x,e.z)+1,e.z,0x9ad8ff,18,4);sfx('shield');floatAt(e.x,e.z,'Bouclier !','#bfe8ff');return;}}return _h.apply(this,arguments);};}
// butin
{const _k=killCreature;killCreature=function(e){const D=e&&e.data;const was=D&&D.elite&&ENT.includes(e);const r=_k.apply(this,arguments);
  if(was&&!ENT.includes(e)){const es=2+Math.floor(Math.random()*3),cr=1+Math.floor(Math.random()*2);addItem('essence',es);addItem('cristal',cr);gainXP(60);let extra='';
   if(Math.random()<0.25){const pk=pick(['soin','puissance','mana','invis']);S.inv['p_'+pk]=(S.inv['p_'+pk]||0)+1;extra+=', '+POTIONS[pk].n;}
   if(Math.random()<0.08){S.relics=(S.relics||0)+1;extra+=', +1 point de talent';}S.elites=(S.elites||0)+1;
   burst(e.x,gh(e.x,e.z)+1.2,e.z,0xffd24a,40,6);shockRing(e.x,e.z,0xffd24a,3);banner('Élite vaincue !','+'+es+' essences, +'+cr+' cristaux, +60 XP'+extra);sfx('win');save();}
  return r;};}
function eliteTick(dt){if(!started||S.zone!=='monde')return;const now=performance.now()/1000;
 for(const e of ENT){if(e.kind!=='creature')continue;const D=e.data;
  if(!D.eliteChk){D.eliteChk=1;if(lvl()>=3&&!D.calme&&!D.duel&&!D.wave&&!D.dragon&&!D.evt&&!D.charmed&&!D.boss&&Math.random()<0.07)makeElite(e);}
  if(!D.elite)continue;D.eT-=dt;
  if(D.crown){D.crown.rotation.y+=dt*1.2;}if(Math.random()<dt*6)PA.emit(e.x+rnd(-.5,.5),gh(e.x,e.z)+rnd(0.3,2),e.z+rnd(-.5,.5),0,rnd(.3,1),0,0xffd24a,0.25,0.05,0.6,0,1);
  const dp=Math.hypot(player.x-e.x,player.z-e.z);if(!D.seen&&dp<22){D.seen=1;say('⚔ Une créature <b>élite</b> rôde : '+esc(D.name)+'. Elle rapporte un beau butin.','gm');}
  if(D.elite==='bouclier'&&!D.shieldOn){D.shT-=dt;if(D.shT<=0){D.shieldOn=true;if(D.bubble)D.bubble.visible=true;}}
  if(D.elite==='regen'&&D.hp<D.hp0&&now-(D.hitT||0)>3&&D.eT<=0){D.eT=3;D.hp++;burst(e.x,gh(e.x,e.z)+1,e.z,0x7be36b,10,2);}
  if(D.elite==='meneuse'&&!D.called&&D.hp<=D.hp0/2){D.called=1;for(let i=0;i<2;i++){const a=Math.random()*TAU,m=spawnCreatureAt(e.x+Math.cos(a)*3,e.z+Math.sin(a)*3,D.baseName,D.weak,D.look,2);m.data.eliteChk=1;}say('📣 '+esc(D.name)+' appelle des renforts !','sys');shockRing(e.x,e.z,ELEM[D.look].c,4);}
  if(D.elite==='rage'&&D.hp<=D.hp0/2&&!(D.frozen>0)&&!(D.rooted>0)&&dp<12&&dp>1.2){if(!D.raging){D.raging=1;floatAt(e.x,e.z,'Enragée !','#ff7a5a');}const s=Math.min(dp-1.2,dt*3.5);e.x+=(player.x-e.x)/dp*s;e.z+=(player.z-e.z)/dp*s;if(Math.random()<dt*10)fireAt(e.x,gh(e.x,e.z)+0.5,e.z,0.3,1);}}}
// morsure plus forte pour une élite enragée
{const _vh=vieHurt;vieHurt=function(n){const near=ENT.find(e=>e.kind==='creature'&&e.data.raging&&Math.hypot(player.x-e.x,player.z-e.z)<1.6);return _vh.call(this,near?n*1.8:n);};}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{eliteTick(dt);}catch(e){console.error(e);}return r;};}
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);if(bookTab!=='perso')return;const it=$('#book-body').querySelectorAll('.it')[1];if(!it)return;const d=document.createElement('div');
  d.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span class="mu">Élites vaincues</span><b>'+(S.elites||0)+'</b></div>';it.appendChild(d.firstChild);};}
