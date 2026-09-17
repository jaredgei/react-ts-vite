import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Modal from 'components/Modal';

describe('Modal', () => {
  it('renders its children', () => {
    render(
      <Modal onClose={() => {}}>
        <p>Modal body</p>
      </Modal>,
    );
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('calls onClose after animation when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    await userEvent.click(dialog);
    expect(dialog.className).toContain('closing');
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
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

  it('calls onClose after animation when the escape key is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});
