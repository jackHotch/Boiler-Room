import { render, screen } from '@testing-library/react';
import NewGameRec from './page';

test('renders game recommendation page', () => {
  render(<NewGameRec />);
  const titleElement = screen.getByText(/New Game Recommendation/i);
  expect(titleElement).toBeInTheDocument();
});
