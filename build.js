#!/usr/bin/env node
// Assemble src/ en un seul fichier dist/index.html (le jeu complet, autonome).
// Usage : node build.js            -> dist/index.html
//         node build.js --test     -> tests/.tmp/index.html (avec crochet window.__ev pour les tests)
const fs=require('fs'),path=require('path');
const R=(...p)=>path.join(__dirname,...p);
const read=f=>fs.readFileSync(R('src',f),'utf8');
const js=fs.readdirSync(R('src','js')).filter(f=>f.endsWith('.js')).sort();
let code=js.map(f=>read('js/'+f)).join('');
const test=process.argv.includes('--test');
if(test){
  const a='requestAnimationFrame(loop);\n';
  if(code.split(a).length!==2)throw new Error('ancre de boucle introuvable');
  code=code.replace(a,'window.__ev=s=>eval(s);\n'+a); // accès à la closure du jeu pour les tests
}
const out=read('head.html')+'<style>\n'+read('styles.css')+'</style>\n'+read('body.html')+'<script>\n(function(){\n'+code+'})();\n</script>\n'+read('tail.html');
let html=out;
if(test){ // les tests utilisent les copies locales de Three.js (tests/vendor) : pas besoin d'internet
  html=html.replace('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','../vendor/three.min.js')
           .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/examples\/js\/(?:shaders|postprocessing)\//g,'../vendor/');
}
const dest=test?R('tests','.tmp','index.html'):R('dist','index.html');
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html);
console.log((test?'test':'dist')+' -> '+path.relative(__dirname,dest)+' ('+Math.round(out.length/1024)+' Ko, '+js.length+' modules)');
