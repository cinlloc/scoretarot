import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import App from './App';

type Utilisateur = ReturnType<typeof userEvent.setup>;

async function creerPartie(utilisateur: Utilisateur, noms: string[]) {
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
  for (const nom of noms) {
    await utilisateur.type(screen.getByRole('textbox', { name: 'Nom du joueur' }), `${nom}{Enter}`);
  }
  await utilisateur.click(screen.getByRole('button', { name: /^Commencer/ }));
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

test("« Commencer » n'est actif qu'à partir de 3 joueurs", async () => {
  const utilisateur = userEvent.setup();
  render(<App />);
  await utilisateur.click(screen.getByRole('button', { name: 'Nouvelle partie' }));
  const champ = screen.getByRole('textbox', { name: 'Nom du joueur' });
  await utilisateur.type(champ, 'Alice{Enter}');
  await utilisateur.type(champ, 'Bruno{Enter}');

  expect(screen.getByRole('button', { name: /^Commencer/ })).toBeDisabled();

  await utilisateur.type(champ, 'Chloé{Enter}');

  expect(screen.getByRole('button', { name: 'Commencer à 3' })).toBeEnabled();
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
