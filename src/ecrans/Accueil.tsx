import { calculerTotaux, meneurs, type Partie } from '../partie/partie';
import { Avatar } from './commun';
import { BOUTON_OR, formaterDate, nombreDeDonnes, signe } from './format';

function couleurTotal(total: number) {
  if (total > 0) {
    return 'text-gain';
  }
  if (total < 0) {
    return 'text-perte';
  }
  return '';
}

function CartePartieEnCours({ partie, noms, onOuvrir }: {
  partie: Partie;
  noms: string[];
  onOuvrir: () => void;
}) {
  const totaux = calculerTotaux(partie);
  const classement = noms
    .map((nom, joueur) => ({ joueur, nom, total: totaux[joueur] }))
    .sort((un, autre) => autre.total - un.total);
  const enTete = meneurs(partie);
  let situation = 'Pas encore de donne';
  if (enTete.length === 1) {
    situation = `${noms[enTete[0]]} mène`;
  }
  if (enTete.length > 1) {
    situation = 'Égalité en tête';
  }
  const titreId = `partie-${partie.id}`;

  return (
    <article
      aria-labelledby={titreId}
      className="relative flex flex-col gap-3 rounded-2xl border-[1.5px] border-or bg-voile p-4"
    >
      <header>
        <h3 id={titreId} className="truncate font-extrabold">
          {partie.description}
        </h3>
        <span className="text-xs font-semibold text-attenue">
          {formaterDate(partie.date)} · {nombreDeDonnes(partie.donnes.length)}
        </span>
      </header>
      <ol aria-label="Classement" className="flex gap-1 text-center text-xs font-semibold">
        {classement.map(({ joueur, nom, total }) => (
          <li key={joueur} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
            <Avatar nom={nom} petit />
            <span className="w-full truncate">{nom}</span>
            <b className={`font-mono text-sm ${couleurTotal(total)}`}>{signe(total)}</b>
          </li>
        ))}
      </ol>
      <p className="flex items-center justify-between text-sm font-semibold text-attenue">
        <span>{situation}</span>
        {/* Le bouton s'étend sur toute la carte : un toucher n'importe où la reprend. */}
        <button type="button" onClick={onOuvrir} className="after:absolute after:inset-0 after:rounded-2xl">
          Reprendre ›
        </button>
      </p>
    </article>
  );
}

// Plusieurs noms en cas d'égalité en tête ; aucun pour une partie terminée sans donne.
function Gagnant({ noms }: { noms: string[] }) {
  if (noms.length === 0) {
    return <span className="shrink-0 text-xs text-attenue">Aucune donne</span>;
  }
  return (
    <span className="shrink-0 text-xs font-bold whitespace-nowrap text-attenue">
      <span aria-hidden="true" className="mr-1 text-or">
        ♛
      </span>
      <span className="sr-only">{noms.length > 1 ? 'Gagnants : ' : 'Gagnant : '}</span>
      {noms.join(' et ')}
    </span>
  );
}

export function Accueil({ parties, nomsDe, onNouvellePartie, onOuvrir }: {
  parties: Partie[];
  nomsDe: (partie: Partie) => string[];
  onNouvellePartie: () => void;
  onOuvrir: (partie: Partie) => void;
}) {
  const recentesDabord = [...parties].reverse();
  const enCours = recentesDabord.filter((partie) => partie.statut === 'en-cours');
  const terminees = recentesDabord.filter((partie) => partie.statut === 'terminee');

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
      {enCours.length > 0 && (
        <section aria-labelledby="titre-en-cours" className="flex flex-col gap-3">
          <h2 id="titre-en-cours" className="text-xs font-bold tracking-widest text-attenue uppercase">
            En cours
          </h2>
          {enCours.map((partie) => (
            <CartePartieEnCours key={partie.id} partie={partie} noms={nomsDe(partie)} onOuvrir={() => onOuvrir(partie)} />
          ))}
        </section>
      )}
      {terminees.length > 0 && (
        <section aria-labelledby="titre-terminees" className="flex flex-col gap-2">
          <h2 id="titre-terminees" className="text-xs font-bold tracking-widest text-attenue uppercase">
            Terminées
          </h2>
          <ul className="border-t border-trait">
            {terminees.map((partie) => (
              <li key={partie.id} className="border-b border-trait">
                <button
                  type="button"
                  onClick={() => onOuvrir(partie)}
                  className="flex w-full items-center gap-3 px-0.5 py-3 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <b className="block truncate">{partie.description}</b>
                    <small className="text-xs text-attenue">
                      {formaterDate(partie.date)} · {partie.joueurs.length} joueurs · {nombreDeDonnes(partie.donnes.length)}
                    </small>
                  </span>
                  <Gagnant noms={meneurs(partie).map((joueur) => nomsDe(partie)[joueur])} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
