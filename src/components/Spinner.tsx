import styles from '@/styles/Spinner.module.css';

const Spinner = ({ label = 'Loading' }: { label?: string }) => (
  <div className={styles.center}>
    <div role='status' aria-label={label} className={styles.spinner} />
  </div>
);

export default Spinner;
