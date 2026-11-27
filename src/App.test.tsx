import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App';

type Utilisateur = ReturnType<typeof userEvent.setup>;

function champJoueur() {
  return screen.getByRole('textbox', { name: 'Chercher ou ajouter un joueur' });
}

// Entrée valide « Ajouter », qui enregistre le joueur et le coche.
async function ajouterJoueurs(utilisateur: Utilisateur, noms: string[]) {
  for (const nom of noms) {
    await utilisateur.type(champJoueur(), `${nom}{Enter}`);
  }
}

async function creerPartie(utilisateur: Utilisateur, noms: string[]) {
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
  await ajouterJoueurs(utilisateur, noms);
  await utilisateur.click(screen.getByRole('button', { name: /^Commencer/ }));
}

function verifierListe(noms: string[]) {
  const cases = screen.queryAllByRole('checkbox');
  expect(cases).toHaveLength(noms.length);
  noms.forEach((nom, index) => expect(cases[index]).toHaveAccessibleName(nom));
}

// Enregistre des joueurs via une première partie, puis ouvre une nouvelle partie vierge.
async function enregistrerJoueurs(utilisateur: Utilisateur, noms: string[]) {
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
  await ajouterJoueurs(utilisateur, noms);
  await utilisateur.click(screen.getByRole('button', { name: "Retour à l'accueil" }));
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
}

function siege(nom: string) {
  const camp = screen.getByRole('group', { name: "Camp de l'attaque" });
  return within(camp).getByRole('button', { name: new RegExp(nom) });
}

function reglerPoints(points: number) {
  fireEvent.change(screen.getByRole('slider', { name: "Points de l'attaque" }), {
    target: { value: String(points) },
  });
}

// Lit la case d'un joueur dans une ligne du tableau des scores, d'après l'en-tête de sa colonne.
function celluleDe(nom: string, ligne: HTMLElement) {
  const enTetes = within(screen.getByRole('table')).getAllByRole('columnheader');
  const colonne = enTetes.findIndex((enTete) => enTete.textContent === nom);
  // la première colonne est l'en-tête de ligne, pas une case de joueur
  return within(ligne).getAllByRole('cell')[colonne - 1];
}

function totalDe(nom: string) {
  const ligneTotal = screen.getByRole('row', { name: /^Total/ });
  return celluleDe(nom, ligneTotal).textContent;
}

test("l'accueil s'affiche avec le titre ScoreTarot", () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'ScoreTarot' })).toBeInTheDocument();
});

test('à 4, une garde faite de 6 avec 2 bouts et 47 points donne +186 au preneur et −62 aux autres', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé', 'David']);

  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(siege('Chloé'));
  await utilisateur.click(screen.getByRole('button', { name: 'Garde ×2' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Petit' }));
  await utilisateur.click(screen.getByRole('button', { name: '21' }));
  reglerPoints(47);
  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  expect(totalDe('Chloé')).toBe('+186');
  expect(totalDe('Alice')).toBe('−62');
  expect(totalDe('Bruno')).toBe('−62');
  expect(totalDe('David')).toBe('−62');
  // écart avec le deuxième : 186 − (−62)
  expect(screen.getByText('Chloé mène de 248 points')).toBeInTheDocument();
});

test('à 5, deux tapes désignent le preneur, une tape le roi appelé, et le tableau répartit ×2 / ×1 / −1', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé', 'David', 'Emma']);

  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(siege('Bruno'));
  await utilisateur.click(siege('Bruno'));
  await utilisateur.click(siege('Emma'));

  expect(within(siege('Bruno')).getByRole('img', { name: 'Preneur' })).toBeInTheDocument();
  expect(within(siege('Emma')).getByRole('img', { name: 'Roi appelé' })).toBeInTheDocument();
  for (const nom of ['Alice', 'Chloé', 'David']) {
    expect(within(siege(nom)).queryByRole('img')).not.toBeInTheDocument();
  }

  await utilisateur.click(screen.getByRole('button', { name: 'Garde ×2' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Petit' }));
  await utilisateur.click(screen.getByRole('button', { name: '21' }));
  reglerPoints(47);
  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  expect(totalDe('Bruno')).toBe('+124');
  expect(totalDe('Emma')).toBe('+62');
  expect(totalDe('Alice')).toBe('−62');
  expect(totalDe('Chloé')).toBe('−62');
  expect(totalDe('David')).toBe('−62');
});

test('un joueur ajouté depuis le champ est coché, puis proposé dans la partie suivante', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
  await utilisateur.type(champJoueur(), 'Alice');
  await utilisateur.click(screen.getByRole('button', { name: 'Ajouter « Alice »' }));

  expect(screen.getByRole('checkbox', { name: 'Alice' })).toBeChecked();
  expect(champJoueur()).toHaveValue('');

  await utilisateur.click(screen.getByRole('button', { name: "Retour à l'accueil" }));
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));

  expect(screen.getByRole('checkbox', { name: 'Alice' })).not.toBeChecked();
});

test('les joueurs enregistrés sont triés par ordre alphabétique et le filtre réduit la liste pendant la frappe', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await enregistrerJoueurs(utilisateur, ['Martin', 'élodie', 'Bruno', 'Marie']);

  verifierListe(['Bruno', 'élodie', 'Marie', 'Martin']);

  await utilisateur.type(champJoueur(), 'ma');

  verifierListe(['Marie', 'Martin']);

  await utilisateur.type(champJoueur(), 'rt');

  verifierListe(['Martin']);
});

