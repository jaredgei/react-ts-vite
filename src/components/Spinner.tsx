import styles from '@/styles/Spinner.module.css';

const Spinner = ({ label = 'Loading' }: { label?: string }) => <div role='status' aria-label={label} className={styles.spinner} />;

export default Spinner;
