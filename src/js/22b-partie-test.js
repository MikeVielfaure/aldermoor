/* ================= PARTIE DE TEST (niveau 50, tous les sorts, tous les emplacements) =================
   Visible seulement si l'adresse contient « ?test » (ex. https://mikevielfaure.github.io/aldermoor/?test).
   La partie normale n'est pas effacée : elle est mise de côté et peut être reprise depuis le même écran. */
const TEST_BACKUP='aldermoor-save-avant-test';
function testState(name){const s=newState(name||'Testeur');
 s.xp=4900; // niveau 50
 const all=POOL_UNI.map(p=>({...p,id:spId(p.name),rank:RANK_MAX}));all.push({...OUBLI_SP,rank:1});Object.keys(LEG_SP).forEach(k=>all.push(legSpell(k)));GARDE_ORD.forEach(k=>all.push(gardeSpell(k)));s.spells=all;
 const id=(el,form)=>(all.find(x=>x.el===el&&x.form===form&&!x.special)||{}).id||null;
 s.slots=[id('feu','trait'),id('glace','trait'),id('lumiere','zone'),id('nature','zone'),id('vent','util')]; // jeu A : combat
 s.sets=[s.slots,['leg-demantibulus','leg-etoiles','leg-gardien','leg-souffle',null],['garde-rempart','garde-egide','garde-ronces','garde-maree',id('arcane','util')]];s.setIdx=0; // B : légendaires, C : protection
 s.mastery={};ELS.forEach(e=>s.mastery[e]=300); // maîtrise 10/10 partout (+3 points de talent par élément)
 s.objs={};Object.keys(OBJS).forEach(k=>s.objs[k]=1); // balai et tous les objets magiques
 s.inv={};Object.keys(INGR).forEach(k=>s.inv[k]=12);Object.keys(POTIONS).forEach(k=>s.inv['p_'+k]=3);
 s.relics=1;s.karma=0;s.duels={w:0,l:0,best:{}};
 s.chron=[{d:1,h:'08:00',t:'Partie de test : niveau 50, tous les sorts au rang III, tous les objets.'}];
 return s;}
(function(){if(!/[?&]test\b/.test(location.search))return;
 const box=$('#b-new').parentNode,b=document.createElement('button');b.className='ghost';b.id='b-test';b.textContent='🧪 Partie de test : niveau 50, tous les sorts';box.insertBefore(b,$('#b-cont'));
 let old=null;try{old=localStorage.getItem(TEST_BACKUP);}catch(e){}
 if(old){const r=document.createElement('button');r.className='ghost';r.id='b-restore';r.textContent='↩ Reprendre ma partie d’avant le test';box.insertBefore(r,$('#b-cont'));
  r.onclick=()=>{try{localStorage.setItem(SAVE_KEY,old);localStorage.removeItem(TEST_BACKUP);}catch(e){}location.href=location.pathname;};}
 b.onclick=()=>{try{const cur=localStorage.getItem(SAVE_KEY);if(cur&&!/"Partie de test/.test(cur)&&!localStorage.getItem(TEST_BACKUP))localStorage.setItem(TEST_BACKUP,cur);}catch(e){}
  startGame(testState($('#name').value.trim()||'Testeur'),true);setTimeout(()=>say('🧪 <b>Partie de test</b> : niveau 50, 24 sorts au rang III + Oubli, 3 jeux de 5 sorts (bouton ⇄) : A combat, B les 4 légendaires, C les 4 sorts de garde, balai 🧹 et tous les objets. Ta partie normale est mise de côté (écran d’accueil avec ?test).','gm'),1500);};})();
