/* ================= L'ACADÉMIE DES CIEUX : la Citadelle des Nuées =================
   Une grande île flotte au-dessus du nord-ouest de la vallée (CIEUX), visible depuis la Grande Cour. Dessus : la Rotonde
   des Vents (colonnes et coupole), la Tour des Nuées (phare) et un quai. On y monte : en balai ; par le courant ascendant
   qui part du pied de l'île ; ou en navette céleste (billet de 10 pièces au poteau de l'embarcadère, retour gratuit).
   Île = entrée COLS avec un dessous (c.bot), comme les îles des Landes (20f) ; construite entre markStatic et mergeStatic
   (enrobage de buildBosquet) pour être fusionnée par matériau. Lieu 'cieux' avec L.y (hauteur) : 21-boucle n'y met le
   joueur que s'il est en haut. Académie : vent (Pr. Zéphyrine Altavent), lumière (Pr. Lucius Clairaube), directrice
   Célestine Hautciel ; sort inédit « Ailes de lumière » (grand bond puis vol plané). Électricité, magnétisme : plus tard. */
const CIEUX={x:-42,z:-60,R:16,up:52,top:0,built:false,vent:null,quai:null,sol:null};
{const L={id:'cieux',name:'Académie des Cieux',x:CIEUX.x,z:CIEUX.z,r:CIEUX.R-1,spot:{x:CIEUX.x+3,z:CIEUX.z+4},sky:true};LOCS.push(L);LOCBY.cieux=L;LOC_STYLE.cieux=null;}
function buildCieux(){const C=CIEUX;let g0=0;for(let a=0;a<8;a++)g0=Math.max(g0,gh(C.x+Math.cos(a)*C.R,C.z+Math.sin(a)*C.R));C.top=Math.max(gh(C.x,C.z),g0)+C.up;LOCBY.cieux.y=C.top;
 const y=C.top,R=C.R,grass=mat(0x4c8a36,{flatShading:true,roughness:1}),rock=mat(0x77705f,{flatShading:true,roughness:0.95}),dirt=mat(0x7a5a3a,{flatShading:true}),
  marbre=mat(0xf2efe6,{roughness:0.6}),bleu=mat(0x5a8ad8,{flatShading:true,roughness:0.7}),or=mat(0xe8c050,{metalness:0.4,roughness:0.4}),bois=mat(0x8a6038,{flatShading:true});
 const M=(geo,m,x,yy,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(C.x+x,yy,C.z+z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
 /* le rocher */
 M(new THREE.CylinderGeometry(R,R*0.92,2,30),grass,0,y-1,0);
 M(new THREE.ConeGeometry(R*0.95,R*1.6,12).rotateX(Math.PI),rock,0,y-2-R*0.8,0);
 M(new THREE.ConeGeometry(R*0.55,R*0.9,9).rotateX(Math.PI),dirt,0,y-2-R*1.85,0);
 for(let k=0;k<12;k++){const a=k/12*TAU+0.3,r=R*rnd(0.82,0.95),s=rnd(0.7,1.5);const o=M(new THREE.DodecahedronGeometry(s,0),rock,Math.cos(a)*r,y-0.2,Math.sin(a)*r);o.rotation.set(rnd(0,3),rnd(0,3),0);}
 COLS.push({x:C.x,z:C.z,r:R-0.3,h:y,bot:y-2-R*1.6,sky:true});
 /* la Rotonde des Vents : dalle, 8 colonnes, anneau, coupole et flèche dorée */
 const rx=-2,rz=-3;M(new THREE.CylinderGeometry(6.6,6.8,0.45,24),marbre,rx,y+0.2,rz);
 for(let k=0;k<8;k++){const a=k/8*TAU,cx=rx+Math.cos(a)*5.7,cz=rz+Math.sin(a)*5.7;M(new THREE.CylinderGeometry(0.34,0.4,5.2,10),marbre,cx,y+2.9,cz);
  COLS.push({x:C.x+cx,z:C.z+cz,r:0.45,h:y+5.6,bot:y-0.5,sky:true});}
 M(new THREE.CylinderGeometry(6.2,6.2,0.6,24,1,true),marbre,rx,y+5.7,rz);
 M(new THREE.SphereGeometry(6.1,22,10,0,TAU,0,Math.PI/2),mat(0xcfe0ff,{roughness:0.5,side:THREE.DoubleSide}),rx,y+5.9,rz);
 M(new THREE.ConeGeometry(0.35,2.6,8),or,rx,y+13.3,rz);
 /* la Tour des Nuées (phare) */
 const tx=8,tz=5;M(new THREE.CylinderGeometry(1.5,1.9,13,12),marbre,tx,y+6.5,tz);M(new THREE.ConeGeometry(2.3,3.6,12),bleu,tx,y+14.8,tz);
 for(let k=0;k<4;k++)M(new THREE.BoxGeometry(0.5,0.9,0.12),mat(0x2a3a6a,{emissive:0xffd890,emissiveIntensity:0.6}),tx+Math.cos(k*1.57)*1.62,y+8+k*1.6,tz+Math.sin(k*1.57)*1.62).rotation.y=-k*1.57+Math.PI/2;
 COLS.push({x:C.x+tx,z:C.z+tz,r:2.1,h:y+13,bot:y-0.5,sky:true});
 {const gl=glow(0xffe8a0,9,0.55);gl.position.set(C.x+tx,y+13.5,C.z+tz);gl.userData.dyn=true;gl.userData.noCull=true;scene.add(gl);}
 {const gl=glow(0xbfe0ff,R*2.6,0.22);gl.position.set(C.x,y+2,C.z);gl.userData.dyn=true;gl.userData.noCull=true;scene.add(gl);}
 /* quelques arbres */
 [[-9,6],[-11,-4],[3,10],[-5,11],[11,-6]].forEach(([x,z])=>{M(new THREE.CylinderGeometry(0.16,0.22,1.4,6),dirt,x,y+0.7,z);M(new THREE.ConeGeometry(1.1,3,7),grass,x,y+2.8,z);});
 /* le quai, du côté de la vallée */
 const dx=-C.x,dz=-C.z,dl=Math.hypot(dx,dz),ux=dx/dl,uz=dz/dl,qx=ux*(R-1),qz=uz*(R-1);const ry=Math.atan2(ux,uz);
 const q=M(new THREE.BoxGeometry(2.6,0.3,5),bois,qx+ux*1.8,y-0.05,qz+uz*1.8);q.rotation.y=ry;
 COLS.push({x:C.x+qx+ux*2.4,z:C.z+qz+uz*2.4,r:1.5,h:y,bot:y-1,sky:true});
 C.quai={x:C.x+qx+ux*3.2,z:C.z+qz+uz*3.2,ry};
 /* le courant ascendant (au bord, côté vallée) et l'embarcadère au pied */
 const vx=C.x+ux*(R+2.2)+uz*4,vz=C.z+uz*(R+2.2)-ux*4;C.vent={x:vx,z:vz,y0:gh(vx,vz)-1,y1:y+3,r:2.3};
 C.sol={x:C.x+ux*(R+6),z:C.z+uz*(R+6),ry};
 const p=C.sol;M(new THREE.CylinderGeometry(0.12,0.14,2.6,6),bois,p.x-C.x,gh(p.x,p.z)+1.3,p.z-C.z);
 {const pan=M(new THREE.BoxGeometry(1.2,0.6,0.08),mat(0x3a5a9a),p.x-C.x,gh(p.x,p.z)+2.3,p.z-C.z);pan.rotation.y=ry;}
 C.built=true;}
{const _b=buildBosquet;buildBosquet=function(){const r=_b.apply(this,arguments);buildCieux();return r;};}
/* la navette céleste : une petite barque-nuage qui flotte au pied de l'île (objet qui bouge : hors fusion) */
{const _d=buildDecor;buildDecor=function(){const r=_d.apply(this,arguments);const C=CIEUX;if(!C.built)return r;const p=C.sol,g=new THREE.Group();
  const coque=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.6,0.6,10,1,false,0,Math.PI).rotateZ(Math.PI/2).rotateY(Math.PI/2),mat(0x8a6038,{flatShading:true}));coque.scale.set(1,1,2.2);g.add(coque);
  const voile=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.6),mat(0xf4f0ff,{side:THREE.DoubleSide}));voile.position.set(0,1.3,0);g.add(voile);
  const mat0=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.2,5),mat(0x5a3a20));mat0.position.y=1.1;g.add(mat0);
  for(let k=0;k<5;k++){const n=glow(0xffffff,1.6,0.5);n.position.set(rnd(-1,1),-0.4,rnd(-1.6,1.6));g.add(n);}
  g.position.set(p.x+Math.cos(p.ry)*2.4,gh(p.x,p.z)+1.2,p.z-Math.sin(p.ry)*2.4);g.rotation.y=p.ry;g.userData.dyn=true;scene.add(g);C.barque=g;
  station({x:p.x,z:p.z,reach:2.6,hint:()=>regionOf(player.x)==='vallee'&&player.y<C.top-10?'⛵ Navette céleste vers l’Académie des Cieux (10 💰)':null,act:()=>cieuxMonter()});
  station({x:C.quai.x,z:C.quai.z,reach:2.4,hint:()=>Math.abs(player.y-C.top)<2?'⛵ Redescendre dans la vallée (navette)':null,act:()=>cieuxDescendre()});
  return r;};}
