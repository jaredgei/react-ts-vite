import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Modal from '@/components/Modal';

describe('Modal', () => {
  it('renders its children in an open dialog', () => {
    render(
      <Modal onClose={() => {}}>
        <p>Modal body</p>
      </Modal>,
    );
    expect(screen.getByText('Modal body')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveProperty('open', true);
  });

  it('uses its label as the dialog name', () => {
    render(
      <Modal label='Confirm delete' onClose={() => {}}>
        <p>Modal body</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Confirm delete' })).toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when a drag starts in the content and ends on the backdrop', async () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: screen.getByText('Modal body') },
      { target: screen.getByRole('dialog') },
      { keys: '[/MouseLeft]' },
    ]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not call onClose when the content is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );
    await userEvent.click(screen.getByText('Modal body'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
