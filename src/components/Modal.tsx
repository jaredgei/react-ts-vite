import styles from 'scss/Modal.module.scss';

import { ReactNode } from 'react';

import { useKeyPressed } from 'hooks/useKeyPressed';

type Props = {
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ onClose, children }: Props) => {
  useKeyPressed('Escape', onClose);

  return (
    <div className={styles.modal} role='dialog' aria-modal='true' onClick={onClose}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
