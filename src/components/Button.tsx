import styles from '@/styles/Button.module.css';

import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router';

import { cx } from '@/utilities/classes';

type BaseProps = {
  children: ReactNode;
  icon?: ReactNode;
  size?: 'small' | 'large';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
};

type ButtonProps = BaseProps & Omit<ComponentProps<'button'>, keyof BaseProps>;
type LinkProps = BaseProps & Omit<ComponentProps<typeof Link>, keyof BaseProps>;

const Button = ({ children, icon, size = 'small', variant = 'primary', disabled = false, className, ...rest }: ButtonProps | LinkProps) => {
  const classes = cx(styles.button, styles[size], styles[variant], disabled && styles.disabled, className);
  const content = (
    <>
      {icon}
      <span className={styles.text}>{children}</span>
    </>
  );

  if ('to' in rest) {
    const { to, ...linkRest } = rest;
    return disabled ? (
      <span role='link' aria-disabled='true' className={classes}>
        {content}
      </span>
    ) : (
      <Link to={to} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  return (
    <button type='button' disabled={disabled} className={classes} {...rest}>
      {content}
    </button>
  );
};

export default Button;
