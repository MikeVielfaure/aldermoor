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

## Fait en v17 (novembre 2026)
- Caméra automatique : elle suit les déplacements, ramène à l'écran les monstres hostiles proches, se tait
  quand le joueur tourne lui-même ; réglage Options ⚙ → Caméra.
- Méditation : immobile au sol, le mana revient 80 % plus vite.
- 5 quêtes du MJ classique dans les Landes (vouivre, pierres chantantes, lac, fleur de givre, cerfs).

## Fait en v18 (novembre 2026)
- Boss Ignivor, la vouivre ancestrale (Nid de la Vouivre) : barre de vie, PV du joueur pendant le combat,
  boules de feu, souffle, 2e phase avec diablotins ; insensible au feu, craint la glace ; revient 3 jours après.
- Série de 4 sorts légendaires à découvrir (Démantibulus, Pluie d'étoiles la nuit au sommet du pic,
  Appel du gardien au Bosquet, Souffle du dragon en battant Ignivor), indices dans le Grimoire.
- Partie de test : jeu B = les 4 sorts légendaires.

## Fait en v19 (novembre 2026)
- Écran revu (surtout le téléphone en paysage) : boutons du haut en icônes sur une ligne, infos compactes,
  mana à part (au-dessus du joystick, ou en bas au centre en paysage), messages sur le côté ou en bas,
  2 à la fois en paysage. Emplacements verrouillés masqués sauf le prochain.
- 3 jeux de sorts (A, B, C) de 5 emplacements (Archimage : 5). ⇄ saute les jeux vides.
- Coups critiques (~10 %, plus avec la maîtrise) : forme majeure du sort (projectile doré guidé,
  zone plus large), dégâts ×2 (×1,5 sur Ignivor, dont les PV passent à 128 pour compenser, et en duel) ;
  créature achevée par un critique = prime (XP, parfois un ingrédient).