function cieuxMonter(){const C=CIEUX;if((S.or||0)<10){say('⛵ Le billet coûte <b>10 pièces d’or</b>. Tu peux aussi monter en balai, ou par le courant ascendant.','sys');return;}
 S.or-=10;sfx('door');fade(()=>{const q=C.quai;player.x=q.x;player.z=q.z;player.y=C.top+0.2;player.vx=player.vz=player.vy=0;player.ry=q.ry+Math.PI;camYaw=player.ry;if(FLY.on)dismount(true);
  say('⛵ La navette te dépose sur le quai de la <b>Citadelle des Nuées</b>.','sys');save();});}
function cieuxDescendre(){const C=CIEUX;sfx('door');fade(()=>{const p=C.sol;player.x=p.x+Math.sin(p.ry)*1.5;player.z=p.z+Math.cos(p.ry)*1.5;player.y=gh(player.x,player.z)+0.2;player.vx=player.vz=player.vy=0;player.ry=p.ry;camYaw=p.ry;say('⛵ Retour dans la vallée.','sys');});}
/* chaque image : courant ascendant, barque qui flotte, habitants de l'île à la bonne hauteur, ailes de lumière */
const AILES={t:0};
function cieuxTick(dt){const C=CIEUX;if(!C.built||!started||S.zone!=='monde'||regionOf(player.x)!=='vallee')return;const t=performance.now()/1000;
 if(C.barque)C.barque.position.y=gh(C.sol.x,C.sol.z)+1.2+Math.sin(t*1.3)*0.15;
 const V=C.vent,dx=player.x-V.x,dz=player.z-V.z,d=Math.hypot(dx,dz);
 if(Math.hypot(V.x-camera.position.x,V.z-camera.position.z)<110)for(let k=0;k<3;k++){const h=rnd(V.y0,V.y1),a=t*3+h*0.5+k*2.1,r=V.r*rnd(0.4,1);PA.emit(V.x+Math.cos(a)*r,h,V.z+Math.sin(a)*r,-Math.sin(a)*2,rnd(2,5),Math.cos(a)*2,k?0xe8fbff:0xbfe8ff,rnd(.2,.35),0.05,rnd(.5,.9),0,1);}
 if(d<V.r&&player.y>V.y0-1.5&&player.y<V.y1){if(FLY.on)player.vy=Math.max(player.vy,6);else{player.vy=Math.max(player.vy,player.y<V.y1-2?13:4);player.grounded=false;player.feather=1;}
  if(player.y<V.y1-3){const k=Math.min(1,dt*1.5);player.x-=dx*k*0.5;player.z-=dz*k*0.5;}
  if(!S.seenVentC){S.seenVentC=1;say('🌪 Un <b>courant ascendant</b> te porte vers la Citadelle des Nuées ! En haut, avance vers l’île.','gm');}}
 if(S.locId==='cieux'&&!S.seenCieux){S.seenCieux=1;say('☁ La <b>Citadelle des Nuées</b> : ici, on enseigne la magie du Vent et de la Lumière. Parle aux professeurs !','gm');}}
{const _u=updNPCs;updNPCs=function(dt,t){const r=_u.apply(this,arguments);const C=CIEUX;if(C.built)for(const n of npcs){if(Math.hypot(n.x-C.x,n.z-C.z)<C.R-0.5&&LOCBY[n.cur]&&LOCBY[n.cur].sky)n.obj.position.y=C.top;}return r;};}
{const _w=world4Tick;world4Tick=function(dt){cieuxTick(dt);ailesTick(dt);return _w.apply(this,arguments);};}
/* ---------- l'académie ---------- */
ACADS.push({id:'cieux',n:'Académie des Cieux',dir:'celestine',ou:'sur la Citadelle des Nuées',profs:{vent:'zephyrine',lumiere:'lucius'},
 inedit:{name:'Ailes de lumière',inc:'Alae Lucis',el:'lumiere',form:'util',special:'ailes',legend:true,cost:35,cd:9,id:'acad-ailes',
  desc:'Un grand bond porté par des ailes de lumière, puis un long vol plané. Seule la directrice des Cieux l’enseigne.'},
 quete:{title:'L’Épreuve des Hauteurs',desc:'Célestine Hautciel veut voir si le ciel t’écoute, de la vallée jusqu’aux Grandes Terres.',steps:[
  {kind:'cast',loc:'hauteurs',el:'vent',text:'Faire chanter le vent sur les Hauteurs de Brisevent'},{kind:'cast',loc:'observatoire',el:'lumiere',text:'Allumer une lumière à l’Observatoire'},
  {kind:'collect',loc:'terres_lac',item:'une plume de pégase',text:'Trouver une plume de pégase près du Lac aux Nénuphars (Grandes Terres)'},
  {kind:'talk',npc:'celestine',text:'Rapporter la plume à Célestine Hautciel'}]}});
