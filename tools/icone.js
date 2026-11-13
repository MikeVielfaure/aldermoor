// Dessine l'icône du jeu (src/static/icone-*.png) avec Chrome sans écran. À relancer seulement si on change le dessin.
const path=require('path'),puppeteer=require('puppeteer');
const rays=n=>Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2,r=i%2?62:150;return (256+Math.sin(a)*r).toFixed(1)+','+(236-Math.cos(a)*r).toFixed(1);}).join(' ');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><radialGradient id="g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#4a2f9a"/><stop offset=".55" stop-color="#1c1450"/><stop offset="1" stop-color="#0b0a22"/></radialGradient>
<radialGradient id="h" cx="50%" cy="46%" r="42%"><stop offset="0" stop-color="#ffd98a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient></defs>
<rect width="512" height="512" fill="url(#g)"/><rect width="512" height="512" fill="url(#h)"/>
<circle cx="256" cy="236" r="168" fill="none" stroke="#f3cf7a" stroke-opacity=".5" stroke-width="5"/>
<circle cx="256" cy="236" r="186" fill="none" stroke="#ff7ae0" stroke-opacity=".35" stroke-width="2.5" stroke-dasharray="3 15"/>
<polygon points="${rays(16)}" fill="#f3cf7a"/><circle cx="256" cy="236" r="30" fill="#fff6d8"/>
<path d="M96 430 L150 372 L196 414 L256 344 L316 414 L362 372 L416 430 L416 512 L96 512Z" fill="#0b0a22" fill-opacity=".9"/>
<path d="M236 512 L236 398 L256 362 L276 398 L276 512Z" fill="#1c1450"/><rect x="250" y="410" width="12" height="20" rx="6" fill="#ffc060"/>
</svg>`;
(async()=>{const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});const p=await b.newPage();
 for(const s of [192,512,180]){await p.setViewport({width:s,height:s});await p.setContent('<body style="margin:0;background:#0b0a22">'+svg.replace('<svg ','<svg width="'+s+'" height="'+s+'" ')+'</body>');
  await p.screenshot({path:path.join(__dirname,'..','src','static','icone-'+s+'.png')});}
 await b.close();console.log('icônes -> src/static/');})();
