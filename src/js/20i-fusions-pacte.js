/* ================= FUSIONS (sorts à deux mains) ET PACTE DE LA LUNE NOIRE =================
   Fusions : deux sorts d'éléments différents lancés presque en même temps (< 0,7 s ; deux doigts sur deux sorts)
   créent un effet en plus, là où vise le second sort. 8 fusions à découvrir (S.fus), listées dans le Grimoire.
   Différent des combos (même endroit, à quelques secondes d'écart, 19-mecaniques).
   Pacte de la Lune Noire : deuxième quête interdite (étoile tombée ou oracle, la nuit, niveau 5+). À la fin, un choix :
   accepter le pacte (Siphon d'âme + Domination, karma −) ou le briser (Aube purificatrice + 1 point de talent, karma +). */
const FUSIONS={
 'feu+glace':{id:'vapeur',n:'Explosion de vapeur',d:'Le choc du chaud et du froid souffle tout autour du point visé.'},
 'eau+glace':{id:'prison',n:'Prison de glace',d:'Les créatures proches sont prises dans des colonnes de glace.'},
 'arcane+ombre':{id:'trounoir',n:'Trou noir',d:'Un vide aspire les créatures puis implose.'},
 'lumiere+vent':{id:'eclairs',n:'Tempête d’éclairs',d:'La foudre frappe les créatures autour du point visé.'},
 'nature+ombre':{id:'maudites',n:'Ronces maudites',d:'Des ronces noires entravent et empoisonnent.'},
 'eau+vent':{id:'typhon',n:'Typhon',d:'Une vague circulaire repousse tout ce qui t’entoure.'},
 'glace+lumiere':{id:'prisme',n:'Prisme',d:'La lumière se brise en rayons qui frappent plusieurs cibles.'},
 'lumiere+nature':{id:'benediction',n:'Bénédiction',d:'Ta vie et ta magie reviennent, la lumière brûle les créatures proches.'}};
const fusKey=(a,b)=>[a,b].sort().join('+');
const FUS={last:null,fx:[]};
const hostiles=(x,z,r)=>ENT.filter(e=>e.kind==='creature'&&!e.data.calme&&!e.data.charmed&&Math.hypot(e.x-x,e.z-z)<r);
// deux doigts : un second sort touché pendant que le premier est tenu part tout de suite
$('#ctrls').addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('.slot');if(!b||CHG.id===null||e.pointerId===CHG.id)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(started&&!anyModal())castSlot(+b.dataset.s);},true);
{const _cs=castSpell;castSpell=function(sp){const now=performance.now()/1000,L=FUS.last;
  if(sp&&L&&now-L.t<0.7&&L.el!==sp.el)player.cd=0; // le second sort d'une fusion n'attend pas
  const cd0=CD[sp&&sp.id];const r=_cs.apply(this,arguments);if(!sp||CD[sp.id]===cd0)return r; // sort pas lancé
  if(L&&now-L.t<0.7&&L.el!==sp.el){const F=FUSIONS[fusKey(L.el,sp.el)];if(F){FUS.last=null;fusion(F,sp);return r;}}
  FUS.last={el:sp.el,t:now};return r;};}
