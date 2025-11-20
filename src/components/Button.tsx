import 'scss/Button.scss';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  text: string;
  icon?: ReactNode;
  url?: string;
  size?: 'small' | 'large';
  type?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
};

const Button = ({ text, icon, url, size = 'small', type = 'primary', disabled = false, onClick }: Props) => {
  const classes = 'button' + (size === 'small' ? ' small' : '') + (disabled ? ' disabled' : '') + (type === 'secondary' ? ' secondary' : '');

  if (url) {
    return (
      <Link to={url} className={classes}>
        {icon}
        <div className='buttonText'>{text}</div>
      </Link>
    );
  }

  return (
    <div onClick={disabled ? () => {} : onClick} className={classes}>
      {icon}
      <div className='buttonText'>{text}</div>
    </div>
  );
};

export default Button;
