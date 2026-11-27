import { describe, expect, test } from 'vitest';
import { calculerDonne, SEUILS_POIGNEE, type Donne } from './calculerDonne';

const SANS_BOUT = { petit: false, vingtEtUn: false, excuse: false };

function donne(champs: Partial<Donne> = {}): Donne {
  return {
    preneur: 0,
    roiAppele: 0,
    enchere: 'prise',
    bouts: SANS_BOUT,
    pointsAttaque: 56,
    petitAuBout: null,
    poignee: null,
    chelem: { annonce: false, reussi: false },
    ...champs,
  };
}

describe('seuil selon les bouts', () => {
  test('sans bout, le seuil est 56', () => {
    const resultat = calculerDonne(donne({ bouts: SANS_BOUT }), 4);
    expect(resultat.nombreBouts).toBe(0);
    expect(resultat.seuil).toBe(56);
  });

  test('avec 1 bout, le seuil est 51', () => {
    const resultat = calculerDonne(donne({ bouts: { ...SANS_BOUT, excuse: true } }), 4);
    expect(resultat.nombreBouts).toBe(1);
    expect(resultat.seuil).toBe(51);
  });

  test('avec 2 bouts, le seuil est 41', () => {
    const resultat = calculerDonne(donne({ bouts: { petit: true, vingtEtUn: true, excuse: false } }), 4);
    expect(resultat.nombreBouts).toBe(2);
    expect(resultat.seuil).toBe(41);
  });

  test('avec 3 bouts, le seuil est 36', () => {
    const resultat = calculerDonne(donne({ bouts: { petit: true, vingtEtUn: true, excuse: true } }), 4);
    expect(resultat.nombreBouts).toBe(3);
    expect(resultat.seuil).toBe(36);
  });
});

describe('faite ou chutée', () => {
  test('la donne est faite quand les points atteignent tout juste le seuil, avec un écart nul', () => {
    const resultat = calculerDonne(donne({ pointsAttaque: 56 }), 4);
    expect(resultat.faite).toBe(true);
    expect(resultat.ecart).toBe(0);
  });

  test('la donne est faite de 6 avec 62 points sans bout', () => {
    const resultat = calculerDonne(donne({ pointsAttaque: 62 }), 4);
    expect(resultat.faite).toBe(true);
    expect(resultat.ecart).toBe(6);
  });

  test("la donne est chutée de 1 quand il manque un point, l'écart restant positif", () => {
    const resultat = calculerDonne(donne({ pointsAttaque: 55 }), 4);
    expect(resultat.faite).toBe(false);
    expect(resultat.ecart).toBe(1);
  });
});

describe('valeur de base : (25 + écart) × multiplicateur', () => {
  test('une prise faite de 6 vaut 31 (multiplicateur 1)', () => {
    const resultat = calculerDonne(donne({ enchere: 'prise', pointsAttaque: 62 }), 4);
    expect(resultat.multiplicateur).toBe(1);
    expect(resultat.valeur).toBe(31);
  });

  test('une garde faite de 6 vaut 62 (multiplicateur 2)', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 62 }), 4);
    expect(resultat.multiplicateur).toBe(2);
    expect(resultat.valeur).toBe(62);
  });

  test('une garde sans faite de 6 vaut 124 (multiplicateur 4)', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde-sans', pointsAttaque: 62 }), 4);
    expect(resultat.multiplicateur).toBe(4);
    expect(resultat.valeur).toBe(124);
  });

  test('une garde contre faite de 6 vaut 186 (multiplicateur 6)', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde-contre', pointsAttaque: 62 }), 4);
    expect(resultat.multiplicateur).toBe(6);
    expect(resultat.valeur).toBe(186);
  });

  test('une garde chutée de 6 vaut -62', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 50 }), 4);
    expect(resultat.valeur).toBe(-62);
  });
});

