/* ================= ÉTAPE 2 : MONDE INTERACTIF ================= */
const INGR={
 soleil:{n:'Herbe-soleil',c:0xffe066,where:['cour','arene','village','serre','observatoire','moulin'],look:'herb'},
 lune:{n:'Champignon lunaire',c:0x8fd0ff,where:['foret','biblio','lac','marais','marais'],look:'mush'},
 givre:{n:'Fleur de givre',c:0xcff4ff,where:['lac','cercle','observatoire','hauteurs'],look:'flower'},
 braise:{n:'Racine de braise',c:0xff7a2e,where:['arene','serre','village','chateau'],look:'root'},
 plume:{n:'Plume de vent',c:0xe8fff0,where:['cercle','observatoire','chateau','cour','hauteurs','hauteurs','ruines','moulin'],look:'feather'},
 ombre:{n:'Mousse d’ombre',c:0x8a5ad0,where:['foret','biblio','chateau','marais','ruines'],look:'moss'},
 petale:{n:'Pétale enchanté',c:0xff9ad0,where:[],look:'flower'},
 essence:{n:'Essence élémentaire',c:0xff7ae0,where:[],look:'orb'},
 cristal:{n:'Éclat de cristal',c:0x9ad8ff,where:[],look:'crystal'}
};
const POTIONS={
 mana:{n:'Potion de mana',c:0x4a7dff,need:{soleil:2,petale:1},d:'Recharge entièrement ta magie.'},
 celerite:{n:'Potion de célérité',c:0x9affd0,need:{plume:1,soleil:1},d:'+50 % de vitesse pendant 60 s.',dur:60},
 bond:{n:'Élixir de bond',c:0xc9ffe0,need:{plume:2},d:'Sauts bien plus hauts pendant 60 s.',dur:60},
 phoque:{n:'Potion de peau de phoque',c:0x3d8bff,need:{givre:1,lune:1},d:'Nage dans l’eau glacée sans avoir froid pendant 120 s.',dur:120},
 voyance:{n:'Philtre de voyance',c:0xfff1a0,need:{lune:1,ombre:1},d:'Révèle les parchemins cachés à 40 m et éclaircit la nuit pendant 90 s.',dur:90},
 puissance:{n:'Élixir de puissance',c:0xff7a2e,need:{braise:1,essence:1},d:'+30 % de puissance à tous tes sorts pendant 60 s.',dur:60},
 invis:{n:'Philtre d’invisibilité',c:0x8a5ad0,need:{ombre:2},d:'Les créatures ne te voient plus pendant 45 s.',dur:45},
 maitrise:{n:'Élixir de maîtrise',c:0x9ad8ff,need:{cristal:2,essence:1},d:'+40 points de maîtrise dans chaque élément que tu connais.'}
};
const LOCKS={gel:{n:'pris dans un bloc de glace',el:'feu'},scelle:{n:'scellé par des runes',el:'arcane'},ombre:{n:'enveloppé d’ombres vivantes',el:'lumiere'},flamme:{n:'entouré de flammes éternelles',el:'eau'},racines:{n:'enserré de racines',el:'nature'},enfoui:{n:'enfoui sous un tas de feuilles',el:'vent'}};
const WEATHERS={clair:{n:'Ciel clair',ic:'☀',fogN:50,fogF:170,dark:0},nuages:{n:'Nuageux',ic:'⛅',fogN:45,fogF:150,dark:0.22},pluie:{n:'Pluie',ic:'🌧',fogN:28,fogF:110,dark:0.4},orage:{n:'Orage',ic:'⛈',fogN:24,fogF:95,dark:0.6},brume:{n:'Brouillard',ic:'🌫',fogN:4,fogF:38,dark:0.25},neige:{n:'Neige',ic:'❄',fogN:30,fogF:120,dark:0.18}};
const WMUL={clair:{lumiere:1.1,feu:1.1},pluie:{feu:0.7,eau:1.3,nature:1.15},orage:{feu:0.7,eau:1.2,lumiere:1.4,vent:1.2},brume:{ombre:1.3,lumiere:0.85},neige:{glace:1.4,feu:0.8}};
const REACT={fire:{bram:['Ma forêt ! Arrête ça !','Tu veux tout brûler ?!'],mirelle:['Mes pauvres plantes !','Ça ne va pas, non ?!'],tobias:['Hé ! Mes tonneaux !','Qui va payer ça ?'],gaspard:['Pas près de mon moulin !'],brindille:['Mes herbes sèchent, pas besoin de les griller !'],orvane:['Cessez ces enfantillages !'],cassius:['Le feu… dangereux.'],ysolde:['Loin de mes livres !'],lila:['Ha ! On va se faire gronder.'],_:['Au feu !']},
 pump:{tobias:['MES CITROUILLES !'],mirelle:['Ma citrouille primée !'],_:['Pauvre citrouille…']},
 help:{bram:['Merci, petit.'],mirelle:['Oh, merci !'],tobias:['Bien joué, gamin !'],orvane:['Hm. Responsable.'],cassius:['Joli travail.'],ysolde:['Bien.'],lila:['Pas mal, je l’admets.'],_:['Merci !']}};
