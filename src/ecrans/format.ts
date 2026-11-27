export function signe(nombre: number): string {
  if (nombre > 0) {
    return `+${nombre}`;
  }
  if (nombre < 0) {
    return `−${-nombre}`;
  }
  return '0';
}

export const BOUTON_OR =
  'flex w-full items-center justify-center gap-2 rounded-2xl bg-or p-4 text-base font-extrabold text-sur-or disabled:cursor-not-allowed disabled:opacity-45';
