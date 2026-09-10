import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Dropdown from 'components/Dropdown';

const renderWithRouter = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Dropdown', () => {
  it('shows its value or title', () => {
    renderWithRouter(<Dropdown title='Pick one' value='Chosen' />);
    expect(screen.getByText('Chosen')).toBeInTheDocument();
  });

  it('falls back to the title when there is no value', () => {
    renderWithRouter(<Dropdown title='Pick one' />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('renders its options as suggestions', () => {
    renderWithRouter(
      <Dropdown
        title='Pick'
        options={[
          { name: 'One', onSelect: () => {} },
          { name: 'Two', onSelect: () => {} },
        ]}
      />,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('calls an option onSelect when chosen', async () => {
    const onSelect = vi.fn();
    renderWithRouter(<Dropdown title='Pick' options={[{ name: 'One', onSelect }]} />);
    await userEvent.click(screen.getByText('One'));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('renders a custom button instead of the default container', () => {
    renderWithRouter(<Dropdown customButton={<span>custom trigger</span>} />);
    expect(screen.getByText('custom trigger')).toBeInTheDocument();
  });
});
