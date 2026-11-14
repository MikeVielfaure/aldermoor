# Aldermoor — Académie des Arcanes

RPG de sorcier 3D pour navigateur (mobile d'abord), univers original, monde ouvert sans fil rouge,
avec un maître du jeu (MJ) IA. Three.js r128, JavaScript sans framework, aucun asset externe
(textures peintes sur canvas, sons synthétisés en WebAudio). Le joueur est francophone : tout le
texte du jeu et les réponses au joueur sont en français, simples et courtes.

## Commandes

- `npm run build` : assemble `src/` → `dist/index.html` (un seul fichier autonome, c'est le jeu).
- `npm run check` : build + vérification de syntaxe (rapide, à lancer après chaque modification).
- `npm test` : un bot joue une partie complète dans Chrome sans écran (≈5 min). Doit finir par
  `OK` et `ERR []`. Nécessite `npm install` (puppeteer). Sinon `CHROME_PATH=/chemin/chrome npm test`.
- `npm run capture -- x z regardeX regardeZ fichier.png` : capture d'écran du jeu à un endroit.
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

| Fichier `src/js/` | Contenu |
|---|---|
| 00-base | utilitaires (`$`, `rnd`, `clamp`, `pick`, `TAU`…) |
| 01-donnees | éléments `ELEM`, lieux `LOCS`, PNJ `NPCS`, répliques, bestiaire, ingrédients, potions |
| 02-etat | état de partie `S`, sauvegarde `save()`, `migrate()`, niveaux, talents |
| 03-rendu | renderer, particules GPU (`PA` additif, `PN` normal, `PW` météo), lumières, collisions `COLS`/`pushOut` |
| 04-monde | `buildWorld()` : terrain (`terrainH`, `gh(x,z)`), château, tours, village, lac, arbres, herbe |
| 05-personnages | `makeHuman()`, `animHuman()` (personnages articulés) |
| 06-objets-plantes | objets physiques `PROPS` (caisses, tonneaux…), plantes |
| 07-entites | `ENT` : parchemins, événements, créatures, coffres (`addEnt`, `removeEnt`) |
| 08-sorts | `castSpell`, projectiles `PROJ`, `impact`, `doZone`, `doUtil`, `elemHit` (effets sur le monde) |
| 09-monde-interactif | potions, météo, énigmes (braseros, sceaux), coffres, souterrain, nage, routines des PNJ |
| 10-relief-interieurs | plateau, falaises, rivière, cascade, intérieurs (`ZONES`, `enterZone`), bloom, reflets |
| 11-textures-vegetation | textures canvas `TX`, matériau triplanaire `triMat`, arbres instanciés `TREEV`, `leafMat` |
| 11b-decor | kit de décor `dkAt`/`dBox`/`dCyl`/`dSph`/`dTri` (fusion par matériau, couleurs par sommet), maison à colombages `house()`, étals, charrette, panneaux, `buildDecor()` (habillage des lieux, forêt lointaine) |
| 11c-decor-auto | décor automatique : catalogue `DECOR_KIT`, recettes `DECOR_STYLES`, style de chaque lieu `LOC_STYLE`, `autoDecor()`, bords de chemins `decorPathsides()` |
| 12-perf-son-duels-carte | fusion statique `mergeStatic`, culling `cullAll`, audio `AU`/`SFX`/musique, duels `DUEL`, carte, options |
| 13-visee-camera | ciblage `AIM` (verrouillage, point visé), `castTarget`, `aimShot`, gestes tactiles, zoom |
| 13b-camera-interieurs | caméra des lieux clos `inCam()` (plafond, murs, meubles, champ de vision), noms qui s'effacent de près `nearFade()` |
| 14-lieux-… | Moulin du Ru, Marais des Lucioles, Ruines d'Ysmer (oracle, gardiens, crypte) |
| 15-balai-… | balai `FLY`, course d'anneaux `RACE`, objets magiques `OBJS`, Faille à vagues `WAVE`, karma, quête de l'Oubli, Bosquet |
| 16-jeux-sorts-… | jeux de sorts A/B (`swapSets`), viseur libre (`freeAim`), réglages `AIMO` |
| 17-ui | HUD, dialogues (`openDlg`, `send`), grimoire/journal (`renderBook`) |
| 18-maitre-du-jeu | prompt du MJ (`RULES`, `worldCtx`, `buildPrompt`), `applyActions`, MJ de secours `fallbackGM` |
| 18b-mj-cle | MJ IA avec la clé Claude du joueur (`mjInit`, `mjCall`, panneau `openMjk`), hors artifact |
| 19-mecaniques | quêtes (`addQuest`, `finishQuest`, `curStep`), temps, nuit, génération de sorts `genSpell` |
| 19b-sorts-uniques | un sort par élément × forme ; un doublon fait monter de rang (`rankUp`, `spRank`, `CAST_K`), fusion des anciennes sauvegardes |
| 20-controles | joystick, clavier, glisser caméra |
| 21-boucle | `update(dt)`, `loop()`, `startGame()`, puis la séquence de construction du monde |
| 22-appli | plein écran, écran qui reste allumé, enregistrement du mode hors-ligne |

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

## Sorts

Un seul sort par élément et par forme (8 × 3) : apprendre un sort dont l'élément ET la forme sont
déjà connus le fait monter de rang (II, III : −15 % de mana et de recharge, +15 % de puissance par rang).
Ne pas créer de variantes qui font la même chose. `genSpell()` propose d'abord un couple inconnu.

## Commentaires

Beaucoup de lignes contiennent plusieurs instructions : un commentaire `//` inséré au milieu d'une
ligne neutralise tout le reste de la ligne sans erreur visible. Dans une ligne existante, utiliser `/* … */`.

## Repères techniques

- Monde : disque de rayon ~92, `gh(x,z)` = hauteur du sol. Zones `S.zone` : `monde`, `donjon`
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
- Avant un gros changement : `git commit` (les anciennes versions sont aussi dans `sauvegardes/`).

## Idées en attente (voir SUITE.md)
