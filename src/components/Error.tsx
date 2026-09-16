import styles from 'scss/Error.module.scss';

import { useError } from 'context/Error';

const Error = () => {
  const { error, setError } = useError();

  return (
    <div className={`${styles.error} ${error ? styles.hasError : ''}`.trim()}>
      {error && (
        <>
          <div className={styles.errorMessage}>{error.message}</div>
          <button type='button' className={styles.closeError} aria-label='Close error' onClick={() => setError(null)}>
            &times;
          </button>
        </>
      )}
    </div>
  );
};

export default Error;
