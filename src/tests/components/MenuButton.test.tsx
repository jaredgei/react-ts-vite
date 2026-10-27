import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import MenuButton from '@/components/MenuButton';

describe('MenuButton', () => {
  it('renders a labeled button', () => {
    render(<MenuButton label='Row actions' options={[{ name: 'Edit' }]} />);
    expect(screen.getByRole('button', { name: 'Row actions' })).toBeInTheDocument();
  });

  it('toggles its expanded state on click', async () => {
    render(<MenuButton label='Options' options={[{ name: 'Profile' }]} />);
    const button = screen.getByRole('button', { name: 'Options' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the given content in place of the ⋮', async () => {
    render(
      <MenuButton label='Share' options={[{ name: 'Export' }]} variant='primary'>
        Share
      </MenuButton>,
    );
    const button = screen.getByRole('button', { name: 'Share' });
    expect(button).toHaveTextContent('Share');
    await userEvent.click(button);
    expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveFocus();
  });

  it('keeps its menu out of the page while closed', async () => {
    render(<MenuButton label='Options' options={[{ name: 'Rename' }]} />);
    expect(screen.queryByRole('menu', { hidden: true })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));
    await waitFor(() => expect(screen.queryByRole('menu', { hidden: true })).not.toBeInTheDocument());
  });

  it('calls an option onSelect when chosen', async () => {
    const onSelect = vi.fn();
    render(<MenuButton label='Options' options={[{ name: 'Delete', onSelect }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
