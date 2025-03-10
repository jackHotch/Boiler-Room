import { render, screen } from '@testing-library/react';
import NewGameRec from './page';

test('renders game recommendation page', () => {
  const { baseElement} = render(<NewGameRec />);
  expect(baseElement).toBeTruthy();
});
