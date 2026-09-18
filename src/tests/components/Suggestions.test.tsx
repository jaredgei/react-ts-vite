import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Suggestions from 'components/Suggestions';

describe('Suggestions', () => {
  it('renders an option and fires onSelect on click', async () => {
    const onSelect = vi.fn();
    render(<Suggestions options={[{ name: 'Alpha', onSelect }]} />);
    await userEvent.click(screen.getByRole('option', { name: 'Alpha' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not fire onSelect when an option is disabled', async () => {
    const onSelect = vi.fn();
    render(<Suggestions options={[{ name: 'Disabled Item', disabled: true, onSelect }]} />);
    await userEvent.click(screen.getByRole('option', { name: 'Disabled Item' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders a divider for a nameless suggestion', () => {
    const { container } = render(<Suggestions options={[{}]} />);
    expect(container.querySelector('div > div')).toBeInTheDocument();
  });

  it('renders provided content', () => {
    render(<Suggestions content={<div>header</div>} options={[]} />);
    expect(screen.getByText('header')).toBeInTheDocument();
  });

  it('renders anchored suggestions that can be interacted with', async () => {
    const onSelect = vi.fn();
    const Harness = () => {
      const anchor = useRef<HTMLDivElement>(null);
      return (
        <div>
          <div ref={anchor} data-testid='anchor' />
          <Suggestions anchor={anchor} isOpen options={[{ name: 'Item', onSelect }]} />
        </div>
      );
    };
    render(<Harness />);
    const option = screen.getByRole('option', { name: 'Item' });
    expect(option).toBeVisible();
    await userEvent.click(option);
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