test("« Ajouter » n'est pas proposé pour un nom existant, même avec une autre casse ou sans accent", async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await enregistrerJoueurs(utilisateur, ['Chloé']);

  for (const variante of ['CHLOÉ', 'Chloe', 'chloe']) {
    await utilisateur.clear(champJoueur());
    await utilisateur.type(champJoueur(), variante);

    expect(screen.queryByRole('button', { name: /^Ajouter/ })).not.toBeInTheDocument();
    verifierListe(['Chloé']);
  }

  await utilisateur.type(champJoueur(), 'e');

  expect(screen.getByRole('button', { name: 'Ajouter « chloee »' })).toBeInTheDocument();
});

test('« Commencer » est inactif à 2 et à 6 joueurs cochés, actif de 3 à 5', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
  await ajouterJoueurs(utilisateur, ['Alice', 'Bruno']);

  expect(screen.getByRole('button', { name: 'Commencer à 2' })).toBeDisabled();

  await ajouterJoueurs(utilisateur, ['Chloé']);
  expect(screen.getByRole('button', { name: 'Commencer à 3' })).toBeEnabled();
  await ajouterJoueurs(utilisateur, ['David']);
  expect(screen.getByRole('button', { name: 'Commencer à 4' })).toBeEnabled();
  await ajouterJoueurs(utilisateur, ['Emma']);
  expect(screen.getByRole('button', { name: 'Commencer à 5' })).toBeEnabled();
  await ajouterJoueurs(utilisateur, ['Fanny']);
  expect(screen.getByRole('button', { name: 'Commencer à 6' })).toBeDisabled();

  await utilisateur.click(screen.getByRole('checkbox', { name: 'Bruno' }));

  expect(screen.getByRole('button', { name: 'Commencer à 5' })).toBeEnabled();
});

test("l'ordre dans lequel on coche les joueurs fixe l'ordre des colonnes du tableau", async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await enregistrerJoueurs(utilisateur, ['Alice', 'Bruno', 'Chloé']);

  await utilisateur.click(screen.getByRole('checkbox', { name: 'Chloé' }));
  await utilisateur.click(screen.getByRole('checkbox', { name: 'Alice' }));
  await utilisateur.click(screen.getByRole('checkbox', { name: 'Bruno' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Commencer à 3' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  const enTetes = within(screen.getByRole('table')).getAllByRole('columnheader').slice(1);
  expect(enTetes.map((enTete) => enTete.textContent)).toEqual(['Chloé', 'Alice', 'Bruno']);
});

describe('description de la partie', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 26, 20, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('par défaut, elle contient la date du jour', async () => {
    const utilisateur = userEvent.setup();
    render(<App />);
    await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));

    expect(screen.getByRole('textbox', { name: 'Description de la partie' })).toHaveValue('Partie du jeudi 26 novembre');
  });

  test('elle est modifiable, et reprend la valeur datée si on la vide', async () => {
    const utilisateur = userEvent.setup();
    render(<App />);
    await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
    const description = screen.getByRole('textbox', { name: 'Description de la partie' });
    await utilisateur.clear(description);
    await utilisateur.type(description, 'Revanche chez Bruno');
    await ajouterJoueurs(utilisateur, ['Alice', 'Bruno', 'Chloé']);
    await utilisateur.click(screen.getByRole('button', { name: 'Commencer à 3' }));

    expect(screen.getByRole('heading', { name: 'Revanche chez Bruno' })).toBeInTheDocument();

    await utilisateur.click(screen.getByRole('button', { name: "Retour à l'accueil" }));
    await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
    await utilisateur.clear(screen.getByRole('textbox', { name: 'Description de la partie' }));
    await utilisateur.click(screen.getByRole('checkbox', { name: 'Alice' }));
    await utilisateur.click(screen.getByRole('checkbox', { name: 'Bruno' }));
    await utilisateur.click(screen.getByRole('checkbox', { name: 'Chloé' }));
    await utilisateur.click(screen.getByRole('button', { name: 'Commencer à 3' }));

    expect(screen.getByRole('heading', { name: 'Partie du jeudi 26 novembre' })).toBeInTheDocument();
  });
});

