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

export function Etiquette({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-bold tracking-widest text-attenue uppercase">{children}</p>;
}
