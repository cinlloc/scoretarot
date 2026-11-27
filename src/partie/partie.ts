import { calculerDonne, type Donne } from '../moteur/calculerDonne';

export type Joueur = {
  id: string;
  nom: string;
};

export type Partie = {
  id: string;
  description: string;
  date: string; // ISO 8601, date de création
  joueurs: string[]; // identifiants des joueurs, dans l'ordre des colonnes
  donnes: Donne[]; // de la plus ancienne à la plus récente
  statut: 'en-cours' | 'terminee';
};

export const ENCHERES: { enchere: Donne['enchere']; libelle: string; abrege: string; multiplicateur: number }[] = [
  { enchere: 'prise', libelle: 'Prise', abrege: 'P', multiplicateur: 1 },
  { enchere: 'garde', libelle: 'Garde', abrege: 'G', multiplicateur: 2 },
  { enchere: 'garde-sans', libelle: 'Garde sans', abrege: 'GS', multiplicateur: 4 },
  { enchere: 'garde-contre', libelle: 'Garde contre', abrege: 'GC', multiplicateur: 6 },
];

export function memeNom(nom: string, autre: string): boolean {
  const simplifier = (texte: string) =>
    texte.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr');
  return simplifier(nom) === simplifier(autre);
}

export function creerPartie(joueurs: Joueur[], maintenant: Date): Partie {
  const jour = maintenant.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return {
    id: crypto.randomUUID(),
    description: `Partie du ${jour}`,
    date: maintenant.toISOString(),
    joueurs: joueurs.map((joueur) => joueur.id),
    donnes: [],
    statut: 'en-cours',
  };
}

// Le preneur tourne d'une donne à l'autre, comme la donne autour de la table.
export function donneParDefaut(partie: Partie): Donne {
  const derniere = partie.donnes.at(-1);
  const preneur = derniere ? (derniere.preneur + 1) % partie.joueurs.length : 0;
  return {
    preneur,
    roiAppele: preneur,
    enchere: 'garde',
    bouts: { petit: false, vingtEtUn: false, excuse: false },
    pointsAttaque: 46,
    petitAuBout: null,
    poignee: null,
    chelem: { annonce: false, reussi: false },
  };
}

// Les totaux ne sont jamais stockés : ils sont toujours recalculés depuis les donnes.
export function calculerTotaux(partie: Partie): number[] {
  const totaux = partie.joueurs.map(() => 0);
  for (const donne of partie.donnes) {
    const { variations } = calculerDonne(donne, partie.joueurs.length);
    variations.forEach((variation, index) => {
      totaux[index] += variation;
    });
  }
  return totaux;
}
