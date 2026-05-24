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
  const classes = `button ${size} ${type} ${disabled ? 'disabled' : ''}`.trim();

  if (url) {
    return (
      <Link to={disabled ? '#' : url} className={classes}>
        {icon}
        <span className='buttonText'>{text}</span>
      </Link>
    );
  }

  return (
    <button type='button' disabled={disabled} onClick={onClick} className={classes}>
      {icon}
      <span className='buttonText'>{text}</span>
    </button>
  );
};

export default Button;
