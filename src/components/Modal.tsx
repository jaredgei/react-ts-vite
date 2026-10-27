import styles from '@/styles/Modal.module.css';

import { type ReactNode, startTransition, useActionState, useEffect, useId, useRef } from 'react';

import Button from '@/components/Button';

import { afterTransitions } from '@/utilities/animation';
import { toDisplayMessage } from '@/utilities/errors';

type Props<T> = {
  title: string;
  confirm?: { label: string; variant?: 'primary' | 'danger'; action: (form: FormData) => Promise<T> };
  onClose: (confirmed: boolean) => void;
  onDone?: (result: T) => void;
  children?: ReactNode;
};

type Result = { error?: string; done?: boolean };

const Modal = <T,>({ title, confirm, onClose, onDone, children }: Props<T>) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const doneRef = useRef<{ result: T }>(undefined);
  const runningRef = useRef<Promise<unknown>>(undefined);
  const titleId = useId();

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    element.showModal();
    // Opening focuses the first control; a textarea marked data-autofocus takes focus instead, ready to add to what it holds.
    const field = element.querySelector<HTMLTextAreaElement>('textarea[data-autofocus]');
    field?.focus();
    field?.setSelectionRange(field.value.length, field.value.length);
    let pressedBackdrop = false;
    const onPointerDown = (event: PointerEvent) => {
      pressedBackdrop = event.target === element;
    };
    const onClick = (event: MouseEvent) => {
      if (pressedBackdrop && event.target === element) element.close();
    };
    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('click', onClick);
    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('click', onClick);
    };
  }, []);

  const [result, submit, pending] = useActionState<Result, FormData>(async (_, form) => {
    if (!confirm) return {};
    try {
      const running = confirm.action(form);
      runningRef.current = running;
      doneRef.current = { result: await running };
      dialogRef.current?.close();
      return { done: true };
    } catch (failure) {
      return { error: toDisplayMessage(failure) };
    }
  }, {});

  // Closed while its action still runs, it waits for the outcome, so what the action did (a deletion, say) is never left unreported.
  const finish = async (dialog: HTMLDialogElement) => {
    await Promise.allSettled([afterTransitions(dialog), runningRef.current]);
    onClose(doneRef.current !== undefined);
    if (doneRef.current) onDone?.(doneRef.current.result);
  };

  return (
    <dialog ref={dialogRef} aria-labelledby={titleId} className={styles.modal} onClose={(event) => void finish(event.currentTarget)}>
      <form
        // Not `action`, which resets the form once it succeeds, flashing every field back to its default while the dialog closes.
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => submit(data));
        }}
        className={styles.content}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>
          {children}
          {result.error && (
            <p role='alert' className={styles.error}>
              {result.error}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          {confirm ? (
            <>
              <Button variant='secondary' onClick={() => dialogRef.current?.close()}>
                Cancel
              </Button>
              <Button type='submit' variant={confirm.variant} pending={pending || result.done}>
                {confirm.label}
              </Button>
            </>
          ) : (
            <Button onClick={() => dialogRef.current?.close()}>Close</Button>
          )}
        </div>
      </form>
    </dialog>
  );
};

export default Modal;
