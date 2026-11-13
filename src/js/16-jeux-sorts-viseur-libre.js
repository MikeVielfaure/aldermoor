/* ================= ÉTAPE 9 : JEUX DE SORTS A/B, VISÉE LIBRE, RÉGLAGES DE VISÉE ================= */
if(AIMO.assist===undefined)AIMO.assist=true;if(AIMO.duelLock===undefined)AIMO.duelLock=true;
/* ---- deux jeux de 4 sorts ---- */
function ensureSets(){if(!Array.isArray(S.slotsAlt))S.slotsAlt=[null,null,null,null];S.slotsAlt=S.slotsAlt.slice(0,4).map(id=>S.spells.some(x=>x.id===id)?id:null);while(S.slotsAlt.length<4)S.slotsAlt.push(null);if(S.setIdx!==1)S.setIdx=0;}
function swapSets(silent){ensureSets();const a=S.slots;S.slots=S.slotsAlt;S.slotsAlt=a;S.setIdx=S.setIdx?0:1;renderSlots();updSetBtn();sfx('click');
 document.querySelectorAll('.slot').forEach((b,i)=>{b.classList.remove('flip');void b.offsetWidth;b.style.animationDelay=(i*0.04)+'s';b.classList.add('flip');});
 if(!silent&&!S.slots.some(Boolean)&&!S.seenSetB){S.seenSetB=1;say('🔀 Jeu de sorts <b>B</b> : il est vide. Ouvre le Grimoire › Sorts pour y placer d’autres sorts. Le bouton ⇄ te fait revenir au jeu A.','sys');}
 if(!$('#book').classList.contains('hidden'))renderBook();save();}
function updSetBtn(){const b=$('#b-set');if(!b)return;b.innerHTML='<span>⇄</span><small>'+(S.setIdx?'B':'A')+'</small>';b.classList.toggle('alt',!!S.setIdx);}
$('#b-set').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(started&&!anyModal())swapSets();});
window.addEventListener('keydown',e=>{if(e.code==='KeyT'&&started&&!anyModal()&&e.target.tagName!=='INPUT')swapSets();});
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-set]');if(!t)return;const want=+t.dataset.set;if(want!==(S.setIdx||0))swapSets(true);});
/* ---- visée libre : le viseur suit la caméra, haut et bas compris ---- */
const XH={y:0.4,pt:null,t:0,over:null};
function freeAim(){const now=performance.now();if(XH.pt&&now-XH.t<40)return XH.pt;XH.t=now;
 camera.updateMatrixWorld();NDC.set(0,1-2*XH.y);RC.setFromCamera(NDC,camera);const o=RC.ray.origin,d=RC.ray.direction;let best=null,bt=70;
 for(const e of ENT){if(e.kind!=='creature')continue;const D=e.data,sc=D.sc||D.scale||1;const cy=gy0(e.x,e.z)+(D.y||1.2)*(D.duel?1:sc);const vx=e.x-o.x,vy=cy-o.y,vz=e.z-o.z;const t=vx*d.x+vy*d.y+vz*d.z;if(t<1||t>bt)continue;
  const qx=vx-d.x*t,qy=vy-d.y*t,qz=vz-d.z*t;const r=(D.duel?0.9:0.75*sc)+t*0.012;if(qx*qx+qy*qy+qz*qz<r*r){bt=t;best={x:e.x,y:cy,z:e.z,gy:gy0(e.x,e.z),kind:'crea',ref:e};}}
 const hAt=(px,pz)=>{let h=gy0(px,pz);if(S.zone==='monde'&&inLake({x:px,z:pz}))h=Math.max(h,0.06);return h;};
 const pd=Math.hypot(player.x-o.x,player.z-o.z);
 for(let t=Math.max(1,pd-1);t<bt;t+=0.45){const px=o.x+d.x*t,py=o.y+d.y*t,pz=o.z+d.z*t;
  if(py<=hAt(px,pz)){let a=t-0.45,b=t;for(let k=0;k<6;k++){const m=(a+b)/2;if(o.y+d.y*m<=hAt(o.x+d.x*m,o.z+d.z*m))b=m;else a=m;}const hx=o.x+d.x*b,hz=o.z+d.z*b;best={x:hx,y:hAt(hx,hz)+0.15,z:hz,gy:hAt(hx,hz),kind:'pt'};break;}
  if(py<6&&t>pd+0.8&&hitsSolid(px,pz)){best={x:px,y:py,z:pz,gy:gy0(px,pz),kind:'pt',wall:1};break;}}
 if(!best){const t=60;best={x:o.x+d.x*t,y:o.y+d.y*t,z:o.z+d.z*t,gy:null,kind:'pt',sky:1};}
 XH.pt=best;return best;}
