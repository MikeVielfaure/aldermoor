/* ================= L'ACADÉMIE DE LA SOMBRITÉ : au cœur du Bois des Ombres-Longues (Grandes Terres) =================
   Une clairière aplanie au fond de la Sylve des Mille-Troncs (lieu 'terres_sombrite', ajouté à TER_LIEUX avant la
   construction des Grandes Terres : aplat, pas d'arbres). Autour, sur SOMB.R m, le bois s'assombrit (enrobage de
   lighting) et des « Ombres-Longues » surgissent près de qui s'y aventure. Trois façons de passer :
   invisible (Philtre d'invisibilité, BUFF.invis), malin (un sort de Lumière à la Pierre des Lucioles éclaire un
   sentier sûr quelques minutes, SOMB.sentier), ou costaud (se battre). La clairière est un sanctuaire : les ombres s'y
   dissipent. Académie : ombre (Pr. Noctis Valombre), arcane / télékinésie (Pr. Aurèle Flottebois), directrice Dame
   Morgane Sombrelune ; sort inédit « Main du Néant ». */
const SOMB={u:-215,v:345,R:150,clair:24,t:0,sentier:0,pierre:null,built:false,k:0};
{const L={id:'terres_sombrite',n:'Académie de la Sombrité',u:SOMB.u,v:SOMB.v,r:20,flat:0.5,st:null};L.base=Math.max(3,terH0(L.u,L.v,true));TER_LIEUX.push(L);
 const x=TER.c.x+L.u,z=TER.c.z+L.v,o={id:L.id,name:L.n,x,z,r:L.r,spot:{x:x+3,z:z+5},hidden:true,region:'terres'};LOCS.push(o);LOCBY[L.id]=o;LOC_STYLE[L.id]=null;SOMB.x=x;SOMB.z=z;}
