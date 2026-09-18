import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import VerticalMenu from 'components/VerticalMenu';

describe('VerticalMenu', () => {
  it('renders options button', () => {
    render(<VerticalMenu options={[{ name: 'Edit' }]} />);
    expect(screen.getByRole('button', { name: 'Options' })).toBeInTheDocument();
  });

  it('calls option onSelect when chosen', async () => {
    const onSelect = vi.fn();
    render(<VerticalMenu options={[{ name: 'Delete', onSelect }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    await userEvent.click(screen.getByText('Delete'));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('closes on Escape key', async () => {
    render(<VerticalMenu options={[{ name: 'Profile' }]} />);
    const button = screen.getByRole('button', { name: 'Options' });
    await userEvent.click(button);
    expect(screen.getByRole('listbox')).toHaveClass(/open/);
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('listbox')).not.toHaveClass(/open/);
  });

  it('closes when clicking outside', async () => {
    render(
      <div>
        <div data-testid='outside'>Outside</div>
        <VerticalMenu options={[{ name: 'Profile' }]} />
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Options' }));
    expect(screen.getByRole('listbox')).toHaveClass(/open/);
    await userEvent.click(screen.getByTestId('outside'));
    expect(screen.getByRole('listbox')).not.toHaveClass(/open/);
  });
});