test("les joueurs enregistrés sont toujours là après un nouveau rendu de l'app", async () => {
  const utilisateur = userEvent.setup();
  const { unmount } = render(<App />);
  await enregistrerJoueurs(utilisateur, ['Bruno', 'Alice']);
  unmount();

  render(<App />);
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));

  verifierListe(['Alice', 'Bruno']);
});

test("la saisie dit combien il manque, puis de combien la donne est faite quand l'attaque atteint le seuil", async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé']);
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Excuse' }));
  reglerPoints(49);

  expect(screen.getByText('Il manque 2')).toBeInTheDocument();
  expect(screen.getByText(/Défense 42/)).toBeInTheDocument();

  await utilisateur.click(screen.getByRole('button', { name: 'Plus un point' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Plus un point' }));

  expect(screen.getByText('Faite de 0')).toBeInTheDocument();

  await utilisateur.click(screen.getByRole('button', { name: 'Plus un point' }));

  expect(screen.getByText('Faite de 1')).toBeInTheDocument();
});

test("la partie et ses donnes sont toujours là après un nouveau rendu de l'app", async () => {
  const utilisateur = userEvent.setup();
  const { unmount } = render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé', 'David']);
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(siege('Chloé'));
  await utilisateur.click(screen.getByRole('button', { name: 'Petit' }));
  await utilisateur.click(screen.getByRole('button', { name: '21' }));
  reglerPoints(47);
  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));
  unmount();

  render(<App />);
  await utilisateur.click(screen.getByRole('button', { name: /Reprendre/ }));

  expect(totalDe('Chloé')).toBe('+186');
  expect(totalDe('Alice')).toBe('−62');
  expect(screen.getByText('1 donne')).toBeInTheDocument();
});

test('les donnes vont de la plus récente à la plus ancienne et rappellent preneur, enchère et résultat', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé']);

  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Prise ×1' }));
  reglerPoints(56);
  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Garde contre ×6' }));
  reglerPoints(30);
  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  const lignes = within(screen.getByRole('table')).getAllByRole('row').slice(2);
  expect(lignes[0]).toHaveTextContent(/^2 ⚔ Bruno GC ✗/);
  expect(lignes[1]).toHaveTextContent(/^1 ⚔ Alice P ✓/);
});

function annonce(groupe: string, choix: string) {
  return within(screen.getByRole('group', { name: groupe })).getByRole('button', { name: new RegExp(choix) });
}

// Garde, Petit et 21 : la base commune des cas de référence de la spec.
async function saisirGardeDeuxBouts(utilisateur: Utilisateur, points: number) {
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Garde ×2' }));
  await utilisateur.click(screen.getByRole('button', { name: 'Petit' }));
  await utilisateur.click(screen.getByRole('button', { name: '21' }));
  reglerPoints(points);
}

test('à 4, un petit au bout attaque sur une garde faite de 6 ajoute 20 par défenseur au tableau', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé', 'David']);
  await saisirGardeDeuxBouts(utilisateur, 47);

  await utilisateur.click(annonce('Petit au bout', 'Attaque'));

  expect(screen.getByText('+20 par défenseur')).toBeInTheDocument();

  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  expect(totalDe('Alice')).toBe('+246');
  expect(totalDe('Bruno')).toBe('−82');
  expect(totalDe('Chloé')).toBe('−82');
  expect(totalDe('David')).toBe('−82');
});

test('une poignée simple sur une garde chutée de 1 donne −72 par défenseur', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé', 'David']);
  await saisirGardeDeuxBouts(utilisateur, 40);

  await utilisateur.click(annonce('Poignée', 'Simple'));

  expect(screen.getByText('Garde chutée de 1')).toBeInTheDocument();
  expect(screen.getByText('−72 / défenseur')).toBeInTheDocument();

  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  expect(totalDe('Alice')).toBe('−216');
  expect(totalDe('Bruno')).toBe('+72');
  expect(totalDe('Chloé')).toBe('+72');
  expect(totalDe('David')).toBe('+72');
});

