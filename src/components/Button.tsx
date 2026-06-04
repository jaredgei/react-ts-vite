import 'scss/Button.scss';
import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  text: string;
  icon?: ReactNode;
  url?: string;
  size?: 'small' | 'large';
  type?: 'primary' | 'secondary';
}

const Button = ({ text, icon, url, size = 'small', type = 'primary', disabled = false, onClick, className = '', ...props }: ButtonProps) => {
  const classes = `button ${size} ${type} ${disabled ? 'disabled' : ''} ${className}`.trim();

  if (url) {
    return (
      <Link to={disabled ? '#' : url} className={classes} title={props.title} id={props.id} style={props.style}>
        {icon}
        <span className='buttonText'>{text}</span>
      </Link>
    );
  }

  return (
    <button type='button' disabled={disabled} onClick={onClick} className={classes} {...props}>
      {icon}
      <span className='buttonText'>{text}</span>
    </button>
  );
};

export default Button;
