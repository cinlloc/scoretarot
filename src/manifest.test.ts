import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { manifest } from './manifest';

describe('manifeste de la PWA', () => {
  it("s'installe en plein écran sous le chemin GitHub Pages", () => {
    expect(manifest).toMatchObject({
      name: 'ScoreTarot',
      short_name: 'ScoreTarot',
      lang: 'fr',
      display: 'standalone',
      scope: '/scoretarot/',
      start_url: '/scoretarot/',
      theme_color: '#1b2621',
      background_color: '#1b2621',
    });
  });

  it('pointe vers des icônes présentes dans public/', () => {
    for (const icone of manifest.icons ?? []) {
      expect(existsSync(`public/${icone.src}`), icone.src).toBe(true);
    }
  });

  it('fournit les icônes 192, 512 et maskable', () => {
    expect(manifest.icons).toEqual([
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ]);
  });
});
