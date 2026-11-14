# Ressources externes (toutes en CC0)

Les packs bruts sont dans `assets/brut/` (≈ 720 Mo, **non versionnés** : voir `.gitignore`).
Chaque dossier contient un fichier de licence (`License.txt` de Kenney ou `LICENCE.txt` avec la source).
CC0 = domaine public : utilisable, modifiable, sans obligation de citer. On cite quand même les
auteurs dans le jeu, par politesse.

Pour les retélécharger : packs Kenney via kenney.nl, Quaternius via quaternius.com (dossiers Google Drive),
sons et musiques OpenGameArt via `bash tools/oga.sh <page>` (n'accepte que le CC0).
`node tools/glb-info.js fichier.glb` résume un modèle (triangles, animations, textures).

## 3D

| Dossier | Contenu | Usage prévu |
|---|---|---|
| `kenney-mini-characters-1` | 43 modèles .glb, dont 20 personnages (≈ 770 triangles, 240 Ko) avec 32 animations : repos, marche, course, saut, chute, ramasser, lancer main droite, attaque, interaction, oui/non, mort | joueur et PNJ (chapeau et robe de sorcier ajoutés par le jeu) |
| `quaternius-cute-monsters` | 21 monstres « mignons » .gltf (≈ 1 000 à 1 800 triangles) : repos, marche, morsure, coup reçu, mort, saut, danse ; vol pour chauve-souris, abeille, dragon, Cthulhu | créatures (fantôme → esprits d'ombre, champignon → farfadets, yéti → lutins de givre, démon → étincelles sauvages, cyclope → golem…) |
| `quaternius-medieval-dungeon` | 26 objets .obj : livres, livre ouvert, chandeliers, bougie, coffres, fiole, tapis, os, barreaux, colonnes, entrées | intérieurs, souterrains, coffres |
| `kenney-nature-kit` | 329 éléments : arbres, rochers, fleurs, champignons, souches, ponts, clôtures, tentes, feu de camp… | décor automatique |
| `kenney-fantasy-town-kit` | 167 éléments : murs, toits, fontaines, puits, étals, charrettes, lanternes… | village, marché |
| `kenney-furniture-kit` | 140 meubles : tables, chaises, lits, étagères, cheminées, tapis… | intérieurs (auberge, salle, bibliothèque) |
| `kenney-graveyard-kit` | 91 éléments : tombes, cryptes, grilles, arbres morts, bougies, citrouilles… | Ruines d'Ysmer, crypte, quêtes obscures |
| `kenney-mini-dungeon` | 30 éléments : murs, sols, tonneaux, coffres, torches, bannières… | souterrains |
| `kenney-food-kit` | 200 aliments et ustensiles | festin de la Grande Salle, auberge, étals |
| `kenney-animated-characters-1` | 1 modèle .fbx + 3 animations (format moins pratique) | sans doute inutile |

## Sons

| Dossier | Contenu |
|---|---|
| `kenney-impact-sounds` | 130 sons : pas (herbe, bois, pierre, neige, tapis), chocs bois/métal/verre/pierre |
| `kenney-interface-sounds` | 100 sons d'interface : clic, ouvrir, fermer, valider, erreur… |
| `kenney-rpg-audio` | 52 sons : livres, portes, pièces, coffre, tissu, marmite… |
| `oga-80-cc0-rpg-sfx` (rubberduck) | 80 sons : créatures (cri, coup, mort, gluant), objets, gemmes, pièces, magie |
| `oga-magic-spell-sfx` (jaggedstone) | 14 sons de sorts |
| `oga-fire-staff-sound-effects` (legit-audio) | 27 sons de bâton de feu (WAV lourds, à couper) |
| `oga-freeze-spell-0` (artisticdude) | sort de gel |
| `oga-earth-element-magic-spell` (qubodup) | sort de terre (→ Nature) |
| `oga-teleport-spell` (ogrebane) | téléportation (→ Pas de l'ombre) |
| `oga-cure-magic` (someoneman) | 8 sons de soin (→ Lumière) |
| `oga-fantasy-magic-spell` (almitory), `oga-synthesized-fire-sound-effect` (spring-spring) | magie, feu |
| Ambiances : `oga-park-ambiences` (thimras, oiseaux, très lourd), `oga-wind-whoosh-loop` (sketchman3), `oga-windy-ambient-noise` (some-weirdo), `oga-fire-crackling` (antumdeluge), `oga-fireplace-sound-loop` (pagdev), `oga-loopable-dungeon-ambience` (jaggedstone), `oga-crickets-ambient-noise-loopable` (wolfgang) | jour, vent, feu, cheminée, souterrains, nuit |

## Musiques

| Dossier | Auteur | Usage prévu |
|---|---|---|
| `oga-2-whimsical-rpg-themes` | karatestudios | académie, cour (thème principal) |
| `oga-exploring-town` | spring-spring | village |
| `oga-grasslands-theme` | dst | chemins, prairies |
| `oga-fantasy-rising-moon` | randommind | nuit |
| `oga-a-small-fire-will-do-calming-loop` | trex0n | auberge, coin du feu |
| `oga-artifact-room` | fupi | bibliothèque, observatoire |
| `oga-calm-and-simple-title-music` | kosmo-the-cat | écran d'accueil |
| `oga-battle-theme-b-for-rpg` | cynicmusic | duels, Faille |

## Pas récupéré (à télécharger à la main si on en veut)

Les deux « mégakits » récents de Quaternius sont sur itch.io (page « payez ce que vous voulez », 0 € possible) :
`quaternius.itch.io/fantasy-props-megakit` (chaudrons, potions, grimoires…) et
`quaternius.itch.io/medieval-village-megakit`. Les dézipper dans `assets/brut/quaternius-<nom>/`.

## Avant d'intégrer

- Sons : beaucoup de WAV très lourds → couper et convertir en .mp3 (≈ 96 kb/s) : il faudra un outil
  (`ffmpeg`, installable par npm avec `ffmpeg-static`). Les .ogg ne sont pas lus par les vieux iPhone.
- Modèles : ne garder que les fichiers utilisés, réduire les textures, viser 15 à 20 Mo au total.
- Le jeu doit continuer de marcher sans ces fichiers (version artifact claude.ai, chargement raté).
