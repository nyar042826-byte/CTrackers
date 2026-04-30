import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the CTracker dashboard', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /ctracker/i })).toBeInTheDocument();
  expect(screen.getByText(/your reading command center/i)).toBeInTheDocument();
});