function libre(){return AIMO.mode==='libre'&&!AIMO.legacy&&S.zone!=='donjon';}
{const _ct9=castTarget;castTarget=function(el,dx,dz,util){if(libre()&&!AIM.lock&&!AIM.pt){const F=freeAim();if(!F)return null;if(F.kind==='crea'){if(AIMO.assist)return F;return {x:F.x,y:F.y,z:F.z,gy:F.gy,kind:'pt'};}
  if(util)return (F.sky||F.wall)?null:F;return F;}
 if(!AIMO.assist&&!AIM.lock&&!AIM.pt)return null;return _ct9.apply(this,arguments);};}
{const _at9=autoTarget;autoTarget=function(){if(!AIMO.assist||libre())return null;return _at9.apply(this,arguments);};}
{const _up9=utilPt;utilPt=function(max){const p=_up9.apply(this,arguments);if(p||!libre())return p;const F=freeAim();if(!F||F.sky||F.kind!=='pt')return null;return Math.hypot(F.x-player.x,F.z-player.z)<=max?{x:F.x,y:F.gy,z:F.z}:null;};}
{const _ud9=utilDist;utilDist=function(max){if(AIM.pt||!libre())return _ud9.apply(this,arguments);const F=freeAim();if(!F||F.sky)return max;const d=Math.hypot(F.x-player.x,F.z-player.z);return d<=max*1.4?Math.max(1,d):max;};}
/* tir libre : le sort part vers le viseur même vers le haut (le ciel) */
{const _as9=aimShot;aimShot=function(T,D,ox,oy,oz,dx,dz){if(T&&T.sky&&D.grav>0){const r=_as9.call(this,{x:ox+dx*14,y:oy+(T.y-oy)/60*14,z:oz+dz*14,kind:'pt'},D,ox,oy,oz,dx,dz);r.tp=null;return r;}const r=_as9.apply(this,arguments);if(T&&T.sky)r.tp=null;return r;};}
function aimTick9(dt){const xh=$('#xhair');const on=started&&libre()&&!anyModal()&&!TALK;xh.classList.toggle('hidden',!on);
 if(!MK.aim&&MK.pt){MK.aim=MK.pt.clone();MK.aim.material=MK.pt.material.clone();MK.aim.material.color.setHex(0xffffff);scene.add(MK.aim);}
 if(!on){if(MK.aim)MK.aim.visible=false;XH.over=null;return;}
 const F=freeAim();const over=F&&F.kind==='crea';xh.classList.toggle('over',!!over);XH.over=over?F.ref:null;
 if(MK.aim){if(F&&!F.sky&&!over&&F.gy!=null){const d=Math.hypot(F.x-player.x,F.z-player.z);MK.aim.visible=d>1.5;MK.aim.position.set(F.x,F.gy+0.07,F.z);const k=0.7+d*0.03;MK.aim.scale.set(k,1,k);MK.aim.material.opacity=0.45;MK.aim.rotation.y+=dt;}else MK.aim.visible=false;}
 if(over&&MK.soft&&!AIM.lock){const p=tgPos({kind:'crea',ref:F.ref});placeMk(MK.soft,p,p.rad*2.4,-performance.now()/1600,0.55);}}
/* caméra « par-dessus l'épaule » en visée libre */
{const _ai9=aimTick;aimTick=function(dt){_ai9.apply(this,arguments);aimTick9(dt);};}

