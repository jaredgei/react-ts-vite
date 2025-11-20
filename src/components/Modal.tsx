import 'scss/Modal.scss';
import { ReactNode } from 'react';

type Props = {
  onClose: () => void;
  children: ReactNode;
};

const Modal = ({ onClose = () => {}, children }: Props) => {
  return (
    <div className='modal' onClick={onClose}>
      <div className='modalContent' onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
