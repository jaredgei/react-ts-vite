import styles from 'scss/Modal.module.scss';
import { ReactNode } from 'react';

type Props = {
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ onClose, children }: Props) => {
  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
