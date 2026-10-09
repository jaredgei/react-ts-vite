import styles from '@/styles/Modal.module.css';

import { type ReactNode, useEffect, useRef } from 'react';

type Props = {
  onClose: () => void;
  children: ReactNode;
  label?: string;
};

const Modal = ({ onClose, children, label }: Props) => {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    element.showModal();
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

  return (
    <dialog ref={dialog} aria-label={label} className={styles.modal} onClose={onClose}>
      <div className={styles.content}>{children}</div>
    </dialog>
  );
};

export default Modal;