function fusPoint(sp){if(AIM.pt)return {x:AIM.pt.x,z:AIM.pt.z};const T=castTarget(sp.el,Math.sin(player.ry),Math.cos(player.ry),false);if(T&&T.x!=null&&Math.hypot(T.x-player.x,T.z-player.z)<30)return {x:T.x,z:T.z};return {x:player.x+Math.sin(player.ry)*7,z:player.z+Math.cos(player.ry)*7};}
function fusion(F,sp){const P=fusPoint(sp),x=P.x,z=P.z,y=gh(x,z);S.fus=S.fus||[];const first=!S.fus.includes(F.id);if(first){S.fus.push(F.id);gainXP(40);chron('Fusion découverte : '+F.n+'.');}
 banner((first?'Fusion découverte : ':'')+F.n,F.d);SHAKE=Math.max(SHAKE,0.5);HITSTOP=Math.max(HITSTOP,0.06);sfx('impact','arcane',x,z);
 const id=F.id;
 if(id==='vapeur'){shockRing(x,z,0xffffff,6);for(let i=0;i<60;i++){const a=Math.random()*TAU,v=rnd(3,10);PN.emit(x,y+0.5,z,Math.cos(a)*v,rnd(1,4),Math.sin(a)*v,0xeeeeee,0.8,2,rnd(1,2),-0.5,0.6,0.6);}
  hostiles(x,z,6).forEach(e=>{hurtCreature(e,'feu',x,z);if(ENT.includes(e))hurtCreature(e,'glace',x,z);if(!e.data.dragon&&!e.data.duel){const d=Math.hypot(e.x-x,e.z-z)||1;e.data.kx=(e.data.kx||0)+(e.x-x)/d*16;e.data.kz=(e.data.kz||0)+(e.z-z)/d*16;}});}
 else if(id==='prison'){hostiles(x,z,6.5).forEach(e=>{if(!e.data.dragon)e.data.frozen=7;hurtCreature(e,'glace',x,z);if(ENT.includes(e)&&!e.data.dragon){const g=new THREE.Group();g.position.set(e.x,gh(e.x,e.z),e.z);for(let k=0;k<6;k++){const a=k/6*TAU,m=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.3,rnd(1.6,2.4),5),mat(0xcff4ff,{emissive:0x5ab0e0,emissiveIntensity:0.5,transparent:true,opacity:0.85,flatShading:true}));m.position.set(Math.cos(a)*0.75,0.9,Math.sin(a)*0.75);m.rotation.z=rnd(-.2,.2);g.add(m);}scene.add(g);FUS.fx.push({o:g,t:7});}});ring(x,z,0xcff4ff,6.5,1);}
 else if(id==='trounoir'){const o=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),basic(0x0a0014));o.position.set(x,y+2,z);scene.add(o);const gl=glow(0xb48cff,6,0.8);gl.position.set(x,y+2,z);scene.add(gl);FUS.fx.push({o,gl,t:2.6,hole:{x,z,y}});}
 else if(id==='eclairs'){const T=hostiles(x,z,16).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z)).slice(0,6);if(!T.length)bolt(x,z);T.forEach((e,i)=>setTimeout(()=>{if(!ENT.includes(e))return;bolt(e.x,e.z);hurtCreature(e,'lumiere',e.x,e.z);},i*220));}
 else if(id==='maudites'){hostiles(x,z,6.5).forEach(e=>{e.data.rooted=Math.max(e.data.rooted||0,6);e.data.poison=4;e.data.poT=0.6;});for(let i=0;i<50;i++){const a=Math.random()*TAU,r=rnd(0.5,6);PN.emit(x+Math.cos(a)*r,y+0.2,z+Math.sin(a)*r,0,rnd(0.5,2),0,0x2a1a3a,0.5,1,rnd(1,2),0,0.4,0.8);}ring(x,z,0x6a3a8a,6.5,1);}
 else if(id==='typhon'){const px=player.x,pz=player.z;shockRing(px,pz,0x3a9ad8,10);for(let i=0;i<90;i++){const a=i/90*TAU;PA.emit(px+Math.cos(a)*1.5,player.y+0.5,pz+Math.sin(a)*1.5,Math.cos(a)*14,rnd(1,4),Math.sin(a)*14,i%2?0x7ad8ff:0xffffff,rnd(.3,.6),0.05,0.9,3,1);}
  hostiles(px,pz,10).forEach(e=>{hurtCreature(e,'eau',px,pz);if(ENT.includes(e)&&!e.data.dragon&&!e.data.duel){const d=Math.hypot(e.x-px,e.z-pz)||1;e.data.kx=(e.data.kx||0)+(e.x-px)/d*22;e.data.kz=(e.data.kz||0)+(e.z-pz)/d*22;}});if(typeof elemHit==='function')elemHit('eau',px,pz,8);}
 else if(id==='prisme'){hostiles(x,z,14).slice(0,4).forEach((e,i)=>{const cols=[0xff7a7a,0xffd27a,0x7affa0,0x7ad8ff];const ey=gh(e.x,e.z)+1.2;for(let k=0;k<=24;k++){const f=k/24;PA.emit(x+(e.x-x)*f,y+2+(ey-y-2)*f,z+(e.z-z)*f,0,0,0,cols[i],0.4,0.05,0.5,0,0);}hurtCreature(e,'lumiere',x,z);if(ENT.includes(e))hurtCreature(e,'glace',x,z);});flash(x,y+2,z,0xffffff,4,0.5);}
 else if(id==='benediction'){if(typeof VIE!=='undefined')VIE.hp=Math.min(VIE.max,VIE.hp+45);mana=Math.min(manaMax(),mana+35);for(let i=0;i<70;i++){const a=Math.random()*TAU,r=rnd(0.3,2.5);PA.emit(player.x+Math.cos(a)*r,player.y+rnd(0,0.5),player.z+Math.sin(a)*r,0,rnd(1,3),0,i%2?0xfff1a0:0x9cff8a,0.35,0.05,rnd(.8,1.5),0,0.5);}
  hostiles(player.x,player.z,6).forEach(e=>hurtCreature(e,'lumiere',player.x,player.z));}
 save();}
