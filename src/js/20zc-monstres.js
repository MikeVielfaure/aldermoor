/* ================= NOUVEAUX MONSTRES (Quaternius « Ultimate Monsters », CC0) =================
   Fichiers src/assets/creatures/<nom>.glb préparés par `node tools/assets.mjs monstres` (couleurs par matériau, sans
   texture ; animations renommées Idle / Walk / Bite_InPlace / HitRecieve / Death / Flying). Le modèle est choisi
   d'après le nom de la créature (CREA_NOMS, 09b) : ces règles passent avant les anciennes. Chargé après 20b et 20z
   (qui ajoutent aussi des règles en tête). Sans fichier : la créature garde son corps fait par le code. */
const MONS_VOL=['masque','spectre','spectre-crane','armabee','alpaking','hywirl','glub','dragonnet','dragonnet-ancien'];
MONS_VOL.forEach(m=>{CREA_VOL[m]=1;});
/* taille propre à chaque modèle (le jeu les ramène tous à ≈ 1,45 m de haut) */
const MONS_TAILLE={orc:1.25,ninja:1.1,'grand-demon':1.6,'demon-bleu':1.25,'roi-champignon':1.7,'champichon-ancien':1.15,champichon:0.8,grenouille:1.05,blob:0.85,'blob-epineux':1,
 cactoro:1.3,'grand-yeti':1.75,'dragonnet-ancien':1.3,lapin:0.6,chat:0.55,pigeon:0.5,birb:0.75,farceur:0.8,glub:0.8};
{const _d=creaDress;creaDress=function(e,m){const r=_d.apply(this,arguments);const k=MONS_TAILLE[m],M=e.data.M;if(k&&M&&!M.sized){M.sized=1;M.r.scale.multiplyScalar(k);}return r;};}
CREA_NOMS.unshift(
 [/roi[- ]champignon|roi des champignons/i,'roi-champignon'],[/champichons? (ancien|géant|geant)/i,'champichon-ancien'],[/champichon|mycélien|mycelien/i,'champichon'],
 [/\borcs?\b|gobelin|brute/i,'orc'],[/ninja|bandit|brigand|maraudeur|assassin/i,'ninja'],[/masque|totem/i,'masque'],
 [/revenant|spectre/i,'spectre-crane'],[/(^|\s)âmes?(\s|$)|apparition|hantise/i,'spectre'],
 [/démons? bleus?|demons? bleus?|diables? bleus?/i,'demon-bleu'],[/grand démon|grands démons|archidémon|seigneur démon/i,'grand-demon'],
 [/grenouille|crapaud/i,'grenouille'],[/gelées? épineuses?|blobs? épineux|slimes? épineux/i,'blob-epineux'],[/\bblobs?\b|slime|gelée|gelee|limace/i,'blob'],
 [/cactoro|cactus (géant|geant|marcheur)/i,'cactoro'],[/grands? y[ée]tis?|y[ée]tis? des cimes|abominable/i,'grand-yeti'],
 [/frelon|armabee|abeilles? cuirassées?/i,'armabee'],[/alpaga|\blamas?\b|alpaking/i,'alpaking'],[/tourbillon|hywirl|zéphyr|zephyr/i,'hywirl'],[/\bglubs?\b|méduse|meduse/i,'glub'],
 [/oiselet|\bbirbs?\b|\bpiafs?\b/i,'birb'],[/dragonnets? ancien|drake/i,'dragonnet-ancien'],[/dragonnet|petits? dragons?/i,'dragonnet'],
 [/lapin|lièvre|lievre/i,'lapin'],[/\bchats?\b|félin|felin/i,'chat'],[/pigeon|colombe/i,'pigeon'],[/farceur|chapeau/i,'farceur']);
/* qui vit où : Grandes Terres (par biome : 0 prairie, 1 forêt, 2 désert, 3 neige, 4 marais, 5 roche, 6 plage) */
[[0,['Lapins des prés','feu','nature',1,1]],[0,['Pigeons voyageurs','glace','vent',1,1]],[0,['Orcs maraudeurs','lumiere','ombre',5]],
 [1,['Champichons','feu','nature',2]],[1,['Chats sauvages','eau','ombre',1,1]],[1,['Roi champignon','feu','nature',9]],
 [2,['Cactoros marcheurs','eau','nature',5]],[3,['Alpagas des neiges','feu','glace',2,1]],
 [4,['Grenouilles géantes','feu','eau',3]],[4,['Blobs des marais','feu','nature',2]],[4,['Gelées épineuses','feu','nature',3]],
 [5,['Bandits masqués','lumiere','ombre',4]],[5,['Dragonnets des pics','glace','feu',4]],[6,['Glubs des vagues','lumiere','eau',2]]].forEach(([b,p])=>TER_POP[b].push(p));
/* Landes d'Ombrelune : des choses plus inquiétantes */
LANDES_POP.push({n:'Spectres des landes',w:'lumiere',l:'ombre',c:[-30,-70],r:22,k:3},{n:'Démons bleus',w:'feu',l:'glace',c:[95,-60],r:14,k:2,hp:4},{n:'Masques errants',w:'lumiere',l:'arcane',c:[-95,45],r:14,k:2});
/* vallée : quelques nouveaux venus parmi les créatures des événements */
CREA.push({name:'Champichons farceurs',look:'nature',weak:'feu'},{name:'Chapeaux farceurs',look:'arcane',weak:'ombre'},{name:'Frelons cuirassés',look:'vent',weak:'glace'},{name:'Grenouilles géantes',look:'eau',weak:'vent'});
