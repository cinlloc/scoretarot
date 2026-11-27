# ScoreTarot

La feuille de marque du tarot à 3, 4 ou 5 joueurs (barème FFT), pensée pour le téléphone.
En ligne sur https://cinlloc.github.io/scoretarot/

Stack : React, TypeScript, Vite, Tailwind CSS, Vitest et Testing Library.

## Commandes

```bash
npm install         # installer les dépendances
npm run dev         # serveur de développement sur http://localhost:5173
npm test            # lancer les tests une fois
npm run typecheck   # vérifier les types
npm run build       # construire l'app dans dist/ (servie sous /scoretarot/)
npm run preview     # servir le build localement
```

## Organisation du code

- `src/App.tsx` : point d'entrée de l'interface.
- `src/index.css` : jetons de couleur « table de jeu » (clair et sombre selon le thème système), exposés à Tailwind (`bg-tapis`, `text-or`…).
- Rangement prévu pour la suite : `src/moteur/` (calcul des scores, sans React), `src/stockage/` (`localStorage`), `src/ecrans/` (les écrans).

## Déploiement

Chaque push sur `main` lance la GitHub Action qui vérifie les types, lance les tests, construit l'app et la publie sur GitHub Pages.