function bolt(x,z){const gy=gh(x,z);let px=x+rnd(-2,2),py=gy+30,pz=z+rnd(-2,2);for(let k=0;k<14;k++){const nx=x+(px-x)*0.6+rnd(-.8,.8),ny=py-(py-gy)/(14-k),nz=z+(pz-z)*0.6+rnd(-.8,.8);for(let j=0;j<4;j++){const f=j/4;PA.emit(px+(nx-px)*f,py+(ny-py)*f,pz+(nz-pz)*f,0,0,0,0xe8f4ff,0.5,0.05,0.25,0,0);}px=nx;py=ny;pz=nz;}
 flash(x,gy+2,z,0xcfe4ff,5,0.25);shockRing(x,z,0xe8f4ff,2);sfx('impact','lumiere',x,z);}
function fusTick(dt){for(let i=FUS.fx.length-1;i>=0;i--){const F=FUS.fx[i];F.t-=dt;
  if(F.hole){const H=F.hole,k=Math.max(0,F.t);F.o.scale.setScalar(0.6+Math.sin(performance.now()/90)*0.1+(2.6-k)*0.3);for(let j=0;j<4;j++){const a=Math.random()*TAU,r=rnd(4,11);PN.emit(H.x+Math.cos(a)*r,H.y+rnd(0.5,4),H.z+Math.sin(a)*r,-Math.cos(a)*r*1.2,0,-Math.sin(a)*r*1.2,0x3a1a6a,0.5,0.4,0.7,0,1,0.8);}
   hostiles(H.x,H.z,13).forEach(e=>{if(e.data.dragon||e.data.duel||e.data.wave)return;const d=Math.hypot(e.x-H.x,e.z-H.z);if(d>0.8){const s=Math.min(d-0.8,dt*7);e.x+=(H.x-e.x)/d*s;e.z+=(H.z-e.z)/d*s;}});
   if(F.t<=0){scene.remove(F.o);scene.remove(F.gl);shockRing(H.x,H.z,0xb48cff,7);SHAKE=Math.max(SHAKE,0.6);for(let j=0;j<80;j++){const a=Math.random()*TAU,v=rnd(4,12);PA.emit(H.x,H.y+2,H.z,Math.cos(a)*v,rnd(-2,5),Math.sin(a)*v,j%2?0xb48cff:0xffffff,rnd(.3,.6),0.05,rnd(.6,1.1),3,1);}
    hostiles(H.x,H.z,5).forEach(e=>{hurtCreature(e,'arcane',H.x,H.z);if(ENT.includes(e))hurtCreature(e,'ombre',H.x,H.z);});FUS.fx.splice(i,1);}continue;}
  if(F.t<=0){scene.remove(F.o);FUS.fx.splice(i,1);}}
 for(const e of ENT){if(e.kind!=='creature'||!(e.data.poison>0))continue;const D=e.data;D.poT-=dt;if(Math.random()<dt*8)PN.emit(e.x+rnd(-.4,.4),gh(e.x,e.z)+1,e.z+rnd(-.4,.4),0,rnd(.3,.8),0,0x4a1a5a,0.3,0.4,0.6,0,1,0.8);if(D.poT<=0){D.poT=1.2;D.poison--;hurtCreature(e,'ombre',e.x,e.z);}}}

