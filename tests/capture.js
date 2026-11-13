// Prend une capture d'écran du jeu à un endroit donné : node tests/capture.js x z [regardeX regardeZ] [fichier.png]
const {launch,sl}=require('./lib');const BOT=require('./bot');
(async()=>{const a=process.argv.slice(2);const x=+a[0]||3,z=+a[1]||12,fx=a[2]!==undefined?+a[2]:0,fz=a[3]!==undefined?+a[3]:-30,out=a[4]||'capture.png';
const {b,p,errs,ev}=await launch();await p.type('#name','Test');await p.click('#b-new');await sl(1500);await ev(BOT);
await ev('$("#feed").style.display="none"');await ev(`bot.tp(${x},${z});bot.face(${fx},${fz});bot.run(0.5)`);await sl(2000);await p.screenshot({path:out});
console.log('capture ->',out,'erreurs:',JSON.stringify(errs));await b.close();})();
