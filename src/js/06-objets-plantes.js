/* ================= OBJETS PHYSIQUES & PLANTES ================= */
let PROPS=[],PLANTS=[],DECALS=[],ORBS=[],CLOUDS=[];
const PG={crate:new THREE.BoxGeometry(0.9,0.9,0.9),barrel:new THREE.CylinderGeometry(0.38,0.38,0.95,14),pump:new THREE.SphereGeometry(0.42,14,10),stem:new THREE.CylinderGeometry(0.04,0.05,0.18,6),rock:rockGeo(0.55),band:new THREE.CylinderGeometry(0.395,0.395,0.07,14)};
function makeProp(type,x,z){const g=new THREE.Group();let r=0.45,h=0.45,burn=true;
 if(type==='crate'){objMats();mesh(PG.crate,CRATEM,0,0,0,g);}
 else if(type==='barrel'){objMats();mesh(PG.barrel,BARRELM,0,0,0,g);[-0.3,0.3].forEach(y=>mesh(PG.band,mat(0x3a3a3a,{metalness:0.6,roughness:0.5,flatShading:false}),0,y,0,g));r=0.4;h=0.475;}
 else if(type==='pump'){const p=mesh(PG.pump,mat(0xe07a20,{flatShading:false}),0,0,0,g);p.scale.y=0.78;mesh(PG.stem,0x4a6a2a,0,0.38,0,g);r=0.42;h=0.33;}
 else {mesh(PG.rock,ROCKM,0,0,0,g);r=0.55;h=0.42;burn=false;}
 g.position.set(x,h,z);scene.add(g);
 const p={g,type,x,y:h,z,vx:0,vy:0,vz:0,r,h,burnable:burn,burn:0,lev:0,dead:0,hx:x,hz:z,spin:0};PROPS.push(p);return p;}
