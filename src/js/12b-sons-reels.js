/* ================= VRAIS SONS, MUSIQUES ET AMBIANCES (fichiers CC0, src/assets) =================
   Couche par-dessus le moteur synthétisé : si un fichier existe pour un effet, il est joué ; sinon (fichier
   absent, pas encore chargé, artifact claude.ai…) la synthèse d'origine prend le relais. Liste des fichiers :
   assets/sons/sons.json (écrit par tools/assets.mjs). Volume réglable dans Options (musique / effets). */
const SMP={list:null,buf:{},wait:{},mus:{cur:null,src:null,g:null},amb:{},asked:false};
const SMP_VOL={click:0.35,step_herbe:0.3,step_pierre:0.3,step_bois:0.32,step_neige:0.3,jump:0.35,land:0.45,hitC:0.6,hurt:0.6,pick:0.55,chest:0.7,brew:0.6,door:0.6,gong:0.6,book:0.5,coins:0.5,newq:0.6,learn:0.75,shield:0.5};
function smpLoad(dir,file){const k=dir+'/'+file;if(SMP.buf[k])return Promise.resolve(SMP.buf[k]);if(SMP.wait[k])return SMP.wait[k];
 return SMP.wait[k]=fetch(MDL.base+k).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer();}).then(b=>new Promise((res,rej)=>AU.ctx.decodeAudioData(b,res,rej))).then(buf=>{SMP.buf[k]=buf;return buf;});}
function smpInit(){if(SMP.asked||!AU.ctx)return;SMP.asked=true;
 fetch(MDL.base+'sons/sons.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(j=>{SMP.list=j;
  for(const g in j.sons)j.sons[g].forEach(f=>smpLoad('sons',f).catch(()=>{}));}).catch(()=>{}); /* pas de fichiers : sons synthétisés */}
// joue un effet ; renvoie true si un fichier a été joué
function smpPlay(g,x,z,vol,rev){const L=SMP.list&&SMP.list.sons[g];if(!L)return false;const f=pick(L),b=SMP.buf['sons/'+f];if(!b)return false;
 const s=spat(x,z);if(s.g<0.01)return true;const ctx=AU.ctx,src=ctx.createBufferSource(),gn=ctx.createGain();src.buffer=b;src.playbackRate.value=rnd(0.94,1.06);
 gn.gain.value=(SMP_VOL[g]||0.8)*s.g*(vol==null?1:vol);src.connect(gn);gn.connect(outNode(s.p,AU.fx,rev||0));src.start();return true;}
function smpSfx(name,a){if(!SMP.list)return false;
 switch(name){
  case 'step':{const [surf,x,z]=a;if(surf==='eau')return false;const neige=(S.weather&&S.weather.w==='neige')||typeof snowCover!=='undefined'&&snowCover>0.4;
   return smpPlay(surf==='pierre'?'step_pierre':surf==='bois'?'step_bois':neige?'step_neige':'step_herbe',x,z);}
  case 'land':return smpPlay('land',null,null,clamp(a[0]||1,0.3,1.4));
  case 'cast':{const [el,form,x,z]=a;return smpPlay('cast_'+el,x,z,form==='zone'?1.15:form==='util'?0.85:0.8,0.25);}
  case 'impact':{const [el,x,z]=a;if(!sfxOK('imp'+el,60))return true;return smpPlay('impact_'+el,x,z,0.9,0.2);}
  case 'hitC':{if(!sfxOK('hitc',70))return true;return smpPlay('hitC',a[0],a[1]);}
  case 'chest':case 'brew':smpPlay(name);return false; // le fichier ET la petite mélodie d'origine
  case 'click':case 'jump':case 'learn':case 'newq':case 'pick':case 'hurt':case 'gong':case 'shield':case 'door':return smpPlay(name,null,null,1,name==='learn'||name==='gong'?0.5:0);
 }
 return false;}
{const _s=sfx;sfx=function(name,...a){if(!AU.ready||AU.mute)return;try{if(smpSfx(name,a))return;}catch(e){}return _s.apply(this,[name,...a]);};}
/* ---------- musique : une boucle par ambiance du jeu, fondu enchaîné ---------- */
function smpMood(){if(!started)return 'titre';const m=moodNow();if(m==='jour'&&S.zone==='monde'&&S.locId==='village')return 'village';return m;}
function smpMusic(){if(!SMP.list||!AU.ready)return false;const mood=smpMood(),file=SMP.list.musique[mood];if(!file)return false;
 const buf=SMP.buf['musique/'+file];if(!buf){smpLoad('musique',file).catch(()=>{});return !!SMP.mus.cur;} // en attendant : on garde ce qui joue
 if(SMP.mus.cur===mood)return true;const ctx=AU.ctx,t=ctx.currentTime;
 if(SMP.mus.src){const o=SMP.mus;o.g.gain.cancelScheduledValues(t);o.g.gain.setValueAtTime(o.g.gain.value,t);o.g.gain.linearRampToValueAtTime(0,t+2.5);try{o.src.stop(t+2.6);}catch(e){}}
 const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=buf;src.loop=true;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.9,t+2.5);src.connect(g);g.connect(AU.mus);src.start(t);
 SMP.mus={cur:mood,src,g};return true;}
{const _mt=musTick;musTick=function(){if(smpMusic())return;return _mt.apply(this,arguments);};}
setInterval(()=>{if(!started&&AU.ready){smpInit();smpMusic();}},700); // musique de l'écran d'accueil
/* ---------- ambiances : boucles dont le volume suit le lieu, l'heure et la météo ---------- */
function smpAmb(){if(!SMP.list||!AU.ready)return;const ctx=AU.ctx,t=ctx.currentTime,z=S.zone||'monde',W=(S.weather&&S.weather.w)||'clair',out=z==='monde';
 const near=out&&(riverDist(player.x,player.z)<10||Math.hypot(player.x-LAKE.x,player.z-LAKE.z)<LAKE.r+9);
 const want={oiseaux:out&&nightK<0.45&&!['pluie','orage','neige'].includes(W)?0.55:0,grillons:out&&nightK>0.55&&W!=='pluie'&&W!=='orage'?0.45:0,
  feu:z==='auberge'||z==='salle'?0.6:0,riviere:near?0.5:0,vent:out&&(W==='orage'||W==='neige'||player.y>9)?0.5:0};
 for(const k in want){const file=SMP.list.ambiance[k];if(!file)continue;let A=SMP.amb[k];
  if(!A){if(!want[k])continue;const buf=SMP.buf['musique/'+file];if(!buf){smpLoad('musique',file).catch(()=>{});continue;}
   const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=buf;src.loop=true;g.gain.value=0;src.connect(g);g.connect(AU.amb);src.start(t,Math.random()*buf.duration);A=SMP.amb[k]={src,g};}
  A.g.gain.setTargetAtTime(want[k],t,1.2);}}
{const _at=ambTick;ambTick=function(dt){smpAmb();return _at.apply(this,arguments);};}
// les chants d'oiseaux et grillons synthétisés se taisent quand les vrais sons sont là
{const _b=bird;bird=function(){if(SMP.amb.oiseaux)return;return _b.apply(this,arguments);};}
{const _c=cricket;cricket=function(){if(SMP.amb.grillons)return;return _c.apply(this,arguments);};}
{const _i=auInit;auInit=function(){const r=_i.apply(this,arguments);if(AU.ctx)smpInit();return r;};}
