/* ================= LE DOMAINE : terrain, maison, jardin =================
   Un terrain est à vendre près du Village de Brumepont (panneau). Une fois acheté (300 🪙), on y construit par étapes
   depuis le panneau « Ton domaine » : maison (600 🪙, 3 styles), jardin de 4 parcelles (200 🪙), chaudron d'alchimie
   (150 🪙), lanternes et fleurs (80 🪙). La maison : se reposer (vie et mana pleins ; la nuit, dormir jusqu'au matin),
   point de réveil après un évanouissement dans la vallée, destination de la Pierre de rappel.
   Jardin : planter 1 ingrédient de cueillette → 6 h de jeu plus tard (≈ 4 min), récolter 3 ingrédients.
   S.home = {x,z,rot,house:null|style,garden:[{k,t}|null ×4],cauldron,deco}. Tout est reconstruit au chargement (kit 11b). */
const HOMEP={terrain:300,maison:600,jardin:200,chaudron:150,deco:80};
const HOME_STYLES=[['Maison blanche à volets verts',0],['Chaumière au toit de chaume',3],['Maison au toit d’ardoise',5]];
const HOME={site:null,built:{},plots:[],sale:null};
const gameMin=()=>S.day*1440+S.time;
// emplacement : un terrain plat et libre autour du village (calculé une fois, puis gardé dans S.home)
function homeFindSite(){const V=LOCBY.village;for(let r=22;r<=40;r+=3)for(let k=0;k<16;k++){const a=k/16*TAU+r*0.37,x=V.spot.x+Math.cos(a)*r,z=V.spot.z+Math.sin(a)*r;
  if(!dkFree(x,z,7,2))continue;const g=gh(x,z);let flat=true;for(const [dx,dz] of [[6,6],[-6,6],[6,-6],[-6,-6],[0,7],[7,0],[0,-7],[-7,0]])if(Math.abs(gh(x+dx,z+dz)-g)>1.4){flat=false;break;}if(!flat)continue;
  if(LOCS.some(L=>L.x<1500&&Math.hypot(L.x-x,L.z-z)<L.r+6))continue;const rot=Math.round(Math.atan2(V.spot.x-x,V.spot.z-z)/(Math.PI/2))*(Math.PI/2);return {x,z,rot};}return null;}
const homeW=(lx,lz)=>{const H=HOME.site,c=Math.cos(H.rot),s=Math.sin(H.rot);return {x:H.x+lx*c+lz*s,z:H.z-lx*s+lz*c};};
function homeSpawn(){if(!S||!S.home||!S.home.house)return null;const p=homeW(0,0.5);return {x:p.x,z:p.z};}
// ---------- construction (kit de décor, fusionné à chaque étape) ----------
function homeBuild(part){const H=HOME.site;if(!H||HOME.built[part])return;HOME.built[part]=1;dkMats();
 if(part==='terrain'){const c=[[-7,-6],[7,-6],[7,6],[-7,6]].map(([a,b])=>homeW(a,b)),g1=homeW(-1.6,6),g2=homeW(1.6,6);
  dFence(c[0].x,c[0].z,c[1].x,c[1].z);dFence(c[1].x,c[1].z,c[2].x,c[2].z);dFence(c[3].x,c[3].z,c[0].x,c[0].z);dFence(c[2].x,c[2].z,g2.x,g2.z);dFence(g1.x,g1.z,c[3].x,c[3].z);
  const sp=homeW(2.6,6.6);dkAt(sp.x,sp.z,H.rot);dBox('wood',0x5a3a1e,0.14,1.6,0.14,0,0.8,0);dBox('wood',0x8a6a42,1.3,0.55,0.08,0,1.45,0.05);}
 if(part==='maison'){const st=HOME_STYLES[S.home.house||0]||HOME_STYLES[0],p=homeW(0,-2.6);house(p.x,p.z,H.rot,HOUSE_LOOKS[st[1]]);const q=Math.abs(Math.sin(H.rot))>0.5;addCol({x:p.x,z:p.z,hw:q?2.9:2.7,hd:q?2.7:2.9});}
 if(part==='jardin'){for(let i=0;i<4;i++){const p=homeW(-5+(i%2)*2.2,1.2+Math.floor(i/2)*2.2);dkAt(p.x,p.z,H.rot);dBox('wood',0x6a4a2a,1.8,0.25,1.8,0,0.12,0);dBox('plain',0x4a3020,1.6,0.06,1.6,0,0.27,0);}}
 if(part==='deco'){for(const [a,b] of [[-2.4,5.4],[2.4,5.4]]){const p=homeW(a,b);dLanternPost(p.x,p.z);}for(const [a,b] of [[-6,-5],[6,-5],[6,1],[-1.5,1.2],[1.5,1.2]]){const p=homeW(a,b);dFlowers(p.x,p.z);}}
 dkFlush();
 if(part==='chaudron'){const p=homeW(4.5,2.2),n0=scene.children.length,nc=COLS.length;const st=makeCauldron(p.x,p.z);const g=scene.children[n0];if(g)g.position.y=gh(p.x,p.z);const c=COLS[nc];if(c)c.h=gh(p.x,p.z)+1.05;st.hint=()=>'Ton chaudron : préparer une potion';}}
