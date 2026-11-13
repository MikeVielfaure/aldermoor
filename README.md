# Aldermoor — Académie des Arcanes

RPG de sorcier en 3D pour navigateur, avec maître du jeu.

## Démarrer
1. Installer Node.js (version 18 ou plus).
2. Dans ce dossier : `npm install` (une seule fois).
3. `npm run serve` puis ouvrir http://localhost:5173 — ou ouvrir directement `dist/index.html`.

## Modifier le jeu
Le code est dans `src/` (voir `CLAUDE.md` pour le plan). Après une modification :
`npm run build` reconstruit `dist/index.html`, `npm test` fait jouer un bot pour vérifier.

`sauvegardes/` contient les versions précédentes complètes (un fichier = un jeu jouable).
