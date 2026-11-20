// Publie le contenu de l'Atelier : vérifie le jeu, enregistre src/contenu et les modèles importés dans git, envoie sur GitHub
// (GitHub Pages reconstruit et met en ligne le jeu ; il arrive sur le téléphone 1 à 2 minutes plus tard).
// Usage : npm run publier
const {execSync}=require('child_process');const run=c=>execSync(c,{stdio:'inherit'});
run('node build.js');run('node tests/check.js');
run('git add src/contenu src/assets');
try{execSync('git diff --cached --quiet');console.log('Rien de nouveau à publier.');process.exit(0);}catch(e){}
run('git commit -m "Atelier : nouveau contenu"');run('git push');
console.log('✔ Envoyé. Le jeu en ligne sera à jour dans 1 à 2 minutes.');