function homePlots(){HOME.plots.forEach(P=>{if(P.o)scene.remove(P.o);});HOME.plots=[];for(let i=0;i<4;i++){const p=homeW(-5+(i%2)*2.2,1.2+Math.floor(i/2)*2.2);const P={i,x:p.x,z:p.z,o:null,k:null};HOME.plots.push(P);
  station({x:p.x,z:p.z,reach:1.6,hint:()=>plotHint(P),act:()=>plotAct(P)});}}
function plotState(P){const G=S.home&&S.home.garden&&S.home.garden[P.i];if(!G)return {s:'vide'};const k=Math.min(1,(gameMin()-G.t)/360);return {s:k>=1?'mur':'pousse',k,G};}
function plotHint(P){const st=plotState(P);return st.s==='vide'?'Planter dans la parcelle':st.s==='mur'?'Récolter : '+INGR[st.G.k].n+' ×3':INGR[st.G.k].n+' pousse ('+Math.round(st.k*100)+' %)';}
function plotAct(P){const st=plotState(P);if(st.s==='pousse'){say('🌱 Patience : ça pousse encore ('+Math.round(st.k*100)+' %). Il faut 6 heures de jeu.','sys');return;}
 if(st.s==='mur'){addItem(st.G.k,3);S.home.garden[P.i]=null;burst(P.x,gh(P.x,P.z)+0.6,P.z,INGR[st.G.k].c,20,3);sfx('pick');say('🧺 Récolte : <b>3 '+esc(INGR[st.G.k].n)+'</b>.','sys');save();return;}
 const own=Object.keys(INGR).filter(k=>INGR[k].where&&INGR[k].where.length&&(S.inv[k]||0)>0);
 if(!own.length){say('Il te faut 1 ingrédient de cueillette à planter.','sys');return;}
 openPick('🌱 Planter','Il pousse en 6 heures de jeu (environ 4 minutes) et donne 3 ingrédients.',own.map(k=>({t:INGR[k].n+' (tu en as '+S.inv[k]+')',fn:()=>{S.inv[k]--;S.home.garden[P.i]={k,t:gameMin()};$('#pick').classList.add('hidden');sfx('pick');say('🌱 Tu plantes : '+esc(INGR[k].n)+'.','sys');save();}})));}
function plotsTick(){for(const P of HOME.plots){const st=plotState(P);const key=st.s==='vide'?'':st.G.k+(st.s==='mur'?'!':Math.floor(st.k*4));if(P.key===key)continue;P.key=key;if(P.o){scene.remove(P.o);P.o=null;}if(st.s==='vide')continue;
  const g=new THREE.Group(),y=gh(P.x,P.z)+0.3;g.position.set(P.x,y,P.z);const c=INGR[st.G.k].c,sz=st.s==='mur'?1:0.3+0.6*st.k;
  for(let j=0;j<5;j++){const a=j/5*TAU,s=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.5*sz,5),mat(0x4a8a3a));s.position.set(Math.cos(a)*0.45,0.25*sz,Math.sin(a)*0.45);g.add(s);
   if(st.s==='mur'){const f=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),mat(c,{emissive:c,emissiveIntensity:0.4}));f.position.set(Math.cos(a)*0.45,0.55,Math.sin(a)*0.45);g.add(f);}}
  if(st.s==='mur'){const gl=glow(c,1.2,0.6);gl.position.y=0.6;g.add(gl);}scene.add(g);P.o=g;}}
