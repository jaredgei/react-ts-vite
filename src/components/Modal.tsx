import styles from '@/styles/Modal.module.css';

import { type MouseEvent, type ReactNode, useEffect, useRef } from 'react';

type Props = {
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ onClose, children }: Props) => {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) dialog.current?.close();
  };

  return (
    <dialog ref={dialog} className={styles.modal} onClose={onClose} onClick={handleClick}>
      <div className={styles.content}>{children}</div>
    </dialog>
  );
};

export default Modal;
