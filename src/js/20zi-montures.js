/* ================= LES MONTURES : licorne et pégase apprivoisés =================
   Une licorne ou un pégase paisible (Grandes Terres) s'apprivoise comme un familier (20m : 2 ingrédients de cueillette).
   Près de lui, ✋ « Monter » :
   - licorne : on galope à pied, presque 2 fois plus vite (enrobage de gearSpeed) ; ✋ « Descendre » (ou 🧹) ;
   - pégase : on vole comme en balai (FLY), le balai est caché ; on descend en touchant le sol ou avec 🧹.
   Pendant la monte, le familier est collé sous le joueur juste avant l'affichage (enrobage de preRender) et le joueur
   est surélevé de la hauteur de la selle. Pas sauvegardé : on repart toujours à pied. */
Object.assign(PET_SP,{licorne:{re:/licorne/i,ic:'🦄',don:'elle se monte (✋ près d’elle) : galop bien plus rapide',names:['Étoile','Nacre','Opaline','Aurore'],mont:'sol'},
 pegase:{re:/pégase|pegase/i,ic:'🐎',don:'il se monte (✋ près de lui) : il vole comme un balai',names:['Zéphyr','Nuage','Céleste','Plume-d’Argent'],mont:'vol'}});
const RIDE={on:false,mode:null,selle:0.85};
const rideSp=()=>S&&S.pet&&PET_SP[S.pet.sp]&&PET_SP[S.pet.sp].mont;
function rideStart(){const m=rideSp(),e=PET.e;if(!m||!e||!ENT.includes(e)||RIDE.on||S.zone!=='monde')return;if(DUEL){say('Pas de monture pendant un duel !','sys');return;}
 if(m==='vol'){if(FLY.on)dismount(true);toggleBroom();if(!FLY.on)return;if(FLY.mesh)FLY.mesh.visible=false;}
 RIDE.on=true;RIDE.mode=m;burst(player.x,player.y+1.2,player.z,m==='vol'?0xcfe6ff:0xe8ccff,24,3);sfx('whoosh',player.x,player.z);
 say((m==='vol'?'🐎 Tu montes sur <b>':'🦄 Tu montes sur <b>')+esc(S.pet.name)+'</b> ! '+(m==='vol'?'Il vole comme un balai : touche le sol ou 🧹 pour descendre.':'Au galop ! ✋ ou 🧹 pour descendre.'),'sys');}
function rideStop(quiet){if(!RIDE.on)return;const was=RIDE.mode;RIDE.on=false;RIDE.mode=null;if(was==='vol'&&FLY.on)dismount(true);
 const e=PET.e;if(e&&ENT.includes(e)){const a=player.ry+Math.PI/2;e.x=player.x+Math.sin(a)*1.6;e.z=player.z+Math.cos(a)*1.6;}player.H.root.children.forEach(o=>{if(o.geometry&&o.geometry.type==='RingGeometry')o.visible=true;});if(!quiet)sfx('land',0.4);}
/* ✋ près de la monture : monter ; en selle (et personne à qui parler tout près) : descendre */
station({get x(){return PET.e&&!RIDE.on?PET.e.x:1e9;},get z(){return PET.e&&!RIDE.on?PET.e.z:1e9;},reach:2.8,hint:()=>rideSp()&&!FLY.on&&!player.swim?'Monter sur '+S.pet.name:null,act:()=>rideStart()});
station({get x(){return RIDE.on&&RIDE.mode==='sol'?player.x:1e9;},get z(){return RIDE.on&&RIDE.mode==='sol'?player.z:1e9;},reach:1,hint:()=>npcs.some(n=>!n.sleep&&Math.hypot(n.x-player.x,n.z-player.z)<3.6)?null:'Descendre de '+S.pet.name,act:()=>rideStop()});
/* 🧹 en selle sur la licorne : on descend (au lieu de prendre le balai) ; en selle sur le pégase : le balai se range aussi */
{const _t=toggleBroom;toggleBroom=function(){if(RIDE.on&&RIDE.mode==='sol'){rideStop();return;}return _t.apply(this,arguments);};}
{const _d=dismount;dismount=function(){const r=_d.apply(this,arguments);if(RIDE.on&&RIDE.mode==='vol')rideStop(true);return r;};}
{const _g=gearSpeed;gearSpeed=function(){return _g.apply(this,arguments)*(RIDE.on&&RIDE.mode==='sol'?1.6:1);};}
/* la monture sous le joueur, juste avant l'image ; on descend d'office à l'intérieur, à l'eau, ou si la monture a disparu */
{const _p=preRender;preRender=function(){if(RIDE.on){const e=PET.e;if(!e||!ENT.includes(e)||S.zone!=='monde'||player.swim||!S.pet)rideStop(true);
  else{e.x=player.x;e.z=player.z;const D=e.data;D.tx=D.hx=e.x;D.tz=D.hz=e.z;const y=RIDE.mode==='vol'?player.y-0.55:groundAt(player.x,player.z,player.y+0.5);e.obj.position.set(player.x,y,player.z);e.obj.rotation.y=player.ry;
   if(D.M&&D.M.vol)D.M.r.position.y=0;player.H.root.position.y=y+RIDE.selle+(RIDE.mode==='vol'?0.1:0);player.H.root.children.forEach(o=>{if(o.geometry&&o.geometry.type==='RingGeometry')o.visible=false;});if(FLY.mesh&&RIDE.mode==='vol')FLY.mesh.visible=false;}}
 return _p.apply(this,arguments);};}
/* une seule fois : dire qu'on peut monter sa nouvelle monture */
{const _t=tame;tame=function(e){const had=!!S.pet;const r=_t.apply(this,arguments);if(!had&&rideSp())setTimeout(()=>say('✨ '+esc(S.pet.name)+' se laisse monter : approche-toi et touche ✋.','gm'),2500);return r;};}
