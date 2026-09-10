import 'scss/Button.scss';
import { ReactNode, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

type ButtonProps = HTMLAttributes<HTMLElement> & {
  text: string;
  icon?: ReactNode;
  url?: string;
  size?: 'small' | 'large';
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const Button = ({
  text,
  icon,
  url,
  size = 'small',
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  ...props
}: ButtonProps) => {
  const classes = `button ${size} ${variant} ${disabled ? 'disabled' : ''} ${className}`.trim();

  if (url) {
    return (
      <Link to={disabled ? '#' : url} className={classes} {...props}>
        {icon}
        <span className='buttonText'>{text}</span>
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...props}>
      {icon}
      <span className='buttonText'>{text}</span>
    </button>
  );
};

export default Button;
