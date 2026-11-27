import type { Partie } from '../partie/partie';
import { Etiquette } from './commun';
import { BOUTON_OR } from './format';

export function Accueil({ partieEnCours, onNouvellePartie, onReprendre }: {
  partieEnCours: Partie | undefined;
  onNouvellePartie: () => void;
  onReprendre: (partie: Partie) => void;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-4 py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">
        <span aria-hidden="true" className="mr-2 text-or">
          ♛
        </span>
        ScoreTarot
      </h1>
      <button type="button" className={BOUTON_OR} onClick={onNouvellePartie}>
        Nouvelle partie
      </button>
      {partieEnCours && (
        <section>
          <Etiquette>En cours</Etiquette>
          <button
            type="button"
            onClick={() => onReprendre(partieEnCours)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border-[1.5px] border-or bg-voile p-4 text-left"
          >
            <span className="min-w-0">
              <span className="block truncate font-extrabold">{partieEnCours.description}</span>
              <span className="text-sm text-attenue">
                {partieEnCours.donnes.length} donne{partieEnCours.donnes.length > 1 ? 's' : ''}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-attenue">Reprendre ›</span>
          </button>
        </section>
      )}
    </main>
  );
}
