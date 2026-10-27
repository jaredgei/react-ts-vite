import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Modal from '@/components/Modal';

import { ApiError } from '@/utilities/api';

const renderModal = (action: (form: FormData) => Promise<unknown> = async () => null) => {
  const onClose = vi.fn();
  const onDone = vi.fn();
  render(
    <Modal title='Rename item' confirm={{ label: 'Save', action }} onClose={onClose} onDone={onDone}>
      <input name='name' aria-label='Name' defaultValue='Nova' />
    </Modal>,
  );
  return { onClose, onDone };
};

describe('Modal', () => {
  it('shows its title, body, and actions in an open dialog', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: 'Rename item' })).toHaveProperty('open', true);
    expect(screen.getByLabelText('Name')).toHaveValue('Nova');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('focuses the field marked for it rather than the first control, ready to add to what it holds', () => {
    render(
      <Modal title='Edit note' onClose={() => {}}>
        <input aria-label='Title' />
        <textarea aria-label='Note' defaultValue='Remember the milk' data-autofocus />
      </Modal>,
    );
    const note = screen.getByLabelText('Note');
    expect(note).toHaveFocus();
    expect(note).toHaveProperty('selectionStart', 'Remember the milk'.length);
  });

  it('still reports an action that finishes after the dialog was cancelled mid-request', async () => {
    let resolve: (value: unknown) => void = () => {};
    const { onClose, onDone } = renderModal(() => new Promise((done) => (resolve = done)));
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).not.toHaveBeenCalled();

    resolve({ id: 'item' });
    await waitFor(() => expect(onDone).toHaveBeenCalledExactlyOnceWith({ id: 'item' }));
    expect(onClose).toHaveBeenCalledExactlyOnceWith(true);
  });

  it('runs the action with the form, then closes still busy and reports it done with its result', async () => {
    const action = vi.fn<(form: FormData) => Promise<unknown>>(async () => ({ id: 'item' }));
    const { onClose, onDone } = renderModal(action);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(action.mock.calls[0]?.[0]).toBeInstanceOf(FormData);
    await waitFor(() => expect(onDone).toHaveBeenCalledExactlyOnceWith({ id: 'item' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Save', hidden: true })).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps what was entered on screen while it closes, rather than resetting the form', async () => {
    const { onDone } = renderModal();
    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.type(screen.getByLabelText('Name'), 'Kai');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onDone).toHaveBeenCalledOnce());
    expect(screen.getByRole('textbox', { name: 'Name', hidden: true })).toHaveValue('Kai');
  });

  it('keeps the dialog open and explains a failed action', async () => {
    const { onClose, onDone } = renderModal(async () => {
      throw new ApiError(409, 'That name is taken');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('That name is taken');
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(onClose).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });

  it('offers only Close when it has no action', async () => {
    const onClose = vi.fn();
    render(
      <Modal title='About' onClose={onClose}>
        <p>Version 1</p>
      </Modal>,
    );
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledExactlyOnceWith(false));
  });

  it('closes on Cancel without reporting it done', async () => {
    const { onClose, onDone } = renderModal();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(onDone).not.toHaveBeenCalled();
  });

  it('closes when the backdrop is clicked, but not the content', async () => {
    const { onClose } = renderModal();
    await userEvent.click(screen.getByRole('heading', { name: 'Rename item' }));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('dialog'));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('does not close when a drag starts in the content and ends on the backdrop', async () => {
    const { onClose } = renderModal();
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: screen.getByRole('heading', { name: 'Rename item' }) },
      { target: screen.getByRole('dialog') },
      { keys: '[/MouseLeft]' },
    ]);
    expect(onClose).not.toHaveBeenCalled();
  });
});
