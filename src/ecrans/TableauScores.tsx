import { calculerDonne } from '../moteur/calculerDonne';
import { calculerTotaux, ENCHERES, type Partie } from '../partie/partie';
import { EnTeteEcran } from './commun';
import { BOUTON_OR, couleurVariation, signe } from './format';

export function TableauScores({ partie, noms, onNouvelleDonne, onRetour }: {
  partie: Partie;
  noms: string[];
  onNouvelleDonne: () => void;
  onRetour: () => void;
}) {
  const totaux = calculerTotaux(partie);
  const meilleur = Math.max(...totaux);
  const meneurs = totaux.flatMap((total, joueur) => (total === meilleur ? [joueur] : []));
  const nombreDonnes = partie.donnes.length;

  let annonceTete = 'Aucune donne pour l’instant';
  if (nombreDonnes > 0 && meneurs.length === 1) {
    const deuxieme = Math.max(...totaux.filter((_, joueur) => joueur !== meneurs[0]));
    const ecart = meilleur - deuxieme;
    annonceTete = `${noms[meneurs[0]]} mène de ${ecart} point${ecart > 1 ? 's' : ''}`;
  }
  if (nombreDonnes > 0 && meneurs.length > 1) {
    annonceTete = `Égalité en tête à ${signe(meilleur)}`;
  }

  const lignes = partie.donnes
    .map((donne, index) => ({ donne, numero: index + 1, resultat: calculerDonne(donne, noms.length) }))
    .reverse();

  return (
    <main className="mx-auto flex h-dvh max-w-xl flex-col gap-4 px-4 py-6">
      <EnTeteEcran titre={partie.description} onRetour={onRetour} libelleRetour="Retour à l'accueil" />
      <p className="flex justify-between text-sm font-semibold text-attenue">
        <span className="text-texte">{annonceTete}</span>
        <span>
          {nombreDonnes} donne{nombreDonnes > 1 ? 's' : ''}
        </span>
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
                    className={`px-1 pb-2 text-right font-mono text-sm font-extrabold last:pr-3 ${meneurs.includes(joueur) && nombreDonnes > 0 ? 'text-or-encre' : ''}`}
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

      <button type="button" className={BOUTON_OR} onClick={onNouvelleDonne}>
        Nouvelle donne
      </button>
    </main>
  );
}