let BUFF={},STATIONS=[],BRAZ=[],PILLARS=[],GLYPH=null,GRATE=null,DUN=null,flashK=0,lightningT=6,snowT=0,fogClear=0,snowCover=0,snowMesh=null,herbT=0,wtick=0;
const wMul=el=>{const w=S.weather&&S.weather.w;return ((WMUL[w]||{})[el])||1;};
function addItem(id,n){S.inv[id]=(S.inv[id]||0)+(n||1);}
const hasItems=need=>Object.entries(need).every(([k,v])=>(S.inv[k]||0)>=v);
const moodOf=id=>{const r=S.rep[id]||0;return r>=4?'amical':r<=-4?'fâché':r<=-1?'méfiant':'neutre';};
const fadeEl=(()=>{const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .35s;z-index:25';document.body.appendChild(d);return d;})();
function fade(fn){fadeEl.style.opacity=1;setTimeout(()=>{fn();setTimeout(()=>{fadeEl.style.opacity=0;},150);},380);}

/* ---------- ingrédients ---------- */
function makeHerbObj(id){const I=INGR[id],g=new THREE.Group();const c=I.c;
 if(I.look==='herb'){for(let i=0;i<4;i++){const b=mesh(new THREE.ConeGeometry(0.06,0.5,4),0x7ab04a,rnd(-.15,.15),0.25,rnd(-.15,.15),g);b.rotation.set(rnd(-.3,.3),0,rnd(-.3,.3));}mesh(new THREE.SphereGeometry(0.1,8,6),mat(c,{emissive:c,emissiveIntensity:0.5}),0,0.52,0,g);}
 else if(I.look==='mush'){mesh(new THREE.CylinderGeometry(0.04,0.05,0.22,6),0xe8e8f0,0,0.11,0,g);mesh(new THREE.SphereGeometry(0.16,10,6,0,TAU,0,Math.PI/2),mat(c,{emissive:c,emissiveIntensity:0.9,flatShading:false}),0,0.2,0,g);}
 else if(I.look==='flower'){mesh(new THREE.CylinderGeometry(0.02,0.03,0.4,5),0x5a9a5a,0,0.2,0,g);for(let i=0;i<5;i++){const a=i/5*TAU;const p=mesh(new THREE.SphereGeometry(0.08,6,4),mat(c,{emissive:c,emissiveIntensity:0.5}),Math.cos(a)*0.09,0.42,Math.sin(a)*0.09,g);p.scale.set(1,0.4,1);}}
 else if(I.look==='root'){for(let i=0;i<3;i++){const r=mesh(new THREE.CylinderGeometry(0.03,0.06,0.45,5),mat(c,{emissive:0x802000,emissiveIntensity:0.7}),rnd(-.1,.1),0.15,rnd(-.1,.1),g);r.rotation.set(rnd(-.6,.6),0,rnd(-.6,.6));}}
 else if(I.look==='feather'){const f=new THREE.Mesh(new THREE.PlaneGeometry(0.16,0.55),new THREE.MeshStandardMaterial({color:c,side:THREE.DoubleSide,emissive:0x406050,emissiveIntensity:0.6}));f.position.y=0.8;g.add(f);g.userData.spin=f;}
 else if(I.look==='moss'){const m=mesh(new THREE.SphereGeometry(0.3,8,6),mat(c,{emissive:0x301050,emissiveIntensity:0.7}),0,0.05,0,g);m.scale.y=0.35;}
 else if(I.look==='crystal'){for(let i=0;i<3;i++){const m=mesh(G.cry,mat(c,{emissive:c,emissiveIntensity:0.9}),rnd(-.15,.15),0.35,rnd(-.15,.15),g);m.scale.set(0.35,0.9,0.35);m.rotation.set(rnd(-.4,.4),rnd(0,3),rnd(-.4,.4));}}
 else mesh(new THREE.SphereGeometry(0.15,10,8),basic(c),0,0.6,0,g);
 return g;}
function spawnHerb(id){const I=INGR[id];const L=LOCBY[pick(I.where)];if(!L)return;const p=freePoint(L,10);if(inLake(p))return;addEnt('herb',p.x,p.z,makeHerbObj(id),{ing:id},900);}
function herbTick(){const n=ENT.filter(e=>e.kind==='herb').length;const ids=Object.keys(INGR).filter(k=>INGR[k].where.length);for(let i=n;i<18;i++)spawnHerb(pick(ids));}

/* ---------- coffres ---------- */
function lockOverlay(lock){if(!lock)return null;const g=new THREE.Group();
 if(lock==='gel'){const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,1.1,1.1),new THREE.MeshStandardMaterial({color:0xcff4ff,transparent:true,opacity:0.55,roughness:0.05,metalness:0.2}));b.position.y=0.5;g.add(b);}
 else if(lock==='scelle'){const r=new THREE.Mesh(new THREE.RingGeometry(0.75,0.86,32).rotateX(-Math.PI/2),basic(0xff7ae0,{transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));r.position.y=0.7;g.add(r);g.userData.spin=r;}
 else if(lock==='racines'){for(let i=0;i<5;i++){const a=i/5*Math.PI;const r=mesh(new THREE.TorusGeometry(0.6,0.05,5,12,Math.PI),0x5a3a1a,0,0,0,g);r.rotation.y=a;}}
 else if(lock==='enfoui'){const m=mesh(new THREE.SphereGeometry(0.95,10,6),0x7a6a2a,0,0.15,0,g);m.scale.set(1,0.6,0.85);}
 return g;}
function spawnChest(locId,lock,relic,pos){const L=LOCBY[locId]||pick(LOCS);const p=pos||freePoint(L,8);if(lock===undefined)lock=pick(Object.keys(LOCKS).concat(['gel','scelle',null]));if(lock&&!LOCKS[lock])lock=pick(Object.keys(LOCKS));
 const g=new THREE.Group();objMats();mesh(new THREE.BoxGeometry(1,0.55,0.7),CHESTM,0,0.28,0,g);const lid=new THREE.Group();lid.position.set(0,0.55,-0.35);g.add(lid);const lm=mesh(new THREE.CylinderGeometry(0.35,0.35,1,14,1,false,0,Math.PI),CHESTM,0,0,0.35,lid);lm.rotation.z=Math.PI/2;[-0.35,0.35].forEach(x=>{const b=mesh(new THREE.TorusGeometry(0.355,0.03,6,14,Math.PI),mat(0xd4af37,{metalness:0.6,roughness:0.35}),x,0,0.35,lid);b.rotation.y=Math.PI/2;});
 const gold=mat(0xd4af37,{metalness:0.6,roughness:0.35});[-0.35,0.35].forEach(x=>mesh(new THREE.BoxGeometry(0.08,0.58,0.72),gold,x,0.29,0,g));mesh(new THREE.BoxGeometry(0.14,0.16,0.05),gold,0,0.5,0.37,g);
 if(relic){const gl=glow(0xf3cf7a,2.6,0.8);gl.position.y=0.9;g.add(gl);}
 const ov=lockOverlay(lock);if(ov)g.add(ov);
 const e=addEnt('chest',p.x,p.z,g,{lock,lid,ov,open:false,relic:!!relic,loc:pos?zoneAt(p.x,p.z):L.id},relic?Infinity:2400);g.rotation.y=Math.random()*TAU;return e;}
function unlockChest(e){const D=e.data;if(D.ov)e.obj.remove(D.ov);D.ov=null;D.lock=null;burst(e.x,0.8,e.z,0xf3cf7a,26,4);say('🔓 Le coffre est libéré ! (Agir pour l’ouvrir)','sys');}
function openChest(e){const D=e.data;if(D.lock){const L=LOCKS[D.lock];say('Ce coffre est '+L.n+'. Il faudrait un sort de type <b>'+ELEM[L.el].n+'</b>.','sys');return;}if(D.open)return;D.open=true;D.lid.rotation.x=-1.9;e.ttl=25;
 const got=[];const ids=Object.keys(INGR);const n=2+Math.floor(Math.random()*2)+(D.relic?3:0);for(let i=0;i<n;i++){const id=pick(ids);addItem(id,1);got.push(INGR[id].n);}
 if(D.relic||Math.random()<0.35){const pid=pick(Object.keys(POTIONS));addItem('p_'+pid,1);got.push(POTIONS[pid].n);}
 gainXP(D.relic?150:15);burst(e.x,1,e.z,0xf3cf7a,40,5);flash(e.x,1.5,e.z,0xf3cf7a,3,0.8);
 say('🎁 Coffre : '+got.join(', '),'gm');
 if(D.relic||Math.random()<0.3)learnSpell(genSpell(null,pick(['zone','util'])));
 if(D.relic){if(!S.relicDone){S.relicDone=true;S.relics=(S.relics||0)+1;say('🏆 Tu obtiens la <b>Relique des Souterrains</b> ! +1 point de talent permanent.','gm');chron('Relique des Souterrains obtenue.');}learnSpell(genSpell(null,pick(['zone','util'])));}
 chron('Coffre ouvert ('+(LOCBY[D.loc]?LOCBY[D.loc].name:(ZONES[D.loc]&&ZONES[D.loc].n)||'Aldermoor')+').');save();}

/* ---------- alchimie & potions ---------- */
function makeCauldron(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 const iron=mat(0x2a2a30,{metalness:0.6,roughness:0.4,flatShading:false});mesh(new THREE.CylinderGeometry(0.75,0.55,0.8,18,1,true),mat(0x2a2a30,{metalness:0.6,roughness:0.4,flatShading:false,side:THREE.DoubleSide}),0,0.75,0,g);mesh(new THREE.SphereGeometry(0.56,16,8,0,TAU,Math.PI/2,Math.PI/2),iron,0,0.36,0,g);
 const liq=mesh(new THREE.CircleGeometry(0.7,20).rotateX(-Math.PI/2),mat(0x5aff9a,{emissive:0x20c060,emissiveIntensity:0.9,flatShading:false}),0,1.05,0,g,false);
 for(let i=0;i<3;i++){const a=i/3*TAU;mesh(new THREE.CylinderGeometry(0.05,0.05,0.4,5),iron,Math.cos(a)*0.5,0.2,Math.sin(a)*0.5,g);}
 for(let i=0;i<4;i++){const a=i/4*TAU;mesh(new THREE.CylinderGeometry(0.06,0.06,0.5,5),0x4a3018,Math.cos(a)*0.25,0.08,Math.sin(a)*0.25,g).rotation.z=Math.PI/2.3;}
 addCol({x,z,r:0.85,h:1.05});
 return station({x,z,reach:2.8,cauldron:true,liq,hint:()=>'Préparer une potion',act:()=>openBook('alchimie')});}
function station(o){STATIONS.push(o);return o;}
const nearCauldron=()=>STATIONS.find(s=>s.cauldron&&Math.hypot(s.x-player.x,s.z-player.z)<4);
function brew(pid){const P=POTIONS[pid];const c=nearCauldron();if(!c||!hasItems(P.need))return;Object.entries(P.need).forEach(([k,v])=>S.inv[k]-=v);addItem('p_'+pid,1);S.brewed=S.brewed||{};const first=!S.brewed[pid];S.brewed[pid]=1;gainXP(first?20:6);
 for(let i=0;i<40;i++)PA.emit(c.x+rnd(-.4,.4),1.1,c.z+rnd(-.4,.4),rnd(-1,1),rnd(2,4),rnd(-1,1),P.c,0.4,0.05,rnd(.6,1.2),3,1);flash(c.x,1.5,c.z,P.c,2.5,0.8);
 say('⚗ Tu prépares : <b>'+P.n+'</b>'+(first?' (première fois : +20 XP)':''),'gm');if(first)chron('Première potion : '+P.n);save();}
function drink(pid){const P=POTIONS[pid];if(!((S.inv['p_'+pid]||0)>0))return;S.inv['p_'+pid]--;if(pid==='mana')mana=manaMax();else if(pid==='maitrise'){[...new Set(S.spells.map(x=>x.el))].forEach(el=>{S.mastery[el]=(S.mastery[el]||0)+40;});updateHUD();}else BUFF[pid]=P.dur;if(pid==='invis')stealth=Math.max(stealth,P.dur);
 burst(player.x,player.y+1.2,player.z,P.c,30,3);flash(player.x,player.y+1.5,player.z,P.c,2,0.6);say('🧪 '+P.n+' : '+P.d,'sys');save();}

/* ---------- météo ---------- */
function pickWeather(){const t=[['clair',3],['nuages',3],['pluie',2],['orage',1],['brume',1.2],['neige',0.8]];let r=Math.random()*t.reduce((a,b)=>a+b[1],0);for(const [w,p] of t){r-=p;if(r<=0)return w;}return 'clair';}
function setWeather(w,silent){if(!WEATHERS[w])return;const prev=S.weather&&S.weather.w;S.weather={w,until:S.time+rnd(180,420)};
 if(!silent&&prev!==w){const W=WEATHERS[w],m=WMUL[w]||{};const eff=Object.entries(m).map(([e,v])=>ELEM[e].n+(v>1?' ↑':' ↓')).join(' · ');say(W.ic+' Météo : <b>'+W.n+'</b>'+(eff?' — '+eff:''),'gm');chron('Météo : '+W.n);}
 if(w!=='neige')ICE.forEach(i=>{if(i.snow){i.snow=false;i.life=Math.min(i.life,60);}});}
function strike(){const a=Math.random()*TAU,r=rnd(8,45);let x=player.x+Math.cos(a)*r,z=player.z+Math.sin(a)*r;let tree=null,bd=7;TREES.forEach(t=>{const d=Math.hypot(t.x-x,t.z-z);if(d<bd){bd=d;tree=t;}});if(tree){x=tree.x;z=tree.z;}
 const pts=[];let cx=x,cz=z;for(let i=0;i<=10;i++){pts.push(new THREE.Vector3(cx,45-i*4.5,cz));cx=x+rnd(-1.5,1.5);cz=z+rnd(-1.5,1.5);}pts[10].set(x,tree?(tree.y||0)+6*tree.s:gh(x,z),z);
 const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffffff,fog:false}));scene.add(line);setTimeout(()=>{scene.remove(line);line.geometry.dispose();line.material.dispose();},180);
 flashK=1;flash(x,8,z,0xdde6ff,6,0.35,false,50);burst(x,tree?5:0.3,z,0xffffff,30,6);
 if(tree&&Math.random()<0.6){igniteTree(tree);hint('bolt','⚡ La foudre frappe un arbre et l’enflamme !');}
 const dp=Math.hypot(player.x-x,player.z-z);if(dp<4){player.vx+=(player.x-x)/(dp||1)*10;player.vz+=(player.z-z)/(dp||1)*10;player.vy=6;player.grounded=false;say('⚡ La foudre tombe juste à côté de toi !','sys');}}
