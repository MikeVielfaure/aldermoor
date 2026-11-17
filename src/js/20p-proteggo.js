/* ================= PROTEGGO : le mana devient bouclier =================
   Proteggo (Arcane, 55 mana) crée une bulle protectrice là où on le lance : sur le point marqué / le viseur libre,
   sinon autour de soi (et, en vol, la bulle reste suspendue en l'air). La bulle s'use avec le temps ; relancer
   Proteggo dans une bulle existante la renforce et la fait grandir. Doigt appuyé jusqu'à la charge pleine :
   PROTEGGO MAXIMA, un grand dôme doré, bien plus solide, qui repousse toutes les créatures.
   La bulle arrête les tirs ennemis qui y entrent (créatures, Ignivor, duellistes, Faille), repousse les créatures
   hostiles, et absorbe les coups reçus par le joueur qui s'y abrite. Les sorts du joueur en sortent librement. */
const PROTEGGO_SP={name:'Proteggo',inc:'Proteggo',el:'arcane',form:'util',special:'proteggo',legend:true,cost:55,cd:1.2,id:'proteggo',
 desc:'Ton mana devient une bulle protectrice, là où tu le lances (même en l’air). Relance-le dedans pour la renforcer. Maintenu jusqu’à la charge pleine : Proteggo Maxima.'};
const PSH=[];let PSHN=0;const PSG={sph:new THREE.SphereGeometry(1,32,20),wire:new THREE.IcosahedronGeometry(1,2)};
function pshR(S0){return clamp((S0.max?6:2.4)+S0.str/(S0.max?45:38),2.4,S0.max?14:9);}
function castProteggo(sp){const k=CHGNOW||0,maxima=k>=0.95;let x,y,z;const P=utilPt(30);
 if(P){x=P.x;z=P.z;y=gh(x,z);}else if(FLY.on){const [dx,dz]=fwd();x=player.x+dx*4;z=player.z+dz*4;y=player.y+0.6;}else{x=player.x;z=player.z;y=player.y;}
 const add=(maxima?260:60)*(1+0.8*Math.min(k,0.94)*(maxima?0:1));
 let S0=PSH.find(s=>Math.hypot(s.x-x,s.y-y,s.z-z)<pshR(s));
 if(S0){S0.str=Math.min(S0.max?520:240,S0.str+add);if(maxima&&!S0.max){S0.max=true;pshLook(S0);}S0.hitT=0.6;floatAt(S0.x,S0.z,'Proteggo renforcé !','#bfe8ff');}
 else{S0={id:++PSHN,x,y,z,str:add,max:maxima,hitT:0.6,r:2};pshLook(S0);PSH.push(S0);}
 const c=S0.max?0xffe08a:0x9fd8ff;flash(x,y+1.5,z,c,4,0.5);sfx('shield');ring(x,z,c,pshR(S0),0.8);
 for(let i=0;i<70;i++){const a=Math.random()*TAU,b=Math.random()*Math.PI,r=pshR(S0);PA.emit(x+Math.cos(a)*Math.sin(b)*r,y+Math.cos(b)*r*0.9+0.2,z+Math.sin(a)*Math.sin(b)*r,0,0.3,0,i%2?c:0xffffff,0.3,0.05,rnd(.5,1),0,0);}
 if(maxima){banner('Proteggo Maxima !','Un dôme protecteur se lève');SHAKE=Math.max(SHAKE,0.5);
  for(const e of ENT){if(e.kind!=='creature'||e.data.calme||e.data.pet||e.data.charmed||e.data.dragon||e.data.duel)continue;const d=Math.hypot(e.x-x,e.z-z);if(d<pshR(S0)+1){e.data.kx=(e.data.kx||0)+(e.x-x)/(d||1)*18;e.data.kz=(e.data.kz||0)+(e.z-z)/(d||1)*18;}}}}
