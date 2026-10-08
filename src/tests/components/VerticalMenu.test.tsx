import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import VerticalMenu from '@/components/VerticalMenu';

describe('VerticalMenu', () => {
  it('renders an options button', () => {
    render(<VerticalMenu options={[{ name: 'Edit' }]} />);
    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument();
  });

  it('toggles its expanded state on click', async () => {
    render(<VerticalMenu options={[{ name: 'Profile' }]} />);
    const button = screen.getByRole('button', { name: 'Options' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls an option onSelect when chosen', async () => {
    const onSelect = vi.fn();
    render(<VerticalMenu options={[{ name: 'Delete', onSelect }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
