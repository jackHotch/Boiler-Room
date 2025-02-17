import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard.jsx';

test('renders Dashboard without crashing', async () => {
    const { baseElement } = render(<Dashboard />)
    
    expect(baseElement).toBeTruthy()
  });