function updWeather(dt){if(!S.weather)setWeather('clair',true);if(S.time>=S.weather.until)setWeather(pickWeather());
 const W=WEATHERS[S.weather.w];const k=Math.min(1,dt*0.4);if(fogClear>0)fogClear-=dt;const clr=fogClear>0;
 wx.fogN=lerp(wx.fogN,clr?50:W.fogN,k);wx.fogF=lerp(wx.fogF,clr?170:W.fogF,k);wx.dark=lerp(wx.dark,W.dark,k);flashK=Math.max(0,flashK-dt*4);
 const w=S.weather.w,snowing=w==='neige'&&S.zone==='monde';snowCover=clamp(snowCover+(snowing?dt/80:-dt/40),0,1);if(snowMesh){snowMesh.material.opacity=snowCover*0.42;snowMesh.visible=snowCover>0.01&&S.zone==='monde';}
 if(S.zone!=='monde')return;const px=player.x,pz=player.z;
 if(w==='pluie'||w==='orage'){const n=Math.round((w==='orage'?1100:800)*dt);for(let i=0;i<n;i++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*26;PW.emit(px+Math.cos(a)*r,13+Math.random()*4,pz+Math.sin(a)*r,-1.5,-20,-0.5,0xb0c4dc,0.07,0.07,0.85,0,0,0.6);}
  TREES.forEach(t=>{if(t.st==='burning'&&Math.random()<dt*0.15){t.st='charred';t.burn=0;treeLook(t);treesDirty();}});PROPS.forEach(p=>{if(p.burn>0)p.burn-=dt*1.5;});
  if(Math.random()<dt*6&&Math.hypot(px-LAKE.x,pz-LAKE.z)<40){const a=Math.random()*TAU,r=Math.random()*12;ring(LAKE.x+Math.cos(a)*r,LAKE.z+Math.sin(a)*r,0xbfe6ff,0.5,0.5);}
  if(w==='orage'){lightningT-=dt;if(lightningT<=0){lightningT=rnd(5,13);strike();hint('storm','⛈ L’orage gronde : la Lumière est renforcée… et la foudre peut enflammer les arbres.');}}}
 else if(w==='neige'){const n=Math.round(320*dt);for(let i=0;i<n;i++){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*26;PW.emit(px+Math.cos(a)*r,10+Math.random()*4,pz+Math.sin(a)*r,rnd(-.6,.6),-2.2,rnd(-.6,.6),0xffffff,0.13,0.13,5,0,0,0.9);}
  snowT-=dt;if(snowT<=0){snowT=7;if(ICE.filter(i=>i.snow).length<9){const a=Math.random()*TAU,r=Math.random()*9;const ice=freeze(LAKE.x+Math.cos(a)*r,LAKE.z+Math.sin(a)*r,3.2);if(ice){ice.snow=true;ice.life=9999;}hint('snowlake','❄ Avec la neige, le lac gèle peu à peu tout seul.');}}}
 else if(w==='brume'&&Math.random()<dt*6){const a=Math.random()*TAU,r=rnd(4,18);PN.emit(px+Math.cos(a)*r,rnd(0.3,1.8),pz+Math.sin(a)*r,rnd(-.3,.3),0,rnd(-.3,.3),0xd8dde8,2,3.5,rnd(3,5),0,0.1,0.25);}
}
const wx={fogN:50,fogF:170,dark:0};