/* ================= LE PACTE DE LA LUNE NOIRE ================= */
const PACTE_SP={
 siphon:{name:'Siphon d’âme',inc:'Anima Haurire',el:'ombre',form:'trait',cost:25,cd:4,desc:'Un fil d’ombre aspire la vie d’une créature : elle s’affaiblit, toi tu reprends vie et magie.'},
 domin:{name:'Domination',inc:'Imperium Noctis',el:'ombre',form:'util',cost:40,cd:30,desc:'Une créature passe sous ton contrôle pendant 25 s et se bat pour toi.'},
 aube:{name:'Aube purificatrice',inc:'Aurora Purgans',el:'lumiere',form:'zone',cost:45,cd:16,desc:'Une aurore éclate autour de toi : elle brûle les créatures et te soigne.'}};
const pacteSpell=k=>{const P=PACTE_SP[k];return {name:P.name,inc:P.inc,el:P.el,form:P.form,desc:P.desc,special:'p-'+k,legend:true,dark:k!=='aube',cost:P.cost,cd:P.cd,id:'pacte-'+k};};
function pacteStart(how){if(S.pacteQ)return;S.pacteQ=1;sfx('gong');
 say(how==='etoile'?'🌑 L’étoile pulse d’une lumière noire, et une voix glacée murmure : « Tu ramasses les étoiles… Viens chercher la <b>Lune Noire</b>. Le Plateau des Géants se souvient d’un pacte. »':'👁 L’oracle chuchote : « Une autre porte s’ouvre, plus sombre encore. Le <b>Plateau des Géants</b> garde le secret de la Lune Noire. »','gm');
 addQuest({title:'Le Pacte de la Lune Noire',desc:'Une voix venue des étoiles promet un pouvoir que nul maître n’enseigne.',giver:'brindille',dark:true,pacte:true,
  steps:[{kind:'goto',loc:'landes_plateau',text:'Suivre le murmure jusqu’au Plateau des Géants (Landes)'},{kind:'cast',loc:'landes_plateau',el:'ombre',text:'Réveiller les pierres géantes avec un sort d’Ombre'},
   {kind:'collect',loc:'marais',item:'une Larme de Lune Noire',text:'Recueillir une Larme de Lune Noire au Marais des Lucioles'},{kind:'goto',loc:'landes_nid',text:'Porter la Larme au Nid de la Vouivre et décider'}],reward:{xp:200}});
 chron('Une voix a parlé du Pacte de la Lune Noire.');}
// déclencheurs : une étoile ramassée (niveau 5+), ou l'oracle la nuit une fois la première quête interdite reçue
{const _st=starTake;starTake=function(T){const r=_st.apply(this,arguments);if(!S.pacteQ&&lvl()>=5)setTimeout(()=>pacteStart('etoile'),1500);return r;};}
{const _co=consultOracle;consultOracle=function(){if(S.darkQ&&!S.pacteQ&&lvl()>=5&&(S.time>=20*60||S.time<6*60))return pacteStart('oracle');return _co.apply(this,arguments);};}
{const _fq=finishQuest;finishQuest=function(q){const r=_fq.apply(this,arguments);if(q.pacte){S.pacte='choix';setTimeout(pacteChoice,1200);}return r;};}
function pacteChoice(){if(S.pacte!=='choix')return;openPick('🌑 La Lune Noire','Au-dessus du nid, la Larme flotte et s’ouvre comme un œil. La voix attend ta réponse. <i>Ce choix est définitif.</i>',[
 {t:'🌑 Accepter le pacte',s:'Tu apprends Siphon d’âme et Domination. Ton âme s’assombrit (karma −15).',fn:()=>pacteDone(true)},
 {t:'☀ Briser la Larme',s:'Tu apprends l’Aube purificatrice et gagnes 1 point de talent. Ton âme s’éclaire (karma +15).',fn:()=>pacteDone(false)}]);}
