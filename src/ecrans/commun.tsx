import type { ReactNode } from 'react';

export function Avatar({ nom, petit = false, enEvidence = false, children }: {
  nom: string;
  petit?: boolean;
  enEvidence?: boolean;
  children?: ReactNode;
}) {
  const taille = petit ? 'size-8 text-sm' : 'size-11 text-lg';
  const bordure = enEvidence ? 'border-or' : 'border-trait';
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full border-2 bg-voile-fort font-extrabold ${bordure} ${taille}`}
    >
      <span aria-hidden="true">{nom.charAt(0).toUpperCase()}</span>
      {children}
    </span>
  );
}

export function EnTeteEcran({ titre, sousTitre, onRetour, libelleRetour }: {
  titre: string;
  sousTitre?: string;
  onRetour: () => void;
  libelleRetour: string;
}) {
  return (
    <header className="flex items-center gap-3">
      <button
        type="button"
        onClick={onRetour}
        aria-label={libelleRetour}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-voile text-xl"
      >
        ‹
      </button>
      <h1 className="line-clamp-2 min-w-0 flex-1 text-xl leading-tight font-extrabold">{titre}</h1>
      {sousTitre && <span className="max-w-1/2 truncate text-sm text-attenue">{sousTitre}</span>}
    </header>
  );
}

export function Confirmation({ question, detail, libelleConfirmer, onConfirmer, onAnnuler }: {
  question: string;
  detail: string;
  libelleConfirmer: string;
  onConfirmer: () => void;
  onAnnuler: () => void;
}) {
  return (
    <div role="group" aria-label={question} className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-or bg-voile p-4">
      <p>
        <b className="block">{question}</b>
        <span className="text-sm text-attenue">{detail}</span>
      </p>
      <div className="flex gap-2">
        {/* Le bouton qui a ouvert la confirmation disparaît : le focus doit rester dans l'écran. */}
        <button type="button" onClick={onAnnuler} autoFocus className="flex-1 rounded-2xl border-[1.5px] border-trait p-3 font-bold">
          Annuler
        </button>
        <button type="button" onClick={onConfirmer} className="flex-1 rounded-2xl bg-or p-3 font-extrabold text-sur-or">
          {libelleConfirmer}
        </button>
      </div>
    </div>
  );
}

export function Etiquette({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-bold tracking-widest text-attenue uppercase">{children}</p>;
}
