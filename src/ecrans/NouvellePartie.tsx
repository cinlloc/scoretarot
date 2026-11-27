import { useState, type FormEvent } from 'react';
import { memeNom } from '../partie/partie';
import { Avatar, EnTeteEcran, Etiquette } from './commun';
import { BOUTON_OR } from './format';

const MINIMUM_JOUEURS = 3;
const MAXIMUM_JOUEURS = 5;

export function NouvellePartie({ onCommencer, onRetour }: {
  onCommencer: (noms: string[]) => void;
  onRetour: () => void;
}) {
  const [noms, setNoms] = useState<string[]>([]);
  const [saisie, setSaisie] = useState('');

  const nomSaisi = saisie.trim();
  const dejaPris = noms.some((nom) => memeNom(nom, nomSaisi));
  const peutAjouter = nomSaisi !== '' && !dejaPris && noms.length < MAXIMUM_JOUEURS;
  const peutCommencer = noms.length >= MINIMUM_JOUEURS && noms.length <= MAXIMUM_JOUEURS;

  function ajouter(evenement: FormEvent) {
    evenement.preventDefault();
    if (!peutAjouter) {
      return;
    }
    setNoms([...noms, nomSaisi]);
    setSaisie('');
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 py-6">
      <EnTeteEcran titre="Nouvelle partie" onRetour={onRetour} libelleRetour="Retour à l'accueil" />
      <section className="flex-1">
        <Etiquette>Joueurs, dans l'ordre de la table</Etiquette>
        <form onSubmit={ajouter} className="flex gap-2">
          <input
            value={saisie}
            onChange={(evenement) => setSaisie(evenement.target.value)}
            aria-label="Nom du joueur"
            placeholder="Nom du joueur"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border-[1.5px] border-trait bg-creux px-3 py-3 text-base outline-none placeholder:text-attenue focus:border-or"
          />
          <button
            type="submit"
            disabled={!peutAjouter}
            className="rounded-xl border-[1.5px] border-dashed border-or px-4 font-bold disabled:opacity-45"
          >
            Ajouter
          </button>
        </form>
        <ol className="mt-4 flex flex-col">
          {noms.map((nom) => (
            <li key={nom} className="flex items-center gap-3 border-b border-trait py-2">
              <Avatar nom={nom} petit />
              <span className="min-w-0 flex-1 truncate font-bold">{nom}</span>
              <button
                type="button"
                onClick={() => setNoms(noms.filter((autre) => autre !== nom))}
                aria-label={`Retirer ${nom}`}
                className="grid size-8 place-items-center rounded-full text-attenue"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      </section>
      <button type="button" className={BOUTON_OR} disabled={!peutCommencer} onClick={() => onCommencer(noms)}>
        Commencer{noms.length > 0 ? ` à ${noms.length}` : ''}
      </button>
    </main>
  );
}
