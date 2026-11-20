/* ================= SORTS CRÉÉS DANS L'ATELIER =================
   Fiche : {id, nom, incantation, description, element, forme:'trait'|'zone'|'util', cout, recharge, puissance (×),
   effet, obtention:'depart'|'parchemin', lieu}. Le sort s'appuie sur le sort de base de l'élément et ajoute son effet :
   - attaque (trait) : explosion (à l'impact), multi (3 projectiles en éventail), rebond (saute de créature en créature) ;
   - zone : grande (rayon ×1,6), attire (aspire les créatures), souffle (les repousse loin) ;
   - utilitaire : plateforme (briques de cristal sous les pieds / au point visé), teleport (jusqu'au point visé, 22 m),
     soin (+40 vie), bouclier (petite bulle Proteggo), bond (grand saut plané).
   Obtention : « départ » = connu dès le lancement ; « parchemin » = un parchemin apparaît chaque jour au lieu choisi.
   Sources : src/contenu/sorts.json + localStorage de l'Atelier. « ?test&sort=<id> » : sort placé en 1er emplacement. */
const CONT_SKEY='aldermoor-atelier-sorts';
function contSpellsList(){const base=((window.__CONTENU||{}).sorts||[]).slice();let loc=[];try{loc=JSON.parse(localStorage.getItem(CONT_SKEY)||'[]');}catch(e){}const by={};base.concat(loc).forEach(c=>{if(c&&c.id)by[c.id]=c;});return Object.values(by);}
const CSPELLS=contSpellsList();
const cSpell=c=>({name:c.nom,inc:c.incantation||c.nom,el:c.element,form:c.forme,desc:c.description||'',special:'c-'+c.id,legend:true,cost:c.cout||20,cd:c.recharge||1,id:'c-'+c.id,cfg:c});
const cfgOf=sp=>sp&&sp.special&&sp.special.startsWith('c-')?(CSPELLS.find(c=>'c-'+c.id===sp.special)||sp.cfg):null;
const plain=sp=>Object.assign({},sp,{special:undefined,legend:undefined});
// attaque
{const _t=doTrait;doTrait=function(sp){const c=cfgOf(sp);if(!c)return _t.apply(this,arguments);const n0=PROJ.length;CPOW=c.puissance||1;try{_t.call(this,plain(sp));}finally{CPOW=1;}
  const news=PROJ.slice(n0);news.forEach(p=>{p.cfx=c.effet;p.cpow=c.puissance||1;p.chain=c.effet==='rebond'?3:0;p.hitList=[];});
  if(c.effet==='multi')news.forEach(p=>{[-0.28,0.28].forEach(a=>{const ca=Math.cos(a),sa=Math.sin(a),o=p.o.clone();scene.add(o);PROJ.push(Object.assign({},p,{o,vx:p.vx*ca-p.vz*sa,vz:p.vx*sa+p.vz*ca,ht:null,light:null,cfx:null}));});});};}
// impact des projectiles « spéciaux » : on regarde ceux qui ont disparu pendant la mise à jour
{const _u=updProj;updProj=function(dt){const before=PROJ.filter(p=>p.cfx);const r=_u.apply(this,arguments);for(const p of before){if(PROJ.includes(p))continue;const o=p.o.position;cImpact(p,o.x,o.y,o.z);}return r;};}
function cImpact(p,x,y,z){const el=p.el;
 if(p.cfx==='explosion'){const R=4*Math.min(2,p.cpow||1);shockRing(x,z,ELEM[el].c,R);SHAKE=Math.max(SHAKE,0.4);for(let i=0;i<50;i++){const a=Math.random()*TAU,v=rnd(3,9);PA.emit(x,y,z,Math.cos(a)*v,rnd(1,5),Math.sin(a)*v,i%2?ELEM[el].c:0xffffff,rnd(.3,.6),0.05,rnd(.5,.9),4,1);}
  ENT.filter(e=>e.kind==='creature'&&!e.data.calme&&!e.data.pet&&Math.hypot(e.x-x,e.z-z)<R).forEach(e=>hurtCreature(e,el,x,z));if(typeof elemHit==='function')elemHit(el,x,z,R);}
 if(p.cfx==='rebond'&&p.chain>0){let best=null,bd=11;for(const e of ENT){if(e.kind!=='creature'||e.data.calme||e.data.pet||p.hitList.includes(e.id))continue;const d=Math.hypot(e.x-x,e.z-z);if(d<bd&&d>0.5){bd=d;best=e;}}
  const hit=ENT.find(e=>e.kind==='creature'&&Math.hypot(e.x-x,e.z-z)<1.6);if(hit)p.hitList.push(hit.id);
  if(best){const ty=gh(best.x,best.z)+1.2,dx=best.x-x,dy=ty-y,dz=best.z-z,L=Math.hypot(dx,dy,dz)||1,sp=22,o=p.o.clone();o.position.set(x,y,z);scene.add(o);
   PROJ.push({o,el,vx:dx/L*sp,vy:dy/L*sp,vz:dz/L*sp,life:L/sp+0.3,grav:0,c:ELEM[el].c,light:null,t:0,ht:{kind:'crea',ref:best},tp:null,cfx:'rebond',chain:p.chain-1,hitList:p.hitList.concat(best.id),cpow:p.cpow});flash(x,y,z,ELEM[el].c,2,0.2);}}}
