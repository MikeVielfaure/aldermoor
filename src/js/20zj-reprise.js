/* ================= REPRENDRE LA PARTIE LÀ OÙ ON L'A QUITTÉE =================
   À chaque sauvegarde faite dehors (S.zone 'monde', hors duel / Faille / course), la position est gardée dans S.pos
   {x, z, y, ry}. On sauvegarde aussi toutes les 20 s et quand on quitte la page. En « Continuer », on repart de là :
   vallée (et Citadelle des Nuées, grâce à y) directement, Landes via landesGo, Grandes Terres via terGo.
   Pas pour une nouvelle partie ni pour la partie de test (fresh), ni avec ?pos / ?lieu / ?voir… (outils de l'Atelier). */
{const _s=save;save=function(){try{if(started&&S&&S.zone==='monde'&&!DUEL&&!WAVE&&!RACE.on&&!(typeof CRACE!=='undefined'&&CRACE.on)&&isFinite(player.x))
   S.pos={x:Math.round(player.x*10)/10,z:Math.round(player.z*10)/10,y:Math.round(player.y*10)/10,ry:Math.round(player.ry*100)/100};}catch(e){}return _s.apply(this,arguments);};}
let REPRISE_T=20;
{const _w=world4Tick;world4Tick=function(dt){REPRISE_T-=dt;if(REPRISE_T<=0){REPRISE_T=20;if(started)save();}return _w.apply(this,arguments);};}
addEventListener('pagehide',()=>{if(started)save();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)save();});
{const _sg=startGame;startGame=function(state,fresh){const P=!fresh&&state&&state.pos;const r=_sg.apply(this,arguments);
  if(P&&S.zone==='monde'&&isFinite(P.x)&&isFinite(P.z)&&!/[?&](pos|lieu|voir|sort|pnj|quete)=/.test(location.search)){const reg=regionOf(P.x),place=()=>{player.x=P.x;player.z=P.z;player.vx=player.vz=player.vy=0;player.ry=P.ry||0;camYaw=player.ry;
    player.y=reg==='vallee'?groundAt(P.x,P.z,(P.y||0)+0.6):gh(P.x,P.z)+0.2;};
   if(reg==='terres')setTimeout(()=>terGo(P.x,P.z),300);
   else if(reg==='landes')setTimeout(()=>{landesGo(false);setTimeout(place,1700);},300);
   else place();
   setTimeout(()=>say('📍 Tu reprends là où tu t’étais arrêté.','sys'),reg==='vallee'?400:2400);}
  return r;};}
