import styles from '@/styles/Toggle.module.css';

import type { ComponentProps } from 'react';

import { cx } from '@/utilities/classes';

type Props = Omit<ComponentProps<'button'>, 'value' | 'role' | 'type' | 'children' | 'onClick'> & {
  value: boolean;
  onToggle: () => void;
};

const Toggle = ({ value, onToggle, className, ...rest }: Props) => (
  <button {...rest} type='button' role='switch' aria-checked={value} className={cx(styles.toggle, value && styles.on, className)} onClick={onToggle}>
    <span className={styles.switch} />
  </button>
);

export default Toggle;
