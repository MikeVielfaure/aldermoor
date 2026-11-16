/* ================= LE FAMILIER =================
   Dans les Landes, un animal paisible (cerf, poule, panda, pingouin) peut être apprivoisé avec une friandise :
   2 ingrédients de cueillette (on donne ceux qu'on a le plus). Il te suit partout dans le monde (il t'attend dehors
   quand tu entres quelque part), ramasse les ingrédients autour de toi, et a un don selon l'espèce :
   cerf +12 % de vitesse à pied, panda vie qui revient 2× plus vite, pingouin +15 % de puissance de Glace,
   poule un œuf doré chaque matin (1 essence + 1 cristal). Un seul familier à la fois (fenêtre du personnage : le libérer).
   S.pet = {sp, name, cname, look, weak}. Le familier est une créature calme marquée data.pet (jamais blessée ni visée). */
const PET_SP={cerf:{re:/cerf/i,ic:'🦌',don:'+12 % de vitesse à pied',names:['Plume','Brindefeu','Sylve','Écorce']},poule:{re:/poule/i,ic:'🐔',don:'un œuf doré chaque matin (1 essence + 1 cristal)',names:['Cocotte','Pépite','Grain-d’Or','Plumette']},
 panda:{re:/panda/i,ic:'🐼',don:'ta vie revient 2× plus vite',names:['Brume','Bambou','Moufle','Nuage']},pingouin:{re:/pingouin/i,ic:'🐧',don:'+15 % de puissance de Glace',names:['Givre','Flocon','Banquise','Pingo']}};
const petSpOf=name=>Object.keys(PET_SP).find(k=>PET_SP[k].re.test(name||''));
const PET={e:null,herbT:4};
function petMul(el){return S&&S.pet&&S.pet.sp==='pingouin'&&el==='glace'?1.15:1;}
function treatItem(){const own=Object.keys(INGR).filter(k=>INGR[k].where&&INGR[k].where.length&&(S.inv[k]||0)>=2).sort((a,b)=>(S.inv[b]||0)-(S.inv[a]||0));return own[0]||null;}
// point d'action qui suit l'animal apprivoisable le plus proche
const TAME={x:1e9,z:1e9,e:null};
station({get x(){return TAME.x;},get z(){return TAME.z;},reach:2.6,hint:()=>{if(!TAME.e||S.pet)return null;const t=treatItem();return t?'Apprivoiser (2 '+INGR[t].n+')':'Apprivoiser : il faut 2 ingrédients de cueillette';},act:()=>tame(TAME.e)});
function tame(e){if(!e||S.pet||!ENT.includes(e))return;const t=treatItem();if(!t){say('Il te faut une friandise : 2 ingrédients de cueillette du même genre.','sys');return;}
 const sp=petSpOf(e.data.name);if(!sp)return;S.inv[t]-=2;const P=PET_SP[sp],name=pick(P.names);
 S.pet={sp,name,cname:e.data.name,look:e.data.look,weak:e.data.weak};const x=e.x,z=e.z;removeEnt(e);petSpawn(x,z);
 for(let i=0;i<40;i++)PA.emit(x+rnd(-.6,.6),gh(x,z)+rnd(0.5,2),z+rnd(-.6,.6),0,rnd(.5,1.5),0,i%2?0xff7aa0:0xffd0e0,0.3,0.05,rnd(.8,1.4),0,0.5);
 banner(P.ic+' '+name+' te suit !','Ton familier : '+P.don);sfx('learn');chron('J’ai apprivoisé '+name+' ('+sp+').');
 say(P.ic+' <b>'+esc(name)+'</b> mange ta friandise et décide de te suivre. Il ramassera les ingrédients autour de toi. Don : '+P.don+'.','gm');save();}
