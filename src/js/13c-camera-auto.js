/* ================= CAMÉRA AUTOMATIQUE : elle suit les déplacements et garde les monstres à l'écran =================
   Avant : il fallait tourner la caméra avec l'autre doigt pour regarder à gauche ou à droite.
   - Suivi : en se déplaçant de côté, la caméra pivote doucement pour se replacer derrière le joueur
     (plus vite en courant et en balai). En reculant, elle ne tourne pas (pas de vrille).
   - Combat : une créature hostile proche qui sort du champ est ramenée à l'écran (les animaux paisibles
     sont ignorés ; une cible verrouillée garde son propre suivi, 13-visee-camera).
   - L'inclinaison revient doucement à une hauteur normale quand on marche.
   - Dès que le joueur fait glisser la caméra lui-même, l'automatisme se tait un instant.
   Options ⚙ → « Caméra » : manuelle / suit les déplacements / suit + combat (mémorisé). */
const CAM_MODES=['manuelle','suit les déplacements','suit + combat'];
const CAMA={mode:2,lastDrag:-9,threat:null,tT:0};
/* vitesse à laquelle la caméra revient derrière le joueur (Options ⚙ → « Vitesse de la caméra ») */
const CAM_SPEEDS=[['douce',0.6],['normale',1],['rapide',1.8],['très rapide',2.8]];CAMA.sp=2;
try{const v=localStorage.getItem('aldermoor-camspeed');if(v!==null&&CAM_SPEEDS[+v])CAMA.sp=+v;}catch(e){}
const camK=()=>CAM_SPEEDS[CAMA.sp][1];
function camSpeedNext(){CAMA.sp=(CAMA.sp+1)%CAM_SPEEDS.length;try{localStorage.setItem('aldermoor-camspeed',String(CAMA.sp));}catch(e){}}
try{const v=+localStorage.getItem('aldermoor-cam');if(v>=0&&v<=2&&localStorage.getItem('aldermoor-cam')!==null)CAMA.mode=v;}catch(e){}
const angDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
function camAutoTick(dt){if(!started||anyModal()||TALK||CAMA.mode===0)return;const now=performance.now()/1000;
 if(drag.id!==null||PINCH.on){CAMA.lastDrag=now;return;}
 const calm=now-CAMA.lastDrag; // secondes depuis la dernière fois que le joueur a tourné la caméra lui-même
 // commande de déplacement (même calcul que la boucle de jeu)
 let ix=joy.x,iy=joy.y;if(keys.KeyW||keys.KeyZ||keys.ArrowUp)iy+=1;if(keys.KeyS||keys.ArrowDown)iy-=1;if(keys.KeyA||keys.KeyQ||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;
 const mag=Math.min(1,Math.hypot(ix,iy)),moving=mag>0.15;
 // combat : la menace hostile la plus proche, si elle sort du champ de vision
 let turned=false,threatYaw=null,threatD=99;
 if(CAMA.mode===2&&calm>1.2&&!(AIM.lock&&AIMO.follow)&&S.zone==='monde'){CAMA.tT-=dt;if(CAMA.tT<=0){CAMA.tT=0.25;let best=null,bd=14;{/* une créature déjà suivie le reste jusqu'à 20 m (on peut reculer sans que la caméra décroche) */const c=CAMA.threat;if(c&&ENT.includes(c)&&!c.data.calme&&!c.data.duel){const dc=Math.hypot(c.x-player.x,c.z-player.z);if(dc<20){best=c;bd=dc*0.8;}}}
   for(const e of ENT){if(e.kind!=='creature'||e.data.calme||e.data.duel)continue;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;best=e;}}
   if(typeof BOSS!=='undefined'&&BOSS.on&&BOSS.e&&ENT.includes(BOSS.e))best=BOSS.e;CAMA.threat=best;} // boss : priorité à Ignivor
  const e=CAMA.threat;if(e&&ENT.includes(e)){const want=Math.atan2(e.x-player.x,e.z-player.z),d=angDiff(want,camYaw),dd=Math.hypot(e.x-player.x,e.z-player.z),close=dd<9,cone=close?0.32:0.55;threatYaw=want;threatD=dd;
   /* une créature proche est gardée plus près du centre, et rattrapée plus vite */if(Math.abs(d)>cone){const r=(d-Math.sign(d)*cone)*Math.min(1,dt*(close?4.5:3.2));camYaw+=r;CAMA.autoAcc=(CAMA.autoAcc||0)+r;turned=true;}
   if(e.data.dragon)camPitch+=(0.1-camPitch)*Math.min(1,dt*1.5);}} // on lève les yeux vers le dragon
 // suivi des déplacements
 if(!turned&&moving&&calm>0.8/Math.sqrt(camK())&&!(AIM.lock&&AIMO.follow)){const by=MOVY.on?MOVY.yaw:camYaw,fx=Math.sin(by),fz=Math.cos(by),mx=fx*iy-fz*ix,mz=fz*iy+fx*ix,head=Math.atan2(mx,mz),d=angDiff(head,camYaw);
  /* en combat, si l'on s'éloigne (ou tourne autour) d'une créature proche, la caméra la garde en vue : pas de demi-tour */
  const flee=threatYaw!==null&&threatD<20&&Math.abs(angDiff(head,threatYaw))>1.4;
  if(!flee&&Math.abs(d)<2.2&&!PLBACK){/* la caméra se replace derrière le joueur ; en marche arrière le joueur recule, la caméra ne fait pas demi-tour */const run=keys.ShiftLeft||keys.ShiftRight||mag>0.95,k=(FLY.on?2.3:run?1.35:0.95)*camK()*Math.min(1,Math.abs(d)/1.2+0.15);{const r=d*Math.min(1,dt*k);camYaw+=r;CAMA.autoAcc=(CAMA.autoAcc||0)+r;}}}
 // inclinaison : retour doux vers une vue normale en marchant
 if(moving&&calm>2.5&&!FLY.on){const want=S.zone==='monde'?0.38:0.32;camPitch+=(want-camPitch)*Math.min(1,dt*0.8);}}
{const _at=aimTick;aimTick=function(dt){const r=_at.apply(this,arguments);try{camAutoTick(dt);}catch(e){}return r;};}
function camModeNext(){CAMA.mode=(CAMA.mode+1)%3;try{localStorage.setItem('aldermoor-cam',String(CAMA.mode));}catch(e){}}

// ligne d'options : vitesse de la caméra
{const _ro=renderOpts;renderOpts=function(){_ro.apply(this,arguments);const c=$('#o-cam');if(!c||$('#o-csp'))return;const d=document.createElement('div');d.className='op';d.innerHTML='<span>Vitesse de la caméra</span><button class="ghost sm" id="o-csp">'+CAM_SPEEDS[CAMA.sp][0]+'</button>';const row=c.closest('.op');row.parentNode.insertBefore(d,row.nextSibling);$('#o-csp').onclick=()=>{camSpeedNext();renderOpts();};};}