[{id:'zephyrine',name:'Pr. Zéphyrine Altavent',role:'professeure de magie du Vent, vive et rieuse, ne tient pas en place, dit souvent « Laisse-toi porter ! »',home:'cieux',els:['vent'],mdl:['rodeuse',0xc8f0e8],
  look:{skin:0xf0d0b0,hair:0xd8e8e0,style:'pony',hat:0x5aa890,robe:0x7ac8b0,trim:0xffffff,h:0.97},
  lines:['Laisse-toi porter ! Le vent sait où il va, lui.','Tu sens ce petit courant d’air ? C’est la magie qui te salue.','On ne retient pas le vent. On danse avec.']},
 {id:'lucius',name:'Pr. Lucius Clairaube',role:'professeur de magie de la Lumière, solennel et un peu théâtral',home:'cieux',els:['lumiere'],mdl:['clerc',0xfff0b0],
  look:{skin:0xe8c8a0,hair:0xf0d890,style:'short',beard:0xf0d890,hat:0xffe8a0,robe:0xf8f0d8,trim:0xffc840,h:1.06},
  lines:['Que la lumière soit… et elle fut. Toujours.','La lumière révèle ce qui se cache. Même les parchemins invisibles.','Ne regarde pas mon sort en face, apprenti. Ébloui, on apprend moins bien.']},
 {id:'celestine',name:'Célestine Hautciel',role:'directrice de l’Académie des Cieux, élégante, rêveuse, parle du ciel comme d’un vieil ami',home:'cieux',els:['vent','lumiere'],mdl:['sorcier',0xd8e8ff],
  look:{skin:0xf4dcc8,hair:0xf8f8ff,style:'long',hat:0x2a3a7a,robe:0xc8d8ff,trim:0xffe08a,h:1.03},
  lines:['Bienvenue dans les nuées. Ici, le ciel est un professeur.','D’en haut, la vallée paraît si petite… et le monde si grand.','Les meilleurs sorciers savent quand s’élever, et quand redescendre.']}
].forEach(p=>{if(NPCS.some(n=>n.id===p.id))return;NPCS.push({id:p.id,name:p.name,role:p.role,home:p.home,els:p.els,cl:[],look:p.look});NPCBY[p.id]=NPCS[NPCS.length-1];MDL_PERSO[p.id]=p.mdl;LINES[p.id]=p.lines.slice();});
Object.assign(ACAD_DIT,{zephyrine:{cours:'Ouvre les bras. Sens d’où vient le vent… et laisse-toi porter !',bravo:'Tu vois ? Tu voles presque ! Laisse-toi porter, toujours !',fini:'Tu connais déjà tous mes sorts de Vent ! Allez, file !'},
 lucius:{cours:'Concentre la lumière au bout de ta baguette… plus fort… PLUS FORT ! Voilà.',bravo:'Que la lumière soit… et elle fut ! Magnifique.',fini:'Tu connais déjà toute la Lumière que j’enseigne. Tu brilles, apprenti.'}});
{const A=ACADS[ACADS.length-1];for(const el in A.profs)ACAD_PROF[A.profs[el]]={A,el};}
/* le sort inédit : grand bond, puis vol plané (chute lente) avec une traînée de lumière, tant qu'on ne touche pas le sol */
function castAiles(sp){if(FLY.on){say('Tu voles déjà !','sys');return;}player.vy=20;player.grounded=false;player.feather=0;AILES.t=14;flash(player.x,player.y+1.2,player.z,0xfff0b0,2.5,0.6);burst(player.x,player.y+1,player.z,0xfff0b0,30,5);say('🕊 Des ailes de lumière te portent !','sys');}
function ailesTick(dt){if(AILES.t<=0)return;AILES.t-=dt;if(FLY.on||player.swim||(player.grounded&&AILES.t<13.6)){AILES.t=0;return;}
 if(player.vy<-1.3)player.vy=-1.3;for(let s=-1;s<=1;s+=2)if(Math.random()<dt*40){const a=player.ry+s*Math.PI/2;PA.emit(player.x+Math.sin(a)*0.8,player.y+1.3,player.z+Math.cos(a)*0.8,Math.sin(a)*rnd(.5,1.5),rnd(-.2,.4),Math.cos(a)*rnd(.5,1.5),Math.random()<0.6?0xfff0b0:0xffffff,rnd(.2,.35),0.03,rnd(.4,.7),0,1.5);}}
{const _u=doUtil;doUtil=function(sp){if(sp&&sp.special==='ailes')return castAiles(sp);return _u.apply(this,arguments);};}
SP_IC.ailes='🕊️';
/* on ne parle pas à quelqu'un qui est 50 m plus haut (ou plus bas) : les habitants de l'île ne répondent qu'à ceux qui y sont */
{const _f=findFocus;findFocus=function(){const r=_f.apply(this,arguments);if(focus&&focus.t==='npc'&&Math.abs(focus.n.obj.position.y-player.y)>3){focus=null;$('#hint').classList.add('hidden');$('#b-act').classList.remove('ready');}return r;};}
