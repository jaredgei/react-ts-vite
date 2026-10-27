import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Menu, { type Option } from '@/components/Menu';

const Harness = ({ options, onClose = () => {} }: { options: Option[]; onClose?: () => void }) => {
  const anchor = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={anchor} />
      <Menu anchor={anchor} open onClose={onClose} options={options} />
    </div>
  );
};

describe('Menu', () => {
  it('fires an option onSelect on click and closes', async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<Harness options={[{ name: 'Alpha', onSelect }]} onClose={onClose} />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Alpha' }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not fire onSelect when an option is disabled', async () => {
    const onSelect = vi.fn();
    render(<Harness options={[{ name: 'Disabled Item', disabled: true, onSelect }]} />);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Disabled Item' }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders a separator for a nameless option', () => {
    render(<Harness options={[{}]} />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('focuses the first item when opened', () => {
    render(<Harness options={[{ name: 'Edit' }, { name: 'Delete' }]} />);
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
  });

  it('moves focus between items with the arrow keys', async () => {
    render(<Harness options={[{ name: 'One' }, {}, { name: 'Two' }, { name: 'Three', disabled: true }]} />);
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

  // jsdom's viewport is 768px tall.
  it.each([
    { where: 'below an anchor with room under it', top: 100, height: 48, style: { top: '144px', '--popup-space': '616px', '--popup-above': '0' } },
    {
      where: 'above an anchor near the bottom of the viewport',
      top: 700,
      height: 48,
      style: { bottom: '72px', '--popup-space': '688px', '--popup-above': '1' },
    },
    {
      where: 'on the roomier side, scrolling, when neither side holds it',
      top: 300,
      height: 600,
      style: { top: '344px', '--popup-space': '416px', '--popup-above': '0' },
    },
  ])('opens $where', ({ top, height, style }) => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 0, y: top, width: 100, height: 40 }));
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(height);
    render(<Harness options={[{ name: 'Item' }]} />);
    expect(screen.getByRole('menu').closest('[popover]')).toHaveStyle(style);
    vi.restoreAllMocks();
  });
});
