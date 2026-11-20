/* ================= CONSTRUO EN ROULETTE + APERÇU LUMINEUX =================
   Lancer Construo transforme les 6 boutons de sort en roulette de constructions (5 par page, le 6e = page suivante).
   1er toucher : choisir → une lumière verte montre où l'objet sera posé ; elle suit les déplacements et la caméra.
   2e toucher sur le même bouton : poser. ⇄ (ou relancer Construo) : quitter le mode construction. */
const BMODE={on:false,page:0,sel:null,ghost:null};
const BITEMS=[['b:pierre','🧱','Brique'],['b:bois','🪵','Bois'],['b:cristal','💎','Cristal'],['b:poutre','➖','Poutre'],['b:dalle','⬛','Dalle'],
 ['w:pierre','🏰','Mur'],['w:bois','🚪','Mur bois'],['w:palissade','🪓','Palissade'],['w:porte','🚪','Porte'],['w:tour','🗼','Tour'],['w:plateforme','🟫','Plateforme'],['w:cristal','🔷','Mur cristal'],['x:inc','✨','Incassable']];
const XITEMS={inc:{n:'Rendre incassable (zone de 5 m)',w:5,h:0.15,d:5,cost:{essence:1,cristal:1}}};
/* incassabilité : les briques et constructions autour du point visé (1 essence + 1 cristal par lot de 6) */
function incAt(Q){const L=BRK.filter(b=>!b.inc&&Math.hypot(b.x-Q.x,b.z-Q.z)<2.6),P=BLD.filter(p=>!p.ruin&&!p.inc&&Math.hypot(p.x-Q.x,p.z-Q.z)<3);const lots=Math.ceil((L.length+P.length*3)/6);
 if(!lots){say('✨ Rien à enchanter ici (vise tes briques ou tes constructions).','sys');return;}if((S.inv.essence||0)<lots||(S.inv.cristal||0)<lots){say('✨ Il faut '+lots+' essence(s) et '+lots+' cristal(aux).','sys');return;}
 S.inv.essence-=lots;S.inv.cristal-=lots;L.forEach(b=>{b.inc=true;burst(b.x,b.y+0.5,b.z,0xffd24a,6,2);});P.forEach(p=>{p.inc=true;p.burn=0;p.hp=BLD_T[p.t].hp;bldUnmake(p);bldMake(p);});brkSync();BRKSAVE=1;if(P.length)bldSave();floatAt(Q.x,Q.z,'✨ '+(L.length+P.length)+' incassable(s)','#ffd24a');sfx('learn');}
const bItem=k=>{const [t,n]=k.split(':');return t==='b'?BRK_T[n]:t==='x'?XITEMS[n]:t==='m'?MITEMS[n]:BLD_T[n]; /* m : minage (20zb) */};
function bmodeSet(on){BMODE.on=on;BMODE.page=0;BMODE.sel=null;if(BMODE.ghost)BMODE.ghost.visible=false;document.querySelectorAll('.slot').forEach(b=>b.dataset.k='');renderSlots();if(on)say('🧱 Mode construction : touche un objet pour voir où il ira, touche-le encore pour le poser. ⇄ pour quitter.','sys');}
{const _c=castConstruo;castConstruo=function(sp){if(S.zone!=='monde')return _c.apply(this,arguments);bmodeSet(!BMODE.on);};}
{const _r=renderSlots;renderSlots=function(){if(!BMODE||!BMODE.on)return _r.apply(this,arguments);
  document.querySelectorAll('.slot').forEach(b=>{const i=+b.dataset.s;b.classList.remove('hidden','empty','low');b.style.borderColor='#9fffb0';
   if(i===5){b.innerHTML='<span class="ic">➡</span>';b.title='Page suivante';return;}const it=BITEMS[BMODE.page*5+i];if(!it){b.innerHTML='';b.classList.add('empty');return;}
   const T=bItem(it[0]),ok=T.mana?mana>=T.mana:Object.entries(T.cost).every(([k,n])=>(S.inv[k]||0)>=n);b.innerHTML='<span class="ic">'+it[1]+'</span><span class="fm" style="color:#fff">'+(BMODE.sel===it[0]?'✔':'')+'</span>';b.title=T.n;b.classList.toggle('low',!ok);
   b.style.boxShadow=BMODE.sel===it[0]?'0 0 16px #9fffb0':'';});};}
// toucher pendant le mode construction (avant la charge des sorts, 20g)
document.addEventListener('pointerdown',e=>{if(!BMODE.on||!started||anyModal())return;const b=e.target.closest&&e.target.closest('.slot,#b-set');if(!b)return;e.preventDefault();e.stopPropagation();
 if(b.id==='b-set'){bmodeSet(false);return;}const i=+b.dataset.s;if(i===5){BMODE.page=(BMODE.page+1)%Math.ceil(BITEMS.length/5);BMODE.sel=null;renderSlots();sfx('click');return;}
 const it=BITEMS[BMODE.page*5+i];if(!it)return;if(BMODE.sel!==it[0]){BMODE.sel=it[0];sfx('click');renderSlots();floatAt(player.x,player.z,bItem(it[0]).n,'#9fffb0');return;}
 const [t,n]=it[0].split(':');BLDQ=bldTarget();if(t==='x')incAt(BLDQ);else if(t==='m')mineAt(n,BLDQ);else if(t==='b')brkPlace(n);else bldPlace(n);renderSlots();},true);
// aperçu lumineux
function bghost(){if(BMODE.ghost)return BMODE.ghost;const g=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x9fffb0,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.y=0.5;g.add(m);
 const w=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0xd8ffe0,wireframe:true,transparent:true,opacity:0.7}));w.position.y=0.5;g.add(w);const gl=glow(0x9fffb0,2.5,0.6);gl.position.y=0.5;g.add(gl);g.visible=false;scene.add(g);BMODE.ghost=g;return g;}
function bmodeTick(){if(!BMODE.on)return;if(S.zone!=='monde'){bmodeSet(false);return;}const g=bghost();if(!BMODE.sel){g.visible=false;return;}
 const [t,n]=BMODE.sel.split(':'),T=bItem(BMODE.sel),Q=bldTarget(),q=Math.abs(Math.sin(Q.rot))>0.5;let x,z,y;
 if(t==='x'){x=Q.x;z=Q.z;y=gh(x,z);}else if(t==='b'){x=Math.round(Q.x/0.9)*0.9;z=Math.round(Q.z/0.9)*0.9;const hw=(q?T.d:T.w)/2,hd=(q?T.w:T.d)/2;y=T.float&&Q.air?Q.y:brkFloor(x,z,hw,hd,1e9,null);}
 else if(T.air&&Q.air){x=Q.x;z=Q.z;y=Q.y;}else{x=Math.round(Q.x/1.5)*1.5;z=Math.round(Q.z/1.5)*1.5;y=gh(x,z);}
 g.visible=true;g.position.set(x,y,z);g.rotation.y=Q.rot;g.children[0].scale.set(T.w,T.h,T.d);g.children[1].scale.set(T.w,T.h,T.d);g.children[0].position.y=g.children[1].position.y=T.h/2;g.children[2].position.y=T.h/2;
 g.children[0].material.opacity=0.22+0.12*Math.sin(performance.now()/200);}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{bmodeTick();}catch(e){}return r;};}
