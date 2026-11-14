/* ================= BOUCLE ================= */
let started=false,fastT=0,last=performance.now(),ambT=40,saveT=0,hudT=0,focT=0,waterT=0;
const cTopD=new THREE.Color(0x3f86e0),cBotD=new THREE.Color(0xc4e0f6),cTopN=new THREE.Color(0x050818),cBotN=new THREE.Color(0x141c3c),cDusk=new THREE.Color(0xf0905a),tTop=new THREE.Color(),tBot=new THREE.Color();
let nightK=0;
function lighting(){const h=S.time/60;const df=clamp(Math.sin((h-5)/15*Math.PI)*1.6,0,1);nightK=1-df;
 const dusk=clamp(1-Math.abs(df-0.35)/0.3,0,1)*0.55;
 tTop.copy(cTopN).lerp(cTopD,df);tBot.copy(cBotN).lerp(cBotD,df).lerp(cDusk,dusk);
 skyMat.uniforms.top.value.copy(tTop);skyMat.uniforms.bot.value.copy(tBot);scene.fog.color.copy(tBot);
 const wd=wx.dark;hemi.intensity=(0.22+0.62*df)*(1-wd*0.45)+flashK*1.6+(BUFF.voyance?0.35*(1-df):0);sun.intensity=(0.08+0.95*df)*(1-wd*0.8);amb.intensity=0.12+0.06*(1-df);tTop.lerp(GREYT,wd*0.85);tBot.lerp(GREYB,wd*0.8);skyMat.uniforms.top.value.copy(tTop);skyMat.uniforms.bot.value.copy(tBot);scene.fog.color.copy(tBot);scene.fog.near=wx.fogN;scene.fog.far=wx.fogF;clouds.forEach(c=>c.children.forEach(m=>m.material.color.setScalar(1-wd*0.6)));
 sun.color.setHex(0xfff0d8).lerp(cDusk,dusk*0.7);
 const a=(h-6)/12*Math.PI;const sx=Math.cos(a),sy=Math.sin(a);
 const px=player.x||0,pz=player.z||0;
 sun.position.set(px+sx*60,Math.max(18,sy*80),pz+28);sun.target.position.set(px,0,pz);
 sunSpr.position.set(px+sx*300,sy*300,pz+140);sunSpr.visible=sy>-0.1;moonSpr.position.set(px-sx*300,-sy*300+40,pz-120);moonSpr.visible=sy<0.15;
 stars.material.opacity=clamp(1-df*1.6,0,1);
 winMat.emissiveIntensity=0.25+1.6*(1-df);
 LAMPS.forEach(l=>{const target=l.off>0?0:clamp(1-df*1.4,0.12,1);l.s.material.opacity+=(target-l.s.material.opacity)*0.1;});
 const dz=!!S.zone&&S.zone!=='monde';hemi.color.setHex(0xd8e8ff);hemi.groundColor.setHex(0x40562c);skyMesh.visible=!dz;stars.visible=!dz;clouds.forEach(c=>c.visible=!dz);if(dz){const Z=ZONES[S.zone]||{};sunSpr.visible=false;moonSpr.visible=false;hemi.intensity=Z.hemi!=null?Z.hemi:0.1;if(Z.hc)hemi.color.setHex(Z.hc);if(Z.gc)hemi.groundColor.setHex(Z.gc);sun.intensity=0;amb.intensity=Z.amb!=null?Z.amb:0.08;scene.fog.color.setHex(Z.fogC!=null?Z.fogC:0x05040a);scene.fog.near=Z.fogN||4;scene.fog.far=Z.fogF||36;}
}
function update(dt){
 const t=performance.now()/1000;const paused=anyModal();
 if(!paused){
  const dtMin=dt*1.5;S.time+=dtMin;if(S.time>=24*60){S.time=24*60-0.01;nightfall();return;}
  let ix=joy.x,iy=joy.y;if(keys.KeyW||keys.KeyZ||keys.ArrowUp)iy+=1;if(keys.KeyS||keys.ArrowDown)iy-=1;if(keys.KeyA||keys.KeyQ||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;
  const mag=Math.min(1,Math.hypot(ix,iy));const slick=onSlick(player);
  let tvx=0,tvz=0;
  if(mag>0.08){const fx=Math.sin(camYaw),fz=Math.cos(camYaw),rx=-fz,rz=fx;let mx=fx*iy+rx*ix,mz=fz*iy+rz*ix;const l=Math.hypot(mx,mz);mx/=l;mz/=l;const run=keys.ShiftLeft||keys.ShiftRight||mag>0.95;const sp=(run?8.5:4.5)*mag*(1+0.1*tal('agil'))*(slick?1.6:1)*(player.swim?0.45:1)*(player.wade?0.6:1)*(BUFF.celerite?1.5:1);if(FLY.on){const fs=(run?18:11)*mag;tvx=mx*fs;tvz=mz*fs;}else{tvx=mx*sp;tvz=mz*sp;}
   let tr=Math.atan2(mx,mz),d=tr-player.ry;d=Math.atan2(Math.sin(d),Math.cos(d));player.ry+=d*Math.min(1,dt*12);}
  const acc=FLY.on?2.6:player.dash>0?0:(slick?1.1:(player.grounded?14:5));
  player.vx+=(tvx-player.vx)*Math.min(1,dt*acc);player.vz+=(tvz-player.vz)*Math.min(1,dt*acc);
  if(player.dash>0){player.dash-=dt;fireAt(player.x,player.y+0.6,player.z,0.4,2);}
  if(slick&&Math.hypot(player.vx,player.vz)>3&&Math.random()<dt*20)PA.emit(player.x,player.y+0.1,player.z,rnd(-1,1),rnd(.2,1),rnd(-1,1),0xe8fbff,0.2,0.03,0.5,3,1);
  {const prev={x:player.x,z:player.z};const cand={x:player.x+player.vx*dt,z:player.z+player.vz*dt};
   if(FLY.on)flyPush(cand,prev);else pushOut(cand,0.4,2,player.y);
   if(S.zone==='monde'&&!FLY.on){const g0=gh(prev.x,prev.z);const bad=q=>{const gq=gh(q.x,q.z);if(gq<=player.y+0.05)return false;const dd=Math.hypot(q.x-prev.x,q.z-prev.z)||1e-3;return !player.grounded||(gq-g0)/dd>1.1;};if(bad(cand)){const a={x:cand.x,z:prev.z},b={x:prev.x,z:cand.z};if(!bad(a)){cand.x=a.x;cand.z=a.z;}else if(!bad(b)){cand.x=b.x;cand.z=b.z;}else{cand.x=prev.x;cand.z=prev.z;}}}
   player.x=cand.x;player.z=cand.z;}
  if(FLY.on)flyVert(dt);else player.vy-=24*dt;if(player.glide>0)player.glide-=dt;
  const gliding=player.vy<0&&(player.glide>0||(jumpHeld&&tal('vent_u')>0));
  if(gliding){player.vy=Math.max(player.vy,-2.2);if(Math.random()<dt*15)PN.emit(player.x+rnd(-.4,.4),player.y+1,player.z+rnd(-.4,.4),rnd(-.5,.5),rnd(-.5,.2),rnd(-.5,.5),0xe8fff0,0.2,0.4,0.6,0,1,0.6);}
  player.y+=player.vy*dt;
  {const gy=groundAt(player.x,player.z,player.y);
   if(player.y<=gy){const bo=player.vy<-1?bounceAt(player.x,player.z):null;
    if(bo){player.vy=19*Math.min(1.3,pow('nature'));player.y=gy;player.grounded=false;player.jumps=1;bo.data.sq=0.35;burst(player.x,1,player.z,0x6fe36f,16,4);hint('bounce','Boing ! Le champignon te propulse dans les airs.');}
    else{if(!player.grounded&&player.vy<-10)for(let i=0;i<10;i++)PN.emit(player.x,gy+0.05,player.z,rnd(-2,2),rnd(.2,1),rnd(-2,2),0xbba888,0.3,0.7,0.6,1,2,0.5);player.y=gy;player.vy=0;player.grounded=true;player.jumps=0;}}
   else if(player.y-gy>0.08)player.grounded=false;}
  player.spd=lerp(player.spd,Math.hypot(player.vx,player.vz)/6,dt*10);
  player.swim=inLake(player)&&!walkable(player)&&player.y<0;
  const H=player.H;H.root.position.set(player.x,player.y,player.z);H.root.rotation.y=player.ry;animHuman(H,dt,player.spd,t,!player.grounded);
  if(H.cast>0){const tp=new THREE.Vector3();H.p.tip.getWorldPosition(tp);PA.emit(tp.x,tp.y,tp.z,0,0.3,0,ELEM[S.lastEl||'arcane'].c,0.25,0.05,0.3,0,0);}
  player.cd=Math.max(0,player.cd-dt);
  let nl=null,nd=1e9;for(const L of LOCS){const d=Math.hypot(player.x-L.x,player.z-L.z);if(d<L.r&&d<nd){nd=d;nl=L.id;}}
  if(nl!==S.locId){S.locId=nl;if(nl)say('— '+esc(LOCBY[nl].name)+' —','sys');}
  S.quests.slice().forEach(q=>{const s=curStep(q);if(s&&s.kind==='goto'&&inLoc(s.loc)){say('✓ '+esc(s.text),'sys');advance(q);}});
  updSpecial(dt);updWeather(dt);updWorld2(dt);updWorld3(dt);updCourses(dtMin);updNPCs(dt,t);updEnts(dt);updProj(dt);updProps(dt);updPlants(dt);updIce(dt);updTrees(dt);updOrbs(dt);
  LAMPS.forEach(l=>{if(l.off>0)l.off-=dt;});
  ambT-=dt;if(ambT<=0){ambT=rnd(55,95);ambient();}
  saveT+=dt;if(saveT>15){saveT=0;save();}
  focT+=dt;if(focT>0.15){focT=0;findFocus();}
 }
 PA.update(dt);PN.update(dt);PW.update(dt);updLights(dt);updDecals(dt);updFT(dt);
 hudT+=dt;if(hudT>0.25){hudT=0;updateHUD();updateTracker();}
 fastT+=dt;if(fastT>0.08){fastT=0;updSlotsFast();}
 ambientAnim(dt,t);lighting();
 const zn=S.zone,inD=zn==='donjon';let cp=camPitch,dist=8*CAMZ;let la=0;if(zn!=='monde'){inCam(zn);cp=IC[0];dist=IC[1];la=IC[2];}fovTo(zn!=='monde'&&!TALK?IC[3]:FOV0,dt);/* lieux clos : voir 13b-camera-interieurs */if(zn==='monde'){const sx=-Math.sin(camYaw)*Math.cos(cp),sz=-Math.cos(camYaw)*Math.cos(cp);for(let d=1.2;d<=dist;d+=0.4){const x=player.x+sx*d,z=player.z+sz*d;let hit=false;for(const c of COLS){if(c.lake||c.off||(c.h!==undefined&&c.h<player.y+1.9))continue;if(c.r!==undefined){const rr=c.tree?c.r+0.5:c.r+0.3;if(Math.abs(x-c.x)<rr&&Math.abs(z-c.z)<rr&&Math.hypot(x-c.x,z-c.z)<rr){hit=true;break;}}else if(Math.abs(x-c.x)<c.hw+0.3&&Math.abs(z-c.z)<c.hd+0.3){hit=true;break;}}if(hit){dist=Math.max(zn==='monde'?2.6:2,d-0.4);break;}}}if(zn==='monde'){let dd=camClear(Math.max(cp,0.12),dist);if(dd<4.2&&cp>=0.12){for(const up of [0.18,0.36]){const c2=Math.min(1.1,cp+up),d2=camClear(c2,dist);if(d2>dd+1.0){cp=c2;dd=d2;if(d2>=4.2)break;}}}dist=Math.max(1.15,dd);}
 const cls=zn==='monde'?Math.max(0,3.6-dist):0;const cx=player.x-Math.sin(camYaw)*Math.cos(cp)*dist,cz=player.z-Math.cos(camYaw)*Math.cos(cp)*dist,cy=player.y+1.7+Math.sin(cp)*dist+cls*0.55;
 if(TALK)talkCam(dt);else{const so=AIM.side*0.8,sox=-Math.cos(camYaw)*so,soz=Math.sin(camYaw)*so;TV.set(cx+sox,zn==='monde'?Math.max(cy,gh(cx+sox,cz+soz)+1.0):cy,cz+soz);camera.position.lerp(TV,Math.min(1,dt*8));if(zn==='monde'){const gq=gh(camera.position.x,camera.position.z)+0.6;if(camera.position.y<gq)camera.position.y=gq;}camera.lookAt(player.x+sox+Math.sin(camYaw)*la,player.y+1.6+cls*0.3,player.z+soz+Math.cos(camYaw)*la);}
}
function ambientAnim(dt,t){
 
 banners.forEach(b=>{const a=b.geometry.attributes.position,B=b.userData.base;for(let i=0;i<a.count;i++){const y=B[i*3+1];a.setZ(i,Math.sin(t*3+y*2)*0.12*(2.1-y)/4);}a.needsUpdate=true;});
 clouds.forEach(c=>{c.position.x+=c.userData.v*dt;if(c.position.x>200)c.position.x=-200;});
 if(Math.random()<dt*3){const c=pick(chimneys);const v=new THREE.Vector3();c.getWorldPosition(v);PN.emit(v.x,v.y+0.9,v.z,rnd(.2,.5),rnd(.6,1),rnd(-.2,.2),0xd8d8d8,0.4,1.6,rnd(2,3.5),-0.1,0.3,0.35);}
 if(Math.random()<dt*20)PA.emit(rnd(-.3,.3),2.5,2+rnd(-.3,.3),rnd(-1.2,1.2),rnd(1.5,2.5),rnd(-1.2,1.2),0xbfe6ff,0.18,0.1,0.8,6,0,0.8);
 if(Math.random()<dt*4)PA.emit(58+rnd(-1,1),0.6,-6+rnd(-1,1),0,rnd(.5,1.2),0,0xb48cff,0.4,0.05,rnd(1,2),0,0.3);
 if(nightK>0.5&&Math.random()<dt*8){const a=Math.random()*TAU,r=Math.random()*40;PA.emit(player.x+Math.cos(a)*r,rnd(.5,2),player.z+Math.sin(a)*r,rnd(-.3,.3),rnd(-.1,.2),rnd(-.3,.3),0xd8ff70,0.18,0.18,rnd(2,4),0,0,nightK);}
}
function updTrees(dt){let dirty=false;const burning=TREES.filter(t=>t.st==='burning');
 burning.forEach(t=>{t.burn-=dt;t.lk=(t.lk||0)-dt;if(t.lk<=0){t.lk=0.12;treeLook(t);}burnFx(t,dt);if(Math.random()<dt*0.5)flash(t.x,3,t.z,0xff7a2e,1.5,0.4,false,12);
  if(Math.random()<dt*0.35&&burning.length<10){near(TREES,t.x,t.z,4).forEach(n=>{if(Math.random()<0.4)igniteTree(n);});}
  near(PROPS,t.x,t.z,2.5,p=>p.burnable&&p.burn<=0&&p.dead<=0).forEach(p=>{if(Math.random()<dt*0.3)p.burn=6;});
  if(t.burn<=0){t.st='charred';treeLook(t);dirty=true;for(let i=0;i<10;i++)PN.emit(t.x+rnd(-1,1),rnd(1,4),t.z+rnd(-1,1),0,rnd(.5,1.5),0,0x3a3530,0.6,1.8,rnd(1.5,2.5),-0.3,0.5,0.5);}
  const dp=Math.hypot(t.x-player.x,t.z-player.z);if(dp<1.8){const d=dp||1;player.x+=(player.x-t.x)/d*0.1;player.z+=(player.z-t.z)/d*0.1;hint('hot','Aïe ! Ça chauffe, recule !');}});
 if(dirty)treesDirty();}
function updOrbs(dt){ORBS=ORBS.filter(o=>{o.life-=dt;o.g.position.y=o.y+Math.sin(o.life*2)*0.15;if(Math.random()<0.5)PA.emit(o.x+rnd(-.3,.3),o.g.position.y,o.z+rnd(-.3,.3),rnd(-.3,.3),rnd(-.5,.3),rnd(-.3,.3),0xfff1a0,0.22,0.05,0.8,0,0);
 if(o.life<1.5)o.g.scale.setScalar(Math.max(0.01,o.life/1.5));
 ENT.forEach(e=>{if(e.kind==='scroll'&&e.data.hidden&&Math.hypot(e.x-o.x,e.z-o.z)<12){e.data.hidden=false;e.obj.visible=true;burst(e.x,1.2,e.z,ELEM[e.data.spell.el].c,24,3);say('✨ La lumière révèle un parchemin caché !','gm');}});
 if(o.life<=0){scene.remove(o.g);return false;}return true;});
 CLOUDS=CLOUDS.filter(c=>{c.life-=dt;for(let i=0;i<4;i++){const a=Math.random()*TAU,r=Math.random()*2.5;PN.emit(c.x+Math.cos(a)*r,c.y+rnd(-.5,1.2),c.z+Math.sin(a)*r,rnd(-.2,.2),rnd(-.1,.3),rnd(-.2,.2),Math.random()<0.7?0x0d0618:0x2a1048,rnd(.9,1.4),rnd(1.6,2.2),rnd(.8,1.3),-0.1,0.5,0.8);}return c.life>0;});}
function updNPCs(dt,t){
 for(const n of npcs){
  let target=S.npcLoc[n.d.id]||n.d.home;const live=S.courses.find(c=>c.prof===n.d.id&&c.state==='live');if(live)target=live.loc;
  const sch=live?null:npcSched(n);if(sch==='sleep'){if(!n.sleep){n.sleep=true;n.obj.visible=false;}continue;}if(n.sleep){n.sleep=false;n.obj.visible=true;}if(sch)target=sch;
  if(target!==n.cur){const L=LOCBY[target];n.cur=target;const p=freePoint(L,3);if(Math.hypot(p.x-n.x,p.z-n.z)>10){for(let i=0;i<30;i++){PA.emit(n.x+rnd(-.4,.4),rnd(0,2),n.z+rnd(-.4,.4),0,rnd(1,3),0,0xb48cff,0.35,0.05,rnd(.5,1),0,1);PA.emit(p.x+rnd(-.4,.4),rnd(0,2),p.z+rnd(-.4,.4),0,rnd(-1,1),0,0xb48cff,0.35,0.05,rnd(.5,1),0,1);}n.x=p.x;n.z=p.z;}n.tx=p.x;n.tz=p.z;}
  const dx=n.tx-n.x,dz=n.tz-n.z,d=Math.hypot(dx,dz);let spd=0;
  if(d>0.3){const s=1.9*dt;n.x+=dx/d*Math.min(s,d);n.z+=dz/d*Math.min(s,d);let r=Math.atan2(dx,dz)-n.obj.rotation.y;r=Math.atan2(Math.sin(r),Math.cos(r));n.obj.rotation.y+=r*Math.min(1,dt*6);const o={x:n.x,z:n.z};pushOut(o,0.4);n.x=o.x;n.z=o.z;spd=0.45;}
  else{n.wait-=dt;if(n.wait<=0){n.wait=rnd(3,8);const L=LOCBY[n.cur];const p=freePoint(L,live?2:5);n.tx=p.x;n.tz=p.z;}}
  n.spd=lerp(n.spd,spd,dt*6);
  if(live&&d<=0.3&&Math.random()<dt*0.5){n.H.cast=0.4;const v=new THREE.Vector3();n.H.p.tip.getWorldPosition(v);burst(v.x,v.y,v.z,ELEM[live.el].c,10,2);}
  n.obj.position.x=n.x;n.obj.position.z=n.z;n.obj.position.y=gh(n.x,n.z);
  if(Math.hypot(n.x-camera.position.x,n.z-camera.position.z)<60)animHuman(n.H,dt,n.spd,t,false);
 }}
function updEnts(dt){const t=performance.now()/1000;
 ENT.slice().forEach(e=>{e.ttl-=dt;if(e.ttl<=0){if(e.kind==='scroll'&&!e.data.hidden&&Math.hypot(e.x-player.x,e.z-player.z)<30)say('Le parchemin s’envole et disparaît…','sys');burst(e.x,1.2,e.z,0xffffff,8,2);removeEnt(e);return;}
  e.t+=dt;
  if(e.kind==='scroll'){const u=e.obj.userData;if(!e.data.hidden){u.inner.position.y=1.1+Math.sin(e.t*2)*0.2;u.inner.rotation.y+=dt*1.4;u.rune.rotation.y-=dt*0.8;if(Math.random()<dt*6)PA.emit(e.x+rnd(-.4,.4),1,e.z+rnd(-.4,.4),0,rnd(.4,1),0,ELEM[e.data.spell.el].c,0.22,0.03,rnd(.6,1.1),0,0);}
   else{if(Math.random()<dt*0.8)PA.emit(e.x+rnd(-.5,.5),rnd(.5,1.5),e.z+rnd(-.5,.5),0,0.3,0,0xffffff,0.12,0.02,1,0,0,0.5);if(Math.hypot(e.x-player.x,e.z-player.z)<2.2){e.data.hidden=false;e.obj.visible=true;burst(e.x,1.2,e.z,ELEM[e.data.spell.el].c,20,3);say('Tu as trébuché sur un parchemin invisible !','sys');}}}
  else if(e.kind==='item'){e.obj.children[0].rotation.y+=dt*1.5;e.obj.children[0].position.y=1.2+Math.sin(e.t*2)*0.2;if(Math.random()<dt*5)PA.emit(e.x+rnd(-.3,.3),1.2,e.z+rnd(-.3,.3),0,rnd(.3,.8),0,0xffe08a,0.2,0.03,0.8,0,0);}
  else if(e.kind==='event'){const c=e.data.col;for(let i=0;i<2;i++){const a=e.t*2+i*Math.PI+Math.random()*0.3;PA.emit(e.x+Math.cos(a)*1.4,0.3+Math.random()*0.4,e.z+Math.sin(a)*1.4,-Math.sin(a)*0.8,rnd(1,2.5),Math.cos(a)*0.8,c,rnd(.25,.45),0.05,rnd(.8,1.4),0,0.3);}
   if(e.data.title.match(/[Ii]ncendie|[Rr]onces/))fireAt(e.x+rnd(-1,1),0.4,e.z+rnd(-1,1),0.7,1);
   if(e.data.title.match(/[Bb]rume/)&&Math.random()<0.5)PN.emit(e.x+rnd(-3,3),rnd(0.2,1.5),e.z+rnd(-3,3),rnd(-.2,.2),0,rnd(-.2,.2),0xd8dde8,1.5,2.5,rnd(2,3),0,0.2,0.35);
   if(e.data.title.match(/[Oo]mbre/)&&Math.random()<0.4)PN.emit(e.x+rnd(-2,2),rnd(0.2,1.5),e.z+rnd(-2,2),0,0.2,0,0x0d0618,1,1.6,1.5,0,0.2,0.6);}
  else if(e.kind==='creature'){const D=e.data;if(D.duel){duelAI(e,dt*ef());return;}if(D.wave){waveAI(e,dt);return;}
   if(D.frozen>0){D.frozen-=dt;D.core.material.color.setHex(0xcff4ff);if(Math.random()<dt*6)PA.emit(e.x,D.y,e.z,rnd(-.3,.3),rnd(0,.5),rnd(-.3,.3),0xffffff,0.15,0.03,0.6,0,0);}
   else D.core.material.color.setHex(ELEM[D.look].c);
   if(D.burn>0){D.burn-=dt;fireAt(e.x,D.y,e.z,0.4,1);D.bt=(D.bt||0)+dt;if(D.bt>1.5){D.bt=0;D.hp-=1;if(D.hp<=0){killCreature(e);return;}}}
   if(D.rooted>0){D.rooted-=dt;if(tal('nature_u')){D.rt=(D.rt||0)+dt;if(D.rt>2){D.rt=0;D.hp-=1;burst(e.x,D.y,e.z,0x3f8f2a,8,2);if(D.hp<=0){killCreature(e);return;}}}if(Math.random()<dt*5)PN.emit(e.x+rnd(-.4,.4),0.2,e.z+rnd(-.4,.4),0,rnd(.2,.6),0,0x3f8f2a,0.2,0.15,0.8,0,0,1);}
   const stuck=D.frozen>0||D.rooted>0;
   if(!stuck){let tx=D.tx,tz=D.tz;const dp=Math.hypot(player.x-e.x,player.z-e.z);
    if(D.confused>0){D.confused-=dt;if(Math.random()<dt*4){D.tx=e.x+rnd(-4,4);D.tz=e.z+rnd(-4,4);}}
    else if(dp<9&&dp>1&&stealth<=0&&!BUFF.invis&&!(tal('ombre_u')&&nightK>0.5)){tx=player.x;tz=player.z;}
    const dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz);
    if(d<0.4&&D.confused<=0&&dp>=9){const a=Math.random()*TAU,r=Math.random()*6;D.tx=D.hx+Math.cos(a)*r;D.tz=D.hz+Math.sin(a)*r;}
    else if(d>0.01){const sp=(D.confused>0?4:dp<9?2.4:1.8)*dt;e.x+=dx/d*Math.min(sp,d);e.z+=dz/d*Math.min(sp,d);}
    if(dp<1.1&&player.y<1.5){const d2=dp||1;player.x+=(player.x-e.x)/d2*0.8;player.z+=(player.z-e.z)/d2*0.8;flash(player.x,1.2,player.z,ELEM[D.look].c,1.2,0.2);if(!D.bumped){D.bumped=1;say('Aïe ! Tu te fais bousculer ('+esc(D.name)+'). Riposte avec un sort !','sys');}}}
   e.x+=D.kx*dt;e.z+=D.kz*dt;D.kx*=Math.max(0,1-4*dt);D.kz*=Math.max(0,1-4*dt);
   const o={x:e.x,z:e.z};pushOut(o,0.4);e.x=o.x;e.z=o.z;
   D.y=1.4+Math.sin(e.t*3)*(stuck?0.02:0.3);e.obj.position.set(e.x,D.y-1.4+gh(e.x,e.z),e.z);
   if(!stuck&&Math.random()<dt*10)PA.emit(e.x,D.y,e.z,rnd(-.2,.2),rnd(0,.4),rnd(-.2,.2),ELEM[D.look].c,0.3,0.05,0.5,0,0);
   e.obj.rotation.y=Math.atan2(player.x-e.x,player.z-e.z);}
 });}