/* le manoir : pierre sombre, toits violets, fenêtres qui luisent, deux flèches, des menhirs qui veillent */
function buildSombrite(){const C=SOMB,gy=terH(C.x,C.z),pierre=mat(0x3d3846,{flatShading:true,roughness:0.95}),toit=mat(0x3a2456,{flatShading:true}),
  fen=mat(0x2a1640,{emissive:0xa060ff,emissiveIntensity:0.8}),noir=mat(0x1a1622,{flatShading:true}),M=(geo,m,x,y,z,ry)=>{const o=new THREE.Mesh(geo,m);o.position.set(C.x+x,gy+y,C.z+z);o.rotation.y=ry||0;o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
 const hz=-8;M(new THREE.BoxGeometry(12,6,8),pierre,0,3,hz);M(new THREE.ConeGeometry(8.2,4.5,4).rotateY(Math.PI/4).scale(1,1,0.68),toit,0,8.2,hz);
 for(const s of [-1,1]){M(new THREE.CylinderGeometry(1.5,1.8,11,8),pierre,s*7,5.5,hz+1);M(new THREE.ConeGeometry(2,5,8),toit,s*7,13.4,hz+1);
  const gl=glow(0xb070ff,4,0.6);gl.position.set(C.x+s*7,gy+16.2,C.z+hz+1);gl.userData.noCull=true;scene.add(gl);COLS.push({x:C.x+s*7,z:C.z+hz+1,r:1.9});}
 for(let k=0;k<4;k++){M(new THREE.BoxGeometry(1,1.6,0.12),fen,-4.5+k*3,3.4,hz+4.03);}
 M(new THREE.BoxGeometry(2,3,0.3),noir,0,1.5,hz+4.1);
 COLS.push({x:C.x,z:C.z+hz,hw:6.1,hd:4.1});
 for(let k=0;k<7;k++){const a=k/7*TAU+0.4,r=C.clair-5,x=Math.cos(a)*r,z=Math.sin(a)*r+2;if(z<-3&&Math.abs(x)<9)continue;M(new THREE.BoxGeometry(0.9,2.6,0.6),noir,x,1.3,z,a);
  const gl=glow(0x9a60ff,1.8,0.5);gl.position.set(C.x+x,gy+2.9,C.z+z);scene.add(gl);COLS.push({x:C.x+x,z:C.z+z,r:0.6});}
 /* la Pierre des Lucioles, à l'orée du bois, du côté de la Halte de l'Aube */
 let dx=TER.c.x-C.x,dz=TER.c.z-C.z;const dl=Math.hypot(dx,dz);dx/=dl;dz/=dl;let px=C.x+dx*(C.R-12),pz=C.z+dz*(C.R-12);for(let k=0;k<30&&terH(px,pz)<1;k++){px-=dx*3;pz-=dz*3;}
 C.pierre={x:px,z:pz};const st=new THREE.Mesh(new THREE.DodecahedronGeometry(1.1,0),mat(0x6a6478,{flatShading:true}));st.scale.set(0.8,1.6,0.8);st.position.set(px,terH(px,pz)+1.2,pz);st.castShadow=true;scene.add(st);
 C.pgl=glow(0xfff0a0,2.4,0.25);C.pgl.position.set(px,terH(px,pz)+2.9,pz);C.pgl.userData.noCull=true;scene.add(C.pgl);COLS.push({x:px,z:pz,r:1});TER.block.push({x:px,z:pz,r:4});
 C.built=true;}
{const _b=buildTerres;buildTerres=function(){const r=_b.apply(this,arguments);if(!SOMB.built)buildSombrite();return r;};}
/* un bois plus serré : des conifères en plus dans chaque morceau qui touche le Bois des Ombres-Longues (même hasard à chaque visite) */
{const _c=terChunk;terChunk=function(ci,cj){const C=_c.apply(this,arguments),S0=SOMB,CH=TER.CH;if(Math.hypot(C.x0+CH/2-S0.x,C.z0+CH/2-S0.z)>S0.R+CH*0.75)return C;
  const R=terRng((ci*92821)^(cj*68917)^4242),n=Math.round(CH*CH*0.012);
  for(let k=0;k<n;k++){const x=C.x0+R()*CH,z=C.z0+R()*CH,r2=R(),r3=R(),r4=R(),d=Math.hypot(x-S0.x,z-S0.z);if(d<S0.clair+6||d>S0.R)continue;const y=terH(x,z);if(y<0.6||terSlope(x,z)>1.1||terBlocked(x,z))continue;
   const vv=3+(r2<0.5?1:0);C.T.push({x,y,z,s:0.9+r4*0.7,v:vv,ry:r3*TAU,hh:TREEV[vv]&&TREEV[vv].t==='c'?0.29+r2*0.06:0.2+r2*0.09,ss:0.3+r3*0.2,ll:0.42+r4*0.08});}
  return C;};}
/* l'obscurité du bois : plus on s'enfonce, plus il fait sombre (moins dans la clairière, éclairée par le manoir) */
const SOMB_C=new THREE.Color(0x120c1c);
{const _l=lighting;lighting=function(){const r=_l.apply(this,arguments);const k=SOMB.k;if(k>0.01){scene.fog.color.lerp(SOMB_C,k*0.85);scene.fog.near*=1-k*0.6;scene.fog.far*=1-k*0.55;hemi.intensity*=1-k*0.5;sun.intensity*=1-k*0.65;
  skyMat.uniforms.top.value.lerp(SOMB_C,k*0.6);skyMat.uniforms.bot.value.lerp(SOMB_C,k*0.75);}return r;};}
/* chaque image : obscurité, sentier des lucioles, embuscades des Ombres-Longues, sanctuaire de la clairière */
function sombTick(dt){const C=SOMB;if(!C.built||!started||S.zone!=='monde'||regionOf(player.x)!=='terres'){C.k=0;return;}
 const d=Math.hypot(player.x-C.x,player.z-C.z),now=performance.now()/1000;C.k=smooth(C.R+40,C.R-30,d)*(d<C.clair?0.45:1);
 if(C.pgl)C.pgl.material.opacity=C.sentier>now?0.75:0.25+Math.sin(now*2)*0.08;
 if(d>C.R+60){return;}
 if(d<C.R&&!S.seenSomb){S.seenSomb=1;say('🌑 Le <b>Bois des Ombres-Longues</b>… Ses gardiens attaquent ceux qu’ils voient. Bois un <b>Philtre d’invisibilité</b>, éclaire le sentier d’un <b>sort de Lumière à la Pierre des Lucioles</b>, ou fraie-toi un chemin !','gm');}
 /* le sentier lumineux : des lucioles entre la pierre et le manoir */
 if(C.sentier>now&&C.pierre&&Math.random()<dt*30){const f=Math.random(),x=C.pierre.x+(C.x-C.pierre.x)*f,z=C.pierre.z+(C.z-C.pierre.z)*f;if(Math.hypot(x-player.x,z-player.z)<45)PA.emit(x+rnd(-1.5,1.5),terH(x,z)+rnd(.4,1.6),z+rnd(-1.5,1.5),0,rnd(.1,.3),0,0xfff0a0,rnd(.15,.25),0.03,rnd(.8,1.4),-0.1,1);}
 const mine=ENT.filter(e=>e.kind==='creature'&&e.data.somb);
 if(d<C.clair){for(const e of mine)if(Math.hypot(e.x-C.x,e.z-C.z)<C.clair+12){burst(e.x,1.4+gh(e.x,e.z),e.z,0x2a1a40,16,3);removeEnt(e);}
  if(!S.seenSombC){S.seenSombC=1;say('🕯 Tu as atteint l’<b>Académie de la Sombrité</b>. Ici, les ombres n’entrent pas.','gm');}return;}
 for(const e of mine)if(Math.hypot(e.x-player.x,e.z-player.z)>90)removeEnt(e);
 C.t-=dt;if(C.t>0||d>C.R||BUFF.invis||C.sentier>now)return;C.t=rnd(6,9);
 if(mine.filter(e=>Math.hypot(e.x-player.x,e.z-player.z)<40).length>=4)return;
 for(let i=0;i<2;i++){const a=player.ry+rnd(-1.2,1.2),r=rnd(13,19),x=player.x+Math.sin(a)*r,z=player.z+Math.cos(a)*r;if(terH(x,z)<0.5||!isFree({x,z},1))continue;
  const e=spawnCreatureAt(x,z,Math.random()<0.65?'Spectres des Ombres-Longues':'Loups spectraux','lumiere','ombre',4);e.data.somb=1;burst(x,1.2+terH(x,z),z,0x2a1a40,20,3);}
 if(!S.seenSombA){S.seenSombA=1;say('👁 Des <b>Ombres-Longues</b> surgissent des troncs !','sys');}}
{const _w=world4Tick;world4Tick=function(dt){sombTick(dt);return _w.apply(this,arguments);};}
/* un sort de Lumière près de la Pierre des Lucioles : le sentier s'allume pour 4 minutes */
{const _c=castSpell;castSpell=function(sp){const r=_c.apply(this,arguments);const C=SOMB;if(sp&&sp.el==='lumiere'&&C.pierre&&Math.hypot(player.x-C.pierre.x,player.z-C.pierre.z)<9){const was=C.sentier>performance.now()/1000;C.sentier=performance.now()/1000+240;
  if(!was){burst(C.pierre.x,terH(C.pierre.x,C.pierre.z)+2,C.pierre.z,0xfff0a0,40,5);say('✨ La Pierre des Lucioles s’allume : un <b>sentier de lumière</b> mène au manoir. Les Ombres-Longues ne s’en approchent pas… pour quelques minutes.','gm');}}return r;};}
/* ---------- l'académie ---------- */
ACADS.push({id:'sombrite',n:'Académie de la Sombrité',dir:'morgane',ou:'au cœur du Bois des Ombres-Longues (Grandes Terres)',profs:{ombre:'noctis',arcane:'aurele'},
 inedit:{name:'Main du Néant',inc:'Manus Nihili',el:'ombre',form:'zone',special:'neant',legend:true,cost:50,cd:15,id:'acad-neant',
  desc:'Une main invisible soulève tout ce qui t’entoure… puis l’écrase dans l’ombre. Seule Dame Morgane l’enseigne.'},
 quete:{title:'Les Trois Ombres',desc:'Dame Morgane veut savoir si l’ombre t’obéit, de la vallée jusqu’aux marais des Grandes Terres.',steps:[
  {kind:'cast',loc:'ruines',el:'ombre',text:'Éteindre la lumière des Ruines d’Ysmer avec un sort d’Ombre'},{kind:'cast',loc:'cercle',el:'arcane',text:'Faire léviter le Cercle de pierres avec un sort d’Arcane'},
  {kind:'collect',loc:'terres_marais',item:'un éclat de lune noire',text:'Trouver un éclat de lune noire au Marais des Brumes-Vertes (Grandes Terres)'},
  {kind:'talk',npc:'morgane',text:'Rapporter l’éclat à Dame Morgane Sombrelune'}]}});
[{id:'noctis',name:'Pr. Noctis Valombre',role:'professeur de magie de l’Ombre, chuchote toujours, adore les énigmes, dit « Chut… l’ombre écoute. »',home:'terres_sombrite',els:['ombre'],mdl:['voleur',0x9a80c8,'sansArme'],
  look:{skin:0xd8c8c0,hair:0x1a1424,style:'long',hat:0x1a1028,robe:0x2a1a3a,trim:0x8a60c8,h:1.04},
  lines:['Chut… l’ombre écoute.','Qu’est-ce qui grandit quand le soleil se couche ? …Ton ombre, apprenti. Toujours ton ombre.','La nuit n’est pas l’ennemie. C’est une cachette.']},
 {id:'aurele',name:'Pr. Aurèle Flottebois',role:'professeur d’Arcane et de télékinésie, distrait, les objets lévitent autour de lui',home:'terres_sombrite',els:['arcane'],mdl:['moine',0xc8b8ff],
  look:{skin:0xf0d0b8,hair:0xb8a8d8,style:'bald',beard:0xb8a8d8,hat:0x3a2a6a,robe:0x5a4a9a,trim:0xd8c8ff,h:1.0,w:1.1},
  lines:['Lève-toi… et flotte ! Non, pas toi. Le livre. Enfin, toi aussi si tu veux.','Tout ce qui est lourd peut devenir léger. Il suffit de lui demander poliment.','Ah, ma tasse a encore filé au plafond…']},
 {id:'morgane',name:'Dame Morgane Sombrelune',role:'directrice de l’Académie de la Sombrité, inquiétante au premier abord mais bienveillante',home:'terres_sombrite',els:['ombre','arcane'],mdl:['sorcier',0x8a6ad0],
  look:{skin:0xe8d0c8,hair:0x2a1a3a,style:'long',hat:0x140a24,robe:0x3a1a5a,trim:0xc8a0ff,h:1.06},
  lines:['Tu as traversé le bois. Ce n’était pas un hasard.','L’ombre n’est pas le mal. C’est ce qu’on en fait qui compte.','Ici, on apprend ce que les autres écoles préfèrent taire.']}
].forEach(p=>{if(NPCS.some(n=>n.id===p.id))return;NPCS.push({id:p.id,name:p.name,role:p.role,home:p.home,els:p.els,cl:[],look:p.look});NPCBY[p.id]=NPCS[NPCS.length-1];MDL_PERSO[p.id]=p.mdl;LINES[p.id]=p.lines.slice();});
Object.assign(ACAD_DIT,{noctis:{cours:'Chut… Ferme les yeux. Sens où la lumière ne va pas… c’est là que tu puises.',bravo:'Parfait. L’ombre t’a répondu. Elle ne le fait pas pour tout le monde.',fini:'Tu connais déjà toute l’ombre que j’enseigne. Chut… n’en parle à personne.'},
 aurele:{cours:'Regarde ce caillou. Ne le touche pas. Demande-lui de se lever… voilà, doucement… lève-toi… et flotte !',bravo:'Il flotte ! Enfin, il flottait. Bravo !',fini:'Tu sais déjà tout ce que j’enseigne en Arcane. Je… où ai-je mis ma tasse ?'}});
{const A=ACADS[ACADS.length-1];for(const el in A.profs)ACAD_PROF[A.profs[el]]={A,el};}
/* le sort inédit : une zone d'Arcane qui soulève, puis l'ombre qui écrase */
function castNeant(sp){doZone({name:sp.name,el:'arcane',form:'zone',rank:spRank(sp)});SHAKE=Math.max(SHAKE,0.2);say('🖐 La Main du Néant se referme…','sys');
 setTimeout(()=>{if(!started)return;doZone({name:sp.name,el:'ombre',form:'zone',rank:spRank(sp)});SHAKE=Math.max(SHAKE,0.5);},1100);}
{const _z=doZone;doZone=function(sp){if(sp&&sp.special==='neant')return castNeant(sp);return _z.apply(this,arguments);};}
SP_IC.neant='🖐';
/* des rumeurs pour qu'on la trouve */
['brindille','ysolde','cassius'].forEach(id=>{if(LINES[id])LINES[id].push('On murmure qu’une académie se cache au cœur du Bois des Ombres-Longues, dans les Grandes Terres… Il faut être invisible, malin ou très courageux pour y arriver.');});