// ---------- le panneau du terrain / du domaine ----------
function homeMenu(){if(!S.home){if((S.or||0)<HOMEP.terrain){say('🏡 Ce terrain coûte <b>'+HOMEP.terrain+' 🪙</b> (tu as '+(S.or||0)+').','sys');return;}
  openPick('🏡 Terrain à vendre','Un beau terrain plat près de Brumepont. Prix : '+HOMEP.terrain+' 🪙 (tu as '+(S.or||0)+').',[{t:'Acheter le terrain',s:HOMEP.terrain+' 🪙',fn:()=>{S.or-=HOMEP.terrain;S.home={x:HOME.site.x,z:HOME.site.z,rot:HOME.site.rot,house:null,garden:[null,null,null,null],cauldron:false,deco:false};
   $('#pick').classList.add('hidden');if(HOME.sale){scene.remove(HOME.sale);HOME.sale=null;}homeBuild('terrain');banner('Domaine de '+S.name,'Le terrain est à toi !');sfx('win');chron('J’ai acheté un terrain près de Brumepont.');save();setTimeout(homeMenu,1200);}}]);return;}
 const H=S.home,it=[];
 if(H.house===null)HOME_STYLES.forEach(([n],i)=>it.push({t:'🏠 '+n,s:HOMEP.maison+' 🪙',off:(S.or||0)<HOMEP.maison,fn:()=>buyPart('maison',HOMEP.maison,()=>{H.house=i;})}));
 if(!H.gardenOn)it.push({t:'🌱 Jardin (4 parcelles)',s:HOMEP.jardin+' 🪙 · fais pousser tes ingrédients',off:(S.or||0)<HOMEP.jardin,fn:()=>buyPart('jardin',HOMEP.jardin,()=>{H.gardenOn=true;})});
 if(!H.cauldron)it.push({t:'⚗ Chaudron d’alchimie',s:HOMEP.chaudron+' 🪙 · tes potions à la maison',off:(S.or||0)<HOMEP.chaudron,fn:()=>buyPart('chaudron',HOMEP.chaudron,()=>{H.cauldron=true;})});
 if(!H.deco)it.push({t:'🏮 Lanternes et fleurs',s:HOMEP.deco+' 🪙',off:(S.or||0)<HOMEP.deco,fn:()=>buyPart('deco',HOMEP.deco,()=>{H.deco=true;})});
 if(!it.length)it.push({t:'✔ Ton domaine est complet !',s:'Maison, jardin, chaudron, lanternes.',off:true});
 openPick('🏡 Domaine de '+S.name,'🪙 '+(S.or||0)+' pièces d’or. Construis ce que tu veux, dans l’ordre que tu veux.',it);}
function buyPart(part,price,set){if((S.or||0)<price)return;S.or-=price;set();$('#pick').classList.add('hidden');fade(()=>{homeBuild(part);if(part==='jardin')homePlots();});
 SHAKE=Math.max(SHAKE,0.3);sfx('win');banner({maison:'Ta maison est construite !',jardin:'Le jardin est prêt',chaudron:'Ton chaudron bouillonne',deco:'Le domaine s’illumine'}[part],'Domaine de '+S.name);chron('Domaine : '+part+'.');save();}
function homeRest(){if(S.time>=20*60||S.time<5*60){sleepHere();return;}if(typeof VIE!=='undefined')VIE.hp=VIE.max;mana=manaMax();sfx('learn');say('🏠 Tu te reposes chez toi : vie et magie au maximum.','sys');}
// ---------- mise en place (au lancement de la partie) ----------
function homeSetup(){HOME.site=S.home?{x:S.home.x,z:S.home.z,rot:S.home.rot}:homeFindSite();if(!HOME.site)return;const H=HOME.site;
 station({x:H.x+0,z:H.z+0,get reach(){return 2.4;},hint:()=>S.home?'🏡 Ton domaine':'🏡 Terrain à vendre ('+HOMEP.terrain+' 🪙)',act:()=>homeMenu()});
 const p=homeW(0,0.5);station({x:p.x,z:p.z,reach:1.8,hint:()=>S.home&&S.home.house!==null?(S.time>=20*60||S.time<5*60?'Dormir chez toi':'Se reposer chez toi'):null,act:()=>homeRest()});
 if(!S.home){const g=new THREE.Group(),y=gh(H.x,H.z);g.position.set(H.x,y,H.z);g.rotation.y=H.rot;const wd=mat(0x6a4a2a);const post=new THREE.Mesh(new THREE.BoxGeometry(0.15,1.8,0.15),wd);post.position.y=0.9;g.add(post);
  const bd=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.8,0.08),mat(0xe8dcc0));bd.position.y=1.6;g.add(bd);const gl=glow(0xffd24a,1.6,0.6);gl.position.y=2.2;g.add(gl);scene.add(g);HOME.sale=g;return;}
 homeBuild('terrain');if(S.home.house!==null)homeBuild('maison');if(S.home.gardenOn){homeBuild('jardin');homePlots();}if(S.home.cauldron)homeBuild('chaudron');if(S.home.deco)homeBuild('deco');}
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{homeSetup();}catch(e){console.error(e);}return r;};}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{if(HOME.plots.length&&S.zone==='monde')plotsTick();if(!S.home&&HOME.site&&!S.homeHint&&Math.hypot(player.x-HOME.site.x,player.z-HOME.site.z)<14){S.homeHint=1;say('🏡 Un panneau « <b>Terrain à vendre</b> » se dresse près de Brumepont. Avec des pièces d’or, il pourrait être à toi…','gm');}}catch(e){}return r;};}
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object')r.domaine=S.home?('Le joueur possède un domaine près de Brumepont'+(S.home.house!==null?' avec une maison':'')+(S.home.gardenOn?', un jardin':'')+(S.home.cauldron?', un chaudron':'')+'.'):'Un terrain est à vendre près de Brumepont ('+HOMEP.terrain+' pièces d’or).';}catch(e){}return r;};}
