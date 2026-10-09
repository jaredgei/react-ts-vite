import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Toggle from '@/components/Toggle';

describe('Toggle', () => {
  it('reflects its value via aria-checked', () => {
    const { rerender } = render(<Toggle aria-label='Notifications' value={false} onToggle={() => {}} />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toHaveAttribute('aria-checked', 'false');
    rerender(<Toggle aria-label='Notifications' value={true} onToggle={() => {}} />);
    expect(screen.getByRole('switch', { name: 'Notifications' })).toHaveAttribute('aria-checked', 'true');
  });

  it('can be named by a visible label', () => {
    render(
      <>
        <span id='dark-mode'>Dark mode</span>
        <Toggle aria-labelledby='dark-mode' value={false} onToggle={() => {}} />
      </>,
    );
    expect(screen.getByRole('switch', { name: 'Dark mode' })).toBeInTheDocument();
  });

  it('keeps its switch semantics when given conflicting props', () => {
    render(<Toggle aria-label='Notifications' aria-checked={false} value={true} onToggle={() => {}} />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<Toggle aria-label='Notifications' value={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
