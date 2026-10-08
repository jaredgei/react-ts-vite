import styles from '@/styles/Error.module.css';

import { useError } from '@/context/Error';

const Error = () => {
  const { error, clearError } = useError();

  return (
    <div role='alert' className={`${styles.error} ${error ? styles.hasError : ''}`.trim()}>
      {error && (
        <>
          <div className={styles.errorMessage}>{error.message}</div>
          <button type='button' className={styles.closeError} aria-label='Close error' onClick={clearError}>
            &times;
          </button>
        </>
      )}
    </div>
  );
};

export default Error;
