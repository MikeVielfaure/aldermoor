// Lance le jeu dans un Chrome sans écran (format téléphone) et donne accès à l'intérieur du jeu.
// ev('code') exécute du code DANS la closure du jeu (toutes les variables internes sont accessibles).
const path=require('path');
let puppeteer;try{puppeteer=require('puppeteer');}catch(e){puppeteer=require('puppeteer-core');}
const sl=ms=>new Promise(r=>setTimeout(r,ms));
const URL='file://'+path.join(__dirname,'.tmp','index.html').replace(/\\/g,'/');
async function launch(opts={}){
 const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH||undefined,args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'],headless:'new'});
 const p=await b.newPage();await p.setViewport({width:opts.w||400,height:opts.h||820,isMobile:true,hasTouch:true});
 const errs=[],logs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')logs.push(m.type()+': '+m.text());});
 await p.goto(URL);await p.evaluate(()=>localStorage.clear());
 await p.goto(URL);await p.evaluate(()=>{window.__noAutoQ=1;});await sl(1500);
 const ev=s=>p.evaluate(s=>{try{const r=window.__ev(s);return r===undefined?null:JSON.parse(JSON.stringify(r));}catch(e){return 'EXC: '+e.message+' '+e.stack.split('\n').slice(0,3).join(' | ');}},s);
 return {b,p,errs,logs,ev,sl};
}
module.exports={launch,sl};
