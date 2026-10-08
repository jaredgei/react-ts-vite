import styles from '@/styles/Button.module.css';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLElement>, 'type'> & {
  text: string;
  icon?: ReactNode;
  url?: string;
  size?: 'small' | 'large';
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const Button = ({ text, icon, url, size = 'small', variant = 'primary', type = 'button', disabled = false, className, ...rest }: ButtonProps) => {
  const classes = [styles.button, size === 'small' && styles.small, styles[variant], disabled && styles.disabled, className]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {icon}
      <span className={styles.buttonText}>{text}</span>
    </>
  );

  if (url !== undefined) {
    return disabled ? (
      <span role='link' aria-disabled='true' className={classes} {...rest}>
        {content}
      </span>
    ) : (
      <Link to={url} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...rest}>
      {content}
    </button>
  );
};

export default Button;
