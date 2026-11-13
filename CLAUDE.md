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
| 12-perf-son-duels-carte | fusion statique `mergeStatic`, culling `cullAll`, audio `AU`/`SFX`/musique, duels `DUEL`, carte, options |
| 13-visee-camera | ciblage `AIM` (verrouillage, point visé), `castTarget`, `aimShot`, gestes tactiles, zoom |
| 14-lieux-… | Moulin du Ru, Marais des Lucioles, Ruines d'Ysmer (oracle, gardiens, crypte) |
| 15-balai-… | balai `FLY`, course d'anneaux `RACE`, objets magiques `OBJS`, Faille à vagues `WAVE`, karma, quête de l'Oubli, Bosquet |
| 16-jeux-sorts-… | jeux de sorts A/B (`swapSets`), viseur libre (`freeAim`), réglages `AIMO` |
| 17-ui | HUD, dialogues (`openDlg`, `send`), grimoire/journal (`renderBook`) |
| 18-maitre-du-jeu | prompt du MJ (`RULES`, `worldCtx`, `buildPrompt`), `applyActions`, MJ de secours `fallbackGM` |
| 19-mecaniques | quêtes (`addQuest`, `finishQuest`, `curStep`), temps, nuit, génération de sorts `genSpell` |
| 20-controles | joystick, clavier, glisser caméra |
| 21-boucle | `update(dt)`, `loop()`, `startGame()`, puis la séquence de construction du monde |

Autres : `src/styles.css`, `src/body.html` (HUD/modales + balises `<script>` Three.js en CDN),
`src/head.html`, `src/tail.html`.

## Repères techniques

- Monde : disque de rayon ~92, `gh(x,z)` = hauteur du sol. Zones `S.zone` : `monde`, `donjon`
  (z≈-700), intérieurs `salle`/`biblio_int`/`auberge`/`grotte` (z=700).
- Séquence de construction (fin de 21-boucle) : `markStatic(); buildWorld(); buildWorld4();
  buildRift(); buildBosquet(); buildRack(); mergeStatic(); buildWorld2(); buildWorld3(); …`.
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

Le jeu a été créé comme « artifact » claude.ai : le MJ appelle `window.claude.use('sample')`
(17-ui / 18-maitre-du-jeu), disponible UNIQUEMENT dans un artifact publié. Ailleurs (fichier local,
hébergement perso) le jeu bascule seul sur `fallbackGM` (MJ procédural, sans IA).
Pour un vrai MJ IA hors artifact : créer un petit serveur (proxy) qui appelle l'API Anthropic avec
la clé côté serveur — jamais de clé dans le code du navigateur — et brancher `SAMPLE` dessus
(objet avec `json(prompt, opts)` renvoyant `{narration, actions:[…]}`). Le MJ n'est appelé que
sur action du joueur (clic, dialogue), jamais en boucle.

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