function loop(now){requestAnimationFrame(loop);const dt=Math.min(0.05,(now-last)/1000);last=now;if(started)update(dt*tScale());else{PA.update(dt);PN.update(dt);PW.update(dt);}tick5(dt);updReflect(dt);WIND.uTime.value=now/1000;preRender();if(QL>=2&&composer)composer.render();else renderer.render(scene,camera);postRender();}

/* ---------- jour / nuit ---------- */
function nightfall(){$('#night-sub').textContent='FIN DU JOUR '+S.day;const n=S.done.length;$('#night-txt').textContent='Tu as appris '+S.spells.length+' sort'+(S.spells.length>1?'s':'')+' et accompli '+n+' quête'+(n>1?'s':'')+' jusqu’ici. Pendant ton sommeil, la forêt repousse et le Maître du Jeu prépare la journée de demain…';$('#night').classList.remove('hidden');}
$('#b-sleep').onclick=async()=>{$('#night').classList.add('hidden');S.day++;S.time=7*60;planCourses();
 ENT.slice().forEach(e=>{if(e.z<-300||e.z>300||(e.kind!=='item'&&!(e.kind==='chest'&&e.data.relic)&&Math.random()<0.6))removeEnt(e);});
 if(DUN)DUN.boss=null;S.zone='monde';newPuzzles();syncPuzzles();setWeather(pickWeather());for(let i=0;i<2;i++)spawnChest(pick(LOCS).id);
 TREES.forEach(t=>{if(t.st!=='ok'){t.st='ok';t.burn=0;treeLook(t);}});treesDirty();
 player.x=3;player.z=12;player.y=0;player.vy=0;mana=manaMax();chron('Jour '+S.day+' : réveil à la Grande Cour.');
 say('☀ Jour '+S.day+(aiState==='on'?' — le MJ prépare la journée…':''),'gm');
 const res=await callGM('day',{});if(res.narration)say('<b>MJ</b> : '+esc(res.narration),'gm');applyActions(res.actions,null);save();};

