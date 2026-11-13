// in-page bot helpers, evaluated inside game closure
module.exports=`window.bot={
 walk(x,z,max=900,run=true){keys.KeyW=true;keys.ShiftLeft=run;let i=0,stuck=0,lp={x:player.x,z:player.z},path=[];
  for(;i<max;i++){const dx=x-player.x,dz=z-player.z;if(Math.hypot(dx,dz)<1.2)break;camYaw=Math.atan2(dx,dz);update(0.033);
   if(i%30==29){const m=Math.hypot(player.x-lp.x,player.z-lp.z);path.push([+player.x.toFixed(1),+player.z.toFixed(1),+player.y.toFixed(1)]);if(m<0.6){stuck++;if(stuck>=3)break;}else stuck=0;lp={x:player.x,z:player.z};}}
  keys.KeyW=false;keys.ShiftLeft=false;for(let k=0;k<8;k++)update(0.033);
  return {ok:Math.hypot(x-player.x,z-player.z)<1.6,x:+player.x.toFixed(1),z:+player.z.toFixed(1),y:+player.y.toFixed(2),t:+(i*0.033).toFixed(1),zone:S.zone,stuck:stuck>=3?path.slice(-3):undefined};},
 run(sec,dt=0.033){for(let i=0;i<sec/dt;i++)update(dt);},
 tp(x,z){player.x=x;player.z=z;player.y=S.zone==='monde'?gh(x,z):0;player.vx=player.vz=player.vy=0;for(let k=0;k<5;k++)update(0.033);},
 face(x,z){camYaw=Math.atan2(x-player.x,z-player.z);player.ry=camYaw;update(0.033);},
 st(){return {x:+player.x.toFixed(1),z:+player.z.toFixed(1),y:+player.y.toFixed(2),zone:S.zone,mana:Math.round(mana),xp:S.xp,lvl:lvl(),time:fmtTime(S.time),q:S.quests.map(q=>q.title+':'+((curStep(q)||{}).text||'')),focus:focus?(focus.t==='npc'?'npc '+focus.n.d.id:focus.t==='st'?'st '+focus.h:focus.t==='ent'?focus.e.kind:focus.t):null};},
 feed(){return [...document.querySelectorAll('#feed .msg')].map(d=>d.textContent);},
 counts(){return {scene:scene.children.length,ENT:ENT.length,PROJ:PROJ.length,PROPS:PROPS.length,PLANTS:PLANTS.length,DECALS:DECALS.length,ORBS:ORBS.length,FT:FT.length,geos:renderer.info.memory.geometries,tex:renderer.info.memory.textures,calls:renderer.info.render.calls,tris:renderer.info.render.triangles};}
};
const _say=say;window.__said=[];say=function(t,ty){window.__said.push(String(t).replace(/<[^>]+>/g,''));if(window.__said.length>400)window.__said.shift();return _say(t,ty);};
'ok'`;
