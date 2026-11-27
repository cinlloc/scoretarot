import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test("l'app s'affiche avec son titre ScoreTarot", () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'ScoreTarot' })).toBeInTheDocument();
});