- 4 sorts de garde, un par duel gagné : Rempart de pierre, Égide miroir (renvoie les tirs des duellistes,
  se brise après 2 boules de feu d'Ignivor), Haie de ronces, Mur d'eau.
- Démantibulus agit en duel (30 %, puis 10 %) ; Souffle du dragon plus long (17 m) et plus large.
- Boutons (croquis du joueur, 2026-11-15) : 6 sorts autour de Saut (1-2 petits collés à Saut, 3 à 6 en arc),
  ⇄ et Agir au-dessus (Agir seulement quand il y a quelque chose à faire, la bulle « Cueillir… » se touche aussi).
  Icônes d'élément sans texte. Cadre en haut à gauche = fenêtre du personnage (onglet Perso). 6e emplacement :
  rang « Maître des Arcanes » (niveau 25).
- Ignivor se tourne enfin vers le joueur (un commentaire mal placé l'en empêchait).

## Fait en v21 (novembre 2026)
- Vie du joueur dans le monde : morsures des créatures hostiles (5 PV, 8 dans les Landes), retour de la vie
  après 5 s, évanouissement sans perte (réveil Grande Cour / Campement), barre rouge seulement si blessé.
- Potion de soin (Pétale enchanté + Champignon lunaire).
- Créatures : barre de vie une fois touchées, animation de mort. PNJ : s'arrêtent et se tournent vers le joueur.

## Fait en v22 (novembre 2026)
- Caméra en orbite (plus de « coupe » à travers le joueur en tournant vite), geste vif = rotation accélérée,
  doigt perdu (appel, changement d'appli) libéré ; caméra automatique un peu plus réactive.
- Balai : on peut sauter du balai en plein vol (chute plumée) et y remonter en l'air.
- Créatures tireuses (~4 sur 10 parmi feu, glace, arcane, lumière, ombre) : lueur 0,6 s puis projectile
  esquivable (6 PV, 9 dans les Landes), arrêté par les murs de garde et l'égide. Animaux paisibles blessés : fuite.
- Balai : champ de vision qui s'élargit avec la vitesse.
- Murs de garde : hauteur comptée depuis le sol (on les traversait dans les Landes), 3,6 m (impossible à sauter).
  Mur d'eau traversable à pied ; Glace → mur de glace solide (+12 s) ; Feu → fonte / vapeur ; ronces qui brûlent.

- Balai : bouton 🧹 au toucher (marche avec un doigt sur le joystick), sortie en plein saut, en chute plumée
  et depuis l'eau ; seuls les intérieurs et les arènes (duel, Faille) l'interdisent.

## Fait en v26 (novembre 2026)
- Îles du Miroir-Ciel (Landes, au-dessus du lac) : 3 îles flottantes, courants ascendants (on y monte sans
  balai), cristaux célestes (chaque jour), Autel des Vents → Élan céleste (balai +30 %). Collision « île » :
  COLS avec c.bot (on passe dessous). Plafond de vol 62 dans les Landes.
- Balai dans la Faille (plafond 6 m au-dessus du sol pour rester à portée des monstres).
- Projectiles 30 % plus rapides ; chaque coup sur une créature se sent (arrêt, secousse, éclat).

## Fait en v27 (novembre 2026)
- Sorts chargés : doigt appuyé (attaque/zone), lueur sur la baguette, plus gros et plus fort, mana ×1,6 au
  maximum ; charge pleine = critique garanti. Tapotement = lancer au relâché.
- Enchantements (Table près de la Tour-Bibliothèque, 2 essences + 2 cristaux) : durée, épines, égide renforcée,
  ronces ignifuges, cœur de givre. Un par sort de garde (S.ench).
- Retours du joueur (v27.1) : rochers du rempart à 2,1 m (saut normal bloqué, saut du vent et balai passent),
  ronces 2,6 m ; sorts de garde posés au point marqué / viseur libre / devant la cible verrouillée (ronces = cage
  fermée autour) ; visée : le regard compte plus que la distance, la créature touchée reste prioritaire 4 s.
- Retours v27.2 : Pas de l'ombre marche dans les Landes (limite de la vallée codée en dur) ; caméra : un obstacle ne
  compte que s'il monte jusqu'au rayon (plus de rapprochement brusque en vol) ; direction de marche gardée tant que
  le doigt reste sur le joystick (MOVY) : la caméra fait demi-tour derrière le joueur en marche arrière ; toucher
  près des commandes ne vise pas (tapBlocked) ; partie de test : jeu A choisi par le joueur.
- Nuits étoilées (v28) : plus de téléportation pour dormir (minuit = nouveau jour sur place, MJ au lever du jour,
  « Dormir ici » dans la fenêtre du personnage) ; aurores par nuit claire, étoiles filantes, jusqu'à 3 étoiles qui
  tombent près du joueur (2 essences + 1 cristal) ; 3 la même nuit = vœu (+1 point de talent).
- v29 : Fusions à deux mains (8, < 0,7 s entre deux sorts d'éléments différents, S.fus) ; Pacte de la Lune Noire
  (2e quête interdite : Siphon d'âme + Domination, ou Aube purificatrice + 1 talent) ; événements surprises
  (caravane attaquée, invasion de la Faille à Brumepont, marchand de la nuit qui accepte essences et cristaux).
- v29.1 : en balai, la caméra dirige le vol (vers le bas on pique, vers le haut on monte, zone neutre 0,22-0,5) ;
  en combat, s'éloigner d'une créature proche ne fait plus faire demi-tour à la caméra (elle la garde en vue
  jusqu'à 20 m, et la recentre plus vite quand elle est à moins de 9 m).
- v30 : créatures élites (~1/14, couronne, ×3 PV, bouclier / régénérante / meneuse / enragée, butin) ; lueurs
  lointaines (> 62 m) non dessinées. Mesures (téléphone en paysage) : 90 à 480 dessins selon les lieux, ~120 la nuit.
- v31 : vitesse de la caméra réglable (douce / normale / rapide par défaut / très rapide : retour derrière le joueur
  en 3,6 / 2,2 / 1,2 / 0,8 s) ; familier (cerf, poule, panda, pingouin des Landes, apprivoisé avec 2 ingrédients :
  suit le joueur, ramasse les ingrédients, un don par espèce).
- v32 : pièces d’or (S.or) ; Échoppe de l’Artisan à Brumepont (baguettes, robes, rachat des récoltes) ;
  6 baguettes et 6 robes (bonus de puissance, mana, vitesse, vie, critiques ; couleur de robe et lueur de baguette) ;
  Baguette du dragon sur Ignivor, équipement parfois sur les élites. Prochaine étape possible : terrain et maison (or).
- v32.1 (mêlée) : contact créature = séparation douce (la créature recule, plus de projection de 0,8 m par image :
  pointes à 39 m/s mesurées, maintenant 8,5) ; direction de marche : suit toute rotation de caméra sauf la caméra
  automatique (CAMA.autoAcc) ; caméra manuelle : plus de petit recentrage après un sort (camNudge).
- v33 : le Domaine (terrain 300 🪙 près de Brumepont ; maison 600 🪙 en 3 styles, jardin 4 parcelles 200 🪙, chaudron
  150 🪙, lanternes et fleurs 80 🪙) ; maison = repos, réveil après évanouissement, Pierre de rappel.
- v34 : joystick en arrière = le joueur recule face à l’avant (plus de demi-tour de caméra, PLBACK) ; Démantibulus
  respecte le point marqué ; Proteggo (bulle de mana qui s’use, se renforce en relançant dedans, Maxima en charge
  pleine, arrête les tirs, repousse les créatures, absorbe les coups) ; construction (Construo : murs, palissade,
  porte, tour, plateforme en l’air, mur de cristal ; bois et pierre ; destruction progressive par sorts, siège et
  feu ; Reparo par étapes ; enchantement d’incassabilité ; seules les constructions du joueur cassent).
- v34.1 (maniabilité) : la marche suit toujours la caméra (plus de direction retenue) ; caméra auto seulement en
  avançant (|écart| < 0,9) ; recul plus vif (3,8 / 5,2 m/s).
- v34.2 : mode de caméra « derrière moi (+ combat) » (par défaut pour une nouvelle partie) : la caméra revient
  toujours derrière le personnage, virages et demi-tours compris. Les 4 modes restent au choix (Options ⚙).
- v35 : caméra « derrière moi » (sans cadrage de combat) en plus de « derrière moi (+ combat) » ; briques (pierre,
  bois, poutre, dalle, cristal qui flotte) : s’empilent, tombent, poussées par le vent, soulevées par l’Arcane,
  dispersées par les explosions, brûlées, figées ; s’abîment et cassent ; Reparo ; InstancedMesh par type.
- v36 : Construo en roulette (les 6 boutons deviennent les constructions, 1er toucher = aperçu lumineux qui suit
  le joueur et la caméra, 2e = poser, ➡ page suivante, ⇄ quitter). À faire : incassabilité des briques.
- v37 : briques incassables (case ✨ de la roulette) ; **Atelier v1 (créatures)** : ?atelier sur PC, fiche + aperçu 3D +
  enregistrement dans src/contenu + test en jeu. Suite prévue : objets, personnages, sorts, lieux ; structures
  toutes faites ; IA créatrice branchée sur l'Atelier.
- Course céleste : 11 anneaux entre les Îles du Miroir-Ciel (départ sur la 1re île), record S.craceBest.

## Idées autour de la construction (vision du joueur : conquête, protection de village)
- Attaques de village par des vagues qui visent les constructions ; alliés (PNJ) qui lancent Proteggo avec toi ;
  plans (escaliers, toits) ; multijoueur un jour (plusieurs sorciers qui unissent leurs Proteggo).

## Monde réaliste (souhait du joueur, 2026-11-15)
- Le joueur précise : « réaliste mais que ça reste un jeu » ; garder le style actuel et le soigner.
- itch.io bloque les téléchargements automatiques (Cloudflare) : le joueur peut déposer les packs dans assets/brut.
- Essai de photos CC0 Poly Haven à la place des textures peintes (tools/textures.mjs) : presque invisible
  (les photos lissées de loin), donc pas intégré. Le vrai gain viendrait de modèles (rochers, arbres,
  créatures) et de cartes de relief, plus lourds sur téléphone : à décider avec le joueur.

## Idées proposées, pas encore faites
- Domaine : intérieur de la maison (meubles à acheter), animaux du familier au jardin ; pêche magique, donjon sous le Pic de
  Givrecorne, tournoi à l’Arène (5 duels d’affilée).

## Idées proposées par le joueur, pas encore faites
- Acheter un terrain, l'aménager, y faire pousser des plantes (demande une monnaie et des achats).
- D'autres invocations, d'autres séries rares.

## En attente d'une décision du joueur
- Personnages modulaires Quaternius (zips déposés le 2026-11-14 dans assets/brut, décompressés dans
  zip-modular-a / zip-modular-b) : maquette faite (apprentie en robe noire, apprenti à capuche), rien
  d'intégré. Il a demandé qu'on lui demande avant de changer quoi que ce soit avec ces fichiers.

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