function pacteDone(dark){if(S.pacte!=='choix')return;$('#pick').classList.add('hidden');S.pacte=dark?'accepte':'brise';SHAKE=Math.max(SHAKE,0.7);
 if(dark){learnSpell(pacteSpell('siphon'));learnSpell(pacteSpell('domin'));karma(-15);banner('Pacte scellé','Siphon d’âme · Domination');for(let i=0;i<100;i++)PN.emit(player.x+rnd(-1,1),player.y+rnd(0,2.5),player.z+rnd(-1,1),rnd(-2,2),rnd(0,2),rnd(-2,2),0x1a0a2a,0.7,1.5,rnd(1,2),0,0.6,0.85);chron('J’ai accepté le Pacte de la Lune Noire.');}
 else{learnSpell(pacteSpell('aube'));S.relics=(S.relics||0)+1;karma(15);banner('La Larme se brise','Aube purificatrice · +1 point de talent');for(let i=0;i<100;i++){const a=Math.random()*TAU;PA.emit(player.x+Math.cos(a)*rnd(.5,2),player.y+rnd(0,3),player.z+Math.sin(a)*rnd(.5,2),0,rnd(1,4),0,i%2?0xfff1a0:0xffffff,0.35,0.05,rnd(1,2),0,0.5);}chron('J’ai brisé la Larme de Lune Noire.');}
 save();}
// les sorts
function castSiphon(sp){const e=legTarget('ombre',24),tp=new THREE.Vector3();player.H.p.tip.getWorldPosition(tp);if(!e){say('Le fil d’ombre ne trouve aucune âme à aspirer.','sys');return;}
 player.ry=Math.atan2(e.x-player.x,e.z-player.z);const ey=gh(e.x,e.z)+(e.data.dragon?e.data.y:1.2);for(let k=0;k<=36;k++){const f=k/36;PN.emit(tp.x+(e.x-tp.x)*f,tp.y+(ey-tp.y)*f+Math.sin(f*Math.PI)*0.6,tp.z+(e.z-tp.z)*f,0,0,0,k%2?0x2a1048:0x8a3aff,0.35,0.2,0.6,0,1,0.9);}
 hurtCreature(e,'ombre',player.x,player.z);if(ENT.includes(e)&&!e.data.dragon)hurtCreature(e,'ombre',player.x,player.z);if(typeof VIE!=='undefined')VIE.hp=Math.min(VIE.max,VIE.hp+15);mana=Math.min(manaMax(),mana+12);
 for(let i=0;i<20;i++){const f=Math.random();PA.emit(e.x+(player.x-e.x)*f,ey+(player.y+1.2-ey)*f,e.z+(player.z-e.z)*f,0,0.5,0,0xc89aff,0.3,0.05,0.6,0,0);}karma(-1);}
function castDomin(sp){const e=legTarget('ombre',18);if(!e||e.data.dragon||e.data.duel||e.data.wave){say('Aucune créature ne peut être dominée ici.','sys');return;}const D=e.data;D.charmed=25;D.wasCalme=!!D.calme;D.calme=true;D.ctar=null;
 for(let i=0;i<60;i++){const a=Math.random()*TAU;PN.emit(e.x+Math.cos(a)*0.8,gh(e.x,e.z)+rnd(0,2),e.z+Math.sin(a)*0.8,0,rnd(.5,1.5),0,0x8a3aff,0.5,0.6,1,0,0.6,0.9);}say('🌑 <b>'+esc(D.name)+'</b> plie le genou : elle se bat pour toi pendant 25 s.','gm');karma(-2);}