/* ---------- démarrage ---------- */
function startGame(state,fresh){S=migrate(state);started=true;mana=manaMax();
 ['#top','#joy-zone','#ctrls'].forEach(s=>$(s).classList.remove('hidden'));$('#start').classList.add('hidden');
 buildCharacters();makeBeacon();buildProps();initWorld2();
 if(fresh){planCourses();chron('Arrivée de '+S.name+' à Aldermoor.');
  say('Bienvenue à Aldermoor, <b>'+esc(S.name)+'</b>. Ici, personne ne te dira quoi faire.','gm');
  addQuest({title:'Premiers pas',desc:'Lila te propose de faire le tour des lieux importants.',giver:'lila',steps:[{kind:'talk',npc:'lila',text:'Parler à Lila Brisevent (Grande Cour)'},{kind:'goto',loc:'biblio',text:'Visiter la Tour-Bibliothèque'},{kind:'collect',loc:'biblio',item:'un vieux grimoire',text:'Trouver le grimoire égaré près de la tour'}],reward:{xp:40,spell:{...POOL.find(p=>p.name==='Orbe de clarté'),id:'orbe-de-clarte'}}});
  spawnScroll('serre',genSpell('nature'));spawnScroll('cour',genSpell('feu'));spawnScroll(pick(['lac','cercle','village']),genSpell('glace'));spawnScroll('arene',genSpell('vent'),400,true);
  const e=EVT[2];spawnEvent('arene',e.t,e.d,e.need,30);
  spawnCreatures('foret','Feux follets',3,'eau','feu');}
 else{if(!S.courses||!S.courses.length)planCourses();S.quests.forEach(onStepStart);say('Bon retour, <b>'+esc(S.name)+'</b>.','gm');spawnScroll(pick(LOCS).id,genSpell());}
 camYaw=Math.PI;ensureSets();updSetBtn();updateHUD();aiBadge();updObjBtns();save();
}
function applyQuality(){HQ=QL>=1;const ok=QL<2||setupBloom();$('#b-q').textContent='Graphismes : '+['légers (plus fluide)','élevés','ultra'+(ok?' (halo lumineux)':' (halo indisponible)')][QL];renderer.shadowMap.enabled=HQ;sun.castShadow=HQ;{const ms=QL>=2?2048:1536;if(sun.shadow.mapSize.x!==ms){sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}}GRASS_FAR.value=HQ?60:45;CULL.dirty=true;scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);}});cubeT=0;resize();}
$('#b-q').onclick=()=>{QL=(QL+1)%3;try{localStorage.setItem('aldermoor-q',['lq','hq','uq'][QL]);}catch(e){}applyQuality();};
markStatic();buildWorld();buildWorld4();buildRift();buildBosquet();buildRack();const MERGED=mergeStatic();buildWorld2();buildWorld3();buildArenaStone();buildDecor();groupZones();resize();applyQuality();
const saved=load();
if(saved&&saved.v===1){$('#b-cont').classList.remove('hidden');$('#b-cont').textContent='Continuer : '+saved.name+' (jour '+saved.day+')';$('#name').value=saved.name;}
$('#b-new').onclick=()=>{const n=$('#name').value.trim()||'Apprenti';startGame(newState(n),true);};
$('#b-cont').onclick=()=>startGame(saved,false);
$('#name').addEventListener('keydown',e=>{if(e.key==='Enter')$('#b-new').click();});
(function intro(){if(started)return;const t=performance.now()/12000;camera.position.set(Math.sin(t)*48,20,Math.cos(t)*48-10);camera.lookAt(0,5,-18);lighting();ambientAnim(0.016,performance.now()/1000);requestAnimationFrame(intro);})();
requestAnimationFrame(loop);
