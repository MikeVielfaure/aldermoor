# Aldermoor — Académie des Arcanes

RPG de sorcier 3D pour navigateur (mobile d'abord), univers original, monde ouvert sans fil rouge,
avec un maître du jeu (MJ) IA. Three.js r128, JavaScript sans framework. Le jeu se suffit à lui-même
(textures peintes sur canvas, sons synthétisés en WebAudio, personnages faits par le code) et
s'enrichit de ressources CC0 quand elles sont disponibles (`src/assets` : personnages et créatures
animés, sons, musiques). Règle : si un fichier manque, le jeu retombe sur la version faite par le code
(c'est le cas dans un artifact claude.ai). Le joueur est francophone : tout le texte du jeu et les
réponses au joueur sont en français, simples et courtes.

## Commandes

- `npm run build` : assemble `src/` → `dist/index.html` (le jeu) et copie `src/assets` → `dist/assets`.
- `node tools/assets.mjs [persos|creatures|objets|sons|tout]` : prépare les ressources depuis les packs bruts
  `assets/brut/` (non versionnés, voir `assets/INVENTAIRE.md`) vers `src/assets` (versionné).
- `npm run check` : build + vérification de syntaxe (rapide, à lancer après chaque modification).
- `npm test` : un bot joue une partie complète dans Chrome sans écran (≈5 min). Doit finir par
  `OK` et `ERR []`. Nécessite `npm install` (puppeteer). Sinon `CHROME_PATH=/chemin/chrome npm test`.
- `npm run capture -- x z regardeX regardeZ fichier.png` : capture d'écran du jeu à un endroit.
- **Atelier** : `npm run serve` puis http://localhost:5173/?atelier (Chrome / Edge : enregistre directement dans `src/contenu`). `build.js` intègre le catalogue des modèles (`window.__CATALOGUE`) et `src/contenu/*.json` (`window.__CONTENU`).
- `npm run serve` : sert `dist/` sur http://localhost:5173 pour jouer.

## Architecture

`build.js` concatène, dans l'ordre alphabétique, tous les `src/js/*.js` à l'intérieur d'UNE SEULE
closure `(function(){ ... })();`. Conséquences importantes :

- Les fichiers ne sont PAS des modules ES : pas d'`import`/`export`. Toutes les fonctions et
  variables de premier niveau sont partagées entre fichiers. Un nom déclaré deux fois
  (`const`/`let`/`function`) casse tout : toujours `grep` le nom avant d'en créer un.
- L'ordre compte : un `const`/`let` doit être défini avant d'être utilisé au chargement.
  Les `function` sont remontées (hoisting) et utilisables partout.
- Les étapes récentes étendent les anciennes en ré-enveloppant des fonctions :
  `{const _old=castSpell; castSpell=function(sp){ ...; return _old.apply(this,arguments); };}`.
  Avant de modifier une fonction, chercher TOUS ses enrobages (`grep -n "castSpell=" src/js`).
- Ne jamais modifier `dist/` à la main : il est régénéré.
- Atelier (22c) : une variable lue par la boucle d’affichage doit être déclarée AVANT la boucle (piège déjà rencontré deux fois : TAB, PICK).

| Fichier `src/js/` | Contenu |
|---|---|
| 00-base | utilitaires (`$`, `rnd`, `clamp`, `pick`, `TAU`…) |
| 01-donnees | éléments `ELEM`, lieux `LOCS`, PNJ `NPCS`, répliques, bestiaire, ingrédients, potions |
| 02-etat | état de partie `S`, sauvegarde `save()`, `migrate()`, niveaux, talents |
| 03-rendu | renderer, particules GPU (`PA` additif, `PN` normal, `PW` météo), lumières, collisions `COLS`/`pushOut` |
| 04-monde | `buildWorld()` : terrain (`terrainH`, `gh(x,z)`), château, tours, village, lac, arbres, herbe |
| 05-personnages | `makeHuman()`, `animHuman()` (personnages articulés) |
| 05c-apprenti | l'apprenti(e) à baguette, construit par le jeu (`makeApprenti`, `apprDress`) : apparence par défaut du joueur et de Lila |
| 05b-modeles | chargeur glTF `mdlLoad`, personnages 3D Quaternius « RPG » (`MDL`, `mdlDress`, `mdlAnim`, modèle et teinte par PNJ `MDL_PERSO`, apparence du joueur `MDL_LOOK`, option d'origine/3D `mdlStyle`) |
| 06-objets-plantes | objets physiques `PROPS` (caisses, tonneaux…), plantes |
| 07-entites | `ENT` : parchemins, événements, créatures, coffres (`addEnt`, `removeEnt`) |
| 08-sorts | `castSpell`, projectiles `PROJ`, `impact`, `doZone`, `doUtil`, `elemHit` (effets sur le monde) |
| 09-monde-interactif | potions, météo, énigmes (braseros, sceaux), coffres, souterrain, nage, routines des PNJ |
| 09b-creatures-modeles | créatures 3D (modèle choisi par nom puis par élément : `CREA_NOMS`, `CREA_ELEM`), animation `creaTick` |
| 10-relief-interieurs | plateau, falaises, rivière, cascade, intérieurs (`ZONES`, `enterZone`), bloom, reflets |
| 11-textures-vegetation | textures canvas `TX`, matériau triplanaire `triMat`, arbres instanciés `TREEV`, `leafMat` |
| 11b-decor | kit de décor `dkAt`/`dBox`/`dCyl`/`dSph`/`dTri` (fusion par matériau, couleurs par sommet), maison à colombages `house()`, étals, charrette, panneaux, `buildDecor()` (habillage des lieux, forêt lointaine) |
| 11d-objets3d | objets 3D Quaternius (`objets.glb`) placés par recettes dans les intérieurs et près de l'arène (`o3Plan`, `o3Wall`, `o3Ring`), fusionnés par matériau et par lieu (`o3Build`) |
| 11c-decor-auto | décor automatique : catalogue `DECOR_KIT`, recettes `DECOR_STYLES`, style de chaque lieu `LOC_STYLE`, `autoDecor()`, bords de chemins `decorPathsides()` |
| 12-perf-son-duels-carte | fusion statique `mergeStatic`, culling `cullAll`, audio `AU`/`SFX`/musique, duels `DUEL`, carte, options |
| 12b-sons-reels | vrais sons par-dessus la synthèse (`SMP`, `smpPlay`, `smpSfx`), musique par ambiance `smpMusic`, boucles d'ambiance `smpAmb` |
| 13-visee-camera | ciblage `AIM` (verrouillage, point visé), `castTarget`, `aimShot`, gestes tactiles, zoom |
| 13c-camera-auto | caméra qui suit les déplacements et garde les monstres hostiles à l'écran (`camAutoTick`, réglage `CAMA.mode` : manuelle / suit / suit + combat) |
| 13b-camera-interieurs | caméra des lieux clos `inCam()` (plafond, murs, meubles, champ de vision), noms qui s'effacent de près `nearFade()` |
| 14-lieux-… | Moulin du Ru, Marais des Lucioles, Ruines d'Ysmer (oracle, gardiens, crypte) |
| 15-balai-… | balai `FLY`, course d'anneaux `RACE`, objets magiques `OBJS`, Faille à vagues `WAVE`, karma, quête de l'Oubli, Bosquet |
| 16-jeux-sorts-… | 3 jeux de 6 sorts A/B/C (`S.sets`, `S.slots` = le jeu actif, même tableau ; `swapSets`, `setUse`), viseur libre (`freeAim`), réglages `AIMO` |
| 17-ui | HUD, dialogues (`openDlg`, `send`), grimoire/journal (`renderBook`) |
| 18-maitre-du-jeu | prompt du MJ (`RULES`, `worldCtx`, `buildPrompt`), `applyActions`, MJ de secours `fallbackGM` |
| 18b-mj-cle | MJ IA avec la clé Claude du joueur (`mjInit`, `mjCall`, panneau `openMjk`), hors artifact |
| 19-mecaniques | quêtes (`addQuest`, `finishQuest`, `curStep`), temps, nuit, génération de sorts `genSpell` |
| 19b-sorts-uniques | un sort par élément × forme ; un doublon fait monter de rang (`rankUp`, `spRank`, `CAST_K`), fusion des anciennes sauvegardes |
| 20-controles | joystick, clavier, glisser caméra |
| 20b-landes | les Landes d'Ombrelune (`LANDES`, relief `landH`, `buildLandes`, portails, vol par les crêtes, peuplement `LANDES_POP`, carte de la région) |
| 20c-dragon-legendes | boss Ignivor (`BOSS`, `dragonAI`, `dragonHit`, PV du joueur `hurtPlayer`, barre `#bossbar`), 4 sorts légendaires (`LEG_SP`, effets `castDemanti`/`castEtoiles`/`castGardien`/`castSouffle`, pupitres `LEG_PUP`), arbre-gardien allié `ALLY` |
| 20d-critiques-garde | coups critiques (`CRITNOW` dans `pow()`, `p.crit` des projectiles, `critFx`, primes), 4 sorts de garde (`GARDE_SP`, `castGarde`, murs temporaires `WALLS` ajoutés à `COLS`, égide `AEGIS` qui renvoie les tirs) |
| 20e-vie-creatures | vie du joueur `VIE` (`vieHurt`, `vieFaint`, barre `#viebox`), potion de soin, barres de vie des créatures `CBAR`, mort animée `CORPSES` (enrobage de `removeEnt`), PNJ qui se tournent vers le joueur |
| 20f-iles-celestes | Îles du Miroir-Ciel (`ILES`, courants `VENTS`, cristaux `CRIST`, Autel des Vents → `S.elan`), île = entrée COLS avec `bot` (dessous), coups plus sensibles |
| 20g-charge-enchant | sorts chargés (`CHG`, `CHGNOW`/`CRIT_FORCE` dans pow et 20d, écoute en capture sur `#ctrls`), enchantements `ENCH`/`S.ench` (table `ENCHT`), Course céleste `CRACE` |
| 20h-nuits-etoilees | minuit sans sommeil forcé (`nightfall` remplacé, `dawnTick` → MJ à 7 h, `sleepHere`), aurores, étoiles filantes, étoiles tombées `NIGHT.stars`, vœu (`S.wish`, +1 `S.relics`) |
| 20i-fusions-pacte | fusions à deux mains (`FUSIONS`, `FUS`, `fusion()`), second doigt sur un sort = lancer immédiat, Pacte de la Lune Noire (`PACTE_SP`, `pacteStart`, `pacteChoice`, créature dominée `D.charmed`) |
| 20j-evenements | événements surprises `SURP` (`evCaravane`, `evInvasion`, `evMarchand` + `SHOP`), toutes les 3-5 min |
| 20k-perf-lueurs | lueurs (Sprite) au-delà de 62 m sur le calque 1 (non dessiné), sans toucher à .visible ; `userData.noCull` pour les exceptions |
| 20l-elites | créatures élites (`makeElite`, `ELITE_POW`, couronne, butin, `S.elites`) |
| 20m-familier | familier `S.pet` / `PET` (apprivoisement par un point d'action qui suit l'animal le plus proche, `petTick`, dons : `petMul` dans pow, vitesse 21-boucle, vie 20e, œuf au `dawnTick`) |
| 20n-equipement | pièces d'or `S.or` (`gainOr`), Échoppe de l'Artisan (`shopRoot`), baguettes `WANDS` / robes `ROBES`, `S.equip`/`S.gear`, bonus `gearMul/gearMana/gearRegen/gearSpeed/gearCrit/gearVie`, apparence `gearVisTick` (robe : `L.robe` dans 05c) |
| 20o-domaine | le Domaine `S.home` (emplacement `homeFindSite`, construction au kit `homeBuild` + `dkFlush` en cours de partie, jardin `HOME.plots`, `homeSpawn` pour le rappel et le réveil), mis en place dans un enrobage de `startGame` |
| 20p-proteggo | Proteggo : bulles `PSH` (`castProteggo`, renfort, Maxima = charge pleine), blocage des tirs qui entrent (`pshBlock`), coups absorbés (`pshAbsorb` sur hurtPlayer / vieHurt / duelPlayerHit / waveHurt) |
| 20q-construction | Construo / Reparo, pièces `BLD` (`BLD_T`, `bldPlace`, `bldDamage`, `bldBreak`, ruines), COLS `bld` (porte : `c.gate` laisse passer le joueur), récolte bois / pierre (`GATHER`, carrières), `S.builds`. Seules les constructions du joueur cassent |
| 20r-briques | briques physiques `BRK` (`BRK_T`, `brkPlace`, empilement `brkFloor` cherché sous la position d’avant le mouvement, réveil des briques portées `brkWake`, forces des sorts `brkForce`, collision décor `brkWorld`), InstancedMesh par type, `S.bricks` |
| 20s-construction-roue | mode construction `BMODE` : roulette dans les boutons de sort (`BITEMS`), aperçu `bghost`, écoute en capture sur document |
| 20t-contenu | créatures créées dans l'Atelier (`contCreatures` : src/contenu/creatures.json + localStorage de l'Atelier), apparition par groupe près de leur lieu, `?test&voir=<id>` |
| 20u-contenu-sorts | sorts de l'Atelier (`CSPELLS`, effets explosion / multi / rebond, grande / attire / souffle, plateforme / teleport / soin / bouclier / bond ; `CPOW` dans pow), `?test&sort=<id>` |
| 20v-contenu-monde | lieux et portails de l'Atelier (`CWORLD`, ajoutés à LOCS, décor auto, arches `CPORT`), `?test&lieu=<id>`, `?test&pos=x,z` |
| 20w-contenu-objets-persos | personnages de l'Atelier (ajoutés à NPCS / MDL_PERSO / LINES avant buildCharacters, `?test&pnj=<id>`) et objets (`COBJETS` : objets.glb ou importés `objets-import`, interactions coffre / message / soin / mana) |
| 21-boucle | `update(dt)`, `loop()`, `startGame()`, puis la séquence de construction du monde |
| 22-appli | plein écran, écran qui reste allumé, enregistrement du mode hors-ligne |
| 22b-partie-test | partie de test niveau 50 (`?test` dans l'adresse), sauvegarde normale mise de côté |
| 20x-structures | structures de l'Atelier en vraies briques (`CSTRUCT`, modèles `STRUCT_MODELES` : mur, tour, maison, pont, escalier, arche ; `stGen` → briques locales, `stBuild` les pose « fixées » `b.fixed`, `b.st` = id). Une brique frappée, poussée ou privée d'appui redevient physique : la structure s'effondre. Hors sauvegarde : reconstruite à chaque partie |
| 20y-contenu-quetes | quêtes de l'Atelier (`CQUETES`, `cqQuest` → quête du journal avec `q.cq`, étapes parler / aller / ramasser / lancer + nouvelle étape `kill` comptée dans un enrobage de `killCreature`) ; le donneur les propose en puce « 📜 » dans le dialogue (`cqOpen`), finies dans `S.cqDone`, récompenses or / essences / cristaux / sort de l'Atelier ; `?test&quete=<id>` |
| 20z-grandes-terres | **Grandes Terres** (`TER`, centre x=6000, 2 km × 2 km, `regionOf(x)`, `terIn`) : relief `terH` = `terH0` procédural + retouches de l'Atelier (grille 8 m `TER.dh`/`TER.bi`, `src/contenu/terrain.json`) + creusages `TER.digH` ; biomes `TER_BIO`/`terBiome` ; morceaux de 96 m `terChunk`/`terStream` (1 par image), arbres/rochers/herbe InstancedMesh remplis selon la caméra (`terFill`), collisions proches `c.ter` ; mer au niveau 0, eau profonde repoussée (`terClamp` dans pushOut) ; portails vallée / Landes / Halte (`terGo`, `terBack`) ; peuplement `TER_POP` ; carte `terMapImg` |
| 20zb-minage | minage dans les Grandes Terres : ⛏ creuser / ⛰ remblayer dans la roulette de Construo (`MITEMS`, `mineAt`), creux `S.digs` {x,z,r,d} rangés par cases de 16 m (`DIG.grid`, `digIndex`), `TER.digH` ; `terPatch` recalcule seulement les sommets touchés ; butin pierre / minerai (`INGR.minerai`) / cristal / or ; brique de fer `BRK_T.fer` ; filons autour des Mines de Brisefer |
| 20zc-monstres | 26 monstres Quaternius « Ultimate Monsters » (src/assets/creatures, préparés par `node tools/assets.mjs monstres`) : règles nom → modèle en tête de `CREA_NOMS`, volants `MONS_VOL`, tailles `MONS_TAILLE` (enrobage de `creaDress`), ajouts à `TER_POP` / `LANDES_POP` / `CREA`. Couleurs par matériau : `creaDress` garde la couleur d’origine (`userData.b`) × teinte |
| 20zd-chimeres | chimères : animaux réalistes Quaternius (Animated Animal Pack, CC0 ; `node tools/assets.mjs chimeres`) + magie par le code, accrochée aux os (`chimAt` : Head, Torso2, Tail…, en mètres) : licorne (corne), pégase (ailes, vol = galop), cerf des étoiles (bois lumineux), loup spectral (translucide), renard de feu (queues enflammées), taureau de lave ; couleurs `userData.b` / lueur `userData.e` (gardée par creaTick), effets `chimTick` |
| 20ze-academies | académies élémentaires (`ACADS` : profs par élément, directeur, quête, sort inédit) : Académie des Éléments primaires (Pr. Flambard feu « C’est feutastique ! » à l’Arène, Pr. Ondine eau au Lac, Pr. Frimas glace dans la Cour, Mirelle nature, Archimage Aldric Hautval au château, ajoutés à `NPCS` / `MDL_PERSO` / `LINES`) ; puce « 📚 Cours » → `acadCours` (prochain sort de l’élément dans l’ordre `ACAD_FORMES` trait → util → zone, 1 cours/jour/prof, `S.acad.c`) ; puce « 🎓 » → `acadDir` (quête « Les Quatre Épreuves » → sort inédit « Concert des Quatre » `special:quatre`, `S.acad.ok`) |
| 20zf-cieux | Académie des Cieux sur la Citadelle des Nuées (`CIEUX` : grande île au-dessus du nord-ouest de la vallée, x=-42 z=-60, ≈ 52 m de haut ; construite dans un enrobage de `buildBosquet` = fusionnée) : lieu `cieux` avec `L.y` (21-boucle ne t’y met que si tu es en haut), courant ascendant, navette céleste (`cieuxMonter` 10 pièces / `cieuxDescendre`), PNJ de l’île remis à la bonne hauteur (enrobage de `updNPCs`), on ne parle pas à un PNJ 3 m plus haut ou plus bas (enrobage de `findFocus`) ; profs Zéphyrine (vent) et Lucius (lumière), directrice Célestine ; sort inédit « Ailes de lumière » (`special:ailes`, `AILES`) |
| 20zg-sombrite | Académie de la Sombrité (`SOMB`, Grandes Terres, clairière `terres_sombrite` ajoutée à `TER_LIEUX` au chargement : aplat, pas d’arbres ; manoir dans un enrobage de `buildTerres`) au cœur du Bois des Ombres-Longues (`SOMB.R` m : conifères en plus par enrobage de `terChunk`, obscurité `SOMB.k` par enrobage de `lighting`, embuscades d’Ombres-Longues `e.data.somb` sauf si `BUFF.invis` ou sentier allumé par un sort de Lumière à la Pierre des Lucioles `SOMB.sentier` ; clairière = sanctuaire) ; profs Noctis (ombre), Aurèle (arcane), directrice Morgane ; quête « Les Trois Ombres » → « Main du Néant » (`special:neant`) |
| 20zh-recherches | avis de recherche (`RECH` : 6 méchants nommés, repaire = lieu + décalage ; tableau au Village de Brumepont → `rechBoard` place un repère `S.wp`) ; le méchant apparaît à 70 m de son repaire (`rechTick` : seulement après avoir lu le tableau `S.rechVu` et dès le niveau `rechNiv` — vallée 4, Landes 8, Terres 12 ; élite `makeElite` + nom qui choisit le modèle), prime une seule fois (`S.rech[id]`, enrobage de `killCreature`). Attention : `S.primes` / `prime()` sont les primes des coups critiques (20d) |
| 20zi-montures | montures : licorne et pégase s’apprivoisent comme familiers (`PET_SP` + `mont` sol / vol) ; ✋ « Monter » (`rideStart`, `RIDE`) : licorne au galop (×1,6 par enrobage de `gearSpeed`), pégase = vol du balai (`toggleBroom`, balai caché) ; monture collée sous le joueur et cavalier surélevé (`RIDE.selle`) dans un enrobage de `preRender` ; 🧹 ou ✋ « Descendre » (`rideStop`) ; pas sauvegardé |
| 20zj-reprise | reprendre la partie là où on l’a quittée : `S.pos` {x,z,y,ry} gardé à chaque `save()` fait dehors (hors duel, Faille, courses), sauvegarde toutes les 20 s et en quittant la page ; « Continuer » → vallée directement (y : îles), Landes via `landesGo`, Grandes Terres via `terGo(x,z)` ; pas pour une nouvelle partie, la partie de test ni les outils de l’Atelier (?pos…) |
| 20zk-zones | zones dangereuses : `zoneDe(x,z)` → {n, niv} (vallée 1, Ruines/Hauteurs 3, Landes 6-15 `ZONES_L`, Grandes Terres 5-18 `ZONES_T` puis par biome `ZONE_BIO`) ; une créature hostile qui apparaît en zone ≥ 4 est renforcée (`D.hp`, `D.bite`, `D.shotDmg`, `D.zniv`) et rapporte XP + or ; `zfix` = pas de renfort ; niveau affiché après le nom du lieu (enrobage de `updateHUD`), avertissement en entrant (`zoneTick`) |
| 20zl-batiments | vrais bâtiments (Medieval Village MegaKit, CC0 : `src/assets/batiments/batiments.glb`, `node tools/assets.mjs batiments`) : types `BATI_TYPES` (maison, maison2, auberge, forge, tour), plans `BATI_PLANS` (lieu + décalage + quart de tour), assemblage pièce par pièce `batiPieces` (murs 2 m × 3,12 m, dehors = +z de la pièce), socle de pierre, fusion par matériau et par lieu (`o3Merge`), collision boîte et `TER.block` réservés au chargement ; Halte et Mines aplanies sur 24 m. Types aussi : phare (lumière au sommet), ruines (murs tombés tirés au hasard fixe `hasard`, collision mur par mur, lierre). Lieux : Halte de l’Aube, Mines de Brisefer, Côte des Coquillages (aplanie, phare), Ruines d’Haldaran |
| 20zm-histoires | vraies histoires : Maëlle (aubergiste), Borin (forgeron), Grégor (chef mineur) ; quêtes `HISTOIRES` ajoutées à `CQUETES` (puce 📜, chaîne avec `apres`) : Les caravanes perdues → Aubin prisonnier des orcs ; Le Cœur de Brisefer → Une baguette pour un héros (`WANDS.brisefer`) ; Nérée (Côte) : Le chant sous les vagues ; le spectre du roi Haldaran : La couronne d’Haldaran ; ennemis d’histoire pendant les étapes « vaincre » (`HIST_ENN`, `histTick`) ; repos à l’auberge (10 pièces) |
| 22c-atelier | **L'Atelier** (`?atelier`, sur ordinateur) : onglets Créatures (import .glb, animations, attaques, effets), Sorts, Monde (carte, lieux, portails), Personnages, Objets (import .glb, choix sur la carte), Structures, Quêtes (étapes, tracé sur la carte), Terrain (pinceaux sur la carte des Grandes Terres : `TB`, `tbBrush`, `tbSave` ; vue 3D `TV3` : `tv3Build`, `tv3Pick` par marche le long du rayon, `tv3Upd` ; « Tester ici » → `tbTest`). En mode Atelier, la boucle du jeu (`loop`, 21) ne tourne pas (`ATELIER`), carte à deux vues (`MAPV.reg` : vallée & Landes / Grandes Terres), **Assistant** (`ASST` : on lui parle, l'IA renvoie `{reponse, operations:[ajouter/modifier/retirer]}` appliquées à toutes les listes, historique `ASST.hist` pour annuler, `asstSchema()` décrit tous les champs : à tenir à jour quand une fiche change) ; barre IA (`mjCall`, clé du MJ) ; enregistrement dans le dossier du projet (File System Access, retenu en IndexedDB) ; `npm run publier` |

Autres : `src/styles.css`, `src/body.html` (HUD/modales + balises `<script>` Three.js en CDN),
`src/head.html`, `src/tail.html`, `src/static/` (icône, manifeste, `sw.js` : copiés tels quels dans
`dist/` ; l'icône se redessine avec `node tools/icone.js`).

## Décor (11b-decor)

Pour ajouter du décor fixe, ne pas créer de `mesh()` un par un : utiliser le kit.
`dkAt(x,z,rotation)` pose le repère d'un objet au sol, puis `dBox(matière,couleur,l,h,p,x,y,z,ry,rx,rz)`,
`dCyl`, `dSph`, `dTri`, `dRock` ajoutent des pièces en coordonnées locales (+z = devant). Matières :
`wood`, `stone`, `rock`, `plaster`, `roof`, `plain`, `metal`, `win` (vitre qui s'allume la nuit).
Tout est fusionné par `dkFlush()` à la fin de `buildDecor()`. Avant de poser un objet avec collision,
tester `dkFree(x,z,rayon)` (chemins, eau, points d'arrivée des lieux, objets à actionner).
Le décor a son propre hasard (`dkr()`) : ne pas y utiliser `srand()`, qui décalerait les arbres.

**Décor automatique (11c)** : préférer une recette à du placement à la main. Chaque lieu a un style
(`LOC_STYLE`, « campagne » par défaut pour un nouveau lieu), chaque style une liste `[objet, nombre]`
(`DECOR_STYLES`), et `autoPlace()` trouve seul les places libres. Pour un nouvel objet : une fonction
`dXxx(x,z,ry)` dans le kit, puis une ligne dans `DECOR_KIT` (avec `col:false` s'il n'a pas de collision).
`DECOR_LOG` indique ce qui a été posé (utile dans les tests).

## Ressources externes (src/assets)

- Préparées par `tools/assets.mjs` (+ `tools/sons.mjs`) : modèles en `.glb` sans animations inutiles,
  textures 256 px, sons en `.mp3` mono. Total visé ≤ 15-20 Mo. Toutes CC0 (sources : `assets/INVENTAIRE.md`).
- Chargement asynchrone : rien n'attend les fichiers. Personnages (05b) : habillés quand `MDL.ready`.
  Créatures (09b) : modèle chargé à la première apparition. Sons (12b) : après le premier geste (audio).
- Pièges Three.js r128 : `THREE.SkeletonUtils.clone()` pour copier un personnage animé ; matériau
  `skinning:true` ; textures des modèles en `LinearEncoding` (le jeu n'utilise pas sRGB, sinon trop sombre).
- Apprenti(e) : fabriqué par le jeu (05c) à partir du personnage articulé, pas de fichier ; `makeHuman0`
  = makeHuman d'origine, `APPR_NOBAKE` retarde la fusion des morceaux le temps d'ajouter robe, écharpe…
  Univers original : école de magie, mais pas de maisons, blasons ou personnages d'une autre œuvre.
- Personnages : pack « RPG Character Pack » (style peint, textures). Le joueur a d'abord trouvé le pack
  « Ultimate Animated Character » moins beau : ne pas y revenir sans lui demander. Morceaux fusionnés par
  texture, teinte par PNJ (`MDL_PERSO`), un seul fichier d'animations partagé (même squelette de 32 os).
  Options : « Personnages » (3D / d'origine) et « Ton apparence » (6 modèles), mémorisés en localStorage.
- Objets (11d) : à l'échelle réelle (mètres), couleurs par sommet en entiers normalisés : r128 ne les
  convertit pas dans `getX()`, diviser par 65535 (sinon tout devient blanc). Collisions ajoutées seulement
  quand les objets s'affichent. `setTimeout(o3Start,0)` : le module se charge avant `ZG` (12).
- Tests : `tests/lib.js` lance Chrome avec `--allow-file-access-from-files` ; les modèles mettent 2-3 s à
  charger chacun dans ce Chrome sans carte graphique, attendre `MDL.ready` / `e.data.M` avant de vérifier.

## Sorts

HUD : boutons du haut en icônes (`.tbtns`), mana dans `#manabox`, messages `#feed` ; règles « téléphone en paysage »
en fin de `styles.css` (`@media (orientation:landscape) and (max-height:560px)`). Vérifier en 844×390 ET 390×844.

Sorts légendaires (20c) et de garde (20d) : `special` + `legend:true`, coût et recharge propres (`sp.cost`, `sp.cd`), effets dans
les enrobages de `doTrait`/`doZone`/`doUtil`. Créature volante en boss : `D.y` = hauteur du centre du corps
au-dessus du sol (c'est ce que visent les sorts), le modèle est décalé en conséquence.

Un seul sort par élément et par forme (8 × 3) : apprendre un sort dont l'élément ET la forme sont
déjà connus le fait monter de rang (II, III : −15 % de mana et de recharge, +15 % de puissance par rang).
Ne pas créer de variantes qui font la même chose. `genSpell()` propose d'abord un couple inconnu.

## Commentaires

Beaucoup de lignes contiennent plusieurs instructions : un commentaire `//` inséré au milieu d'une
ligne neutralise tout le reste de la ligne sans erreur visible. Dans une ligne existante, utiliser `/* … */`.

## Repères techniques

- Monde : vallée = disque de rayon ~92 ; Landes d'Ombrelune = disque de rayon ~168 centré sur x=2000
  (même zone « monde » : `gh()` passe par `landH()` quand 1500 < x < 4000 ; limites dans `pushOut` et `flyPush`) ;
  Grandes Terres = carré de 2 km centré sur x=6000 (x > 4000, `terH`). Pour savoir où l'on est : `regionOf(x)`
  ('vallee' | 'landes' | 'terres'), pas `x>1500` (qui vaut aussi pour les Grandes Terres).
  Un nouveau fichier qui construit du monde doit se charger AVANT 21-boucle (ordre alphabétique : `20b-…`).
  `gh(x,z)` = hauteur du sol. Zones `S.zone` : `monde`, `donjon`
  (z≈-700), intérieurs `salle`/`biblio_int`/`auberge`/`grotte` (z=700).
- Séquence de construction (fin de 21-boucle) : `markStatic(); buildWorld(); buildWorld4();
  buildRift(); buildBosquet(); buildRack(); mergeStatic(); buildWorld2(); buildWorld3();
  buildArenaStone(); buildDecor(); …`. `buildDecor()` passe en dernier pour connaître toutes les
  collisions et tous les objets à actionner avant de placer le décor.
  Tout mesh créé entre `markStatic()` et `mergeStatic()` est fusionné par matériau : s'il doit
  bouger/changer, mettre `obj.userData.dyn=true` (sur lui ou un parent).
- Qualité `QL` 0/1/2 (légers/élevés/ultra+bloom), `HQ=QL>=1`. Cible : téléphone. Surveiller
  `renderer.info.render.calls` (≈300-450 en extérieur) ; préférer InstancedMesh et fusion.
- Sauvegarde : `localStorage['aldermoor-save-v1']`. Tout nouveau champ de `S` doit tolérer
  l'absence (`S.truc||0`) ou être ajouté dans `migrate()` : ne pas casser les parties existantes.
- Éléments : feu, glace, eau, vent, nature, lumiere, ombre, arcane. Formes de sort : `trait`,
  `zone`, `util`. Un sort touchant le monde passe par `elemHit(el,x,z,r)`.
- Français : utiliser `deEl(el)` pour « d'Arcane / de Feu ».

## Maître du jeu IA

Trois MJ possibles, choisis par `mjInit()` (18b-mj-cle) :

1. **Artifact claude.ai** : `window.claude.use('sample')`, disponible uniquement dans un artifact publié.
2. **Clé du joueur** (GitHub Pages, fichier local…) : le joueur colle sa clé API Claude dans
   Options ⚙ → Maître du Jeu IA. Elle reste dans le `localStorage` de son appareil
   (`aldermoor-mj-key`) et ne part que vers l'API Anthropic. Le SDK officiel
   (`@anthropic-ai/sdk`, version figée) est chargé à la demande depuis jsDelivr, avec
   `dangerouslyAllowBrowser`. Modèle au choix du joueur (Opus 5.5 par défaut, Sonnet 5.5, Haiku 5.5),
   effort `low`, règles du MJ en prompt système mis en cache.
3. **MJ classique** `fallbackGM` (procédural, sans IA) : sans clé, ou dès qu'un appel échoue.

Règle absolue : jamais de clé dans le code ni dans le dépôt. `SAMPLE` est un objet avec
`json(prompt, opts)` renvoyant `{narration, actions:[…]}`. Le MJ n'est appelé que sur action du
joueur (dialogue, action libre, fin de cours, lever du jour), jamais en boucle.

## Publication

`.github/workflows/pages.yml` assemble le jeu et publie `dist/` sur GitHub Pages à chaque push sur
`main` (il ne fait rien tant que Pages n'est pas activé : Settings → Pages → Source « GitHub Actions »).
Une fois hébergé en https, le jeu s'installe sur l'écran d'accueil du téléphone (manifeste + icône)
et se rejoue hors-ligne (`sw.js`, réseau d'abord).

## Tests

`tests/lib.js` ouvre `tests/.tmp/index.html` (build `--test`, Three.js local dans `tests/vendor`)
et expose `ev('code')` qui s'exécute dans la closure du jeu. `tests/bot.js` fournit `bot.tp`,
`bot.walk`, `bot.face`, `bot.run(sec)`, `bot.st()`. Pour vérifier une nouveauté : écrire un petit
script sur le modèle de `tests/partie.js`, prendre une capture et la REGARDER.
Non vérifiable par le bot : le son (à l'oreille), la fluidité sur vrai téléphone, le MJ IA.

## Façon de travailler attendue

- Petites modifications ciblées, `npm run check` après chacune, `npm test` avant de dire « fini ».
- Garder le charme : pas de menus lourds, liberté du joueur (les sorts agissent sur le monde, les
  combinaisons imprévues doivent marcher), le MJ peut tout réutiliser.
- Le joueur ne veut pas être téléporté contre son gré (nuit, sommeil…) : garder la liberté de mouvement.
- Avant un gros changement : `git commit` (les anciennes versions sont aussi dans `sauvegardes/`).

## Idées en attente (voir SUITE.md)