/* ---------- habitants : routines & réactions ---------- */
function npcSched(n){const h=S.time/60,id=n.d.id;if(h<6.5||h>=22)return 'sleep';if(S.npcLoc[id])return null;
 if(h>=12&&h<13.5&&!['bram','tobias','gaspard','brindille'].includes(id))return 'salle';
 if(h>=19&&h<20.5&&['lila','cassius','bram','tobias','gaspard'].includes(id))return 'auberge';
 if(id==='tobias'&&h>=16)return 'auberge';
 if(id==='ysolde'&&((h>=9&&h<12)||(h>=14&&h<17.5)))return 'biblio_int';
 return null;}
function bubble(n,t){if(n.bub){n.obj.remove(n.bub);n.bub.material.map.dispose();n.bub.material.dispose();}const l=label(t,'#ffffff',3.4);l.position.y=2.75*n.d.look.h;n.obj.add(l);n.bub=l;n.bubT=4;}
function npcReact(x,z,kind){const now=performance.now()/1000;npcs.forEach(n=>{if(n.sleep)return;if(Math.hypot(n.x-x,n.z-z)>18)return;if((n.rt||0)>now)return;n.rt=now+12;
 const lines=REACT[kind][n.d.id]||REACT[kind]._;const t=pick(lines);bubble(n,t);n.obj.rotation.y=Math.atan2(player.x-n.x,player.z-n.z);
 S.rep[n.d.id]=clamp((S.rep[n.d.id]||0)+(kind==='help'?1:-1),-10,10);say('<b>'+esc(n.d.name)+'</b> : « '+esc(t)+' »',kind==='help'?'sys':'gm');});}

/* ---------- énigmes ---------- */
const ROMAN=['I','II','III','IV'];
function runeSprite(t,color){return label(t,color||'#ffd27a',1.6);}
function buildPuzzles(){
 // braseros du Cercle de pierres
 for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,x=58+Math.cos(a)*9,z=-6+Math.sin(a)*9;const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  mesh(new THREE.CylinderGeometry(0.35,0.5,1.1,8),0x6a6a74,0,0.55,0,g);mesh(new THREE.CylinderGeometry(0.6,0.3,0.35,10),mat(0x3a3a40,{metalness:0.5,roughness:0.5}),0,1.25,0,g);
  const gl=glow(0xff9a40,2.6,0);gl.position.y=1.6;g.add(gl);addCol({x,z,r:0.6,h:1.42});
  const b={x,z,i,g,gl,lit:false,runeT:0,rune:null};BRAZ.push(b);
  station({x,z,reach:2.4,hint:()=>'Examiner le brasero',act:()=>{const rv=b.runeT>0;say(rv?'Une rune lumineuse brille sur la vasque : <b>'+ROMAN[S.puz.braz.order.indexOf(i)]+'</b>.':'Une vasque de pierre, froide'+(b.lit?' — non, elle brûle !':'.')+' Des traces de rune y sont presque effacées…','sys');}});}
 station({x:58,z:-6,reach:2.6,hint:()=>'Examiner l’autel',act:()=>{say(S.puz.braz.solved?'L’autel est tiède. Les quatre flammes ont parlé.':'Gravé sur l’autel : « <i>Que la lumière révèle l’ordre, que la flamme le suive.</i> »','gm');}});
 // sceaux du château
 [[-6,-27],[6,-27],[-10,-33]].forEach(([x,z],i)=>{const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);mesh(new THREE.CylinderGeometry(0.45,0.6,2.4,8),0x8a857a,0,1.2,0,g);mesh(new THREE.BoxGeometry(1.2,0.3,1.2),0x7a756a,0,2.45,0,g);
  const cm=new THREE.MeshStandardMaterial({color:0x888888,emissive:0x000000,roughness:0.2,metalness:0.3,flatShading:true});const cr=new THREE.Mesh(G.cry,cm);cr.position.y=3.1;cr.castShadow=true;g.add(cr);const gl=glow(0xffffff,2.2,0);gl.position.y=3.1;g.add(gl);
  addCol({x,z,r:0.65});const P={x,z,i,cr,cm,gl,warn:0};PILLARS.push(P);
  station({x,z,reach:2.6,hint:()=>'Examiner le sceau',act:()=>{const el=S.puz.seals.els[i];if(S.puz.seals.on[i]){say('Le sceau '+deEl(el)+' rayonne.','sys');return;}const k=S.spells.some(s=>s.el===el);say('Un sceau <b>'+deEl(el)+'</b>. Il attend qu’on lui offre cette magie.'+(k?'':' Tu ne connais pas encore cet élément…'),'sys');if(!k&&!ENT.some(e=>e.kind==='scroll'&&e.data.spell.el===el)){const l=pick(LOCS.filter(l=>l.id!=='chateau'));spawnScroll(l.id,genSpell(el),600);say('On murmure qu’un parchemin '+deEl(el)+' traîne vers '+esc(l.name)+'.','sys');}}});});
 // grille des Souterrains
 {const x=7.5,z=-34.5;const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);mesh(new THREE.BoxGeometry(3,0.2,3),0x5a5650,0,0.1,0,g);const hole=mesh(new THREE.PlaneGeometry(2.4,2.4).rotateX(-Math.PI/2),basic(0x000000),0,0.22,0,g,false);
  const bars=new THREE.Group();g.add(bars);const iron=mat(0x2a2a30,{metalness:0.7,roughness:0.4});for(let i=-1;i<=1;i+=0.4){mesh(new THREE.BoxGeometry(0.1,0.1,2.5),iron,i,0.27,0,bars);mesh(new THREE.BoxGeometry(2.5,0.1,0.1),iron,0,0.29,i,bars);}
  GRATE={x,z,bars,hole};station({x,z,reach:2.4,hint:()=>S.puz.seals.open?'Descendre dans les Souterrains':'Examiner la grille',act:()=>{if(S.puz.seals.open)enterDungeon();else say('Une lourde grille scellée. Trois sceaux élémentaires gardent l’entrée des Souterrains, devant le château.','gm');}});}
 // glyphe secret de la bibliothèque
 {const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d');q.strokeStyle='#ff7ae0';q.lineWidth=5;q.beginPath();q.arc(64,64,48,0,TAU);q.stroke();q.beginPath();for(let i=0;i<5;i++){const a=i/5*TAU*2-Math.PI/2;q.lineTo(64+Math.cos(a)*40,64+Math.sin(a)*40);}q.closePath();q.stroke();
  const m=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));m.position.set(-36.7,1.7,-32);m.rotation.y=-Math.PI/2;scene.add(m);
  GLYPH={x:-36.7,z:-32,m,rev:0};station({x:-37.6,z:-32,reach:2.6,hint:()=>GLYPH.rev>0&&!S.puz.glyph.open?'Examiner le glyphe':null,act:()=>say('Un glyphe arcanique luit sur la pierre. Il réagirait sûrement à la magie <b>Arcane</b>…','gm')});}
}
function newPuzzles(){const order=[0,1,2,3].sort(()=>Math.random()-0.5);const els=ELS.slice().sort(()=>Math.random()-0.5).slice(0,3);
 S.puz={day:S.day,braz:{order,step:0,solved:false},seals:{els,on:[false,false,false],open:false},glyph:{open:false},grotte:{els:ELS.slice().sort(()=>Math.random()-0.5).slice(0,4),open:false,spawned:false},flags:{},dun:{ice:false,herse:false,rune:false,boss:false,spawned:false}};}