describe('petit au bout : ± 10 × multiplicateur au profit du camp qui le mène', () => {
  test("mené par l'attaque sur une garde faite de 6, il ajoute 20", () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 62, petitAuBout: 'attaque' }), 4);
    expect(resultat.valeur).toBe(82);
  });

  test('mené par la défense sur une garde faite de 6, il retire 20', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 62, petitAuBout: 'defense' }), 4);
    expect(resultat.valeur).toBe(42);
  });

  test("mené par l'attaque sur une garde chutée de 6, il réduit la perte de 20", () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 50, petitAuBout: 'attaque' }), 4);
    expect(resultat.valeur).toBe(-42);
  });
});

describe('poignée : 20, 30 ou 40, non multipliée, au profit du camp gagnant', () => {
  test('une poignée simple sur une garde faite de 6 ajoute 20', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 62, poignee: 'simple' }), 4);
    expect(resultat.valeur).toBe(82);
  });

  test('une poignée double sur une garde faite de 6 ajoute 30', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 62, poignee: 'double' }), 4);
    expect(resultat.valeur).toBe(92);
  });

  test('une poignée triple sur une garde faite de 6 ajoute 40', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 62, poignee: 'triple' }), 4);
    expect(resultat.valeur).toBe(102);
  });

  test('une poignée simple sur une garde chutée de 6 profite à la défense : -82', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 50, poignee: 'simple' }), 4);
    expect(resultat.valeur).toBe(-82);
  });

  test('une poignée double sur une garde chutée de 6 profite à la défense : -92', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 50, poignee: 'double' }), 4);
    expect(resultat.valeur).toBe(-92);
  });

  test('une poignée triple sur une garde chutée de 6 profite à la défense : -102', () => {
    const resultat = calculerDonne(donne({ enchere: 'garde', pointsAttaque: 50, poignee: 'triple' }), 4);
    expect(resultat.valeur).toBe(-102);
  });
});

describe("chelem de l'attaque", () => {
  test('annoncé et réussi, il ajoute 400', () => {
    const resultat = calculerDonne(
      donne({ enchere: 'garde', pointsAttaque: 62, chelem: { annonce: true, reussi: true } }),
      4,
    );
    expect(resultat.valeur).toBe(462);
  });

  test('annoncé et raté, il retire 200', () => {
    const resultat = calculerDonne(
      donne({ enchere: 'garde', pointsAttaque: 62, chelem: { annonce: true, reussi: false } }),
      4,
    );
    expect(resultat.valeur).toBe(-138);
  });

  test('non annoncé et réussi, il ajoute 200', () => {
    const resultat = calculerDonne(
      donne({ enchere: 'garde', pointsAttaque: 62, chelem: { annonce: false, reussi: true } }),
      4,
    );
    expect(resultat.valeur).toBe(262);
  });
});

describe('répartition entre les joueurs (garde faite de 6, valeur 62)', () => {
  const gardeFaite = { enchere: 'garde', pointsAttaque: 62 } as const;

  test("à 3, le preneur reçoit 2 × valeur et chaque défenseur −valeur, roiAppele ignoré", () => {
    const resultat = calculerDonne(donne({ ...gardeFaite, preneur: 1, roiAppele: 2 }), 3);
    expect(resultat.variations).toEqual([-62, 124, -62]);
  });

  test('à 4, le preneur reçoit 3 × valeur et chaque défenseur −valeur, roiAppele ignoré', () => {
    const resultat = calculerDonne(donne({ ...gardeFaite, preneur: 2, roiAppele: 0 }), 4);
    expect(resultat.variations).toEqual([-62, -62, 186, -62]);
  });

  test("à 5 avec un roi appelé, le preneur reçoit 2 × valeur, l'appelé 1 × valeur, chaque défenseur −valeur", () => {
    const resultat = calculerDonne(donne({ ...gardeFaite, preneur: 0, roiAppele: 3 }), 5);
    expect(resultat.variations).toEqual([124, -62, -62, 62, -62]);
  });

  test("à 5, le preneur qui s'appelle lui-même joue seul et reçoit 4 × valeur", () => {
    const resultat = calculerDonne(donne({ ...gardeFaite, preneur: 4, roiAppele: 4 }), 5);
    expect(resultat.variations).toEqual([-62, -62, -62, -62, 248]);
  });

  test('la somme des variations est nulle, même chutée avec toutes les annonces', () => {
    const donneChargee = donne({
      preneur: 1,
      roiAppele: 2,
      enchere: 'garde-contre',
      pointsAttaque: 30,
      petitAuBout: 'defense',
      poignee: 'triple',
      chelem: { annonce: true, reussi: false },
    });
    for (const nombreJoueurs of [3, 4, 5]) {
      const { variations } = calculerDonne(donneChargee, nombreJoueurs);
      expect(variations.reduce((somme, variation) => somme + variation, 0)).toBe(0);
    }
  });
});

