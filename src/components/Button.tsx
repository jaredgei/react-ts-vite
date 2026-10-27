import styles from '@/styles/Button.module.css';

import type { ComponentProps, ReactNode } from 'react';
import { Link } from 'react-router';

import { cx } from '@/utilities/classes';

type BaseProps = {
  children: ReactNode;
  icon?: ReactNode;
  size?: 'small' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  pending?: boolean;
  className?: string;
};

type ButtonProps = BaseProps & Omit<ComponentProps<'button'>, keyof BaseProps>;
type LinkProps = BaseProps & Omit<ComponentProps<typeof Link>, keyof BaseProps>;
type AnchorProps = BaseProps & Omit<ComponentProps<'a'>, keyof BaseProps> & { href: string };

const Button = ({
  children,
  icon,
  size = 'small',
  variant = 'primary',
  disabled = false,
  pending = false,
  className,
  ...rest
}: ButtonProps | LinkProps | AnchorProps) => {
  const classes = cx(styles.button, styles[size], styles[variant], disabled && styles.disabled, pending && styles.pending, className);
  const content = (
    <>
      {pending ? <span className={cx(styles.spinner, icon !== undefined && styles.iconSpinner)} /> : icon}
      <span className={styles.text}>{children}</span>
    </>
  );

  if (disabled && ('to' in rest || 'href' in rest)) {
    return (
      <span role='link' aria-disabled='true' className={classes}>
        {content}
      </span>
    );
  }

  if ('to' in rest) {
    return (
      <Link className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if ('href' in rest) {
    return (
      <a className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type='button' disabled={disabled || pending} aria-busy={pending || undefined} className={classes} {...rest}>
      {content}
    </button>
  );
};

export default Button;