function syncPuzzles(){const P=S.puz;
 BRAZ.forEach(b=>{b.lit=P.braz.solved;b.gl.material.opacity=b.lit?0.9:0;if(b.rune){b.g.remove(b.rune);b.rune.material.map.dispose();}b.rune=runeSprite(ROMAN[P.braz.order.indexOf(b.i)]);b.rune.position.y=2.4;b.rune.material.opacity=0;b.g.add(b.rune);});
 PILLARS.forEach(p=>{const el=P.seals.els[p.i],c=ELEM[el].c;p.cm.color.setHex(c);p.cm.emissive.setHex(c);p.cm.emissiveIntensity=P.seals.on[p.i]?1.2:0.12;p.gl.material.color.setHex(c);p.gl.material.opacity=P.seals.on[p.i]?0.9:0;p.warn=0;});
 GRATE.bars.visible=!P.seals.open;
 GLYPH.rev=0;GLYPH.m.material.opacity=0;
 if(DUN)syncDungeon();syncWorld3();}
function lightBrazier(i){const P=S.puz.braz,b=BRAZ[i];b.lit=true;b.gl.material.opacity=0.9;burst(b.x,1.5,b.z,0xff7a2e,20,3);
 if(P.order[P.step]===i){P.step++;if(P.step>=4){P.solved=true;flash(58,2,-6,0xffd27a,5,1.2,false,30);for(let k=0;k<60;k++)PA.emit(58+rnd(-1,1),0.6,-6+rnd(-1,1),0,rnd(2,6),0,0xffd27a,0.4,0.05,rnd(1,2),0,0.5);
  spawnChest('cercle','scelle',false,{x:58,z:-3.6});gainXP(60);say('✦ Les quatre braseros flamboient ! Un coffre se matérialise près de l’autel.','gm');chron('Énigme des braseros résolue.');save();}}
 else{P.step=0;setTimeout(()=>{BRAZ.forEach(bb=>{if(bb.lit){bb.lit=false;bb.gl.material.opacity=0;for(let k=0;k<12;k++)PN.emit(bb.x,1.5,bb.z,rnd(-.4,.4),rnd(1,2),rnd(-.4,.4),0x3a3530,0.4,1.2,1.5,-0.3,0.5,0.6);}});},700);
  say('Les flammes vacillent puis s’éteignent… ce n’était pas le bon ordre.'+(BRAZ.some(bb=>bb.runeT>0)?'':' (L’autel parle de lumière…)'),'sys');}}
function activateSeal(i){const P=S.puz.seals,p=PILLARS[i];P.on[i]=true;p.cm.emissiveIntensity=1.2;p.gl.material.opacity=0.9;burst(p.x,3.1,p.z,ELEM[P.els[i]].c,30,4);flash(p.x,3,p.z,ELEM[P.els[i]].c,3,0.6);
 if(P.on.every(Boolean)){P.open=true;GRATE.bars.visible=false;for(let k=0;k<40;k++)PN.emit(GRATE.x+rnd(-1.2,1.2),0.3,GRATE.z+rnd(-1.2,1.2),0,rnd(.5,2),0,0x8a8070,0.5,1.2,rnd(1,2),0,0.5,0.6);
  gainXP(40);say('🔓 Un grondement sourd… La grille au pied du château s’ouvre : l’entrée des <b>Souterrains</b> est libre !','gm');chron('Sceaux du château brisés.');save();}
 else say('Le sceau de '+ELEM[P.els[i]].n+' s’illumine. ('+P.on.filter(Boolean).length+'/3)','sys');}
function revealRunes(x,z,r){let n=0;BRAZ.forEach(b=>{if(Math.hypot(b.x-x,b.z-z)<r){if(b.runeT<=0)n++;b.runeT=40;}});if(n)hint('runes','✨ Des chiffres runiques apparaissent sur les braseros…');}
function elemHit(el,x,z,r){if(!S.puz)return;
 if(el==='feu'&&!S.puz.braz.solved)BRAZ.forEach((b,i)=>{if(!b.lit&&Math.hypot(b.x-x,b.z-z)<r+1.2)lightBrazier(i);});
 if(el==='lumiere')revealRunes(x,z,r+12);
 if(!S.puz.seals.open)PILLARS.forEach((p,i)=>{if(!S.puz.seals.on[i]&&Math.hypot(p.x-x,p.z-z)<r+1.4){if(S.puz.seals.els[i]===el)activateSeal(i);else if(!p.warn){p.warn=1;say('Le sceau reste muet. Il attend la magie de type <b>'+ELEM[S.puz.seals.els[i]].n+'</b>.','sys');}}});
 if(!S.puz.glyph.open){const d=Math.hypot(GLYPH.x-x,GLYPH.z-z);if(el==='lumiere'&&d<r+10){if(GLYPH.rev<=0)say('✨ Un glyphe secret apparaît sur le flanc ouest de la tour !','gm');GLYPH.rev=45;}if(el==='arcane'&&GLYPH.rev>0&&d<r+2){S.puz.glyph.open=true;GLYPH.rev=0;burst(GLYPH.x,1.7,GLYPH.z,0xff7ae0,40,4);flash(GLYPH.x,1.7,GLYPH.z,0xff7ae0,3,0.8);spawnChest('biblio',null,false,{x:-38.6,z:-29.8});gainXP(40);say('Une pierre de la tour pivote et révèle une cachette secrète !','gm');chron('Glyphe secret de la bibliothèque ouvert.');}}
 ENT.slice().forEach(e=>{if(e.kind==='chest'&&e.data.lock&&LOCKS[e.data.lock].el===el&&Math.hypot(e.x-x,e.z-z)<r+1.4)unlockChest(e);});
 if(S.zone==='grotte')grotteHit(el,x,z,r);if(DUN&&S.zone==='donjon'){const D=S.puz.dun;if(el==='feu'&&!D.ice&&Math.hypot(DUN.ice.x-x,DUN.ice.z-z)<r+3.2)meltIceDoor();if(el==='arcane'&&!D.rune&&Math.hypot(DUN.rune.x-x,DUN.rune.z-z)<r+4)openRuneDoor();}
}