function buildProps(){
 const put=(type,cx,cz,n,spread)=>{for(let i=0;i<n;i++){for(let k=0;k<10;k++){const x=cx+rnd(-spread,spread),z=cz+rnd(-spread,spread);if(isFree({x,z},0.8)&&!inLake({x,z})&&pathDist(x,z)>0.6){makeProp(type,x,z);break;}}}};
 put('crate',7,-2,3,2);put('barrel',-7,-1,2,1.5);put('crate',-5,10,2,1.5);
 put('barrel',16,54,3,2);put('crate',4,57,3,2);put('pump',18,68,4,2.5);put('barrel',6,68,2,1.5);
 put('pump',-30,20,5,3);put('crate',-42,19,2,1.5);
 put('crate',-12,34,3,3);put('barrel',-15,26,2,2);
 put('rock',-44,46,3,4);put('rock',55,-1,3,2.5);put('crate',27,20,2,1.5);put('barrel',3,-30,2,3);
 put('crate',36.5,-13,2,1.2);put('barrel',36.4,-22.2,2,0.8);put('barrel',58.5,51.5,2,1);put('pump',49.5,55,2,1);put('rock',-60.5,-31,2,1.5);put('crate',-56.5,-21,1,1);
}
function updProps(dt){
 for(const p of PROPS){
  if(p.dead>0){p.dead-=dt;if(p.dead<=0){p.x=p.hx;p.z=p.hz;p.y=p.h+3;p.vx=p.vy=p.vz=0;p.burn=0;p.bn=0;p.lev=0;p.g.visible=true;p.g.rotation.set(0,0,0);burst(p.x,p.y,p.z,0xffffff,10,2);}continue;}
  const g0=gh(p.x,p.z);if(p.lev>0){p.lev-=dt;if(p.burn>0&&!p.meteor){meteorize(p);}const ty=g0+2.4+Math.sin(performance.now()/300+p.hx)*0.3;p.vy+=((ty-p.y)*10-p.vy*3)*dt;p.vx*=1-2*dt;p.vz*=1-2*dt;p.g.rotation.y+=dt*1.5;p.g.rotation.x+=dt*0.7;if(Math.random()<0.4)PA.emit(p.x+rnd(-.4,.4),p.y-0.4,p.z+rnd(-.4,.4),0,-0.5,0,ELEM.arcane.c,0.3,0.05,0.7,0,0);if(p.lev<=0)p.vy=0;}
  else p.vy-=22*dt;
  p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
  if(p.y<g0+p.h){if(p.vy<-4){if(p.meteor){p.meteor=false;meteorBoom(p);}p.vy*=-0.3;burst(p.x,0.1,p.z,0x998866,4,2);}else p.vy=0;p.y=g0+p.h;const f=Math.max(0,1-7*dt);p.vx*=f;p.vz*=f;if(g0!==0){const sx=gh(p.x+0.5,p.z)-gh(p.x-0.5,p.z),sz=gh(p.x,p.z+0.5)-gh(p.x,p.z-0.5);const kk=(p.type==='crate'?6:22)*dt;p.vx-=sx*kk;p.vz-=sz*kk;}if(p.lev<=0){p.g.rotation.x*=Math.max(0,1-8*dt);}}
  const o={x:p.x,z:p.z};pushOut(o,p.r,true);if(o.x!==p.x){p.vx*=-0.3;}if(o.z!==p.z){p.vz*=-0.3;}p.x=o.x;p.z=o.z;
  if(inLake(p)&&!onIce(p)&&p.y<p.h+0.3&&p.lev<=0){splash(p.x,p.z);p.dead=40;p.g.visible=false;continue;}
  const dx=p.x-player.x,dz=p.z-player.z,d=Math.hypot(dx,dz),m=p.r+0.4;if(d<m&&p.y<g0+p.h+0.6&&player.y<p.y+p.h-0.25){const k=(m-d);p.x+=dx/d*k;p.z+=dz/d*k;p.vx+=dx/d*2;p.vz+=dz/d*2;}
  if(p.burn>0){if(!p.bn){p.bn=1;npcReact(p.x,p.z,p.type==='pump'?'pump':'fire');}p.burn-=dt;fireAt(p.x,p.y+0.2,p.z,0.6,2);if(p.burn<=0){for(let i=0;i<14;i++)PN.emit(p.x+rnd(-.4,.4),p.y,p.z+rnd(-.4,.4),rnd(-.5,.5),rnd(.5,2),rnd(-.5,.5),0x3a3530,0.6,1.4,rnd(1,2),-0.5,0.5,0.6);p.dead=90;p.g.visible=false;if(p.type==='pump')say('La citrouille éclate en purée rôtie. Quelqu’un va être fâché…','sys');}}
  p.g.position.set(p.x,p.y,p.z);
  if(tal('arcane_u')&&Math.hypot(p.vx,p.vz)>6){p.ht=(p.ht||0)-dt;if(p.ht<=0)ENT.forEach(e=>{if(e.kind==='creature'&&Math.hypot(e.x-p.x,e.z-p.z)<p.r+0.8){hurtCreature(e,'arcane',p.x,p.z);p.ht=0.5;}});}
  const sp=Math.hypot(p.vx,p.vz);if(sp>0.5&&p.lev<=0&&p.type!=='crate')p.g.rotation.z+=sp*dt*1.5;
 }
 for(let i=0;i<PROPS.length;i++){const a=PROPS[i];if(a.dead>0)continue;for(let j=i+1;j<PROPS.length;j++){const b=PROPS[j];if(b.dead>0)continue;const dx=b.x-a.x,dz=b.z-a.z;if(Math.abs(dx)>1.2||Math.abs(dz)>1.2)continue;if(Math.abs(a.y-b.y)>0.9)continue;const d=Math.hypot(dx,dz)||0.01,m=a.r+b.r;if(d<m){const k=(m-d)/2;a.x-=dx/d*k;a.z-=dz/d*k;b.x+=dx/d*k;b.z+=dz/d*k;}}}
}
function fireAt(x,y,z,size,n){for(let i=0;i<(n||2);i++){PA.emit(x+rnd(-size,size)*0.6,y+rnd(0,size*0.5),z+rnd(-size,size)*0.6,rnd(-.3,.3),rnd(1.5,3.2),rnd(-.3,.3),Math.random()<0.5?0xff7a2e:0xffc040,size*rnd(0.7,1.2),0.1,rnd(.4,.8),-1,1);}if(Math.random()<0.25)PN.emit(x,y+size,z,rnd(-.3,.3),rnd(1,2),rnd(-.3,.3),0x2a2624,size*0.8,size*2.2,rnd(1.2,2),-0.3,0.4,0.45);}
function splash(x,z){for(let i=0;i<22;i++){const a=Math.random()*TAU,v=rnd(1,3.5);PN.emit(x,0.2,z,Math.cos(a)*v,rnd(2,5),Math.sin(a)*v,0x9ad0ff,0.25,0.12,rnd(.5,.9),12,0.5,0.9);}ring(x,z,0xbfe6ff,2.2,0.8);}
function ring(x,z,color,size,life){const m=new THREE.Mesh(new THREE.RingGeometry(0.7,1,32).rotateX(-Math.PI/2),basic(color,{transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending}));m.position.set(x,gh(x,z)+0.12,z);scene.add(m);DECALS.push({m,t:0,max:life||1,grow:size||2,kind:'ring'});}
function decal(x,z,color,r,life,opacity){const m=new THREE.Mesh(new THREE.CircleGeometry(r,24).rotateX(-Math.PI/2),basic(color,{transparent:true,opacity:opacity||0.6,depthWrite:false}));m.position.set(x,gh(x,z)+0.05+Math.random()*0.02,z);scene.add(m);DECALS.push({m,t:0,max:life,o:opacity||0.6,kind:'decal'});}
function updDecals(dt){DECALS=DECALS.filter(d=>{d.t+=dt;const k=d.t/d.max;if(k>=1){scene.remove(d.m);d.m.geometry.dispose();d.m.material.dispose();return false;}
 if(d.kind==='ring'){const s=1+k*d.grow*2;d.m.scale.set(s,1,s);d.m.material.opacity=0.8*(1-k);}else d.m.material.opacity=d.o*Math.min(1,(1-k)*3);return true;});}