test('à 3, un chelem annoncé et réussi sur une garde à 91 points vaut 550 par défenseur', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé']);
  await saisirGardeDeuxBouts(utilisateur, 91);

  await utilisateur.click(annonce('Chelem', 'Annoncé'));
  await utilisateur.click(annonce('Chelem', 'Réussi'));
  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  expect(totalDe('Alice')).toBe('+1100');
  expect(totalDe('Bruno')).toBe('−550');
  expect(totalDe('Chloé')).toBe('−550');
});

test('à 3, un chelem annoncé et raté sur une garde à 60 points vaut −112 par défenseur', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé']);
  await saisirGardeDeuxBouts(utilisateur, 60);

  await utilisateur.click(annonce('Chelem', 'Annoncé'));
  await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer la donne' }));

  expect(totalDe('Alice')).toBe('−224');
  expect(totalDe('Bruno')).toBe('+112');
  expect(totalDe('Chloé')).toBe('+112');
});

function variationAffichee(nom: string) {
  const variations = within(screen.getByRole('list', { name: 'Variations' })).getAllByRole('listitem');
  const caseDuJoueur = variations.find((element) => within(element).queryByText(nom));
  return caseDuJoueur?.lastElementChild?.textContent;
}

test('le pied d’écran suit chaque changement de la saisie, sans enregistrer la donne', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé', 'David']);
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));

  expect(screen.getByText('Garde chutée de 10')).toBeInTheDocument();
  expect(screen.getByText('−70 / défenseur')).toBeInTheDocument();
  expect(variationAffichee('Alice')).toBe('−210');
  expect(variationAffichee('Bruno')).toBe('+70');

  reglerPoints(50);

  expect(screen.getByText('Garde chutée de 6')).toBeInTheDocument();
  expect(screen.getByText('−62 / défenseur')).toBeInTheDocument();
  expect(variationAffichee('Alice')).toBe('−186');

  await utilisateur.click(screen.getByRole('button', { name: 'Petit' }));
  await utilisateur.click(screen.getByRole('button', { name: '21' }));

  expect(screen.getByText('Garde faite de 9')).toBeInTheDocument();
  expect(screen.getByText('+68 / défenseur')).toBeInTheDocument();
  expect(variationAffichee('Alice')).toBe('+204');

  await utilisateur.click(annonce('Poignée', 'Simple'));

  expect(annonce('Poignée', 'Simple')).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('+88 / défenseur')).toBeInTheDocument();
  expect(variationAffichee('David')).toBe('−88');

  await utilisateur.click(annonce('Poignée', 'Simple'));

  expect(annonce('Poignée', 'Simple')).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('+68 / défenseur')).toBeInTheDocument();

  await utilisateur.click(screen.getByRole('button', { name: 'Retour au tableau des scores' }));

  expect(screen.getByText('0 donne')).toBeInTheDocument();
});

test.each([
  [3, ['Alice', 'Bruno', 'Chloé'], ['13', '15', '18']],
  [4, ['Alice', 'Bruno', 'Chloé', 'David'], ['10', '13', '15']],
  [5, ['Alice', 'Bruno', 'Chloé', 'David', 'Emma'], ['8', '10', '13']],
])('à %i joueurs, les poignées simple, double et triple montrent le bon nombre d’atouts', async (_, noms, atouts) => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, noms);
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));

  expect(annonce('Poignée', 'Simple')).toHaveTextContent(`${atouts[0]} atouts · 20`);
  expect(annonce('Poignée', 'Double')).toHaveTextContent(`${atouts[1]} atouts · 30`);
  expect(annonce('Poignée', 'Triple')).toHaveTextContent(`${atouts[2]} atouts · 40`);
});

test('à 5, une tape sur le preneur le fait jouer seul', async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await creerPartie(utilisateur, ['Alice', 'Bruno', 'Chloé', 'David', 'Emma']);

  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle donne' }));
  await utilisateur.click(siege('Bruno'));
  await utilisateur.click(siege('Alice'));

  expect(within(siege('Alice')).getByRole('img', { name: 'Preneur' })).toBeInTheDocument();
  expect(within(siege('Alice')).getByRole('img', { name: 'Roi appelé' })).toBeInTheDocument();
  expect(within(siege('Bruno')).queryByRole('img')).not.toBeInTheDocument();
});
