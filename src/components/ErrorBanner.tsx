import styles from '@/styles/ErrorBanner.module.css';

import { useError } from '@/context/Error';

import { cx } from '@/utilities/classes';
import { erase } from '@/utilities/icons';

const ErrorBanner = () => {
  const { message, clearError } = useError();

  return (
    <div role='alert' className={cx(styles.banner, message && styles.visible)}>
      <div className={styles.inner}>
        {message && (
          <>
            <div className={styles.message}>{message}</div>
            <button type='button' className={styles.close} aria-label='Dismiss error' onClick={clearError}>
              {erase}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
