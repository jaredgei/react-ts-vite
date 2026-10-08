import styles from '@/styles/Toggle.module.css';

type Props = {
  value: boolean;
  onToggle: () => void;
};

const Toggle = ({ value, onToggle }: Props) => {
  return (
    <button type='button' role='switch' aria-checked={value} className={`${styles.toggle} ${value ? styles.on : ''}`.trim()} onClick={onToggle}>
      <span className={styles.switch} />
    </button>
  );
};

export default Toggle;