/* ---------- Souterrains ---------- */
const DG={x0:-34.5,z0:-700,t:3};
const dpos=(tx,tz)=>({x:DG.x0+tx*DG.t,z:DG.z0+tz*DG.t});
function tex(draw,rep){const c=document.createElement('canvas');c.width=c.height=128;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t;}
function buildDungeon(){const W=23,H=29,g=[];for(let z=0;z<H;z++)g.push(Array(W).fill('#'));
 const carve=(x1,z1,x2,z2,ch)=>{for(let z=z1;z<=z2;z++)for(let x=x1;x<=x2;x++)g[z][x]=ch||'.';};
 carve(2,2,7,7);carve(8,4,10,5);carve(11,2,18,9);carve(14,10,15,12);carve(9,13,20,18);carve(9,15,20,16,'~');carve(14,19,15,21);carve(8,22,21,27);carve(4,24,7,25);carve(1,14,3,27);carve(1,13,3,13);carve(1,9,7,12);
 const floorT=tex(q=>{q.fillStyle='#4a4640';q.fillRect(0,0,128,128);for(let i=0;i<4;i++)for(let j=0;j<4;j++){q.fillStyle='rgba(0,0,0,'+(0.05+Math.random()*0.15)+')';q.fillRect(i*32+1,j*32+1,30,30);}q.strokeStyle='#2e2b27';q.lineWidth=2;for(let i=0;i<=4;i++){q.beginPath();q.moveTo(i*32,0);q.lineTo(i*32,128);q.stroke();q.beginPath();q.moveTo(0,i*32);q.lineTo(128,i*32);q.stroke();}},[W,H]);
 const wallT=tex(q=>{q.fillStyle='#5a544c';q.fillRect(0,0,128,128);q.strokeStyle='#36322d';q.lineWidth=3;for(let r=0;r<4;r++){q.beginPath();q.moveTo(0,r*32);q.lineTo(128,r*32);q.stroke();for(let c=0;c<2;c++){const x=(c*64+(r%2)*32)%128;q.beginPath();q.moveTo(x,r*32);q.lineTo(x,r*32+32);q.stroke();}}for(let i=0;i<60;i++){q.fillStyle='rgba(0,0,0,'+Math.random()*0.15+')';q.fillRect(Math.random()*128,Math.random()*128,4,4);}});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(W*3,H*3).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({map:floorT,roughness:1}));floor.position.set(DG.x0+(W-1)*1.5,0.01,DG.z0+(H-1)*1.5);floor.receiveShadow=true;scene.add(floor);
 const solid=(x,z)=>x<0||z<0||x>=W||z>=H||g[z][x]==='#';const need=(x,z)=>{if(!solid(x,z))return false;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)if(!solid(x+dx,z+dz))return true;return false;};
 for(let z=0;z<H;z++){let x=0;while(x<W){if(need(x,z)){let x2=x;while(x2+1<W&&need(x2+1,z))x2++;const n=x2-x+1;const wt=wallT.clone();wt.needsUpdate=true;wt.repeat.set(n,2);const m=new THREE.Mesh(new THREE.BoxGeometry(n*3,5,3),new THREE.MeshStandardMaterial({map:wt,roughness:0.95}));const c=dpos((x+x2)/2,z);m.position.set(c.x,2.5,c.z);m.receiveShadow=true;scene.add(m);addCol({x:c.x,z:c.z,hw:n*1.5,hd:1.5});x=x2+1;}else x++;}}
 const cA=dpos(9,15),cB=dpos(20,16);const water=new THREE.Mesh(new THREE.PlaneGeometry(cB.x-cA.x+3,cB.z-cA.z+3).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x0a2a3a,emissive:0x05202a,roughness:0.1,metalness:0.3}));water.position.set((cA.x+cB.x)/2,0.04,(cA.z+cB.z)/2);scene.add(water);
 const chan={x1:cA.x-1.5,x2:cB.x+1.5,z1:cA.z-1.5,z2:cB.z+1.5};
 // torches
 const torches=[];[[2,2],[7,7],[2,7],[11,2],[18,9],[18,2],[9,13],[20,13],[9,18],[20,18],[1,14],[3,20],[1,26],[1,9],[7,9],[7,12],[1,12]].forEach(([tx,tz])=>{const p=dpos(tx,tz);const t={x:p.x,z:p.z};mesh(new THREE.CylinderGeometry(0.08,0.12,0.6,6),0x3a2a1a,p.x,2.3,p.z,null,false);const gl=glow(0xff9a40,2.2,0.85);gl.position.set(p.x,2.8,p.z);scene.add(gl);torches.push(t);});
 // portes
 const ip=dpos(9,4.5);const iceM=new THREE.Mesh(new THREE.BoxGeometry(1.2,5,6),new THREE.MeshStandardMaterial({color:0xbfe8ff,transparent:true,opacity:0.6,roughness:0.05,metalness:0.2}));iceM.position.set(ip.x,2.5,ip.z);scene.add(iceM);const iceC={x:ip.x,z:ip.z,hw:0.6,hd:3};addCol(iceC);
 const hp=dpos(6,24.5);const herse=new THREE.Group();herse.position.set(hp.x,0,hp.z);scene.add(herse);const iron=mat(0x2a2a30,{metalness:0.7,roughness:0.4});for(let i=-2.6;i<=2.6;i+=0.5)mesh(new THREE.BoxGeometry(0.12,4.6,0.12),iron,0,2.3,i,herse);for(let y=0.6;y<4.6;y+=1.2)mesh(new THREE.BoxGeometry(0.14,0.12,6),iron,0,y,0,herse);const herC={x:hp.x,z:hp.z,hw:0.4,hd:3};addCol(herC);
 const rp=dpos(2,13);const rune=new THREE.Mesh(new THREE.BoxGeometry(9,5,0.8),new THREE.MeshStandardMaterial({map:wallT,color:0x9a8aa0,roughness:0.9}));rune.position.set(rp.x,2.5,rp.z);scene.add(rune);const rg=glow(0xff7ae0,4,0.7);rg.position.set(rp.x,2.5,rp.z+0.6);scene.add(rg);const runeC={x:rp.x,z:rp.z,hw:4.5,hd:0.5};addCol(runeC);
 // levier
 const lp=dpos(21,27);const lever=new THREE.Group();lever.position.set(lp.x,0,lp.z);scene.add(lever);mesh(new THREE.BoxGeometry(0.6,0.4,0.6),0x4a4640,0,0.2,0,lever);const stick=new THREE.Group();stick.position.y=0.4;lever.add(stick);mesh(new THREE.CylinderGeometry(0.05,0.05,1,6),iron,0,0.5,0,stick);mesh(new THREE.SphereGeometry(0.1,8,6),mat(0xaa2222),0,1,0,stick);stick.rotation.x=0.6;
 station({x:lp.x,z:lp.z,reach:2.4,hint:()=>S.zone==='donjon'?(S.puz.dun.herse?null:'Actionner le levier'):null,act:()=>{S.puz.dun.herse=true;syncDungeon();burst(hp.x,2,hp.z,0x8a8070,20,3);say('⚙ Un mécanisme grince au loin… la herse se lève !','gm');}});
 const sp=dpos(3,3);mesh(new THREE.BoxGeometry(2.4,0.3,1),0x6a6460,sp.x,0.15,sp.z-0.6);mesh(new THREE.BoxGeometry(2.4,0.6,1),0x6a6460,sp.x,0.3,sp.z-1.4);const ex=glow(0xbfe6ff,3,0.5);ex.position.set(sp.x,1.2,sp.z-1);scene.add(ex);
 station({x:sp.x,z:sp.z,reach:2.6,hint:()=>S.zone==='donjon'?'Remonter à la surface':null,act:()=>exitDungeon()});
 DUN={g,W,H,chan,torches,ice:{x:ip.x,z:ip.z,m:iceM,c:iceC},herse:{g:herse,c:herC,stick},rune:{x:rp.x,z:rp.z,m:rune,gl:rg,c:runeC},boss:null};
}
function syncDungeon(){const P=S.puz.dun;DUN.ice.m.visible=!P.ice;DUN.ice.c.off=P.ice;DUN.herse.g.position.y=P.herse?4.4:0;DUN.herse.c.off=P.herse;DUN.herse.stick.rotation.x=P.herse?-0.6:0.6;DUN.rune.m.position.y=P.rune?-2.6:2.5;DUN.rune.gl.visible=!P.rune;DUN.rune.c.off=P.rune;}
const inChannel=p=>DUN&&p.x>DUN.chan.x1&&p.x<DUN.chan.x2&&p.z>DUN.chan.z1&&p.z<DUN.chan.z2;
const inWater=p=>inLake(p)||inChannel(p);
function meltIceDoor(){S.puz.dun.ice=true;syncDungeon();for(let i=0;i<40;i++)PN.emit(DUN.ice.x+rnd(-.5,.5),rnd(0,4.5),DUN.ice.z+rnd(-3,3),rnd(-1,1),rnd(1,2),rnd(-1,1),0xe8eef5,0.7,2,rnd(1,2),-0.3,0.5,0.55);say('La porte de glace fond dans un nuage de vapeur !','sys');}
function openRuneDoor(){S.puz.dun.rune=true;syncDungeon();burst(DUN.rune.x,2.5,DUN.rune.z,0xff7ae0,40,5);say('Les runes s’embrasent et la porte de pierre s’enfonce dans le sol…','gm');}
function spawnCreatureAt(x,z,name,weak,look,hp,extra){const g=new THREE.Group();const core=mesh(G.orb,basic(ELEM[look].c),0,1.4,0,g,false);const e1=mesh(G.ball,basic(0x111111),-0.1,1.48,0.24,g,false);e1.scale.setScalar(0.25);const e2=e1.clone();e2.position.x=0.1;g.add(e2);
 const gl=glow(ELEM[look].c,2,0.8);gl.position.y=1.4;g.add(gl);const sc=(extra&&extra.scale)||1;g.scale.setScalar(sc);
 return addEnt('creature',x,z,g,Object.assign({name,weak,look,hp:hp||2,hx:x,hz:z,tx:x,tz:z,loc:'chateau',core,gl,frozen:0,rooted:0,confused:0,burn:0,kx:0,kz:0,y:1.4,rad:1.2*sc},extra||{}),extra&&extra.boss?Infinity:900);}