// zone
{const _z=doZone;doZone=function(sp){const c=cfgOf(sp);if(!c)return _z.apply(this,arguments);CPOW=(c.puissance||1)*(c.effet==='grande'?1.6:1);try{_z.call(this,plain(sp));}finally{CPOW=1;}
  if(c.effet==='attire'||c.effet==='souffle'){const s=c.effet==='attire'?-1:1;ENT.forEach(e=>{if(e.kind!=='creature'||e.data.calme||e.data.pet||e.data.dragon||e.data.duel)return;const d=Math.hypot(e.x-player.x,e.z-player.z);if(d<12&&d>0.5){e.data.kx=(e.data.kx||0)+s*(e.x-player.x)/d*(s<0?Math.min(14,d*1.6):18);e.data.kz=(e.data.kz||0)+s*(e.z-player.z)/d*(s<0?Math.min(14,d*1.6):18);}});
   for(let i=0;i<60;i++){const a=i/60*TAU,r=s<0?10:1;PA.emit(player.x+Math.cos(a)*r,player.y+0.6,player.z+Math.sin(a)*r,Math.cos(a)*8*s,0.5,Math.sin(a)*8*s,ELEM[c.element].c,0.35,0.05,0.8,0,1);}}};}
// utilitaire
{const _u=doUtil;doUtil=function(sp){const c=cfgOf(sp);if(!c)return _u.apply(this,arguments);const col=ELEM[c.element].c,P=utilPt(22);
  if(c.effet==='plateforme'){const air=FLY.on||!player.grounded,cx=P&&!air?P.x:player.x,cz=P&&!air?P.z:player.z,cy=P&&!air?gh(cx,cz):player.y-0.95;
   for(const [dx,dz] of [[0,0],[0.9,0],[-0.9,0],[0,0.9],[0,-0.9]]){const b={id:++BRKN,t:'cristal',x:Math.round((cx+dx)/0.9)*0.9,y:cy,z:Math.round((cz+dz)/0.9)*0.9,rot:0,hp:BRK_T.cristal.hp,vx:0,vy:0,vz:0,lev:0,awake:false};BRK.push(b);brkCol(b);}brkSync();BRKSAVE=1;sfx('shield');}
  else if(c.effet==='teleport'){const [dx,dz]=fwd();let tx=P?P.x:player.x+dx*14,tz=P?P.z:player.z+dz*14;if(!isFree({x:tx,z:tz},0.4)){tx=player.x+dx*6;tz=player.z+dz*6;}
   for(let i=0;i<30;i++)PA.emit(player.x+rnd(-.4,.4),player.y+rnd(0,2),player.z+rnd(-.4,.4),0,rnd(.5,2),0,col,0.35,0.05,0.7,0,1);player.x=tx;player.z=tz;player.y=Math.max(player.y,gh(tx,tz));player.vx=player.vz=0;flash(tx,player.y+1,tz,col,3,0.4);}
  else if(c.effet==='soin'){if(typeof VIE!=='undefined')VIE.hp=Math.min(VIE.max,VIE.hp+40*(c.puissance||1));for(let i=0;i<40;i++){const a=Math.random()*TAU;PA.emit(player.x+Math.cos(a)*0.6,player.y+rnd(0,2),player.z+Math.sin(a)*0.6,0,rnd(1,2),0,col,0.3,0.05,1,0,0.5);}sfx('learn');}
  else if(c.effet==='bouclier'){CHGNOW=0;const S0={id:++PSHN,x:player.x,y:player.y,z:player.z,str:45*(c.puissance||1),max:false,hitT:0.6};pshLook(S0);PSH.push(S0);sfx('shield');}
  else{player.vy=16*Math.min(1.5,c.puissance||1);player.grounded=false;player.glide=3;for(let i=0;i<30;i++)PA.emit(player.x,player.y+0.2,player.z,rnd(-2,2),rnd(1,3),rnd(-2,2),col,0.3,0.05,0.8,0,1);}};}
// obtention, test
function cSpellsGive(){CSPELLS.forEach(c=>{if(c.obtention==='depart'&&!S.spells.some(s=>s.special==='c-'+c.id))S.spells.push(cSpell(c));});}
{const _sg=startGame;startGame=function(){const r=_sg.apply(this,arguments);try{cSpellsGive();CSPELLS.forEach(c=>{if(c.obtention==='parchemin'&&LOCBY[c.lieu]&&!S.spells.some(s=>s.special==='c-'+c.id))spawnScroll(c.lieu,cSpell(c),1440);});const m=/[?&]sort=([^&]+)/.exec(location.search);if(m){const c=CSPELLS.find(c=>c.id===decodeURIComponent(m[1]));if(c){if(!S.spells.some(s=>s.special==='c-'+c.id))S.spells.push(cSpell(c));S.slots[0]='c-'+c.id;renderSlots();setTimeout(()=>say('🛠 Test de l’Atelier : <b>'+esc(c.nom)+'</b> est dans ton 1er emplacement.','gm'),1500);}}}catch(e){console.error(e);}return r;};}
{const _n=nightfall;nightfall=function(){const r=_n.apply(this,arguments);try{CSPELLS.forEach(c=>{if(c.obtention==='parchemin'&&LOCBY[c.lieu]&&!S.spells.some(s=>s.special==='c-'+c.id))spawnScroll(c.lieu,cSpell(c),1440);});}catch(e){}return r;};}
