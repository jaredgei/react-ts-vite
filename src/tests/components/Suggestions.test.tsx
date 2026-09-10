import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Suggestions from 'components/Suggestions';

const renderWithRouter = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Suggestions', () => {
  it('renders a button suggestion and fires onSelect on click', async () => {
    const onSelect = vi.fn();
    renderWithRouter(<Suggestions suggestions={[{ name: 'Alpha', onSelect }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Alpha' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('renders a link suggestion when a uri is given', () => {
    renderWithRouter(<Suggestions suggestions={[{ name: 'Docs', uri: '/docs' }]} />);
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('renders a divider for a nameless suggestion', () => {
    const { container } = renderWithRouter(<Suggestions suggestions={[{}]} />);
    expect(container.querySelector('div > div')).toBeInTheDocument();
  });

  it('filters suggestions case-insensitively', () => {
    renderWithRouter(
      <Suggestions
        filter='al'
        suggestions={[
          { name: 'Alpha', onSelect: () => {} },
          { name: 'Beta', onSelect: () => {} },
        ]}
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  it('renders provided content', () => {
    renderWithRouter(<Suggestions content={<div>header</div>} suggestions={[]} />);
    expect(screen.getByText('header')).toBeInTheDocument();
  });
});