function petSpawn(x,z){if(!S.pet)return;const P=S.pet;const e=spawnCreatureAt(x,z,P.cname,P.weak,P.look,3,{calme:true,pet:true});e.ttl=Infinity;e.data.eliteChk=1;e.data.name=P.name;PET.e=e;return e;}
function petFree(){if(!S.pet)return;const n=S.pet.name;if(PET.e&&ENT.includes(PET.e)){const e=PET.e;e.data.pet=false;e.data.hx=e.x;e.data.hz=e.z;e.ttl=120;}PET.e=null;S.pet=null;say('🍃 '+esc(n)+' retourne à la vie sauvage.','sys');save();}
// le familier n'est jamais blessé, tué ni visé
{const _h=hurtCreature;hurtCreature=function(e){if(e&&e.data&&e.data.pet)return;return _h.apply(this,arguments);};}
{const _k=killCreature;killCreature=function(e){if(e&&e.data&&e.data.pet)return;return _k.apply(this,arguments);};}
{const _c=tgCands;tgCands=function(){return _c.apply(this,arguments).filter(c=>!(c.kind==='crea'&&c.ref.data.pet));};}
function petTick(dt){if(!started)return;
 // apprivoisement : l'animal paisible le plus proche (Landes)
 TAME.e=null;TAME.x=TAME.z=1e9;if(!S.pet&&S.zone==='monde'){let bd=3;for(const e of ENT){if(e.kind!=='creature'||!e.data.calme||e.data.pet||e.data.charmed||!petSpOf(e.data.name))continue;if(e.data.fleeT>0)continue;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<bd){bd=d;TAME.e=e;TAME.x=e.x;TAME.z=e.z;}}}
 if(!S.pet)return;
 if(!PET.e||!ENT.includes(PET.e)){if(S.zone==='monde'){const a=player.ry+Math.PI;petSpawn(player.x+Math.sin(a)*2.5,player.z+Math.cos(a)*2.5);}return;}
 const e=PET.e,D=e.data;e.obj.visible=S.zone==='monde';if(S.zone!=='monde')return;
 const a=player.ry+Math.PI+0.6,tx=player.x+Math.sin(a)*2.4,tz=player.z+Math.cos(a)*2.4,dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz);
 if(Math.hypot(player.x-e.x,player.z-e.z)>25){e.x=tx;e.z=tz;burst(e.x,gh(e.x,e.z)+1,e.z,0xffd0e0,12,2);}
 else if(d>0.6){const s=Math.min(d,dt*Math.min(12,1.5+d*2.2));e.x+=dx/d*s;e.z+=dz/d*s;e.obj.rotation.y=Math.atan2(dx,dz);}
 D.tx=e.x;D.tz=e.z;D.hx=e.x;D.hz=e.z;
 // il ramasse les ingrédients autour de toi
 PET.herbT-=dt;if(PET.herbT<=0){PET.herbT=5;const h=ENT.find(o=>o.kind==='herb'&&Math.hypot(o.x-player.x,o.z-player.z)<8);
  if(h&&h.data.ing){const id=h.data.ing;burst(h.x,gh(h.x,h.z)+0.8,h.z,0xfff1a0,14,2);removeEnt(h);addItem(id,1);say(PET_SP[S.pet.sp].ic+' '+esc(S.pet.name)+' te rapporte : <b>'+esc(INGR[id].n)+'</b>.','sys');}}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{petTick(dt);}catch(err){console.error(err);}return r;};}
// la poule pond chaque matin
{const _d=dawnTick;dawnTick=function(){const before=S.dawnDay;const r=_d.apply(this,arguments);if(S.dawnDay!==before&&S.pet&&S.pet.sp==='poule'){addItem('essence',1);addItem('cristal',1);setTimeout(()=>say('🥚 '+esc(S.pet.name)+' a pondu un <b>œuf doré</b> : +1 essence, +1 cristal.','sys'),2500);}return r;};}
// fenêtre du personnage
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);if(bookTab!=='perso')return;const b=$('#book-body'),d=document.createElement('div');d.className='it';
  if(S.pet){const P=PET_SP[S.pet.sp];d.innerHTML='<h4>'+P.ic+' '+esc(S.pet.name)+'<span class="badge">familier</span></h4><div class="mu">Don : '+P.don+'. Il ramasse les ingrédients autour de toi.</div><button class="tbtn" id="b-petfree" style="margin-top:8px;background:rgba(255,255,255,.1);color:var(--ink)">Lui rendre sa liberté</button>';}
  else d.innerHTML='<div class="mu">🐾 Pas de familier. Dans les Landes, approche-toi d’un cerf, d’une poule, d’un panda ou d’un pingouin avec 2 ingrédients de cueillette pour l’apprivoiser.</div>';
  b.appendChild(d);const fb=$('#b-petfree');if(fb)fb.onclick=()=>{petFree();renderBook();};};}
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object')r.familier=S.pet?(S.pet.name+' ('+S.pet.sp+') suit le joueur'):'aucun (on peut apprivoiser cerfs, poules, pandas, pingouins des Landes)';}catch(e){}return r;};}
