/* ================= LE MONDE DE L'ATELIER : lieux et portails =================
   Fiche « lieu » : {id, type:'lieu', nom, x, z, rayon, style (recette de décor automatique : campagne, foret, ruines,
   montagne, ferme… ou aucun), repere (pierre levée lumineuse)}. Le lieu rejoint la liste du jeu (nom affiché,
   quêtes, créatures et sorts de l'Atelier peuvent l'utiliser), avec son décor automatique et son repère.
   Fiche « portail » : {id, type:'portail', nom, ax, az, bx, bz, couleur} : deux arches reliées ; on entre dans l'une,
   on sort de l'autre (même entre la vallée et les Landes) : pour éviter les longs détours par les montagnes.
   Sources : src/contenu/monde.json + localStorage de l'Atelier. « ?test&lieu=<id> » : la partie de test commence là. */
const CONT_MKEY='aldermoor-atelier-monde';
function contWorldList(){const base=((window.__CONTENU||{}).monde||[]).slice();let loc=[];try{loc=JSON.parse(localStorage.getItem(CONT_MKEY)||'[]');}catch(e){}const by={};base.concat(loc).forEach(c=>{if(c&&c.id)by[c.id]=c;});return Object.values(by);}
const CWORLD=contWorldList();const CPORT=[];
const inWorld=(x,z)=>x>1500?Math.hypot(x-2000,z)<160:Math.hypot(x,z)<88;
// lieux : ajoutés à la liste dès le chargement (les autres contenus peuvent s'y référer)
CWORLD.filter(c=>c.type==='lieu'&&inWorld(c.x,c.z)&&!LOCBY[c.id]).forEach(c=>{const L={id:c.id,name:c.nom,x:c.x,z:c.z,r:c.rayon||10,spot:{x:c.x+2,z:c.z+2},region:c.x>1500?'landes':undefined,hidden:c.x>1500,atelier:true};LOCS.push(L);LOCBY[c.id]=L;LOC_STYLE[c.id]=c.style&&c.style!=='aucun'?c.style:null;});
function buildMonde(){dkMats();
 for(const c of CWORLD){if(c.type==='lieu'&&LOCBY[c.id]&&c.repere!==false){const y=gh(c.x,c.z);dkAt(c.x,c.z,0);dCyl('stone',0x8f8a80,0.6,0.8,0.4,0,0.2,0,8);dBox('stone',0x9a958a,0.5,2.2,0.4,0,1.5,0,0.1);
   const g=glow(0xbfe8ff,2,0.6);g.position.set(c.x,y+2.8,c.z);scene.add(g);addCol({x:c.x,z:c.z,r:0.8,h:y+2.6});}
  if(c.type==='portail'&&inWorld(c.ax,c.az)&&inWorld(c.bx,c.bz)){const col=c.couleur?parseInt(String(c.couleur).replace('#',''),16):0xb48cff;
   const P={c,a:portalArch(c.ax,c.az,c.bx,c.bz,col),b:portalArch(c.bx,c.bz,c.ax,c.az,col),cd:0};CPORT.push(P);}}
 dkFlush();} /* le décor automatique des nouveaux lieux est posé par buildDecor (11c), qui passe après */
function portalArch(x,z,tx,tz,col){const y=gh(x,z),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=Math.atan2(tx-x,tz-z);dkMats();
 const st=mat(0x8f8a80,{flatShading:true});for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(0.5,3.4,0.5),st);p.position.set(s*1.4,1.7,0);p.castShadow=true;g.add(p);}const top=new THREE.Mesh(new THREE.BoxGeometry(3.4,0.5,0.6),st);top.position.y=3.5;g.add(top);
 const v=new THREE.Mesh(new THREE.PlaneGeometry(2.3,3),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.45,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));v.position.y=1.6;g.add(v);
 const gl=glow(col,3.5,0.7);gl.position.y=1.8;g.add(gl);scene.add(g);addCol({x:x+Math.cos(g.rotation.y)*1.4,z:z-Math.sin(g.rotation.y)*1.4,r:0.35});addCol({x:x-Math.cos(g.rotation.y)*1.4,z:z+Math.sin(g.rotation.y)*1.4,r:0.35});return {x,z,g,v};}
{const _b=buildLandes;buildLandes=function(){const r=_b.apply(this,arguments);try{buildMonde();}catch(e){console.error(e);}return r;};}
function portTo(x,z){fade(()=>{const toL=x>1500,fromL=player.x>1500;player.x=x+rnd(-1,1);player.z=z+rnd(-1,1);player.y=gh(player.x,player.z)+0.2;player.vx=player.vz=player.vy=0;if(toL!==fromL&&typeof LANDES!=='undefined')LANDES.seen=true;sfx('learn');});}
function portTick(dt){if(!started||S.zone!=='monde')return;const t=performance.now()/1000;
 for(const P of CPORT){P.cd-=dt;for(const [A,B] of [[P.a,P.b],[P.b,P.a]]){A.v.material.opacity=0.35+0.15*Math.sin(t*3);if(Math.random()<dt*8)PA.emit(A.x+rnd(-1,1),gh(A.x,A.z)+rnd(0.3,3),A.z+rnd(-0.3,0.3),0,0.3,0,0xffffff,0.25,0.05,0.6,0,1);
  if(P.cd<=0&&Math.hypot(player.x-A.x,player.z-A.z)<1.3&&!FLY.on){P.cd=3;const a=Math.atan2(player.x-B.x,player.z-B.z);portTo(B.x+Math.sin(B.g.rotation.y)*2.5,B.z+Math.cos(B.g.rotation.y)*2.5);say('🌀 '+esc(P.c.nom||'Portail')+'.','sys');}}}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{portTick(dt);}catch(e){}return r;};}
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);const q=/[?&]pos=(-?[\d.]+),(-?[\d.]+)/.exec(location.search);if(q){const x=+q[1],z=+q[2];setTimeout(()=>{if(x>1500&&player.x<1500){landesGo(false);setTimeout(()=>bot0(x,z),1600);}else bot0(x,z);},1800);}const m=/[?&]lieu=([^&]+)/.exec(location.search);if(m){const L=LOCBY[decodeURIComponent(m[1])];if(L)setTimeout(()=>{if(L.x>1500&&player.x<1500){landesGo(false);setTimeout(()=>bot0(L.spot.x,L.spot.z),1600);}else bot0(L.spot.x,L.spot.z);say('🛠 Test de l’Atelier : <b>'+esc(L.name)+'</b>.','gm');},1800);}return r;};}