function pshLook(S0){if(S0.o)scene.remove(S0.o);const g=new THREE.Group(),c=S0.max?0xffe08a:0x9fd8ff;
 const s=new THREE.Mesh(PSG.sph,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 const w=new THREE.Mesh(PSG.wire,new THREE.MeshBasicMaterial({color:S0.max?0xfff1c0:0xd8f0ff,wireframe:true,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false}));
 g.add(s);g.add(w);g.position.set(S0.x,S0.y,S0.z);g.renderOrder=4;scene.add(g);S0.o=g;S0.s=s;S0.w=w;}
const inPsh=(px,py,pz)=>PSH.find(s=>Math.hypot(px-s.x,py-s.y,pz-s.z)<pshR(s));
function pshHit(S0,x,y,z,n){S0.str-=n;S0.hitT=0.35;burst(x,y,z,S0.max?0xffe08a:0x9fd8ff,14,3);}
// coups reçus par le joueur abrité : la bulle encaisse
function pshAbsorb(n){const S0=inPsh(player.x,player.y+1,player.z);if(!S0||S0.str<=0)return n;const a=Math.min(n,S0.str/1.2);pshHit(S0,player.x,player.y+1.2,player.z,a*1.2);return n-a;}
{const _h=hurtPlayer;hurtPlayer=function(n){const r=pshAbsorb(n);if(r<=0.01)return;return _h.call(this,r);};}
{const _v=vieHurt;vieHurt=function(n){const r=pshAbsorb(n);if(r<=0.01)return;return _v.call(this,r);};}
{const _d=duelPlayerHit;duelPlayerHit=function(dmg){const r=pshAbsorb(dmg);if(r<=0.01)return;const a=[...arguments];a[0]=Math.round(r);return _d.apply(this,a);};}
{const _w=waveHurt;waveHurt=function(dmg){const r=pshAbsorb(dmg);if(r<=0.01)return;const a=[...arguments];a[0]=Math.round(r);return _w.apply(this,a);};}
{const _u=doUtil;doUtil=function(sp){if(sp&&sp.special==='proteggo')return castProteggo(sp);return _u.apply(this,arguments);};}
// un tir ennemi qui ENTRE dans une bulle est arrêté (pas s'il y est né)
function pshBlock(o,dmg,mark){let S0=null;for(const s of PSH){const inside=Math.hypot(o.x-s.x,o.y-s.y,o.z-s.z)<pshR(s);if(mark._p===undefined)continue;if(inside&&!mark._p.includes(s.id)){S0=s;break;}}
 if(mark._p===undefined)mark._p=PSH.filter(s=>Math.hypot(o.x-s.x,o.y-s.y,o.z-s.z)<pshR(s)).map(s=>s.id);if(S0){pshHit(S0,o.x,o.y,o.z,dmg);return true;}return false;}
function pshTick(dt){if(!started)return;const t=performance.now()/1000;
 for(let i=PSH.length-1;i>=0;i--){const S0=PSH[i];S0.str-=dt*(S0.max?1.6:3);S0.hitT=Math.max(0,S0.hitT-dt);const r=pshR(S0);
  if(S0.str<=0||S.zone!=='monde'){scene.remove(S0.o);for(let k=0;k<40;k++){const a=Math.random()*TAU;PA.emit(S0.x+Math.cos(a)*r,S0.y+rnd(0,r),S0.z+Math.sin(a)*r,0,rnd(-1,0.5),0,0x9fd8ff,0.3,0.05,0.6,2,1);}PSH.splice(i,1);continue;}
  S0.o.scale.setScalar(r);S0.w.rotation.y+=dt*0.2;const vis=clamp(S0.str/(S0.max?260:90),0.25,1);S0.s.material.opacity=(0.06+0.1*vis)+S0.hitT*0.5;S0.w.material.opacity=(0.12+0.25*vis)*(0.85+0.15*Math.sin(t*3))+S0.hitT;
  // créatures hostiles repoussées
  for(const e of ENT){if(e.kind!=='creature'||e.data.calme||e.data.pet||e.data.charmed||e.data.dragon||e.data.duel)continue;const dx=e.x-S0.x,dz=e.z-S0.z,d=Math.hypot(dx,dz),ey=gh(e.x,e.z)+1;if(Math.abs(ey-S0.y)>r)continue;const rr=Math.sqrt(Math.max(0,r*r-(ey-S0.y)**2));
   if(d<rr+0.6){const k=(rr+0.6)/(d||1);e.x=S0.x+dx*k;e.z=S0.z+dz*k;S0.str-=dt*(S0.max?1:3);if(Math.random()<dt*6)burst(e.x,ey,e.z,S0.max?0xffe08a:0x9fd8ff,6,2);}}}
 if(!PSH.length)return;
 if(typeof CSHOT!=='undefined')for(let i=CSHOT.length-1;i>=0;i--){const s=CSHOT[i];if(pshBlock(s,s.dmg||6,s)){scene.remove(s.o);CSHOT.splice(i,1);}}
 for(let i=BOSS.fb.length-1;i>=0;i--){const f=BOSS.fb[i];if(f.dl>0)continue;if(pshBlock(f,14,f)){scene.remove(f.o);BOSS.fb.splice(i,1);}}
 if(typeof DPROJ!=='undefined'&&DPROJ.length)DPROJ=DPROJ.filter(p=>{const o=p.o.position;if(pshBlock(o,8,p)){scene.remove(p.o);return false;}return true;});
 if(typeof WPROJ!=='undefined'&&WPROJ.length)WPROJ=WPROJ.filter(p=>{const o=p.o.position;if(pshBlock(o,7,p)){scene.remove(p.o);return false;}return true;});}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{pshTick(dt);}catch(e){console.error(e);}return r;};}
// apprendre Proteggo : à la Table d'enchantement, dès le niveau 6
{const _m=enchMenu;enchMenu=function(){_m.apply(this,arguments);if(S.spells.some(s=>s.special==='proteggo'))return;const L=$('#pick-l'),b=document.createElement('button');b.className='pk'+(lvl()<6?' off':'');
  b.innerHTML='<span>📜 Apprendre Proteggo</span><small>'+(lvl()<6?'Dès le niveau 6.':'Le grand sort de protection. Offert par la Table.')+'</small>';if(lvl()>=6)b.onclick=()=>{$('#pick').classList.add('hidden');learnSpell(Object.assign({},PROTEGGO_SP));banner('Proteggo','Ton mana devient bouclier');};L.insertBefore(b,L.firstChild);};}
