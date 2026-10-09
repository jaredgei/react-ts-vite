import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Suggestions from '@/components/Suggestions';

describe('Suggestions', () => {
  it('renders an option and fires onSelect on click', async () => {
    const onSelect = vi.fn();
    render(<Suggestions options={[{ name: 'Alpha', onSelect }]} />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Alpha' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('does not fire onSelect when an option is disabled', async () => {
    const onSelect = vi.fn();
    render(<Suggestions options={[{ name: 'Disabled Item', disabled: true, onSelect }]} />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Disabled Item' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders a separator for a nameless suggestion', () => {
    render(<Suggestions options={[{}]} />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('renders provided content', () => {
    render(<Suggestions content={<div>header</div>} options={[]} />);
    expect(screen.getByText('header')).toBeInTheDocument();
  });

  it('moves focus between items with the arrow keys', async () => {
    render(<Suggestions options={[{ name: 'One' }, {}, { name: 'Two' }, { name: 'Three', disabled: true }]} />);
    screen.getByRole('menuitem', { name: 'One' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Two' })).toHaveFocus();
  });

  it('drills into child options and back out again', async () => {
    render(<Suggestions options={[{ name: 'More', children: [{ name: 'Child' }] }]} />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'More' }));
    expect(screen.getByRole('menuitem', { name: 'Child' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Back' })).toHaveFocus();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Back' }));
    expect(screen.getByRole('menuitem', { name: 'More' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Child' })).not.toBeInTheDocument();
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
    await userEvent.click(screen.getByRole('menuitem', { name: 'Item' }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
