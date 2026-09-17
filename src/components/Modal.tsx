import styles from 'scss/Modal.module.scss';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useKeyPressed } from 'hooks/useKeyPressed';

const ANIMATION_MS = 200;

type Props = {
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ onClose, children }: Props) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (!isClosing) setIsClosing(true);
  }, [isClosing]);

  useEffect(() => {
    if (!isClosing) return;
    const timeout = setTimeout(onClose, ANIMATION_MS);
    return () => clearTimeout(timeout);
  }, [isClosing, onClose]);

  useKeyPressed('Escape', handleClose);

  return createPortal(
    <div className={`${styles.modal} ${isClosing ? styles.closing : ''}`.trim()} role='dialog' aria-modal='true' onClick={handleClose}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
