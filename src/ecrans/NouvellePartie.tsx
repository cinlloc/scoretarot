import { useState, type FormEvent } from 'react';
import { memeNom, nomContient, type Joueur } from '../partie/partie';
import { Avatar, EnTeteEcran, Etiquette } from './commun';
import { BOUTON_OR } from './format';

const MINIMUM_JOUEURS = 3;
const MAXIMUM_JOUEURS = 5;

const CHAMP =
  'flex items-center gap-2 rounded-xl border-[1.5px] border-trait bg-creux px-3 focus-within:border-or';
const SAISIE = 'min-w-0 flex-1 bg-transparent py-3 text-base outline-none';

export function NouvellePartie({ joueurs, descriptionParDefaut, onAjouterJoueur, onCommencer, onRetour }: {
  joueurs: Joueur[];
  descriptionParDefaut: string;
  onAjouterJoueur: (nom: string) => Joueur;
  onCommencer: (description: string, joueurs: Joueur[]) => void;
  onRetour: () => void;
}) {
  const [description, setDescription] = useState(descriptionParDefaut);
  const [recherche, setRecherche] = useState('');
  // identifiants cochés, dans l'ordre de sélection : c'est l'ordre des colonnes de la partie
  const [choisis, setChoisis] = useState<string[]>([]);

  const nomCherche = recherche.trim();
  const affiches = joueurs
    .filter((joueur) => nomContient(joueur.nom, nomCherche))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
  const peutAjouter = nomCherche !== '' && !joueurs.some((joueur) => memeNom(joueur.nom, nomCherche));
  const peutCommencer = choisis.length >= MINIMUM_JOUEURS && choisis.length <= MAXIMUM_JOUEURS;

  function basculer(id: string) {
    if (choisis.includes(id)) {
      setChoisis(choisis.filter((autre) => autre !== id));
    } else {
      setChoisis([...choisis, id]);
    }
  }

  function ajouter(evenement: FormEvent) {
    evenement.preventDefault();
    if (!peutAjouter) {
      return;
    }
    const joueur = onAjouterJoueur(nomCherche);
    setChoisis([...choisis, joueur.id]);
    setRecherche('');
  }

  function commencer() {
    const joueursChoisis = choisis.map((id) => joueurs.find((joueur) => joueur.id === id)!);
    onCommencer(description.trim() || descriptionParDefaut, joueursChoisis);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 py-6">
      <EnTeteEcran titre="Nouvelle partie" onRetour={onRetour} libelleRetour="Retour à l'accueil" />
      <section>
        <Etiquette>Description</Etiquette>
        <div className={CHAMP}>
          <input
            value={description}
            onChange={(evenement) => setDescription(evenement.target.value)}
            aria-label="Description de la partie"
            autoComplete="off"
            className={SAISIE}
          />
        </div>
      </section>
      <section className="flex-1">
        <Etiquette>Joueurs</Etiquette>
        <form onSubmit={ajouter} className="flex flex-col gap-2">
          <div className={CHAMP}>
            <span aria-hidden="true" className="text-attenue">
              ⌕
            </span>
            <input
              value={recherche}
              onChange={(evenement) => setRecherche(evenement.target.value)}
              aria-label="Chercher ou ajouter un joueur"
              autoComplete="off"
              className={SAISIE}
            />
          </div>
          {peutAjouter && (
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border-[1.5px] border-dashed border-or px-3 py-2.5 text-left font-bold"
            >
              <span aria-hidden="true" className="text-or">
                +
              </span>
              Ajouter « {nomCherche} »
            </button>
          )}
        </form>
        <ul className="mt-2 flex flex-col">
          {affiches.map((joueur) => {
            const rang = choisis.indexOf(joueur.id) + 1;
            return (
              <li key={joueur.id}>
                <label className="flex cursor-pointer items-center gap-3 border-b border-trait py-2">
                  <input
                    type="checkbox"
                    checked={rang > 0}
                    onChange={() => basculer(joueur.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-md border-2 border-trait font-mono text-sm font-bold peer-checked:border-or peer-checked:bg-or peer-checked:text-sur-or peer-focus-visible:outline-2 peer-focus-visible:outline-or"
                  >
                    {rang > 0 ? rang : ''}
                  </span>
                  <Avatar nom={joueur.nom} petit enEvidence={rang > 0} />
                  <span className="min-w-0 flex-1 truncate font-bold">{joueur.nom}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>
      <button type="button" className={BOUTON_OR} disabled={!peutCommencer} onClick={commencer}>
        Commencer{choisis.length > 0 ? ` à ${choisis.length}` : ''}
      </button>
    </main>
  );
}