function populateDungeon(){const P=S.puz.dun;if(P.spawned)return;P.spawned=true;
 [[13,4],[16,7],[12,8]].forEach(([x,z])=>{const p=dpos(x,z);spawnCreatureAt(p.x,p.z,'Gelées de braise','eau','feu',3);});
 [[11,24],[16,26],[19,23]].forEach(([x,z])=>{const p=dpos(x,z);spawnCreatureAt(p.x,p.z,'Spectres','lumiere','ombre',3);});
 [[2,18],[2,24]].forEach(([x,z])=>{const p=dpos(x,z);spawnCreatureAt(p.x,p.z,'Gardiens de pierre','glace','arcane',3);});
 const c=dpos(17,3);spawnChest(null,pick(Object.keys(LOCKS)),false,{x:c.x,z:c.z+0.5});const c2=dpos(20,26);spawnChest(null,'ombre',false,{x:c2.x-1,z:c2.z});}
function enterDungeon(){fade(()=>{S.zone='donjon';const p=dpos(4,4.6);player.x=p.x;player.z=p.z;player.y=0;player.vx=player.vz=player.vy=0;camYaw=Math.PI;camera.position.set(p.x,4,p.z+6);populateDungeon();syncDungeon();
 say('🕯 Tu descends dans les <b>Souterrains</b>… L’air est froid et humide. Quelque chose gronde dans les profondeurs.','gm');chron('Descente dans les Souterrains.');});}
function exitDungeon(){fade(()=>{S.zone='monde';player.x=GRATE.x-2.5;player.z=GRATE.z+2.5;player.y=0;player.vx=player.vz=player.vy=0;camYaw=Math.PI;camera.position.set(player.x,5,player.z+7);say('Tu remontes à la surface. L’air frais te fait du bien.','sys');});}
function dTile(p){return {x:Math.round((p.x-DG.x0)/DG.t),z:Math.round((p.z-DG.z0)/DG.t)};}
function spawnBoss(){const p=dpos(4,10.5);const e=spawnCreatureAt(p.x,p.z,'Gardien des Souterrains','arcane','arcane',16,{boss:true,scale:2.4,wt:0,st:4,mt:12});DUN.boss=e;bossWeak(e);flash(p.x,4,p.z,0xff7ae0,5,1,false,40);
 say('💀 Le <b>Gardien des Souterrains</b> s’éveille ! Seule sa faiblesse du moment peut le blesser : observe sa couleur.','gm');}
function bossWeak(e){const D=e.data;const known=[...new Set(S.spells.map(s=>s.el))];const opts=known.filter(x=>x!==D.weak);D.weak=pick(opts.length?opts:known);D.look=D.weak;D.core.material.color.setHex(ELEM[D.weak].c);D.gl.material.color.setHex(ELEM[D.weak].c);
 if(D.lbl){e.obj.remove(D.lbl);D.lbl.material.map.dispose();}D.lbl=label('Faiblesse : '+ELEM[D.weak].n,hex(ELEM[D.weak].c),3.6);D.lbl.position.y=2.6;D.lbl.scale.multiplyScalar(1/2.4*1.6);e.obj.add(D.lbl);D.wt=9;}
function bossDefeated(){S.puz.dun.boss=true;DUN.boss=null;const p=dpos(5.5,10);spawnChest(null,null,true,{x:p.x,z:p.z});flash(p.x,3,p.z,0xf3cf7a,6,1.5,false,40);gainXP(120);say('🏆 Le Gardien s’effondre en une pluie de cristaux ! Un coffre ancien apparaît.','gm');chron('Gardien des Souterrains vaincu.');save();}

