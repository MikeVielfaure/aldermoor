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

## Demandé par le joueur
- **Métiers** (il a validé la liste) : Alchimiste (potions rares, vente), Dresseur (créatures
  apprivoisées / familier), Enchanteur (améliorer balai et objets), Chasseur de failles (contrats
  de combat), Mage noir (quêtes interdites selon l'âme).
- **Bien / mal** : plus de quêtes obscures et exotiques menant à des sorts interdits puissants,
  utilisables librement plus tard (modèle : la quête « Le Murmure de l'Oubli » → sort Oubli).
- Plus de lieux, d'objets magiques, un univers plus riche. Multijoueur évoqué un jour.

## Idées de décor pour la suite
- Habiller avec le kit les lieux pas encore touchés : Moulin, Marais, Ruines, Cercle de pierres,
  Hauteurs, Observatoire, Tour-Bibliothèque.
- Rendre les étals du marché utiles (acheter/vendre : lien avec le métier d'Alchimiste).
- Parchemins, coffres et créatures (07-entites) gardent leur ancien aspect.

## Constats des tests (à améliorer)
- La Faille : vagues 1-3 trop faciles, boss trop brutal → montée plus progressive.
- Mana : limite surtout les combats longs → recharge en restant immobile ou sur coup critique.
- Idée : maintenir un bouton de sort pour le charger (plus puissant).
- « Là où je regarde » + aide désactivée ne peut pas toucher en hauteur (0 %) : à masquer ou corriger.
- Un toucher très court en tournant la caméra peut poser un « point visé » involontaire.
- Le décor v13 ajoute environ 25 appels de dessin et 20 à 30 % de triangles dans les vues les plus
  chargées (cour, arène) : à surveiller sur un téléphone modeste.

## Jamais vérifié en conditions réelles
- Le son (créé sans pouvoir l'écouter), la fluidité sur un vrai téléphone.
- Le MJ IA avec une vraie clé : la connexion à Anthropic est vérifiée (une fausse clé est bien
  refusée) et tout le reste est testé avec un faux SDK, mais aucun vrai échange n'a encore eu lieu.
- La publication GitHub Pages et l'installation sur téléphone (le dépôt était privé, Pages inactif).
