# Suite prévue (souhaits du joueur et constats des tests)

## Fait en v13 (novembre 2026)
- Décor refait avec un « kit » (11b-decor) : maisons à colombages, marché et porte du village, façade
  du château (grande porte, rosace, contreforts, lanternes, oriflammes, statues), jardinières et
  panneau de la cour, rives du lac (roseaux, rochers, nénuphars, barque), gradins et bannières de
  l'arène, poteaux indicateurs, souches, troncs, champignons, forêt lointaine sur les collines.
- Nouveaux objets physiques : bottes de foin, sacs, jarres.
- MJ IA avec la clé Claude du joueur (Options ⚙ → Maître du Jeu IA), hors artifact claude.ai.
- Application mobile : icône, installation sur l'écran d'accueil, plein écran, écran qui reste
  allumé, jeu rejouable hors-ligne ; publication automatique sur GitHub Pages.

## Fait en v14 (novembre 2026)
- Caméra des lieux clos : angle libre, butée sous le plafond, arrêt devant murs et meubles, champ de
  vision élargi dans les petites pièces, entrée deux pas plus loin de la porte, noms qui s'effacent de près.
- Sorts : un seul par élément × forme ; les doublons deviennent des rangs (II, III). Les anciennes
  sauvegardes sont fusionnées automatiquement. Le MJ est prévenu de la règle.
- Décor automatique par recettes (11c) : Moulin, Marais, Ruines, Cercle, Hauteurs, Observatoire,
  Bibliothèque, Forêt, Serres ; bords de chemins garnis.

## Fait en v15 (novembre 2026)
- Ressources CC0 réelles (`src/assets`, ≈ 12 Mo), avec retour automatique à la version faite par le
  code si un fichier manque : personnages animés Quaternius (joueur et PNJ recolorés), 12 créatures
  animées, 36 objets meublant la Grande Salle, la Bibliothèque, l'Auberge, la Grotte et l'arène,
  vrais effets sonores, 8 musiques selon le lieu et l'heure, ambiances (oiseaux, grillons, feu, rivière, vent).

## Fait en v16 (novembre 2026)
- L'apprenti(e) à baguette (robe d'école, écharpe violet et or, cravate) : apparence par défaut, et Lila.
- Les Landes d'Ombrelune : grande région (≈ 3,5 × la vallée), lac, forêt, pic enneigé, plateau des
  géants, nid de vouivre, campement ; 13 groupes de créatures (dont des animaux paisibles) ; portail et
  passage en balai par les crêtes ; carte de la région ; le MJ la connaît.
- Partie de test niveau 50 (adresse avec `?test`).

## Demandé par le joueur
- **Métiers** (il a validé la liste) : Alchimiste (potions rares, vente), Dresseur (créatures
  apprivoisées / familier), Enchanteur (améliorer balai et objets), Chasseur de failles (contrats
  de combat), Mage noir (quêtes interdites selon l'âme).
- **Bien / mal** : plus de quêtes obscures et exotiques menant à des sorts interdits puissants,
  utilisables librement plus tard (modèle : la quête « Le Murmure de l'Oubli » → sort Oubli).
- Plus de lieux, d'objets magiques, un univers plus riche. Multijoueur évoqué un jour.

## Idées pour la région
- Quêtes propres aux Landes (la vouivre, les pierres géantes, le lac), un village ou un refuge, des
  chemins tracés, des nuages au-dessus de la région (aujourd'hui seulement au-dessus de la vallée).
- Apprivoiser un animal paisible (métier de Dresseur).

## Idées de décor pour la suite
- Décor automatique aussi pour les intérieurs (étagères, tonneaux, bougies selon le type de pièce).
- Rendre les étals du marché utiles (acheter/vendre : lien avec le métier d'Alchimiste).
- Parchemins et coffres gardent leur ancien aspect (le pack d'objets a un coffre et des parchemins).
- Packs en réserve : maisons modulaires (village médiéval), personnages RPG (clerc, moine…), kits Kenney
  (nature, ville, mobilier, cimetière, donjon) : voir `assets/INVENTAIRE.md`.

## Constats des tests (à améliorer)
- La Faille : vagues 1-3 trop faciles, boss trop brutal → montée plus progressive.
- Mana : limite surtout les combats longs → recharge en restant immobile ou sur coup critique.
- Idée : maintenir un bouton de sort pour le charger (plus puissant).
- « Là où je regarde » + aide désactivée ne peut pas toucher en hauteur (0 %) : à masquer ou corriger.
- Un toucher très court en tournant la caméra peut poser un « point visé » involontaire.
- Le décor v13 ajoute environ 25 appels de dessin et 20 à 30 % de triangles dans les vues les plus
  chargées (cour, arène) : à surveiller sur un téléphone modeste.

## Jamais vérifié en conditions réelles
- Le son (choisi et réglé sans pouvoir l'écouter : volumes des effets, musiques et ambiances à ajuster à l'oreille),
- Le temps de chargement des ressources en 4G (≈ 12 Mo, chargées en arrière-plan), la fluidité sur un vrai téléphone.
- Le MJ IA avec une vraie clé : la connexion à Anthropic est vérifiée (une fausse clé est bien
  refusée) et tout le reste est testé avec un faux SDK, mais aucun vrai échange n'a encore eu lieu.
- La publication GitHub Pages et l'installation sur téléphone (le dépôt était privé, Pages inactif).
