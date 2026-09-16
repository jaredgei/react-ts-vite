import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from 'pages/Home';

describe('Home', () => {
  it('renders its heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });
});
