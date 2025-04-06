jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

import { render, screen } from '@testing-library/react';
import LandingPage from './page.jsx';



test('renders LandingPage without crashing', async () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { name: /welcome to boiler room/i }));
  });