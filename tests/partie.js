// Partie complète jouée par un bot : dialogue, tour des lieux, parchemins, sorts, intérieurs, souterrain,
// duel, carte, options, nuit, sauvegarde et rechargement. Doit finir par « OK » et ERR [].
const {launch,sl}=require('./lib');const BOT=require('./bot');
(async()=>{const {b,p,errs,logs,ev}=await launch();
await p.type('#name','Mike');await p.click('#b-new');await sl(1500);
await ev(BOT);
const closeAll='closeDlg();$("#book").classList.add("hidden");closePick();$("#map").classList.add("hidden");$("#opts").classList.add("hidden");';
// talk & quests
let n=await ev('(()=>{const n=NPCOBJ("lila");return [n.x,n.z]})()');await ev(`bot.tp(${n[0]}+1.2,${n[1]}+1.2)`);await ev('findFocus();interact()');await sl(500);console.log('talk',await ev('bot.st().focus'),await ev('$("#dlg").classList.contains("hidden")'));
const chips=await p.$$('#chips .chip');if(chips[1])await chips[1].click();await sl(1500);await ev(closeAll);
// tour
const locs=await ev('LOCS.map(l=>[l.id,l.spot.x,l.spot.z])');let fails=[];
for(const [id,x,z] of locs){const r=await ev(`bot.walk(${x},${z},1500)`);if(!r.ok)fails.push(id);}
console.log('tour fails (straight line)',fails);
// scrolls
const sc=await ev('ENT.filter(e=>e.kind==="scroll"&&!e.data.hidden).map(e=>[e.x,e.z])');
for(const [x,z] of sc){await ev(`bot.tp(${x}+0.6,${z}+0.6)`);await ev('findFocus()');await ev('if(focus&&focus.t==="ent"&&focus.e.kind==="scroll")interact()');await ev(closeAll);}
console.log('spells',await ev('S.spells.map(s=>s.name+"/"+s.el+"/"+s.form)'));
// spells on everything
await ev('S.xp=900');await ev('S.spells.forEach((s,i)=>{if(i<4)S.slots[i]=s.id})');
for(let i=0;i<30;i++){await ev(`(()=>{mana=999;for(const k in CD)CD[k]=0;player.cd=0;castSlot(${i%4});bot.run(0.4);${closeAll}})()`);}
// interiors and dungeon
for(const z of ['salle','biblio_int','auberge','grotte']){await ev(`enterZone("${z}")`);await sl(900);await ev('bot.run(1)');await ev(`exitZone()`);await sl(900);await ev('bot.run(0.5)');}
await ev('S.puz.seals.open=true;syncPuzzles()');await ev('enterDungeon()');await sl(900);await ev('bot.run(2)');await ev('exitDungeon()');await sl(900);await ev('bot.run(0.5)');
// duel full: golem; fight smart (circle strafe around opponent)
await ev('bot.tp(-19.2+1.4,30.2)');await ev('findFocus();interact()');await sl(300);const pk=await p.$$('#pick .pk');await pk[0].click();await sl(2600);
let res=null;for(let i=0;i<120;i++){res=await ev(`(()=>{if(!DUEL)return 'none';const e=DUEL.e;const dx=e.x-player.x,dz=e.z-player.z,d=Math.hypot(dx,dz);camYaw=Math.atan2(dx,dz);player.ry=camYaw;keys.KeyD=true;keys.KeyW=d>7;keys.KeyS=d<4;mana=999;for(const k in CD)CD[k]=0;player.cd=0;castSlot(0);for(let k=0;k<10;k++){update(0.033);tick5(0.033);}if(Math.random()<0.2)jump();return [DUEL.phase,DUEL.ohp,DUEL.php];})()`);if(res==='none'||res[0]==='end')break;}
await ev('keys.KeyD=keys.KeyW=keys.KeyS=false;for(let k=0;k<120;k++){update(0.033);tick5(0.033);}');
console.log('duel result',res,await ev('[!!DUEL,S.duels]'));
// map & options
await ev('openMap()');await sl(300);await ev(closeAll);await ev('openOpts()');await sl(200);await ev(closeAll);
// night -> sleep
await ev('S.time=23.99*60');await ev('bot.run(1)');await p.click('#b-sleep');await sl(1500);await ev('bot.run(1)');
console.log('day2',await ev('[S.day,fmtTime(S.time),S.zone]'));
// save & reload continue
await ev('save()');await p.reload();await p.evaluate(()=>{window.__noAutoQ=1;});await sl(1500);await p.click('#b-cont');await sl(1500);
console.log('reloaded',await ev('[S.name,S.day,S.spells.length,JSON.stringify(S.duels)]'));
console.log('ERR',JSON.stringify(errs));console.log('LOG',JSON.stringify(logs.slice(0,10)));
if(errs.length){console.log('ECHEC : erreurs JavaScript');process.exitCode=1;}else console.log('OK : partie complète sans erreur');
await b.close();})();
