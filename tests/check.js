// Vérifie la syntaxe du JavaScript assemblé (rapide, sans navigateur).
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const s=fs.readFileSync(path.join(__dirname,'..','dist','index.html'),'utf8');
const i=s.indexOf('<script>\n(function(){'),j=s.lastIndexOf('</script>');
const tmp=path.join(__dirname,'.tmp');fs.mkdirSync(tmp,{recursive:true});const f=path.join(tmp,'check.js');fs.writeFileSync(f,s.slice(i+8,j));
try{execFileSync(process.execPath,['--check',f],{stdio:'inherit'});console.log('Syntaxe OK');}catch(e){process.exit(1);}
