import { useState, type ReactNode } from 'react';
import { calculerDonne, PRIME_PAR_POIGNEE, primeChelem, SEUILS_POIGNEE, type Donne } from '../moteur/calculerDonne';
import { ENCHERES } from '../partie/partie';
import { Avatar, EnTeteEcran, Etiquette } from './commun';
import { couleurVariation, signe } from './format';

const POINTS_TOTAL = 91;

const BOUTS: { cle: keyof Donne['bouts']; glyphe: string; libelle: string }[] = [
  { cle: 'petit', glyphe: '1', libelle: 'Petit' },
  { cle: 'vingtEtUn', glyphe: '21', libelle: '21' },
  { cle: 'excuse', glyphe: '★', libelle: 'Excuse' },
];

const PETIT_AU_BOUT: { camp: Donne['petitAuBout']; glyphe: string; libelle: string }[] = [
  { camp: null, glyphe: '', libelle: 'Aucun' },
  { camp: 'attaque', glyphe: '⚔', libelle: 'Attaque' },
  { camp: 'defense', glyphe: '🛡', libelle: 'Défense' },
];

const POIGNEES: { poignee: NonNullable<Donne['poignee']>; libelle: string }[] = [
  { poignee: 'simple', libelle: 'Simple' },
  { poignee: 'double', libelle: 'Double' },
  { poignee: 'triple', libelle: 'Triple' },
];

// Ouverture totale de l'éventail, en degrés, quel que soit le nombre d'atouts.
const OUVERTURE_EVENTAIL = 40;

function EventailAtouts({ nombre }: { nombre: number }) {
  return (
    <span aria-hidden="true" className="flex h-6 items-end pl-1">
      {Array.from({ length: nombre }, (_, carte) => (
        <i
          key={carte}
          className="-ml-[3px] h-5 w-[7px] origin-bottom rounded-[2px] border border-black/35 bg-feuille"
          style={{ transform: `rotate(${(carte - (nombre - 1) / 2) * (OUVERTURE_EVENTAIL / nombre)}deg)` }}
        />
      ))}
    </span>
  );
}

function InterrupteurChelem({ glyphe, libelle, actif, onBasculer }: {
  glyphe: string;
  libelle: string;
  actif: boolean;
  onBasculer: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onBasculer}
      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-2 text-sm font-bold ${actif ? 'border-or bg-or text-sur-or' : 'border-trait'}`}
    >
      <span aria-hidden="true">{glyphe}</span>
      {libelle}
    </button>
  );
}

function LigneAnnonce({ titre, detail, children }: { titre: string; detail: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-1.5 flex justify-between text-sm font-bold">
        {titre}
        <span className="font-semibold text-attenue">{detail}</span>
      </h2>
      {children}
    </div>
  );
}

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

  const libelleEnchere = ENCHERES.find((choix) => choix.enchere === donne.enchere)?.libelle;

  const primePetitAuBout = 10 * resultat.multiplicateur;
  let detailPetitAuBout = `${primePetitAuBout} points`;
  if (donne.petitAuBout === 'attaque') {
    detailPetitAuBout = `${signe(primePetitAuBout)} par défenseur`;
  }
  if (donne.petitAuBout === 'defense') {
    detailPetitAuBout = `${signe(-primePetitAuBout)} par défenseur`;
  }

  const chelem = primeChelem(donne.chelem);

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

          <section className="flex flex-col gap-4">
            <Etiquette>Annonces</Etiquette>

            <LigneAnnonce titre="Petit au bout" detail={detailPetitAuBout}>
              <div role="group" aria-label="Petit au bout" className="flex overflow-hidden rounded-xl border-[1.5px] border-trait">
                {PETIT_AU_BOUT.map((choix) => {
                  const choisi = choix.camp === donne.petitAuBout;
                  return (
                    <button
                      key={choix.libelle}
                      type="button"
                      aria-pressed={choisi}
                      onClick={() => setDonne({ ...donne, petitAuBout: choix.camp })}
                      className={`flex flex-1 items-center justify-center gap-1.5 px-1.5 py-2 text-sm font-bold not-first:border-l-[1.5px] not-first:border-trait ${choisi ? 'bg-or text-sur-or' : ''}`}
                    >
                      {choix.glyphe && <span aria-hidden="true">{choix.glyphe}</span>}
                      {choix.libelle}
                    </button>
                  );
                })}
              </div>
            </LigneAnnonce>

            <LigneAnnonce titre="Poignée" detail="au camp gagnant">
              <div role="group" aria-label="Poignée" className="grid grid-cols-3 gap-2">
                {POIGNEES.map((poignee) => {
                  const choisie = poignee.poignee === donne.poignee;
                  const atouts = SEUILS_POIGNEE[nombreJoueurs][poignee.poignee];
                  return (
                    <button
                      key={poignee.poignee}
                      type="button"
                      aria-pressed={choisie}
                      onClick={() => setDonne({ ...donne, poignee: choisie ? null : poignee.poignee })}
                      className={`flex flex-col items-center gap-1 rounded-xl border-[1.5px] px-1 py-2 text-xs font-bold ${choisie ? 'border-or bg-or/20' : 'border-trait'}`}
                    >
                      <EventailAtouts nombre={atouts} />
                      <b className="text-sm">{poignee.libelle}</b> {atouts} atouts · {PRIME_PAR_POIGNEE[poignee.poignee]}
                    </button>
                  );
                })}
              </div>
            </LigneAnnonce>

            <LigneAnnonce titre="Chelem" detail={chelem === 0 ? '—' : signe(chelem)}>
              <div role="group" aria-label="Chelem" className="flex gap-2">
                <InterrupteurChelem
                  glyphe="⚑"
                  libelle="Annoncé"
                  actif={donne.chelem.annonce}
                  onBasculer={() => setDonne({ ...donne, chelem: { ...donne.chelem, annonce: !donne.chelem.annonce } })}
                />
                <InterrupteurChelem
                  glyphe="✓"
                  libelle="Réussi"
                  actif={donne.chelem.reussi}
                  onBasculer={() => setDonne({ ...donne, chelem: { ...donne.chelem, reussi: !donne.chelem.reussi } })}
                />
              </div>
            </LigneAnnonce>
          </section>
        </main>

        <footer className="sticky bottom-0 flex flex-col gap-3 rounded-t-3xl bg-feuille px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-feuille-encre shadow-[0_-4px_20px_rgb(0_0_0/0.12)]">
          <div aria-live="polite" className="flex items-center justify-between gap-2 font-extrabold">
            <span>
              {libelleEnchere} {resultat.faite ? 'faite' : 'chutée'} de {resultat.ecart}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-sm ${resultat.faite ? 'bg-or text-sur-or' : 'bg-feuille-trait'}`}
            >
              <span aria-hidden="true">{resultat.faite ? '✓' : '✗'}</span>
              {signe(resultat.valeur)} / défenseur
            </span>
          </div>
          <ul
            aria-label="Variations"
            className="grid gap-1 text-center text-xs font-semibold"
            style={{ gridTemplateColumns: `repeat(${nombreJoueurs}, minmax(0, 1fr))` }}
          >
            {noms.map((nom, joueur) => (
              <li key={joueur} className="min-w-0">
                <span className="block truncate">{nom}</span>
                <b className={`font-mono text-sm ${couleurVariation(resultat.variations[joueur])}`}>
                  {signe(resultat.variations[joueur])}
                </b>
              </li>
            ))}
          </ul>
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
