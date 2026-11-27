export function signe(nombre: number): string {
  if (nombre > 0) {
    return `+${nombre}`;
  }
  if (nombre < 0) {
    return `−${-nombre}`;
  }
  return '0';
}

export function formaterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function nombreDeDonnes(nombre: number): string {
  return `${nombre} donne${nombre > 1 ? 's' : ''}`;
}

// Teintes foncées : la feuille reste claire, même en thème sombre.
export function couleurVariation(nombre: number): string {
  if (nombre > 0) {
    return 'text-gain-feuille';
  }
  if (nombre < 0) {
    return 'text-perte-feuille';
  }
  return '';
}

export const BOUTON_SECONDAIRE =
  'flex flex-1 items-center justify-center rounded-2xl border-[1.5px] border-trait px-3 py-3 text-sm font-bold';

export const BOUTON_OR =
  'flex w-full items-center justify-center gap-2 rounded-2xl bg-or p-4 text-base font-extrabold text-sur-or disabled:cursor-not-allowed disabled:opacity-45';