describe('cas de référence validés dans le prototype', () => {
  const deuxBouts = { petit: true, vingtEtUn: true, excuse: false };

  test('garde, 2 bouts, 47 points, petit au bout attaque, à 5 avec appelé : valeur 82, preneur +164, appelé +82, défenseurs −82', () => {
    const resultat = calculerDonne(
      donne({ preneur: 0, roiAppele: 1, enchere: 'garde', bouts: deuxBouts, pointsAttaque: 47, petitAuBout: 'attaque' }),
      5,
    );
    expect(resultat.valeur).toBe(82);
    expect(resultat.variations).toEqual([164, 82, -82, -82, -82]);
  });

  test('même donne, preneur seul à 5 : preneur +328', () => {
    const resultat = calculerDonne(
      donne({ preneur: 0, roiAppele: 0, enchere: 'garde', bouts: deuxBouts, pointsAttaque: 47, petitAuBout: 'attaque' }),
      5,
    );
    expect(resultat.variations).toEqual([328, -82, -82, -82, -82]);
  });

  test('garde, 2 bouts, 40 points, poignée simple : chutée de 1, valeur −72', () => {
    const resultat = calculerDonne(
      donne({ enchere: 'garde', bouts: deuxBouts, pointsAttaque: 40, poignee: 'simple' }),
      4,
    );
    expect(resultat.faite).toBe(false);
    expect(resultat.ecart).toBe(1);
    expect(resultat.valeur).toBe(-72);
  });

  test('garde, 2 bouts, 91 points, chelem annoncé réussi : valeur 550', () => {
    const resultat = calculerDonne(
      donne({ enchere: 'garde', bouts: deuxBouts, pointsAttaque: 91, chelem: { annonce: true, reussi: true } }),
      4,
    );
    expect(resultat.valeur).toBe(550);
  });

  test('garde, 2 bouts, 60 points, chelem annoncé raté : valeur −112', () => {
    const resultat = calculerDonne(
      donne({ enchere: 'garde', bouts: deuxBouts, pointsAttaque: 60, chelem: { annonce: true, reussi: false } }),
      4,
    );
    expect(resultat.valeur).toBe(-112);
  });

  test('4 joueurs, garde, 2 bouts, 47 points : preneur +186', () => {
    const resultat = calculerDonne(donne({ preneur: 0, enchere: 'garde', bouts: deuxBouts, pointsAttaque: 47 }), 4);
    expect(resultat.variations[0]).toBe(186);
  });

  test('3 joueurs, prise, 0 bout, 50 points : preneur −62', () => {
    const resultat = calculerDonne(donne({ preneur: 0, enchere: 'prise', bouts: SANS_BOUT, pointsAttaque: 50 }), 3);
    expect(resultat.variations[0]).toBe(-62);
  });
});

describe('seuils des poignées (affichage)', () => {
  test('à 3 joueurs : 13 / 15 / 18 atouts', () => {
    expect(SEUILS_POIGNEE[3]).toEqual({ simple: 13, double: 15, triple: 18 });
  });

  test('à 4 joueurs : 10 / 13 / 15 atouts', () => {
    expect(SEUILS_POIGNEE[4]).toEqual({ simple: 10, double: 13, triple: 15 });
  });

  test('à 5 joueurs : 8 / 10 / 13 atouts', () => {
    expect(SEUILS_POIGNEE[5]).toEqual({ simple: 8, double: 10, triple: 13 });
  });
});