// plantes poussées par la magie
const PLG={stem:new THREE.CylinderGeometry(0.03,0.04,0.5,5),pet:new THREE.IcosahedronGeometry(0.16,0),bush:new THREE.IcosahedronGeometry(0.55,0),mush:new THREE.CylinderGeometry(0.06,0.08,0.35,6),cap:new THREE.SphereGeometry(0.22,10,6,0,TAU,0,Math.PI/2),pad:new THREE.CircleGeometry(0.5,12).rotateX(-Math.PI/2)};
function growPlant(x,z,type){if(PLANTS.length>80){const o=PLANTS.shift();scene.remove(o.g);}
 const g=new THREE.Group();
 if(type==='lily'){mesh(PLG.pad,mat(0x3a8a3a,{side:THREE.DoubleSide}),0,0.13,0,g,false);if(Math.random()<0.6){mesh(PLG.pet,mat(0xffa0d0,{emissive:0x401020}),0.1,0.22,0,g);}}
 else if(type==='bush'){mesh(PLG.bush,mat(0x3f8f3a),0,0.4,0,g).scale.set(1,0.8,1);if(Math.random()<0.5)for(let i=0;i<3;i++)mesh(PLG.pet,mat(0xff5070),rnd(-.4,.4),rnd(.4,.8),rnd(-.4,.4),g).scale.setScalar(0.5);}
 else if(type==='mush'){mesh(PLG.mush,0xf0e8d8,0,0.17,0,g);mesh(PLG.cap,mat(pick([0xd03030,0xa070e0,0xe0a030]),{flatShading:false}),0,0.33,0,g);}
 else{mesh(PLG.stem,0x3a8a2a,0,0.25,0,g);mesh(PLG.pet,mat(pick([0xffe066,0xff7ab0,0xffffff,0xb08aff,0x7ac8ff,0xff8a40]),{emissive:0x202020}),0,0.52,0,g);}
 g.position.set(x,gh(x,z),z);g.scale.setScalar(0.01);g.rotation.y=Math.random()*TAU;scene.add(g);PLANTS.push({g,x,z,t:0,type,burn:0});}
function updPlants(dt){PLANTS=PLANTS.filter(p=>{if(p.t<1){p.t=Math.min(1,p.t+dt*1.6);const k=p.t;const s=k<0.8?k/0.8*1.15:1.15-(k-0.8)/0.2*0.15;p.g.scale.setScalar(Math.max(0.01,s));}
 if(p.burn>0){p.burn-=dt;fireAt(p.x,0.3,p.z,0.4,1);if(p.burn<=0){scene.remove(p.g);decal(p.x,p.z,0x1a1612,0.5,20,0.6);return false;}}return true;});}

