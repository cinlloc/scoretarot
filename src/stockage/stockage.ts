import type { Joueur, Partie } from '../partie/partie';

export type Sauvegarde = {
  version: 1;
  joueurs: Joueur[];
  parties: Partie[];
};

const CLE = 'scoretarot';

export function sauvegardeVide(): Sauvegarde {
  return { version: 1, joueurs: [], parties: [] };
}

export function charger(): Sauvegarde {
  const texte = localStorage.getItem(CLE);
  if (texte === null) {
    return sauvegardeVide();
  }
  try {
    const sauvegarde = JSON.parse(texte);
    if (sauvegarde.version === 1) {
      return sauvegarde;
    }
  } catch {
    // Une sauvegarde illisible ne doit pas empêcher d'ouvrir l'app.
  }
  // Mise de côté pour que le prochain enregistrement ne l'efface pas.
  localStorage.setItem(`${CLE}-illisible`, texte);
  return sauvegardeVide();
}

export function enregistrer(sauvegarde: Sauvegarde) {
  localStorage.setItem(CLE, JSON.stringify(sauvegarde));
}
