export type Donne = {
  preneur: number; // index du joueur dans la partie
  roiAppele: number; // à 5 : index de l'appelé ; égal au preneur s'il joue seul (ignoré à 3 et 4)
  enchere: 'prise' | 'garde' | 'garde-sans' | 'garde-contre';
  bouts: { petit: boolean; vingtEtUn: boolean; excuse: boolean };
  pointsAttaque: number; // 0 à 91
  petitAuBout: 'attaque' | 'defense' | null;
  poignee: 'simple' | 'double' | 'triple' | null;
  chelem: { annonce: boolean; reussi: boolean };
};

export type ResultatDonne = {
  nombreBouts: number;
  seuil: number;
  faite: boolean;
  ecart: number;
  multiplicateur: number;
  valeur: number; // valeur par défenseur, du point de vue de l'attaque
  variations: number[]; // indexé comme les joueurs de la partie
};

// Nombre d'atouts à montrer : sert à l'affichage, pas au calcul.
export const SEUILS_POIGNEE: Record<number, Record<NonNullable<Donne['poignee']>, number>> = {
  3: { simple: 13, double: 15, triple: 18 },
  4: { simple: 10, double: 13, triple: 15 },
  5: { simple: 8, double: 10, triple: 13 },
};

const SEUIL_PAR_NOMBRE_DE_BOUTS = [56, 51, 41, 36];

const MULTIPLICATEUR_PAR_ENCHERE: Record<Donne['enchere'], number> = {
  prise: 1,
  garde: 2,
  'garde-sans': 4,
  'garde-contre': 6,
};

const PRIME_PAR_POIGNEE = { simple: 20, double: 30, triple: 40 };

export function calculerDonne(donne: Donne, nombreJoueurs: number): ResultatDonne {
  const { petit, vingtEtUn, excuse } = donne.bouts;
  const nombreBouts = [petit, vingtEtUn, excuse].filter(Boolean).length;
  const seuil = SEUIL_PAR_NOMBRE_DE_BOUTS[nombreBouts];
  const faite = donne.pointsAttaque >= seuil;
  const ecart = Math.abs(donne.pointsAttaque - seuil);
  const multiplicateur = MULTIPLICATEUR_PAR_ENCHERE[donne.enchere];
  const base = (25 + ecart) * multiplicateur;
  let valeur = faite ? base : -base;
  if (donne.petitAuBout === 'attaque') {
    valeur += 10 * multiplicateur;
  }
  if (donne.petitAuBout === 'defense') {
    valeur -= 10 * multiplicateur;
  }
  if (donne.poignee !== null) {
    const primePoignee = PRIME_PAR_POIGNEE[donne.poignee];
    valeur += faite ? primePoignee : -primePoignee;
  }
  if (donne.chelem.annonce && donne.chelem.reussi) {
    valeur += 400;
  }
  if (donne.chelem.annonce && !donne.chelem.reussi) {
    valeur -= 200;
  }
  if (!donne.chelem.annonce && donne.chelem.reussi) {
    valeur += 200;
  }
  const variations = repartir(valeur, donne, nombreJoueurs);
  return { nombreBouts, seuil, faite, ecart, multiplicateur, valeur, variations };
}

function repartir(valeur: number, donne: Donne, nombreJoueurs: number): number[] {
  const avecAppele = nombreJoueurs === 5 && donne.roiAppele !== donne.preneur;
  const variations: number[] = [];
  for (let joueur = 0; joueur < nombreJoueurs; joueur++) {
    if (joueur === donne.preneur && avecAppele) {
      variations.push(2 * valeur);
    } else if (joueur === donne.preneur) {
      variations.push((nombreJoueurs - 1) * valeur);
    } else if (joueur === donne.roiAppele && avecAppele) {
      variations.push(valeur);
    } else {
      variations.push(-valeur);
    }
  }
  return variations;
}
