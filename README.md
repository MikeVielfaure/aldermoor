# Aldermoor — Académie des Arcanes

RPG de sorcier en 3D pour navigateur et téléphone, avec un Maître du Jeu.

## Jouer

- **En ligne** (une fois GitHub Pages activé) : https://mikevielfaure.github.io/aldermoor/
  Sur téléphone : ouvrir le lien, puis « Ajouter à l'écran d'accueil » pour l'avoir en plein écran comme une appli.
- **Sur cet ordinateur** : `npm install` (une seule fois), puis `npm run serve` et ouvrir http://localhost:5173.
  On peut aussi ouvrir directement `dist/index.html`.

## Brancher le Maître du Jeu IA (ta clé Claude)

1. Créer une clé sur https://platform.claude.com → « API keys ». C'est un compte séparé de
   l'abonnement claude.ai : il faut y mettre un peu de crédit. Pense à fixer une limite de dépense.
2. Dans le jeu : écran d'accueil → « Maître du Jeu IA : brancher ma clé Claude » (ou Options ⚙ en jeu),
   coller la clé, « Enregistrer et tester ».

La clé reste sur ton appareil : elle n'est ni dans le code, ni sur GitHub. Sans clé, un Maître du Jeu
classique (sans IA) fait vivre le monde.

## Mettre le jeu en ligne avec GitHub Pages

1. Sur GitHub : Settings → Pages → Source : « GitHub Actions ».
   (Avec un compte gratuit, le dépôt doit être public.)
2. Onglet Actions → « Publier le jeu » → « Run workflow ». Ensuite, chaque `git push` republie le jeu.

## Modifier le jeu

Le code est dans `src/` (voir `CLAUDE.md` pour le plan). Après une modification :
`npm run build` reconstruit `dist/`, `npm test` fait jouer un bot pour vérifier.

`sauvegardes/` contient les versions précédentes complètes (un fichier = un jeu jouable).