/* ---------- mise à jour ---------- */
function updWorld2(dt){const t=performance.now()/1000;
 Object.keys(BUFF).forEach(k=>{BUFF[k]-=dt;if(BUFF[k]<=0){delete BUFF[k];say('L’effet de la '+POTIONS[k].n.toLowerCase()+' s’estompe.','sys');}});
 wtick+=dt;if(wtick>1){wtick=0;if(BUFF.voyance){const n=revealScrolls(player.x,player.z,40);if(n)say('👁 Ta voyance révèle un parchemin caché !','gm');}}
 herbT-=dt;if(herbT<=0){herbT=30;herbTick();}
 STATIONS.forEach(s=>{if(s.cauldron&&Math.abs(s.x-player.x)<40&&Math.abs(s.z-player.z)<40){if(Math.random()<dt*4)PA.emit(s.x+rnd(-.4,.4),1.08,s.z+rnd(-.4,.4),0,rnd(.3,.8),0,0x7affb0,0.18,0.03,rnd(.5,1),0,0);if(Math.random()<dt*6)PA.emit(s.x+rnd(-.2,.2),0.15,s.z+rnd(-.2,.2),0,rnd(.6,1.2),0,pick([0xff7a2e,0xffc040]),0.25,0.05,0.4,-1,1);}});
 BRAZ.forEach(b=>{if(b.lit&&Math.random()<dt*20)fireAt(b.x,1.45,b.z,0.45,1);if(b.runeT>0){b.runeT-=dt;b.rune.material.opacity=Math.min(1,b.runeT/2);}else if(b.rune)b.rune.material.opacity=0;});
 if(GLYPH){if(GLYPH.rev>0)GLYPH.rev-=dt;GLYPH.m.material.opacity=GLYPH.rev>0&&!S.puz.glyph.open?Math.min(1,GLYPH.rev/3)*(0.75+Math.sin(t*3)*0.25):0;}
 ORBS.forEach(o=>{if(Math.random()<dt*2)elemHit('lumiere',o.x,o.z,4);});
 ENT.forEach(e=>{if(e.kind==='herb'){const u=e.obj.userData;if(u.spin){u.spin.rotation.y+=dt*2;u.spin.position.y=0.8+Math.sin(t*2+e.x)*0.15;}if(Math.random()<dt*1.2)PA.emit(e.x+rnd(-.2,.2),0.5,e.z+rnd(-.2,.2),0,rnd(.3,.7),0,INGR[e.data.ing].c,0.18,0.03,1,0,0,0.8);}
  else if(e.kind==='chest'){const D=e.data;if(D.ov&&D.ov.userData.spin)D.ov.userData.spin.rotation.y+=dt*1.5;if(D.lock==='ombre'&&Math.random()<dt*10)PN.emit(e.x+rnd(-.6,.6),rnd(0.2,1.2),e.z+rnd(-.6,.6),0,0.3,0,0x150a24,0.5,0.9,1,0,0.5,0.8);if(D.lock==='flamme'&&Math.random()<dt*12)fireAt(e.x+rnd(-.5,.5),0.3,e.z+rnd(-.5,.5),0.4,1);if(D.relic&&!D.open&&Math.random()<dt*6)PA.emit(e.x+rnd(-.5,.5),0.8,e.z+rnd(-.5,.5),0,rnd(.5,1.2),0,0xf3cf7a,0.25,0.03,1,0,0);}});
 npcs.forEach(n=>{if(n.bubT>0){n.bubT-=dt;if(n.bubT<=0&&n.bub){n.obj.remove(n.bub);n.bub.material.map.dispose();n.bub.material.dispose();n.bub=null;}}});
 // nage & froid
 if(player.swim){if(!BUFF.phoque)player.cold=(player.cold||0)+dt;if(Math.random()<dt*6)ring(player.x,player.z,0xbfe6ff,0.8,0.6);if(player.cold>8&&player.cold-dt<=8)say('🥶 L’eau est glacée… regagne vite la rive (ou bois une potion de peau de phoque).','sys');
  if(player.cold>13){splash(player.x,player.z);const L=LOCBY.lac;player.x=L.spot.x;player.z=L.spot.z;player.vx=player.vz=0;player.cold=0;say('Frigorifié, tu regagnes la rive en claquant des dents.','sys');}}
 else player.cold=Math.max(0,(player.cold||0)-dt*2);
 // Souterrains
 if(DUN&&S.zone==='donjon'){const tp=dTile(player);
  if(inChannel(player)&&!walkable(player)&&player.y<0.3){splash(player.x,player.z);const p=player.z<(DUN.chan.z1+DUN.chan.z2)/2?dpos(14.5,13.2):dpos(14.5,17.8);player.x=p.x;player.z=p.z;player.vx=player.vz=0;say('Les eaux noires sont trop froides et profondes : tu ressors aussitôt. (Gèle-les, ou marche dessus…)','sys');}
  if(tp.x>=1&&tp.x<=7&&tp.z>=9&&tp.z<=12&&!S.puz.dun.boss&&!DUN.boss)spawnBoss();
  // lumières des torches
  const ts=DUN.torches.slice().sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z));TL.forEach((l,i)=>{const T=ts[i];l.color.setHex(0xff9a40);l.distance=14;l.position.set(T.x,2.8,T.z);l.intensity=1.6+Math.sin(t*9+i)*0.25;});
  DUN.torches.forEach(T=>{if(Math.hypot(T.x-player.x,T.z-player.z)<22&&Math.random()<dt*14)fireAt(T.x,2.75,T.z,0.25,1);});
  PLight.position.set(player.x,player.y+2.2,player.z);PLight.intensity=1.2;
  const B=DUN.boss;if(B&&ENT.includes(B)){const D=B.data;D.frozen=Math.min(D.frozen,0.8);D.rooted=Math.min(D.rooted,0.8);D.confused=0;D.wt-=dt;D.st-=dt;D.mt-=dt;if(D.wt<=0)bossWeak(B);
   if(D.st<=0){D.st=rnd(6,8);ring(B.x,B.z,ELEM[D.weak].c,5,0.9);flash(B.x,1,B.z,ELEM[D.weak].c,3,0.5);const d=Math.hypot(player.x-B.x,player.z-B.z);if(d<8){player.vx+=(player.x-B.x)/(d||1)*14;player.vz+=(player.z-B.z)/(d||1)*14;player.vy=7;player.grounded=false;mana=Math.max(0,mana-15);say('Le Gardien frappe le sol ! L’onde te repousse et draine ta magie.','sys');}}
   if(D.mt<=0){D.mt=16;if(ENT.filter(e=>e.kind==='creature').length<6){const known=[...new Set(S.spells.map(s=>s.el))];for(let i=0;i<2;i++){const w=pick(known);spawnCreatureAt(B.x+rnd(-3,3),B.z+rnd(-2,2),'Éclats du Gardien',w,w,1);}}}}
 }else if(S.zone!=='monde'){zoneLights(t);}else{PLight.intensity=0;TL.forEach(l=>l.intensity=0);}
}
const GREYT=new THREE.Color(0x5a6270),GREYB=new THREE.Color(0x9aa2ae);
function buildWorld2(){snowMesh=new THREE.Mesh(new THREE.CircleGeometry(95,64).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:0,roughness:0.9,depthWrite:false}));snowMesh.position.y=0.07;snowMesh.receiveShadow=true;snowMesh.visible=false;scene.add(snowMesh);
 makeCauldron(-30.5,18.5);makeCauldron(15.5,65.5);buildPuzzles();buildDungeon();}
function initWorld2(){if(!S.puz||S.puz.day!==S.day)newPuzzles();if(!S.puz.grotte)S.puz.grotte={els:ELS.slice().sort(()=>Math.random()-0.5).slice(0,4),open:false,spawned:false};if(!S.puz.flags)S.puz.flags={};S.puz.grotte.spawned=false;S.puz.flags.bspawn=false;S.puz.dun.spawned=false;S.zone='monde';syncPuzzles();if(!S.weather)setWeather('clair',true);herbTick();for(let i=0;i<3;i++)spawnChest(pick(LOCS).id);}

