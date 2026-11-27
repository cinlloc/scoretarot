import type { ManifestOptions } from 'vite-plugin-pwa';

// GitHub Pages sert l'app sous /scoretarot/
export const baseGithubPages = '/scoretarot/';

export const manifest: Partial<ManifestOptions> = {
  name: 'ScoreTarot',
  short_name: 'ScoreTarot',
  description: 'Feuille de marque pour le tarot à 3, 4 ou 5 joueurs',
  lang: 'fr',
  display: 'standalone',
  scope: baseGithubPages,
  start_url: baseGithubPages,
  theme_color: '#1b2621',
  background_color: '#1b2621',
  icons: [
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