function castAube(sp){const R=11;shockRing(player.x,player.z,0xfff1a0,R);flash(player.x,player.y+3,player.z,0xfff1a0,6,0.8);SHAKE=Math.max(SHAKE,0.5);
 for(let i=0;i<140;i++){const a=i/140*TAU;PA.emit(player.x+Math.cos(a)*1,player.y+0.6,player.z+Math.sin(a)*1,Math.cos(a)*rnd(8,14),rnd(1,5),Math.sin(a)*rnd(8,14),i%3?0xfff1a0:0xffffff,rnd(.4,.7),0.05,1,2,1);}
 hostiles(player.x,player.z,R).forEach(e=>{hurtCreature(e,'lumiere',player.x,player.z);if(ENT.includes(e)&&!e.data.dragon)hurtCreature(e,'lumiere',player.x,player.z);});if(typeof VIE!=='undefined')VIE.hp=Math.min(VIE.max,VIE.hp+30);if(typeof elemHit==='function')elemHit('lumiere',player.x,player.z,R);}
{const _t=doTrait;doTrait=function(sp){if(sp&&sp.special==='p-siphon')return castSiphon(sp);return _t.apply(this,arguments);};}
{const _u=doUtil;doUtil=function(sp){if(sp&&sp.special==='p-domin')return castDomin(sp);return _u.apply(this,arguments);};}
{const _z=doZone;doZone=function(sp){if(sp&&sp.special==='p-aube')return castAube(sp);return _z.apply(this,arguments);};}
// une créature dominée attaque les autres
function dominTick(dt){for(const e of ENT){if(e.kind!=='creature'||!(e.data.charmed>0))continue;const D=e.data;D.charmed-=dt;
  if(Math.random()<dt*10)PN.emit(e.x+rnd(-.5,.5),gh(e.x,e.z)+rnd(0.5,1.8),e.z+rnd(-.5,.5),0,rnd(.3,.8),0,0x8a3aff,0.35,0.4,0.6,0,1,0.85);
  if(D.charmed<=0){D.charmed=0;D.calme=D.wasCalme;say('🌑 '+esc(D.name)+' se libère de ton emprise !','sys');continue;}
  if(!D.ctar||!ENT.includes(D.ctar)||Math.hypot(D.ctar.x-e.x,D.ctar.z-e.z)>16){D.ctar=null;let bd=16;for(const o of ENT){if(o===e||o.kind!=='creature'||o.data.calme||o.data.charmed||o.data.duel)continue;const d=Math.hypot(o.x-e.x,o.z-e.z);if(d<bd){bd=d;D.ctar=o;}}}
  const T=D.ctar;if(T){D.tx=T.x;D.tz=T.z;D.hx=T.x;D.hz=T.z;D.catk=(D.catk||0)-dt;if(Math.hypot(T.x-e.x,T.z-e.z)<1.8&&D.catk<=0){D.catk=1;hurtCreature(T,D.look,e.x,e.z);burst(T.x,gh(T.x,T.z)+1,T.z,0x8a3aff,10,3);}}
  else{D.tx=player.x+rnd(-2,2);D.tz=player.z+rnd(-2,2);}}}
{const _w=world4Tick;world4Tick=function(dt){const r=_w.apply(this,arguments);try{fusTick(dt);dominTick(dt);}catch(e){console.error(e);}return r;};}
// Grimoire : les fusions ; fenêtre du personnage : décision du pacte en attente
{const _r=renderBook;renderBook=function(){_r.apply(this,arguments);const b=$('#book-body');
  if(bookTab==='sorts'){const d=document.createElement('div');d.className='it';d.style.borderColor='rgba(180,140,255,.5)';const known=S.fus||[];
   d.innerHTML='<h4>🤲 Fusions<span class="badge">'+known.length+'/'+Object.keys(FUSIONS).length+'</span></h4><div class="mu" style="margin-bottom:4px">Deux sorts d’éléments différents lancés presque en même temps (deux doigts sur deux sorts).</div>'+
    Object.entries(FUSIONS).map(([k,F])=>{const ok=known.includes(F.id),els=k.split('+').map(e=>ELEM[e].n).join(' + ');return '<div style="margin:4px 0;'+(ok?'':'opacity:.7')+'">'+(ok?'🤲 <b>'+esc(F.n)+'</b> <span class="mu">('+els+') — '+esc(F.d)+'</span>':'❔ <span class="mu">'+els+'… ?</span>')+'</div>';}).join('');
   b.insertBefore(d,b.children[1]||null);}
  if(bookTab==='perso'&&S.pacte==='choix'){const d=document.createElement('div');d.className='it';d.innerHTML='<button class="tbtn" id="b-pacte">🌑 La Lune Noire attend ta décision</button>';b.insertBefore(d,b.firstChild);$('#b-pacte').onclick=()=>{$('#book').classList.add('hidden');pacteChoice();};}};}
{const _wc=worldCtx;worldCtx=function(){const r=_wc.apply(this,arguments);try{if(r&&typeof r==='object'){r.fusions='Deux sorts d’éléments différents lancés presque ensemble créent une fusion (vapeur, prison de glace, trou noir, éclairs, ronces maudites, typhon, prisme, bénédiction). Découvertes : '+((S.fus||[]).join(', ')||'aucune')+'.';r.pacte=S.pacte?('Pacte de la Lune Noire : '+(S.pacte==='accepte'?'accepté (sorts interdits Siphon d’âme et Domination)':S.pacte==='brise'?'refusé (Aube purificatrice)':'décision en attente')):'pas encore commencé';}}catch(e){}return r;};}
