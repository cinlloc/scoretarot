import { useState } from 'react';
import { calculerDonne, type Donne } from '../moteur/calculerDonne';
import { ENCHERES } from '../partie/partie';
import { Avatar, EnTeteEcran, Etiquette } from './commun';

const POINTS_TOTAL = 91;

const BOUTS: { cle: keyof Donne['bouts']; glyphe: string; libelle: string }[] = [
  { cle: 'petit', glyphe: '1', libelle: 'Petit' },
  { cle: 'vingtEtUn', glyphe: '21', libelle: '21' },
  { cle: 'excuse', glyphe: '★', libelle: 'Excuse' },
];

export function SaisieDonne({ noms, numero, description, donneInitiale, onEnregistrer, onRetour }: {
  noms: string[];
  numero: number;
  description: string;
  donneInitiale: Donne;
  onEnregistrer: (donne: Donne) => void;
  onRetour: () => void;
}) {
  const [donne, setDonne] = useState(donneInitiale);
  const nombreJoueurs = noms.length;
  const resultat = calculerDonne(donne, nombreJoueurs);

  // Une tape : roi appelé ; deux tapes : preneur ; une tape sur le preneur : il joue seul.
  // À 3 et 4, pas de roi appelé : une tape désigne le preneur.
  function toucherSiege(joueur: number) {
    if (nombreJoueurs < 5) {
      setDonne({ ...donne, preneur: joueur, roiAppele: joueur });
    } else if (joueur === donne.preneur) {
      setDonne({ ...donne, roiAppele: joueur });
    } else if (joueur === donne.roiAppele) {
      setDonne({ ...donne, preneur: joueur });
    } else {
      setDonne({ ...donne, roiAppele: joueur });
    }
  }

  function changerPoints(points: number) {
    setDonne({ ...donne, pointsAttaque: Math.min(POINTS_TOTAL, Math.max(0, points)) });
  }

  const tapis = resultat.faite ? 'from-tapis-vif to-tapis-vif-fonce' : 'from-tapis to-tapis-fonce';
  const remplissage = resultat.faite ? 'bg-linear-to-r from-or-sombre to-or' : 'bg-voile-fort';

  return (
    <div className={`min-h-dvh bg-radial-[120%_80%_at_50%_0%] ${tapis}`}>
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
        <main className="flex flex-1 flex-col gap-6 px-4 py-6">
          <EnTeteEcran
            titre={`Donne ${numero}`}
            sousTitre={description}
            onRetour={onRetour}
            libelleRetour="Retour au tableau des scores"
          />

          <section>
            <Etiquette>Camp de l'attaque</Etiquette>
            <div role="group" aria-label="Camp de l'attaque" className="flex justify-between px-1 pt-2">
              {noms.map((nom, joueur) => {
                const estPreneur = joueur === donne.preneur;
                // À 5, le preneur qui joue seul s'appelle lui-même : il porte l'épée et la couronne.
                const estRoiAppele = nombreJoueurs === 5 && joueur === donne.roiAppele;
                const dansAttaque = estPreneur || estRoiAppele;
                return (
                  <button
                    key={joueur}
                    type="button"
                    onClick={() => toucherSiege(joueur)}
                    className={`flex min-w-0 flex-col items-center gap-1 text-xs font-semibold ${dansAttaque ? 'text-texte' : 'text-attenue'}`}
                  >
                    <Avatar nom={nom} enEvidence={dansAttaque}>
                      {estPreneur && (
                        <span
                          role="img"
                          aria-label="Preneur"
                          className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-or text-xs text-sur-or"
                        >
                          ⚔
                        </span>
                      )}
                      {estRoiAppele && (
                        <span
                          role="img"
                          aria-label="Roi appelé"
                          className={`absolute -top-1.5 grid size-6 place-items-center rounded-full bg-feuille text-xs text-feuille-encre ${estPreneur ? '-left-1.5' : '-right-1.5'}`}
                        >
                          👑
                        </span>
                      )}
                    </Avatar>
                    <span className="max-w-16 truncate">{nom}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <Etiquette>Enchère</Etiquette>
            <div className="grid h-32 grid-cols-4 items-end gap-1.5">
              {ENCHERES.map((enchere, rang) => {
                const choisie = enchere.enchere === donne.enchere;
                return (
                  <button
                    key={enchere.enchere}
                    type="button"
                    aria-pressed={choisie}
                    onClick={() => setDonne({ ...donne, enchere: enchere.enchere })}
                    style={{ height: `${44 + rang * 18}%` }}
                    className={`flex flex-col justify-between rounded-t-xl rounded-b-sm p-2 text-left text-sm leading-tight font-extrabold ${choisie ? 'bg-or text-sur-or' : 'bg-voile-fort'}`}
                  >
                    <span>{enchere.libelle}</span>{' '}
                    <span className={`font-mono text-base ${choisie ? '' : 'text-or'}`}>×{enchere.multiplicateur}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <Etiquette>Bouts de l'attaque</Etiquette>
            <div className="flex gap-3">
              {BOUTS.map((bout) => {
                const coche = donne.bouts[bout.cle];
                return (
                  <button
                    key={bout.cle}
                    type="button"
                    aria-pressed={coche}
                    aria-label={bout.libelle}
                    onClick={() => setDonne({ ...donne, bouts: { ...donne.bouts, [bout.cle]: !coche } })}
                    className={`flex size-16 flex-col items-center justify-center rounded-full border-2 text-lg leading-none font-extrabold ${coche ? 'border-or bg-or text-sur-or' : 'border-dashed border-trait'}`}
                  >
                    {bout.glyphe}
                    <span className={`mt-1 text-[0.6rem] font-semibold tracking-wide uppercase ${coche ? '' : 'text-attenue'}`}>
                      {bout.libelle}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <Etiquette>⚔ Points de l'attaque</Etiquette>
            <div className="relative h-12 overflow-hidden rounded-xl bg-creux">
              <div
                className={`absolute inset-y-0 left-0 ${remplissage}`}
                style={{ width: `${(donne.pointsAttaque / POINTS_TOTAL) * 100}%` }}
              />
              <div
                className="absolute inset-y-0 -ml-px w-[3px] bg-texte"
                style={{ left: `${(resultat.seuil / POINTS_TOTAL) * 100}%` }}
              >
                <span className="absolute top-1 left-2 text-[0.66rem] font-extrabold whitespace-nowrap">
                  seuil {resultat.seuil}
                </span>
              </div>
              <div className="absolute top-1/2 right-3 -translate-y-1/2 font-mono text-2xl font-bold">
                {donne.pointsAttaque}
                <span className="text-xs opacity-75"> / {POINTS_TOTAL}</span>
              </div>
            </div>
            <div className="mt-1.5 flex justify-between text-sm text-attenue">
              <span aria-live="polite" className={resultat.faite ? 'font-bold text-texte' : ''}>
                {resultat.faite ? `Faite de ${resultat.ecart}` : `Il manque ${resultat.ecart}`}
              </span>
              <span>🛡 Défense {POINTS_TOTAL - donne.pointsAttaque}</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                aria-label="Moins un point"
                onClick={() => changerPoints(donne.pointsAttaque - 1)}
                className="size-10 shrink-0 rounded-full border-[1.5px] border-trait text-xl font-bold"
              >
                −
              </button>
              <input
                type="range"
                min={0}
                max={POINTS_TOTAL}
                value={donne.pointsAttaque}
                onChange={(evenement) => changerPoints(Number(evenement.target.value))}
                aria-label="Points de l'attaque"
                className="w-full accent-or"
              />
              <button
                type="button"
                aria-label="Plus un point"
                onClick={() => changerPoints(donne.pointsAttaque + 1)}
                className="size-10 shrink-0 rounded-full border-[1.5px] border-trait text-xl font-bold"
              >
                +
              </button>
            </div>
          </section>
        </main>

        <footer className="sticky bottom-0 flex flex-col gap-3 rounded-t-3xl bg-feuille px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-feuille-encre shadow-[0_-4px_20px_rgb(0_0_0/0.12)]">
          <button
            type="button"
            onClick={() => onEnregistrer(donne)}
            className="rounded-2xl bg-action p-3.5 text-base font-extrabold text-sur-action"
          >
            Enregistrer la donne
          </button>
        </footer>
      </div>
    </div>
  );
}
