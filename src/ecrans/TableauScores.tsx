import { useState } from 'react';
import { calculerDonne } from '../moteur/calculerDonne';
import { calculerTotaux, ENCHERES, meneurs, type Partie } from '../partie/partie';
import { Confirmation, EnTeteEcran } from './commun';
import { BOUTON_OR, BOUTON_SECONDAIRE, couleurVariation, formaterDate, nombreDeDonnes, signe } from './format';

export function TableauScores({ partie, noms, onNouvelleDonne, onSupprimerDerniereDonne, onTerminer, onRetour }: {
  partie: Partie;
  noms: string[];
  onNouvelleDonne: () => void;
  onSupprimerDerniereDonne: () => void;
  onTerminer: () => void;
  onRetour: () => void;
}) {
  const [aConfirmer, setAConfirmer] = useState<'supprimer' | 'terminer' | null>(null);
  const totaux = calculerTotaux(partie);
  const meilleur = Math.max(...totaux);
  const enTete = meneurs(partie);
  const nombreDonnes = partie.donnes.length;
  const enCours = partie.statut === 'en-cours';

  let annonceTete = 'Aucune donne pour l’instant';
  if (enTete.length === 1) {
    const deuxieme = Math.max(...totaux.filter((_, joueur) => joueur !== enTete[0]));
    const ecart = meilleur - deuxieme;
    annonceTete = `${noms[enTete[0]]} mène de ${ecart} point${ecart > 1 ? 's' : ''}`;
  }
  if (enTete.length > 1) {
    annonceTete = `Égalité en tête à ${signe(meilleur)}`;
  }

  const lignes = partie.donnes
    .map((donne, index) => ({ donne, numero: index + 1, resultat: calculerDonne(donne, noms.length) }))
    .reverse();

  return (
    <main className="mx-auto flex h-dvh max-w-xl flex-col gap-4 px-4 py-6">
      <EnTeteEcran
        titre={partie.description}
        sousTitre={enCours ? formaterDate(partie.date) : `Terminée · ${formaterDate(partie.date)}`}
        onRetour={onRetour}
        libelleRetour="Retour à l'accueil"
      />
      <p className="flex justify-between text-sm font-semibold text-attenue">
        <span className="text-texte">{annonceTete}</span>
        <span>{nombreDeDonnes(nombreDonnes)}</span>
      </p>

      <div className="min-h-0 flex-1 overflow-auto rounded-2xl bg-feuille text-feuille-encre">
        {nombreDonnes === 0 ? (
          <p className="px-5 py-8 text-center text-feuille-attenue">
            Les donnes s’afficheront ici, la plus récente en haut.
          </p>
        ) : (
          <table className="w-full table-fixed border-collapse tabular-nums">
            <thead className="sticky top-0 bg-feuille">
              <tr>
                <th className="w-24 py-2 pl-3 text-left text-xs">
                  <span className="sr-only">Donne</span>
                </th>
                {noms.map((nom, joueur) => (
                  <th
                    key={joueur}
                    scope="col"
                    className="truncate px-1 pt-2 text-right text-xs font-bold text-feuille-attenue last:pr-3"
                  >
                    {nom}
                  </th>
                ))}
              </tr>
              <tr className="border-b-2 border-feuille-encre">
                <th scope="row" className="pb-2 pl-3 text-left text-sm font-extrabold">
                  Total
                </th>
                {totaux.map((total, joueur) => (
                  <td
                    key={joueur}
                    className={`px-1 pb-2 text-right font-mono text-sm font-extrabold last:pr-3 ${enTete.includes(joueur) ? 'text-or-encre' : ''}`}
                  >
                    {signe(total)}
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {lignes.map(({ donne, numero, resultat }) => {
                const enchere = ENCHERES.find((choix) => choix.enchere === donne.enchere);
                return (
                  <tr key={numero} className="border-b border-feuille-trait">
                    <th scope="row" className="py-2 pl-3 text-left text-xs font-normal whitespace-nowrap text-feuille-attenue">
                      <b className="text-feuille-encre">{numero}</b> ⚔{' '}
                      <span className="inline-block max-w-11 truncate align-bottom">{noms[donne.preneur]}</span>{' '}
                      {enchere?.abrege}{' '}
                      <span aria-hidden="true">{resultat.faite ? '✓' : '✗'}</span>
                      <span className="sr-only">{resultat.faite ? 'faite' : 'chutée'}</span>
                    </th>
                    {resultat.variations.map((variation, joueur) => (
                      <td
                        key={joueur}
                        className={`px-1 py-2 text-right font-mono text-sm last:pr-3 ${couleurVariation(variation)} ${joueur === donne.preneur ? 'bg-or/20 font-bold' : ''}`}
                      >
                        {signe(variation)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {enCours && aConfirmer === 'terminer' && (
        <Confirmation
          question="Terminer la partie ?"
          detail="Elle passera dans les parties terminées : on ne pourra plus y ajouter de donne."
          libelleConfirmer="Terminer"
          onConfirmer={onTerminer}
          onAnnuler={() => setAConfirmer(null)}
        />
      )}
      {enCours && aConfirmer === 'supprimer' && (
        <Confirmation
          question={`Supprimer la donne ${nombreDonnes} ?`}
          detail="Les totaux seront recalculés sans elle."
          libelleConfirmer="Supprimer"
          onConfirmer={() => {
            setAConfirmer(null);
            onSupprimerDerniereDonne();
          }}
          onAnnuler={() => setAConfirmer(null)}
        />
      )}
      {enCours && aConfirmer === null && (
        <div className="flex flex-col gap-2">
          <button type="button" className={BOUTON_OR} onClick={onNouvelleDonne}>
            Nouvelle donne
          </button>
          <div className="flex gap-2">
            {nombreDonnes > 0 && (
              <button type="button" className={BOUTON_SECONDAIRE} onClick={() => setAConfirmer('supprimer')}>
                Supprimer la dernière donne
              </button>
            )}
            <button type="button" className={BOUTON_SECONDAIRE} onClick={() => setAConfirmer('terminer')}>
              Terminer la partie
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
